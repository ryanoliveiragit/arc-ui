"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, PointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./status-bar.module.css";

export type DayStatus = "operational" | "degraded" | "outage" | "maintenance" | "unknown";

export interface StatusDay {
  /** Calendar day as YYYY-MM-DD. */
  date: string;
  /** Worst state the service reached that day. */
  status: DayStatus;
  /** Share of the day the service answered, from 0 to 100. Defaults by status when omitted; days without data are left out of the average. */
  uptime?: number;
  /** Short note for the tooltip, such as the incident title. */
  note?: string;
}

/**
 * An uptime strip: one thin bar per day, colored by the worst state of that day, under an overall percentage.
 * Bars rise in a wave once on view and the percentage counts up. Hovering, scrubbing or arrowing along the strip lifts the
 * bars around the pointer and glides one tooltip between days; the legend dims every other state. Click a day to select it.
 */
export interface StatusBarProps {
  /** One entry per day, oldest first. */
  days: StatusDay[];
  /** Name of the service. It also names the strip for assistive technology. */
  label: string;
  /** Overall uptime in percent. Defaults to the average of the days that have data. */
  uptime?: number;
  /** Decimal places of the overall percentage. */
  precision?: number;
  /** Text under the percentage. Defaults to "uptime, last {n} days". */
  caption?: string;
  /** Selected day as YYYY-MM-DD, or null for none. Leave undefined to let the strip keep its own selection. */
  selectedDate?: string | null;
  /** Day selected at first when the strip keeps its own selection. */
  defaultSelectedDate?: string | null;
  /** Called with the day that was clicked, or null when the selected day is clicked again. */
  onSelectDate?: (date: string | null) => void;
  /** Formatting locale. Fixed by default so server and client render the same labels. */
  locale?: string;
  /** Extra class for the root element. */
  className?: string;
}

const STATUSES: DayStatus[] = ["operational", "degraded", "outage", "maintenance", "unknown"];
const NAMES: Record<DayStatus, string> = { operational: "Operational", degraded: "Degraded", outage: "Outage", maintenance: "Maintenance", unknown: "No data" };
const HEADLINES: Record<DayStatus, string> = { operational: "All systems operational", degraded: "Degraded performance", outage: "Service outage", maintenance: "Under maintenance", unknown: "No data yet" };
const FALLBACK: Record<DayStatus, number | null> = { operational: 100, degraded: 99.4, outage: 96, maintenance: 100, unknown: null };
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
/** Total travel of the entrance wave in ms, however many days the strip holds. */
const WAVE = 520;
const toUtc = (iso: string) => new Date(`${iso}T00:00:00Z`);

const noopSubscribe = () => () => {};
/** Reduced motion only after hydration, so the server and the first client render agree. */
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = useReducedMotion();
  return hydrated && !!reduced;
}

/** The overall percentage counts up to its value once the strip is on view, and glides when the value changes later. */
function CountUp({ value, format, active, reduced }: { value: number; format: Intl.NumberFormat; active: boolean; reduced: boolean }) {
  const [shown, setShown] = useState(value);
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    const from = last.current ?? Math.max(0, value - 6);
    last.current = value;
    if (reduced || from === value) { setShown(value); return; }
    const controls = animate(from, value, { duration: .9, ease: enter, onUpdate: setShown });
    return () => controls.stop();
  }, [value, active, reduced]);
  return <span aria-hidden="true">{format.format(shown)}</span>;
}

