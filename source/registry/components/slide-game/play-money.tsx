"use client";

/**
 * Shared parts of the play-money toy games: a fake balance, the bet field, the action button, the result chips and the card frame.
 * Each game ships its own copy of this file, so a game installs on its own.
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Coins, RotateCcw } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./play-money.module.css";

const amountFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 1234.5 → "1,234.50". Play money has no currency sign on purpose. */
export const formatAmount = (value: number) => amountFormat.format(value);
/** 2.5 → "2.50×", 12.34 → "12.3×", 120 → "120×". */
export const formatMultiplier = (value: number) => `${value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2)}×`;
/** Keeps amounts at two decimals, so sums never drift. */
export const roundAmount = (value: number) => Math.round(value * 100) / 100;

export interface PlayMoneyOptions {
  /** Controlled balance. */
  balance?: number;
  /** Starting balance when uncontrolled; a reset returns to it. */
  defaultBalance: number;
  /** Called with the new balance after a bet, a payout or a reset. */
  onBalanceChange?: (balance: number) => void;
}

export interface PlayMoneyGain {
  /** Changes on every payout, so the same amount twice still animates. */
  id: number;
  /** Amount paid. */
  amount: number;
}

export interface PlayMoney {
  /** Current fake balance. */
  balance: number;
  /** The latest payout, for the "+12.40" flyer next to the balance. */
  gain: PlayMoneyGain | null;
  /** Takes a bet out of the balance. Returns false (and takes nothing) when the balance is too low. */
  spend: (amount: number) => boolean;
  /** Adds a payout to the balance. */
  pay: (amount: number) => void;
  /** Returns the balance to its starting amount. */
  reset: () => void;
}

/** A fake balance, controlled or uncontrolled. Reads go through a ref, so a bet and a payout in the same tick both count. */
export function usePlayMoney({ balance: controlled, defaultBalance, onBalanceChange }: PlayMoneyOptions): PlayMoney {
  const [internal, setInternal] = useState(defaultBalance);
  const [gain, setGain] = useState<PlayMoneyGain | null>(null);
  const balance = controlled ?? internal;
  const latest = useRef(balance);
  const gainId = useRef(0);
  useEffect(() => { latest.current = balance; }, [balance]);

  const commit = useCallback((next: number) => {
    const value = roundAmount(Math.max(0, next));
    latest.current = value;
    setInternal(value);
    onBalanceChange?.(value);
  }, [onBalanceChange]);

  const spend = useCallback((amount: number) => {
    if (!(amount > 0) || amount > latest.current + 1e-9) return false;
    commit(latest.current - amount);
    return true;
  }, [commit]);

  const pay = useCallback((amount: number) => {
    if (!(amount > 0)) return;
    commit(latest.current + amount);
    gainId.current += 1;
    setGain({ id: gainId.current, amount: roundAmount(amount) });
  }, [commit]);

  const reset = useCallback(() => { setGain(null); commit(defaultBalance); }, [commit, defaultBalance]);

  return { balance, gain, spend, pay, reset };
}

