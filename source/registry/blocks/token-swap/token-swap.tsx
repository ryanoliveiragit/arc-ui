"use client";

import { useEffect, useId, useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ArrowDownUp, ArrowLeftRight, Check, ChevronDown } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./token-swap.module.css";

export interface SwapToken {
  /** Ticker, such as "ORB". Also the token's id. */
  symbol: string;
  /** Full name, shown in the token menu. */
  name: string;
  /** Price in US dollars. Rates between tokens derive from it. */
  price: number;
  /** Balance of the pretend wallet. */
  balance: number;
  /** Categorical tone of the token mark. */
  tone?: "teal" | "sky" | "orchid" | "violet" | "rose" | "amber" | "green";
}

export interface SwapQuote {
  /** Symbol of the token paid. */
  pay: string;
  /** Symbol of the token received. */
  receive: string;
  /** Amount paid, in the pay token. */
  amount: number;
  /** Amount received after the fee, in the receive token. */
  received: number;
}

export interface TokenSwapProps {
  /** Tokens offered in both pickers. Defaults to five made-up tokens. */
  tokens?: SwapToken[];
  /** Symbol of the token paid at the start. */
  defaultPay?: string;
  /** Symbol of the token received at the start. */
  defaultReceive?: string;
  /** Amount to pay, as typed. Pass it with `onAmountChange` to control the field. */
  amount?: string;
  /** Starting amount when uncontrolled. */
  defaultAmount?: string;
  /** Called with the cleaned text of the pay field whenever it changes. */
  onAmountChange?: (amount: string) => void;
  /** Share of the paid amount kept as a fee. Defaults to 0.3%. */
  feeRate?: number;
  /** Runs when the person confirms. The card shows its pending state until the returned promise settles; without it, a short delay stands in. */
  onSwap?: (quote: SwapQuote) => void | Promise<void>;
  /** Extra class for the card. */
  className?: string;
}

/** Made-up tokens with made-up prices. Nothing here maps to a real asset. */
export const sampleTokens: SwapToken[] = [
  { symbol: "ORB", name: "Orbit", price: 186.4, balance: 3.82, tone: "violet" },
  { symbol: "USDX", name: "Dollar X", price: 1, balance: 4210.55, tone: "sky" },
  { symbol: "LIME", name: "Lime", price: 2.418, balance: 1250, tone: "green" },
  { symbol: "KELP", name: "Kelp", price: 14.06, balance: 61.5, tone: "teal" },
  { symbol: "NOVA", name: "Nova", price: 0.0842, balance: 92400, tone: "amber" },
];

const SLIPPAGE = 0.005;
const NETWORK_FEE = 0.42;
const format = (value: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: value >= 1000 ? 2 : value >= 1 ? 4 : 6 }).format(value);
const dollars = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
/** Plain digits for the input: no grouping, and no more decimals than the size of the number deserves. */
const typed = (value: number) => String(Number(value.toFixed(value >= 1000 ? 2 : value >= 1 ? 4 : 6)));
const clean = (raw: string) => {
  const [whole = "", ...decimals] = raw.replace(/,/g, ".").replace(/[^\d.]/g, "").split(".");
  return (decimals.length ? `${whole}.${decimals.join("")}` : whole).slice(0, 14);
};

function Mark({ token }: { token: SwapToken }) {
  return <span className={styles.mark} data-tone={token.tone ?? "sky"} aria-hidden="true">{token.symbol.slice(0, 1)}</span>;
}

