"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { FocusEvent, KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { AnimationPlaybackControls, HTMLMotionProps, MotionProps, PanInfo, TargetAndTransition, Transition, Variants } from "motion/react";
import { X } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./toast-progress.module.css";

/** `loading` shows the bar and the number; `success` and `error` are the two ways the task can end. */
export type ToastProgressStatus = "loading" | "success" | "error";

/** Why the toast closed: the success state timed out, or the person closed it (button, Escape or swipe). */
export type ToastProgressCloseReason = "timeout" | "dismiss";

/** `inline` renders where it is placed, like `Toast`. The others pin it to the bottom edge, like `ToastStack`. */
export type ToastProgressPosition = "inline" | "bottom-right" | "bottom-center" | "bottom-left";

/**
 * A toast that follows one running task, such as an upload or an export. While it runs, a bar and a number advance; when it ends, the same
 * toast morphs in place: the bar completes and folds away, the spinner becomes a drawn check and the copy swaps, or, on failure, the bar
 * freezes in the danger tone and a Retry action appears. For a result that needs no progress use `Toast`; for a pending action use `ToastAction`.
 */
export interface ToastProgressProps {
  /** What is running, or how it ended. Pass the text for the current status; the copy swaps in place when it changes. */
  title: string;
  /** Optional second line. While the task runs it may change on every tick (for example "27 of 42 MB") without replaying the swap. */
  description?: string;
  /** How far the task is, from 0 to 100. The bar and the number glide to each new value. */
  value: number;
  /** State of the task. Left out, the toast runs until `value` reaches 100 and then shows success. */
  status?: ToastProgressStatus;
  /** Glyph in the status circle while the task runs. A spinner by default. */
  icon?: ReactNode;
  /** Text beside the title while the task runs. Receives the rounded value that is on screen; by default it prints a percentage such as "64%". */
  formatValue?: (value: number) => string;
  /** Label of the action shown when the task fails. */
  retryLabel?: string;
  /** Runs when Retry is pressed. Without it the failed state has no action. Set `status` back to `"loading"` to resume. */
  onRetry?: () => void;
  /** Whether the toast is showing (controlled). */
  open?: boolean;
  /** Whether the toast starts showing when `open` is not passed. */
  defaultOpen?: boolean;
  /** Called when the toast closes itself, with the reason: `"timeout"` or `"dismiss"`. */
  onOpenChange?: (open: boolean, reason?: ToastProgressCloseReason) => void;
  /** Milliseconds the success state stays before the toast closes itself. Pass 0 or Infinity to keep it. A running or failed task never closes by itself. */
  duration?: number;
  /** Where the toast sits. `inline` stays in the flow; the bottom positions pin it to the window. */
  position?: ToastProgressPosition;
  /** With a bottom position, pins the toast inside the nearest positioned ancestor instead of the window, for panels and previews. */
  contained?: boolean;
  /** Alt+T moves focus into the toast (to Retry when it is showing). */
  hotkey?: boolean;
  /** Extra class for the toast surface. */
  className?: string;
}

