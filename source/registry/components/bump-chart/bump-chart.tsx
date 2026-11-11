"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./bump-chart.module.css";

export interface BumpSeries {
  /** Stable identity. A series that survives a data change keeps its line and slides to its new ranks. */
  key: string;
  /** Name at the end of the line, in the tooltip and in the table. */
  label: string;
  /** One value per period, in the order of `periods`. Ranks are worked out from these. */
  values: number[];
  /** Any CSS color. Series default to the shared --series-* palette in data order, then neutral steps. */
  color?: string;
}

/** Use a bump chart when the order matters more than the amounts: who led, who overtook whom, and when. */
export interface BumpChartProps {
  /** The items being ranked. */
  series: BumpSeries[];
  /** Label of each period on the axis, such as ["Jun", "Jul", "Aug"]. */
  periods: string[];
  /** What is ranked, such as "Regions ranked by monthly revenue". Names the chart for assistive technology. */
  label: string;
  /** "desc" ranks the highest value first; "asc" ranks the lowest first, for times or costs. */
  order?: "desc" | "asc";
  /** Vertical distance between two ranks in pixels. */
  rowHeight?: number;
  /** Formats the value behind a rank in the tooltip and the table. */
  formatValue?: (value: number) => string;
  /** Controlled key of the series brought forward, or null for none. The others fade while one is forward. */
  activeKey?: string | null;
  /** Series brought forward on first render when uncontrolled. */
  defaultActiveKey?: string | null;
  /** Called when hover, touch or the keyboard brings another series forward, or lets go. */
  onActiveChange?: (key: string | null) => void;
  /** Extra class on the root figure. */
  className?: string;
}

const { spring, duration, ease } = motionTokens;
const follow = { stiffness: 480, damping: 42, restDelta: .01 };
const PAD = 14, DOT = 4.5, RING = 10, DRAW = .6;
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const f = (value: number) => value.toFixed(1);
/** Neutral steps after the four series colors. */
const NEUTRAL = [58, 38, 24];
const seriesColor = (index: number) => index < 4 ? `var(--series-${index + 1})` : `color-mix(in oklab, var(--foreground) ${NEUTRAL[(index - 4) % NEUTRAL.length]}%, var(--surface))`;

const subscribeNothing = () => () => {};
/** Reduced motion is only known in the browser, so the first client render matches the server before it takes effect. */
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/** The chart draws in its own pixels: the width is read before paint and followed on resize. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const read = () => setWidth(node.clientWidth);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Rank of every series in every period, 1 being first. Ties keep the order the series were given in. */
function rankTable(series: BumpSeries[], periods: number, order: "desc" | "asc") {
  const table = series.map(() => Array.from({ length: periods }, () => 1));
  const worst = order === "asc" ? Infinity : -Infinity;
  for (let period = 0; period < periods; period++) {
    const sorted = series.map((item, at) => ({ at, value: item.values[period] ?? worst })).sort((a, b) => (order === "asc" ? a.value - b.value : b.value - a.value) || a.at - b.at);
    sorted.forEach((entry, place) => { const row = table[entry.at]; if (row) row[period] = place + 1; });
  }
  return table;
}

