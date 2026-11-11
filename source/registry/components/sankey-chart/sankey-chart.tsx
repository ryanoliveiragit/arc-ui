"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./sankey-chart.module.css";

export interface SankeyNode {
  /** Stable identity, used by links. A node that survives a data change keeps its place and morphs. */
  id: string;
  /** Name beside the node, in the tooltip and in the table. */
  label: string;
  /** Any CSS color. First-column nodes default to the shared --series-* palette; later nodes default to a neutral ink. */
  color?: string;
}

export interface SankeyLink {
  /** Id of the node the flow leaves. */
  source: string;
  /** Id of the node the flow enters. */
  target: string;
  /** Size of the flow. The ribbon is as thick as this value on the shared scale. */
  value: number;
}

/** Use a Sankey chart to show how a total splits and recombines across two or more stages. */
export interface SankeyChartProps {
  /** Every node, in the order they should stack inside the first column. */
  nodes: SankeyNode[];
  /** Flows between nodes. One link per source and target pair. */
  links: SankeyLink[];
  /** What flows, such as "Visits by source and outcome". Names the chart for assistive technology. */
  label: string;
  /** Optional heading above each column, such as ["Source", "Landing page", "Outcome"]. */
  columns?: string[];
  /** Plot height in pixels. */
  height?: number;
  /** Width of each node bar in pixels. */
  nodeWidth?: number;
  /** Vertical space between nodes of one column in pixels. */
  nodeGap?: number;
  /** Unit after each value, such as "visits". */
  unit?: string;
  /** Formats values in labels, the tooltip and the table. */
  formatValue?: (value: number) => string;
  /** Controlled item in focus: a node id, or a link id written as "source>target". The rest dims while one is in focus. */
  activeId?: string | null;
  /** Item in focus on first render when uncontrolled. */
  defaultActiveId?: string | null;
  /** Called when hover, touch or the keyboard moves the focus to another node or ribbon, or clears it. */
  onActiveChange?: (id: string | null) => void;
  /** Extra class on the root figure. */
  className?: string;
}

type Placed = { node: SankeyNode; order: number; column: number; value: number; inflow: number; outflow: number; x: number; y: number; h: number; color: string | null };
type Flow = { id: string; link: SankeyLink; source: Placed; target: Placed; thickness: number; y0: number; y1: number; color: string | null };
type Graph = { columns: Placed[][]; nodes: Placed[]; flows: Flow[]; step: number; last: number };

const { spring, duration, ease, stagger } = motionTokens;
const follow = { stiffness: 480, damping: 42, restDelta: .01 };
/** Each column starts a beat after the one before it, so the flow reads left to right. */
const COLUMN_DELAY = .12, DRAW = .5, RADIUS = 3;
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const f = (value: number) => value.toFixed(1);
const seriesColor = (index: number) => index < 4 ? `var(--series-${index + 1})` : null;

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

