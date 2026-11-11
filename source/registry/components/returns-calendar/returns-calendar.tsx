"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, PointerEvent } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./returns-calendar.module.css";

export interface DailyReturn {
  /** Trading day as YYYY-MM-DD. */
  date: string;
  /** Return of the day in percent: 1.2 means the day closed 1.2% up. */
  value: number;
}

/**
 * A calendar of daily returns: one small month per card, one cell per trading day, tinted by how much the day gained or
 * lost, with the total of each month beside its name. Months rise in one after another and their cells follow in a wave;
 * a tooltip glides between days with the day and its month to date. Arrow keys walk the days, and a click selects one.
 */
export interface ReturnsCalendarProps {
  /** One entry per trading day, in any order. Days without an entry are drawn as closed. */
  returns: DailyReturn[];
  /** Accessible name of the calendar, such as "Daily returns, first half of 2026". */
  label: string;
  /** Text beside the overall total. Defaults to the range of months the data covers. */
  period?: string;
  /** Shows Saturday and Sunday columns. Off by default, for markets that close on weekends. */
  weekends?: boolean;
  /** Return in percent at which the color saturates. Defaults to a high percentile of the data. */
  scale?: number;
  /** Compounds daily returns into the totals. Set false to add them up instead. */
  compound?: boolean;
  /** Selected day as YYYY-MM-DD, or null for none. Leave undefined to let the calendar keep its own selection. */
  selectedDate?: string | null;
  /** Day selected at first when the calendar keeps its own selection. */
  defaultSelectedDate?: string | null;
  /** Called with the day that was clicked, or null when the selected day is clicked again. */
  onSelectDate?: (date: string | null) => void;
  /** Formatting locale. Fixed by default so server and client render the same labels. */
  locale?: string;
  /** Extra class for the root element. */
  className?: string;
}

type Day = { date: string; value: number; level: number; toDate: number; index: number };
type Slot = { key: string; col: number; row: number; day?: Day };
type Month = { key: string; name: string; total: number; slots: Slot[] };

const DAY = 86_400_000;
const STEPS = 4;
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const toUtc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const total = (values: number[], compound: boolean) => compound ? (values.reduce((growth, value) => growth * (1 + value / 100), 1) - 1) * 100 : values.reduce((sum, value) => sum + value, 0);

const noopSubscribe = () => () => {};
/** Reduced motion only after hydration, so the server and the first client render agree. */
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = useReducedMotion();
  return hydrated && !!reduced;
}

/** The overall total counts to its value once the calendar is on view, and glides when the data changes. */
function CountTo({ value, format, active, reduced }: { value: number; format: (value: number) => string; active: boolean; reduced: boolean }) {
  const [shown, setShown] = useState(value);
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    const from = last.current ?? 0;
    last.current = value;
    if (reduced || from === value) { setShown(value); return; }
    const controls = animate(from, value, { duration: .8, ease: enter, onUpdate: setShown });
    return () => controls.stop();
  }, [value, active, reduced]);
  return <span aria-hidden="true">{format(active ? shown : value)}</span>;
}

