"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./liquidity-heatmap.module.css";

/**
 * A grid heatmap of resting liquidity: time runs left to right, price bottom to top, and each cell is tinted by the size
 * waiting at that price. Columns sweep in from the left, then the traded price draws over them. A crosshair and a ring
 * glide to the cell under the pointer or the arrow keys, and the readout above and the marker on the legend follow it.
 */
export interface LiquidityHeatmapProps {
  /** Label of each time bucket, oldest first. One column per entry. */
  times: string[];
  /** Price of each level, evenly spaced. Any order: the chart draws the highest price at the top. */
  prices: number[];
  /** Size resting in each cell, as `values[timeIndex][priceIndex]`. Missing cells count as zero. */
  values: number[][];
  /** Traded price at each time bucket, drawn as a line over the grid. */
  path?: number[];
  /** Accessible name of the chart, such as "BTC-USD resting liquidity, last four hours". */
  label: string;
  /** Unit written after a size, such as "BTC". */
  unit?: string;
  /** Formats a price for the axis and the readout. */
  formatPrice?: (price: number) => string;
  /** Formats a size for the readout and the legend. */
  formatValue?: (value: number) => string;
  /** Size at which the color saturates. Defaults to the largest size in the data. */
  max?: number;
  /** Height of the plot in px, time axis included. */
  height?: number;
  /** Called when the cell under the pointer or the keyboard changes; null when the chart goes back to the latest column. */
  onCellChange?: (cell: { time: string; price: number; value: number } | null) => void;
  /** Formatting locale. Fixed by default so server and client render the same labels. */
  locale?: string;
  /** Extra class for the root element. */
  className?: string;
}

type Cell = { col: number; row: number };

/** Tints above the empty cell. The legend shows the same steps, so a color always reads back to a range. */
const LEVELS = 7;
const AXIS = 24;
/** Total travel of the column sweep in ms. */
const SWEEP = 360;
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

const noopSubscribe = () => () => {};
/** Reduced motion only after hydration, so the server and the first client render agree. */
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = useReducedMotion();
  return hydrated && !!reduced;
}

