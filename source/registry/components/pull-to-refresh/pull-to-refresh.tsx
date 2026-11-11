"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { ArrowDown, Check } from "lucide-react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { MotionProps } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./pull-to-refresh.module.css";

/**
 * A scroll container that refreshes when it is dragged down from the top, with a finger or the mouse. The content follows the pull with
 * growing resistance, the indicator stretches into a capsule past the threshold, spins while the refresh runs, confirms, and settles back.
 * A "Refresh" button that appears on keyboard focus does the same without the gesture.
 */
export interface PullToRefreshProps {
  /** Runs when a pull is released past the threshold. Return a promise: the indicator spins until it settles. */
  onRefresh: () => Promise<unknown> | void;
  /** The scrolling content. */
  children: ReactNode;
  /** Shows the refreshing state from outside, for a refresh that did not start with a pull (a button, a timer). */
  refreshing?: boolean;
  /** Pull distance in pixels at which releasing starts a refresh. */
  threshold?: number;
  /** The farthest the content can travel, in pixels. Resistance grows toward it. */
  maxPull?: number;
  /** Turns the gesture off; the content still scrolls. */
  disabled?: boolean;
  /** Height of the scroll area, as a number of pixels or any CSS length. Defaults to filling its parent. */
  height?: number | string;
  /** Accessible name of the scroll region. */
  label?: string;
  /** Text of the keyboard refresh button. */
  refreshLabel?: string;
  /** Extra class for the outer element. */
  className?: string;
}

type Phase = "idle" | "pulling" | "armed" | "refreshing" | "done";
interface Gesture { startX: number; startY: number; active: boolean; }

/** Diameter of the indicator at rest. Keep in sync with pull-to-refresh.module.css. */
const SIZE = 36;
/** How long the confirmation shows before everything settles. */
const DONE_MS = 650;
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const swap: MotionProps = {
  initial: { opacity: 0, scale: .5 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: .5, transition: { duration: motionTokens.duration.instant } },
  transition: motionTokens.spring.snappy,
};
const swapStill: MotionProps = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: motionTokens.duration.instant } };

