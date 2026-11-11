"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent, RefObject } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion } from "motion/react";
import type { MotionValue, Variants } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./image-viewer.module.css";

export interface ImageViewerItem {
  /** URL of the full image shown in the lightbox. */
  src: string;
  /** Alternative text. It also names the thumbnail button. */
  alt: string;
  /** Smaller image for the grid. Defaults to `src`. */
  thumbnail?: string;
  /** Intrinsic width in pixels. With `height`, it lets the lightbox know the shape before the image loads. */
  width?: number;
  /** Intrinsic height in pixels. */
  height?: number;
  /** Line of text shown under the open image. */
  caption?: string;
}

/**
 * A thumbnail gallery that opens a lightbox. The pressed thumbnail itself grows into the full image and shrinks back into its place on close.
 * Inside: arrows, a filmstrip and swipe to move; wheel, pinch, double click and the + and - keys to zoom; drag to pan; Escape to close.
 */
export interface ImageViewerProps {
  /** The images, in order. */
  images: ImageViewerItem[];
  /** Index of the open image, or null when the lightbox is closed (controlled). */
  value?: number | null;
  /** Open image when uncontrolled. Defaults to closed. */
  defaultValue?: number | null;
  /** Called when an image opens, when the open image changes, and with null on close. */
  onValueChange?: (index: number | null) => void;
  /** Number of columns in the thumbnail grid. */
  columns?: number;
  /** Width divided by height of each thumbnail: 1 is a square, 4 / 3 a landscape tile. */
  thumbnailRatio?: number;
  /** Moving past the last image returns to the first, and back. */
  loop?: boolean;
  /** Largest zoom factor. */
  maxZoom?: number;
  /** Accessible name of the gallery and of the lightbox. */
  label?: string;
  /** Extra class for the thumbnail grid. */
  className?: string;
}

interface Rect { x: number; y: number; width: number; height: number; }
interface View { index: number; phase: "opening" | "open" | "closing"; origin: Rect | null; direction: number; }
interface SlideApi { swipeX: MotionValue<number>; zoom: MotionValue<number>; panX: MotionValue<number>; panY: MotionValue<number>; }
interface Drag { mode: "swipe" | "pan" | "pinch"; startX: number; startY: number; panX: number; panY: number; zoom: number; distance: number; moved: boolean; onFrame: boolean; samples: { t: number; x: number }[]; }

/** Filmstrip tile plus gap, in pixels. Keep in sync with image-viewer.module.css. */
const STRIP_STEP = 50;
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * The way back is quicker than the way in and drops any momentum left from an interrupted opening, so it always lands at the same moment.
 * A spring spends as long on its last pixel as on the visible move, so the lightbox unmounts after CLOSE_MS, when the image is within a
 * pixel of its thumbnail, instead of waiting for the spring to report rest. The page is usable again that much sooner.
 */
const closeSpring = { type: "spring", visualDuration: .3, bounce: 0, velocity: 0 } as const;
const CLOSE_MS = 460;

const slideVariants: Variants = {
  enter: (direction: number) => ({ x: direction * 110, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { x: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: standard } } },
  exit: (direction: number) => ({ x: direction * -110, opacity: 0, transition: { duration: motionTokens.duration.exit, ease: standard } }),
};
const fadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: motionTokens.duration.fast } },
  exit: { opacity: 0, transition: { duration: motionTokens.duration.fast } },
};

/** The largest box of the image's shape that fits the stage, leaving room for the bar above and the filmstrip below. */
function fitRect(stage: { width: number; height: number }, aspect: number, hasCaption: boolean): Rect {
  const side = stage.width >= 640 ? 84 : 12;
  const top = 68;
  const bottom = hasCaption ? 132 : 96;
  const maxWidth = Math.max(40, stage.width - side * 2);
  const maxHeight = Math.max(40, stage.height - top - bottom);
  const width = Math.min(maxWidth, maxHeight * aspect);
  const height = width / aspect;
  return { x: (stage.width - width) / 2, y: top + (maxHeight - height) / 2, width, height };
}

