"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./window-range.module.css";

export interface WindowRangeTick {
  /** Domain value the tick points at. */
  value: number;
  /** Short label, such as a month name. */
  label: string;
}

export interface WindowRangeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "value" | "onChange" | "defaultValue"> {
  /** The series behind the window, one number per point, spread evenly from min to max. Pass a new array to morph the chart to it. */
  data: readonly number[];
  /** Controlled window as [start, end] in domain units. Pair with onValueChange. A new value from outside glides the frame there. */
  value?: [number, number];
  /** Starting window when uncontrolled. Defaults to the last quarter of the domain. */
  defaultValue?: [number, number];
  /** Runs on every change while dragging, coasting after a flick or pressing keys. */
  onValueChange?: (value: [number, number]) => void;
  /** Runs once the window has settled after a drag, a flick or a key. */
  onValueCommit?: (value: [number, number]) => void;
  /** Start of the domain, for example day 0. */
  min?: number;
  /** End of the domain. Defaults to data.length - 1. */
  max?: number;
  /** Both ends snap to this step, counted from min. */
  step?: number;
  /** How far Page Up, Page Down and Shift with an arrow move an edge or the window. Defaults to a tenth of the domain. */
  largeStep?: number;
  /** The narrowest window as end minus start, in domain units. */
  minSpan?: number;
  /** The widest window as end minus start, in domain units. Defaults to the whole domain. */
  maxSpan?: number;
  /** Formats the start and end readouts and the spoken values. */
  format?: (value: number) => string;
  /** Formats the middle readout from end minus start. Pass null to hide it. */
  formatSpan?: ((span: number) => string) | null;
  /** Labels under the chart, such as the first day of each month. */
  ticks?: readonly WindowRangeTick[];
  /** Names the group and prefixes the names of the start, window and end sliders. */
  label?: string;
  /** Pulses a dot on the latest point to show that the series is still arriving. */
  live?: boolean;
  /** Any CSS color for the frame and the line. Defaults to the theme ink color for the frame and the first chart series for the line. */
  accent?: string;
  /** Height of the chart in px, from 64 to 240. */
  height?: number;
  /** Dims the control and ignores pointer and keys. */
  disabled?: boolean;
}

