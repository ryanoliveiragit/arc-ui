"use client";

import { useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Eraser } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./availability-scheduler.module.css";

export interface AvailabilityPreset {
  /** Text on the preset's button. */
  label: string;
  /** Whether the slot that starts at `hour` (24 h clock) on `day` (0 is the first column) belongs to the preset. */
  includes: (day: number, hour: number) => boolean;
}

export interface AvailabilitySchedulerProps {
  /** Selected one-hour slots as `"day-hour"` ids: day from 0 (first column), hour on the 24 h clock. Pass it with `onValueChange` to control the grid. */
  value?: string[];
  /** Starting selection when uncontrolled. Defaults to weekdays 9 to 5 with a lunch break. */
  defaultValue?: string[];
  /** Called with the sorted selection after a click, a drag, a key press or a preset. */
  onValueChange?: (slots: string[]) => void;
  /** First hour shown (24 h clock). */
  startHour?: number;
  /** Hour at which the last slot ends (24 h clock). */
  endHour?: number;
  /** Column names, one per day. */
  days?: string[];
  /** One-click selections offered above the grid. */
  presets?: AvailabilityPreset[];
  /** Heading above the grid. */
  title?: string;
  /** Extra class for the section. */
  className?: string;
}

const WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const defaultPresets: AvailabilityPreset[] = [
  { label: "Workdays 9 to 5", includes: (day, hour) => day < 5 && hour >= 9 && hour < 17 },
  { label: "Mornings", includes: (_, hour) => hour < 12 },
  { label: "Evenings", includes: (day, hour) => day < 5 && hour >= 17 },
  { label: "Weekends", includes: (day, hour) => day >= 5 && hour >= 10 && hour < 16 },
];
const slotId = (day: number, hour: number) => `${day}-${hour}`;
const clock = (hour: number) => `${hour % 12 === 0 ? 12 : hour % 12} ${hour % 24 < 12 ? "AM" : "PM"}`;
const ordered = (slots: Iterable<string>) => [...slots].sort((a, b) => { const [ad = 0, ah = 0] = a.split("-").map(Number), [bd = 0, bh = 0] = b.split("-").map(Number); return ad - bd || ah - bh; });

interface Drag { fromDay: number; fromHour: number; toDay: number; toHour: number; add: boolean }
const inDrag = (drag: Drag, day: number, hour: number) => day >= Math.min(drag.fromDay, drag.toDay) && day <= Math.max(drag.fromDay, drag.toDay) && hour >= Math.min(drag.fromHour, drag.toHour) && hour <= Math.max(drag.fromHour, drag.toHour);

