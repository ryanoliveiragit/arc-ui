"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { FocusEvent, KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { AnimationPlaybackControls, HTMLMotionProps, MotionProps, PanInfo, TargetAndTransition, Transition, Variants } from "motion/react";
import { Info, X } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./toast-action.module.css";

/** Why the toast closed: the countdown ran out, the person closed it (button, Escape or swipe), or the action was taken. */
export type ToastActionCloseReason = "timeout" | "dismiss" | "action";

/** `inline` renders where it is placed, like `Toast`. The others pin it to the bottom edge, like `ToastStack`. */
export type ToastActionPosition = "inline" | "bottom-right" | "bottom-center" | "bottom-left";

/**
 * A toast with one action and a visible deadline. Use it right after something reversible (delete, archive, send): a thin bar drains
 * until the toast leaves by itself, hovering or focusing the toast holds the countdown, and taking the action swaps the copy for a
 * short confirmation before it leaves. For a plain confirmation use `Toast`; for several at once use `ToastStack`.
 */
export interface ToastActionProps {
  /** What just happened, in a few words. Changing the title or description while the toast is open swaps the copy in place and restarts the countdown. */
  title: string;
  /** Optional second line with the detail. */
  description?: string;
  /** Identifies the event the toast is about. A new value while the toast is open starts it over (action back, countdown full) even when the copy is the same, for example when the same file is deleted twice. */
  resetKey?: string | number;
  /** Glyph in the status circle before the action is taken, for example a trash icon at 16px. */
  icon?: ReactNode;
  /** Label of the single action. */
  actionLabel?: string;
  /** Runs when the action is taken. The toast then shows the confirmation and leaves by itself. */
  onAction?: () => void;
  /** Title shown after the action is taken. */
  confirmation?: string;
  /** Optional second line of the confirmation. */
  confirmationDescription?: string;
  /** Milliseconds the confirmation stays before the toast leaves. */
  confirmationDuration?: number;
  /** Whether the toast is showing (controlled). */
  open?: boolean;
  /** Whether the toast starts showing when `open` is not passed. */
  defaultOpen?: boolean;
  /** Called when the toast closes itself, with the reason: `"timeout"`, `"dismiss"`, or `"action"` whenever the action was taken first. */
  onOpenChange?: (open: boolean, reason?: ToastActionCloseReason) => void;
  /** Milliseconds of countdown before the toast closes itself. Pass 0 or Infinity to keep it until it is closed; the bar is then hidden. */
  duration?: number;
  /** Where the toast sits. `inline` stays in the flow; the bottom positions pin it to the window. */
  position?: ToastActionPosition;
  /** With a bottom position, pins the toast inside the nearest positioned ancestor instead of the window, for panels and previews. */
  contained?: boolean;
  /** Alt+T moves focus to the action, so keyboard users can reach it before the countdown ends. */
  hotkey?: boolean;
  /** Extra class for the toast surface. */
  className?: string;
}

type Phase = "idle" | "confirmed";