function TokenPicker({ label, token, tokens, balances, onPick }: { label: string; token: SwapToken; tokens: SwapToken[]; balances: Record<string, number>; onPick: (symbol: string) => void }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className={styles.token} aria-label={`${label}: ${token.name}. Change token`}>
          <Mark token={token} /><span>{token.symbol}</span><ChevronDown className={styles.chevron} size={14} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.menu} align="end" sideOffset={8} collisionPadding={12}>
          <DropdownMenu.Label className={styles.menuLabel}>Select a token</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={token.symbol} onValueChange={onPick}>
            {tokens.map(option => (
              <DropdownMenu.RadioItem key={option.symbol} value={option.symbol} className={styles.option}>
                <Mark token={option} />
                <span className={styles.optionText}><span className={styles.optionSymbol}>{option.symbol}</span><span className={styles.optionName}>{option.name}</span></span>
                <span className={styles.optionBalance}>{format(balances[option.symbol] ?? 0)}</span>
                <span className={styles.optionCheck}><DropdownMenu.ItemIndicator><Check size={14} aria-hidden="true" /></DropdownMenu.ItemIndicator></span>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

type Phase = "idle" | "pending" | "done";

/** Swap card with play money: two amount fields with token pickers, a flip button that makes the two fields trade places, live rate and fee rows, and a pending then confirmed state. */
export function TokenSwap({ tokens = sampleTokens, defaultPay, defaultReceive, amount, defaultAmount = "1.5", onAmountChange, feeRate = 0.003, onSwap, className }: TokenSwapProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId();
  // Each field keeps its identity when the pair flips, so the two cards visibly trade places.
  const [sides, setSides] = useState<{ key: string; symbol: string }[]>(() => [{ key: "a", symbol: defaultPay ?? tokens[0]?.symbol ?? "" }, { key: "b", symbol: defaultReceive ?? tokens[1]?.symbol ?? "" }]);
  const [internal, setInternal] = useState(defaultAmount);
  const [balances, setBalances] = useState<Record<string, number>>(() => Object.fromEntries(tokens.map(token => [token.symbol, token.balance])));
  const [flips, setFlips] = useState(0);
  const [inverted, setInverted] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [receipt, setReceipt] = useState<SwapQuote | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const find = (symbol: string | undefined) => tokens.find(token => token.symbol === symbol) ?? tokens[0];
  const pay = find(sides[0]?.symbol), receive = find(sides[1]?.symbol);
  if (!pay || !receive) return null;

  const text = amount ?? internal;
  const value = Number(text) || 0;
  const rate = pay.price / receive.price;
  const fee = value * feeRate;
  const received = (value - fee) * rate;
  const balance = balances[pay.symbol] ?? 0;
  const short = value > balance;
  const ready = value > 0 && !short && phase === "idle";

  const setAmount = (next: string) => { if (amount === undefined) setInternal(next); onAmountChange?.(next); };
  const flip = () => {
    setSides(([first, second]) => (first && second ? [second, first] : []));
    setFlips(count => count + 1);
    if (received > 0) setAmount(typed(received));
  };
  const pick = (index: number, symbol: string) => {
    // Choosing the token that already sits on the other side is a flip.
    if (sides[1 - index]?.symbol === symbol) { flip(); return; }
    setSides(current => current.map((side, at) => (at === index ? { ...side, symbol } : side)));
  };
  const confirm = async () => {
    if (!ready) return;
    const quote: SwapQuote = { pay: pay.symbol, receive: receive.symbol, amount: value, received };
    setPhase("pending");
    try { await (onSwap?.(quote) ?? new Promise<void>(resolve => window.setTimeout(resolve, 1700))); } catch { if (alive.current) setPhase("idle"); return; }
    if (!alive.current) return;
    setBalances(current => ({ ...current, [quote.pay]: (current[quote.pay] ?? 0) - quote.amount, [quote.receive]: (current[quote.receive] ?? 0) + quote.received }));
    setReceipt(quote);
    setPhase("done");
  };
  const reset = () => { setPhase("idle"); setReceipt(null); setAmount(""); };

  const swap = reduceMotion ? { duration: 0 } : { type: "spring" as const, visualDuration: 0.45, bounce: 0.18 };
  const cta = phase === "pending" ? "Confirming swap" : value <= 0 ? "Enter an amount" : short ? `Not enough ${pay.symbol}` : `Swap ${pay.symbol} for ${receive.symbol}`;
  const [base, quote] = inverted ? [receive, pay] : [pay, receive];

  return (
    <div className={[styles.swap, className].filter(Boolean).join(" ")} data-phase={phase}>
      <form className={styles.form} inert={phase !== "idle"} onSubmit={event => { event.preventDefault(); void confirm(); }}>
        <header className={styles.header}>
          <h2 className={styles.title}>Swap</h2>
          <span className={styles.badge}>Play money</span>
        </header>

        <LayoutGroup id={uid}>
          <div className={styles.pair}>
            {sides.map((side, index) => {
              const token = index === 0 ? pay : receive;
              const paying = index === 0;
              const shown = paying ? text : received > 0 ? typed(received) : "";
              const worth = (paying ? value : received) * token.price;
              return (
                <motion.div key={side.key} layout="position" className={styles.field} data-short={paying && short ? "true" : undefined} style={{ zIndex: paying ? 2 : 1 }} transition={swap}>
                  {/* The card that moves up passes over the other one: it swells a little while its partner dips. */}
                  <motion.div key={flips} className={styles.fieldInner} initial={flips === 0 || reduceMotion ? false : { scale: paying ? 1.045 : 0.94 }} animate={{ scale: 1 }} transition={swap}>
                  <div className={styles.fieldTop}>
                    <label htmlFor={`${uid}-${side.key}`}>{paying ? "You pay" : "You receive"}</label>
                    <span className={styles.balance}>
                      Balance {format(balances[token.symbol] ?? 0)}
                      {paying ? <button type="button" className={styles.max} onClick={() => setAmount(typed(balance))}>Max</button> : null}
                    </span>
                  </div>
                  <div className={styles.fieldMain}>
                    <input id={`${uid}-${side.key}`} className={styles.amount} value={shown} readOnly={!paying} tabIndex={paying ? 0 : -1} inputMode="decimal" autoComplete="off" placeholder="0" aria-invalid={paying && short ? true : undefined} aria-describedby={`${uid}-${side.key}-worth`} onChange={event => { if (paying) setAmount(clean(event.target.value)); }} />
                    <TokenPicker label={paying ? "Pay with" : "Receive"} token={token} tokens={tokens} balances={balances} onPick={symbol => pick(index, symbol)} />
                  </div>
                  <p id={`${uid}-${side.key}-worth`} className={styles.worth}>{paying && short ? `You only have ${format(balance)} ${token.symbol}` : worth > 0 ? `About ${dollars(worth)}` : "\u00a0"}</p>
                </motion.div>
                </motion.div>
              );
            })}
            <motion.button type="button" className={styles.flip} aria-label={`Flip: pay ${receive.symbol}, receive ${pay.symbol}`} onClick={flip} whileTap={reduceMotion ? undefined : { scale: 0.9 }} transition={motionTokens.spring.snappy}>
              <motion.span className={styles.flipIcon} initial={false} animate={{ rotate: reduceMotion ? 0 : flips * 180 }} transition={swap}><ArrowDownUp size={16} aria-hidden="true" /></motion.span>
            </motion.button>
          </div>
        </LayoutGroup>

        <dl className={styles.rows}>
          <div className={styles.row}>
            <dt>Rate</dt>
            <dd>
              <button type="button" className={styles.rate} aria-label="Show the rate the other way round" onClick={() => setInverted(current => !current)}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={`${base.symbol}-${quote.symbol}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}>
                    1 {base.symbol} = {format(base.price / quote.price)} {quote.symbol}
                  </motion.span>
                </AnimatePresence>
                <ArrowLeftRight size={12} aria-hidden="true" />
              </button>
            </dd>
          </div>
          <div className={styles.row}><dt>Fee ({(feeRate * 100).toFixed(1)}%)</dt><dd>{value > 0 ? `${format(fee)} ${pay.symbol}` : "—"}</dd></div>
          <div className={styles.row}><dt>Network cost</dt><dd>{dollars(NETWORK_FEE)}</dd></div>
          <div className={styles.row}><dt>Minimum received</dt><dd>{received > 0 ? `${format(received * (1 - SLIPPAGE))} ${receive.symbol}` : "—"}</dd></div>
        </dl>

        <button type="submit" className={styles.confirm} disabled={!ready && phase === "idle"} data-pending={phase === "pending" ? "true" : undefined}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={cta} className={styles.confirmLabel} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }} transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}>
              {phase === "pending" ? <span className={styles.spinner} aria-hidden="true" /> : null}{cta}
            </motion.span>
          </AnimatePresence>
        </button>
      </form>

      <AnimatePresence>
        {phase === "done" && receipt ? (
          <motion.div key="receipt" className={styles.receipt} role="status" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant } }} transition={reduceMotion ? { duration: motionTokens.duration.fast } : motionTokens.spring.gentle}>
            <svg className={styles.tick} viewBox="0 0 56 56" aria-hidden="true">
              <motion.circle cx="28" cy="28" r="26" initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", visualDuration: 0.4, bounce: 0.3 }} />
              <motion.path d="M18 28.5l7 7 13-14" initial={reduceMotion ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.32, ease: motionTokens.ease.standard, delay: reduceMotion ? 0 : 0.2 }} />
            </svg>
            <p className={styles.receiptTitle}>Swap confirmed</p>
            <p className={styles.receiptLine}>{format(receipt.amount)} {receipt.pay} <ArrowLeftRight size={13} aria-hidden="true" /> {format(receipt.received)} {receipt.receive}</p>
            <p className={styles.receiptNote}>Balances updated. This is play money: nothing left this page.</p>
            <button type="button" className={styles.again} onClick={reset}>New swap</button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Ready preview: the swap card centered on a quiet stage. */
export function TokenSwapPreview() {
  return (
    <section className={styles.preview} aria-label="Token swap">
      <TokenSwap />
    </section>
  );
}

export default TokenSwapPreview;