export function ReturnsCalendar({ returns, label, period, weekends = false, scale, compound = true, selectedDate, defaultSelectedDate = null, onSelectDate, locale = "en-US", className }: ReturnsCalendarProps) {
  const reduced = useReducedMotionSafe();
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, amount: .2 });
  const columns = weekends ? 7 : 5;

  const formats = useMemo(() => {
    const percent = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero" });
    const plain = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    return {
      percent: (value: number) => `${percent.format(value)}%`,
      plain: (value: number) => plain.format(value),
      month: new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }),
      monthYear: new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }),
      day: new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
      long: new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" }),
    };
  }, [locale]);

  const model = useMemo(() => {
    const sorted = returns.filter(entry => Number.isFinite(toUtc(entry.date)) && Number.isFinite(entry.value)).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
    // The color saturates near the 95th percentile of the moves, so one outlier does not wash out every other day.
    const moves = sorted.map(entry => Math.abs(entry.value)).sort((a, b) => a - b);
    const top = scale ?? (Math.max(.01, moves[Math.min(moves.length - 1, Math.floor(moves.length * .95))] ?? 1));
    const byMonth = new Map<string, DailyReturn[]>();
    sorted.forEach(entry => { const key = entry.date.slice(0, 7); byMonth.set(key, [...(byMonth.get(key) ?? []), entry]); });
    const days: Day[] = [];
    const months: Month[] = [...byMonth.entries()].map(([key, entries]) => {
      const first = toUtc(`${key}-01`);
      const year = Number(key.slice(0, 4)), month = Number(key.slice(5, 7));
      const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const lead = (new Date(first).getUTCDay() + 6) % 7;
      const known = new Map<string, Day>();
      entries.forEach((entry, order) => {
        const steps = Math.abs(entry.value) < 1e-9 ? 0 : Math.min(STEPS, Math.max(1, Math.ceil(Math.abs(entry.value) / top * STEPS)));
        const day: Day = { date: entry.date, value: entry.value, level: entry.value < 0 ? -steps : steps, toDate: total(entries.slice(0, order + 1).map(item => item.value), compound), index: days.length };
        days.push(day);
        known.set(entry.date, day);
      });
      const slots: Slot[] = [];
      for (let date = 1; date <= length; date++) {
        const col = (lead + date - 1) % 7;
        if (col >= columns) continue;
        const iso = `${key}-${String(date).padStart(2, "0")}`;
        slots.push({ key: iso, col, row: Math.floor((lead + date - 1) / 7), day: known.get(iso) });
      }
      // A month that opens on a weekend would leave an empty first row when weekends are hidden.
      const firstRow = slots[0]?.row ?? 0;
      slots.forEach(slot => { slot.row -= firstRow; });
      return { key, name: formats.month.format(first), total: total(entries.map(entry => entry.value), compound), slots };
    });
    const values = sorted.map(entry => entry.value);
    const best = days.reduce<Day | undefined>((top, day) => !top || day.value > top.value ? day : top, undefined);
    const worst = days.reduce<Day | undefined>((low, day) => !low || day.value < low.value ? day : low, undefined);
    const firstDate = sorted[0]?.date, lastDate = sorted[sorted.length - 1]?.date;
    const range = firstDate && lastDate ? firstDate.slice(0, 7) === lastDate.slice(0, 7) ? formats.monthYear.format(toUtc(firstDate)) : `${(firstDate.slice(0, 4) === lastDate.slice(0, 4) ? formats.month : formats.monthYear).format(toUtc(firstDate))} to ${formats.monthYear.format(toUtc(lastDate))}` : "";
    return { months, days, top, overall: total(values, compound), best, worst, up: values.filter(value => value > 0).length, range };
  }, [returns, scale, compound, columns, formats]);

  const [reveal, setReveal] = useState<"hidden" | "revealing" | "done">("hidden");
  useEffect(() => {
    if (reveal !== "hidden" || !(inView || reduced)) return;
    const frame = requestAnimationFrame(() => setReveal(reduced ? "done" : "revealing"));
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, reveal]);
  useEffect(() => {
    if (reveal !== "revealing") return;
    const timer = window.setTimeout(() => setReveal("done"), 1100);
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

  // One tooltip for every month. It jumps into place when it opens and glides between days after that.
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const wasOpen = useRef(false);
  const hideTimer = useRef(0);
  const tipX = useMotionValue(0), tipY = useMotionValue(0), shift = useMotionValue(0);
  const show = (index: number) => { window.clearTimeout(hideTimer.current); setActive(index); setOpen(true); };
  const hideSoon = (delay = 110) => { window.clearTimeout(hideTimer.current); hideTimer.current = window.setTimeout(() => setOpen(false), delay); };
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);
  const tipDay = active !== null ? model.days[active] : undefined;

  useLayoutEffect(() => {
    const root = rootRef.current, bubble = bubbleRef.current;
    if (active === null || !root || !bubble) return;
    const cell = gridRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!cell) return;
    const box = root.getBoundingClientRect(), at = cell.getBoundingClientRect();
    const x = at.left - box.left + at.width / 2, y = at.top - box.top;
    const half = bubble.offsetWidth / 2;
    const offset = Math.min(Math.max(x, half), Math.max(half, box.width - half)) - x;
    if (open && wasOpen.current && !reduced) {
      animate(tipX, x, motionTokens.spring.snappy);
      animate(tipY, y, motionTokens.spring.snappy);
      animate(shift, offset, motionTokens.spring.snappy);
    } else { tipX.jump(x); tipY.jump(y); shift.jump(offset); }
    wasOpen.current = open;
  }, [active, open, reduced, tipX, tipY, shift, tipDay]);

  const indexOf = (element: Element | null) => {
    const cell = element?.closest<HTMLElement>("[data-index]");
    return cell && gridRef.current?.contains(cell) ? Number(cell.dataset.index) : null;
  };
  function onPointerOver(event: PointerEvent<HTMLDivElement>) {
    const index = indexOf(event.target as Element);
    if (index !== null) show(index);
  }
  function onPointerLeave(event: PointerEvent<HTMLDivElement>) {
    const focused = document.activeElement?.matches(":focus-visible") ? indexOf(document.activeElement) : null;
    if (focused !== null) show(focused);
    else hideSoon(event.pointerType === "touch" ? 2200 : 110);
  }
  function onFocus(event: FocusEvent<HTMLDivElement>) {
    const index = indexOf(event.target);
    if (index === null) return;
    setFocusIndex(index);
    show(index);
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = indexOf(event.target as Element);
    if (index === null) return;
    const moves: Record<string, number> = { ArrowLeft: index - 1, ArrowRight: index + 1, ArrowUp: index - columns, ArrowDown: index + columns, Home: 0, End: model.days.length - 1 };
    if (event.key in moves) {
      event.preventDefault();
      const next = Math.min(Math.max(moves[event.key]!, 0), model.days.length - 1);
      gridRef.current?.querySelector<HTMLElement>(`[data-index="${next}"]`)?.focus();
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  const tabStop = focusIndex !== null && focusIndex < model.days.length ? focusIndex : Math.max(0, model.days.length - 1);
  const weekdayNames = useMemo(() => Array.from({ length: columns }, (_, col) => formats.weekday.format(new Date((4 + col) * DAY))), [columns, formats]);
  const months = useMemo(() => model.months.map((month, order) => <section key={month.key} className={styles.month} style={{ "--m": order } as CSSProperties} aria-label={`${formats.monthYear.format(toUtc(`${month.key}-01`))}: ${formats.percent(month.total)}`}>
    <header className={styles.monthHead}>
      <span className={styles.monthName}>{month.name}</span>
      <span className={styles.monthTotal} data-sign={month.total > 0 ? "up" : month.total < 0 ? "down" : undefined}>{formats.percent(month.total)}</span>
    </header>
    <div className={styles.weekdays} aria-hidden="true">{weekdayNames.map((name, col) => <span key={col}>{name}</span>)}</div>
    <div className={styles.days}>
      {month.slots.map(slot => {
        const place = { gridColumn: slot.col + 1, gridRow: slot.row + 1, "--w": slot.col + slot.row } as CSSProperties;
        if (!slot.day) return <span key={slot.key} className={styles.day} data-closed="" style={place} aria-hidden="true" />;
        const { day } = slot;
        return <button key={slot.key} type="button" className={styles.day} style={place} data-index={day.index} data-level={day.level} tabIndex={day.index === tabStop ? 0 : -1} aria-pressed={day.date === selected}
          aria-label={`${formats.long.format(toUtc(day.date))}: ${day.value > 0 ? "up" : day.value < 0 ? "down" : "flat"} ${formats.percent(Math.abs(day.value)).replace("+", "")}`}
          onClick={() => selectRef.current(day.date)} />;
      })}
    </div>
  </section>), [model, formats, weekdayNames, tabStop, selected]);

  const swatches = [...Array.from({ length: STEPS }, (_, step) => step - STEPS), 0, ...Array.from({ length: STEPS }, (_, step) => step + 1)];
  const span = period ?? model.range;

  return <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")}>
    <div className={styles.header}>
      <p className={styles.overall}>
        <span className={styles.overallValue} data-sign={model.overall > 0 ? "up" : model.overall < 0 ? "down" : undefined}><CountTo value={model.overall} format={formats.percent} active={reveal !== "hidden"} reduced={reduced} /></span>
        <span className={styles.overallLabel} aria-hidden="true">{span}</span>
        <span className={styles.srOnly}>{formats.percent(model.overall)} total return, {span}</span>
      </p>
      <dl className={styles.facts}>
        {model.best && <div><dt>Best day</dt><dd data-sign="up">{formats.percent(model.best.value)}</dd></div>}
        {model.worst && <div><dt>Worst day</dt><dd data-sign="down">{formats.percent(model.worst.value)}</dd></div>}
        <div><dt>Days up</dt><dd>{model.up} of {model.days.length}</dd></div>
      </dl>
    </div>

    <div ref={gridRef} role="group" aria-label={label} className={styles.months} data-reveal={reveal} style={{ "--columns": columns } as CSSProperties}
      onPointerOver={onPointerOver} onPointerLeave={onPointerLeave} onFocus={onFocus} onBlur={event => { if (!gridRef.current?.contains(event.relatedTarget as Node | null)) hideSoon(0); }} onKeyDown={onKeyDown}>
      {months}
    </div>

    <div className={styles.legend} aria-hidden="true">
      <span>−{formats.plain(model.top)}%</span>
      <span className={styles.swatches}>{swatches.map(level => <span key={level} className={styles.swatch} data-level={level} />)}</span>
      <span>+{formats.plain(model.top)}%</span>
      <span className={styles.closedKey}><span className={styles.swatch} data-closed="" />Closed</span>
    </div>

    <motion.div className={styles.tip} style={{ x: tipX, y: tipY }} aria-hidden="true">
      <motion.div className={styles.tipShift} style={{ x: shift }}>
        <motion.div ref={bubbleRef} className={styles.bubble} initial={false} animate={open && tipDay ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: reduced ? 1 : .96, y: reduced ? 0 : 4 }}
          transition={reduced ? { duration: motionTokens.duration.instant } : open ? { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: enter } } : { duration: motionTokens.duration.instant, ease: standard }}>
          {tipDay && <>
            <span className={styles.tipDate}>{formats.day.format(toUtc(tipDay.date))}</span>
            <span className={styles.tipValue} data-sign={tipDay.value > 0 ? "up" : tipDay.value < 0 ? "down" : undefined}>{formats.percent(tipDay.value)}</span>
            <span className={styles.tipNote}>Month to date {formats.percent(tipDay.toDate)}</span>
          </>}
        </motion.div>
      </motion.div>
    </motion.div>
  </div>;
}

export default ReturnsCalendar;
