"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { MotionStyle } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./aspect-ratio.module.css";

/**
 * A box that keeps a width to height ratio. Change `ratio` and the box springs to the new shape while the media inside stays covered,
 * so a preview can move between landscape, square and portrait without a jump.
 */
export interface AspectRatioProps {
  /** Width divided by height. A number (`16 / 9`) or a string such as `"16/9"`, `"16:9"` or `"1.85"`. */
  ratio?: number | string;
  /** Tallest the box may get, in px or any CSS length. Past it the box narrows instead of growing, so a portrait ratio never pushes the page down. */
  maxHeight?: number | string;
  /** How direct media children (img, video, canvas, iframe) fill the box. */
  fit?: "cover" | "contain";
  /** Corner style: `panel` uses the panel radius, `none` leaves the corners square. */
  radius?: "panel" | "control" | "none";
  /** Set to false to switch ratios instantly. Reduced motion always switches instantly. */
  animated?: boolean;
  /** Runs when the box has settled on a new ratio. */
  onRatioSettled?: (ratio: number) => void;
  /** Media or any content. Direct media children are stretched over the box; other children are laid out by you. */
  children?: ReactNode;
  /** Extra class names for the root element. */
  className?: string;
  /** Inline styles for the root element, for sizes and CSS variables. */
  style?: CSSProperties;
}

const FALLBACK = 16 / 9;

/** Reads `16/9`, `16:9`, `16 x 9` or a plain number. Anything unreadable falls back to 16:9. */
export function parseRatio(input: number | string | undefined): number {
  if (typeof input === "number") return Number.isFinite(input) && input > 0 ? input : FALLBACK;
  if (!input) return FALLBACK;
  const parts = input.split(/[/:x×]/i).map(part => Number(part.trim()));
  const [width, height] = parts;
  if (parts.length === 1 && width !== undefined && Number.isFinite(width) && width > 0) return width;
  if (parts.length === 2 && width !== undefined && height !== undefined && width > 0 && height > 0) return width / height;
  return FALLBACK;
}

export function AspectRatio({ ratio, maxHeight, fit = "cover", radius = "panel", animated = true, onRatioSettled, children, className, style }: AspectRatioProps) {
  const reduce = useReducedMotion();
  const target = parseRatio(ratio);
  // The ratio is the animated value, not the height: the browser keeps resolving width and height from it on every frame,
  // so the box stays correct while its container resizes mid-animation and the media never stretches the way a scale transform would.
  const current = useMotionValue(target);
  const settled = useRef(onRatioSettled);
  settled.current = onRatioSettled;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; current.jump(target); return; }
    if (!animated || reduce) { current.jump(target); settled.current?.(target); return; }
    const controls = animate(current, target, motionTokens.spring.smooth);
    controls.then(() => settled.current?.(target)).catch(() => undefined);
    return () => controls.stop();
  }, [animated, current, reduce, target]);

  const limit = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
  const vars = { "--ratio": current, ...(limit ? { "--max-height": limit } : null) } as MotionStyle;

  return (
    <motion.div className={[styles.box, className].filter(Boolean).join(" ")} style={{ ...style, ...vars }} data-fit={fit} data-radius={radius} data-bounded={limit ? "" : undefined}>
      {children}
    </motion.div>
  );
}

export default AspectRatio;
