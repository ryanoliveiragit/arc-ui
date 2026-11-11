"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./candlestick-chart.module.css";

export interface Candle {
  /** Stable identity, such as an ISO date. A candle whose key survives a data change slides to its new place instead of redrawing. */
  key: string;
  /** Full label for the tooltip and screen readers, such as "Tue, Nov 10". */
  label: string;
  /** Short label under the candle, such as "Nov 10". Leave it out on most candles to keep the axis quiet. */
  axisLabel?: string;
  /** Price at the start of the period. */
  open: number;
  /** Highest price of the period. */
  high: number;
  /** Lowest price of the period. */
  low: number;
  /** Price at the end of the period. */
  close: number;
  /** Optional traded volume, shown in the tooltip. */
  volume?: number;
}

/** Use a candlestick chart for open, high, low and close prices over a run of periods. */
export interface CandlestickChartProps {
  /** Candles in time order, oldest first. */
  data: Candle[];
  /** What is priced, such as "Northwind Corp." Names the chart for assistive technology and heads the readout. */
  label: string;
  /** The range on show, such as "Last 30 sessions". It rests beside the change. */
  period?: string;
  /** Plot height in pixels. */
  height?: number;
  /** Formats prices on the axis, in the header and in the tooltip. */
  formatValue?: (value: number) => string;
  /** Formats the optional volume in the tooltip. */
  formatVolume?: (value: number) => string;
  /** Hides the headline with the last price and the change over the range. */
  hideHeader?: boolean;
  /** Controlled index of the candle under the crosshair, or null for none. */
  activeIndex?: number | null;
  /** Candle under the crosshair on first render when uncontrolled. */
  defaultActiveIndex?: number | null;
  /** Called when the crosshair moves to another candle or leaves the plot. */
  onActiveChange?: (index: number | null) => void;
  /** Extra class on the root figure. */
  className?: string;
}

const { spring, duration, ease, stagger } = motionTokens;
const follow = { stiffness: 480, damping: 42, restDelta: .01 };
/** Room above and below the price range, and the widest a candle body gets. */
const TOP = 12, BOTTOM = 10, MAX_BODY = 14, WICK = 1.5;
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

/** A price axis on round steps (1, 2, 2.5 or 5 times a power of ten) that covers the range in about four rows. */
function priceScale(min: number, max: number) {
  const span = Math.max(max - min, Math.abs(max) * .002, 1e-6);
  const raw = span / 4, magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find(factor => factor * magnitude >= raw) ?? 10) * magnitude;
  const low = Math.floor(min / step) * step, high = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = low; value <= high + step / 2; value += step) ticks.push(Number(value.toFixed(8)));
  return { low, high: high > low ? high : low + step, ticks };
}

/** One shape per candle: a thin wick from high to low under a body from open to close. Flat at one price, it is the line a candle grows from. */
function candlePath(center: number, body: number, high: number, low: number, open: number, close: number) {
  const top = Math.min(open, close), bottom = Math.max(open, close, top + 1);
  return `M${f(center - WICK / 2)} ${f(high)}H${f(center + WICK / 2)}V${f(low)}H${f(center - WICK / 2)}ZM${f(center - body / 2)} ${f(top)}H${f(center + body / 2)}V${f(bottom)}H${f(center - body / 2)}Z`;
}

