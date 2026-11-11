"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { SpringOptions, Transition } from "motion/react";
import { ArrowRight, Check, ChevronsRight } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./cta-buttons.module.css";

/* ------------------------------------------------------------------------------------------------------------------------------
 * ArrowButton: a pill with an accent disc at its end. On hover or keyboard focus the disc grows until it fills the whole button,
 * the label changes color exactly where the fill passes over it, and the arrow hands over to a fresh one coming in from the left.
 * ---------------------------------------------------------------------------------------------------------------------------- */

export interface ArrowButtonProps {
  /** The label. */
  children: ReactNode;
  /** Renders a link instead of a button. */
  href?: string;
  /** Link target, used with `href`. */
  target?: string;
  /** Link relationship, used with `href`. */
  rel?: string;
  /** Runs when the button is pressed. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Replaces the arrow. */
  icon?: ReactNode;
  /** Height: 44 or 50 px. */
  size?: "md" | "lg";
  /** Button type, used without `href`. */
  type?: "button" | "submit";
  /** Turns the control off: it is dimmed and ignores pointer and keyboard input. */
  disabled?: boolean;
  /** Extra class names for the root element. */
  className?: string;
}

export function ArrowButton({ children, href, target, rel, onClick, icon, size = "lg", type = "button", disabled = false, className }: ArrowButtonProps) {
  const glyph = icon ?? <ArrowRight size={18} strokeWidth={2} />;
  const classes = [styles.arrow, className].filter(Boolean).join(" ");
  const content = (
    <>
      <span className={styles.arrowRow}>
        <span className={styles.arrowLabel}>{children}</span>
        <span className={styles.arrowGap} />
      </span>
      {/* A second copy of the row in the accent colors, clipped to a circle. Growing the circle is the whole effect: the label
          under it is already in its final color, so the color change follows the edge of the fill. */}
      <span className={styles.arrowFill} aria-hidden="true">
        <span className={styles.arrowRow}>
          <span className={styles.arrowLabel}>{children}</span>
          <span className={styles.arrowDisc}>
            <span className={styles.arrowOut}>{glyph}</span>
            <span className={styles.arrowIn}>{glyph}</span>
          </span>
        </span>
      </span>
    </>
  );
  if (href && !disabled) return <a className={classes} data-size={size} href={href} target={target} rel={rel} onClick={onClick}>{content}</a>;
  return <button type={type} className={classes} data-size={size} disabled={disabled} onClick={onClick}>{content}</button>;
}

/* ------------------------------------------------------------------------------------------------------------------------------
 * MagneticButton: leans toward the cursor while it is near, and the label leans a little further than the button for depth.
 * It springs back when the cursor leaves its reach. Still for touch, pen and reduced motion.
 * ---------------------------------------------------------------------------------------------------------------------------- */

export interface MagneticButtonProps {
  /** The label. */
  children: ReactNode;
  /** Renders a link instead of a button. */
  href?: string;
  /** Runs when the button is pressed. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** How far the button follows the cursor, as a share of the cursor's distance from its center. 0 turns the pull off. */
  strength?: number;
  /** How far outside its edges, in px, the button starts to feel the cursor. */
  reach?: number;
  /** `accent` is the filled call to action; `outline` is the quiet one beside it. */
  variant?: "accent" | "outline";
  /** Button type, used without `href`. */
  type?: "button" | "submit";
  /** Turns the control off: it is dimmed and ignores pointer and keyboard input. */
  disabled?: boolean;
  /** Extra class names for the root element. */
  className?: string;
}

/** Loose enough to trail the cursor, with a small settle when it lets go. */
const pull: SpringOptions = { stiffness: 190, damping: 16, mass: 0.5 };

