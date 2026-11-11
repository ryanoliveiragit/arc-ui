"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { Transition } from "motion/react";
import { Check, Clock, Users } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./prediction-market.module.css";

export type PredictionSide = "yes" | "no";

export interface PredictionRange {
  /** Stable key of the range, such as "1w". */
  id: string;
  /** Short label on the range switch. */
  label: string;
  /** Probability of "yes" over time, each from 0 to 1. Every range must have the same number of points so the line can morph. */
  points: number[];
  /** One label per point for the readout, such as "Oct 12" or "14:00". */
  labels: string[];
}

export interface PredictionOrder {
  /** The outcome that was bought. */
  side: PredictionSide;
  /** Amount spent, in the market's currency. */
  amount: number;
  /** Price per share, from 0 to 1. */
  price: number;
  /** Shares bought: amount divided by price. Each share pays 1 if the outcome happens. */
  shares: number;
}

export interface PredictionMarketProps {
  /** The question the market settles. */
  question: string;
  /** Small label above the question. */
  category?: string;
  /** History of the "yes" probability, one entry per time range. The last point of the active range is the current price. */
  ranges: PredictionRange[];
  /** Range shown first. Defaults to the first one. */
  defaultRange?: string;
  /** Traded volume, already formatted. */
  volume?: string;
  /** When the market closes, already formatted. */
  closes?: string;
  /** Selected outcome (controlled). */
  side?: PredictionSide;
  /** Selected outcome on first render (uncontrolled). */
  defaultSide?: PredictionSide;
  /** Called when the outcome changes. */
  onSideChange?: (side: PredictionSide) => void;
  /** Amount in the field on first render. */
  defaultAmount?: number;
  /** Play balance available to spend. It goes down as orders are placed. */
  balance?: number;
  /** Called when an order is confirmed. Return a promise to keep the button in its sending state until it settles. */
  onPlaceOrder?: (order: PredictionOrder) => void | Promise<void>;
  /** Extra class for the card. */
  className?: string;
}

const ease = [...motionTokens.ease.enter] as [number, number, number, number];
const still: Transition = { duration: 0 };
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const cents = (price: number) => `${Math.round(price * 100)}¢`;
const CHART_HEIGHT = 136;
const PAD = 10;
/** Room on the right for the grid labels, so the line and its end dot never run under them. */
const GUTTER = 38;

/** A number that counts to its new value instead of jumping. */
function Rolling({ value, format }: { value: number; format: (value: number) => string }) {
  const reduce = useReducedMotion() ?? false;
  const current = useMotionValue(value);
  const text = useTransform(current, latest => format(latest));
  useEffect(() => {
    if (reduce) { current.jump(value); return; }
    const controls = animate(current, value, { duration: motionTokens.duration.considered, ease });
    return () => controls.stop();
  }, [current, reduce, value]);
  return <motion.span>{text}</motion.span>;
}

/**
 * A market card for a yes or no question: the price of each outcome, the probability over time, and an order ticket
 * with a live payout estimate. Picking the other outcome flips the line to that outcome's history, numbers count to
 * their new values, and the confirm button walks through sending and done. All amounts are play money.
 */