/** Week grid of one-hour slots: click or drag a rectangle to mark when you are free, apply a preset, and read the result as merged ranges per day. */
export function AvailabilityScheduler({ value, defaultValue, onValueChange, startHour = 8, endHour = 20, days = WEEK, presets = defaultPresets, title = "When are you free?", className }: AvailabilitySchedulerProps) {
  const reduceMotion = useReducedMotion();
  const hours = useMemo(() => Array.from({ length: Math.max(1, endHour - startHour) }, (_, index) => startHour + index), [startHour, endHour]);
  const [internal, setInternal] = useState<string[]>(() => defaultValue ?? ordered(days.flatMap((_, day) => hours.filter(hour => day < 5 && hour >= 9 && hour < 17 && hour !== 12).map(hour => slotId(day, hour)))));
  const [drag, setDrag] = useState<Drag | null>(null);
  const [cursor, setCursor] = useState({ day: 0, hour: hours[0] ?? 0 });
  /** Where the last bulk change started. Cells fill in order of distance from it; a drag has no origin and fills at once. */
  const [origin, setOrigin] = useState<{ day: number; hour: number } | null>(null);
  const body = useRef<HTMLDivElement>(null);
  const committed = useMemo(() => new Set(value ?? internal), [value, internal]);

  // While a rectangle is being dragged the grid already shows its result.
  const selected = useMemo(() => {
    if (!drag) return committed;
    const next = new Set(committed);
    for (let day = 0; day < days.length; day++) for (const hour of hours) if (inDrag(drag, day, hour)) { if (drag.add) next.add(slotId(day, hour)); else next.delete(slotId(day, hour)); }
    return next;
  }, [committed, drag, days.length, hours]);

  const commit = (next: Set<string>, from: { day: number; hour: number } | null) => {
    const list = ordered(next);
    setOrigin(from);
    if (value === undefined) setInternal(list);
    onValueChange?.(list);
  };

  const cellAt = (event: ReactPointerEvent) => {
    const box = body.current?.getBoundingClientRect();
    const first = body.current?.querySelector<HTMLElement>("[data-cell]")?.getBoundingClientRect();
    if (!box || !first) return null;
    const day = Math.min(days.length - 1, Math.max(0, Math.floor((event.clientX - first.left) / first.width)));
    const row = Math.min(hours.length - 1, Math.max(0, Math.floor((event.clientY - box.top) / first.height)));
    return { day, hour: hours[row] ?? startHour };
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !(event.target instanceof HTMLElement) || !event.target.closest("[data-cell]")) return;
    const cell = cellAt(event);
    if (!cell) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setCursor(cell);
    setOrigin(null);
    setDrag({ fromDay: cell.day, fromHour: cell.hour, toDay: cell.day, toHour: cell.hour, add: !committed.has(slotId(cell.day, cell.hour)) });
  };
  const onPointerMove = (event: ReactPointerEvent) => {
    if (!drag) return;
    const cell = cellAt(event);
    if (cell && (cell.day !== drag.toDay || cell.hour !== drag.toHour)) setDrag({ ...drag, toDay: cell.day, toHour: cell.hour });
  };
  const endDrag = (keep: boolean) => { if (!drag) return; if (keep) commit(new Set(selected), null); setDrag(null); };

  const toggle = (day: number, hour: number, force?: boolean) => {
    const next = new Set(committed), id = slotId(day, hour);
    if (force ?? !next.has(id)) next.add(id); else next.delete(id);
    commit(next, null);
  };
  const focusCell = (day: number, hour: number) => {
    setCursor({ day, hour });
    body.current?.querySelector<HTMLElement>(`[data-cell="${slotId(day, hour)}"]`)?.focus();
  };
  const onKeyDown = (event: KeyboardEvent, day: number, hour: number) => {
    const first = hours[0] ?? 0, last = hours[hours.length - 1] ?? 0;
    if (event.key === " " || event.key === "Enter") { event.preventDefault(); toggle(day, hour); return; }
    const next = event.key === "ArrowRight" ? { day: Math.min(days.length - 1, day + 1), hour } : event.key === "ArrowLeft" ? { day: Math.max(0, day - 1), hour } : event.key === "ArrowDown" ? { day, hour: Math.min(last, hour + 1) } : event.key === "ArrowUp" ? { day, hour: Math.max(first, hour - 1) } : event.key === "Home" ? { day: 0, hour } : event.key === "End" ? { day: days.length - 1, hour } : null;
    if (!next) return;
    event.preventDefault();
    // Shift paints: the cell you move into takes the state of the one you left.
    if (event.shiftKey) toggle(next.day, next.hour, committed.has(slotId(day, hour)));
    focusCell(next.day, next.hour);
  };
  const toggleDay = (day: number) => {
    const next = new Set(committed), full = hours.every(hour => next.has(slotId(day, hour)));
    for (const hour of hours) if (full) next.delete(slotId(day, hour)); else next.add(slotId(day, hour));
    commit(next, { day, hour: hours[0] ?? 0 });
  };
  const applyPreset = (preset: AvailabilityPreset) => commit(new Set(days.flatMap((_, day) => hours.filter(hour => preset.includes(day, hour)).map(hour => slotId(day, hour)))), { day: 0, hour: hours[0] ?? 0 });
  const matches = (preset: AvailabilityPreset) => days.every((_, day) => hours.every(hour => preset.includes(day, hour) === committed.has(slotId(day, hour))));

  /** Each day's slots merged into ranges, such as 9 AM to 12 PM. */
  const ranges = days.map((_, day) => {
    const list: [number, number][] = [];
    for (const hour of hours) if (selected.has(slotId(day, hour))) { const open = list[list.length - 1]; if (open && open[1] === hour) open[1] = hour + 1; else list.push([hour, hour + 1]); }
    return list;
  });
  const total = selected.size;
  const freeDays = ranges.filter(list => list.length).length;

  return (
    <section className={[styles.scheduler, className].filter(Boolean).join(" ")} aria-label={title}>
      <div className={styles.layout}>
      <div className={styles.main}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.help}>Click a slot or drag across several. Hold Shift with the arrow keys to paint.</p>
        </header>
        <div className={styles.presets} role="group" aria-label="Presets">
          {presets.map(preset => <button key={preset.label} type="button" className={styles.preset} aria-pressed={matches(preset)} onClick={() => applyPreset(preset)}>{preset.label}</button>)}
          <button type="button" className={styles.clear} disabled={committed.size === 0} onClick={() => commit(new Set(), null)}><Eraser size={14} aria-hidden="true" />Clear</button>
        </div>

        <div className={styles.grid} role="grid" aria-label="Weekly availability" aria-multiselectable="true" style={{ "--days": days.length } as CSSProperties}>
          <div className={styles.row} role="row">
            <span className={styles.corner} role="presentation" />
            {days.map((name, day) => (
              <div key={name} role="columnheader" className={styles.dayCell}>
                <button type="button" className={styles.day} data-any={ranges[day]?.length ? "true" : undefined} aria-label={`${name}: toggle the whole day`} onClick={() => toggleDay(day)}>
                  <span className={styles.wide}>{name.slice(0, 3)}</span><span className={styles.narrow}>{name.slice(0, 1)}</span>
                </button>
              </div>
            ))}
          </div>
          <div ref={body} className={styles.body} data-dragging={drag ? "true" : undefined} role="rowgroup" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => endDrag(true)} onPointerCancel={() => endDrag(false)}>
            {hours.map(hour => (
              <div key={hour} className={styles.row} role="row">
                <span className={styles.hour} role="rowheader">{clock(hour)}</span>
                {days.map((name, day) => {
                  const on = selected.has(slotId(day, hour));
                  const distance = origin ? Math.abs(day - origin.day) + Math.abs(hour - origin.hour) : 0;
                  return (
                    <div
                      key={day}
                      role="gridcell"
                      data-cell={slotId(day, hour)}
                      className={styles.cell}
                      data-on={on}
                      data-up={on && selected.has(slotId(day, hour - 1)) ? "true" : undefined}
                      data-down={on && selected.has(slotId(day, hour + 1)) ? "true" : undefined}
                      aria-selected={on}
                      aria-label={`${name}, ${clock(hour)} to ${clock(hour + 1)}`}
                      tabIndex={cursor.day === day && cursor.hour === hour ? 0 : -1}
                      style={{ "--wait": `${Math.min(distance, 16) * 14}ms` } as CSSProperties}
                      onFocus={() => setCursor({ day, hour })}
                      onKeyDown={event => onKeyDown(event, day, hour)}
                      onClick={event => { if (event.detail === 0) toggle(day, hour); }}
                    >
                      <span className={styles.fill} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className={styles.summary} aria-label="Summary">
        <p className={styles.totalLabel}>Available</p>
        <p className={styles.total} aria-live="polite">
          <span className={styles.roller}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={total} className={styles.digits} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14, filter: `blur(${motionTokens.blur.soft}px)` }} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.snappy}>{total}</motion.span>
            </AnimatePresence>
          </span>
          <span className={styles.unit}>{total === 1 ? "hour" : "hours"} across {freeDays} {freeDays === 1 ? "day" : "days"}</span>
        </p>
        <ul className={styles.days}>
          {days.map((name, day) => {
            const list = ranges[day] ?? [];
            return (
              <li key={name} className={styles.dayRow} data-empty={list.length ? undefined : "true"}>
                <span className={styles.dayName}>{name.slice(0, 3)}</span>
                <span className={styles.track} aria-hidden="true">{hours.map(hour => <span key={hour} data-on={selected.has(slotId(day, hour))} />)}</span>
                <span className={styles.rangeText}>{list.length ? list.map(([from, to]) => `${clock(from)} to ${clock(to)}`).join(", ") : "Unavailable"}</span>
              </li>
            );
          })}
        </ul>
      </aside>
      </div>
    </section>
  );
}

export default AvailabilityScheduler;