export function StatusBar({ days, label, uptime, precision = 2, caption, selectedDate, defaultSelectedDate = null, onSelectDate, locale = "en-US", className }: StatusBarProps) {
  const reduced = useReducedMotionSafe();
  const rootRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stripRef, { once: true, amount: .5 });

  const formats = useMemo(() => ({
    day: new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
    long: new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
    overall: new Intl.NumberFormat(locale, { minimumFractionDigits: precision, maximumFractionDigits: precision }),
    percent: new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
  }), [locale, precision]);

  const model = useMemo(() => {
    const values = days.map(day => day.uptime ?? FALLBACK[day.status]);
    const known = values.filter((value): value is number => value !== null);
    const counts: Record<DayStatus, number> = { operational: 0, degraded: 0, outage: 0, maintenance: 0, unknown: 0 };
    days.forEach(day => { counts[day.status]++; });
    return { values, counts, average: known.length ? known.reduce((sum, value) => sum + value, 0) / known.length : 0 };
  }, [days]);
  const overall = uptime ?? model.average;
  const current: DayStatus = days[days.length - 1]?.status ?? "unknown";

  const [reveal, setReveal] = useState<"hidden" | "revealing" | "done">("hidden");
  useEffect(() => {
    if (reveal !== "hidden" || !(inView || reduced)) return;
    const frame = requestAnimationFrame(() => setReveal(reduced ? "done" : "revealing"));
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, reveal]);
  useEffect(() => {
    if (reveal !== "revealing") return;
    const timer = window.setTimeout(() => setReveal("done"), WAVE + 640);
    return () => window.clearTimeout(timer);
  }, [reveal]);

  const [internal, setInternal] = useState<string | null>(defaultSelectedDate);
  const selected = selectedDate !== undefined ? selectedDate : internal;
  const selectRef = useRef<(date: string) => void>(() => {});
  selectRef.current = (date: string) => {
    const next = selected === date ? null : date;
    if (selectedDate === undefined) setInternal(next);
    onSelectDate?.(next);
  };

  // Legend: hovering or focusing a state previews it on the strip, clicking pins it.
  const [preview, setPreview] = useState<DayStatus | null>(null);
  const [pinned, setPinned] = useState<DayStatus | null>(null);
  const highlight = preview ?? pinned;

  // One tooltip for the whole strip. It jumps into place when it opens and glides between days after that.
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const wasOpen = useRef(false);
  const hideTimer = useRef(0);
  const tipX = useMotionValue(0), tipY = useMotionValue(0), shift = useMotionValue(0);
  const show = (index: number) => { window.clearTimeout(hideTimer.current); setActive(index); setOpen(true); };
  const hideSoon = (delay = 110) => { window.clearTimeout(hideTimer.current); hideTimer.current = window.setTimeout(() => setOpen(false), delay); };
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  useLayoutEffect(() => {
    const root = rootRef.current, strip = stripRef.current, bubble = bubbleRef.current;
    if (active === null || !root || !strip || !bubble) return;
    const bar = strip.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!bar) return;
    const box = root.getBoundingClientRect(), cell = bar.getBoundingClientRect();
    const x = cell.left - box.left + cell.width / 2;
    const y = cell.top - box.top;
    // Near an edge the bubble slides sideways so it stays inside the component while its anchor stays on the bar.
    const half = bubble.offsetWidth / 2;
    const offset = Math.min(Math.max(x, half), Math.max(half, box.width - half)) - x;
    if (open && wasOpen.current && !reduced) {
      animate(tipX, x, motionTokens.spring.snappy);
      animate(tipY, y, motionTokens.spring.snappy);
      animate(shift, offset, motionTokens.spring.snappy);
    } else { tipX.jump(x); tipY.jump(y); shift.jump(offset); }
    wasOpen.current = open;
  }, [active, open, reduced, tipX, tipY, shift]);

  const indexAt = (clientX: number) => {
    const strip = stripRef.current;
    if (!strip || !days.length) return null;
    const box = strip.getBoundingClientRect();
    return Math.min(days.length - 1, Math.max(0, Math.floor((clientX - box.left) / box.width * days.length)));
  };
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const index = indexAt(event.clientX);
    if (index !== null && (index !== active || !open)) show(index);
  }
  function onPointerLeave(event: PointerEvent<HTMLDivElement>) {
    // A keyboard user keeps the tooltip on the focused day; a tap lingers long enough to read.
    const focused = document.activeElement instanceof HTMLElement && stripRef.current?.contains(document.activeElement) && document.activeElement.matches(":focus-visible") ? Number(document.activeElement.dataset.index) : null;
    if (focused !== null && Number.isFinite(focused)) show(focused);
    else hideSoon(event.pointerType === "touch" ? 2200 : 110);
  }
  function onFocus(event: FocusEvent<HTMLDivElement>) {
    const index = Number((event.target as HTMLElement).dataset.index);
    if (!Number.isFinite(index)) return;
    setFocusIndex(index);
    show(index);
  }
  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!stripRef.current?.contains(event.relatedTarget as Node | null)) hideSoon(0);
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = Number((event.target as HTMLElement).dataset.index);
    if (!Number.isFinite(index)) return;
    const moves: Record<string, number> = { ArrowLeft: index - 1, ArrowRight: index + 1, ArrowUp: index - 7, ArrowDown: index + 7, PageUp: index - 7, PageDown: index + 7, Home: 0, End: days.length - 1 };
    if (event.key in moves) {
      event.preventDefault();
      const next = Math.min(Math.max(moves[event.key]!, 0), days.length - 1);
      stripRef.current?.querySelector<HTMLElement>(`[data-index="${next}"]`)?.focus();
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  const tabStop = focusIndex !== null && focusIndex < days.length ? focusIndex : days.length - 1;
  const step = Math.min(8, WAVE / Math.max(1, days.length));
  const describe = (index: number) => {
    const day = days[index]!, value = model.values[index];
    return `${formats.long.format(toUtc(day.date))}: ${NAMES[day.status]}${value != null ? `, ${formats.percent.format(value)}% uptime` : ""}${day.note ? `. ${day.note}` : ""}`;
  };
  const bars = useMemo(() => days.map((day, index) => <button key={day.date} type="button" className={styles.bar} data-index={index} data-status={day.status}
    style={{ "--i": index } as CSSProperties} tabIndex={index === tabStop ? 0 : -1} aria-pressed={day.date === selected} aria-label={describe(index)}
    onClick={() => selectRef.current(day.date)} />),
    // describe reads only days, model and formats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [days, model, formats, tabStop, selected]);

  const tipDay = active !== null ? days[active] : undefined;
  const tipValue = active !== null ? model.values[active] : undefined;
  const period = caption ?? `uptime, last ${days.length} days`;

  return <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")}>
    <div className={styles.header}>
      <div className={styles.service}>
        <span className={styles.name}>{label}</span>
        <span className={styles.state} data-status={current}>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.stateText}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={current} className={styles.stateLine} initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
                exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.3em", transition: { duration: motionTokens.duration.instant, ease: standard } }}
                transition={{ duration: reduced ? motionTokens.duration.fast : motionTokens.duration.standard, ease: enter }}>{HEADLINES[current]}</motion.span>
            </AnimatePresence>
          </span>
        </span>
      </div>
      <p className={styles.overall}>
        <span className={styles.percent}><CountUp value={overall} format={formats.overall} active={reveal !== "hidden"} reduced={reduced} /><span className={styles.sign} aria-hidden="true">%</span></span>
        <span className={styles.period} aria-hidden="true">{period}</span>
        <span className={styles.srOnly}>{formats.overall.format(overall)}% {period}</span>
      </p>
    </div>

    <div className={styles.track}>
      <div ref={stripRef} role="group" aria-label={`${label}: daily status, ${days.length} days`} className={styles.strip} data-reveal={reveal} data-highlight={highlight ?? undefined}
        style={{ "--active": open && active !== null ? active : -99, "--step": `${step}ms` } as CSSProperties}
        onPointerMove={onPointerMove} onPointerDown={onPointerMove} onPointerLeave={onPointerLeave} onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown}>
        {bars}
      </div>
      <div className={styles.axis} aria-hidden="true">
        <span>{days.length} days ago</span>
        <span className={styles.rule} />
        <span>Today</span>
      </div>
    </div>

    <div className={styles.legend} role="group" aria-label="Highlight days by status">
      {STATUSES.filter(status => model.counts[status] > 0).map(status => <button key={status} type="button" className={styles.key} data-status={status} aria-pressed={pinned === status}
        aria-label={`${NAMES[status]}: ${model.counts[status]} ${model.counts[status] === 1 ? "day" : "days"}`}
        onClick={() => setPinned(value => value === status ? null : status)}
        onPointerEnter={() => setPreview(status)} onPointerLeave={() => setPreview(null)} onFocus={() => setPreview(status)} onBlur={() => setPreview(null)}>
        <span className={styles.swatch} aria-hidden="true" />
        <span aria-hidden="true">{NAMES[status]}</span>
        <span className={styles.count} aria-hidden="true">{model.counts[status]}</span>
      </button>)}
    </div>

    <motion.div className={styles.tip} style={{ x: tipX, y: tipY }} aria-hidden="true">
      <motion.div className={styles.tipShift} style={{ x: shift }}>
        <motion.div ref={bubbleRef} className={styles.bubble} initial={false} animate={open && tipDay ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: reduced ? 1 : .96, y: reduced ? 0 : 4 }}
          transition={reduced ? { duration: motionTokens.duration.instant } : open ? { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: enter } } : { duration: motionTokens.duration.instant, ease: standard }}>
          {tipDay && <>
            <span className={styles.tipDate}>{formats.day.format(toUtc(tipDay.date))}</span>
            <span className={styles.tipState} data-status={tipDay.status}><span className={styles.swatch} />{NAMES[tipDay.status]}{tipValue != null && <span className={styles.tipValue}>{formats.percent.format(tipValue)}%</span>}</span>
            {tipDay.note && <span className={styles.tipNote}>{tipDay.note}</span>}
          </>}
        </motion.div>
      </motion.div>
    </motion.div>
  </div>;
}

export default StatusBar;