const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const enterEase = [...motionTokens.ease.enter] as [number, number, number, number];
const fade: Transition = { duration: motionTokens.duration.fast, ease: standard };
const enter: Transition = { duration: motionTokens.duration.standard, ease: enterEase };
const instant: Transition = { duration: motionTokens.duration.instant };
const shownState: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" };
const fadeOnly: MotionProps = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, transition: instant }, transition: instant };
/** Copy rises in from a small blur and leaves upward, so a swap reads as one line replacing another. */
const textSwap: MotionProps = {
  initial: { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` },
  animate: shownState,
  exit: { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: fade },
  transition: enter,
};
/** Scale rides the spring; opacity and blur tween, so the blur never overshoots below zero. */
const glyphSwap: MotionProps = {
  initial: { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` },
  animate: shownState,
  exit: { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)`, transition: fade },
  transition: { ...motionTokens.spring.snappy, opacity: fade, filter: fade },
};
/** The number and the Retry action trade places beside the title with a small scale. */
const trailingSwap: MotionProps = {
  initial: { opacity: 0, scale: .9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: .9, transition: fade },
  transition: { ...motionTokens.spring.snappy, opacity: fade },
};
/** The bar leaves by thinning out where it is while the toast closes over it. */
const barSwap: MotionProps = {
  initial: { opacity: 0, scaleY: .4 },
  animate: { opacity: 1, scaleY: 1 },
  exit: { opacity: 0, scaleY: .4, transition: fade },
  transition: { ...motionTokens.spring.snappy, opacity: fade },
};
/** The last stretch to 100 before the success morph: short, so the result is not held back. */
const finish: Transition = { duration: .32, ease: standard };
/** A swipe past this distance (px) or speed (px/s) throws the toast away in that direction. */
const swipe = { distance: 80, velocity: 480 };

const subscribeNothing = () => () => {};
const subscribeVisibility = (listener: () => void) => { document.addEventListener("visibilitychange", listener); return () => document.removeEventListener("visibilitychange", listener); };
const focusVisible = (element: Element) => { try { return element.matches(":focus-visible"); } catch { return true; } };
const percent = (value: number) => `${value}%`;
const clamp = (value: number) => Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;

/** Outgoing copies are hidden from assistive tech while they fade, so the live region reads only the current text. */
function Swap(props: HTMLMotionProps<"span">) {
  const present = useIsPresent();
  return <motion.span {...props} aria-hidden={present ? props["aria-hidden"] : true} />;
}

/**
 * Follows the height of the toast content. Right after `morphKey` changes (a new status, new copy) the height springs from the old size
 * to the new one, then returns to auto so passive reflows (a resize, a font swap) follow at once. It clips only while it moves,
 * so focus rings stay whole at rest.
 */
function HeightFrame({ reduce, morphKey, children }: { reduce: boolean; morphKey: string; children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const changedAt = useRef(0);
  useLayoutEffect(() => { changedAt.current = performance.now(); }, [morphKey]);
  useEffect(() => {
    const node = content.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let last: number | undefined;
    let controls: AnimationPlaybackControls | undefined;
    const settle = () => { height.jump("auto"); frame.current?.removeAttribute("data-moving"); };
    const observer = new ResizeObserver(() => {
      const next = node.offsetHeight;
      const current = height.get();
      const from = typeof current === "number" ? current : last;
      last = next;
      controls?.stop();
      if (reduce || from === undefined || from === next || performance.now() - changedAt.current > 160) return settle();
      // The observer runs before paint, so the old height is pinned before the new content shows, then springs to the new one.
      frame.current?.setAttribute("data-moving", "true");
      height.jump(from);
      controls = animate(height, next, { ...motionTokens.spring.smooth, onComplete: settle });
    });
    observer.observe(node);
    return () => { observer.disconnect(); controls?.stop(); };
  }, [height, reduce]);
  return <motion.div ref={frame} className={styles.frame} style={{ height }}>
    <div ref={content} className={styles.content}>{children}</div>
  </motion.div>;
}

export function ToastProgress({
  title,
  description,
  value,
  status,
  icon,
  formatValue = percent,
  retryLabel = "Retry",
  onRetry,
  open,
  defaultOpen = true,
  onOpenChange,
  duration = 4000,
  position = "inline",
  contained = false,
  hotkey = true,
  className,
}: ToastProgressProps) {
  const reduce = !!useReducedMotion();
  // Toasts that mount after hydration rise in from their edge; server-rendered ones start settled.
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [enterOnMount] = useState(hydrated);
  const pageHidden = useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "hidden", () => false);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [throwX, setThrowX] = useState(0);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    // A toast that left while hovered or focused never saw the pointer or the focus go.
    if (isOpen) { setThrowX(0); setHovered(false); setFocused(false); setDragging(false); }
  }

  const goal = clamp(value);
  const target: ToastProgressStatus = status ?? (goal >= 100 ? "success" : "loading");
  /** Success waits for the bar to reach the end, so the morph starts from a full bar instead of cutting it short. */
  const [filled, setFilled] = useState(target === "success");
  if (target !== "success" && filled) setFilled(false);
  const shown: ToastProgressStatus = target === "success" && !filled && !reduce ? "loading" : target;

  /** While the bar finishes, the copy of the running state stays; the copy passed for the result shows together with the morph. */
  const finishing = target === "success" && shown === "loading";
  const [held, setHeld] = useState({ title, description });
  if (!finishing && (held.title !== title || held.description !== description)) setHeld({ title, description });
  const copy = finishing ? held : { title, description };

  const surface = useRef<HTMLDivElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /** Where keyboard focus was before it entered the toast, to hand it back when the toast leaves. */
  const returnFocus = useRef<HTMLElement | null>(null);
  const releaseVelocity = useRef(0);
  /** Whether the bar was on screen after the last commit. A bar that comes back starts at its value instead of rewinding into view. */
  const barOnScreen = useRef(false);
  // The drag offset is owned here, so a release hands its velocity straight to the spring home or to the throw.
  const x = useMotionValue(0);
  /** The value on screen. The bar and the number both read it, so they always agree. */
  const progress = useMotionValue(target === "success" ? 100 : goal);
  const fillX = useTransform(progress, current => `${current - 100}%`);
  const valueText = useTransform(progress, current => formatValue(Math.round(current)));

  const timed = Number.isFinite(duration) && duration > 0;
  const paused = hovered || focused || dragging || pageHidden;

  function close(reason: ToastProgressCloseReason, to = 0) {
    const node = surface.current;
    const active = document.activeElement;
    if (node && active instanceof HTMLElement && node.contains(active) && focusVisible(active) && returnFocus.current?.isConnected) returnFocus.current.focus();
    setThrowX(to);
    if (open === undefined) setInternalOpen(false);
    onOpenChange?.(false, reason);
  }
  const closeLatest = useRef(close);
  useEffect(() => { closeLatest.current = close; });

  useEffect(() => {
    const wasOnScreen = barOnScreen.current;
    barOnScreen.current = isOpen && shown !== "success";
    const to = target === "success" ? 100 : goal;
    if (reduce || !wasOnScreen) {
      progress.jump(to);
      if (target === "success") setFilled(true);
      return;
    }
    const controls = animate(progress, to, target === "success" ? { ...finish, onComplete: () => setFilled(true) } : motionTokens.spring.smooth);
    return () => controls.stop();
  }, [goal, isOpen, progress, reduce, shown, target]);

  // Success closes by itself; holding the toast (hover, focus, a hidden tab) starts the wait over when it is released.
  useEffect(() => {
    if (!isOpen || shown !== "success" || paused || !timed) return;
    const timer = window.setTimeout(() => closeLatest.current("timeout"), duration);
    return () => window.clearTimeout(timer);
  }, [isOpen, shown, paused, timed, duration]);

  useEffect(() => {
    if (!hotkey || !isOpen) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (!event.altKey || event.metaKey || event.ctrlKey || event.code !== "KeyT") return;
      const to = retryRef.current ?? closeRef.current;
      if (!to) return;
      event.preventDefault();
      // Browsers skip the focus ring after a modifier shortcut, so the hotkey asks for it.
      to.focus({ focusVisible: true } as FocusOptions);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hotkey, isOpen]);

  function retry() {
    // Retry leaves as the task resumes, so keyboard focus moves to the close button instead of falling back to the page.
    if (retryRef.current && focusVisible(retryRef.current)) closeRef.current?.focus();
    onRetry?.();
  }

  function onFocus(event: FocusEvent<HTMLDivElement>) {
    const from = event.relatedTarget;
    if (!(from instanceof Node) || !event.currentTarget.contains(from)) returnFocus.current = from instanceof HTMLElement ? from : null;
    setFocused(true);
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    close("dismiss");
  }

  function onDragEnd(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    setDragging(false);
    // A short swipe springs home with its release velocity instead of drifting back.
    if (Math.abs(info.offset.x) < swipe.distance && Math.abs(info.velocity.x) < swipe.velocity) {
      animate(x, 0, { ...motionTokens.spring.snappy, velocity: info.velocity.x });
      return;
    }
    releaseVelocity.current = info.velocity.x;
    close("dismiss", Math.sign(info.offset.x || info.velocity.x) * ((surface.current?.offsetWidth ?? 320) + 48));
  }

  const variants: Variants = reduce ? {
    hidden: { opacity: 0 },
    shown: { opacity: 1, transition: instant },
    exit: { opacity: 0, transition: instant },
  } : {
    // x resets because the drag value outlives a thrown toast; the next one must rise from the center.
    hidden: { opacity: 0, x: 0, y: 16, scale: .96 },
    shown: { opacity: 1, x: 0, y: 0, scale: 1, transition: { ...motionTokens.spring.morph, opacity: enter } },
    // A thrown toast keeps its release velocity; a closed one sinks back toward the edge it came from.
    exit: (to: number) => to
      ? { x: to, opacity: 0, transition: { x: { type: "spring", visualDuration: .3, bounce: 0, velocity: releaseVelocity.current, restDelta: 2, restSpeed: 40 }, opacity: { duration: motionTokens.duration.exit } } }
      : { opacity: 0, y: 8, scale: .97, transition: { duration: motionTokens.duration.exit, ease: standard } },
  };
  const text = reduce ? fadeOnly : textSwap;
  const glyph = reduce ? fadeOnly : glyphSwap;
  const trailing = reduce ? fadeOnly : trailingSwap;
  const draw = { initial: reduce ? false : { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: motionTokens.duration.standard, ease: enterEase, delay: .1 } } as const;
  const classes = [styles.toast, position !== "inline" && styles[position], position !== "inline" && contained && styles.contained, className].filter(Boolean).join(" ");

  return (
    <AnimatePresence initial={enterOnMount} custom={throwX}>
      {isOpen ? <motion.div
        key="toast"
        ref={surface}
        className={classes}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-status={shown}
        custom={throwX}
        variants={variants}
        initial="hidden"
        animate="shown"
        exit="exit"
        style={{ x }}
        // Drag writes touch-action into the markup, so the reduced motion switch waits for hydration to keep server and client in step.
        drag={reduce && hydrated ? false : "x"}
        dragMomentum={false}
        onDragStart={() => setDragging(true)}
        onDragEnd={onDragEnd}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onPointerCancel={() => setHovered(false)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      >
        <HeightFrame reduce={reduce} morphKey={`${shown}\n${copy.title}`}>
          {/* The status circle morphs with the task: the spinner shrinks into a blur and a check (or an exclamation mark) draws itself in its place. */}
          <span className={styles.icon} aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              {shown === "loading" ? <Swap key="loading" className={styles.glyph} {...glyph}>{icon ?? <span className={styles.spinner} />}</Swap> : <Swap key={shown} className={styles.glyph} {...glyph}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
                  {shown === "success" ? <motion.path d="M4 12.5l5 5L20 6.5" {...draw} /> : <><motion.path d="M12 5.5v8" {...draw} /><motion.path d="M12 18.5v.01" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: motionTokens.duration.fast, delay: .28 }} /></>}
                </svg>
              </Swap>}
            </AnimatePresence>
          </span>
          <div className={styles.copy}>
            <strong className={styles.title}><AnimatePresence mode="popLayout" initial={false}><Swap key={copy.title} className={styles.line} {...text}>{copy.title}</Swap></AnimatePresence></strong>
            {/* Keyed by status, not by text: a description that ticks while the task runs updates in place, silently, and swaps only when the task ends. */}
            <AnimatePresence mode="popLayout" initial={false}>{copy.description ? <Swap key={`${shown}\n${copy.title}`} className={styles.description} aria-live={shown === "loading" ? "off" : undefined} {...text}>{copy.description}</Swap> : null}</AnimatePresence>
          </div>
          {/* The number while it runs, Retry when it fails, nothing once it succeeds. Each leaves the flow at once and fades where it stood. */}
          <AnimatePresence mode="popLayout" initial={false}>
            {shown === "loading" ? <motion.span key="value" className={styles.value} aria-hidden="true" {...trailing}><motion.span>{valueText}</motion.span></motion.span> : null}
            {shown === "error" && onRetry ? <motion.div key="retry" className={styles.retrySlot} {...trailing}>
              <button ref={retryRef} type="button" className={styles.retry} onClick={retry}>{retryLabel}</button>
            </motion.div> : null}
          </AnimatePresence>
          <button ref={closeRef} type="button" className={styles.close} aria-label="Dismiss notification" onClick={() => close("dismiss")}>
            <X width={16} height={16} strokeWidth={2} aria-hidden="true" />
          </button>
          <AnimatePresence mode="popLayout" initial={false}>
            {shown === "success" ? null : <motion.div key="bar" className={styles.barRow} {...(reduce ? fadeOnly : barSwap)}>
              <div className={styles.track} role="progressbar" aria-label={copy.title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(goal)} aria-valuetext={formatValue(Math.round(goal))}>
                <motion.span className={styles.fill} style={{ x: fillX }} />
              </div>
            </motion.div>}
          </AnimatePresence>
        </HeightFrame>
      </motion.div> : null}
    </AnimatePresence>
  );
}

export default ToastProgress;