export function MagneticButton({ children, href, onClick, strength = 0.32, reach = 36, variant = "accent", type = "button", disabled = false, className }: MagneticButtonProps) {
  const reduce = useReducedMotion();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const x = useSpring(tx, pull);
  const y = useSpring(ty, pull);
  // The label travels a little further than its button, so the pull has depth.
  const labelX = useTransform(x, value => value * 0.35);
  const labelY = useTransform(y, value => value * 0.35);
  const still = disabled || !!reduce || strength <= 0;

  useEffect(() => {
    if (still) { tx.set(0); ty.set(0); return; }
    // Listening on the window keeps the reach around the button free of invisible elements that would swallow clicks meant for neighbors.
    const onMove = (event: PointerEvent) => {
      const anchor = anchorRef.current;
      if (!anchor || event.pointerType !== "mouse") return;
      const box = anchor.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      const inside = Math.abs(dx) <= box.width / 2 + reach && Math.abs(dy) <= box.height / 2 + reach;
      tx.set(inside ? dx * strength : 0);
      ty.set(inside ? dy * strength : 0);
    };
    const onLeave = () => { tx.set(0); ty.set(0); };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [reach, still, strength, tx, ty]);

  const classes = [styles.magnet, className].filter(Boolean).join(" ");
  const label = <motion.span className={styles.magnetLabel} style={still ? undefined : { x: labelX, y: labelY }}>{children}</motion.span>;
  const tap = still ? undefined : { scale: 0.96 };
  return (
    // The anchor holds the resting place in the layout; only the button inside it moves.
    <span ref={anchorRef} className={styles.magnetAnchor}>
      {href && !disabled
        ? <motion.a className={classes} data-variant={variant} href={href} onClick={onClick} style={still ? undefined : { x, y }} whileTap={tap} transition={motionTokens.spring.snappy}>{label}</motion.a>
        : <motion.button type={type} className={classes} data-variant={variant} disabled={disabled} onClick={onClick} style={still ? undefined : { x, y }} whileTap={tap} transition={motionTokens.spring.snappy}>{label}</motion.button>}
    </span>
  );
}

/* ------------------------------------------------------------------------------------------------------------------------------
 * SlideToConfirm: drag the thumb to the end of the track to confirm. An accent trail follows the thumb, the prompt fades as it
 * goes, and a short drag springs back. For actions that should not happen by a stray tap. Enter or Space on the thumb confirms.
 * ---------------------------------------------------------------------------------------------------------------------------- */

export interface SlideToConfirmProps {
  /** The prompt on the track, and the thumb's accessible name. */
  label?: string;
  /** Shown once the action is confirmed. */
  confirmedLabel?: string;
  /** Runs once, when the thumb is released at the end of the track or confirmed from the keyboard. */
  onConfirm?: () => void;
  /** Confirmed state (controlled). Set it back to false to return the thumb to the start. */
  confirmed?: boolean;
  /** Confirmed at first (uncontrolled). */
  defaultConfirmed?: boolean;
  /** Runs when the confirmed state changes. */
  onConfirmedChange?: (confirmed: boolean) => void;
  /** Milliseconds after which a confirmed slider resets itself. Leave out to stay confirmed. */
  resetAfter?: number;
  /** Share of the track, from 0 to 1, the thumb must cover for a release to count. */
  threshold?: number;
  /** Turns the control off: it is dimmed and ignores pointer and keyboard input. */
  disabled?: boolean;
  /** Extra class names for the root element. */
  className?: string;
}

const THUMB = 44;
const PAD = 4;
const ease = [...motionTokens.ease.standard] as [number, number, number, number];
const quick: Transition = { duration: motionTokens.duration.fast, ease };
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function SlideToConfirm({ label = "Slide to confirm", confirmedLabel = "Confirmed", onConfirm, confirmed, defaultConfirmed = false, onConfirmedChange, resetAfter, threshold = 0.9, disabled = false, className }: SlideToConfirmProps) {
  const reduce = !!useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(defaultConfirmed);
  const done = confirmed ?? internal;
  /** How far the thumb can travel, in px. */
  const [max, setMax] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragged = useRef(false);
  const x = useMotionValue(0);

  const progress = useTransform(x, value => max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0);
  const promptOpacity = useTransform(progress, value => Math.max(1 - value * 1.8, 0));
  const promptX = useTransform(progress, value => value * 28);
  // The trail runs from the start of the track to the far side of the thumb, clipped rather than resized, so it costs no layout.
  const trailEnd = useTransform(x, value => `calc(100% - ${Math.max(value, 0) + THUMB}px)`);
  const trailClip = useMotionTemplate`inset(0 ${trailEnd} 0 0 round 999px)`;
  const spring = reduce ? { duration: 0 } : motionTokens.spring.gentle;

  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setMax(Math.max(track.clientWidth - THUMB - PAD * 2, 0));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // The thumb rests at whichever end matches the state. First placement and resizes jump; state changes travel.
  const placed = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (dragging || max <= 0) return;
    const target = done ? max : 0;
    if (!placed.current) { placed.current = true; x.jump(target); return; }
    const controls = animate(x, target, spring);
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, max, dragging]);

  const setDone = useCallback((next: boolean) => {
    if (confirmed === undefined) setInternal(next);
    onConfirmedChange?.(next);
  }, [confirmed, onConfirmedChange]);

  useEffect(() => {
    if (!done || resetAfter === undefined) return;
    const timer = window.setTimeout(() => setDone(false), resetAfter);
    return () => window.clearTimeout(timer);
  }, [done, resetAfter, setDone]);

  function confirm() {
    if (done || disabled) return;
    setDone(true);
    onConfirm?.();
  }

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    if (done || disabled) return;
    // A click that ended a drag is not a click.
    if (dragged.current) { dragged.current = false; return; }
    // Keyboard and assistive tech cannot drag, so their activation confirms directly.
    if (event.detail === 0) { confirm(); return; }
    // A plain tap is the stray touch this control exists to ignore: nudge the thumb to show which way it goes.
    if (!reduce && max > 0) animate(x, [0, Math.min(26, max), 0], { duration: 0.5, ease, times: [0, 0.4, 1] });
  }

  return (
    <div ref={trackRef} className={[styles.slide, className].filter(Boolean).join(" ")} data-confirmed={done} data-dragging={dragging || undefined} data-disabled={disabled || undefined}>
      <motion.span className={styles.slideTrail} style={{ clipPath: trailClip }} aria-hidden="true" />
      <motion.span className={styles.slidePrompt} style={{ opacity: promptOpacity, x: promptX }} aria-hidden="true">{label}</motion.span>
      <AnimatePresence initial={false}>
        {done ? (
          <motion.span key="done" className={styles.slideDone} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, transition: quick }} transition={{ duration: motionTokens.duration.standard, ease, delay: reduce ? 0 : 0.08 }} aria-hidden="true">{confirmedLabel}</motion.span>
        ) : null}
      </AnimatePresence>
      <motion.button
        type="button"
        className={styles.slideThumb}
        aria-label={done ? confirmedLabel : label}
        aria-disabled={done || undefined}
        disabled={disabled}
        style={{ x }}
        drag={done || disabled || max <= 0 ? false : "x"}
        dragConstraints={{ left: 0, right: max }}
        dragElastic={0}
        dragMomentum={false}
        onPointerDown={() => { dragged.current = false; }}
        onDragStart={() => { dragged.current = true; setDragging(true); }}
        onDragEnd={() => {
          const reached = max > 0 && x.get() >= max * threshold;
          setDragging(false);
          if (reached) confirm();
        }}
        onClick={onClick}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={done ? "check" : "chevrons"} className={styles.slideIcon} initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }} transition={reduce ? quick : { ...motionTokens.spring.snappy, opacity: quick }}>
            {done ? <Check size={20} strokeWidth={2.5} aria-hidden="true" /> : <ChevronsRight size={20} strokeWidth={2.25} aria-hidden="true" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <span className={styles.srOnly} role="status">{done ? confirmedLabel : ""}</span>
    </div>
  );
}

export default ArrowButton;
