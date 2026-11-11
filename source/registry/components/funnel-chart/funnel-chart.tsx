"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./funnel-chart.module.css";

export interface FunnelStage {
  /** Stable identity. A stage that survives a data change keeps its place and morphs to its new width. */
  key: string;
  /** Name of the stage, such as "Added to cart". */
  label: string;
  /** How many reached this stage. Stages are drawn in the order given. */
  value: number;
}

/** Use a funnel chart for a fixed sequence of steps, when the question is how many continue from each step to the next. */
export interface FunnelChartProps {
  /** Stages from first to last. */
  data: FunnelStage[];
  /** What moves through the funnel, such as "Checkout funnel". Names the chart for assistive technology and heads the readout. */
  label: string;
  /** Unit after counts in the header and tooltip, such as "shoppers". */
  unit?: string;
  /** Formats stage values. */
  formatValue?: (value: number) => string;
  /** Height of each stage bar in pixels. */
  stageHeight?: number;
  /** Height of the tapered connector between two stages in pixels. */
  connectorHeight?: number;
  /** Hides the headline with the overall conversion. */
  hideHeader?: boolean;
  /** Controlled key of the stage in focus, or null for none. The other stages dim while one is in focus. */
  activeKey?: string | null;
  /** Stage in focus on first render when uncontrolled. */
  defaultActiveKey?: string | null;
  /** Called when hover, touch or the keyboard moves to another stage, or leaves the chart. */
  onActiveChange?: (key: string | null) => void;
  /** Extra class on the root figure. */
  className?: string;
}

const { spring, duration, ease } = motionTokens;
const follow = { stiffness: 480, damping: 42, restDelta: .01 };
/** Each stage starts a beat after the one above it. */
const STEP = .1, RADIUS = 8, MIN_WIDTH = 12;
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const f = (value: number) => value.toFixed(1);
const percent = (part: number, whole: number) => whole > 0 ? (part / whole) * 100 : 0;

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

/** A centred bar with rounded corners. With no width it is a line on the axis, the shape a stage grows from. */
function stagePath(center: number, y: number, w: number, h: number) {
  const r = Math.min(RADIUS, w / 2, h / 2), x = center - w / 2;
  return `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`;
}
/** The taper from one stage to the next: what is lost shows as the narrowing. */
function taperPath(center: number, y: number, h: number, from: number, to: number) {
  const a = Math.max(0, from / 2 - Math.min(RADIUS, from / 4)), b = Math.max(0, to / 2 - Math.min(RADIUS, to / 4));
  return `M${f(center - a)} ${f(y)}H${f(center + a)}L${f(center + b)} ${f(y + h)}H${f(center - b)}Z`;
}

/** A number that counts to its value: up from zero on the first reveal, then from wherever it stands. */
function Count({ value, format, shown, reduced }: { value: number; format: (value: number) => string; shown: boolean; reduced: boolean }) {
  const amount = useMotionValue(reduced ? value : 0);
  const text = useTransform(amount, current => format(current));
  useEffect(() => {
    if (reduced) { amount.jump(value); return; }
    if (!shown) return;
    const controls = animate(amount, value, { duration: duration.considered, ease: [...ease.standard] });
    return () => controls.stop();
  }, [amount, reduced, shown, value]);
  return <motion.span>{text}</motion.span>;
}

