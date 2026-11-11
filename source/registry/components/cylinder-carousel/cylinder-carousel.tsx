"use client";

import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { AnimationPlaybackControls, MotionValue, Transition } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./cylinder-carousel.module.css";

/**
 * Cards standing around a cylinder that you turn: drag it and let go, use the arrows, or press the arrow keys. It always comes
 * to rest with one card facing you. Cards turn away with real perspective and dim as they go, and the ones at the back are hidden.
 */
export interface CylinderCarouselProps {
  /** One card per child. Three or more make a proper cylinder. */
  children: ReactNode;
  /** Index of the card facing the viewer (controlled). */
  value?: number;
  /** Index of the card facing the viewer at first when uncontrolled. */
  defaultValue?: number;
  /** Called with the index of the card that the cylinder settles on. */
  onValueChange?: (index: number) => void;
  /** Card width in px. It shrinks to fit narrow containers. */
  cardWidth?: number;
  /** Card height in px at full width; it scales with the card's width. */
  cardHeight?: number;
  /** Space in px between neighboring cards, measured along the cylinder. */
  gap?: number;
  /** Viewing distance in px. Smaller values exaggerate the depth. */
  perspective?: number;
  /** Shows the previous and next buttons and the position counter. */
  controls?: boolean;
  /** Accessible name of the carousel. */
  label?: string;
  /** Extra class for the root element. */
  className?: string;
}

const mod = (value: number, size: number) => ((value % size) + size) % size;
/** Lands like a heavy drum clicking into its detent: a hint of overshoot, settled in about half a second. */
const settleSpring: Transition = { type: "spring", visualDuration: 0.5, bounce: 0.14 };
const enterSpring: Transition = { type: "spring", visualDuration: 0.85, bounce: 0.08 };
const INTERACTIVE = "a, button, input, select, textarea, [contenteditable='true'], [data-no-drag]";

interface SlideProps {
  index: number;
  count: number;
  step: number;
  radius: number;
  width: number;
  height: number;
  front: boolean;
  rotation: MotionValue<number>;
  onPick: (index: number) => void;
  children: ReactNode;
}

