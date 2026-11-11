"use client";

import { Children, isValidElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import type { AnimationPlaybackControls, Transition } from "motion/react";
import { ArrowDown } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./message-scroller.module.css";

/**
 * The scroll area of a conversation. While the reader is at the bottom it follows new content (new messages and text that is still
 * streaming). Scrolling up lets go, so reading is never interrupted; a pill then counts what arrived and jumps back to the latest.
 * Give it a height through `className`, `style` or the `--message-scroller-height` variable.
 */
export interface MessageScrollerProps {
  /** The messages. Each direct child counts as one message for the unread count; give them stable keys. */
  children: ReactNode;
  /** Accessible name of the scroll area. */
  label?: string;
  /** How close to the bottom, in pixels, still counts as being at the bottom. */
  threshold?: number;
  /** Text of the pill that returns to the newest message. */
  jumpLabel?: string;
  /** New messages rise in as they are added. Messages present on the first render never animate. */
  animateItems?: boolean;
  /** Fades the top and bottom edges while there is more content in that direction. */
  fadeEdges?: boolean;
  /** Called when the reader leaves or returns to the bottom. */
  onAtBottomChange?: (atBottom: boolean) => void;
  /** Extra class for the root element. */
  className?: string;
  /** Inline style for the root element, for example a height. */
  style?: CSSProperties;
}

const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const enterEase = [...motionTokens.ease.enter] as [number, number, number, number];
const fade: Transition = { duration: motionTokens.duration.fast, ease: standard };
const scrollKeys = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

export function MessageScroller({ children, label = "Conversation", threshold = 32, jumpLabel = "Jump to latest", animateItems = true, fadeEdges = true, onAtBottomChange, className, style }: MessageScrollerProps) {
  const reduce = !!useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<HTMLButtonElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [atTop, setAtTop] = useState(true);
  const [unread, setUnread] = useState(0);
  /** True while the view should follow new content. Kept in a ref so observers read the current value. */
  const stuck = useRef(true);
  const glide = useRef<AnimationPlaybackControls | null>(null);
  const mounted = useRef(false);
  const notify = useRef(onAtBottomChange);
  notify.current = onAtBottomChange;
  const items = Children.toArray(children);
  const count = items.length;
  /** How many messages the reader has seen: frozen while they are away from the bottom. */
  const seen = useRef(count);

  const settle = useCallback((bottom: boolean) => {
    if (stuck.current !== bottom) notify.current?.(bottom);
    stuck.current = bottom;
    setAtBottom(bottom);
    if (bottom) setUnread(0);
  }, []);

  /** Reads the scroll position. While a glide to the bottom is running the view counts as stuck, whatever the position says. */
  const read = useCallback(() => {
    const node = viewportRef.current;
    if (!node) return;
    setAtTop(node.scrollTop <= 1);
    if (glide.current) return;
    settle(node.scrollHeight - node.scrollTop - node.clientHeight <= threshold);
  }, [settle, threshold]);

  const toBottom = useCallback((smooth: boolean) => {
    const node = viewportRef.current;
    if (!node) return;
    glide.current?.stop();
    glide.current = null;
    const target = node.scrollHeight - node.clientHeight;
    if (!smooth || reduce || Math.abs(target - node.scrollTop) < 2) { node.scrollTop = target; return; }
    glide.current = animate(node.scrollTop, target, { ...motionTokens.spring.smooth, onUpdate: value => { node.scrollTop = value; }, onComplete: () => { glide.current = null; read(); } });
  }, [read, reduce]);

  /** The reader took over (wheel, touch, drag on the scrollbar, keys): stop following at once and trust the next scroll position. */
  const release = useCallback(() => { glide.current?.stop(); glide.current = null; }, []);

  // Start at the newest message, before the first paint.
  useLayoutEffect(() => {
    const node = viewportRef.current;
    if (node) node.scrollTop = node.scrollHeight;
    mounted.current = true;
  }, []);

  // Follow growth: a new message, or text streaming into the last one. Only while stuck.
  useEffect(() => {
    const node = viewportRef.current, content = contentRef.current;
    if (!node || !content || typeof ResizeObserver === "undefined") return;
    let first = true;
    const observer = new ResizeObserver(() => {
      if (first) { first = false; return; }
      if (stuck.current) toBottom(true); else read();
    });
    observer.observe(content);
    const frame = new ResizeObserver(() => { if (stuck.current) toBottom(false); });
    frame.observe(node);
    return () => { observer.disconnect(); frame.disconnect(); glide.current?.stop(); glide.current = null; };
  }, [read, toBottom]);

  // Count what arrives while the reader is away from the bottom.
  useEffect(() => {
    if (stuck.current || count < seen.current) { seen.current = count; setUnread(0); return; }
    setUnread(count - seen.current);
  }, [count]);
  useEffect(() => { if (atBottom) seen.current = count; }, [atBottom, count]);

  function jump() {
    // The pill is about to leave: keep keyboard focus inside the scroller instead of dropping it on the page.
    if (document.activeElement === jumpRef.current) viewportRef.current?.focus({ preventScroll: true });
    settle(true);
    toBottom(true);
  }

  const rise = reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 };

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} style={style}>
      <div
        ref={viewportRef}
        className={styles.viewport}
        tabIndex={0}
        role="region"
        aria-label={label}
        data-fade-top={fadeEdges && !atTop ? "" : undefined}
        data-fade-bottom={fadeEdges && !atBottom ? "" : undefined}
        onScroll={read}
        onWheel={release}
        onTouchStart={release}
        onPointerDown={release}
        onKeyDown={event => { if (scrollKeys.has(event.key)) release(); }}
      >
        <div ref={contentRef} className={styles.content} role="log" aria-live="polite" aria-relevant="additions">
          {items.map((child, index) => (
            <motion.div key={isValidElement(child) && child.key != null ? child.key : index} className={styles.item} initial={animateItems && mounted.current ? rise : false} animate={{ opacity: 1, y: 0, scale: 1 }} transition={reduce ? fade : { ...motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: enterEase } }}>{child}</motion.div>
          ))}
        </div>
      </div>
      <div className={styles.dock}>
        <AnimatePresence>
          {atBottom ? null : (
            <motion.button key="jump" ref={jumpRef} type="button" className={styles.jump} onClick={jump} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.94, transition: fade }} transition={reduce ? fade : { ...motionTokens.spring.snappy, opacity: fade }} whileTap={reduce ? undefined : { scale: 0.96 }}>
              <ArrowDown className={styles.arrow} width={15} height={15} strokeWidth={2.25} aria-hidden="true" />
              <span>{jumpLabel}</span>
              {/* The badge opens its own width, then each new total rolls in from below. */}
              <AnimatePresence initial={false}>
                {unread > 0 ? (
                  <motion.span key="count" className={styles.badgeSlot} initial={reduce ? { opacity: 0 } : { width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={reduce ? { opacity: 0 } : { width: 0, opacity: 0 }} transition={reduce ? fade : { width: motionTokens.spring.snappy, opacity: fade }}>
                    <span className={styles.badge} aria-label={`${unread} new ${unread === 1 ? "message" : "messages"}`}>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span key={unread} className={styles.digits} aria-hidden="true" initial={reduce ? { opacity: 0 } : { opacity: 0, y: "60%" }} animate={{ opacity: 1, y: "0%" }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-60%" }} transition={fade}>{unread > 99 ? "99+" : unread}</motion.span>
                      </AnimatePresence>
                    </span>
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MessageScroller;
