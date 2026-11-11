"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./adaptive-stepper.module.css";

/**
 * A numeric stepper that never changes size. Digits roll up or down to the new value, and the minus or plus button folds away
 * at the minimum or maximum while the number slides over to keep the control balanced. Hold a button to keep stepping.
 * The number is a spinbutton: arrow keys, Page Up and Down, Home and End all work.
 */
export interface AdaptiveStepperProps {
  /** The current value (controlled). */
  value?: number;
  /** The starting value (uncontrolled). Defaults to `min`. */
  defaultValue?: number;
  /** Runs with the new value after every step. */
  onValueChange?: (value: number) => void;
  /** Lowest value. The minus button folds away here. */
  min?: number;
  /** Highest value. The plus button folds away here. */
  max?: number;
  /** Amount added or removed per press. */
  step?: number;
  /** Amount for Page Up and Page Down. Defaults to five steps. */
  largeStep?: number;
  /** Accessible name, for example "Quantity". */
  label: string;
  /** Spoken form of the value, for example `value => value + " guests"`. */
  formatValueText?: (value: number) => string;
  /** Control height: 36, 44 or 50 px. */
  size?: "sm" | "md" | "lg";
  /** Field name: adds a hidden input so the value submits with a form. */
  name?: string;
  /** Turns the control off: it is dimmed and ignores pointer and keyboard input. */
  disabled?: boolean;
  /** Extra class names for the root element. */
  className?: string;
}

const decimalsOf = (input: number) => { const text = String(input); const at = text.indexOf("."); return at === -1 ? 0 : text.length - at - 1; };
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** A digit rolls in from the side the count is moving toward and the old one leaves the other way, like a mechanical counter. */
const roll: Variants = {
  enter: (direction: number) => ({ y: direction >= 0 ? "70%" : "-70%", opacity: 0, filter: `blur(${motionTokens.blur.subtle}px)` }),
  shown: { y: "0%", opacity: 1, filter: "blur(0px)" },
  leave: (direction: number) => ({ y: direction >= 0 ? "-70%" : "70%", opacity: 0, filter: `blur(${motionTokens.blur.subtle}px)` }),
};
const fadeOnly: Variants = { enter: { opacity: 0 }, shown: { opacity: 1 }, leave: { opacity: 0 } };
const quick = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] as [number, number, number, number] };
const rollTransition = { y: motionTokens.spring.snappy, opacity: quick, filter: quick };

/** Hold to repeat: a pause after the first step, then a steady run. */
const HOLD_DELAY = 380;
const HOLD_EVERY = 75;

