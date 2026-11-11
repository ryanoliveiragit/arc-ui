"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./volume-profile.module.css";

export interface VolumePoint {
  /** Stable identity, such as an ISO timestamp. */
  key: string;
  /** Full label for screen readers, such as "Nov 10, 10:35". */
  label: string;
  /** Short label under the price line, such as "10:00". Leave it out on most points to keep the axis quiet. */
  axisLabel?: string;
  /** Price traded in this interval. */
  price: number;
  /** Volume traded in this interval. It is added to the price level the price falls in. */
  volume: number;
}

/** Use a volume profile to show at which prices trading concentrated, next to how the price moved over time. */
export interface VolumeProfileProps {
  /** Trades or intervals in time order, oldest first. */
  data: VolumePoint[];
  /** What is traded, such as "Northwind Corp." Names the chart for assistive technology and heads the readout. */
  label: string;
  /** Number of price levels the range is split into. */
  levels?: number;
  /** Share of the total volume that defines the value area around the point of control, from 0 to 1. */
  valueArea?: number;
  /** Plot height in pixels. */
  height?: number;
  /** Formats prices on the axis, in the header and in the tooltip. */
  formatPrice?: (value: number) => string;
  /** Formats volumes in the header and in the tooltip. */
  formatVolume?: (value: number) => string;
  /** Hides the headline with the point of control and the value area. */
  hideHeader?: boolean;
  /** Controlled index of the price level in focus, counted from the lowest price, or null for none. */
  activeLevel?: number | null;
  /** Price level in focus on first render when uncontrolled. */
  defaultActiveLevel?: number | null;
  /** Called when hover, touch or the keyboard moves to another price level, or leaves the plot. */
  onActiveChange?: (level: number | null) => void;
  /** Extra class on the root figure. */
  className?: string;
}

type Level = { index: number; low: number; high: number; volume: number };

const { spring, duration, ease } = motionTokens;
const follow = { stiffness: 480, damping: 42, restDelta: .01 };
const EDGE = 6, RADIUS = 3, DRAW = .6;
const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const f = (value: number) => value.toFixed(2);

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

/** Splits the price range into equal levels, adds each interval's volume to its level, and grows the value area outward from the busiest level. */
function buildProfile(data: VolumePoint[], count: number, share: number) {
  const min = data.reduce((low, item) => Math.min(low, item.price), Infinity), max = data.reduce((high, item) => Math.max(high, item.price), -Infinity);
  const low = Number.isFinite(min) ? min : 0, high = Number.isFinite(max) && max > low ? max : low + 1, step = (high - low) / count;
  const rows: Level[] = Array.from({ length: count }, (_, index) => ({ index, low: low + index * step, high: low + (index + 1) * step, volume: 0 }));
  for (const item of data) { const row = rows[clamp(Math.floor((item.price - low) / step), 0, count - 1)]; if (row) row.volume += Math.max(0, item.volume); }
  const total = rows.reduce((sum, row) => sum + row.volume, 0);
  const poc = rows.reduce((best, row) => row.volume > (rows[best]?.volume ?? 0) ? row.index : best, 0);
  let from = poc, to = poc, inside = rows[poc]?.volume ?? 0;
  while (inside < total * share && (from > 0 || to < count - 1)) {
    const below = from > 0 ? rows[from - 1]?.volume ?? 0 : -1, above = to < count - 1 ? rows[to + 1]?.volume ?? 0 : -1;
    if (above >= below) { to += 1; inside += above; } else { from -= 1; inside += below; }
  }
  return { rows, low, high, total, poc, from, to, peak: rows[poc]?.volume ?? 0 };
}

/** Round prices inside the range for the axis: steps of 1, 2, 2.5 or 5 times a power of ten, about four of them. */
function roundTicks(low: number, high: number) {
  const raw = (high - low) / 4, magnitude = 10 ** Math.floor(Math.log10(Math.max(raw, 1e-9)));
  const step = ([1, 2, 2.5, 5, 10].find(factor => factor * magnitude >= raw) ?? 10) * magnitude;
  const ticks: number[] = [];
  for (let value = Math.ceil(low / step) * step; value <= high + step * 1e-6; value += step) ticks.push(Number(value.toFixed(8)));
  return ticks;
}

