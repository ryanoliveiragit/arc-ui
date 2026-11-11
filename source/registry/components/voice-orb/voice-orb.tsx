"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, isMotionValue, motion, useAnimationFrame, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./voice-orb.module.css";

export type VoiceOrbState = "idle" | "listening" | "thinking" | "speaking";

/**
 * The face of a voice assistant. One orb shows who has the floor: it rests when idle, opens outlined rings while it listens,
 * spins an arc while it thinks and fills with the accent while it speaks. Rings and the five bars follow `level`.
 */
export interface VoiceOrbProps {
  /** Who has the floor. Drives the colors, the rings and how the bars move. */
  state?: VoiceOrbState;
  /** Loudness from 0 to 1 (microphone while listening, playback while speaking). Pass a motion value to update it every frame without re-rendering. */
  level?: number | MotionValue<number>;
  /** Diameter of the whole orb, rings included, in pixels. */
  size?: number;
  /** Accessible name of the orb. The current state is announced after it. */
  label?: string;
  /** Shows the state caption under the orb. When false the state is still announced to assistive technology. */
  showLabel?: boolean;
  /** Caption per state, to translate or reword the defaults. */
  stateLabels?: Partial<Record<VoiceOrbState, string>>;
  /** Makes the orb a button, for example to start listening or to interrupt the answer. */
  onPress?: () => void;
  /** Extra class for the root element. */
  className?: string;
}

const defaultLabels: Record<VoiceOrbState, string> = { idle: "Tap to talk", listening: "Listening", thinking: "Thinking", speaking: "Speaking" };
/** A bar at rest is as tall as it is wide, so it reads as a dot. Keep in sync with the bar size in voice-orb.module.css. */
const REST = 0.175;
/** Bars are trimmed from both ends with a rounded clip instead of being scaled, so their caps stay round at every height. */
const trim = (amount: number) => `inset(${((1 - amount) * 50).toFixed(2)}% 0 round 999px)`;
/** The middle bar moves the most, like a voice spectrum. */
const envelope = [0.5, 0.82, 1, 0.74, 0.44];
/** Each bar wobbles at its own pace, so one level value never looks like five copies of the same bar. */
const paces = [7.3, 9.1, 6.2, 8.4, 10.3];
const rings = [0, 1, 2];
const clamp = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
const enterEase = [...motionTokens.ease.enter] as [number, number, number, number];

function barTarget(state: VoiceOrbState, index: number, level: number, seconds: number) {
  if (state === "idle") return REST;
  if (state === "thinking") return REST + 0.3 * (0.5 + 0.5 * Math.sin(seconds * 5.4 - index * 0.95));
  const wobble = 0.64 + 0.36 * Math.sin(seconds * paces[index]! + index * 1.7);
  const gain = state === "speaking" ? 1 : 0.85;
  // Loudness is heard on a curve, so quiet speech still moves the bars visibly.
  return REST + (1 - REST) * envelope[index]! * Math.pow(level, 0.6) * wobble * gain;
}

/** Reduced motion: one still shape per state instead of a moving waveform. */
const stillBar = (state: VoiceOrbState, index: number) => state === "idle" ? REST : REST + (1 - REST) * envelope[index]! * (state === "thinking" ? 0.3 : 0.62);

function Bar({ index, level, state, reduce }: { index: number; level: MotionValue<number>; state: VoiceOrbState; reduce: boolean }) {
  const amount = useMotionValue(reduce ? stillBar(state, index) : REST);
  const clipPath = useTransform(amount, trim);
  const current = useRef(state);
  current.current = state;
  // The bar eases toward its target every frame, so a state change or a jump in level never snaps.
  useAnimationFrame((time, delta) => {
    if (reduce) return;
    const target = barTarget(current.current, index, clamp(level.get()), time / 1000);
    const from = amount.get();
    amount.set(from + (target - from) * (1 - Math.exp(-Math.min(delta, 64) / 70)));
  });
  useEffect(() => { if (reduce) amount.set(stillBar(state, index)); }, [amount, index, reduce, state]);
  return <motion.span className={styles.bar} style={{ clipPath }} />;
}

function Ring({ index, level, reduce }: { index: number; level: MotionValue<number>; reduce: boolean }) {
  // Outer rings follow more loosely, so a peak travels outward like a ripple.
  const follow = useSpring(level, { stiffness: 300 - index * 85, damping: 22 + index * 5, mass: 0.7 });
  const reach = 0.16 + index * 0.2;
  const scale = useTransform(follow, value => 1 + reach * (0.25 + 0.75 * clamp(value)));
  const opacity = useTransform(follow, value => (1 - index * 0.24) * (0.3 + 0.7 * clamp(value)));
  return <span className={styles.ringSlot}><motion.span className={styles.ring} style={reduce ? { scale: 1 + reach * 0.6, opacity: 0.75 - index * 0.2 } : { scale, opacity }} /></span>;
}

export function VoiceOrb({ state = "idle", level = 0, size = 176, label = "Voice assistant", showLabel = true, stateLabels, onPress, className }: VoiceOrbProps) {
  const reduce = !!useReducedMotion();
  const own = useMotionValue(typeof level === "number" ? clamp(level) : 0);
  useEffect(() => { if (typeof level === "number") own.set(clamp(level)); }, [level, own]);
  const source = isMotionValue(level) ? level : own;
  const pulse = useSpring(source, { stiffness: 320, damping: 26 });
  const coreScale = useTransform(pulse, value => state === "speaking" ? 1 + 0.07 * clamp(value) : state === "listening" ? 1 + 0.03 * clamp(value) : 1);
  const text = { ...defaultLabels, ...stateLabels }[state];

  const orb = (
    <span className={styles.orb} data-state={state} style={{ "--orb-size": `${size}px` } as CSSProperties}>
      {rings.map(index => <Ring key={index} index={index} level={source} reduce={reduce} />)}
      <AnimatePresence>
        {state === "thinking" ? (
          <motion.span key="arc" className={styles.arcSlot} initial={{ opacity: 0, scale: reduce ? 1 : 0.86 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduce ? 1 : 0.92 }} transition={reduce ? { duration: motionTokens.duration.fast } : { ...motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard } }}>
            <svg className={styles.arc} viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="34" /></svg>
          </motion.span>
        ) : null}
      </AnimatePresence>
      <motion.span className={styles.core} style={reduce ? undefined : { scale: coreScale }}>
        <span className={styles.fill}>
          <span className={styles.bars} aria-hidden="true">
            {envelope.map((_, index) => <Bar key={index} index={index} level={source} state={state} reduce={reduce} />)}
          </span>
        </span>
      </motion.span>
    </span>
  );

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      {onPress
        ? <button type="button" className={styles.press} aria-label={label} onClick={onPress}>{orb}</button>
        : <span className={styles.still} role="img" aria-label={label}>{orb}</span>}
      <span className={showLabel ? styles.caption : styles.srOnly} role="status">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={state} className={styles.captionText} initial={reduce ? { opacity: 0 } : { opacity: 0, y: "0.45em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-0.45em", filter: `blur(${motionTokens.blur.subtle}px)` }} transition={{ duration: motionTokens.duration.standard, ease: enterEase }}>{text}</motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

export default VoiceOrb;