type Mode = "start" | "end" | "pan" | "glide";
interface DragState {
  mode: Mode;
  id: number;
  /** For pan: grabbed pointer position minus the window start, in domain units. */
  grab: number;
  /** Frozen span while panning, in domain units. */
  span: number;
  /** Frozen opposite edge while resizing. */
  other: number;
  lastX: number;
  lastT: number;
  velocity: number;
  moved: boolean;
  /** Pointer position at press start, in client px; a press counts as a drag once it travels this far. */
  startX: number;
  /** Last target the glide spring was sent toward; small moves reuse the running spring instead of restarting it. */
  glideT: [number, number] | null;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
/** Past a limit the drag resists instead of failing, like a rubber band. */
const rubber = (raw: number, lo: number, hi: number) => (raw < lo ? lo + (raw - lo) * .3 : raw > hi ? hi + (raw - hi) * .3 : raw);
const coastSpring = { type: "spring", visualDuration: .58, bounce: 0 } as const;
const glideSpring = { type: "spring", visualDuration: .5, bounce: 0 } as const;

/** Splits a readout into rolling segments: runs of letters roll as one word, digits and spaces roll one char at a time. */
function segmentize(text: string): string[] {
  const out: string[] = [];
  let buf = "", letter = false;
  for (const ch of Array.from(text)) {
    const isLetter = /\p{L}/u.test(ch);
    if (isLetter && letter) buf += ch;
    else { if (buf) out.push(buf); buf = ch; letter = isLetter; }
  }
  if (buf) out.push(buf);
  return out;
}

/** One segment of a rolling readout: it slides in the direction of change while the outgoing copy slides out. */
function RollSeg({ text, instant }: { text: string; instant: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const prev = useRef(text);
  const dirRef = useRef<1 | -1>(1);
  if (text !== prev.current) {
    dirRef.current = Array.from(text)[0]?.codePointAt(0)! >= Array.from(prev.current)[0]?.codePointAt(0)! ? 1 : -1;
    prev.current = text;
  }
  const d = dirRef.current;
  const still = instant || reduce;
  return (
    <span className={styles.slot}>
      {/* popLayout keeps the slot from collapsing while the outgoing copy slides away. */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span key={text} className={styles.char} initial={still ? { opacity: 1, y: "0%" } : { opacity: 0, y: d === 1 ? "62%" : "-62%" }} animate={{ opacity: 1, y: "0%" }} exit={{ opacity: 0, y: d === 1 ? "-62%" : "62%", transition: { duration: still ? 0 : motionTokens.duration.fast, ease: [...motionTokens.ease.inOut] } }} transition={{ duration: still ? 0 : motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{text}</motion.span>
      </AnimatePresence>
    </span>
  );
}

/** A readout whose digits and words roll to their new values; in place, without trailing, while the frame moves. */
function RollingText({ text, instant, className }: { text: string; instant: boolean; className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      {segmentize(text).map((seg, index) => <RollSeg key={`${index}`} text={seg} instant={instant} />)}
    </span>
  );
}

/**
 * A time window over a live area chart. Drag either edge of the frame to resize it, drag inside to pan and flick to
 * let it coast, or press outside to glide it there. The chart outside the window fades back; inside, a floating lens
 * with a thick bezel replays the selected slice at full color, cropped 1:1 out of the plot. The start,
 * end and length readouts roll to their new values. New data morphs the chart in place, and with `live` a dot pulses
 * on the latest point.
 */
export function WindowRange({ data, value, defaultValue, onValueChange, onValueCommit, min = 0, max: maxProp, step = 1, largeStep: largeStepProp, minSpan: minSpanProp, maxSpan: maxSpanProp, format, formatSpan, ticks, label = "Date range", live, accent, height = 112, disabled, className, style, ...props }: WindowRangeProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reduce = useReducedMotion() ?? false;
  const fmt = format ?? ((v: number) => String(v));
  const H = clamp(Math.round(height), 64, 240);
  // The lens floats over the lower-middle of the plot; its bezel overhangs the selected slice by RAIL on each side.
  const RAIL = 10, TOPB = 2;
  const frameTop = Math.round(H * 0.28);
  const frameH = Math.round(H * 0.64);
  const screenTop = frameTop + TOPB;
  const screenH = Math.max(8, frameH - TOPB * 2);
  const n = data.length;
  const max = maxProp ?? Math.max(0, n - 1);
  const domain = Math.max(1e-9, max - min);
  const spanMin = clamp(minSpanProp ?? step, step, domain);
  const spanMax = clamp(maxSpanProp ?? domain, spanMin, domain);
  const largeStep = Math.max(step, largeStepProp ?? Math.round((domain / 10) / step) * step);
  const snapTo = useCallback((v: number) => min + Math.round((v - min) / step) * step, [min, step]);

  const [width, setWidth] = useState(0);
  const plotRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const geomRef = useRef<{ xs: number[]; ys: number[] } | null>(null);
  const morphRef = useRef<AnimationPlaybackControls | null>(null);

  const initRef = useRef<[number, number] | null>(null);
  if (!initRef.current) {
    const q = Math.round((domain / 4) / step) * step;
    initRef.current = defaultValue ?? [Math.max(min, max - q), max];
  }
  const mvStart = useMotionValue(initRef.current[0]);
  const mvEnd = useMotionValue(initRef.current[1]);

  const [range, setRange] = useState<[number, number]>(() => initRef.current!);
  const rangeRef = useRef(range);
  const appliedRef = useRef<string>(JSON.stringify(initRef.current));
  const onChangeRef = useRef(onValueChange);
  const onCommitRef = useRef(onValueCommit);
  onChangeRef.current = onValueChange;
  onCommitRef.current = onValueCommit;

  const [busy, setBusy] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  /** True while a pointer drag owns the frame: only then do changes stream out through onValueChange. Springs
      (glides, coasts, keys) report once through onValueCommit, so a controlled parent never feeds the frame's own
      mid-flight position back into it. */
  const interactiveRef = useRef(false);
  const glideRef = useRef<AnimationPlaybackControls[]>([]);
  const settleRef = useRef<AnimationPlaybackControls[]>([]);
  const stopAll = useCallback(() => {
    glideRef.current.forEach(c => c.stop());
    settleRef.current.forEach(c => c.stop());
    glideRef.current = [];
    settleRef.current = [];
  }, []);

  // Measure the plot; the chart path only rewrites when the width or the data change.
  useLayoutEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const geom = useMemo(() => {
    if (!n || width <= 4) return null;
    let lo = Infinity, hi = -Infinity;
    for (const v of data) { if (v < lo) lo = v; if (v > hi) hi = v; }
    if (!isFinite(lo) || !isFinite(hi)) { lo = 0; hi = 1; }
    if (hi === lo) hi = lo + 1;
    const top = 10, bottom = 8;
    const xs: number[] = new Array(n), ys: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
      const pos = min + (i * (max - min)) / Math.max(1, n - 1);
      xs[i] = +(((pos - min) / domain) * width).toFixed(2);
      ys[i] = +(top + ((hi - data[i]!) / (hi - lo)) * (H - top - bottom)).toFixed(2);
    }
    let line = "";
    for (let i = 0; i < n; i++) line += `${i ? "L" : "M"}${xs[i]} ${ys[i]}`;
    const area = `${line}L${xs[n - 1]} ${H}L${xs[0]} ${H}Z`;
    return { xs, ys, line, area };
  }, [data, width, H, min, max, domain, n]);

  // New data morphs the shapes in place; a resize or different length swaps them without a morph.
  useLayoutEffect(() => {
    if (!geom) return;
    const prev = geomRef.current;
    geomRef.current = { xs: geom.xs, ys: geom.ys };
    const paint = (xs: number[], ys: number[]) => {
      let line = "";
      for (let i = 0; i < xs.length; i++) line += `${i ? "L" : "M"}${xs[i]} ${ys[i]}`;
      const area = `${line}L${xs[xs.length - 1]} ${H}L${xs[0]} ${H}Z`;
      lineRef.current?.setAttribute("d", line);
      areaRef.current?.setAttribute("d", area);
    };
    if (!prev || reduce || prev.xs.length !== geom.xs.length) { paint(geom.xs, geom.ys); return; }
    const t = { v: 0 };
    morphRef.current = animate(t, { v: 1 }, {
      duration: motionTokens.duration.considered,
      ease: [...motionTokens.ease.standard],
      onUpdate: () => {
        paint(
          geom.xs.map((x, i) => prev.xs[i]! + (x - prev.xs[i]!) * t.v),
          geom.ys.map((y, i) => prev.ys[i]! + (y - prev.ys[i]!) * t.v),
        );
      },
    });
    return () => { morphRef.current?.stop(); morphRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geom, reduce]);

  // Frame geometry in px straight off the motion values: dragging only writes transforms, never relayouts the chart.
  const fx = useTransform(mvStart, s => ((s - min) / domain) * width);
  const fw = useTransform([mvStart, mvEnd], ([s = 0, e = 0]: number[]) => Math.max(2, ((e - s) / domain) * width));
  const frameX = useTransform(fx, v => v - RAIL);
  const frameW = useTransform(fw, v => v + RAIL * 2);
  // The screen inside the bezel shows the selected slice exactly as the plot draws it, 1:1 in x and y — the
  // lens crops the chart rather than rescaling it. The clip rect and the lens panel ride the window values, so
  // panning glides the line past the bezels.
  // The pulsing dot sits on the latest point, which is at the domain's right edge; it shows only while the
  // window's end edge is pinned there.
  const dotOn = useTransform(mvEnd, e => (e >= max - 1e-9 ? 1 : 0));

  // Keep the logical range, the props echo and onValueChange in step with the frame at all times.
  useEffect(() => {
    const sync = () => {
      const fs = mvStart.get(), fe = mvEnd.get();
      const si = clamp(snapTo(Math.min(fs, fe)), min, max);
      const ei = clamp(snapTo(Math.max(fs, fe)), si + spanMin, max);
      const next: [number, number] = [si, ei];
      if (next[0] === rangeRef.current[0] && next[1] === rangeRef.current[1]) return;
      rangeRef.current = next;
      setRange(next);
      if (interactiveRef.current) onChangeRef.current?.(next);
    };
    const a = mvStart.on("change", sync);
    const b = mvEnd.on("change", sync);
    sync();
    return () => { a(); b(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A new value from outside glides the frame there instead of teleporting.
  useEffect(() => {
    if (!value) return;
    const key = JSON.stringify(value);
    if (key === appliedRef.current) return;
    appliedRef.current = key;
    // While a drag is in flight the parent's new value is just our own onValueChange echo; the pointer owns the frame.
    if (dragRef.current) return;
    const s = clamp(snapTo(value[0]), min, max), e = clamp(snapTo(value[1]), min, max);
    if (reduce) { mvStart.jump(s); mvEnd.jump(e); return; }
    stopAll();
    setBusy(true);
    const c1 = animate(mvStart, s, motionTokens.spring.smooth);
    settleRef.current = [c1, animate(mvEnd, e, { ...motionTokens.spring.smooth, onComplete: () => { if (!dragRef.current) setBusy(false); } })];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce]);

  const glideTo = useCallback((target: [number, number], commit: boolean) => {
    stopAll();
    setBusy(true);
    glideRef.current = [animate(mvStart, target[0], glideSpring), animate(mvEnd, target[1], { ...glideSpring, onComplete: () => { if (!dragRef.current) { setBusy(false); if (commit) onCommitRef.current?.(rangeRef.current); } } })];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopAll]);

  const settle = useCallback((pos: [number, number], velocity = 0, commit = true) => {
    stopAll();
    const s = clamp(snapTo(pos[0]), min, max - spanMin);
    const e = clamp(snapTo(pos[1]), min, max);
    if (reduce) { mvStart.jump(s); mvEnd.jump(e); setBusy(false); if (commit) onCommitRef.current?.([s, e]); return; }
    const transition = velocity ? { ...coastSpring, velocity } : { ...motionTokens.spring.smooth };
    settleRef.current = [animate(mvStart, s, transition), animate(mvEnd, e, { ...transition, onComplete: () => { if (!dragRef.current) { setBusy(false); if (commit) onCommitRef.current?.(rangeRef.current); } } })];
    setBusy(true);
  }, [min, max, reduce, snapTo, spanMin, stopAll]);

  const idxAt = useCallback((clientX: number) => {
    const rect = plotRef.current?.getBoundingClientRect();
    return rect && width > 2 ? min + clamp((clientX - rect.left) / width, -.5, 1.5) * domain : min;
  }, [domain, min, width]);

  const begin = (event: ReactPointerEvent<HTMLElement>, mode: Mode) => {
    if (disabled || event.button > 0 || width < 4) return;
    event.preventDefault();
    stopAll();
    const [s, e] = rangeRef.current;
    const drag: DragState = {
      mode, id: event.pointerId, grab: 0, span: clamp(e - s, spanMin, spanMax), other: 0,
      lastX: event.clientX, lastT: performance.now(), velocity: 0, moved: false,
      startX: event.clientX, glideT: null,
    };
    if (mode === "pan") drag.grab = idxAt(event.clientX) - mvStart.get();
    if (mode === "start") drag.other = e;
    if (mode === "end") drag.other = s;
    if (mode === "glide") {
      // The press already starts gliding the window toward the finger; the rest of the drag retargets it.
      const c = clamp(idxAt(event.clientX), min + drag.span / 2, max - drag.span / 2);
      drag.glideT = [c - drag.span / 2, c + drag.span / 2];
      if (reduce) { mvStart.jump(drag.glideT[0]); mvEnd.jump(drag.glideT[1]); }
      else glideRef.current = [animate(mvStart, drag.glideT[0], glideSpring), animate(mvEnd, drag.glideT[1], glideSpring)];
    }
    dragRef.current = drag;
    interactiveRef.current = true;
    setBusy(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    (event.currentTarget as HTMLElement).focus({ preventScroll: true });
  };

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.id) return;
    const native = event.nativeEvent as PointerEvent;
    const samples = typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
    for (const ev of samples.length ? samples : [event]) {
      const now = performance.now(), idx = idxAt(ev.clientX);
      const dt = now - drag.lastT;
      if (dt > 0 && dt < 120) drag.velocity = ((idx - idxAt(drag.lastX)) / dt) * 1000;
      drag.lastX = ev.clientX;
      drag.lastT = now;
      if (!drag.moved && Math.abs(ev.clientX - drag.startX) >= 3) drag.moved = true;
      if (drag.mode === "pan") {
        const raw = idx - drag.grab;
        const s = rubber(raw, min, max - drag.span);
        mvStart.set(s);
        mvEnd.set(s + drag.span);
      } else if (drag.mode === "start") {
        mvStart.set(rubber(idx, min, Math.min(drag.other - spanMin, max)));
      } else if (drag.mode === "end") {
        mvEnd.set(rubber(idx, Math.max(drag.other + spanMin, min), max));
      } else {
        // Pressing outside the frame glides it to center on the finger on a softer spring. The spring keeps
        // running between moves; it is restarted only when the target travels far enough to be worth it.
        const c = clamp(idx, min + drag.span / 2, max - drag.span / 2);
        const target: [number, number] = [c - drag.span / 2, c + drag.span / 2];
        const prev = drag.glideT;
        drag.glideT = target;
        if (reduce) { mvStart.jump(target[0]); mvEnd.jump(target[1]); continue; }
        if (prev && Math.abs(target[0] - prev[0]) < domain / 120 && Math.abs(target[1] - prev[1]) < domain / 120) continue;
        stopAll();
        glideRef.current = [animate(mvStart, target[0], glideSpring), animate(mvEnd, target[1], glideSpring)];
      }
    }
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.id) return;
    dragRef.current = null;
    interactiveRef.current = false;
    const pos: [number, number] = [mvStart.get(), mvEnd.get()];
    if (!drag.moved) {
      // A tap outside the frame recenters it there and commits once it lands.
      if (drag.mode === "glide") {
        const c = idxAt(event.clientX);
        glideTo([clamp(c - drag.span / 2, min, max - drag.span), clamp(c + drag.span / 2, min + drag.span, max)], true);
      } else settle(pos, 0, true);
      return;
    }
    if (reduce) { settle(pos, 0, true); return; }
    // A fast release keeps the measured speed and coasts to a snapped landing point.
    if (drag.mode === "pan" && Math.abs(drag.velocity) > domain / 2) {
      stopAll();
      const s = clamp(snapTo(mvStart.get() + drag.velocity * .16), min, max - drag.span);
      settleRef.current = [
        animate(mvStart, s, { ...coastSpring, velocity: drag.velocity }),
        animate(mvEnd, s + drag.span, { ...coastSpring, velocity: drag.velocity, onComplete: () => { if (!dragRef.current) { setBusy(false); onCommitRef.current?.(rangeRef.current); } } }),
      ];
      return;
    }
    settle(pos, 0, true);
  };

  const onKey = (event: ReactKeyboardEvent<HTMLDivElement>, which: "start" | "window" | "end") => {
    if (disabled) return;
    const [s, e] = rangeRef.current;
    const span = clamp(e - s, spanMin, spanMax);
    const big = event.shiftKey || event.key === "PageUp" || event.key === "PageDown";
    const delta = ({ ArrowRight: 1, ArrowUp: 1, PageUp: 1, ArrowLeft: -1, ArrowDown: -1, PageDown: -1 } as Record<string, number>)[event.key];
    let next: [number, number] | null = null;
    if (which === "window" && event.key === "Home") next = [min, min + span];
    else if (which === "window" && event.key === "End") next = [max - span, max];
    else if (which === "start" && event.key === "Home") next = [min, e];
    else if (which === "start" && event.key === "End") next = [e - spanMin, e];
    else if (which === "end" && event.key === "Home") next = [s, s + spanMin];
    else if (which === "end" && event.key === "End") next = [s, max];
    else if (delta) {
      const move = delta * (big ? largeStep : step);
      if (which === "window") next = [clamp(s + move, min, max - span), clamp(e + move, min + span, max)];
      else if (which === "start") next = [clamp(s + move, min, e - spanMin), e];
      else next = [s, clamp(e + move, s + spanMin, max)];
    }
    if (!next) return;
    event.preventDefault();
    if (reduce) { mvStart.jump(next[0]); mvEnd.jump(next[1]); onCommitRef.current?.(rangeRef.current); return; }
    stopAll();
    glideRef.current = [
      animate(mvStart, next[0], motionTokens.spring.smooth),
      animate(mvEnd, next[1], { ...motionTokens.spring.smooth, onComplete: () => { if (!dragRef.current) { setBusy(false); onCommitRef.current?.(rangeRef.current); } } }),
    ];
    setBusy(true);
  };

  const [rs, re] = range;
  const span = re - rs;
  const tab = disabled ? -1 : 0;
  const classes = [styles.root, disabled ? styles.disabled : "", busy ? styles.busy : "", className].filter(Boolean).join(" ");
  // The frame takes the ink of the theme: near-black on light, near-white on dark, like a selection marquee.
  const vars = { "--wr-frame": accent ?? "var(--foreground)", "--wr-line": accent ?? "var(--series-1)" } as CSSProperties;
  const xPix = (v: number) => ((v - min) / domain) * width;
  const tickShift = (px: number) => (px < 18 ? "0%" : px > width - 18 ? "-100%" : "-50%");

  return (
    <div {...props} className={classes} style={{ ...vars, ...style }} role="group" aria-label={label} data-reduced={reduce || undefined}>
      <div className={styles.readouts}>
        <RollingText className={styles.read} text={fmt(rs)} instant={busy} />
        {formatSpan ? <RollingText className={styles.readMid} text={formatSpan(span)} instant={busy} /> : <span className={styles.readMid} />}
        <RollingText className={styles.read} text={fmt(re)} instant={busy} />
      </div>
      <div ref={plotRef} className={styles.plot} style={{ height: H }}
        onPointerDown={event => begin(event, "glide")} onPointerMove={onMove} onPointerUp={endDrag}
        onPointerCancel={() => { if (!dragRef.current) return; dragRef.current = null; interactiveRef.current = false; settle([mvStart.get(), mvEnd.get()], 0, false); }}>
        <svg className={styles.svg} width="100%" height={H} aria-hidden="true" focusable="false">
          <defs>
            <clipPath id={`${uid}-clip`} clipPathUnits="userSpaceOnUse">
              <motion.rect x={fx} y={screenTop} width={fw} height={screenH} rx={7} />
            </clipPath>
          </defs>
          {geom ? <>
            <path className={styles.mutedArea} d={geom.area} vectorEffect="non-scaling-stroke" />
            <path className={styles.mutedLine} d={geom.line} vectorEffect="non-scaling-stroke" />
            {/* The lens screen: opaque panel over the muted chart, sized to the selected slice. */}
            <motion.rect className={styles.lensBg} x={fx} y={screenTop} width={fw} height={screenH} rx={7} />
            <g clipPath={`url(#${uid}-clip)`}>
              <path ref={areaRef} className={styles.area} d={geom.area} vectorEffect="non-scaling-stroke" />
              <path ref={lineRef} className={styles.line} d={geom.line} vectorEffect="non-scaling-stroke" />
            </g>
          </> : null}
        </svg>
        {live && geom ? (
          <motion.span className={styles.liveDot} style={{ left: geom.xs[geom.xs.length - 1], top: geom.ys[geom.ys.length - 1], opacity: dotOn }} aria-hidden="true" />
        ) : null}
        <motion.div className={styles.frame} style={{ x: frameX, width: frameW, top: frameTop, height: frameH }} onPointerDown={event => { event.stopPropagation(); begin(event, "pan"); }} role="slider" tabIndex={tab} aria-label={`${label} window`} aria-valuemin={min} aria-valuemax={Math.max(min, max - span)} aria-valuenow={rs} aria-valuetext={`${fmt(rs)} to ${fmt(re)}`} onKeyDown={event => onKey(event, "window")} />
        <motion.div className={`${styles.edge} ${styles.edgeStart}`} style={{ x: frameX, width: frameW, top: frameTop, height: frameH }} onPointerDown={event => { event.stopPropagation(); begin(event, "start"); }} role="slider" tabIndex={tab} aria-label={`${label} start`} aria-valuemin={min} aria-valuemax={Math.max(min, re - spanMin)} aria-valuenow={rs} aria-valuetext={fmt(rs)} onKeyDown={event => onKey(event, "start")}>
          <span className={styles.grip} aria-hidden="true" />
        </motion.div>
        <motion.div className={`${styles.edge} ${styles.edgeEnd}`} style={{ x: frameX, width: frameW, top: frameTop, height: frameH }} onPointerDown={event => { event.stopPropagation(); begin(event, "end"); }} role="slider" tabIndex={tab} aria-label={`${label} end`} aria-valuemin={Math.min(max, rs + spanMin)} aria-valuemax={max} aria-valuenow={re} aria-valuetext={fmt(re)} onKeyDown={event => onKey(event, "end")}>
          <span className={styles.grip} aria-hidden="true" />
        </motion.div>
      </div>
      {ticks?.length ? (
        <div className={styles.axis} aria-hidden="true">
          {ticks.map(tick => {
            const px = xPix(tick.value);
            if (px < 0 || px > width) return null;
            return <span key={tick.value} className={styles.tick} style={{ left: px, translate: `${tickShift(px)} 0` }}>{tick.label}</span>;
          })}
        </div>
      ) : null}
    </div>
  );
}

export default WindowRange;
