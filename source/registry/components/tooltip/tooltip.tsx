"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactElement, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./tooltip.module.css";

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  /** Render the tooltip inside this element and limit collisions to it (used by the demo stages). */
  container?: HTMLElement | null;
  /** Starts open, for previews and first-run hints. It stays until the person interacts (hover or focus on its trigger, Escape, a press elsewhere) or another tooltip opens; scrolling does not dismiss it. */
  defaultOpen?: boolean;
}

const DELAY = 250;
const SKIP_WINDOW = 300;

/* Every Tooltip brings its own provider, so the skip window is shared here: while any tooltip is open, and briefly after the last one closes, the next opens without delay or travel. */
let warm = false;
let openCount = 0;
let coolTimer = 0;
const listeners = new Set<() => void>();
const warmth = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  get: () => warm,
  set(next: boolean) { if (warm === next) return; warm = next; listeners.forEach(listener => listener()); },
  opened() { openCount += 1; window.clearTimeout(coolTimer); warmth.set(true); },
  closed() { openCount = Math.max(0, openCount - 1); if (openCount) return; window.clearTimeout(coolTimer); coolTimer = window.setTimeout(() => warmth.set(false), SKIP_WINDOW); },
};

/* A tooltip that starts open hands over to whichever tooltip a person opens next. */
const openers = new Set<(id: string) => void>();
const announceOpen = (id: string) => openers.forEach(listener => listener(id));

/** String content crossfades when it changes while open, and the bubble springs to the new text size. */
function TooltipText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const measure = useRef<HTMLSpanElement>(null);
  const measured = useRef<string | null>(null);
  const [size, setSize] = useState<{ width: number; height: number; animate: boolean } | null>(null);
  useLayoutEffect(() => {
    const node = measure.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const box = entry.borderBoxSize?.[0];
      const current = node.textContent;
      const animate = measured.current !== null && measured.current !== current;
      measured.current = current;
      setSize({ width: Math.ceil(box?.inlineSize ?? node.offsetWidth), height: Math.ceil(box?.blockSize ?? node.offsetHeight), animate });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <motion.span className={styles.text} initial={false} animate={size ? { width: size.width, height: size.height } : undefined} transition={size?.animate && !reduced ? motionTokens.spring.morph : { duration: 0 }}>
    <span ref={measure} className={styles.measure} aria-hidden="true">{text}</span>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={text} className={styles.line} initial={reduced ? false : { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }} transition={{ duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{text}</motion.span>
    </AnimatePresence>
  </motion.span>;
}

export function Tooltip({ content, children, side = "top", container, defaultOpen = false }: TooltipProps) {
  const id = useId();
  const isWarm = useSyncExternalStore(warmth.subscribe, warmth.get, () => false);
  // Controlled so the instant flag lands in the same render that mounts the content (Radix reports uncontrolled changes a frame late).
  const [open, setOpen] = useState(defaultOpen);
  const [instant, setInstant] = useState(false);
  /** True while a tooltip that started open has not been touched yet: Radix's close-on-scroll is ignored until then. */
  const pinned = useRef(defaultOpen);
  useEffect(() => {
    if (!open) return;
    warmth.opened();
    return warmth.closed;
  }, [open]);
  useEffect(() => {
    if (!defaultOpen) return;
    const onOtherOpen = (other: string) => { if (other !== id && pinned.current) { pinned.current = false; setOpen(false); } };
    openers.add(onOtherOpen);
    return () => { openers.delete(onOtherOpen); };
  }, [defaultOpen, id]);
  const release = () => { pinned.current = false; };
  return <TooltipPrimitive.Provider delayDuration={DELAY} skipDelayDuration={0}>
    <TooltipPrimitive.Root open={open} delayDuration={isWarm ? 0 : DELAY} onOpenChange={next => {
      if (!next && pinned.current) return;
      if (next) { pinned.current = false; setInstant(warmth.get()); announceOpen(id); }
      setOpen(next);
    }}>
      <TooltipPrimitive.Trigger asChild onPointerEnter={release} onFocus={release}>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal container={container ?? undefined}>
        <TooltipPrimitive.Content className={styles.tooltip} data-instant={instant || undefined} side={side} sideOffset={8} collisionPadding={12} collisionBoundary={container ?? undefined} onEscapeKeyDown={release} onPointerDownOutside={release}>
          {typeof content === "string" || typeof content === "number" ? <TooltipText text={String(content)}/> : content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>;
}

export default Tooltip;