interface SlideProps {
  item: ImageViewerItem;
  fit: Rect;
  view: View;
  reduce: boolean;
  zoomed: boolean;
  apiRef: RefObject<SlideApi | null>;
  onAspect: (aspect: number) => void;
  onOpened: () => void;
  onClosed: () => void;
}

function Slide({ item, fit, view, reduce, zoomed, apiRef, onAspect, onOpened, onClosed }: SlideProps) {
  const isPresent = useIsPresent();
  const swipeX = useMotionValue(0);
  const zoom = useMotionValue(1);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const api = useMemo<SlideApi>(() => ({ swipeX, zoom, panX, panY }), [panX, panY, swipeX, zoom]);
  // The slide that opened the lightbox grows out of its thumbnail; slides reached by navigating come in from the side instead.
  const [entry] = useState(() => ({ opening: view.phase === "opening", origin: view.origin }));
  const closing = view.phase === "closing";
  const shared = !reduce && view.origin !== null;

  useLayoutEffect(() => {
    if (!isPresent) return;
    apiRef.current = api;
    return () => { if (apiRef.current === api) apiRef.current = null; };
  }, [api, apiRef, isPresent]);

  // On the way out the image returns to rest first, so it lands on the thumbnail unzoomed.
  useEffect(() => {
    if (!closing) return;
    const spring = reduce ? { duration: 0 } : motionTokens.spring.snappy;
    animate(zoom, 1, spring); animate(panX, 0, spring); animate(panY, 0, spring); animate(swipeX, 0, spring);
  }, [closing, panX, panY, reduce, swipeX, zoom]);

  const rest = { x: fit.x, y: fit.y, width: fit.width, height: fit.height, opacity: 1, scale: 1 };
  const target = !closing ? rest
    : shared && view.origin ? { ...view.origin, opacity: 1, scale: 1 }
    : { ...rest, opacity: 0, scale: reduce ? 1 : .94 };
  const initial = !entry.opening ? false
    : entry.origin && !reduce ? { ...entry.origin, opacity: 1, scale: 1 }
    : { ...rest, opacity: 0, scale: reduce ? 1 : .96 };
  const origin = `${fit.x + fit.width / 2}px ${fit.y + fit.height / 2}px`;

  return (
    <motion.div className={styles.slide} variants={reduce ? fadeVariants : slideVariants} custom={view.direction} initial={entry.opening ? false : "enter"} animate="center" exit="exit">
      <motion.div className={styles.layer} style={{ x: swipeX }}>
        <motion.div className={styles.layer} style={{ x: panX, y: panY, scale: zoom, transformOrigin: origin }}>
          <motion.div
            className={styles.frame}
            data-frame=""
            data-zoomed={zoomed || undefined}
            initial={initial}
            animate={target}
            transition={reduce ? { duration: motionTokens.duration.fast } : { ...(closing ? closeSpring : motionTokens.spring.morph), opacity: { duration: motionTokens.duration.fast, ease: standard } }}
            onAnimationComplete={() => { if (closing) onClosed(); else if (view.phase === "opening") onOpened(); }}
          >
            {item.thumbnail && item.thumbnail !== item.src ? <img className={styles.image} src={item.thumbnail} alt="" draggable={false} /> : null}
            <img className={styles.image} src={item.src} alt={item.alt} draggable={false} onLoad={event => { const { naturalWidth, naturalHeight } = event.currentTarget; if (naturalWidth && naturalHeight) onAspect(naturalWidth / naturalHeight); }} />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function ImageViewer({ images, value, defaultValue = null, onValueChange, columns = 3, thumbnailRatio = 1, loop = true, maxZoom = 4, label = "Image gallery", className }: ImageViewerProps) {
  const reduce = !!useReducedMotion();
  const [internal, setInternal] = useState<number | null>(defaultValue);
  const requested = value !== undefined ? value : internal;
  const current = requested !== null && images[requested] ? requested : null;
  const [view, setView] = useState<View | null>(null);
  const [stage, setStage] = useState({ width: 1024, height: 768 });
  const [aspects, setAspects] = useState<Record<number, number>>({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  // State, not a ref: the stage mounts inside a portal a moment after the lightbox opens, and the wheel listener must wait for it.
  const [stageNode, setStageNode] = useState<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SlideApi | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<Drag | null>(null);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const pendingDirection = useRef<number | null>(null);
  /** The zoom the image is heading to. A drag that begins while it settles back to 1 is already a swipe. */
  const zoomGoal = useRef(1);
  const lastIndex = useRef(0);

  const change = useCallback((next: number | null) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }, [onValueChange, value]);

  /** Where a thumbnail sits on screen, or null when it is scrolled out of view (then the image fades instead of flying). */
  const rectOf = useCallback((index: number): Rect | null => {
    const box = thumbs.current[index]?.getBoundingClientRect();
    if (!box || box.width === 0 || box.bottom < 0 || box.top > window.innerHeight || box.right < 0 || box.left > window.innerWidth) return null;
    return { x: box.left, y: box.top, width: box.width, height: box.height };
  }, []);

  // The lightbox outlives `current` by one animation: closing keeps it mounted until the image is back in its thumbnail.
  useEffect(() => {
    if (current !== null) {
      lastIndex.current = current;
      setStage({ width: window.innerWidth, height: window.innerHeight });
      zoomGoal.current = 1;
      setZoomLevel(1);
      setView(previous => {
        if (!previous) return { index: current, phase: "opening", origin: rectOf(current), direction: 0 };
        if (previous.index === current && previous.phase !== "closing") return previous;
        const direction = pendingDirection.current ?? Math.sign(current - previous.index);
        return { index: current, phase: previous.phase === "closing" ? "open" : previous.phase === "opening" && previous.index === current ? "opening" : "open", origin: previous.origin, direction };
      });
      pendingDirection.current = null;
      return;
    }
    setView(previous => previous && previous.phase !== "closing" ? { ...previous, phase: "closing", origin: rectOf(previous.index) } : previous);
  }, [current, rectOf]);

  const closing = view?.phase === "closing";
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => setView(previous => previous?.phase === "closing" ? null : previous), CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  const open = view !== null;
  useEffect(() => {
    if (!open) return;
    const onResize = () => setStage({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  const item = view ? images[view.index] : undefined;
  const aspect = view && item ? aspects[view.index] ?? (item.width && item.height ? item.width / item.height : 4 / 3) : 4 / 3;
  const fit = useMemo(() => fitRect(stage, aspect, !!item?.caption), [aspect, item?.caption, stage]);
  const fitNow = useRef(fit);
  fitNow.current = fit;

  const canGo = (delta: number) => images.length > 1 && (loop || (view !== null && view.index + delta >= 0 && view.index + delta < images.length));
  function go(delta: number) {
    if (!view || !canGo(delta)) return;
    pendingDirection.current = delta;
    change((view.index + delta + images.length) % images.length);
  }
  function jump(index: number) {
    if (!view || index === view.index || !images[index]) return;
    pendingDirection.current = Math.sign(index - view.index);
    change(index);
  }

  /** Zooms to `next`, keeping the point under (clientX, clientY) where it is. */
  const zoomTo = useCallback((next: number, clientX?: number, clientY?: number, glide = true) => {
    const api = apiRef.current;
    if (!api) return;
    const box = fitNow.current;
    const from = api.zoom.get();
    const to = clamp(next, 1, maxZoom);
    const pointX = (clientX ?? box.x + box.width / 2) - (box.x + box.width / 2);
    const pointY = (clientY ?? box.y + box.height / 2) - (box.y + box.height / 2);
    const limitX = box.width * (to - 1) / 2, limitY = box.height * (to - 1) / 2;
    const x = clamp(pointX - (pointX - api.panX.get()) * (to / from), -limitX, limitX);
    const y = clamp(pointY - (pointY - api.panY.get()) * (to / from), -limitY, limitY);
    if (glide && !reduce) { animate(api.zoom, to, motionTokens.spring.smooth); animate(api.panX, x, motionTokens.spring.smooth); animate(api.panY, y, motionTokens.spring.smooth); }
    else { for (const [motionValue, target] of [[api.zoom, to], [api.panX, x], [api.panY, y]] as const) { motionValue.stop(); motionValue.jump(target); } }
    zoomGoal.current = to;
    setZoomLevel(to);
  }, [maxZoom, reduce]);

  // The wheel zooms toward the cursor. It needs a non-passive listener so the page behind never scrolls.
  useEffect(() => {
    const node = stageNode;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const api = apiRef.current;
      if (api) zoomTo(api.zoom.get() * Math.exp(-event.deltaY * .0016), event.clientX, event.clientY, false);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [stageNode, zoomTo]);

  function startDrag(x: number, y: number, onFrame: boolean, moved: boolean) {
    const api = apiRef.current;
    if (!api) return;
    const panning = zoomGoal.current > 1.01;
    // Catch whatever is still moving, except a zoom that is on its way back to rest.
    for (const motionValue of panning ? [api.swipeX, api.zoom, api.panX, api.panY] : [api.swipeX]) motionValue.stop();
    drag.current = { mode: panning ? "pan" : "swipe", startX: x - (panning ? 0 : api.swipeX.get()), startY: y, panX: api.panX.get(), panY: api.panY.get(), zoom: api.zoom.get(), distance: 0, moved, onFrame, samples: [] };
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (view?.phase === "closing" || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const api = apiRef.current;
    if (!api) return;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [{ x: number; y: number }, { x: number; y: number }];
      drag.current = { mode: "pinch", startX: (a.x + b.x) / 2, startY: (a.y + b.y) / 2, panX: api.panX.get(), panY: api.panY.get(), zoom: api.zoom.get(), distance: Math.hypot(a.x - b.x, a.y - b.y) || 1, moved: true, onFrame: true, samples: [] };
      api.swipeX.jump(0);
    } else if (pointers.current.size === 1) {
      startDrag(event.clientX, event.clientY, !!(event.target as Element).closest("[data-frame]"), false);
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const api = apiRef.current, state = drag.current;
    if (!api || !state || !pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const box = fitNow.current;
    if (state.mode === "pinch") {
      const [a, b] = [...pointers.current.values()];
      if (!a || !b) return;
      const centerX = box.x + box.width / 2, centerY = box.y + box.height / 2;
      const to = clamp(state.zoom * Math.hypot(a.x - b.x, a.y - b.y) / state.distance, 1, maxZoom);
      const limitX = box.width * (to - 1) / 2, limitY = box.height * (to - 1) / 2;
      // The point that was under the fingers' midpoint stays under it.
      api.zoom.set(to);
      api.panX.set(clamp((a.x + b.x) / 2 - centerX - (state.startX - centerX - state.panX) * (to / state.zoom), -limitX, limitX));
      api.panY.set(clamp((a.y + b.y) / 2 - centerY - (state.startY - centerY - state.panY) * (to / state.zoom), -limitY, limitY));
      return;
    }
    const dx = event.clientX - state.startX, dy = event.clientY - state.startY;
    if (state.mode === "pan") {
      if (!state.moved && Math.hypot(dx, dy) < 4) return;
      state.moved = true;
      const limitX = box.width * (state.zoom - 1) / 2, limitY = box.height * (state.zoom - 1) / 2;
      api.panX.set(clamp(state.panX + dx, -limitX, limitX));
      api.panY.set(clamp(state.panY + dy, -limitY, limitY));
      return;
    }
    if (!state.moved && Math.hypot(dx, dy) < 6) return;
    state.moved = true;
    // Nothing to swipe to on that side: the image follows a little and resists.
    api.swipeX.set(canGo(dx < 0 ? 1 : -1) ? dx : dx * .22);
    state.samples.push({ t: event.timeStamp, x: event.clientX });
    while (state.samples.length > 2 && event.timeStamp - state.samples[0]!.t > 100) state.samples.shift();
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) {
    const api = apiRef.current, state = drag.current;
    if (!pointers.current.delete(event.pointerId) || !api || !state) return;
    if (state.mode === "pinch") {
      const rest = [...pointers.current.values()][0];
      if (api.zoom.get() < 1.06) zoomTo(1); else { zoomGoal.current = api.zoom.get(); setZoomLevel(api.zoom.get()); }
      // One finger stays down: it carries on as a pan, never as a tap.
      if (rest) startDrag(rest.x, rest.y, true, true); else drag.current = null;
      return;
    }
    drag.current = null;
    if (!state.moved) {
      if (cancelled) return;
      // Second tap in the same spot: zoom in on that point, or back out.
      const near = event.timeStamp - lastTap.current.t < 320 && Math.hypot(event.clientX - lastTap.current.x, event.clientY - lastTap.current.y) < 32;
      if (near && state.onFrame) { lastTap.current.t = 0; zoomTo(api.zoom.get() > 1.01 ? 1 : Math.min(2.5, maxZoom), event.clientX, event.clientY); return; }
      lastTap.current = { t: event.timeStamp, x: event.clientX, y: event.clientY };
      if (!state.onFrame) change(null);
      return;
    }
    if (state.mode !== "swipe") return;
    const offset = api.swipeX.get();
    const first = state.samples[0], last = state.samples[state.samples.length - 1];
    const velocity = cancelled || !first || !last || last.t === first.t || event.timeStamp - last.t > 80 ? 0 : (last.x - first.x) / (last.t - first.t) * 1000;
    const delta = offset < 0 ? 1 : -1;
    const far = Math.abs(offset) > Math.min(140, stage.width * .2) || (Math.abs(velocity) > 500 && Math.sign(velocity) === Math.sign(offset));
    if (!cancelled && far && canGo(delta)) { go(delta); return; }
    if (reduce) api.swipeX.jump(0); else animate(api.swipeX, 0, { ...motionTokens.spring.snappy, velocity });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const api = apiRef.current;
    const level = api?.zoom.get() ?? 1;
    if (event.key === "ArrowRight") go(1);
    else if (event.key === "ArrowLeft") go(-1);
    else if (event.key === "Home") jump(0);
    else if (event.key === "End") jump(images.length - 1);
    else if (event.key === "+" || event.key === "=") zoomTo(level * 1.6);
    else if (event.key === "-") zoomTo(level / 1.6);
    else if (event.key === "0") zoomTo(1);
    else return;
    event.preventDefault();
  }

  const hidden = view !== null && view.phase === "closing";
  const chrome = (offset: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : offset },
    animate: { opacity: hidden ? 0 : 1, y: hidden && !reduce ? offset : 0 },
    transition: hidden ? { duration: motionTokens.duration.instant } : { ...motionTokens.spring.smooth, delay: .08 },
  });
  const gridStyle = { "--viewer-columns": columns, "--viewer-ratio": thumbnailRatio } as CSSProperties;

  return (
    <>
      <ul className={[styles.grid, className].filter(Boolean).join(" ")} style={gridStyle} aria-label={label}>
        {images.map((image, index) => (
          <li key={`${image.src}-${index}`} className={styles.cell}>
            <button ref={node => { thumbs.current[index] = node; }} type="button" className={styles.thumb} data-open={view?.index === index || undefined} aria-label={`Open image ${index + 1} of ${images.length}: ${image.alt}`} aria-haspopup="dialog" onClick={() => change(index)}>
              <img src={image.thumbnail ?? image.src} alt="" draggable={false} loading="lazy" onLoad={event => { const { naturalWidth, naturalHeight } = event.currentTarget; if (!image.width && naturalWidth && naturalHeight) setAspects(known => known[index] ? known : { ...known, [index]: naturalWidth / naturalHeight }); }} />
            </button>
          </li>
        ))}
      </ul>
      <DialogPrimitive.Root open={open} onOpenChange={next => { if (!next) change(null); }}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay asChild>
            <motion.div className={styles.scrim} initial={{ opacity: 0 }} animate={{ opacity: hidden ? 0 : 1 }} transition={{ duration: hidden ? motionTokens.duration.standard : motionTokens.duration.considered, ease: standard }} />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content
            ref={contentRef}
            className={styles.lightbox}
            aria-describedby={undefined}
            onOpenAutoFocus={event => { event.preventDefault(); contentRef.current?.focus(); }}
            onCloseAutoFocus={event => { event.preventDefault(); thumbs.current[lastIndex.current]?.focus(); }}
            onKeyDown={onKeyDown}
          >
            <DialogPrimitive.Title className={styles.srOnly}>{label}</DialogPrimitive.Title>
            {view && item ? (
              <>
                <div ref={setStageNode} className={styles.stage} data-zoomed={zoomLevel > 1.01 || undefined} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={event => onPointerEnd(event, false)} onPointerCancel={event => onPointerEnd(event, true)}>
                  <AnimatePresence custom={view.direction}>
                    <Slide key={view.index} item={item} fit={fit} view={view} reduce={reduce} zoomed={zoomLevel > 1.01} apiRef={apiRef} onAspect={ratio => setAspects(known => known[view.index] === ratio ? known : { ...known, [view.index]: ratio })} onOpened={() => setView(previous => previous?.phase === "opening" ? { ...previous, phase: "open" } : previous)} onClosed={() => setView(previous => previous?.phase === "closing" ? null : previous)} />
                  </AnimatePresence>
                </div>
                <motion.div className={styles.bar} {...chrome(-10)}>
                  <span className={styles.counter} aria-live="polite" aria-atomic="true"><span className={styles.srOnly}>Image </span>{view.index + 1}<span aria-hidden="true"> / </span><span className={styles.srOnly}> of </span>{images.length}<span className={styles.srOnly}>: {item.alt}</span></span>
                  <div className={styles.tools}>
                    <button type="button" className={styles.tool} aria-label="Zoom out" disabled={zoomLevel <= 1.01} onClick={() => zoomTo((apiRef.current?.zoom.get() ?? 1) / 1.6)}><ZoomOut size={18} strokeWidth={1.75} aria-hidden="true" /></button>
                    <button type="button" className={styles.tool} aria-label="Zoom in" disabled={zoomLevel >= maxZoom - .01} onClick={() => zoomTo((apiRef.current?.zoom.get() ?? 1) * 1.6)}><ZoomIn size={18} strokeWidth={1.75} aria-hidden="true" /></button>
                    <DialogPrimitive.Close asChild><button type="button" className={styles.tool} aria-label="Close"><X size={18} strokeWidth={1.75} aria-hidden="true" /></button></DialogPrimitive.Close>
                  </div>
                </motion.div>
                {images.length > 1 ? (
                  <>
                    <motion.button type="button" className={styles.arrow} data-side="previous" aria-label="Previous image" disabled={!canGo(-1)} onClick={() => go(-1)} {...chrome(0)}><ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" /></motion.button>
                    <motion.button type="button" className={styles.arrow} data-side="next" aria-label="Next image" disabled={!canGo(1)} onClick={() => go(1)} {...chrome(0)}><ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" /></motion.button>
                  </>
                ) : null}
                <motion.div className={styles.footer} {...chrome(10)}>
                  {item.caption ? <p key={view.index} className={styles.caption}>{item.caption}</p> : null}
                  {images.length > 1 ? (
                    <div className={styles.strip} role="group" aria-label="All images">
                      <motion.span className={styles.ring} initial={false} animate={{ x: view.index * STRIP_STEP }} transition={reduce ? { duration: 0 } : motionTokens.spring.morph} aria-hidden="true" />
                      {images.map((image, index) => (
                        <button key={`${image.src}-${index}`} type="button" className={styles.stripItem} aria-label={`Show image ${index + 1}: ${image.alt}`} aria-current={index === view.index ? "true" : undefined} onClick={() => jump(index)}>
                          <img src={image.thumbnail ?? image.src} alt="" draggable={false} />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </motion.div>
              </>
            ) : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}

export default ImageViewer;
