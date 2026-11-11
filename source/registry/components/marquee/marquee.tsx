"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import styles from "./marquee.module.css";

/**
 * An endless scroller for logos, quotes or tickers. The content repeats as often as needed to fill the track and loops without a seam.
 * Hovering or focusing it eases the motion to a stop instead of freezing it, and it rests while off screen.
 * With reduced motion it does not move on its own: the track becomes an ordinary scroll area.
 */
export interface MarqueeProps {
  /** The items to scroll. They are laid out in a row, or in a column for the vertical directions. */
  children: ReactNode;
  /** Where the content travels. `left` and `right` scroll a row; `up` and `down` scroll a column and need a height on the marquee. */
  direction?: "left" | "right" | "up" | "down";
  /** Travel speed in px per second. */
  speed?: number;
  /** Space between items, and between one repetition and the next, in px or any CSS length. */
  gap?: number | string;
  /** Slows to a stop while the pointer is over the marquee or focus is inside it. */
  pauseOnHover?: boolean;
  /** Stops the motion, for a pause button. People must be able to stop content that moves for more than a few seconds. */
  paused?: boolean;
  /** Fades the two edges the content enters and leaves through. Pass a CSS length to set how wide the fade is. */
  fade?: boolean | string;
  /** Accessible name for the group, for example "Customers". */
  label?: string;
  /** Extra class names for the root element. */
  className?: string;
  /** Inline styles for the root element, for sizes and CSS variables. */
  style?: CSSProperties;
}

const MAX_COPIES = 24;
// Useless on the server, harmless in the browser: measure before paint so the first frame already has enough copies.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function Marquee({ children, direction = "left", speed = 48, gap = 24, pauseOnHover = true, paused = false, fade = true, label, className, style }: MarqueeProps) {
  const reduce = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "80px" });
  const vertical = direction === "up" || direction === "down";
  const reverse = direction === "right" || direction === "down";

  /** Length of one repetition including its trailing gap, and how many repetitions cover the track plus one spare. */
  const [period, setPeriod] = useState(0);
  const [copies, setCopies] = useState(2);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current, group = groupRef.current;
    if (!root || !group) return;
    const measure = () => {
      const size = vertical ? group.offsetHeight : group.offsetWidth;
      const track = vertical ? root.clientHeight : root.clientWidth;
      const style = getComputedStyle(group);
      const space = parseFloat(vertical ? style.rowGap : style.columnGap) || 0;
      const next = size + space;
      setPeriod(next);
      // The last repetition has no trailing gap, so the track must cover one gap more than its own length.
      setCopies(next > 0 ? Math.min(Math.ceil((track + space) / next) + 1, MAX_COPIES) : 2);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(group);
    return () => observer.disconnect();
  }, [vertical, gap]);

  const running = !reduce && !paused && inView && !(pauseOnHover && (hovered || focused));
  // The pace eases between 0 and 1, so a pause is a gentle stop and a resume a gentle start.
  const target = useMotionValue(running ? 1 : 0);
  const pace = useSpring(target, { stiffness: 120, damping: 24, mass: 0.6 });
  useEffect(() => { target.set(running ? 1 : 0); }, [running, target]);

  const offset = useMotionValue(0);
  useAnimationFrame((_, delta) => {
    if (reduce || period <= 0) return;
    const rate = pace.get();
    if (rate < 0.001) return;
    // A long frame (a background tab waking up) must not teleport the content.
    const step = speed * rate * Math.min(delta, 64) / 1000;
    offset.set((offset.get() + step) % period);
  });
  // Reverse starts one repetition back and walks forward, so the track is covered in both directions.
  const shift = useTransform(offset, value => reverse ? value - period : -value);

  const fadeSize = fade === true ? "12%" : fade || undefined;
  const vars = { "--marquee-gap": typeof gap === "number" ? `${gap}px` : gap, ...(fadeSize ? { "--marquee-fade": fadeSize } : null) } as CSSProperties;

  return (
    <div
      ref={rootRef}
      role={label ? "group" : undefined}
      aria-label={label}
      className={[styles.marquee, className].filter(Boolean).join(" ")}
      style={{ ...vars, ...style }}
      data-axis={vertical ? "y" : "x"}
      data-fade={fadeSize ? "" : undefined}
      data-static={reduce ? "" : undefined}
      tabIndex={reduce ? 0 : undefined}
      onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    >
      <motion.div className={styles.track} style={reduce ? undefined : vertical ? { y: shift } : { x: shift }}>
        <div ref={groupRef} className={styles.group}>{children}</div>
        {/* Repetitions are decoration: hidden from assistive tech and out of the tab order, so each item is announced and focused once. */}
        {reduce ? null : Array.from({ length: Math.max(copies - 1, 1) }, (_, index) => <div key={index} className={styles.group} aria-hidden="true" inert>{children}</div>)}
      </motion.div>
    </div>
  );
}

export default Marquee;
