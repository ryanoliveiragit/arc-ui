"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import type { MotionStyle, MotionValue } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./wheel-picker.module.css";

export interface WheelOption {
  /** The value reported when this option is chosen. */
  value: string;
  /** What the wheel shows. Falls back to the value. */
  label?: string;
  /** Shown dimmed; the wheel never comes to rest on it. */
  disabled?: boolean;
}

export interface WheelColumn {
  /** Key of this column in the picker's value object, for example "hour". */
  id: string;
  /** Accessible name of the column, for example "Hour". */
  label: string;
  /** The options from top to bottom. */
  options: WheelOption[];
  /** Fixed text shown beside the selection band after this column, such as ":" or "min". It does not scroll. */
  suffix?: ReactNode;
  /** Column width in px or any CSS length. By default it fits its widest option. */
  width?: number | string;
  /** How labels line up inside the column. */
  align?: "start" | "center" | "end";
}

/** One chosen value per column, keyed by column id. */
export type WheelValue = Record<string, string>;

/**
 * A wheel picker like the one on a phone: drag or flick a column and it coasts, then settles on the nearest option.
 * It also answers the mouse wheel, a click on any option, arrow keys, Home, End, Page Up and Down, and typing the start of a label.
 * Columns sit side by side behind one selection band, and disabled options are skipped wherever the wheel would stop.
 */
export interface WheelPickerProps {
  /** One wheel per entry, left to right. */
  columns: WheelColumn[];
  /** Chosen values by column id (controlled). */
  value?: WheelValue;
  /** Values chosen at first (uncontrolled). A column without one starts on its first enabled option. */
  defaultValue?: WheelValue;
  /** Runs with every column's value when one settles on a new option; `columnId` says which one moved. */
  onValueChange?: (value: WheelValue, columnId: string) => void;
  /** Accessible name of the whole picker, for example "Reminder time". */
  label?: string;
  /** Height of one row in px. */
  itemHeight?: number;
  /** How many rows show at once. Use an odd number so one row sits in the middle. */
  visibleCount?: number;
  /** Turns the control off: it is dimmed and ignores pointer and keyboard input. */
  disabled?: boolean;
  /** Extra class names for the root element. */
  className?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The enabled option closest to `index`, looking both ways; `prefer` breaks a tie in the direction of travel. */
function nearestEnabled(options: WheelOption[], index: number, prefer: 1 | -1 = 1): number {
  const at = clamp(index, 0, options.length - 1);
  if (!options[at]?.disabled) return at;
  for (let distance = 1; distance < options.length; distance++) {
    const first = at + distance * prefer, second = at - distance * prefer;
    if (first >= 0 && first < options.length && !options[first]!.disabled) return first;
    if (second >= 0 && second < options.length && !options[second]!.disabled) return second;
  }
  return at;
}

/** Moves `steps` enabled options away from `from`, stopping at the last enabled one in that direction. */
function stepEnabled(options: WheelOption[], from: number, steps: number): number {
  const direction = steps > 0 ? 1 : -1;
  let at = from;
  for (let left = Math.abs(steps), index = from + direction; left > 0 && index >= 0 && index < options.length; index += direction) {
    if (options[index]!.disabled) continue;
    at = index;
    left--;
  }
  return at;
}

interface WheelRowProps {
  id: string;
  index: number;
  option: WheelOption;
  y: MotionValue<number>;
  itemHeight: number;
  reach: number;
  selected: boolean;
  near: boolean;
  onPick: (index: number) => void;
}

function WheelRow({ id, index, option, y, itemHeight, reach, selected, near, onPick }: WheelRowProps) {
  // Signed distance from the selection band, in rows. CSS turns it into the tilt, scale and fade of a row going around a drum.
  const distance = useTransform(y, value => clamp((index * itemHeight + value) / itemHeight, -reach, reach));
  return (
    <motion.div
      id={id}
      role="option"
      aria-selected={selected}
      aria-disabled={option.disabled || undefined}
      className={styles.row}
      data-near={near || undefined}
      style={{ "--d": distance, height: itemHeight } as MotionStyle}
      onClick={() => { if (!option.disabled) onPick(index); }}
    >
      <span className={styles.rowLabel}>{option.label ?? option.value}</span>
    </motion.div>
  );
}

interface WheelProps {
  column: WheelColumn;
  value: string | undefined;
  onChange: (value: string) => void;
  itemHeight: number;
  visibleCount: number;
  reduce: boolean;
  disabled: boolean;
  onMoveFocus: (direction: 1 | -1) => void;
}

function Wheel({ column, value, onChange, itemHeight, visibleCount, reduce, disabled, onMoveFocus }: WheelProps) {
  const { options } = column;
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const found = options.findIndex(option => option.value === value);
  const selected = found === -1 ? nearestEnabled(options, 0) : found;
  const y = useMotionValue(-selected * itemHeight);
  /** Where the wheel is heading: steps taken while it is still moving add up from here, not from where it happens to be. */
  const heading = useRef(selected);
  const dragging = useRef(false);
  const dragged = useRef(false);
  const [near, setNear] = useState(selected);
  const typed = useRef({ text: "", at: 0 });
  const last = options.length - 1;

  useMotionValueEvent(y, "change", latest => {
    const index = clamp(Math.round(-latest / itemHeight), 0, last);
    setNear(current => current === index ? current : index);
  });

  const commit = (index: number) => {
    const option = options[index];
    if (option && !option.disabled && option.value !== value) onChange(option.value);
  };

  function goTo(index: number, announce = true) {
    const target = clamp(index, 0, last);
    heading.current = target;
    if (reduce) y.jump(-target * itemHeight);
    else animate(y, -target * itemHeight, motionTokens.spring.snappy);
    if (announce) commit(target);
  }

  // Follow the value when it changes from outside, or when the row height does.
  const placed = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (!placed.current) { placed.current = true; heading.current = selected; y.jump(-selected * itemHeight); return; }
    if (dragging.current || heading.current === selected) return;
    goTo(selected, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, itemHeight]);