export function PullToRefresh({ onRefresh, children, refreshing, threshold = 72, maxPull = 150, disabled = false, height, label = "Content", refreshLabel = "Refresh", className }: PullToRefreshProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pending, setPending] = useState(false);
  const phaseRef = useRef<Phase>("idle");
  const gesture = useRef<Gesture | null>(null);
  const dragged = useRef(false);
  const mounted = useRef(true);
  const busy = pending || !!refreshing;
  /** Where the content rests while the refresh runs. */
  const hold = Math.min(56, threshold);

  // One motion value, the pull distance, drives the content and every part of the indicator.
  const pull = useMotionValue(0);
  const capsule = useTransform(pull, (value: number) => SIZE + Math.max(0, value - threshold) * .85);
  const indicatorY = useTransform(pull, (value: number) => value / 2 - (SIZE + Math.max(0, value - threshold) * .85) / 2);
  const indicatorOpacity = useTransform(pull, (value: number) => clamp((value - 18) / 20));
  const indicatorScale = useTransform(pull, (value: number) => .6 + .4 * clamp(value / hold));
  const arrowTurn = useTransform(pull, (value: number) => clamp((value - threshold * .5) / (threshold * .5)) * 180);

  const go = useCallback((next: Phase) => { phaseRef.current = next; setPhase(next); }, []);
  const glide = useCallback((to: number) => {
    pull.stop();
    if (reduce) { pull.jump(to); return Promise.resolve(); }
    return new Promise<void>(resolve => { animate(pull, to, motionTokens.spring.smooth).then(() => resolve()); });
  }, [pull, reduce]);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  // Busy holds the content open under the spinner; when it ends the check shows, then everything settles.
  const wasBusy = useRef(false);
  useEffect(() => {
    if (busy) { wasBusy.current = true; go("refreshing"); void glide(hold); return; }
    if (!wasBusy.current) return;
    wasBusy.current = false;
    go("done");
    const timer = window.setTimeout(() => { void glide(0).then(() => { if (mounted.current && phaseRef.current === "done") go("idle"); }); }, DONE_MS);
    return () => window.clearTimeout(timer);
  }, [busy, glide, go, hold]);

  const start = useCallback(() => {
    if (phaseRef.current === "refreshing") return;
    setPending(true);
    const finish = () => { if (mounted.current) setPending(false); };
    let result: Promise<unknown> | void;
    try { result = onRefresh(); } catch { finish(); return; }
    // A handler that returns nothing still gets a short spin, so the gesture always has an answer.
    if (result && typeof result.then === "function") result.then(finish, finish);
    else window.setTimeout(finish, 600);
  }, [onRefresh]);

  const begin = useCallback((x: number, y: number) => {
    dragged.current = false;
    if (disabled || phaseRef.current !== "idle" || (scrollerRef.current?.scrollTop ?? 0) > 0) return;
    gesture.current = { startX: x, startY: y, active: false };
  }, [disabled]);

  /** Returns true once the gesture is a pull, so the caller can stop the browser from scrolling or selecting. */
  const move = useCallback((x: number, y: number) => {
    const current = gesture.current;
    if (!current) return false;
    if (!current.active) {
      const dx = x - current.startX, dy = y - current.startY;
      if (dy < -4 || (scrollerRef.current?.scrollTop ?? 0) > 0) { gesture.current = null; return false; }
      if (dy < 8 || Math.abs(dx) > dy) return false;
      // Start following from here, so crossing the slop never makes the content jump.
      current.active = true;
      current.startY = y;
      dragged.current = true;
      if (rootRef.current) rootRef.current.dataset.dragging = "";
      window.getSelection()?.removeAllRanges();
      pull.stop();
    }
    const distance = Math.max(0, y - current.startY);
    // 1:1 at first, then more and more resistance toward maxPull.
    const next = maxPull * (1 - Math.exp(-distance / maxPull));
    pull.set(next);
    const nextPhase: Phase = next >= threshold ? "armed" : "pulling";
    if (phaseRef.current !== nextPhase) go(nextPhase);
    return true;
  }, [go, maxPull, pull, threshold]);

  const end = useCallback((cancelled: boolean) => {
    const current = gesture.current;
    gesture.current = null;
    if (!current?.active) return;
    if (rootRef.current) delete rootRef.current.dataset.dragging;
    if (!cancelled && phaseRef.current === "armed") { start(); return; }
    go("idle");
    void glide(0);
  }, [glide, go, start]);

  // Touch needs a non-passive listener: once the pull begins, the browser must not scroll or run its own page refresh.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onStart = (event: TouchEvent) => { const touch = event.touches[0]; if (touch && event.touches.length === 1) begin(touch.clientX, touch.clientY); };
    const onMove = (event: TouchEvent) => { const touch = event.touches[0]; if (touch && move(touch.clientX, touch.clientY) && event.cancelable) event.preventDefault(); };
    const onEnd = () => end(false);
    const onCancel = () => end(true);
    scroller.addEventListener("touchstart", onStart, { passive: true });
    scroller.addEventListener("touchmove", onMove, { passive: false });
    scroller.addEventListener("touchend", onEnd);
    scroller.addEventListener("touchcancel", onCancel);
    return () => {
      scroller.removeEventListener("touchstart", onStart);
      scroller.removeEventListener("touchmove", onMove);
      scroller.removeEventListener("touchend", onEnd);
      scroller.removeEventListener("touchcancel", onCancel);
    };
  }, [begin, end, move]);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || event.button !== 0) return;
    begin(event.clientX, event.clientY);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || !gesture.current) return;
    const wasActive = gesture.current.active;
    if (move(event.clientX, event.clientY) && !wasActive) event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) {
    if (event.pointerType !== "touch") end(cancelled);
  }

  // The click that ends a mouse drag belongs to the pull, not to whatever was under the pointer.
  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!dragged.current) return;
    dragged.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  const icon = reduce ? swapStill : swap;
  const style = height === undefined ? undefined : ({ "--ptr-height": typeof height === "number" ? `${height}px` : height } as CSSProperties);
  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} style={style} data-phase={phase}>
      <button type="button" className={styles.refreshButton} disabled={disabled} aria-disabled={busy || undefined} onClick={() => { if (!busy) start(); }}>{refreshLabel}</button>
      <motion.div className={styles.indicator} style={{ y: indicatorY, opacity: indicatorOpacity, scale: indicatorScale }} aria-hidden="true">
        <motion.div className={styles.capsule} style={{ height: capsule }}>
          <AnimatePresence mode="popLayout" initial={false}>
            {phase === "refreshing" ? <motion.span key="spinner" className={styles.glyph} {...icon}><span className={styles.spinner} /></motion.span>
              : phase === "done" ? <motion.span key="check" className={styles.glyph} {...icon}><Check size={18} strokeWidth={2.25} /></motion.span>
              : <motion.span key="arrow" className={styles.glyph} {...icon}><motion.span className={styles.arrow} style={{ rotate: arrowTurn }}><ArrowDown size={18} strokeWidth={2} /></motion.span></motion.span>}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <div ref={scrollerRef} className={styles.scroller} role="region" aria-label={label} aria-busy={busy} tabIndex={0} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={event => onPointerEnd(event, false)} onPointerCancel={event => onPointerEnd(event, true)} onClickCapture={onClickCapture}>
        <motion.div className={styles.content} style={{ y: pull }}>{children}</motion.div>
      </div>
      <span className={styles.srOnly} role="status" aria-live="polite">{phase === "refreshing" ? "Refreshing" : phase === "done" ? "Updated" : ""}</span>
    </div>
  );
}

export default PullToRefresh;