function Balance({ value, gain }: { value: number; gain: PlayMoneyGain | null }) {
  const reduceMotion = useReducedMotion();
  const shown = useMotionValue(value);
  const text = useTransform(shown, formatAmount);
  useEffect(() => {
    if (reduceMotion) { shown.set(value); return; }
    const controls = animate(shown, value, { duration: motionTokens.duration.considered, ease: [...motionTokens.ease.standard] });
    return () => controls.stop();
  }, [value, reduceMotion, shown]);
  return (
    <span className={styles.balance}>
      <Coins size={15} aria-hidden="true" />
      <span className={styles.srOnly}>Play-money balance: {formatAmount(value)}</span>
      <motion.span className={styles.balanceValue} aria-hidden="true">{text}</motion.span>
      <AnimatePresence>
        {gain ? (
          <motion.span
            key={gain.id}
            className={styles.gain}
            aria-hidden="true"
            initial={{ opacity: 0, y: reduceMotion ? -14 : 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: reduceMotion ? -14 : -18 }}
            transition={{ duration: 1.4, times: [0, 0.12, 0.7, 1], ease: "easeOut" }}
          >
            +{formatAmount(gain.amount)}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

export interface GameFrameProps {
  /** Name of the game, shown in the header and used as the region label. */
  title: string;
  /** The balance from `usePlayMoney`. */
  money: PlayMoney;
  /** True while a round is running: the reset button waits for it to end. */
  busy?: boolean;
  /** Result text for screen readers, announced politely. */
  announcement?: string;
  /** Extra class for the card. */
  className?: string;
  /** The stage and controls of the game. */
  children: ReactNode;
}

/** The card around a game: title, a "Play money" tag, the balance and its reset. */
export function GameFrame({ title, money, busy = false, announcement = "", className, children }: GameFrameProps) {
  return (
    <section className={[styles.frame, className].filter(Boolean).join(" ")} aria-label={title}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.title}>{title}</span>
          <span className={styles.tag}>Play money</span>
        </div>
        <div className={styles.wallet}>
          <Balance value={money.balance} gain={money.gain} />
          <button type="button" className={styles.reset} onClick={money.reset} disabled={busy} aria-label="Reset balance" title="Reset balance">
            <RotateCcw size={15} aria-hidden="true" />
          </button>
        </div>
      </header>
      {children}
      <p className={styles.srOnly} role="status" aria-live="polite">{announcement}</p>
    </section>
  );
}

export interface BetFieldProps {
  /** Bet amount. */
  value: number;
  /** Called with the new amount, already clamped between `min` and `max`. */
  onValueChange: (value: number) => void;
  /** Smallest bet. */
  min?: number;
  /** Largest bet, usually the balance. */
  max: number;
  /** Locks the field, for example while a round runs. */
  disabled?: boolean;
  /** Field label. */
  label?: string;
}

/** Keeps digits and one dot, two decimals at most. */
const cleanAmount = (text: string) => {
  const [whole = "", ...rest] = text.replace(/[^\d.]/g, "").split(".");
  return rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
};

/** Bet amount with half, double and max shortcuts. Typing is free; the amount is clamped when the field loses focus. */
export function BetField({ value, onValueChange, min = 1, max, disabled = false, label = "Bet" }: BetFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (amount: number) => roundAmount(Math.min(Math.max(amount, min), Math.max(min, max)));
  const set = (amount: number) => { setDraft(null); onValueChange(clamp(amount)); };
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={id}>{label}</label>
      <div className={styles.fieldBox} data-disabled={disabled || undefined}>
        <input
          id={id}
          className={styles.fieldInput}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          value={draft ?? formatAmount(value)}
          onFocus={event => event.currentTarget.select()}
          onChange={event => {
            const text = cleanAmount(event.target.value);
            setDraft(text);
            const amount = Number.parseFloat(text);
            if (Number.isFinite(amount) && amount >= min) onValueChange(roundAmount(Math.min(amount, Math.max(min, max))));
          }}
          onBlur={() => { const amount = Number.parseFloat(draft ?? ""); set(Number.isFinite(amount) ? amount : value); }}
          onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }}
        />
        <div className={styles.quick} role="group" aria-label={`Adjust ${label.toLowerCase()}`}>
          <button type="button" className={styles.quickButton} disabled={disabled} onClick={() => set(value / 2)} aria-label="Halve the bet">½</button>
          <button type="button" className={styles.quickButton} disabled={disabled} onClick={() => set(value * 2)} aria-label="Double the bet">2×</button>
          <button type="button" className={styles.quickButton} disabled={disabled} onClick={() => set(max)} aria-label="Bet the whole balance">Max</button>
        </div>
      </div>
    </div>
  );
}