const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const enterEase = [...motionTokens.ease.enter] as [number, number, number, number];
const fade: Transition = { duration: motionTokens.duration.fast, ease: standard };
const enter: Transition = { duration: motionTokens.duration.standard, ease: enterEase };
const instant: Transition = { duration: motionTokens.duration.instant };
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" };
const fadeOnly: MotionProps = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, transition: instant }, transition: instant };
/** Copy rises in from a small blur and leaves upward, so a swap reads as one line replacing another. */
const textSwap: MotionProps = {
  initial: { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` },
  animate: shown,
  exit: { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: fade },
  transition: enter,
};
/** Scale rides the spring; opacity and blur tween, so the blur never overshoots below zero. */
const glyphSwap: MotionProps = {
  initial: { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` },
  animate: shown,
  exit: { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)`, transition: fade },
  transition: { ...motionTokens.spring.snappy, opacity: fade, filter: fade },
};
/** The action is a control, so it barely scales as it comes and goes. */
const actionSwap: MotionProps = {
  initial: { opacity: 0, scale: .9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: .9, transition: fade },
  transition: { ...motionTokens.spring.snappy, opacity: fade },
};
/** A swipe past this distance (px) or speed (px/s) throws the toast away in that direction. */
const swipe = { distance: 80, velocity: 480 };
/** Under reduced motion the bar steps down in this many notches instead of sliding. */
const NOTCHES = 8;

const subscribeNothing = () => () => {};
const subscribeVisibility = (listener: () => void) => { document.addEventListener("visibilitychange", listener); return () => document.removeEventListener("visibilitychange", listener); };
const focusVisible = (element: Element) => { try { return element.matches(":focus-visible"); } catch { return true; } };

/** Outgoing copies are hidden from assistive tech while they fade, so the live region reads only the current text. */
function Swap(props: HTMLMotionProps<"span">) {
  const present = useIsPresent();
  return <motion.span {...props} aria-hidden={present ? props["aria-hidden"] : true} />;
}

/**
 * Follows the height of the toast content. Right after `morphKey` changes (new copy, the action leaving) the height springs from the old
 * size to the new one, then returns to auto so passive reflows (a resize, a font swap) follow at once. It clips only while it moves,
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

export function ToastAction({
  title,
  description,
  resetKey,
  icon,
  actionLabel = "Undo",
  onAction,
  confirmation = "Action undone",
  confirmationDescription,
  confirmationDuration = 1800,
  open,
  defaultOpen = true,
  onOpenChange,
  duration = 6000,
  position = "inline",
  contained = false,
  hotkey = true,
  className,
}: ToastActionProps) {
  const reduce = !!useReducedMotion();
  // Toasts that mount after hydration rise in from their edge; server-rendered ones start settled.
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [enterOnMount] = useState(hydrated);
  const pageHidden = useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "hidden", () => false);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const [phase, setPhase] = useState<Phase>("idle");
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [throwX, setThrowX] = useState(0);
  /** Bumped whenever the countdown must start over: the toast opened again or its copy changed. */
  const [cycle, setCycle] = useState(0);
  const contentKey = `${resetKey ?? ""}\n${title}\n${description ?? ""}`;
  const [seen, setSeen] = useState({ open: isOpen, key: contentKey });
  if (seen.open !== isOpen || seen.key !== contentKey) {
    if (isOpen) {
      setPhase("idle");
      setThrowX(0);
      setCycle(count => count + 1);
      // A toast that left while hovered or focused never saw the pointer or the focus go.
      if (!seen.open) { setHovered(false); setFocused(false); setDragging(false); }
    }
    setSeen({ open: isOpen, key: contentKey });
  }

  const surface = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /** Where keyboard focus was before it entered the toast, to hand it back when the toast leaves. */
  const returnFocus = useRef<HTMLElement | null>(null);
  const releaseVelocity = useRef(0);
  // The drag offset is owned here, so a release hands its velocity straight to the spring home or to the throw.
  const x = useMotionValue(0);
  /** Share of the countdown that is left, from 1 to 0. The bar and the timeout both read this one value, so they cannot drift apart. */
  const remaining = useMotionValue(1);
  const barX = useTransform(remaining, value => `${((reduce ? Math.ceil(value * NOTCHES) / NOTCHES : value) - 1) * 100}%`);

  const timed = Number.isFinite(duration) && duration > 0;
  const confirmed = phase === "confirmed";
  const paused = hovered || focused || dragging || pageHidden;
  const running = isOpen && timed && !confirmed && !paused;

  function close(reason: ToastActionCloseReason, to = 0) {
    const node = surface.current;
    const active = document.activeElement;
    if (node && active instanceof HTMLElement && node.contains(active) && focusVisible(active) && returnFocus.current?.isConnected) returnFocus.current.focus();
    setThrowX(to);
    if (open === undefined) setInternalOpen(false);
    // Once the action is taken the reason stays "action", however the confirmation is closed.
    onOpenChange?.(false, confirmed ? "action" : reason);
  }
  const closeLatest = useRef(close);
  useEffect(() => { closeLatest.current = close; });

  // Refill the bar before the countdown effect below starts it again.
  useLayoutEffect(() => { remaining.jump(1); }, [cycle, remaining]);
  // Pausing stops the drain where it is; resuming continues with the time that was left.
  useEffect(() => {
    if (!running) return;
    const controls = animate(remaining, 0, { duration: remaining.get() * duration / 1000, ease: "linear", onComplete: () => closeLatest.current("timeout") });
    return () => controls.stop();
  }, [running, cycle, duration, remaining]);
  // The confirmation is short and never pauses: the pointer is still on the toast right after the click.
  useEffect(() => {
    if (!isOpen || !confirmed) return;
    const timer = window.setTimeout(() => closeLatest.current("action"), confirmationDuration);
    return () => window.clearTimeout(timer);
  }, [isOpen, confirmed, confirmationDuration]);

  useEffect(() => {
    if (!hotkey || !isOpen) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (!event.altKey || event.metaKey || event.ctrlKey || event.code !== "KeyT") return;
      const target = actionRef.current ?? closeRef.current;
      if (!target) return;
      event.preventDefault();
      // Browsers skip the focus ring after a modifier shortcut, so the hotkey asks for it.
      target.focus({ focusVisible: true } as FocusOptions);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hotkey, isOpen]);

  function takeAction() {
    if (confirmed) return;
    // The action folds away, so keyboard focus moves to the close button instead of falling back to the page.
    if (actionRef.current && focusVisible(actionRef.current)) closeRef.current?.focus();
    onAction?.();
    setPhase("confirmed");
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
  const shownTitle = confirmed ? confirmation : title;
  const shownDescription = confirmed ? confirmationDescription : description;
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
        data-phase={phase}
        data-paused={paused}
        data-timed={timed}
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
        <HeightFrame reduce={reduce} morphKey={`${phase}\n${contentKey}`}>
          {/* Taking the action morphs the circle: the glyph shrinks into a blur and a check draws itself in its place. */}
          <span className={styles.icon} aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              {confirmed ? <Swap key="check" className={styles.glyph} {...glyph}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
                  <motion.path d="M4 12.5l5 5L20 6.5" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: motionTokens.duration.standard, ease: enterEase, delay: .1 }} />
                </svg>
              </Swap> : <Swap key="icon" className={styles.glyph} {...glyph}>{icon ?? <Info width={16} height={16} strokeWidth={2} />}</Swap>}
            </AnimatePresence>
          </span>
          <div className={styles.copy}>
            <strong className={styles.title}><AnimatePresence mode="popLayout" initial={false}><Swap key={shownTitle} className={styles.line} {...text}>{shownTitle}</Swap></AnimatePresence></strong>
            <AnimatePresence mode="popLayout" initial={false}>{shownDescription ? <Swap key={shownDescription} className={styles.description} {...text}>{shownDescription}</Swap> : null}</AnimatePresence>
          </div>
          {/* Once taken, the action leaves the flow at once and fades where it stood, so the confirmation is laid out at its final width from the first frame. */}
          <AnimatePresence mode="popLayout" initial={false}>
            {confirmed ? null : <motion.div key="action" className={styles.actionSlot} {...(reduce ? fadeOnly : actionSwap)}>
              <button ref={actionRef} type="button" className={styles.action} onClick={takeAction}>{actionLabel}</button>
            </motion.div>}
          </AnimatePresence>
          <button ref={closeRef} type="button" className={styles.close} aria-label="Dismiss notification" onClick={() => close("dismiss")}>
            <X width={16} height={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </HeightFrame>
        {/* The countdown: the fill slides out to the left as time runs out, and dims while the toast is held. */}
        <span className={styles.timer} aria-hidden="true"><motion.span className={styles.timerFill} style={{ x: barX }} /></span>
      </motion.div> : null}
    </AnimatePresence>
  );
}

export default ToastAction;
