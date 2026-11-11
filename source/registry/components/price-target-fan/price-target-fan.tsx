"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./price-target-fan.module.css";

export type PriceTargetKey = "high" | "median" | "low";

export interface PricePoint {
  /** Day of the close as YYYY-MM-DD. */
  date: string;
  /** Closing price. */
  value: number;
}

export interface PriceTargets {
  /** Most optimistic target. */
  high: number;
  /** Median of the targets. */
  median: number;
  /** Most cautious target. */
  low: number;
}

/**
 * A price history that fans out into analyst targets: the line draws up to the last close, then three dashed lines open
 * toward the high, median and low targets, each ending in a label with its price and distance from today. Hover or focus a
 * label to bring its scenario forward; scrub the history with the pointer or the arrow keys to read past closes.
 */
export interface PriceTargetFanProps {
  /** Price history, one point per close. Any order: the chart sorts by date. */
  history: PricePoint[];
  /** The three targets at the end of the horizon. */
  targets: PriceTargets;
  /** Accessible name of the chart, such as "Northwind price and 12-month analyst targets". */
  label: string;
  /** Day the targets refer to, as YYYY-MM-DD. Defaults to one year after the last close. */
  targetDate?: string;
  /** Currency code used by the default price format. */
  currency?: string;
  /** Formats a price. Defaults to the currency format of the locale. */
  formatValue?: (value: number) => string;
  /** Height of the chart in px, time axis included. */
  height?: number;
  /** Scenario brought forward, or null for none. Leave undefined to let the chart keep its own. */
  activeTarget?: PriceTargetKey | null;
  /** Scenario brought forward at first when the chart keeps its own. */
  defaultActiveTarget?: PriceTargetKey | null;
  /** Called when a target label is clicked: with its key, or null when the active one is clicked again. */
  onActiveTargetChange?: (target: PriceTargetKey | null) => void;
  /** Formatting locale. Fixed by default so server and client render the same labels. */
  locale?: string;
  /** Extra class for the root element. */
  className?: string;
}

const KEYS: PriceTargetKey[] = ["high", "median", "low"];
const NAMES: Record<PriceTargetKey, string> = { high: "High", median: "Median", low: "Low" };
const DAY = 86_400_000;
const AXIS = 26, TOP = 12;
/** Room one label needs, so three targets that sit close together still read apart. */
const LABEL = 40;
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const toUtc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

const noopSubscribe = () => () => {};
/** Reduced motion only after hydration, so the server and the first client render agree. */
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = useReducedMotion();
  return hydrated && !!reduced;
}

/** A round step for the price axis: 1, 2, 2.5 or 5 times a power of ten. */
function niceStep(rough: number) {
  const power = 10 ** Math.floor(Math.log10(Math.max(rough, 1e-9)));
  const unit = rough / power;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 2.5 ? 2.5 : unit <= 5 ? 5 : 10) * power;
}

/** Pushes label centers apart until each has its room, then keeps the group inside the plot. Input must be sorted. */
function spread(centers: number[], room: number, low: number, high: number) {
  const out = [...centers];
  for (let index = 1; index < out.length; index++) out[index] = Math.max(out[index]!, out[index - 1]! + room);
  const over = (out[out.length - 1] ?? 0) - high;
  if (over > 0) for (let index = out.length - 1; index >= 0; index--) out[index] = Math.min(out[index]! , high - (out.length - 1 - index) * room);
  for (let index = 0; index < out.length; index++) out[index] = Math.max(out[index]!, low + index * room);
  return out;
}

