"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./composition-chart.module.css";

export interface CompositionPart {
  /** Stable identity. A part that survives a data change keeps its segment and slides to its new share. */
  key: string;
  /** Name in the legend and the tooltip. */
  label: string;
  /** Size of the part. Shares are worked out against the sum of the parts on show. */
  value: number;
  /** Any CSS color. Parts default to the shared --series-* palette in data order, then neutral steps. */
  color?: string;
}

/** Use a composition chart for the parts of one whole, when their shares matter more than their history. */
export interface CompositionChartProps {
  /** The parts, in the order they should sit in the bar and the legend. */
  data: CompositionPart[];
  /** What the whole is, such as "Cloud spend by service". Names the chart for assistive technology and heads the readout. */
  label: string;
  /** Short text beside the total, such as "total in November". */
  totalLabel?: string;
  /** Formats the total and each part's value. */
  formatValue?: (value: number) => string;
  /** Height of the bar in pixels. */
  barHeight?: number;
  /** Hides the headline with the total. */
  hideHeader?: boolean;
  /** Controlled keys of the parts switched off in the legend. The rest are rescaled to fill the bar. */
  hiddenKeys?: string[];
  /** Parts switched off on first render when uncontrolled. */
  defaultHiddenKeys?: string[];
  /** Called when a legend item switches a part on or off. The last part on show cannot be switched off. */
  onHiddenChange?: (keys: string[]) => void;
  /** Extra class on the root figure. */
  className?: string;
}

const { spring, duration, ease, stagger } = motionTokens;
const follow = { stiffness: 480, damping: 42, restDelta: .01 };
/** Space between segments, their corner radius, and how far the one in focus grows above and below the bar. */
const GAP = 3, RADIUS = 6, LIFT = 3;
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const f = (value: number) => value.toFixed(1);
/** Neutral steps after the four series colors. */
const NEUTRAL = [52, 34, 22];
const seriesColor = (index: number) => index < 4 ? `var(--series-${index + 1})` : `color-mix(in oklab, var(--foreground) ${NEUTRAL[(index - 4) % NEUTRAL.length]}%, var(--surface))`;

const subscribeNothing = () => () => {};
/** Reduced motion is only known in the browser, so the first client render matches the server before it takes effect. */
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/** The bar draws in its own pixels: the width is read before paint and followed on resize. */
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

/** A rounded segment. With no width it is a line at its left edge, the shape a segment grows from and folds back into. */
function segmentPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(RADIUS, w / 2, h / 2);
  return `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`;
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