export function LiquidityHeatmap({ times, prices, values, path, label, unit = "", formatPrice, formatValue, max, height = 268, onCellChange, locale = "en-US", className }: LiquidityHeatmapProps) {
  const reduced = useReducedMotionSafe();
  const id = useId();
  const frameRef = useRef<HTMLDivElement>(null);
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
    const price = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
    const size = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    return { price: formatPrice ?? ((value: number) => price.format(value)), size: formatValue ?? ((value: number) => size.format(value)) };
  }, [locale, formatPrice, formatValue]);

  const model = useMemo(() => {
    const order = prices.map((price, index) => ({ price, index })).sort((a, b) => b.price - a.price);
    const rows = order.length, cols = times.length;
    const grid = order.map(entry => Array.from({ length: cols }, (_, col) => Math.max(0, values[col]?.[entry.index] ?? 0)));
    const peak = grid.reduce((top, row) => row.reduce((best, value) => Math.max(best, value), top), 0);
    const top = max ?? (peak || 1);
    const levels = grid.map(row => row.map(value => value <= 0 ? 0 : clamp(Math.ceil(value / top * LEVELS), 1, LEVELS)));
    const high = order[0]?.price ?? 0, low = order[rows - 1]?.price ?? 0;
    const step = rows > 1 ? (high - low) / (rows - 1) : 1;
    return { rows, cols, grid, levels, top, high, step: step || 1, rowPrices: order.map(entry => entry.price) };
  }, [times, prices, values, max]);
  const { rows, cols } = model;

  // Geometry in real pixels: the chart measures its frame, so text and corners never stretch.
  const lastCol = Math.max(0, cols - 1);
  const lastPrice = path?.[Math.min(path.length - 1, lastCol)];
  const gutter = useMemo(() => Math.max(40, Math.max(0, ...model.rowPrices.map(price => formats.price(price).length), lastPrice != null ? formats.price(lastPrice).length + .5 : 0) * 6.6 + 16), [model, formats, lastPrice]);
  const plotW = Math.max(0, width - gutter), plotH = Math.max(0, height - AXIS);
  const cw = cols ? plotW / cols : 0, ch = rows ? plotH / rows : 0;
  const gap = cw >= 7 ? 1.5 : 1;
  const radius = Math.min(2.5, Math.max(0, Math.min(cw, ch) - gap) * .3);
  const rowOf = (price: number) => clamp((model.high - price) / model.step, 0, Math.max(0, rows - 1));

  const [reveal, setReveal] = useState<"hidden" | "revealing" | "done">("hidden");
  useEffect(() => {
    if (reveal !== "hidden" || !width || !(inView || reduced)) return;
    const frame = requestAnimationFrame(() => setReveal(reduced ? "done" : "revealing"));
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, reveal, width]);
  useEffect(() => {
    if (reveal !== "revealing") return;
    const timer = window.setTimeout(() => setReveal("done"), SWEEP + 480);
    return () => window.clearTimeout(timer);
  }, [reveal]);

  // The traded price redraws whenever a new path arrives.
  const [drawn, setDrawn] = useState({ path, count: 0 });
  if (drawn.path !== path) setDrawn({ path, count: drawn.count + 1 });

  const [cell, setCell] = useState<Cell | null>(null);
  const [announce, setAnnounce] = useState("");
  // At rest the readout shows the deepest level of the latest column.
  const idle: Cell = { col: lastCol, row: model.grid.reduce((best, row, index) => (row[lastCol] ?? 0) > (model.grid[best]?.[lastCol] ?? 0) ? index : best, 0) };
  const active = cell && cell.col < cols && cell.row < rows ? cell : null;
  const shown = active ?? idle;
  const shownValue = model.grid[shown.row]?.[shown.col] ?? 0;
  const shownLevel = model.levels[shown.row]?.[shown.col] ?? 0;
  const shownPrice = model.rowPrices[shown.row] ?? 0;
  const sizeText = (value: number) => `${formats.size(value)}${unit ? ` ${unit}` : ""}`;

  const report = useRef(onCellChange);
  report.current = onCellChange;
  const move = (next: Cell | null, speak = false) => {
    setCell(next);
    const value = next ? model.grid[next.row]?.[next.col] ?? 0 : 0;
    report.current?.(next ? { time: times[next.col] ?? "", price: model.rowPrices[next.row] ?? 0, value } : null);
    if (next && speak) setAnnounce(`${times[next.col] ?? ""}, ${formats.price(model.rowPrices[next.row] ?? 0)}, ${sizeText(value)}`);
  };

  function cellAt(event: PointerEvent<HTMLDivElement>): Cell | null {
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left, y = event.clientY - box.top;
    if (!cw || !ch || x < 0 || y < 0 || x > plotW || y > plotH) return null;
    return { col: clamp(Math.floor(x / cw), 0, cols - 1), row: clamp(Math.floor(y / ch), 0, rows - 1) };
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const next = cellAt(event);
    if (next?.col !== active?.col || next?.row !== active?.row) move(next);
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!rows || !cols) return;
    const from = active ?? idle;
    const moves: Record<string, Cell> = {
      ArrowLeft: { col: from.col - 1, row: from.row }, ArrowRight: { col: from.col + 1, row: from.row },
      ArrowUp: { col: from.col, row: from.row - 1 }, ArrowDown: { col: from.col, row: from.row + 1 },
      PageUp: { col: from.col, row: from.row - 4 }, PageDown: { col: from.col, row: from.row + 4 },
      Home: { col: 0, row: from.row }, End: { col: cols - 1, row: from.row },
    };
    const next = moves[event.key];
    if (next) {
      event.preventDefault();
      move({ col: clamp(next.col, 0, cols - 1), row: clamp(next.row, 0, rows - 1) }, true);
    } else if (event.key === "Escape" && active) {
      event.preventDefault();
      move(null);
    }
  }

  const stepMs = Math.min(14, SWEEP / Math.max(1, cols));
  const cells = useMemo(() => cw && ch ? Array.from({ length: cols }, (_, col) => <g key={col} className={styles.col} style={{ "--d": `${Math.round(col * stepMs)}ms` } as CSSProperties}>
    {Array.from({ length: rows }, (_, row) => <rect key={row} className={styles.cell} data-level={model.levels[row]![col]} x={col * cw + gap / 2} y={row * ch + gap / 2}
      width={Math.max(.5, cw - gap)} height={Math.max(.5, ch - gap)} rx={radius} />)}
  </g>) : null, [model, rows, cols, cw, ch, gap, radius, stepMs]);

  const line = useMemo(() => {
    if (!path?.length || !cw || !ch) return null;
    const points = path.slice(0, cols).map((price, col) => [(col + .5) * cw, (rowOf(price) + .5) * ch] as const);
    return { d: points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(""), end: points[points.length - 1]! };
    // rowOf reads only the model.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, model, cols, cw, ch]);

  const priceEvery = Math.max(1, Math.ceil(30 / Math.max(1, ch)));
  const timeEvery = Math.max(1, Math.ceil(64 / Math.max(1, cw)));
  const tagY = line ? clamp(line.end[1], 9, plotH - 9) : null;
  const ready = reveal !== "hidden";

  return <div className={[styles.root, className].filter(Boolean).join(" ")}>
    <dl className={styles.readout} data-active={active ? "" : undefined}>
      <div className={styles.stat}><dt>{active ? "Time" : "Latest"}</dt><dd>{times[shown.col] ?? "–"}</dd></div>
      <div className={styles.stat}><dt>{active ? "Price" : "Deepest level"}</dt><dd>{formats.price(shownPrice)}</dd></div>
      <div className={styles.stat}><dt>Resting size</dt><dd><span className={styles.chip} data-level={shownLevel} aria-hidden="true" />{formats.size(shownValue)}{unit && <span className={styles.unit}> {unit}</span>}</dd></div>
    </dl>

    <div ref={frameRef} className={styles.frame} style={{ height }} role="application" aria-roledescription="heatmap" aria-label={label} aria-describedby={`${id}-hint`} tabIndex={0}
      onPointerMove={onPointerMove} onPointerDown={onPointerMove} onPointerLeave={event => { if (active && event.pointerType !== "touch") move(null); }}
      onKeyDown={onKeyDown} onFocus={event => { if (!active && event.currentTarget.matches(":focus-visible")) move(idle, true); }} onBlur={() => { if (active) move(null); }}>
      {width > 0 && <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`} data-reveal={reveal} aria-hidden="true">
        <g>{cells}</g>
        <AnimatePresence>
          {active && <motion.g key="cross" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: motionTokens.duration.instant }}>
            <motion.rect className={styles.band} width={cw} height={plotH} initial={false} animate={{ x: active.col * cw }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy} />
            <motion.rect className={styles.band} width={plotW} height={ch} initial={false} animate={{ y: active.row * ch }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy} />
          </motion.g>}
        </AnimatePresence>
        {line && <g key={drawn.count}>
          <motion.path className={styles.lineHalo} d={line.d} initial={reduced ? false : { pathLength: 0, opacity: 0 }} animate={ready ? { pathLength: 1, opacity: 1 } : undefined} transition={{ duration: .6, ease: enter, delay: drawn.count ? .1 : .2 }} />
          <motion.path className={styles.line} d={line.d} initial={reduced ? false : { pathLength: 0, opacity: 0 }} animate={ready ? { pathLength: 1, opacity: 1 } : undefined} transition={{ duration: .6, ease: enter, delay: drawn.count ? .1 : .2 }} />
          <motion.circle className={styles.lineEnd} cx={line.end[0]} cy={line.end[1]} r={3.5} initial={reduced ? false : { scale: 0, opacity: 0 }} animate={ready ? { scale: 1, opacity: 1 } : undefined} transition={reduced ? { duration: 0 } : { ...motionTokens.spring.snappy, delay: drawn.count ? .4 : .5 }} />
        </g>}
        <AnimatePresence>
          {active && <motion.rect key="ring" className={styles.ring} width={Math.max(2, cw - gap + 3)} height={Math.max(2, ch - gap + 3)} rx={radius + 1.5}
            initial={{ opacity: 0, x: active.col * cw + gap / 2 - 1.5, y: active.row * ch + gap / 2 - 1.5 }} animate={{ opacity: 1, x: active.col * cw + gap / 2 - 1.5, y: active.row * ch + gap / 2 - 1.5 }} exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0 } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.instant } }} />}
        </AnimatePresence>

        <g className={styles.axis}>
          {model.rowPrices.map((price, row) => {
            const y = (row + .5) * ch;
            if (row % priceEvery !== Math.floor(priceEvery / 2) || (tagY !== null && Math.abs(y - tagY) < 15)) return null;
            return <text key={row} x={plotW + 8} y={y} dominantBaseline="central">{formats.price(price)}</text>;
          })}
          {times.map((time, col) => col % timeEvery === Math.floor(timeEvery / 2) ? <text key={col} x={(col + .5) * cw} y={plotH + 16} textAnchor="middle">{time}</text> : null)}
        </g>
        {tagY !== null && lastPrice != null && <motion.g key={`tag-${drawn.count}`} initial={reduced ? false : { opacity: 0, x: -6 }} animate={ready ? { opacity: 1, x: 0 } : undefined} transition={{ duration: motionTokens.duration.standard, ease: enter, delay: drawn.count ? .4 : .5 }}>
          <rect className={styles.tag} x={plotW + 3} y={tagY - 9} width={gutter - 3} height={18} rx={9} />
          <text className={styles.tagText} x={plotW + 8} y={tagY} dominantBaseline="central">{formats.price(lastPrice)}</text>
        </motion.g>}
      </svg>}
    </div>

    <div className={styles.legend}>
      <div className={styles.scale} aria-hidden="true">
        <span>0</span>
        <span className={styles.swatches} style={{ "--level": shownLevel } as CSSProperties}>
          {Array.from({ length: LEVELS + 1 }, (_, level) => <span key={level} className={styles.swatch} data-level={level} />)}
          <span className={styles.marker} />
        </span>
        <span>{sizeText(model.top)}</span>
      </div>
      {line && <span className={styles.lineKey} aria-hidden="true"><span className={styles.lineSample} />Traded price</span>}
    </div>

    <span id={`${id}-hint`} className={styles.srOnly}>Brighter cells hold more resting size, up to {sizeText(model.top)}. Use the arrow keys to read a cell, Escape to return to the latest column.</span>
    <span className={styles.srOnly} role="status">{announce}</span>
  </div>;
}

export default LiquidityHeatmap;