export interface AmountFieldProps {
  /** Field label. */
  label: string;
  /** Text in the field (digits and one dot). Empty means "not set". */
  value: string;
  /** Called with the cleaned text on every edit. */
  onValueChange: (value: string) => void;
  /** Shown while the field is empty. */
  placeholder?: string;
  /** Short unit after the number, for example "×". */
  suffix?: string;
  /** Locks the field. */
  disabled?: boolean;
}

/** A small optional number, such as a target multiplier. */
export function AmountField({ label, value, onValueChange, placeholder, suffix, disabled = false }: AmountFieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={id}>{label}</label>
      <div className={styles.fieldBox} data-disabled={disabled || undefined}>
        <input id={id} className={styles.fieldInput} type="text" inputMode="decimal" autoComplete="off" disabled={disabled} placeholder={placeholder} value={value} onChange={event => onValueChange(cleanAmount(event.target.value))} />
        {suffix ? <span className={styles.suffix} aria-hidden="true">{suffix}</span> : null}
      </div>
    </div>
  );
}

export interface FieldGroupProps {
  /** Label above the control. */
  label: string;
  /** The control: a stepper, a segmented choice… */
  children: ReactNode;
}

/** A labelled slot for a custom control, aligned with the bet field. */
export function FieldGroup({ label, children }: FieldGroupProps) {
  const id = useId();
  return (
    <div className={styles.field} role="group" aria-labelledby={id}>
      <span className={styles.fieldLabel} id={id}>{label}</span>
      {children}
    </div>
  );
}

export interface PlayButtonProps {
  /** Identifies the label: when it changes, the old label slides out and the new one slides in. */
  labelKey: string;
  /** "accent" for the main action, "neutral" for a waiting state. */
  tone?: "accent" | "neutral";
  /** Turns the action off. The button stays focusable (aria-disabled), so keyboard focus is never lost while a round runs. */
  disabled?: boolean;
  /** Runs the action. */
  onClick: () => void;
  /** Label content. */
  children: ReactNode;
}

/** The main action of a game. One button keeps focus while its label changes (Bet, Cash out, …). */
export function PlayButton({ labelKey, tone = "accent", disabled = false, onClick, children }: PlayButtonProps) {
  const reduceMotion = useReducedMotion();
  const shift = reduceMotion ? 0 : 10;
  return (
    <motion.button
      type="button"
      className={styles.play}
      data-tone={tone}
      aria-disabled={disabled || undefined}
      onClick={() => { if (!disabled) onClick(); }}
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.97 }}
      transition={motionTokens.spring.snappy}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={labelKey}
          className={styles.playLabel}
          initial={{ opacity: 0, y: shift }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -shift, transition: { duration: motionTokens.duration.instant } }}
          transition={motionTokens.spring.snappy}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export interface HistoryEntry {
  /** Stable key of the round. */
  id: number | string;
  /** Text of the chip, for example "2.31×". */
  label: string;
  /** "low" is muted, "mid" is tinted, "high" takes the accent fill. */
  tone: "low" | "mid" | "high";
}

export interface HistoryChipsProps {
  /** Past results, newest first. */
  entries: HistoryEntry[];
  /** Label of the list for screen readers. */
  label: string;
}

/** A row of past results. A new chip springs in at the start and pushes the others along. */
export function HistoryChips({ entries, label }: HistoryChipsProps) {
  const reduceMotion = useReducedMotion();
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; }, []);
  return (
    <ol className={styles.history} aria-label={label}>
      <AnimatePresence mode="popLayout">
        {entries.map((entry, index) => (
          <motion.li
            key={entry.id}
            layout={reduceMotion ? false : "position"}
            className={styles.chip}
            data-tone={entry.tone}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, x: -14 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant } }}
            transition={{ ...motionTokens.spring.snappy, delay: mounted.current ? 0 : index * motionTokens.stagger.item }}
          >
            {entry.label}
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  );
}