export function CandlestickChart({ data, label, period, height = 240, formatValue = value => money.format(value), formatVolume = value => compact.format(value), hideHeader = false, activeIndex, defaultActiveIndex = null, onActiveChange, className }: CandlestickChartProps) {
  const reduced = useReducedMotionSafe();
  const figure = useRef<HTMLElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const [plot, width] = useWidth<HTMLDivElement>();
  const inView = useInView(figure, { once: true, amount: .3 });
  const shown = inView || reduced;
  const titleId = useId();
  const count = data.length, last = count - 1;

  const [inner, setInner] = useState<number | null>(defaultActiveIndex);
  const wanted = activeIndex !== undefined ? activeIndex : inner;
  const index = wanted === null || last < 0 ? null : clamp(wanted, 0, last);
  const setActive = (next: number | null) => {
    if (next === index) return;
    if (activeIndex === undefined) setInner(next);
    onActiveChange?.(next);
  };

  const floor = data.reduce((min, item) => Math.min(min, item.low), Infinity), ceiling = data.reduce((max, item) => Math.max(max, item.high), -Infinity);
  const scale = useMemo(() => priceScale(Number.isFinite(floor) ? floor : 0, Number.isFinite(ceiling) ? ceiling : 1), [floor, ceiling]);
  const yOf = (value: number) => TOP + ((scale.high - value) / (scale.high - scale.low)) * (height - TOP - BOTTOM);
  const slot = count ? width / count : 0;
  const body = clamp(slot * .62, 1.5, MAX_BODY);
  const centerOf = (at: number) => (at + .5) * slot;

  // The first reveal runs left to right; candles that join later grow at once.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!shown || settled) return;
    const timer = setTimeout(() => setSettled(true), 900);
    return () => clearTimeout(timer);
  }, [settled, shown]);
  const step = Math.min(stagger.item, .36 / Math.max(1, count));

  // The vertical hair snaps to a candle and glides between them; the horizontal hair follows the pointer, or rests on the close under the keyboard.
  const hairX = useMotionValue(0), hairY = useMotionValue(0);
  const glideX = useSpring(hairX, follow);
  const tipX = useMotionValue(0), tipY = useMotionValue(0);
  const tipGlideX = useSpring(tipX, follow), tipGlideY = useSpring(tipY, follow);
  const byPointer = useRef(false);
  const wasOpen = useRef(false);
  const current = index === null ? null : data[index] ?? null;
  const [lastShown, setLastShown] = useState(current);
  if (current && current !== lastShown) setLastShown(current);
  const tip = current ?? lastShown;
  useLayoutEffect(() => {
    if (index === null || !current || !width) { wasOpen.current = false; return; }
    const x = centerOf(index), node = tooltip.current, w = node?.offsetWidth ?? 170, h = node?.offsetHeight ?? 120;
    const left = x + 14 + w > width ? Math.max(0, x - 14 - w) : x + 14;
    const top = clamp((yOf(current.high) + yOf(current.low)) / 2 - h / 2, 0, Math.max(0, height - h));
    hairX.set(x); tipX.set(left); tipY.set(top);
    if (!byPointer.current) hairY.set(yOf(current.close));
    if (!wasOpen.current || reduced) { glideX.jump(x); tipGlideX.jump(left); tipGlideY.jump(top); }
    wasOpen.current = true;
    // centerOf and yOf are derived from the values listed below.
  }, [index, current, width, height, slot, scale, reduced]);
  const hairText = useTransform(hairY, y => formatValue(scale.high - ((clamp(y, TOP, height - BOTTOM) - TOP) / (height - TOP - BOTTOM)) * (scale.high - scale.low)));

  const pointAt = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    byPointer.current = true;
    hairY.set(clamp(event.clientY - rect.top, TOP, height - BOTTOM));
    return rect.width && count ? clamp(Math.floor(((event.clientX - rect.left) / rect.width) * count), 0, last) : null;
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && index !== null) { event.preventDefault(); setActive(null); return; }
    const from = index ?? count;
    const next = ({ ArrowLeft: from - 1, ArrowDown: from - 1, ArrowRight: index === null ? last : from + 1, ArrowUp: index === null ? last : from + 1, PageDown: from - 5, PageUp: from + 5, Home: 0, End: last } as Record<string, number>)[event.key];
    if (next === undefined || last < 0) return;
    event.preventDefault();
    byPointer.current = false;
    const target = clamp(next, 0, last);
    if (target === index && data[target]) hairY.set(yOf(data[target].close));
    setActive(target);
  };

  const first = data[0], latest = data[last];
  const change = first && latest ? latest.close - first.open : 0;
  const changeShare = first && first.open ? (change / first.open) * 100 : 0;
  const lastY = latest ? yOf(latest.close) : 0;
  // Axis labels thin out so neighbours never touch, and step in from the edges.
  const axisLabels = useMemo(() => {
    const picked: { key: string; text: string; x: number }[] = [];
    data.forEach((item, at) => {
      if (!item.axisLabel) return;
      const x = clamp((at + .5) * slot, 22, Math.max(22, width - 22)), before = picked[picked.length - 1];
      if (!before || x - before.x >= 58) picked.push({ key: item.key, text: item.axisLabel, x });
    });
    return picked;
  }, [data, slot, width]);
  const sign = (value: number) => value > 0 ? "+" : value < 0 ? "−" : "";
  const delta = (item: Candle) => `${sign(item.close - item.open)}${formatValue(Math.abs(item.close - item.open))} (${sign(item.close - item.open)}${Math.abs(item.open ? ((item.close - item.open) / item.open) * 100 : 0).toFixed(2)}%)`;
  const reading = current ?? latest;
  const valueText = reading ? `${reading.label}: open ${formatValue(reading.open)}, high ${formatValue(reading.high)}, low ${formatValue(reading.low)}, close ${formatValue(reading.close)}` : "No data";
  const instant = { duration: 0 } as const;
  const fade = reduced ? instant : { duration: duration.standard, ease: [...ease.standard] } as const;

  return <figure ref={figure} className={[styles.figure, className].filter(Boolean).join(" ")} aria-labelledby={titleId}>
    <figcaption id={titleId} className={styles.srOnly}>{label}{period ? `, ${period}` : ""}</figcaption>
    {!hideHeader && latest && <div className={styles.header} aria-hidden="true">
      <span className={styles.kind}>{label}</span>
      <span className={styles.value}>{formatValue(latest.close)}</span>
      <span className={styles.change} data-way={change >= 0 ? "up" : "down"}>
        {change >= 0 ? <ArrowUpRight size={15} strokeWidth={2.2} /> : <ArrowDownRight size={15} strokeWidth={2.2} />}
        {sign(change)}{formatValue(Math.abs(change))} ({Math.abs(changeShare).toFixed(2)}%)
        {period && <span className={styles.period}>{period}</span>}
      </span>
    </div>}
    <div className={styles.chart} data-active={index !== null ? "" : undefined}>
      <div ref={plot} className={styles.plot} style={{ height }}>
        {width > 0 && <svg className={styles.svg} width={width} height={height} aria-hidden="true">
          <AnimatePresence initial={false}>
            {scale.ticks.map(tick => <motion.line key={tick} className={styles.grid} x1={0} x2={width} y1={0} y2={0} initial={{ opacity: 0, y: Math.round(yOf(tick)) + .5 }} animate={{ opacity: 1, y: Math.round(yOf(tick)) + .5 }} exit={{ opacity: 0 }} transition={reduced ? instant : { y: spring.smooth, opacity: fade }} />)}
          </AnimatePresence>
          <motion.g className={styles.hair} style={{ x: glideX }}>
            <rect className={styles.band} x={-slot / 2} y={TOP - 6} width={slot} height={height - TOP + 6} rx={Math.min(4, slot / 2)} />
            <line className={styles.hairLine} x1={0} x2={0} y1={TOP - 6} y2={height} />
          </motion.g>
          {data.map((item, at) => {
            const center = centerOf(at), middle = yOf((item.open + item.close) / 2);
            const full = candlePath(center, body, yOf(item.high), yOf(item.low), yOf(item.open), yOf(item.close));
            const flat = candlePath(center, body, middle, middle, middle, middle - 1);
            return <motion.path key={item.key} className={styles.candle} data-way={item.close >= item.open ? "up" : "down"} data-on={index === at ? "" : undefined}
              initial={{ d: reduced ? full : flat, opacity: reduced ? 1 : 0 }} animate={{ d: shown ? full : flat, opacity: shown ? 1 : 0 }}
              transition={reduced ? instant : { d: { ...spring.smooth, delay: settled ? 0 : at * step }, opacity: { duration: duration.fast, delay: settled ? 0 : at * step } }} />;
          })}
          {latest && <motion.line className={styles.lastLine} x1={0} x2={width} y1={0} y2={0} initial={{ opacity: 0, y: Math.round(lastY) + .5 }} animate={{ opacity: shown ? 1 : 0, y: Math.round(lastY) + .5 }} transition={reduced ? instant : { y: spring.smooth, opacity: { duration: duration.standard, delay: settled ? 0 : .3 } }} />}
          <motion.line className={styles.hairLevel} x1={0} x2={width} y1={0} y2={0} style={{ y: hairY }} />
        </svg>}
        <motion.div ref={tooltip} className={styles.tooltip} style={{ x: tipGlideX, y: tipGlideY }} aria-hidden="true">
          {tip && <>
            <p className={styles.tipTitle}>{tip.label}</p>
            <dl className={styles.ohlc}>
              <div><dt>Open</dt><dd>{formatValue(tip.open)}</dd></div>
              <div><dt>High</dt><dd>{formatValue(tip.high)}</dd></div>
              <div><dt>Low</dt><dd>{formatValue(tip.low)}</dd></div>
              <div><dt>Close</dt><dd>{formatValue(tip.close)}</dd></div>
            </dl>
            <p className={styles.tipChange} data-way={tip.close >= tip.open ? "up" : "down"}>{delta(tip)}</p>
            {tip.volume !== undefined && <p className={styles.tipMeta}>Volume {formatVolume(tip.volume)}</p>}
          </>}
        </motion.div>
      </div>
      <div className={styles.gutter} aria-hidden="true">
        <AnimatePresence initial={false}>
          {scale.ticks.filter(tick => !latest || Math.abs(yOf(tick) - lastY) > 18).map(tick => <motion.span key={tick} className={styles.tick} initial={{ opacity: 0, y: yOf(tick) }} animate={{ opacity: 1, y: yOf(tick) }} exit={{ opacity: 0 }} transition={reduced ? instant : { y: spring.smooth, opacity: fade }}><span className={styles.tickText}>{formatValue(tick)}</span></motion.span>)}
        </AnimatePresence>
        {latest && <motion.span className={styles.tag} data-kind="last" initial={{ opacity: 0, y: lastY }} animate={{ opacity: shown ? 1 : 0, y: lastY }} transition={reduced ? instant : { y: spring.smooth, opacity: { duration: duration.standard, delay: settled ? 0 : .3 } }}><span className={styles.tagText}>{formatValue(latest.close)}</span></motion.span>}
        <motion.span className={styles.tag} data-kind="hair" style={{ y: hairY }}><motion.span className={styles.tagText}>{hairText}</motion.span></motion.span>
      </div>
      <div className={styles.axis} aria-hidden="true">
        {axisLabels.map(item => <span key={item.key} className={styles.axisLabel} style={{ left: item.x }}>{item.text}</span>)}
      </div>
      {/* The scrubber lies over the plot: hover or drag across it, or focus it and use the arrow keys. Vertical swipes still scroll the page. */}
      <div className={styles.scrubber} style={{ height }} role="slider" tabIndex={0} aria-label={`${label}, explore by candle`} aria-orientation="horizontal" aria-valuemin={1} aria-valuemax={Math.max(1, count)} aria-valuenow={(index ?? Math.max(0, last)) + 1} aria-valuetext={valueText}
        onPointerDown={event => { if (event.pointerType !== "mouse") event.currentTarget.setPointerCapture?.(event.pointerId); setActive(pointAt(event)); }}
        onPointerMove={event => { if (event.pointerType === "mouse" || event.buttons) setActive(pointAt(event)); }}
        onPointerUp={event => { if (event.pointerType !== "mouse") setActive(null); }} onPointerCancel={() => setActive(null)}
        onPointerLeave={event => { if (event.pointerType === "mouse") setActive(null); }} onKeyDown={onKeyDown} onBlur={() => setActive(null)}
        onFocus={event => { if (event.currentTarget.matches(":focus-visible") && last >= 0 && index === null) { byPointer.current = false; setActive(last); } }} />
    </div>
    <div className={styles.srOnly}><table>
      <caption>{label}{period ? `, ${period}` : ""}</caption>
      <thead><tr><th scope="col">Period</th><th scope="col">Open</th><th scope="col">High</th><th scope="col">Low</th><th scope="col">Close</th></tr></thead>
      <tbody>{data.map(item => <tr key={item.key}><th scope="row">{item.label}</th><td>{formatValue(item.open)}</td><td>{formatValue(item.high)}</td><td>{formatValue(item.low)}</td><td>{formatValue(item.close)}</td></tr>)}</tbody>
    </table></div>
  </figure>;
}

export default CandlestickChart;