  // The wheel listener is attached once, so it reaches the current options and handlers through this ref instead of a stale closure.
  const live = useRef({ options, goTo });
  live.current = { options, goTo };

  // The mouse wheel turns the picker one row per notch; a trackpad's small deltas add up to the same step.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || disabled) return;
    let pile = 0, stamp = 0;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      if (event.timeStamp - stamp > 240) pile = 0;
      stamp = event.timeStamp;
      pile += event.deltaMode === 1 ? event.deltaY * 32 : event.deltaY;
      const steps = Math.trunc(pile / 32);
      if (!steps) { event.preventDefault(); return; }
      pile = 0;
      const next = stepEnabled(live.current.options, heading.current, clamp(steps, -1, 1));
      // At either end the wheel has nowhere to go, so the page scrolls as usual.
      if (next === heading.current) return;
      event.preventDefault();
      live.current.goTo(next);
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [disabled]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    const page = Math.max(visibleCount - 1, 1);
    let next: number | null = null;
    if (event.key === "ArrowDown") next = stepEnabled(options, heading.current, 1);
    else if (event.key === "ArrowUp") next = stepEnabled(options, heading.current, -1);
    else if (event.key === "PageDown") next = stepEnabled(options, heading.current, page);
    else if (event.key === "PageUp") next = stepEnabled(options, heading.current, -page);
    else if (event.key === "Home") next = nearestEnabled(options, 0, 1);
    else if (event.key === "End") next = nearestEnabled(options, last, -1);
    else if (event.key === "ArrowRight") { event.preventDefault(); onMoveFocus(1); return; }
    else if (event.key === "ArrowLeft") { event.preventDefault(); onMoveFocus(-1); return; }
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key !== " ") {
      // Type the start of a label to jump to it, as in a native list.
      const now = event.timeStamp;
      typed.current = { text: (now - typed.current.at > 700 ? "" : typed.current.text) + event.key.toLowerCase(), at: now };
      const match = options.findIndex(option => !option.disabled && (option.label ?? option.value).toLowerCase().startsWith(typed.current.text));
      if (match !== -1) goTo(match);
      return;
    }
    if (next === null) return;
    event.preventDefault();
    goTo(next);
  }

  /** Turns the place a flick would coast to into the nearest row it may rest on. */
  function settleAt(position: number) {
    const raw = -position / itemHeight;
    const index = nearestEnabled(options, Math.round(raw), raw >= heading.current ? 1 : -1);
    heading.current = index;
    commit(index);
    return -index * itemHeight;
  }

  const pad = (visibleCount - 1) / 2 * itemHeight;
  const active = `${baseId}-${selected}`;

  return (
    <div
      ref={rootRef}
      role="listbox"
      aria-label={column.label}
      aria-orientation="vertical"
      aria-activedescendant={options.length ? active : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      className={styles.wheel}
      data-align={column.align ?? "center"}
      style={{ height: itemHeight * visibleCount, width: column.width }}
      onKeyDown={onKeyDown}
    >
      {/* The window clips and fades the rows; the wheel around it stays unmasked so its focus ring is drawn whole. */}
      <div className={styles.window}>
      <motion.div
        className={styles.list}
        style={{ y, paddingBlock: pad }}
        drag={disabled ? false : "y"}
        dragConstraints={{ top: -last * itemHeight, bottom: 0 }}
        dragElastic={0.14}
        dragMomentum={!reduce}
        dragTransition={{ power: 0.24, timeConstant: 220, bounceStiffness: 420, bounceDamping: 42, modifyTarget: settleAt }}
        onPointerDown={() => { dragged.current = false; }}
        onDragStart={() => { dragging.current = true; dragged.current = true; }}
        onDragEnd={() => {
          dragging.current = false;
          // Without momentum nothing coasts, so the wheel settles from where it was let go.
          if (reduce) y.jump(settleAt(y.get()));
        }}
      >
        {options.map((option, index) => (
          <WheelRow
            key={option.value}
            id={`${baseId}-${index}`}
            index={index}
            option={option}
            y={y}
            itemHeight={itemHeight}
            reach={(visibleCount + 1) / 2}
            selected={index === selected}
            near={index === near}
            onPick={picked => { if (!dragged.current && !disabled) goTo(picked); }}
          />
        ))}
      </motion.div>
      </div>
    </div>
  );
}