/** Columns by longest path from a source, sinks pushed to the last column, one shared value scale, and nodes ordered by where their flows come from. */
function layout(nodes: SankeyNode[], links: SankeyLink[], width: number, height: number, nodeWidth: number, nodeGap: number): Graph {
  const index = new Map(nodes.map((node, at) => [node.id, at]));
  const valid = links.filter(link => link.value > 0 && link.source !== link.target && index.has(link.source) && index.has(link.target));
  const depth = nodes.map(() => 0), inflow = nodes.map(() => 0), outflow = nodes.map(() => 0);
  for (let pass = 0; pass < nodes.length; pass++) {
    let moved = false;
    for (const link of valid) {
      const from = index.get(link.source) ?? 0, to = index.get(link.target) ?? 0, next = (depth[from] ?? 0) + 1;
      if (next > (depth[to] ?? 0) && next < nodes.length) { depth[to] = next; moved = true; }
    }
    if (!moved) break;
  }
  for (const link of valid) {
    const from = index.get(link.source) ?? 0, to = index.get(link.target) ?? 0;
    outflow[from] = (outflow[from] ?? 0) + link.value;
    inflow[to] = (inflow[to] ?? 0) + link.value;
  }
  const last = Math.max(0, ...depth);
  const placed: Placed[] = nodes.map((node, at) => {
    const into = inflow[at] ?? 0, out = outflow[at] ?? 0;
    return { node, order: at, column: out === 0 && into > 0 ? last : depth[at] ?? 0, value: Math.max(into, out), inflow: into, outflow: out, x: 0, y: 0, h: 0, color: node.color ?? null };
  }).filter(item => item.value > 0);
  const columns = Array.from({ length: last + 1 }, (_, column) => placed.filter(item => item.column === column));
  const busiest = Math.max(1, ...columns.map(column => column.length));
  const gap = busiest > 1 ? Math.min(nodeGap, (height * .45) / (busiest - 1)) : nodeGap;
  const scale = Math.min(...columns.filter(column => column.length).map(column => (height - (column.length - 1) * gap) / column.reduce((sum, item) => sum + item.value, 0)), Infinity);
  const k = Number.isFinite(scale) ? scale : 0;
  const step = last > 0 ? (width - nodeWidth) / last : 0;
  const stack = (column: Placed[]) => {
    const total = column.reduce((sum, item) => sum + item.h, 0) + (column.length - 1) * gap;
    let y = (height - total) / 2;
    for (const item of column) { item.y = y; y += item.h + gap; }
  };
  columns.forEach((column, at) => { column.forEach(item => { item.x = at * step; item.h = Math.max(2, item.value * k); }); stack(column); });
  columns[0]?.forEach((item, at) => { item.color ??= seriesColor(at); });

  const byId = new Map(placed.map(item => [item.node.id, item]));
  for (let at = 1; at <= last; at++) {
    const column = columns[at] ?? [], weight = new Map<Placed, number>();
    for (const item of column) {
      let sum = 0, total = 0;
      for (const link of valid) {
        const source = link.target === item.node.id ? byId.get(link.source) : undefined;
        if (source) { sum += (source.y + source.h / 2) * link.value; total += link.value; }
      }
      weight.set(item, total ? sum / total : height / 2);
    }
    column.sort((a, b) => (weight.get(a) ?? 0) - (weight.get(b) ?? 0) || a.order - b.order);
    stack(column);
  }

  const flows: Flow[] = valid.flatMap(link => {
    const source = byId.get(link.source), target = byId.get(link.target);
    return source && target ? [{ id: `${link.source}>${link.target}`, link, source, target, thickness: Math.max(1, link.value * k), y0: 0, y1: 0, color: source.color ?? target.color }] : [];
  });
  for (const item of placed) {
    let y = item.y;
    for (const flow of flows.filter(flow => flow.source === item).sort((a, b) => a.target.y - b.target.y)) { flow.y0 = y + flow.thickness / 2; y += flow.link.value * k; }
    y = item.y;
    for (const flow of flows.filter(flow => flow.target === item).sort((a, b) => a.source.y - b.source.y)) { flow.y1 = y + flow.thickness / 2; y += flow.link.value * k; }
  }
  return { columns, nodes: columns.flat(), flows, step, last };
}

/** A ribbon is one thick stroke along its centre line, so it can draw in from its source. */
const ribbon = (flow: Flow, nodeWidth: number) => {
  const x0 = flow.source.x + nodeWidth, x1 = flow.target.x, middle = (x0 + x1) / 2;
  return `M${f(x0)} ${f(flow.y0)}C${f(middle)} ${f(flow.y0)} ${f(middle)} ${f(flow.y1)} ${f(x1)} ${f(flow.y1)}`;
};
/** A softly rounded bar. With no height it is a flat line at its own centre, the shape a node grows from. */
const bar = (x: number, y: number, w: number, h: number) => {
  const r = Math.min(RADIUS, w / 2, h / 2);
  return `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`;
};