export function FunnelChart({ data, label, unit = "", formatValue = value => grouped.format(value), stageHeight = 44, connectorHeight = 28, hideHeader = false, activeKey, defaultActiveKey = null, onActiveChange, className }: FunnelChartProps) {
  const reduced = useReducedMotionSafe();
  const figure = useRef<HTMLElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const [plot, width] = useWidth<HTMLDivElement>();
  const inView = useInView(figure, { once: true, amount: .3 });
  const shown = inView || reduced;
  const titleId = useId();
  const suffix = unit ? ` ${unit}` : "";
  const count = data.length, pitch = stageHeight + connectorHeight, height = count ? count * stageHeight + (count - 1) * connectorHeight : 0;

  const [inner, setInner] = useState<string | null>(defaultActiveKey);
  const wanted = activeKey !== undefined ? activeKey : inner;
  const found = data.findIndex(item => item.key === wanted);
  const index = found < 0 ? null : found;
  const setActive = (next: number | null) => {
    if (next === index) return;
    const key = next === null ? null : data[next]?.key ?? null;
    if (activeKey === undefined) setInner(key);
    onActiveChange?.(key);
  };

  const peak = data.reduce((max, item) => Math.max(max, item.value), 0);
  const widthOf = (item: FunnelStage) => peak > 0 ? Math.max(Math.min(MIN_WIDTH, width), (Math.max(0, item.value) / peak) * width) : 0;
  const center = width / 2;
  const first = data[0], final = data[count - 1];
  const overall = first && final ? percent(final.value, first.value) : 0;

  // The first reveal runs top to bottom; later data changes morph at once.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!shown || settled) return;
    const timer = setTimeout(() => setSettled(true), (count * STEP + .5) * 1000);
    return () => clearTimeout(timer);
  }, [count, settled, shown]);
  const delayOf = (at: number) => settled ? 0 : Math.min(at * STEP, .5);

  const tipX = useMotionValue(0), tipY = useMotionValue(0);
  const glideX = useSpring(tipX, follow), glideY = useSpring(tipY, follow);
  const wasOpen = useRef(false);
  const [lastShown, setLastShown] = useState<number | null>(index);
  if (index !== null && index !== lastShown) setLastShown(index);
  const tipIndex = index ?? lastShown;
  const tip = tipIndex === null ? null : data[tipIndex] ?? null, tipBefore = tipIndex ? data[tipIndex - 1] ?? null : null;
  useLayoutEffect(() => {
    if (index === null || !width) { wasOpen.current = false; return; }
    const node = tooltip.current, w = node?.offsetWidth ?? 190, h = node?.offsetHeight ?? 100;
    // The tooltip sits in the taper under its stage, or above the last one, so it never hides the stage it describes.
    const below = index * pitch + stageHeight + 6, x = clamp(center - w / 2, Math.min(0, width - w), Math.max(0, width - w)), y = index === count - 1 && count > 1 ? index * pitch - h - 6 : below;
    tipX.set(x); tipY.set(y);
    if (!wasOpen.current || reduced) { glideX.jump(x); glideY.jump(y); }
    wasOpen.current = true;
  }, [center, count, glideX, glideY, index, pitch, reduced, stageHeight, tipX, tipY, width]);

  const stageAt = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return count ? clamp(Math.floor((event.clientY - rect.top + connectorHeight / 2) / pitch), 0, count - 1) : null;
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && index !== null) { event.preventDefault(); setActive(null); return; }
    const from = index ?? -1;
    const next = ({ ArrowDown: from + 1, ArrowRight: from + 1, ArrowUp: index === null ? 0 : from - 1, ArrowLeft: index === null ? 0 : from - 1, Home: 0, End: count - 1 } as Record<string, number>)[event.key];
    if (next === undefined || !count) return;
    event.preventDefault();
    setActive(clamp(next, 0, count - 1));
  };

  const share = (value: number) => `${value.toFixed(1)}%`;
  const describe = (item: FunnelStage, at: number) => {
    const before = at > 0 ? data[at - 1] : undefined;
    return `${item.label}: ${formatValue(item.value)}${suffix}, ${share(percent(item.value, first?.value ?? 0))} of the first stage${before ? `, ${share(100 - percent(item.value, before.value))} dropped after ${before.label}` : ""}`;
  };
  const reading = index === null ? first : data[index];
  const instant = { duration: 0 } as const;
  // One series color, a step quieter at each stage, so the eye follows the narrowing and not a rainbow.
  const strength = (at: number) => count > 1 ? 100 - (at / (count - 1)) * 46 : 100;

  return <figure ref={figure} className={[styles.figure, className].filter(Boolean).join(" ")} aria-labelledby={titleId}>
    <figcaption id={titleId} className={styles.srOnly}>{label}</figcaption>
    {!hideHeader && first && final && <div className={styles.header} aria-hidden="true">
      <span className={styles.kind}>{label}</span>
      <span className={styles.value}><Count value={overall} format={share} shown={shown} reduced={reduced} /><span className={styles.unit}>overall conversion</span></span>
      <span className={styles.meta}>{formatValue(final.value)} of {formatValue(first.value)}{suffix} reach {final.label}</span>
    </div>}
    <div className={styles.chart} data-active={index !== null ? "" : undefined} style={{ height }}>
      <div className={styles.labels} aria-hidden="true">
        {data.map((item, at) => <motion.div key={item.key} className={styles.stage} data-on={index === at ? "" : undefined} style={{ top: at * pitch, height: stageHeight }}
          initial={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : -8 }} animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : -8 }} transition={reduced ? instant : { ...spring.smooth, delay: delayOf(at) }}>
          <span className={styles.name}>{item.label}</span>
          <span className={styles.amount}><Count value={item.value} format={value => formatValue(Math.round(value))} shown={shown} reduced={reduced} /></span>
        </motion.div>)}
      </div>
      <div ref={plot} className={styles.plot}>
        {width > 0 && <svg className={styles.svg} width={width} height={height} aria-hidden="true">
          {data.map((item, at) => {
            const next = data[at + 1], y = at * pitch, w = widthOf(item);
            const full = next ? taperPath(center, y + stageHeight + 2, connectorHeight - 4, w, widthOf(next)) : "";
            const closed = next ? taperPath(center, y + stageHeight + 2, 0, w, w) : "";
            return <g key={item.key} className={styles.item} data-on={index === at ? "" : undefined}>
              {next && <motion.path className={styles.taper} initial={{ d: reduced ? full : closed, opacity: reduced ? 1 : 0 }} animate={{ d: shown ? full : closed, opacity: shown ? 1 : 0 }} transition={reduced ? instant : { d: { ...spring.smooth, delay: delayOf(at) + .06 }, opacity: { duration: duration.fast, delay: delayOf(at) + .06 } }} />}
              <motion.path className={styles.bar} style={{ fill: `color-mix(in oklab, var(--series-1) ${strength(at).toFixed(0)}%, var(--surface))` }}
                initial={{ d: stagePath(center, y, reduced ? w : 0, stageHeight), opacity: reduced ? 1 : 0 }} animate={{ d: stagePath(center, y, shown ? w : 0, stageHeight), opacity: shown ? 1 : 0 }}
                transition={reduced ? instant : { d: { ...spring.smooth, delay: delayOf(at) }, opacity: { duration: duration.fast, delay: delayOf(at) } }} />
            </g>;
          })}
        </svg>}
        {width > 0 && data.slice(1).map((item, at) => {
          const before = data[at];
          return <motion.span key={item.key} className={styles.drop} style={{ top: at * pitch + stageHeight + connectorHeight / 2 }}
            initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : .8 }} animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : .8 }} transition={reduced ? instant : { ...spring.snappy, delay: delayOf(at) + .14 }}>
            <span className={styles.dropText}>−<Count value={before ? 100 - percent(item.value, before.value) : 0} format={share} shown={shown} reduced={reduced} /></span>
          </motion.span>;
        })}
        <motion.div ref={tooltip} className={styles.tooltip} style={{ x: glideX, y: glideY }} aria-hidden="true">
          {tip && <>
            <p className={styles.tipTitle}>{tip.label}</p>
            <p className={styles.tipRow}><span className={styles.tipName}>Reached</span><span className={styles.tipValue}>{formatValue(tip.value)}{suffix}</span></p>
            <p className={styles.tipRow}><span className={styles.tipName}>Of first stage</span><span className={styles.tipValue}>{share(percent(tip.value, first?.value ?? 0))}</span></p>
            {tipBefore && <p className={styles.tipRow}><span className={styles.tipName}>From {tipBefore.label}</span><span className={styles.tipValue}>{share(percent(tip.value, tipBefore.value))}</span></p>}
            {tipBefore && <p className={styles.tipMeta}>{formatValue(Math.max(0, tipBefore.value - tip.value))} dropped off before this stage</p>}
          </>}
        </motion.div>
      </div>
      {/* The scrubber lies over the chart: hover or tap a stage, or focus it and use the arrow keys. */}
      <div className={styles.scrubber} role="slider" tabIndex={0} aria-label={`${label}, explore by stage`} aria-orientation="vertical" aria-valuemin={1} aria-valuemax={Math.max(1, count)} aria-valuenow={(index ?? 0) + 1} aria-valuetext={reading ? describe(reading, index ?? 0) : "No data"}
        onPointerDown={event => setActive(stageAt(event))} onPointerMove={event => { if (event.pointerType === "mouse" || event.buttons) setActive(stageAt(event)); }}
        onPointerLeave={event => { if (event.pointerType === "mouse") setActive(null); }} onPointerCancel={() => setActive(null)} onKeyDown={onKeyDown} onBlur={() => setActive(null)}
        onFocus={event => { if (event.currentTarget.matches(":focus-visible") && count && index === null) setActive(0); }} />
    </div>
    <div className={styles.srOnly}><table>
      <caption>{label}</caption>
      <thead><tr><th scope="col">Stage</th><th scope="col">Reached</th><th scope="col">Of first stage</th><th scope="col">Dropped from previous</th></tr></thead>
      <tbody>{data.map((item, at) => { const before = at > 0 ? data[at - 1] : undefined; return <tr key={item.key}><th scope="row">{item.label}</th><td>{formatValue(item.value)}{suffix}</td><td>{share(percent(item.value, first?.value ?? 0))}</td><td>{before ? share(100 - percent(item.value, before.value)) : "None"}</td></tr>; })}</tbody>
    </table></div>
  </figure>;
}

export default FunnelChart;