export function AdaptiveStepper({ value, defaultValue, onValueChange, min = 0, max = 10, step = 1, largeStep, label, formatValueText, size = "md", name, disabled = false, className }: AdaptiveStepperProps) {
  const reduce = !!useReducedMotion();
  const [internal, setInternal] = useState(() => clamp(defaultValue ?? min, min, max));
  const current = clamp(value ?? internal, min, max);
  const decimals = Math.max(decimalsOf(step), decimalsOf(min));
  const format = (input: number) => input.toFixed(decimals);

  // Which way the last change went, so digits know where to roll from.
  const [seen, setSeen] = useState(current);
  const [direction, setDirection] = useState(1);
  if (seen !== current) { setDirection(current > seen ? 1 : -1); setSeen(current); }

  const spinRef = useRef<HTMLDivElement>(null);
  /** Focus that arrived through a button press draws no ring, like any other pointer focus; the first key press brings it back. */
  const [quiet, setQuiet] = useState(false);
  const latest = useRef(current);
  latest.current = current;
  const hold = useRef<{ delay?: number; every?: number }>({});
  const stopHold = () => { window.clearTimeout(hold.current.delay); window.clearInterval(hold.current.every); hold.current = {}; };
  useEffect(() => stopHold, []);

  function setTo(next: number) {
    const fixed = clamp(Number(next.toFixed(decimals)), min, max);
    if (fixed === latest.current) return false;
    latest.current = fixed;
    if (value === undefined) setInternal(fixed);
    onValueChange?.(fixed);
    return true;
  }
  const nudge = (steps: number) => setTo(latest.current + steps * step);

  function onPress(event: ReactPointerEvent<HTMLButtonElement>, sign: 1 | -1) {
    if (disabled || event.button !== 0) return;
    // Focus goes to the number, which owns the keyboard, so a button that folds away never takes focus with it.
    if (document.activeElement !== spinRef.current) { setQuiet(true); spinRef.current?.focus({ preventScroll: true }); }
    stopHold();
    if (!nudge(sign)) return;
    hold.current.delay = window.setTimeout(() => {
      hold.current.every = window.setInterval(() => { if (!nudge(sign)) stopHold(); }, HOLD_EVERY);
    }, HOLD_DELAY);
  }

  // Pointer presses step on the way down; a click with no pointer behind it comes from assistive tech and steps here.
  function onClick(event: MouseEvent<HTMLButtonElement>, sign: 1 | -1) {
    if (event.detail === 0 && !disabled) nudge(sign);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (quiet) setQuiet(false);
    if (disabled) return;
    const big = largeStep ?? step * 5;
    let handled = true;
    if (event.key === "ArrowUp" || event.key === "ArrowRight") nudge(1);
    else if (event.key === "ArrowDown" || event.key === "ArrowLeft") nudge(-1);
    else if (event.key === "PageUp") setTo(latest.current + big);
    else if (event.key === "PageDown") setTo(latest.current - big);
    else if (event.key === "Home") setTo(min);
    else if (event.key === "End") setTo(max);
    else handled = false;
    if (handled) event.preventDefault();
  }

  // A disabled stepper keeps the buttons its value allows, so it still reads as a stepper that is off.
  const canDecrease = current > min;
  const canIncrease = current < max;
  const text = format(current);
  const chars = [...text];
  const slots = Math.max(format(min).length, format(max).length);
  // The number sits between the buttons that are present: with one folded away it slides half a button toward the gap.
  const lean = (canDecrease ? 0 : -0.5) + (canIncrease ? 0 : 0.5);
  const variants = reduce ? fadeOnly : roll;

  const button = (sign: 1 | -1) => (
    <motion.button
      key={sign}
      type="button"
      tabIndex={-1}
      className={styles.button}
      data-side={sign === 1 ? "plus" : "minus"}
      aria-label={sign === 1 ? `Increase ${label.toLowerCase()}` : `Decrease ${label.toLowerCase()}`}
      initial={reduce ? { opacity: 0 } : { opacity: 0, rotateY: sign * -84, scale: 0.7 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, rotateY: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, rotateY: sign * -84, scale: 0.7 }}
      disabled={disabled}
      whileTap={reduce || disabled ? undefined : { scale: 0.9 }}
      transition={reduce ? quick : { ...motionTokens.spring.snappy, opacity: quick }}
      onMouseDown={event => event.preventDefault()}
      onPointerDown={event => onPress(event, sign)}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      onClick={event => onClick(event, sign)}
    >
      {sign === 1 ? <Plus size={16} strokeWidth={2.25} aria-hidden="true" /> : <Minus size={16} strokeWidth={2.25} aria-hidden="true" />}
    </motion.button>
  );

  return (
    <div className={[styles.stepper, className].filter(Boolean).join(" ")} data-size={size} data-disabled={disabled || undefined} style={{ "--slots": slots } as CSSProperties}>
      <AnimatePresence initial={false}>{canDecrease ? button(-1) : null}</AnimatePresence>
      <div
        ref={spinRef}
        role="spinbutton"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuenow={current}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={formatValueText?.(current)}
        aria-disabled={disabled || undefined}
        className={styles.value}
        data-quiet={quiet || undefined}
        style={{ "--lean": lean } as CSSProperties}
        onKeyDown={onKeyDown}
        onBlur={() => setQuiet(false)}
      >
        <span className={styles.digits} aria-hidden="true">
          <AnimatePresence initial={false}>
            {chars.map((char, index) => {
              // Places are counted from the right, so the units digit keeps its identity when the number gains or loses a digit.
              const place = chars.length - 1 - index;
              const offset = chars.length / 2 - place - 0.5;
              return (
                <motion.span key={place} className={styles.cell} style={{ "--offset": offset } as CSSProperties} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={quick}>
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.span key={char} className={styles.char} custom={direction} variants={variants} initial="enter" animate="shown" exit="leave" transition={reduce ? quick : rollTransition}>{char}</motion.span>
                  </AnimatePresence>
                </motion.span>
              );
            })}
          </AnimatePresence>
        </span>
      </div>
      <AnimatePresence initial={false}>{canIncrease ? button(1) : null}</AnimatePresence>
      {name ? <input type="hidden" name={name} value={text} /> : null}
    </div>
  );
}

export default AdaptiveStepper;
