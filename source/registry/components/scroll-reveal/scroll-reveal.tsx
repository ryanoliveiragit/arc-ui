"use client";

import { Children, useRef } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import type { TargetAndTransition, Transition, Variants } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./scroll-reveal.module.css";

export type ScrollRevealEffect = "fade" | "slide" | "scale" | "blur";

/**
 * Animates its children in as the wrapper scrolls into view. Each direct child becomes one step of the sequence, so a list, a grid
 * or a row of cards arrives one after another. Pair it with `ScrollProgress` to show how far the reader is.
 */
export interface ScrollRevealProps {
  /** Each direct child is revealed as one step. */
  children: ReactNode;
  /** How the children arrive: a plain fade, a slide from one side, a scale up, or a blur that comes into focus. */
  effect?: ScrollRevealEffect;
  /** The side the "slide" effect comes from. */
  from?: "bottom" | "top" | "left" | "right";
  /** Distance in px that the "slide" effect travels. */
  distance?: number;
  /** Seconds between one child and the next. Use 0 to reveal them together. */
  stagger?: number;
  /** Seconds to wait before the first child starts. */
  delay?: number;
  /** True reveals once and keeps the result; false hides the children again when they leave and replays on every entry. */
  once?: boolean;
  /** How much of the wrapper must be visible before it starts, from 0 to 1. */
  amount?: number;
  /** The scrolling element to watch. Leave it out when the page itself scrolls. */
  root?: RefObject<Element | null>;
  /** Extra class for the wrapper, for example a grid or a flex row. */
  className?: string;
  /** Extra class for the element wrapped around each child. */
  itemClassName?: string;
  /** Inline style for the wrapper. */
  style?: CSSProperties;
}

export interface ScrollProgressProps {
  /** The scrolling element to measure. Leave it out to follow the page. */
  container?: RefObject<HTMLElement | null>;
  /** Accessible name of the progress bar. */
  label?: string;
  /** "sticky" stays at the top of its scroll container, "fixed" pins to the top of the window, "static" stays where it is rendered. */
  position?: "sticky" | "fixed" | "static";
  /** Bar thickness in px. */
  thickness?: number;
  /** Extra class for the track. */
  className?: string;
}

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const fadeIn: Transition = { duration: motionTokens.duration.considered, ease: enter };
const fadeOut: Transition = { duration: motionTokens.duration.fast, ease: standard };

function hiddenState(effect: ScrollRevealEffect, from: NonNullable<ScrollRevealProps["from"]>, distance: number): TargetAndTransition {
  if (effect === "slide") return { opacity: 0, x: from === "left" ? -distance : from === "right" ? distance : 0, y: from === "top" ? -distance : from === "bottom" ? distance : 0 };
  if (effect === "scale") return { opacity: 0, scale: 0.9 };
  if (effect === "blur") return { opacity: 0, y: 6, filter: `blur(${motionTokens.blur.text}px)` };
  return { opacity: 0 };
}

export function ScrollReveal({ children, effect = "slide", from = "bottom", distance = 28, stagger = motionTokens.stagger.line, delay = 0, once = true, amount = 0.2, root, className, itemClassName, style }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once, amount, root });
  // Reduced motion keeps the reveal as a short fade: nothing travels, scales or blurs.
  const hidden: TargetAndTransition = reduced ? { opacity: 0 } : hiddenState(effect, from, distance);
  const item: Variants = {
    hidden: { ...hidden, transition: fadeOut },
    visible: reduced
      ? { opacity: 1, transition: fadeOut }
      : { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)", transition: { default: motionTokens.spring.smooth, opacity: fadeIn, filter: fadeIn } },
  };
  const group: Variants = {
    hidden: { transition: { staggerChildren: 0 } },
    visible: { transition: { staggerChildren: reduced ? 0 : stagger, delayChildren: reduced ? 0 : delay } },
  };
  return (
    <motion.div ref={ref} className={[styles.reveal, className].filter(Boolean).join(" ")} style={style} variants={group} initial="hidden" animate={inView ? "visible" : "hidden"} data-state={inView ? "visible" : "hidden"}>
      {Children.toArray(children).map((child, index) => <motion.div key={index} className={[styles.item, itemClassName].filter(Boolean).join(" ")} variants={item}>{child}</motion.div>)}
    </motion.div>
  );
}

export function ScrollProgress({ container, label = "Scroll progress", position = "sticky", thickness = 3, className }: ScrollProgressProps) {
  const reduced = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll(container ? { container } : undefined);
  // The spring smooths wheel steps into one continuous fill; reduced motion follows the scroll position directly.
  const smooth = useSpring(scrollYProgress, { stiffness: 320, damping: 42, restDelta: 0.001 });
  useMotionValueEvent(scrollYProgress, "change", latest => { track.current?.setAttribute("aria-valuenow", String(Math.round(latest * 100))); });
  return (
    <div ref={track} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} className={[styles.progress, styles[position], className].filter(Boolean).join(" ")} style={{ height: thickness }}>
      <motion.div className={styles.bar} style={{ scaleX: reduced ? scrollYProgress : smooth }} />
    </div>
  );
}

export default ScrollReveal;