export function SankeyChart({ nodes, links, label, columns, height = 300, nodeWidth = 10, nodeGap = 16, unit = "", formatValue = value => grouped.format(value), activeId, defaultActiveId = null, onActiveChange, className }: SankeyChartProps) {
  const reduced = useReducedMotionSafe();
  const figure = useRef<HTMLElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const [stage, width] = useWidth<HTMLDivElement>();
  const inView = useInView(figure, { once: true, amount: .3 });
  const shown = inView || reduced;
  const titleId = useId();
  const suffix = unit ? ` ${unit}` : "";

  const [inner, setInner] = useState<string | null>(defaultActiveId);
  const wanted = activeId !== undefined ? activeId : inner;
  const setActive = (id: string | null) => {
    if (id === wanted) return;
    if (activeId === undefined) setInner(id);
    onActiveChange?.(id);
  };

  const graph = useMemo(() => layout(nodes, links, width, height, nodeWidth, nodeGap), [nodes, links, width, height, nodeWidth, nodeGap]);
  const activeNode = graph.nodes.find(item => item.node.id === wanted) ?? null;
  const activeFlow = activeNode ? null : graph.flows.find(flow => flow.id === wanted) ?? null;
  const active = activeNode?.node.id ?? activeFlow?.id ?? null;
  // What stays lit: a node keeps its ribbons and the nodes at their far ends; a ribbon keeps its two nodes.
  const lit = useMemo(() => {
    const ids = new Set<string>();
    if (activeNode) {
      ids.add(activeNode.node.id);
      for (const flow of graph.flows) if (flow.source === activeNode || flow.target === activeNode) { ids.add(flow.id); ids.add(flow.source.node.id); ids.add(flow.target.node.id); }
    } else if (activeFlow) { ids.add(activeFlow.id); ids.add(activeFlow.source.node.id); ids.add(activeFlow.target.node.id); }
    return ids;
  }, [activeNode, activeFlow, graph.flows]);

  // The first reveal is staggered by column; later data changes morph at once.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!shown || settled) return;
    const timer = setTimeout(() => setSettled(true), (graph.last * COLUMN_DELAY + DRAW + .3) * 1000);
    return () => clearTimeout(timer);
  }, [graph.last, settled, shown]);

  // The tooltip keeps its last content while it fades out, and glides between items once it is open.
  const [last, setLast] = useState<string | null>(active);
  if (active && active !== last) setLast(active);
  const tipNode = graph.nodes.find(item => item.node.id === (active ?? last)) ?? null;
  const tipFlow = tipNode ? null : graph.flows.find(flow => flow.id === (active ?? last)) ?? null;
  const anchorX = activeNode ? activeNode.x + nodeWidth / 2 : activeFlow ? (activeFlow.source.x + nodeWidth + activeFlow.target.x) / 2 : null;
  const anchorY = activeNode ? activeNode.y : activeFlow ? (activeFlow.y0 + activeFlow.y1) / 2 - activeFlow.thickness / 2 : null;
  const tipX = useMotionValue(0), tipY = useMotionValue(0);
  const glideX = useSpring(tipX, follow), glideY = useSpring(tipY, follow);
  const wasOpen = useRef(false);
  useLayoutEffect(() => {
    if (anchorX === null || anchorY === null) { wasOpen.current = false; return; }
    const node = tooltip.current, w = node?.offsetWidth ?? 180, h = node?.offsetHeight ?? 80;
    const x = clamp(anchorX - w / 2, 0, Math.max(0, width - w)), y = anchorY - h - 10 < -48 ? anchorY + 14 : anchorY - h - 10;
    tipX.set(x); tipY.set(y);
    if (!wasOpen.current || reduced) { glideX.jump(x); glideY.jump(y); }
    wasOpen.current = true;
  }, [active, anchorX, anchorY, glideX, glideY, reduced, tipX, tipY, width]);

  const idAt = (target: EventTarget) => (target as Element).closest?.("[data-id]")?.getAttribute("data-id") ?? null;
  const onPointerOver = (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType === "mouse") setActive(idAt(event.target)); };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && active) { event.preventDefault(); setActive(null); return; }
    const order = graph.nodes, at = activeNode ? order.indexOf(activeNode) : -1;
    if (!order.length) return;
    const across = (way: number) => {
      const from = order[at];
      if (!from) return 0;
      const column = graph.columns[clamp(from.column + way, 0, graph.last)] ?? [];
      const nearest = column.reduce<Placed | null>((best, item) => !best || Math.abs(item.y + item.h / 2 - from.y - from.h / 2) < Math.abs(best.y + best.h / 2 - from.y - from.h / 2) ? item : best, null);
      return nearest ? order.indexOf(nearest) : at;
    };
    const next = ({ ArrowDown: at + 1, ArrowUp: at < 0 ? order.length - 1 : at - 1, ArrowRight: at < 0 ? 0 : across(1), ArrowLeft: at < 0 ? 0 : across(-1), Home: 0, End: order.length - 1 } as Record<string, number>)[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(order[clamp(next, 0, order.length - 1)]?.node.id ?? null);
  };

  const room = graph.step - nodeWidth;
  // The last two columns share one gap: one labels to its right, the other to its left. On a phone the labels step down a size to fit it.
  const narrow = graph.last > 0 && (room - 24) / 2 < 80;
  const labelRoom = (column: number) => Math.max(24, graph.last === 0 ? width - nodeWidth - 8 : column >= graph.last - 1 ? (room - (narrow ? 12 : 24)) / 2 : room - 16);
  const showValues = labelRoom(graph.last) >= 100;
  const share = (part: number, whole: number) => whole > 0 ? `${grouped.format((part / whole) * 100)}%` : "0%";
  const tipRows = tipNode ? graph.flows.filter(flow => tipNode.outflow > 0 ? flow.source === tipNode : flow.target === tipNode).sort((a, b) => b.link.value - a.link.value) : [];
  const reading = activeNode ?? graph.nodes[0];
  const valueText = reading ? `${reading.node.label}: ${formatValue(reading.value)}${suffix}, column ${reading.column + 1} of ${graph.last + 1}` : "No data";
  const instant = { duration: 0 };

  return <figure ref={figure} className={[styles.figure, className].filter(Boolean).join(" ")} aria-labelledby={titleId}>
    <figcaption id={titleId} className={styles.srOnly}>{label}</figcaption>
    <div ref={stage} className={styles.stage} data-active={active ? "" : undefined} data-narrow={narrow ? "" : undefined} role="slider" tabIndex={0} aria-label={`${label}, explore by node`} aria-orientation="vertical" aria-valuemin={1} aria-valuemax={Math.max(1, graph.nodes.length)} aria-valuenow={Math.max(1, (activeNode ? graph.nodes.indexOf(activeNode) : 0) + 1)} aria-valuetext={valueText}
      onPointerOver={onPointerOver} onPointerDown={event => setActive(idAt(event.target))} onPointerLeave={event => { if (event.pointerType === "mouse") setActive(null); }} onKeyDown={onKeyDown} onBlur={() => setActive(null)}
      onFocus={event => { if (event.currentTarget.matches(":focus-visible") && !active) setActive(graph.nodes[0]?.node.id ?? null); }}>
      {columns && width > 0 && <div className={styles.heads} aria-hidden="true">
        {graph.columns.map((_, at) => columns[at] ? <span key={at} className={styles.head} data-end={at === graph.last && at > 0 ? "" : undefined} style={at === graph.last && at > 0 ? { right: 0 } : { left: at * graph.step }}>{columns[at]}</span> : null)}
      </div>}
      <div className={styles.plot} style={{ height }}>
        {width > 0 && <svg className={styles.svg} width={width} height={height} aria-hidden="true">
          {graph.flows.map((flow, at) => {
            const d = ribbon(flow, nodeWidth), delay = settled ? 0 : flow.source.column * COLUMN_DELAY + .06 + Math.min(at * stagger.char / 2, .06);
            return <motion.path key={flow.id} className={styles.link} data-id={flow.id} data-on={lit.has(flow.id) ? "" : undefined} style={flow.color ? { stroke: flow.color } : undefined}
              initial={{ d, strokeWidth: flow.thickness, pathLength: reduced ? 1 : 0 }} animate={{ d, strokeWidth: flow.thickness, pathLength: shown ? 1 : 0 }}
              transition={reduced ? instant : { d: spring.smooth, strokeWidth: spring.smooth, pathLength: { duration: DRAW, ease: [...ease.inOut], delay } }} />;
          })}
          {graph.nodes.map(item => {
            const full = bar(item.x, item.y, nodeWidth, item.h), flat = bar(item.x, item.y + item.h / 2, nodeWidth, 0);
            return <g key={item.node.id} data-id={item.node.id}>
              <motion.path className={styles.node} data-on={lit.has(item.node.id) ? "" : undefined} style={item.color ? { fill: item.color } : undefined}
                initial={{ d: reduced ? full : flat }} animate={{ d: shown ? full : flat }} transition={reduced ? instant : { ...spring.smooth, delay: settled ? 0 : item.column * COLUMN_DELAY }} />
              <rect className={styles.hit} x={item.x - 6} y={item.y - 2} width={nodeWidth + 12} height={item.h + 4} />
            </g>;
          })}
        </svg>}
        {width > 0 && graph.nodes.map(item => {
          const end = item.column === graph.last && graph.last > 0;
          return <motion.span key={item.node.id} className={styles.label} data-id={item.node.id} data-end={end ? "" : undefined} data-on={lit.has(item.node.id) ? "" : undefined} aria-hidden="true"
            style={end ? { right: nodeWidth + (narrow ? 6 : 8), maxWidth: labelRoom(item.column) } : { left: item.x + nodeWidth + (narrow ? 6 : 8), maxWidth: labelRoom(item.column) }}
            initial={{ opacity: reduced ? 1 : 0, y: item.y + item.h / 2 }} animate={{ opacity: shown ? 1 : 0, y: item.y + item.h / 2 }}
            transition={reduced ? instant : { y: spring.smooth, opacity: { duration: duration.standard, delay: settled ? 0 : item.column * COLUMN_DELAY + .1 } }}>
            <span className={styles.name}>{item.node.label}</span>
            {showValues && <span className={styles.value}>{formatValue(item.value)}</span>}
          </motion.span>;
        })}
        <motion.div ref={tooltip} className={styles.tooltip} data-open={active ? "" : undefined} style={{ x: glideX, y: glideY }} aria-hidden="true">
          {tipNode && <>
            <p className={styles.tipTitle}><span className={styles.swatch} style={tipNode.color ? { background: tipNode.color } : undefined} />{tipNode.node.label}</p>
            <p className={styles.tipRow}><span className={styles.tipName}>Total</span><span className={styles.tipValue}>{formatValue(tipNode.value)}{suffix}</span></p>
            {tipRows.slice(0, 3).map(flow => <p key={flow.id} className={styles.tipRow}>
              <span className={styles.tipName}>{tipNode.outflow > 0 ? `To ${flow.target.node.label}` : `From ${flow.source.node.label}`}</span>
              <span className={styles.tipValue}>{share(flow.link.value, tipNode.value)}</span>
            </p>)}
            {tipRows.length > 3 && <p className={styles.tipMeta}>and {tipRows.length - 3} more</p>}
          </>}
          {tipFlow && <>
            <p className={styles.tipTitle}><span className={styles.swatch} style={tipFlow.color ? { background: tipFlow.color } : undefined} />{tipFlow.source.node.label} to {tipFlow.target.node.label}</p>
            <p className={styles.tipRow}><span className={styles.tipName}>Flow</span><span className={styles.tipValue}>{formatValue(tipFlow.link.value)}{suffix}</span></p>
            <p className={styles.tipMeta}>{share(tipFlow.link.value, tipFlow.source.value)} of {tipFlow.source.node.label}, {share(tipFlow.link.value, tipFlow.target.value)} of {tipFlow.target.node.label}</p>
          </>}
        </motion.div>
      </div>
    </div>
    <div className={styles.srOnly}><table>
      <caption>{label}</caption>
      <thead><tr><th scope="col">From</th><th scope="col">To</th><th scope="col">Value</th></tr></thead>
      <tbody>{graph.flows.map(flow => <tr key={flow.id}><th scope="row">{flow.source.node.label}</th><td>{flow.target.node.label}</td><td>{formatValue(flow.link.value)}{suffix}</td></tr>)}</tbody>
    </table></div>
  </figure>;
}

export default SankeyChart;