export function WheelPicker({ columns, value, defaultValue, onValueChange, label, itemHeight = 38, visibleCount = 5, disabled = false, className }: WheelPickerProps) {
  const reduce = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState<WheelValue>(defaultValue ?? {});
  const source = value ?? internal;
  const rows = Math.max(visibleCount | 1, 3);

  // Every column always has a value: its own, or its first enabled option.
  const resolved: WheelValue = {};
  for (const column of columns) {
    const chosen = source[column.id];
    const valid = column.options.find(option => option.value === chosen && !option.disabled);
    const fallback = column.options[nearestEnabled(column.options, 0)];
    if (valid) resolved[column.id] = valid.value;
    else if (fallback) resolved[column.id] = fallback.value;
  }

  function change(columnId: string, next: string) {
    const merged = { ...resolved, [columnId]: next };
    if (value === undefined) setInternal(merged);
    onValueChange?.(merged, columnId);
  }

  function moveFocus(from: number, direction: 1 | -1) {
    const wheels = rootRef.current?.querySelectorAll<HTMLElement>('[role="listbox"]');
    wheels?.[from + direction]?.focus();
  }

  return (
    <div ref={rootRef} role="group" aria-label={label} className={[styles.picker, className].filter(Boolean).join(" ")} data-disabled={disabled || undefined} style={{ "--row": `${itemHeight}px` } as CSSProperties}>
      <span className={styles.band} aria-hidden="true" />
      {columns.map((column, index) => (
        <div key={column.id} className={styles.column}>
          <Wheel column={column} value={resolved[column.id]} onChange={next => change(column.id, next)} itemHeight={itemHeight} visibleCount={rows} reduce={reduce} disabled={disabled} onMoveFocus={direction => moveFocus(index, direction)} />
          {column.suffix != null ? <span className={styles.suffix} aria-hidden="true">{column.suffix}</span> : null}
        </div>
      ))}
    </div>
  );
}

export default WheelPicker;