export function PredictionMarket({ question, category, ranges, defaultRange, volume, closes, side, defaultSide = "yes", onSideChange, defaultAmount = 25, balance: startBalance = 250, onPlaceOrder, className }: PredictionMarketProps) {
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const [rangeId, setRangeId] = useState(defaultRange ?? ranges[0]?.id ?? "");
  const [internalSide, setInternalSide] = useState<PredictionSide>(defaultSide);
  const [amountText, setAmountText] = useState(String(defaultAmount));
  const [balance, setBalance] = useState(startBalance);
  const [held, setHeld] = useState<Record<PredictionSide, number>>({ yes: 0, no: 0 });
  const [phase, setPhase] = useState<"idle" | "sending" | "done">("idle");
  const [probe, setProbe] = useState<number | null>(null);
  const [width, setWidth] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const drawn = useRef(false);

  const picked = side ?? internalSide;
  const range = ranges.find(entry => entry.id === rangeId) ?? ranges[0];
  const points = useMemo(() => (range?.points ?? []).map(point => (picked === "yes" ? point : 1 - point)), [range, picked]);
  const last = points[points.length - 1] ?? .5;
  const first = points[0] ?? last;
  const yesPrice = picked === "yes" ? last : 1 - last;
  const change = Math.round((last - first) * 100);
  const spring: Transition = reduce ? still : motionTokens.spring.morph;

  useLayoutEffect(() => {
    const node = chartRef.current;
    if (!node) return;
    setWidth(node.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setWidth(node.clientWidth));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The vertical scale follows the data, rounded out to 5 point steps, so a calm market still shows its shape.
  const low = Math.max(0, Math.floor((Math.min(...points, 1) - .05) * 20) / 20);
  const high = Math.min(1, Math.ceil((Math.max(...points, 0) + .05) * 20) / 20);
  const plotWidth = Math.max(width - PAD - GUTTER, 1);
  const x = (index: number) => (points.length > 1 ? (index / (points.length - 1)) * (plotWidth - PAD) + PAD : PAD);
  const y = (value: number) => PAD + (1 - (value - low) / Math.max(high - low, .01)) * (CHART_HEIGHT - PAD * 2);
  const path = width ? points.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(1)} ${y(point).toFixed(1)}`).join(" ") : "";
  const shownIndex = probe ?? points.length - 1;
  const shownValue = points[shownIndex] ?? last;

  const amount = Math.max(0, Number.parseFloat(amountText.replace(",", ".")) || 0);
  const price = Math.min(Math.max(last, .01), .99);
  const shares = amount / price;
  const profit = shares - amount;
  const tooMuch = amount > balance + 1e-9;
  const canPlace = amount > 0 && !tooMuch && phase === "idle";

  const pickSide = (next: PredictionSide) => {
    if (next === picked) return;
    if (side === undefined) setInternalSide(next);
    onSideChange?.(next);
  };
  const setAmount = (next: number) => setAmountText(String(Math.round(Math.min(Math.max(next, 0), 100000) * 100) / 100));

  const place = async () => {
    if (!canPlace) return;
    const order: PredictionOrder = { side: picked, amount, price, shares };
    setPhase("sending");
    try {
      // With no handler the preview still shows the sending state for a moment.
      await (onPlaceOrder ? onPlaceOrder(order) : new Promise<void>(resolve => { timer.current = window.setTimeout(resolve, 900); }));
      setBalance(current => Math.max(0, current - order.amount));
      setHeld(current => ({ ...current, [order.side]: current[order.side] + order.shares }));
      setPhase("done");
      timer.current = window.setTimeout(() => setPhase("idle"), 1800);
    } catch {
      setPhase("idle");
    }
  };

  const probeAt = (event: ReactPointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left - PAD) / Math.max(box.width - PAD * 2 - GUTTER, 1);
    setProbe(Math.round(Math.min(Math.max(ratio, 0), 1) * (points.length - 1)));
  };
  const onChartKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const end = points.length - 1;
    const from = probe ?? end;
    const next = event.key === "ArrowLeft" ? from - 1 : event.key === "ArrowRight" ? from + 1 : event.key === "Home" ? 0 : event.key === "End" ? end : null;
    if (next == null) return;
    event.preventDefault();
    setProbe(Math.min(Math.max(next, 0), end));
  };
  const onRadioKey = (event: KeyboardEvent<HTMLDivElement>, ids: string[], currentId: string, pick: (id: string) => void) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = ids[(ids.indexOf(currentId) + step + ids.length) % ids.length];
    if (!next) return;
    pick(next);
    event.currentTarget.querySelector<HTMLElement>(`[data-value="${CSS.escape(next)}"]`)?.focus();
  };

  const drawIn = !drawn.current && !reduce;
  if (path) drawn.current = true;
  const sideLabel = picked === "yes" ? "Yes" : "No";
  const sides: { id: PredictionSide; label: string; price: number }[] = [{ id: "yes", label: "Yes", price: yesPrice }, { id: "no", label: "No", price: 1 - yesPrice }];
  const heldShares = held.yes + held.no;

  return (
    <article className={[styles.card, className].filter(Boolean).join(" ")} aria-labelledby={`${uid}-question`}>
      <header className={styles.header}>
        <div className={styles.meta}>
          {category ? <span className={styles.category}>{category}</span> : null}
          {volume ? <span className={styles.metaItem}><Users size={13} aria-hidden="true" />{volume} vol.</span> : null}
          {closes ? <span className={styles.metaItem}><Clock size={13} aria-hidden="true" />{closes}</span> : null}
        </div>
        <h3 id={`${uid}-question`} className={styles.question}>{question}</h3>
      </header>

      <div className={styles.headline}>
        <p className={styles.chance}>
          <span className={styles.chanceValue}><Rolling value={shownValue * 100} format={value => `${Math.round(value)}%`} /></span>
          <span className={styles.chanceLabel}>{sideLabel} · {probe == null ? "now" : range?.labels[shownIndex] ?? ""}</span>
        </p>
        <span className={styles.change} data-direction={change >= 0 ? "up" : "down"}>{change >= 0 ? "+" : "−"}{Math.abs(change)} pts</span>
        <div className={styles.ranges} role="radiogroup" aria-label="Time range" onKeyDown={event => onRadioKey(event, ranges.map(entry => entry.id), range?.id ?? "", setRangeId)}>
          {ranges.map(entry => {
            const selected = entry.id === range?.id;
            return (
              <button key={entry.id} type="button" role="radio" aria-checked={selected} data-value={entry.id} tabIndex={selected ? 0 : -1} className={styles.range} onClick={() => setRangeId(entry.id)}>
                {selected ? <motion.span layoutId={`${uid}-range`} className={styles.rangePill} transition={spring} /> : null}
                <span className={styles.rangeLabel}>{entry.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={chartRef} className={styles.chart} tabIndex={0} role="group" aria-label={`${sideLabel} probability over time, now ${Math.round(last * 100)} percent. Use the arrow keys to read earlier values.`} onPointerMove={probeAt} onPointerDown={probeAt} onPointerLeave={() => setProbe(null)} onBlur={() => setProbe(null)} onKeyDown={onChartKey}>
        {[high, (high + low) / 2, low].map((level, index) => <span key={index} className={styles.grid} style={{ top: y(level) }}><span>{Math.round(level * 100)}%</span></span>)}
        {width ? (
          <svg className={styles.plot} width={width} height={CHART_HEIGHT} viewBox={`0 0 ${width} ${CHART_HEIGHT}`} aria-hidden="true">
            <motion.path d={path} initial={drawIn ? { pathLength: 0, opacity: 0 } : false} animate={{ d: path, pathLength: 1, opacity: 1 }} transition={reduce ? still : { d: motionTokens.spring.smooth, pathLength: { duration: 1.1, ease }, opacity: { duration: motionTokens.duration.fast } }} />
          </svg>
        ) : null}
        {width ? (
          <motion.span className={styles.marker} data-probing={probe == null ? undefined : ""} initial={false} animate={{ x: x(shownIndex), y: y(shownValue) }} transition={reduce || probe != null ? still : motionTokens.spring.smooth}>
            <span className={styles.markerDot} />
          </motion.span>
        ) : null}
        {probe != null && width ? <span className={styles.crosshair} style={{ transform: `translateX(${x(shownIndex)}px)` }} /> : null}
        <span className={styles.srOnly} aria-live="polite">{probe == null ? "" : `${range?.labels[shownIndex] ?? ""}: ${Math.round(shownValue * 100)} percent`}</span>
      </div>

      <div className={styles.sides} role="radiogroup" aria-label="Outcome" onKeyDown={event => onRadioKey(event, ["yes", "no"], picked, id => pickSide(id as PredictionSide))}>
        {sides.map(option => {
          const selected = option.id === picked;
          return (
            <button key={option.id} type="button" role="radio" aria-checked={selected} data-value={option.id} tabIndex={selected ? 0 : -1} className={styles.side} data-selected={selected ? "" : undefined} onClick={() => pickSide(option.id)}>
              {selected ? <motion.span layoutId={`${uid}-side`} className={styles.sidePill} transition={spring} /> : null}
              <span className={styles.sideLabel}>{option.label}</span>
              <span className={styles.sidePrice}><Rolling value={option.price * 100} format={value => `${Math.round(value)}¢`} /></span>
            </button>
          );
        })}
      </div>

      <div className={styles.ticket}>
        <div className={styles.amountRow}>
          <label className={styles.amountLabel} htmlFor={`${uid}-amount`}>Amount</label>
          <span className={styles.balance}>Balance <Rolling value={balance} format={value => money.format(value)} /></span>
        </div>
        <div className={styles.amountField} data-invalid={tooMuch ? "" : undefined}>
          <span aria-hidden="true">$</span>
          <input id={`${uid}-amount`} className={styles.amountInput} inputMode="decimal" autoComplete="off" value={amountText} aria-invalid={tooMuch || undefined} aria-describedby={`${uid}-estimate`} onChange={event => setAmountText(event.target.value.replace(/[^\d.,]/g, "").slice(0, 9))} />
          <div className={styles.quick}>
            {[10, 50].map(step => <button key={step} type="button" className={styles.quickButton} onClick={() => setAmount(amount + step)}>+{step}</button>)}
            <button type="button" className={styles.quickButton} onClick={() => setAmount(Math.floor(balance * 100) / 100)}>Max</button>
          </div>
        </div>
        <dl id={`${uid}-estimate`} className={styles.estimate}>
          <div><dt>Avg. price</dt><dd>{cents(price)}</dd></div>
          <div><dt>Shares</dt><dd><Rolling value={shares} format={value => value.toFixed(2)} /></dd></div>
          <div className={styles.payout}><dt>Payout if {sideLabel}</dt><dd><Rolling value={shares} format={value => money.format(value)} /><span className={styles.gain}>+<Rolling value={amount > 0 ? (profit / amount) * 100 : 0} format={value => `${Math.round(value)}%`} /></span></dd></div>
        </dl>
        <motion.button type="button" className={styles.place} data-phase={phase} disabled={!canPlace && phase === "idle"} aria-busy={phase === "sending"} onClick={place} whileTap={reduce || !canPlace ? undefined : { scale: .98 }} transition={motionTokens.spring.snappy}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span key={phase === "idle" ? `idle-${picked}` : phase} className={styles.placeLabel} initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -10 }} transition={reduce ? still : { duration: motionTokens.duration.standard, ease }}>
              {phase === "sending" ? <><span className={styles.spinner} aria-hidden="true" />Placing order</> : phase === "done" ? <><Check size={17} strokeWidth={2.4} aria-hidden="true" />Order placed</> : tooMuch ? "Not enough balance" : `Buy ${sideLabel} for ${money.format(amount)}`}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <p className={styles.position} aria-live="polite">
          {heldShares > 0 ? `You hold ${[held.yes ? `${held.yes.toFixed(2)} Yes` : "", held.no ? `${held.no.toFixed(2)} No` : ""].filter(Boolean).join(" and ")} shares.` : "Play money only. Nothing here is a real trade."}
        </p>
      </div>
    </article>
  );
}

/** A fixed, repeatable wobble between two probabilities: the same input always gives the same line. */
function history(from: number, to: number, seed: number, count = 24) {
  return Array.from({ length: count }, (_, index) => {
    const progress = index / (count - 1);
    const wobble = Math.sin(index * 1.7 + seed) * .05 + Math.sin(index * .6 + seed * 2.3) * .08;
    return Math.round(Math.min(Math.max(from + (to - from) * progress + wobble * Math.sin(progress * Math.PI), .03), .97) * 1000) / 1000;
  });
}
const weekdays = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];
const previewRanges: PredictionRange[] = [
  { id: "1d", label: "1D", points: history(.61, .64, 1), labels: Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, "0")}:00`) },
  { id: "1w", label: "1W", points: history(.52, .64, 4), labels: Array.from({ length: 24 }, (_, index) => `${weekdays[Math.floor((index * 7) / 24)]} ${String((index * 7) % 24).padStart(2, "0")}:00`) },
  { id: "1m", label: "1M", points: history(.71, .64, 9), labels: Array.from({ length: 24 }, (_, index) => `Oct ${index + 8}`) },
  { id: "all", label: "All", points: history(.34, .64, 6), labels: Array.from({ length: 24 }, (_, index) => `Week ${index + 1}`) },
];

/** Ready preview with fixed sample data. */
export default function PredictionMarketPreview() {
  return (
    <section className={styles.preview}>
      <PredictionMarket category="Space" question="Will the Halley probe reach lunar orbit before July 1?" ranges={previewRanges} defaultRange="1w" volume="$1.2M" closes="Closes Jun 30" />
    </section>
  );
}
