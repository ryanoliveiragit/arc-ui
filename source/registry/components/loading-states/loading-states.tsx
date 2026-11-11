"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { MotionProps } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./loading-states.module.css";

export interface ThinkingShimmerProps {
  /** The text the sheen runs across. */
  label?: string;
  /** Seconds one pass of the sheen takes. */
  duration?: number;
  /** Class name added to the root element. */
  className?: string;
}

export interface ThinkingDotsProps {
  /** Accessible name of the indicator; also shown next to the dots when `showLabel` is set. */
  label?: string;
  /** Shows the label as text after the dots. */
  showLabel?: boolean;
  /** Class name added to the root element. */
  className?: string;
}

export interface ThinkingPhrasesProps {
  /** Status phrases to rotate through, in order. */
  phrases?: string[];
  /** Milliseconds each phrase stays. */
  interval?: number;
  /** Class name added to the root element. */
  className?: string;
}

export interface ThinkingStepsProps {
  /** The step in progress, counted from 1. */
  current: number;
  /** How many steps there are. */
  total: number;
  /** What the current step is doing. */
  label?: string;
  /** Class name added to the root element. */
  className?: string;
}

export interface LoadingStatesProps {
  /** Which indicator to show. */
  variant?: "shimmer" | "dots" | "phrases" | "steps";
  /** Text of the shimmer, name of the dots, or description of the current step. */
  label?: string;
  /** Phrases for the "phrases" variant. */
  phrases?: string[];
  /** Milliseconds each phrase stays, for the "phrases" variant. */
  interval?: number;
  /** Current step, counted from 1, for the "steps" variant. */
  current?: number;
  /** Number of steps, for the "steps" variant. */
  total?: number;
  /** Class name added to the root element. */
  className?: string;
}

const defaultPhrases = ["Thinking", "Reading the context", "Weighing options", "Writing a reply"];
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const join = (...names: (string | undefined)[]) => names.filter(Boolean).join(" ");

/** Text swaps rise in from below out of a soft blur and leave upward; with reduced motion they only crossfade. */
function useSwap(): MotionProps {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0 } }, transition: { duration: 0 } };
  return {
    initial: { opacity: 0, y: "0.6em", filter: `blur(${motionTokens.blur.soft}px)` },
    animate: { opacity: 1, y: "0em", filter: "blur(0px)" },
    exit: { opacity: 0, y: "-0.6em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } },
    transition: { duration: motionTokens.duration.considered, ease: enter },
  };
}

/** "Thinking…" with a sheen that sweeps across the letters. The quietest indicator: use it inline, where a reply is about to start. */
export function ThinkingShimmer({ label = "Thinking…", duration = 1.7, className }: ThinkingShimmerProps) {
  return <span className={join(styles.shimmer, className)} role="status" style={{ "--sweep": `${duration}s` } as CSSProperties}>{label}</span>;
}

/** Three dots that bounce in a wave, the classic "someone is typing" signal. */
export function ThinkingDots({ label = "Thinking", showLabel = false, className }: ThinkingDotsProps) {
  return (
    <span className={join(styles.dots, className)} role="status" aria-label={showLabel ? undefined : label}>
      <span className={styles.dotRow} aria-hidden="true">
        {[0, 1, 2].map(index => <span key={index} className={styles.dot} style={{ "--i": index } as CSSProperties} />)}
      </span>
      {showLabel ? <span className={styles.dotsLabel}>{label}</span> : null}
    </span>
  );
}

/** A status phrase that changes every few seconds beside a small orbiting mark, for waits long enough that one word would feel stuck. */
export function ThinkingPhrases({ phrases = defaultPhrases, interval = 2200, className }: ThinkingPhrasesProps) {
  const swap = useSwap();
  const [index, setIndex] = useState(0);
  const count = phrases.length;
  useEffect(() => {
    if (count < 2) return;
    const timer = window.setInterval(() => setIndex(current => current + 1), Math.max(600, interval));
    return () => window.clearInterval(timer);
  }, [count, interval]);
  const phrase = count ? phrases[index % count]! : "";
  return (
    <span className={join(styles.phrases, className)} role="status">
      <span className={styles.orbit} aria-hidden="true"><span className={styles.orbitDot} /></span>
      <span className={styles.phraseSlot}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={`${index}-${phrase}`} className={styles.phrase} {...swap}>{phrase}</motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

/** "Step 2 of 5" with one pip per step: finished pips fill, the current one breathes, and the number rolls when the step changes. */
export function ThinkingSteps({ current, total, label, className }: ThinkingStepsProps) {
  const swap = useSwap();
  const safeTotal = Math.max(1, Math.floor(total));
  const step = Math.max(1, Math.min(safeTotal, Math.floor(current)));
  const pips = safeTotal <= 8;
  return (
    <span className={join(styles.steps, className)} role="status" aria-label={`Step ${step} of ${safeTotal}${label ? `: ${label}` : ""}`}>
      <span className={styles.stepsTop} aria-hidden="true">
        <span className={styles.counter}>
          Step{" "}
          <span className={styles.roll}>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span key={step} className={styles.rollDigit} {...swap}>{step}</motion.span>
            </AnimatePresence>
          </span>
          {" "}of {safeTotal}
        </span>
        {label ? (
          <span className={styles.stepLabelSlot}>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span key={label} className={styles.stepLabel} {...swap}>{label}</motion.span>
            </AnimatePresence>
          </span>
        ) : null}
      </span>
      {pips ? (
        <span className={styles.pips} aria-hidden="true">
          {Array.from({ length: safeTotal }, (_, index) => (
            <span key={index} className={styles.pip} data-state={index + 1 < step ? "done" : index + 1 === step ? "current" : "todo"}><span className={styles.pipFill} /></span>
          ))}
        </span>
      ) : (
        <span className={styles.bar} aria-hidden="true"><span className={styles.barFill} style={{ transform: `scaleX(${step / safeTotal})` }} /></span>
      )}
    </span>
  );
}

/**
 * Indicators for the moments an AI is working and has nothing to show yet. One component with four variants; each variant is
 * also exported on its own (`ThinkingShimmer`, `ThinkingDots`, `ThinkingPhrases`, `ThinkingSteps`).
 */
export function LoadingStates({ variant = "shimmer", label, phrases, interval, current = 1, total = 4, className }: LoadingStatesProps) {
  if (variant === "dots") return <ThinkingDots label={label} className={className} />;
  if (variant === "phrases") return <ThinkingPhrases phrases={phrases} interval={interval} className={className} />;
  if (variant === "steps") return <ThinkingSteps current={current} total={total} label={label} className={className} />;
  return <ThinkingShimmer label={label} className={className} />;
}

export default LoadingStates;