export function CompositionChart({ data, label, totalLabel = "total", formatValue = value => grouped.format(value), barHeight = 28, hideHeader = false, hiddenKeys, defaultHiddenKeys, onHiddenChange, className }: CompositionChartProps) {
  const reduced = useReducedMotionSafe();
  const figure = useRef<HTMLElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const [plot, width] = useWidth<HTMLDivElement>();
  const inView = useInView(figure, { once: true, amount: .3 });
  const shown = inView || reduced;
  const titleId = useId();

  const [innerHidden, setInnerHidden] = useState<string[]>(defaultHiddenKeys ?? []);
  const hidden = hiddenKeys ?? innerHidden;
  const visible = data.filter(item => !hidden.includes(item.key) && item.value > 0);
  const toggle = (key: string) => {
    const off = hidden.includes(key);
    // The last part on show stays: an empty bar would say nothing.
    if (!off && visible.length <= 1 && visible[0]?.key === key) return;
    const next = off ? hidden.filter(item => item !== key) : [...hidden, key];
    if (hiddenKeys === undefined) setInnerHidden(next);
    onHiddenChange?.(next);
  };
  const [active, setActive] = useState<string | null>(null);

  const total = visible.reduce((sum, item) => sum + item.value, 0);
  const room = Math.max(0, width - GAP * Math.max(0, visible.length - 1));
  // Every part keeps a place in the bar: one that is switched off folds to nothing where it stood.
  let cursor = 0;
  const parts = data.map((item, at) => {
    const on = visible.includes(item), w = on && total > 0 ? (item.value / total) * room : 0, x = cursor;
    if (on) cursor += w + GAP;
    return { item, at, on, x, w, share: on && total > 0 ? (item.value / total) * 100 : 0, color: item.color ?? seriesColor(at) };
  });
  const focus = parts.find(part => part.item.key === active && part.on) ?? null;

  // The first reveal runs left to right; later data changes slide at once.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!shown || settled) return;
    const timer = setTimeout(() => setSettled(true), 900);
    return () => clearTimeout(timer);
  }, [settled, shown]);
  const delayOf = (at: number) => settled ? 0 : Math.min(at * stagger.item * 1.6, .32);

  const tipX = useMotionValue(0);
  const glideX = useSpring(tipX, follow);
  const wasOpen = useRef(false);
  const [lastShown, setLastShown] = useState<string | null>(null);
  if (focus && focus.item.key !== lastShown) setLastShown(focus.item.key);
  const tip = focus ?? parts.find(part => part.item.key === lastShown) ?? null;
  const anchor = focus ? focus.x + focus.w / 2 : null;
  useLayoutEffect(() => {
    if (anchor === null || !width) { wasOpen.current = false; return; }
    const w = tooltip.current?.offsetWidth ?? 180, x = clamp(anchor - w / 2, 0, Math.max(0, width - w));
    tipX.set(x);
    if (!wasOpen.current || reduced) glideX.jump(x);
    wasOpen.current = true;
  }, [anchor, focus?.item.key, glideX, reduced, tipX, width]);

  const percent = (value: number) => `${value.toFixed(1)}%`;
  const instant = { duration: 0 } as const;
  const height = barHeight + LIFT * 2;

  return <figure ref={figure} className={[styles.figure, className].filter(Boolean).join(" ")} aria-labelledby={titleId}>
    <figcaption id={titleId} className={styles.srOnly}>{label}</figcaption>
    {!hideHeader && <div className={styles.header} aria-hidden="true">
      <span className={styles.kind}>{label}</span>
      <span className={styles.value}><Count value={total} format={value => formatValue(Math.round(value))} shown={shown} reduced={reduced} /><span className={styles.unit}>{totalLabel}</span></span>
    </div>}
    <div ref={plot} className={styles.plot} data-active={focus ? "" : undefined} style={{ height }} onPointerLeave={event => { if (event.pointerType === "mouse") setActive(null); }}>
      {width > 0 && <svg className={styles.svg} width={width} height={height} aria-hidden="true">
        <rect className={styles.track} x={0} y={LIFT} width={width} height={barHeight} rx={RADIUS} />
        {parts.map(part => {
          const lifted = focus === part, y = lifted ? 0 : LIFT, h = lifted ? height : barHeight;
          const full = segmentPath(part.x, y, part.w, h), folded = segmentPath(part.x, LIFT, 0, barHeight);
          return <motion.path key={part.item.key} className={styles.segment} data-on={lifted ? "" : undefined} data-off={part.on ? undefined : ""} style={{ fill: part.color }}
            initial={{ d: reduced ? full : folded, opacity: reduced && part.on ? 1 : 0 }} animate={{ d: shown ? full : folded, opacity: shown && part.on ? 1 : 0 }}
            transition={reduced ? instant : { d: { ...spring.smooth, delay: delayOf(part.at) }, opacity: { duration: duration.fast, delay: delayOf(part.at) } }}
            onPointerEnter={() => { if (part.on) setActive(part.item.key); }} onPointerDown={() => { if (part.on) setActive(part.item.key); }} />;
        })}
      </svg>}
      <motion.div ref={tooltip} className={styles.tooltip} style={{ x: glideX }} aria-hidden="true">
        {tip && <>
          <p className={styles.tipTitle}><span className={styles.swatch} style={{ background: tip.color }} />{tip.item.label}</p>
          <p className={styles.tipRow}><span className={styles.tipName}>Value</span><span className={styles.tipValue}>{formatValue(tip.item.value)}</span></p>
          <p className={styles.tipRow}><span className={styles.tipName}>Share</span><span className={styles.tipValue}>{percent(tip.share)}</span></p>
        </>}
      </motion.div>
    </div>
    <ul className={styles.legend} aria-label={`${label}: parts. Select one to hide or show it.`}>
      {parts.map(part => <motion.li key={part.item.key} className={styles.entry} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 6 }} animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 6 }} transition={reduced ? instant : { ...spring.smooth, delay: delayOf(part.at) + .08 }}>
        <button type="button" className={styles.item} aria-pressed={part.on} data-on={focus === part ? "" : undefined} data-off={part.on ? undefined : ""}
          onClick={() => toggle(part.item.key)} onPointerEnter={event => { if (event.pointerType === "mouse") setActive(part.item.key); }} onPointerLeave={event => { if (event.pointerType === "mouse") setActive(null); }}
          onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setActive(part.item.key); }} onBlur={() => setActive(current => current === part.item.key ? null : current)}>
          <span className={styles.mark} style={{ color: part.color }} />
          <span className={styles.name}>{part.item.label}</span>
          <span className={styles.amount}>{formatValue(part.item.value)}</span>
          <span className={styles.share}>{part.on ? <Count value={part.share} format={percent} shown={shown} reduced={reduced} /> : "Hidden"}</span>
        </button>
      </motion.li>)}
    </ul>
  </figure>;
}

export default CompositionChart;