/** A bar that leaves a square edge at the shared axis and rounds its far end. */
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(RADIUS, Math.max(0, w), h / 2);
  return `M${f(x)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x)}Z`;
}

export function VolumeProfile({ data, label, levels = 16, valueArea = .7, height = 260, formatPrice = value => money.format(value), formatVolume = value => compact.format(value), hideHeader = false, activeLevel, defaultActiveLevel = null, onActiveChange, className }: VolumeProfileProps) {
  const reduced = useReducedMotionSafe();
  const figure = useRef<HTMLElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const [plot, width] = useWidth<HTMLDivElement>();
  const inView = useInView(figure, { once: true, amount: .3 });
  const shown = inView || reduced;
  const titleId = useId();
  const count = Math.max(2, Math.round(levels));
  const profile = useMemo(() => buildProfile(data, count, clamp(valueArea, 0, 1)), [data, count, valueArea]);
  const top = count - 1;

  const [inner, setInner] = useState<number | null>(defaultActiveLevel);
  const wanted = activeLevel !== undefined ? activeLevel : inner;
  const index = wanted === null || !data.length ? null : clamp(wanted, 0, top);
  const setActive = (next: number | null) => {
    if (next === index) return;
    if (activeLevel === undefined) setInner(next);
    onActiveChange?.(next);
  };

  // Geometry: the price line takes the left of the plot, the histogram the right, and both share the price scale.
  const histogram = clamp(width * .32, 64, 190), gap = 14, lineWidth = Math.max(0, width - histogram - gap), barsX = lineWidth + gap;
  const yOf = (price: number) => EDGE + ((profile.high - price) / (profile.high - profile.low)) * (height - EDGE * 2);
  const rowHeight = (height - EDGE * 2) / count;
  const rowTop = (at: number) => EDGE + (top - at) * rowHeight;
  const line = data.map((item, at) => `${at ? "L" : "M"}${f(data.length > 1 ? (at / (data.length - 1)) * lineWidth : lineWidth / 2)} ${f(yOf(item.price))}`).join("");
  const pocRow = profile.rows[profile.poc], pocPrice = pocRow ? (pocRow.low + pocRow.high) / 2 : 0, pocY = rowTop(profile.poc) + rowHeight / 2;
  const areaLow = profile.rows[profile.from]?.low ?? profile.low, areaHigh = profile.rows[profile.to]?.high ?? profile.high;
  const areaPath = `M0 ${f(yOf(areaHigh))}H${f(lineWidth)}V${f(yOf(areaLow))}H0Z`;
  const ticks = useMemo(() => roundTicks(profile.low, profile.high), [profile.low, profile.high]);

  // The first reveal grows outward from the point of control; later data changes morph at once.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!shown || settled) return;
    const timer = setTimeout(() => setSettled(true), 900);
    return () => clearTimeout(timer);
  }, [settled, shown]);
  const step = Math.min(.03, .3 / count);

  const bandY = useMotionValue(0), tipX = useMotionValue(0), tipY = useMotionValue(0);
  const glideBand = useSpring(bandY, follow), glideX = useSpring(tipX, follow), glideY = useSpring(tipY, follow);
  const wasOpen = useRef(false);
  const [lastShown, setLastShown] = useState<number | null>(index);
  if (index !== null && index !== lastShown) setLastShown(index);
  const tip = profile.rows[index ?? lastShown ?? profile.poc] ?? null;
  useLayoutEffect(() => {
    if (index === null || !width) { wasOpen.current = false; return; }
    const node = tooltip.current, w = node?.offsetWidth ?? 180, h = node?.offsetHeight ?? 90;
    const y = EDGE + (top - index) * rowHeight, x = Math.max(0, barsX - w - 10), tipTop = clamp(y + rowHeight / 2 - h / 2, 0, Math.max(0, height - h));
    bandY.set(y); tipX.set(x); tipY.set(tipTop);
    if (!wasOpen.current || reduced) { glideBand.jump(y); glideX.jump(x); glideY.jump(tipTop); }
    wasOpen.current = true;
  }, [bandY, barsX, glideBand, glideX, glideY, height, index, reduced, rowHeight, tipX, tipY, top, width]);

  const levelAt = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return data.length ? clamp(top - Math.floor((event.clientY - rect.top - EDGE) / rowHeight), 0, top) : null;
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && index !== null) { event.preventDefault(); setActive(null); return; }
    const from = index ?? profile.poc;
    const next = ({ ArrowUp: index === null ? from : from + 1, ArrowRight: index === null ? from : from + 1, ArrowDown: index === null ? from : from - 1, ArrowLeft: index === null ? from : from - 1, PageUp: from + 4, PageDown: from - 4, Home: 0, End: top } as Record<string, number>)[event.key];
    if (next === undefined || !data.length) return;
    event.preventDefault();
    setActive(clamp(next, 0, top));
  };

  const share = (volume: number) => profile.total > 0 ? `${((volume / profile.total) * 100).toFixed(1)}%` : "0%";
  const place = (row: Level) => row.index === profile.poc ? "Point of control" : row.index >= profile.from && row.index <= profile.to ? "Inside the value area" : "Outside the value area";
  const reading = profile.rows[index ?? profile.poc];
  const valueText = reading && data.length ? `${formatPrice(reading.low)} to ${formatPrice(reading.high)}: volume ${formatVolume(reading.volume)}, ${share(reading.volume)} of the total. ${place(reading)}.` : "No data";
  const axisLabels = useMemo(() => {
    const picked: { key: string; text: string; x: number }[] = [];
    data.forEach((item, at) => {
      if (!item.axisLabel) return;
      const x = clamp(data.length > 1 ? (at / (data.length - 1)) * lineWidth : 0, 22, Math.max(22, lineWidth - 22)), before = picked[picked.length - 1];
      if (!before || x - before.x >= 52) picked.push({ key: item.key, text: item.axisLabel, x });
    });
    return picked;
  }, [data, lineWidth]);
  const instant = { duration: 0 } as const;
  const percent = Math.round(clamp(valueArea, 0, 1) * 100);

  return <figure ref={figure} className={[styles.figure, className].filter(Boolean).join(" ")} aria-labelledby={titleId}>
    <figcaption id={titleId} className={styles.srOnly}>{label}, volume by price</figcaption>
    {!hideHeader && data.length > 0 && <div className={styles.header} aria-hidden="true">
      <span className={styles.kind}>{label}</span>
      <span className={styles.value}>{formatPrice(pocPrice)}<span className={styles.unit}>point of control</span></span>
      <span className={styles.meta}>Value area {formatPrice(areaLow)} to {formatPrice(areaHigh)}, {percent}% of {formatVolume(profile.total)} traded</span>
    </div>}
    <div className={styles.chart} data-active={index !== null ? "" : undefined}>
      <div ref={plot} className={styles.plot} style={{ height }}>
        {width > 0 && data.length > 0 && <svg className={styles.svg} width={width} height={height} aria-hidden="true">
          <motion.path className={styles.area} initial={{ opacity: 0, d: areaPath }} animate={{ opacity: shown ? 1 : 0, d: areaPath }} transition={reduced ? instant : { d: spring.smooth, opacity: { duration: duration.considered, delay: settled ? 0 : .2 } }} />
          <motion.rect className={styles.band} x={0} y={0} width={width} height={rowHeight} rx={4} style={{ y: glideBand }} />
          {ticks.map(tick => <line key={tick} className={styles.grid} x1={0} x2={lineWidth} y1={Math.round(yOf(tick)) + .5} y2={Math.round(yOf(tick)) + .5} />)}
          <motion.path key={`line-${data.length}`} className={styles.line} initial={{ d: line, pathLength: reduced ? 1 : 0 }} animate={{ d: line, pathLength: shown ? 1 : 0 }} transition={reduced ? instant : { d: spring.smooth, pathLength: { duration: DRAW, ease: [...ease.inOut] } }} />
          <motion.line className={styles.pocLine} x1={0} x2={barsX} y1={0} y2={0} initial={{ opacity: 0, y: Math.round(pocY) + .5 }} animate={{ opacity: shown ? 1 : 0, y: Math.round(pocY) + .5 }} transition={reduced ? instant : { y: spring.smooth, opacity: { duration: duration.standard, delay: settled ? 0 : .3 } }} />
          <line className={styles.axisLine} x1={barsX - .5} x2={barsX - .5} y1={EDGE} y2={height - EDGE} />
          {profile.rows.map(row => {
            const y = rowTop(row.index) + 1, h = Math.max(1, rowHeight - 2), w = profile.peak > 0 ? Math.max(row.volume > 0 ? 2 : 0, (row.volume / profile.peak) * histogram) : 0;
            const kind = row.index === profile.poc ? "poc" : row.index >= profile.from && row.index <= profile.to ? "inside" : "outside";
            return <motion.path key={row.index} className={styles.bar} data-kind={kind} data-on={index === row.index ? "" : undefined}
              initial={{ d: barPath(barsX, y, reduced ? w : 0, h) }} animate={{ d: barPath(barsX, y, shown ? w : 0, h) }}
              transition={reduced ? instant : { ...spring.smooth, delay: settled ? 0 : .08 + Math.abs(row.index - profile.poc) * step }} />;
          })}
        </svg>}
        <motion.div ref={tooltip} className={styles.tooltip} style={{ x: glideX, y: glideY }} aria-hidden="true">
          {tip && <>
            <p className={styles.tipTitle}>{formatPrice(tip.low)} to {formatPrice(tip.high)}</p>
            <p className={styles.tipRow}><span className={styles.tipName}>Volume</span><span className={styles.tipValue}>{formatVolume(tip.volume)}</span></p>
            <p className={styles.tipRow}><span className={styles.tipName}>Share</span><span className={styles.tipValue}>{share(tip.volume)}</span></p>
            <p className={styles.tipMeta} data-poc={tip.index === profile.poc ? "" : undefined}>{place(tip)}</p>
          </>}
        </motion.div>
      </div>
      <div className={styles.gutter} aria-hidden="true">
        {data.length > 0 && ticks.filter(tick => Math.abs(yOf(tick) - pocY) > 18).map(tick => <span key={tick} className={styles.tick} style={{ top: yOf(tick) }}><span className={styles.tickText}>{formatPrice(tick)}</span></span>)}
        {data.length > 0 && <motion.span className={styles.tag} initial={{ opacity: 0, y: pocY }} animate={{ opacity: shown ? 1 : 0, y: pocY }} transition={reduced ? instant : { y: spring.smooth, opacity: { duration: duration.standard, delay: settled ? 0 : .3 } }}><span className={styles.tagText}>{formatPrice(pocPrice)}</span></motion.span>}
      </div>
      <div className={styles.axis} aria-hidden="true">
        {axisLabels.map(item => <span key={item.key} className={styles.axisLabel} style={{ left: item.x }}>{item.text}</span>)}
        {width > 0 && <span className={styles.axisLabel} data-kind="volume" style={{ left: barsX }}>Volume</span>}
      </div>
      {/* The scrubber lies over the plot: hover or drag up and down it, or focus it and use the arrow keys. */}
      <div className={styles.scrubber} style={{ height }} role="slider" tabIndex={0} aria-label={`${label}, explore by price level`} aria-orientation="vertical" aria-valuemin={1} aria-valuemax={count} aria-valuenow={(index ?? profile.poc) + 1} aria-valuetext={valueText}
        onPointerDown={event => setActive(levelAt(event))} onPointerMove={event => { if (event.pointerType === "mouse" || event.buttons) setActive(levelAt(event)); }}
        onPointerLeave={event => { if (event.pointerType === "mouse") setActive(null); }} onPointerCancel={() => setActive(null)} onKeyDown={onKeyDown} onBlur={() => setActive(null)}
        onFocus={event => { if (event.currentTarget.matches(":focus-visible") && data.length && index === null) setActive(profile.poc); }} />
    </div>
    <div className={styles.srOnly}><table>
      <caption>{label}, volume by price level</caption>
      <thead><tr><th scope="col">Price level</th><th scope="col">Volume</th><th scope="col">Share</th></tr></thead>
      <tbody>{[...profile.rows].reverse().map(row => <tr key={row.index}><th scope="row">{formatPrice(row.low)} to {formatPrice(row.high)}{row.index === profile.poc ? " (point of control)" : ""}</th><td>{formatVolume(row.volume)}</td><td>{share(row.volume)}</td></tr>)}</tbody>
    </table></div>
  </figure>;
}

export default VolumeProfile;