export function PriceTargetFan({ history, targets, label, targetDate, currency = "USD", formatValue, height = 300, activeTarget, defaultActiveTarget = null, onActiveTargetChange, locale = "en-US", className }: PriceTargetFanProps) {
  const reduced = useReducedMotionSafe();
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { once: true, amount: .3 });
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    setWidth(Math.round(node.clientWidth));
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(entries => { const next = entries[0]?.contentRect.width; if (next) setWidth(Math.round(next)); });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const formats = useMemo(() => {
    const money = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 });
    const round = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 });
    const change = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, signDisplay: "exceptZero" });
    return {
      value: formatValue ?? ((value: number) => money.format(value)),
      tick: formatValue ?? ((value: number) => round.format(value)),
      change: (value: number) => `${change.format(value)}%`,
      day: new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
      month: new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }),
    };
  }, [locale, currency, formatValue]);

  const model = useMemo(() => {
    const points = history.map(point => ({ ...point, time: toUtc(point.date) })).filter(point => Number.isFinite(point.time) && Number.isFinite(point.value)).sort((a, b) => a.time - b.time);
    const last = points[points.length - 1];
    const start = points[0]?.time ?? 0, now = last?.time ?? 0;
    const end = Math.max(now + DAY, targetDate ? toUtc(targetDate) : now + 365 * DAY);
    const all = [...points.map(point => point.value), targets.high, targets.median, targets.low];
    const least = Math.min(...all), most = Math.max(...all);
    const pad = (most - least) * .09 || 1;
    const low = least - pad, high = most + pad;
    const step = niceStep((high - low) / 4);
    const ticks: number[] = [];
    for (let value = Math.ceil(low / step) * step; value <= high; value += step) ticks.push(value);
    return { points, last, start, now, end, low, high, ticks };
  }, [history, targets, targetDate]);

  const lastValue = model.last?.value ?? 0;
  // The label column is as wide as its longest line, so a long price or a three-digit change never spills out of the chart.
  const gutter = useMemo(() => Math.ceil(Math.max(72, ...KEYS.map(key => Math.max(formats.value(targets[key]).length * 8.1, (NAMES[key].length + 1 + formats.change(lastValue ? (targets[key] / lastValue - 1) * 100 : 0).length) * 6.1) + 26))), [targets, formats, lastValue]);
  const plotW = Math.max(0, width - gutter), plotH = Math.max(0, height - AXIS);
  const xOf = (time: number) => model.end > model.start ? (time - model.start) / (model.end - model.start) * plotW : 0;
  const yOf = (value: number) => TOP + (model.high - value) / (model.high - model.low || 1) * (plotH - TOP);
  const nowX = xOf(model.now), nowY = model.last ? yOf(model.last.value) : plotH / 2;

  const line = useMemo(() => width ? model.points.map((point, index) => `${index ? "L" : "M"}${xOf(point.time).toFixed(1)} ${yOf(point.value).toFixed(1)}`).join("") : "",
    // xOf and yOf read only the model and the measured size.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, width, height, gutter]);

  const [reveal, setReveal] = useState<"hidden" | "shown">("hidden");
  useEffect(() => {
    if (reveal !== "hidden" || !width || !(inView || reduced)) return;
    const frame = requestAnimationFrame(() => setReveal("shown"));
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, reveal, width]);
  const ready = reveal === "shown";
  // A new history redraws its line; the fan glides from the old targets to the new ones.
  const [drawn, setDrawn] = useState({ history, count: 0 });
  if (drawn.history !== history) setDrawn({ history, count: drawn.count + 1 });

  const [internal, setInternal] = useState<PriceTargetKey | null>(defaultActiveTarget);
  const pinned = activeTarget !== undefined ? activeTarget : internal;
  const [preview, setPreview] = useState<PriceTargetKey | null>(null);
  const emphasis = preview ?? pinned;
  const pick = (key: PriceTargetKey) => {
    const next = pinned === key ? null : key;
    if (activeTarget === undefined) setInternal(next);
    onActiveTargetChange?.(next);
  };

  // Targets sorted from the top of the plot down, with label centers spread so they never overlap.
  const ends = useMemo(() => {
    const sorted = KEYS.map(key => ({ key, value: targets[key], y: yOf(targets[key]) })).sort((a, b) => a.y - b.y);
    const centers = spread(sorted.map(item => item.y), LABEL, LABEL / 2 - 4, plotH - LABEL / 2 + 8);
    return sorted.map((item, index) => ({ ...item, labelY: centers[index]!, change: lastValue ? (item.value / lastValue - 1) * 100 : 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets, model, plotH, lastValue]);
  const top = ends[0], bottom = ends[ends.length - 1];
  const cone = top && bottom ? `M${nowX.toFixed(1)} ${nowY.toFixed(1)}L${plotW.toFixed(1)} ${top.y.toFixed(1)}L${plotW.toFixed(1)} ${bottom.y.toFixed(1)}Z` : "";
  const folded = `M${nowX.toFixed(1)} ${nowY.toFixed(1)}L${nowX.toFixed(1)} ${nowY.toFixed(1)}L${nowX.toFixed(1)} ${nowY.toFixed(1)}Z`;
  const fanSpring = reduced ? { duration: 0 } : motionTokens.spring.smooth;

  // Scrubbing the history: one crosshair and one tooltip that glide between closes.
  const [scrub, setScrub] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const wasOpen = useRef(false);
  const tipX = useMotionValue(0), tipY = useMotionValue(0), shift = useMotionValue(0);
  const scrubIndex = scrub !== null ? Math.min(scrub, model.points.length - 1) : null;
  const scrubPoint = scrubIndex !== null ? model.points[scrubIndex] : undefined;
  const scrubX = scrubPoint ? xOf(scrubPoint.time) : 0, scrubY = scrubPoint ? yOf(scrubPoint.value) : 0;
  useLayoutEffect(() => {
    const root = rootRef.current, frame = frameRef.current, bubble = bubbleRef.current;
    if (!scrubPoint || !root || !frame || !bubble) return;
    const box = root.getBoundingClientRect(), plot = frame.getBoundingClientRect();
    const x = plot.left - box.left + scrubX, y = plot.top - box.top + scrubY;
    const half = bubble.offsetWidth / 2;
    const offset = Math.min(Math.max(x, half), Math.max(half, box.width - half)) - x;
    if (open && wasOpen.current && !reduced) {
      animate(tipX, x, motionTokens.spring.snappy);
      animate(tipY, y, motionTokens.spring.snappy);
      animate(shift, offset, motionTokens.spring.snappy);
    } else { tipX.jump(x); tipY.jump(y); shift.jump(offset); }
    wasOpen.current = open;
  }, [scrubPoint, scrubX, scrubY, open, reduced, tipX, tipY, shift]);

  function nearest(event: PointerEvent<HTMLDivElement>) {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().left;
    let best = 0, distance = Infinity;
    model.points.forEach((point, index) => { const gap = Math.abs(xOf(point.time) - x); if (gap < distance) { distance = gap; best = index; } });
    return best;
  }
  function onScrubMove(event: PointerEvent<HTMLDivElement>) {
    if (!model.points.length) return;
    const index = nearest(event);
    if (index !== scrub || !open) { setScrub(index); setOpen(true); }
  }
  function onScrubKey(event: KeyboardEvent<HTMLDivElement>) {
    const count = model.points.length;
    if (!count) return;
    const from = scrubIndex ?? count - 1;
    const moves: Record<string, number> = { ArrowLeft: from - 1, ArrowDown: from - 1, ArrowRight: from + 1, ArrowUp: from + 1, PageDown: from - 10, PageUp: from + 10, Home: 0, End: count - 1 };
    if (event.key in moves) {
      event.preventDefault();
      setScrub(Math.min(Math.max(moves[event.key]!, 0), count - 1));
      setOpen(true);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  const shownKey = emphasis ?? "median";
  const shownEnd = ends.find(item => item.key === shownKey);
  const axisDates = [
    { x: 0, anchor: "start" as const, text: formats.month.format(model.start) },
    { x: nowX, anchor: "middle" as const, text: "Today" },
    { x: plotW, anchor: "end" as const, text: formats.month.format(model.end) },
  ];
  const sliderValue = scrubIndex ?? Math.max(0, model.points.length - 1);
  const sliderPoint = model.points[sliderValue];

  return <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} data-emphasis={emphasis ?? undefined}>
    <div className={styles.header}>
      <p className={styles.stat}><span className={styles.statLabel}>Last close</span><span className={styles.statValue}>{formats.value(lastValue)}</span></p>
      {shownEnd && <p className={styles.stat} data-align="end" aria-live="polite"><span className={styles.statLabel}>{NAMES[shownKey]} target by {formats.month.format(model.end)}</span>
        <span className={styles.statValue}>{formats.value(shownEnd.value)}<span className={styles.statChange} data-sign={shownEnd.change > 0 ? "up" : shownEnd.change < 0 ? "down" : undefined}>{formats.change(shownEnd.change)}</span></span></p>}
    </div>

    <div ref={frameRef} className={styles.frame} style={{ height }}>
      {width > 0 && <>
        <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} aria-describedby={`${id}-summary`}>
          <g className={styles.grid}>
            {model.ticks.map(tick => <g key={tick}><line x1={0} x2={plotW} y1={yOf(tick)} y2={yOf(tick)} /><text x={0} y={yOf(tick) - 5}>{formats.tick(tick)}</text></g>)}
            {axisDates.map(item => <text key={item.anchor} x={item.x} y={plotH + 18} textAnchor={item.anchor}>{item.text}</text>)}
          </g>
          <line className={styles.today} x1={nowX} x2={nowX} y1={TOP} y2={plotH} />

          <motion.path className={styles.cone} initial={{ d: folded, opacity: 0 }} animate={{ d: ready ? cone : folded, opacity: ready ? 1 : 0 }} transition={reduced ? { duration: 0 } : { d: { ...motionTokens.spring.smooth, delay: wasShown(drawn.count, .38) }, opacity: { duration: motionTokens.duration.standard, delay: wasShown(drawn.count, .38) } }} />
          {ends.map((item, index) => <motion.path key={item.key} className={styles.ray} data-target={item.key}
            initial={{ d: `M${nowX.toFixed(1)} ${nowY.toFixed(1)}L${nowX.toFixed(1)} ${nowY.toFixed(1)}`, opacity: 0 }}
            animate={{ d: ready ? `M${nowX.toFixed(1)} ${nowY.toFixed(1)}L${plotW.toFixed(1)} ${item.y.toFixed(1)}` : `M${nowX.toFixed(1)} ${nowY.toFixed(1)}L${nowX.toFixed(1)} ${nowY.toFixed(1)}`, opacity: ready ? 1 : 0 }}
            transition={reduced ? { duration: 0 } : { d: { ...fanSpring, delay: wasShown(drawn.count, .38 + index * .05) }, opacity: { duration: motionTokens.duration.fast, delay: wasShown(drawn.count, .38 + index * .05) } }} />)}

          {line && <motion.path key={drawn.count} className={styles.line} d={line} initial={reduced ? false : { pathLength: 0, opacity: 0 }} animate={ready ? { pathLength: 1, opacity: 1 } : undefined} transition={{ duration: .5, ease: enter, opacity: { duration: motionTokens.duration.fast } }} />}

          {scrubPoint && <motion.g className={styles.cross} initial={false} animate={{ opacity: open ? 1 : 0 }} transition={{ duration: motionTokens.duration.instant }}>
            <motion.line x1={0} x2={0} y1={TOP} y2={plotH} initial={false} animate={{ x: scrubX }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy} />
            <motion.circle r={4.5} cx={0} cy={0} initial={false} animate={{ x: scrubX, y: scrubY }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy} />
          </motion.g>}

          {model.last && <motion.g initial={reduced ? false : { opacity: 0 }} animate={ready ? { opacity: 1 } : undefined} transition={{ duration: motionTokens.duration.fast, delay: .36 }}>
            <circle className={styles.pulse} cx={nowX} cy={nowY} r={5} />
            <circle className={styles.now} cx={nowX} cy={nowY} r={4.5} />
          </motion.g>}
          {ends.map((item, index) => <motion.g key={item.key} className={styles.end} data-target={item.key} initial={reduced ? false : { opacity: 0 }} animate={ready ? { opacity: 1 } : undefined} transition={{ duration: motionTokens.duration.fast, delay: wasShown(drawn.count, .6 + index * .05) }}>
            <motion.line x1={plotW} x2={plotW + 9} initial={false} animate={{ y1: item.y, y2: item.labelY }} transition={fanSpring} />
            <motion.circle cx={plotW} r={3.5} initial={false} animate={{ cy: item.y }} transition={fanSpring} />
          </motion.g>)}
        </svg>

        <div className={styles.scrub} style={{ width: nowX + 6, height: plotH }} role="slider" tabIndex={0} aria-label="Read past closes" aria-orientation="horizontal"
          aria-valuemin={0} aria-valuemax={Math.max(0, model.points.length - 1)} aria-valuenow={sliderValue} aria-valuetext={sliderPoint ? `${formats.day.format(sliderPoint.time)}: ${formats.value(sliderPoint.value)}` : undefined}
          onPointerMove={onScrubMove} onPointerDown={onScrubMove} onPointerLeave={event => { if (!event.currentTarget.matches(":focus-visible")) setOpen(false); }}
          onKeyDown={onScrubKey} onFocus={event => { if (event.currentTarget.matches(":focus-visible")) { setScrub(value => value ?? model.points.length - 1); setOpen(true); } }} onBlur={() => setOpen(false)} />

        <div className={styles.labels} role="group" aria-label="Analyst targets">
          {ends.map((item, index) => <motion.button key={item.key} type="button" className={styles.target} data-target={item.key} style={{ left: plotW + 12, width: gutter - 12 }} aria-pressed={pinned === item.key}
            aria-label={`${NAMES[item.key]} target ${formats.value(item.value)}, ${formats.change(item.change)} from the last close`}
            initial={reduced ? { y: item.labelY, opacity: 1 } : { y: item.labelY, opacity: 0, x: -8 }} animate={ready ? { y: item.labelY, opacity: 1, x: 0 } : { y: item.labelY }}
            transition={reduced ? { duration: 0 } : { y: fanSpring, default: { duration: motionTokens.duration.standard, ease: enter, delay: wasShown(drawn.count, .6 + index * .05) } }}
            onClick={() => pick(item.key)} onPointerEnter={() => setPreview(item.key)} onPointerLeave={() => setPreview(null)} onFocus={() => setPreview(item.key)} onBlur={() => setPreview(null)}>
            <span className={styles.targetValue}>{formats.value(item.value)}</span>
            <span className={styles.targetMeta}><span>{NAMES[item.key]}</span><span className={styles.targetChange} data-sign={item.change > 0 ? "up" : item.change < 0 ? "down" : undefined}>{formats.change(item.change)}</span></span>
          </motion.button>)}
        </div>
      </>}
    </div>

    <span id={`${id}-summary`} className={styles.srOnly}>Last close {formats.value(lastValue)}. Targets by {formats.month.format(model.end)}: {ends.map(item => `${NAMES[item.key].toLowerCase()} ${formats.value(item.value)}`).join(", ")}.</span>

    <motion.div className={styles.tip} style={{ x: tipX, y: tipY }} aria-hidden="true">
      <motion.div className={styles.tipShift} style={{ x: shift }}>
        <motion.div ref={bubbleRef} className={styles.bubble} initial={false} animate={open && scrubPoint ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: reduced ? 1 : .96, y: reduced ? 0 : 4 }}
          transition={reduced ? { duration: motionTokens.duration.instant } : open ? { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: enter } } : { duration: motionTokens.duration.instant, ease: standard }}>
          {scrubPoint && <>
            <span className={styles.tipDate}>{formats.day.format(scrubPoint.time)}</span>
            <span className={styles.tipValue}>{formats.value(scrubPoint.value)}</span>
          </>}
        </motion.div>
      </motion.div>
    </motion.div>
  </div>;
}

/** The first draw waits for the history line; later changes start at once. */
function wasShown(count: number, delay: number) { return count ? 0 : delay; }

export default PriceTargetFan;