function Slide({ index, count, step, radius, width, height, front, rotation, onPick, children }: SlideProps) {
  // Cards dim with their angle from the viewer: the front card is full strength, a card seen edge-on is faint.
  const opacity = useTransform(rotation, latest => {
    const away = Math.abs(mod(index * step + latest + 180, 360) - 180);
    return 1 - Math.min(Math.max((away - step * 0.4) / 90, 0), 1) * 0.72;
  });
  return (
    <div
      className={styles.slide}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${count}`}
      aria-hidden={!front}
      data-front={front}
      style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2, transform: `rotateY(${index * step}deg) translateZ(${radius}px)` }}
      onClick={() => { if (!front) onPick(index); }}
    >
      {/* Only the front card is interactive; the others turn to the front when clicked. */}
      <motion.div className={styles.card} style={{ opacity }} inert={!front}>{children}</motion.div>
    </div>
  );
}

export function CylinderCarousel({ children, value, defaultValue = 0, onValueChange, cardWidth = 220, cardHeight = 290, gap = 18, perspective = 1100, controls = true, label = "Carousel", className }: CylinderCarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const step = count > 0 ? 360 / count : 360;
  const [internal, setInternal] = useState(defaultValue);
  const index = count > 0 ? mod(Math.round(value ?? internal), count) : 0;
  const reduced = useReducedMotion();

  const viewport = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const measure = () => setAvailable(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const width = available ? Math.min(cardWidth, Math.round(available * 0.58)) : cardWidth;
  const height = Math.round(cardHeight * (width / cardWidth));
  // The cards are the sides of a regular polygon; this is the distance from its center to the middle of each side.
  const radius = count >= 3 ? (width + gap) / (2 * Math.tan(Math.PI / count)) : count === 2 ? (width + gap) * 0.55 : 0;

  /** Degrees. Unbounded, so the cylinder can keep turning the same way forever. */
  const rotation = useMotionValue(-index * step);
  /** Where the cylinder is heading; arrows and keys add to this, so quick presses accumulate. */
  const target = useRef(-index * step);
  const playback = useRef<AnimationPlaybackControls | null>(null);
  const latest = useRef({ index, value, onValueChange });
  latest.current = { index, value, onValueChange };

  const settle = useCallback((degrees: number, velocity = 0) => {
    if (count === 0) return;
    target.current = degrees;
    playback.current?.stop();
    if (reduced) rotation.set(degrees);
    else playback.current = animate(rotation, degrees, { ...settleSpring, velocity });
    const next = mod(Math.round(-degrees / step), count);
    if (next === latest.current.index) return;
    if (latest.current.value === undefined) setInternal(next);
    latest.current.onValueChange?.(next);
  }, [count, reduced, rotation, step]);

  /** The rotation that shows a card, choosing the turn closest to where the cylinder already is. */
  const nearest = useCallback((slide: number) => {
    const base = -slide * step;
    return base + 360 * Math.round((target.current - base) / 360);
  }, [step]);
  const stepBy = useCallback((delta: number) => settle(Math.round(target.current / step) * step - delta * step), [settle, step]);
  const goTo = useCallback((slide: number) => settle(nearest(slide)), [nearest, settle]);

  // A controlled value that changes from outside turns the cylinder to match.
  useEffect(() => {
    if (count === 0 || mod(Math.round(-target.current / step), count) === index) return;
    settle(nearest(index));
  }, [count, index, nearest, settle, step]);

  // Entrance: the cylinder arrives already turning and settles on its first card.
  // It runs once per mount and owns its cleanup, so a remount (or React's development double mount) simply plays it again.
  const entrance = useRef({ count, reduced, step });
  useEffect(() => {
    const start = entrance.current;
    if (start.count === 0 || start.reduced) return;
    rotation.set(target.current + start.step * 1.15);
    const controls = animate(rotation, target.current, enterSpring);
    playback.current = controls;
    return () => { controls.stop(); rotation.set(target.current); };
  }, [rotation]);
  useEffect(() => () => playback.current?.stop(), []);

  const drag = useRef<{ pointerId: number; startX: number; origin: number; moved: boolean; samples: { t: number; x: number }[] } | null>(null);
  const suppressClick = useRef(false);
  /** At the front, the card's surface moves one px per px of drag. */
  const degreesPerPx = radius > 0 ? 180 / (Math.PI * radius) : 0.3;

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || count < 2) return;
    // Controls inside the front card keep working; the drag starts anywhere else.
    if ((event.target as Element).closest(INTERACTIVE)) return;
    drag.current = { pointerId: event.pointerId, startX: event.clientX, origin: rotation.get(), moved: false, samples: [] };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (!current.moved) {
      if (Math.abs(event.clientX - current.startX) < 6) return;
      // Start following from here, so crossing the threshold never makes the cylinder jump.
      current.moved = true;
      current.startX = event.clientX;
      playback.current?.stop();
      current.origin = rotation.get();
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "";
    }
    rotation.set(current.origin + (event.clientX - current.startX) * degreesPerPx);
    current.samples.push({ t: event.timeStamp, x: event.clientX });
    while (current.samples.length > 2 && event.timeStamp - current.samples[0]!.t > 100) current.samples.shift();
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    if (!current.moved) return;
    delete event.currentTarget.dataset.dragging;
    suppressClick.current = true;
    window.setTimeout(() => { suppressClick.current = false; }, 0);
    const first = current.samples[0], last = current.samples[current.samples.length - 1];
    // A pointer that stopped before lifting carries no throw.
    const velocity = !first || !last || last.t === first.t || event.timeStamp - last.t > 80 ? 0 : (last.x - first.x) / (last.t - first.t) * 1000 * degreesPerPx;
    // Let a flick carry on for a moment, then come to rest on the nearest card.
    const projected = rotation.get() + velocity * 0.2;
    settle(Math.round(projected / step) * step, velocity);
  }

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || count < 2) return;
    if (event.key === "ArrowRight") stepBy(1);
    else if (event.key === "ArrowLeft") stepBy(-1);
    else if (event.key === "Home") goTo(0);
    else if (event.key === "End") goTo(count - 1);
    else return;
    event.preventDefault();
  }

  if (count === 0) return null;

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} role="group" aria-roledescription="carousel" aria-label={label}>
      <motion.div
        ref={viewport}
        className={styles.viewport}
        style={{ height: height + 96, perspective }}
        tabIndex={0}
        aria-label={`${label}: card ${index + 1} of ${count}. Use the left and right arrow keys.`}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: motionTokens.duration.considered, ease: [...motionTokens.ease.enter] }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={onClickCapture}
        onKeyDown={onKeyDown}
      >
        <div className={styles.plate} aria-hidden="true" style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2 }} />
        <motion.div className={styles.ring} style={{ z: -radius, rotateY: rotation }}>
          {slides.map((slide, at) => (
            <Slide key={at} index={at} count={count} step={step} radius={radius} width={width} height={height} front={at === index} rotation={rotation} onPick={goTo}>{slide}</Slide>
          ))}
        </motion.div>
      </motion.div>

      {controls && count > 1 ? (
        <div className={styles.controls}>
          <button type="button" className={styles.arrow} aria-label="Previous card" onClick={() => stepBy(-1)}><ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" /></button>
          <span className={styles.counter} aria-hidden="true">
            <span className={styles.current}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={index} className={styles.digit} initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.5em" }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: "-0.5em" }} transition={{ duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] }}>{index + 1}</motion.span>
              </AnimatePresence>
            </span>
            <span className={styles.total}>/ {count}</span>
          </span>
          <button type="button" className={styles.arrow} aria-label="Next card" onClick={() => stepBy(1)}><ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" /></button>
        </div>
      ) : null}
      <span className={styles.srOnly} aria-live="polite">{`Card ${index + 1} of ${count}`}</span>
    </div>
  );
}

export default CylinderCarousel;