export function BumpChart({ series, periods, label, order = "desc", rowHeight = 40, formatValue = value => grouped.format(value), activeKey, defaultActiveKey = null, onActiveChange, className }: BumpChartProps) {
  const reduced = useReducedMotionSafe();
  const figure = useRef<HTMLElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const [plot, width] = useWidth<HTMLDivElement>();
  const inView = useInView(figure, { once: true, amount: .3 });
  const shown = inView || reduced;
  const titleId = useId();
  const spans = periods.length, lastPeriod = Math.max(0, spans - 1), height = series.length * rowHeight;
  const ranks = useMemo(() => rankTable(series, spans, order), [series, spans, order]);

  const [inner, setInner] = useState<string | null>(defaultActiveKey);
  const [period, setPeriod] = useState(lastPeriod);
  const wanted = activeKey !== undefined ? activeKey : inner;
  const found = series.findIndex(item => item.key === wanted);
  const index = found < 0 ? null : found;
  const at = clamp(period, 0, lastPeriod);
  const setActive = (next: number | null, when?: number) => {
    if (when !== undefined && when !== period) setPeriod(when);
    if (next === index) return;
    const key = next === null ? null : series[next]?.key ?? null;
    if (activeKey === undefined) setInner(key);
    onActiveChange?.(key);
  };

  const xOf = (when: number) => spans > 1 ? PAD + (when / (spans - 1)) * Math.max(0, width - PAD * 2) : width / 2;
  const yOf = (rank: number) => (rank - .5) * rowHeight;
  /** Flat through each period, an S-curve between two, so a swap reads as two lines crossing halfway. */
  const linePath = (row: number[]) => {
    let d = `M${f(xOf(0))} ${f(yOf(row[0] ?? 1))}`;
    for (let when = 0; when < spans - 1; when++) {
      const x0 = xOf(when), x1 = xOf(when + 1), flat = (x1 - x0) * .16, middle = (x0 + x1) / 2, y0 = yOf(row[when] ?? 1), y1 = yOf(row[when + 1] ?? 1);
      d += `H${f(x0 + flat)}C${f(middle)} ${f(y0)} ${f(middle)} ${f(y1)} ${f(x1 - flat)} ${f(y1)}H${f(x1)}`;
    }
    return d;
  };
  const colorOf = (item: BumpSeries, place: number) => item.color ?? seriesColor(place);

  // The first reveal draws every line from the first period to the last; later data changes slide at once.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!shown || settled) return;
    const timer = setTimeout(() => setSettled(true), 1000);
    return () => clearTimeout(timer);
  }, [settled, shown]);
  const lineDelay = (place: number) => settled ? 0 : Math.min(place * .035, .2);
  const dotDelay = (when: number, place: number) => settled ? 0 : lineDelay(place) + (spans > 1 ? when / (spans - 1) : 0) * DRAW * .85;

  const activeRow = index === null ? null : ranks[index] ?? null, activeItem = index === null ? null : series[index] ?? null;
  const anchorX = activeRow ? xOf(at) : null, anchorY = activeRow ? yOf(activeRow[at] ?? 1) : null;
  const tipX = useMotionValue(0), tipY = useMotionValue(0);
  const glideX = useSpring(tipX, follow), glideY = useSpring(tipY, follow);
  const wasOpen = useRef(false);
  const [lastShown, setLastShown] = useState<number | null>(index);
  if (index !== null && index !== lastShown) setLastShown(index);
  const tipIndex = index ?? lastShown;
  const tipItem = tipIndex === null ? null : series[tipIndex] ?? null, tipRow = tipIndex === null ? null : ranks[tipIndex] ?? null;
  useLayoutEffect(() => {
    if (anchorX === null || anchorY === null || !width) { wasOpen.current = false; return; }
    const node = tooltip.current, w = node?.offsetWidth ?? 180, h = node?.offsetHeight ?? 90;
    const x = clamp(anchorX - w / 2, 0, Math.max(0, width - w)), y = anchorY - h - RING - 8 < -56 ? anchorY + RING + 8 : anchorY - h - RING - 8;
    tipX.set(x); tipY.set(y);
    if (!wasOpen.current || reduced) { glideX.jump(x); glideY.jump(y); }
    wasOpen.current = true;
  }, [anchorX, anchorY, glideX, glideY, index, reduced, tipX, tipY, width]);

  const pointAt = (event: PointerEvent<HTMLDivElement>) => {
    const rect = plot.current?.getBoundingClientRect();
    if (!rect || !series.length || !spans) return;
    const when = spans > 1 ? clamp(Math.round(((event.clientX - rect.left - PAD) / Math.max(1, rect.width - PAD * 2)) * (spans - 1)), 0, lastPeriod) : 0;
    const rank = clamp(Math.floor((event.clientY - rect.top) / rowHeight) + 1, 1, series.length);
    const next = ranks.findIndex(row => row[when] === rank);
    setActive(next < 0 ? null : next, when);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && index !== null) { event.preventDefault(); setActive(null); return; }
    if (!series.length || !spans) return;
    const rank = activeRow?.[at] ?? 0;
    const byRank = (place: number) => ranks.findIndex(row => row[at] === clamp(place, 1, series.length));
    const move = ({ ArrowDown: () => setActive(byRank(rank + 1)), ArrowUp: () => setActive(byRank(Math.max(1, rank - 1))), ArrowRight: () => setActive(index ?? byRank(1), Math.min(lastPeriod, at + 1)), ArrowLeft: () => setActive(index ?? byRank(1), Math.max(0, at - 1)), Home: () => setActive(index ?? byRank(1), 0), End: () => setActive(index ?? byRank(1), lastPeriod) } as Record<string, () => void>)[event.key];
    if (!move) return;
    event.preventDefault();
    move();
  };

  const ordinal = (rank: number) => `${rank}${rank % 100 >= 11 && rank % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][rank % 10] ?? "th"}`;
  const movement = (row: number[], when: number) => {
    const now = row[when] ?? 1, before = when > 0 ? row[when - 1] : undefined;
    if (before === undefined) return "First period";
    return before === now ? `Same place as ${periods[when - 1]}` : `${before > now ? "Up" : "Down"} ${Math.abs(before - now)} from ${periods[when - 1]}`;
  };
  const describe = (item: BumpSeries, row: number[], when: number) => `${item.label}, ${periods[when]}: ${ordinal(row[when] ?? 1)} of ${series.length}${item.values[when] !== undefined ? `, ${formatValue(item.values[when])}` : ""}. ${movement(row, when)}.`;
  const reading = activeItem && activeRow ? describe(activeItem, activeRow, at) : series[0] && ranks[0] ? describe(series[0], ranks[0], lastPeriod) : "No data";
  const instant = { duration: 0 } as const;
  const quick = reduced ? instant : { duration: duration.fast, ease: [...ease.standard] } as const;

  return <figure ref={figure} className={[styles.figure, className].filter(Boolean).join(" ")} aria-labelledby={titleId}>
    <figcaption id={titleId} className={styles.srOnly}>{label}</figcaption>
    <div className={styles.chart} data-active={index !== null ? "" : undefined}>
      <div className={styles.ranks} style={{ height }} aria-hidden="true">
        {series.map((_, place) => <span key={place} className={styles.rank} data-on={activeRow?.[at] === place + 1 ? "" : undefined} style={{ top: yOf(place + 1) }}>{place + 1}</span>)}
      </div>
      <div ref={plot} className={styles.plot} style={{ height }}>
        {width > 0 && <svg className={styles.svg} width={width} height={height} aria-hidden="true">
          {periods.map((_, when) => <line key={when} className={styles.grid} data-on={index !== null && when === at ? "" : undefined} x1={Math.round(xOf(when)) + .5} x2={Math.round(xOf(when)) + .5} y1={0} y2={height} />)}
          {series.map((item, place) => {
            const row = ranks[place] ?? [], d = linePath(row), color = colorOf(item, place);
            return <g key={item.key} className={styles.series}>
              <motion.path className={styles.line} style={{ stroke: color }} initial={{ d, pathLength: reduced ? 1 : 0 }} animate={{ d, pathLength: shown ? 1 : 0 }} transition={reduced ? instant : { d: spring.smooth, pathLength: { duration: DRAW, ease: [...ease.inOut], delay: lineDelay(place) } }} />
              {row.map((rank, when) => <motion.g key={when} initial={{ x: xOf(when), y: yOf(rank) }} animate={{ x: xOf(when), y: yOf(rank) }} transition={reduced ? instant : spring.smooth}>
                <motion.circle className={styles.dot} r={DOT} style={{ fill: color }} initial={{ scale: reduced ? 1 : 0 }} animate={{ scale: shown ? 1 : 0 }} transition={reduced ? instant : { ...spring.snappy, delay: dotDelay(when, place) }} />
              </motion.g>)}
            </g>;
          })}
          {/* The series in focus is drawn again on top: a heavier line and a ring at each period with its rank inside. */}
          <AnimatePresence>
            {activeItem && activeRow && index !== null && <motion.g key={activeItem.key} className={styles.forward} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={quick}>
              <motion.path className={styles.lineOn} style={{ stroke: colorOf(activeItem, index) }} initial={{ d: linePath(activeRow) }} animate={{ d: linePath(activeRow) }} transition={reduced ? instant : spring.smooth} />
              {activeRow.map((rank, when) => <motion.g key={when} initial={{ x: xOf(when), y: yOf(rank) }} animate={{ x: xOf(when), y: yOf(rank) }} transition={reduced ? instant : spring.smooth}>
                <motion.circle className={styles.ring} data-on={when === at ? "" : undefined} r={RING} style={{ stroke: colorOf(activeItem, index) }} initial={{ scale: reduced ? 1 : .5 }} animate={{ scale: 1 }} transition={reduced ? instant : spring.snappy} />
                <text className={styles.place} textAnchor="middle" dominantBaseline="central">{rank}</text>
              </motion.g>)}
            </motion.g>}
          </AnimatePresence>
        </svg>}
        <motion.div ref={tooltip} className={styles.tooltip} style={{ x: glideX, y: glideY }} aria-hidden="true">
          {tipItem && tipRow && tipIndex !== null && <>
            <p className={styles.tipTitle}><span className={styles.swatch} style={{ background: colorOf(tipItem, tipIndex) }} />{tipItem.label}</p>
            <p className={styles.tipRow}><span className={styles.tipName}>{periods[at]}</span><span className={styles.tipValue}>{ordinal(tipRow[at] ?? 1)} of {series.length}</span></p>
            {tipItem.values[at] !== undefined && <p className={styles.tipRow}><span className={styles.tipName}>Value</span><span className={styles.tipValue}>{formatValue(tipItem.values[at])}</span></p>}
            <p className={styles.tipMeta}>{movement(tipRow, at)}</p>
          </>}
        </motion.div>
      </div>
      <div className={styles.ends} style={{ height }} aria-hidden="true">
        {series.map((item, place) => <motion.span key={item.key} className={styles.end} data-on={index === place ? "" : undefined} initial={{ opacity: reduced ? 1 : 0, y: yOf(ranks[place]?.[lastPeriod] ?? 1) }} animate={{ opacity: shown ? 1 : 0, y: yOf(ranks[place]?.[lastPeriod] ?? 1) }} transition={reduced ? instant : { y: spring.smooth, opacity: { duration: duration.standard, delay: settled ? 0 : DRAW * .8 } }}>
          <span className={styles.endText}>{item.label}</span>
        </motion.span>)}
        {/* The widest name holds the column open, so it never changes width as labels trade places. */}
        <span className={styles.sizer}>{series.map(item => <span key={item.key}>{item.label}</span>)}</span>
      </div>
      <div className={styles.axis} aria-hidden="true">
        {width > 0 && periods.map((text, when) => <span key={when} className={styles.axisLabel} data-on={index !== null && when === at ? "" : undefined} style={{ left: xOf(when) }}>{text}</span>)}
      </div>
      {/* The scrubber lies over the lines and their names: hover or tap a line, or focus it and use the arrow keys. */}
      <div className={styles.scrubber} style={{ height }} role="slider" tabIndex={0} aria-label={`${label}, explore by series and period`} aria-orientation="vertical" aria-valuemin={1} aria-valuemax={Math.max(1, series.length)} aria-valuenow={activeRow?.[at] ?? 1} aria-valuetext={reading}
        onPointerDown={pointAt} onPointerMove={event => { if (event.pointerType === "mouse" || event.buttons) pointAt(event); }}
        onPointerLeave={event => { if (event.pointerType === "mouse") setActive(null); }} onPointerCancel={() => setActive(null)} onKeyDown={onKeyDown} onBlur={() => setActive(null)}
        onFocus={event => { if (event.currentTarget.matches(":focus-visible") && series.length && index === null) setActive(ranks.findIndex(row => row[lastPeriod] === 1), lastPeriod); }} />
    </div>
    <div className={styles.srOnly}><table>
      <caption>{label}</caption>
      <thead><tr><th scope="col">Series</th>{periods.map((text, when) => <th key={when} scope="col">{text}</th>)}</tr></thead>
      <tbody>{series.map((item, place) => <tr key={item.key}><th scope="row">{item.label}</th>{periods.map((_, when) => <td key={when}>{ordinal(ranks[place]?.[when] ?? 1)}{item.values[when] !== undefined ? ` (${formatValue(item.values[when])})` : ""}</td>)}</tr>)}</tbody>
    </table></div>
  </figure>;
}

export default BumpChart;
