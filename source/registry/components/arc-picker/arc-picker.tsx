"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./arc-picker.module.css";

export interface ArcOption {
  /** The value reported when this option is chosen. */
  value: string;
  /** The text on the arc. Falls back to the value. */
  label?: string;
  /** Shown dimmed; the dial never comes to rest on it. */
  disabled?: boolean;
}

/**
 * A radial text picker. Options sit along an arc of a large dial and the chosen one rests at its apex, inside a pair of brackets
 * that spring to the width of each new label. Turn the dial with the mouse wheel, by dragging along the arc, with the arrow keys,
 * or by clicking a label.
 */
export interface ArcPickerProps {
  /** The options in order along the arc. */
  options: ArcOption[];
  /** The chosen value (controlled). */
  value?: string;
  /** The value chosen at first (uncontrolled). Defaults to the first enabled option. */
  defaultValue?: string;
  /** Runs when the dial settles on a new option. */
  onValueChange?: (value: string) => void;
  /** Accessible name, for example "Billing period". */
  label: string;
  /** Which part of the dial shows: `top` arches up, `bottom` hangs down, `left` and `right` bow sideways with the labels stacked. */
  side?: "top" | "bottom" | "left" | "right";
  /** Radius of the dial in px. Larger is flatter. Defaults to 320 for the top and bottom arcs and 240 for the side arcs. */
  radius?: number;
  /** Distance between the centers of neighboring options along the arc, in px. By default each pair is spaced by its own label widths. */
  gap?: number;
  /** Draws the tick marks that turn with the dial and the pointer at the apex. */
  ticks?: boolean;
  /** Turns the control off: it is dimmed and ignores pointer and keyboard input. */
  disabled?: boolean;
  /** Extra class names for the root element. */
  className?: string;
  /** Inline styles for the root element, for sizes and CSS variables. */
  style?: CSSProperties;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
/** Past either end the dial still turns, less and less, like a scroll view pulled beyond its edge. */
const resist = (over: number) => (1 - 1 / (Math.abs(over) * 0.9 + 1)) * 0.7 * Math.sign(over);
/** Horizontal room a bracket keeps from the label, the height of a label row, and the air between two labels on the arc, in px. */
const FRAME_PAD = 12;
const ROW = 22;
const AIR = 26;
const toDeg = 180 / Math.PI;

function nearestEnabled(options: ArcOption[], index: number, prefer: 1 | -1 = 1): number {
  const at = clamp(index, 0, options.length - 1);
  if (!options[at]?.disabled) return at;
  for (let distance = 1; distance < options.length; distance++) {
    const first = at + distance * prefer, second = at - distance * prefer;
    if (first >= 0 && first < options.length && !options[first]!.disabled) return first;
    if (second >= 0 && second < options.length && !options[second]!.disabled) return second;
  }
  return at;
}

/** The dial angle, in degrees, at a fractional option index. Past either end it keeps the pace of the nearest pair. */
function angleAt(angles: number[], index: number): number {
  const last = angles.length - 1;
  if (last <= 0) return 0;
  const at = clamp(Math.floor(index), 0, last - 1);
  return angles[at]! + (angles[at + 1]! - angles[at]!) * (index - at);
}

/** The inverse: the fractional option index under the apex at a dial angle. */
function indexAt(angles: number[], angle: number): number {
  const last = angles.length - 1;
  if (last <= 0) return 0;
  let at = 0;
  while (at < last - 1 && angle > angles[at + 1]!) at++;
  return at + (angle - angles[at]!) / (angles[at + 1]! - angles[at]!);
}

function stepEnabled(options: ArcOption[], from: number, direction: 1 | -1): number {
  for (let index = from + direction; index >= 0 && index < options.length; index += direction) if (!options[index]!.disabled) return index;
  return from;
}

interface ArcItemProps {
  id: string;
  index: number;
  option: ArcOption;
  position: MotionValue<number>;
  angle: number;
  selected: boolean;
  near: boolean;
  onPick: (index: number) => void;
  onMeasure: (index: number, node: HTMLSpanElement | null) => void;
}

function ArcItem({ id, index, option, position, angle, selected, near, onPick, onMeasure }: ArcItemProps) {
  // Labels fade and shrink with their distance from the apex, so the arc trails off instead of being cut.
  const opacity = useTransform(position, value => clamp(1 - Math.abs(index - value) * 0.3, 0, 1));
  const scale = useTransform(position, value => 1 - clamp(Math.abs(index - value), 0, 4) * 0.035);
  const [reachable, setReachable] = useState(() => Math.abs(index - position.get()) < 3.2);
  useMotionValueEvent(position, "change", value => { const next = Math.abs(index - value) < 3.2; setReachable(current => current === next ? current : next); });
  return (
    <div className={styles.item} style={{ "--angle": `${angle}deg` } as CSSProperties} data-reachable={reachable || undefined}>
      <motion.span
        ref={node => onMeasure(index, node)}
        id={id}
        role="option"
        aria-selected={selected}
        aria-disabled={option.disabled || undefined}
        className={styles.label}
        data-near={near || undefined}
        style={{ opacity, scale }}
        onClick={() => { if (!option.disabled) onPick(index); }}
      >
        {option.label ?? option.value}
      </motion.span>
    </div>
  );
}

export function ArcPicker({ options, value, defaultValue, onValueChange, label, side = "top", radius: radiusProp, gap, ticks = true, disabled = false, className, style }: ArcPickerProps) {
  const reduce = !!useReducedMotion();
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const [internal, setInternal] = useState(defaultValue);
  const chosen = value ?? internal;
  const found = options.findIndex(option => option.value === chosen);
  const selected = found === -1 ? nearestEnabled(options, 0) : found;
  const last = options.length - 1;
  const stacked = side === "left" || side === "right";
  /** Options run clockwise on the top and right arcs and counterclockwise on the others, so they always read left to right or top to bottom. */
  const turn = side === "top" || side === "right" ? 1 : -1;

  const radius = radiusProp ?? (stacked ? 240 : 320);

  const [widths, setWidths] = useState<number[]>([]);
  const widest = widths.length ? Math.max(...widths) : 72;
  // Where each option sits on the dial, in degrees from the first. Stacked labels are evenly spaced; labels along the curve are spaced
  // by their own widths, so a short word does not sit in a slot cut for the longest one.
  const angles: number[] = [];
  for (let index = 0, at = 0; index < options.length; index++) {
    if (index > 0) at += (gap ?? (stacked ? ROW + 16 : ((widths[index - 1] ?? 72) + (widths[index] ?? 72)) / 2 + AIR)) / radius * toDeg;
    angles.push(at);
  }

  /** The dial's position as a fractional option index. */
  const position = useMotionValue(selected);
  const heading = useRef(selected);
  const [near, setNear] = useState(selected);
  const rotate = useTransform(position, current => -turn * angleAt(angles, current));
  useMotionValueEvent(position, "change", current => { const index = clamp(Math.round(current), 0, last); setNear(previous => previous === index ? previous : index); });

  // The brackets hug whichever label is nearest the apex and spring to its width as the dial turns.
  const half = useSpring((widths[selected] ?? widest) / 2 + FRAME_PAD, { stiffness: motionTokens.spring.responsive.stiffness, damping: motionTokens.spring.responsive.damping });
  const bracketStart = useTransform(half, current => -current);
  useEffect(() => {
    const next = (widths[near] ?? widest) / 2 + FRAME_PAD;
    if (reduce) half.jump(next); else half.set(next);
  }, [half, near, reduce, widest, widths]);

  const measure = () => {
    const next = options.map((_, index) => Math.ceil(labels.current[index]?.offsetWidth ?? 0));
    setWidths(current => current.length === next.length && current.every((width, index) => width === next[index]) ? current : next);
  };
  useIsomorphicLayoutEffect(() => {
    measure();
    // Web fonts change label widths after the first paint.
    let alive = true;
    document.fonts?.ready.then(() => { if (alive) measure(); }).catch(() => undefined);
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  function commit(index: number) {
    const option = options[index];
    if (!option || option.disabled || option.value === chosen) return;
    if (value === undefined) setInternal(option.value);
    onValueChange?.(option.value);
  }

  function goTo(index: number, velocity = 0, announce = true) {
    const target = clamp(index, 0, last);
    heading.current = target;
    if (reduce) position.jump(target);
    else animate(position, target, { ...motionTokens.spring.gentle, velocity });
    if (announce) commit(target);
  }

  // Follow the value when it changes from outside.
  const placed = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (!placed.current) { placed.current = true; return; }
    if (drag.current?.active || heading.current === selected) return;
    goTo(selected, 0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const live = useRef({ options, goTo });
  live.current = { options, goTo };

  useEffect(() => {
    const root = rootRef.current;
    if (!root || disabled) return;
    let pile = 0, stamp = 0;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (event.timeStamp - stamp > 240) pile = 0;
      stamp = event.timeStamp;
      pile += event.deltaMode === 1 ? delta * 32 : delta;
      const count = Math.trunc(pile / 36);
      if (!count) { event.preventDefault(); return; }
      pile = 0;
      const next = stepEnabled(live.current.options, heading.current, count > 0 ? 1 : -1);
      // At either end the dial has nowhere to go, so the page scrolls as usual.
      if (next === heading.current) return;
      event.preventDefault();
      live.current.goTo(next);
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [disabled]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = stepEnabled(options, heading.current, 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = stepEnabled(options, heading.current, -1);
    else if (event.key === "Home") next = nearestEnabled(options, 0, 1);
    else if (event.key === "End") next = nearestEnabled(options, last, -1);
    else return;
    event.preventDefault();
    goTo(next);
  }

  // Dragging along the arc turns the dial with the pointer: one option per step of arc length.
  const drag = useRef<{ id: number; start: number; origin: number; active: boolean; samples: { t: number; at: number }[] } | null>(null);
  /** Degrees the dial turns per px of pointer travel along the arc. */
  const perPx = toDeg / radius;
  const moved = useRef(false);
  const along = (event: ReactPointerEvent) => stacked ? event.clientY : event.clientX;

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    moved.current = false;
    if (disabled || event.button !== 0) return;
    position.stop();
    drag.current = { id: event.pointerId, start: along(event), origin: angleAt(angles, position.get()), active: false, samples: [] };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const at = along(event);
    if (!current.active) {
      if (Math.abs(at - current.start) < 5) return;
      current.active = true;
      current.start = at;
      moved.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "";
    }
    const raw = indexAt(angles, current.origin - (at - current.start) * perPx);
    position.set(raw < 0 ? resist(raw) : raw > last ? last + resist(raw - last) : raw);
    current.samples.push({ t: event.timeStamp, at });
    while (current.samples.length > 2 && event.timeStamp - current.samples[0]!.t > 100) current.samples.shift();
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    if (!current.active) { if (heading.current !== Math.round(position.get())) goTo(heading.current, 0, false); return; }
    delete event.currentTarget.dataset.dragging;
    const first = current.samples[0], latest = current.samples[current.samples.length - 1];
    // A pointer that stopped before lifting carries no throw.
    const speed = !first || !latest || latest.t === first.t || event.timeStamp - latest.t > 80 ? 0 : (latest.at - first.at) / (latest.t - first.t) * 1000;
    const here = position.get();
    const turning = -speed * perPx;
    const projected = indexAt(angles, angleAt(angles, here) + turning * 0.16);
    // The spring picks up the throw in its own unit, options per second, using the spacing of the pair under the apex.
    const pace = Math.max(angleAt(angles, Math.floor(here) + 1) - angleAt(angles, Math.floor(here)), 0.001);
    goTo(nearestEnabled(options, Math.round(projected), turning >= 0 ? 1 : -1), turning / pace);
  }

  const inner = radius - (stacked ? widest / 2 : ROW / 2) - 16;
  const circumference = 2 * Math.PI * inner;
  // A whole number of ticks, about 9 px apart, so the pattern closes around the circle; every fifth is longer.
  const minor = circumference / (Math.max(Math.round(circumference / 45), 1) * 5);
  const vars = { "--radius": `${radius}px`, "--inset": `${stacked ? widest / 2 + FRAME_PAD + 14 : ROW / 2 + 16}px`, "--inner": `${inner}px`, ...style } as CSSProperties;

  return (
    <div
      ref={rootRef}
      role="listbox"
      aria-label={label}
      aria-orientation={stacked ? "vertical" : "horizontal"}
      aria-activedescendant={options.length ? `${baseId}-${selected}` : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      className={[styles.picker, className].filter(Boolean).join(" ")}
      style={vars}
      data-side={side}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <div className={styles.clip}>
        <motion.div className={styles.dial} style={{ rotate }}>
          {ticks ? (
            <svg className={styles.ticks} width={inner * 2 + 16} height={inner * 2 + 16} viewBox={`${-inner - 8} ${-inner - 8} ${inner * 2 + 16} ${inner * 2 + 16}`} aria-hidden="true">
              <circle className={styles.minor} r={inner} fill="none" strokeDasharray={`1 ${minor - 1}`} strokeDashoffset={0.5} />
              <circle className={styles.major} r={inner} fill="none" strokeDasharray={`1.5 ${minor * 5 - 1.5}`} strokeDashoffset={0.75} />
            </svg>
          ) : null}
          {options.map((option, index) => (
            <ArcItem
              key={option.value}
              id={`${baseId}-${index}`}
              index={index}
              option={option}
              position={position}
              angle={turn * (angles[index] ?? 0)}
              selected={index === selected}
              near={index === near}
              onPick={picked => { if (!moved.current && !disabled) goTo(picked); }}
              onMeasure={(at, node) => { labels.current[at] = node; }}
            />
          ))}
        </motion.div>
      </div>
      {/* The frame stays at the apex while the dial turns under it. Only its two brackets move, by transform. */}
      <span className={styles.frame} aria-hidden="true">
        <motion.span className={styles.bracket} data-end="start" style={{ x: bracketStart }} />
        <motion.span className={styles.bracket} data-end="end" style={{ x: half }} />
        {ticks ? <span className={styles.pointer} /> : null}
      </span>
    </div>
  );
}

export default ArcPicker;
