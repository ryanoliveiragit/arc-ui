"use client";

import { createContext, useContext } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { MotionValue, SpringOptions } from "motion/react";
import styles from "./tilt-card.module.css";

/**
 * A card that leans in 3D toward the cursor, with a soft glare that follows it, and springs back flat when the cursor leaves.
 * It stays still for touch and pen input and when the person prefers reduced motion.
 */
export interface TiltCardProps {
  /** Card content. Wrap parts in `TiltCardLayer` to float them above the card face. */
  children: ReactNode;
  /** Largest lean in degrees, reached at the card's edges. */
  maxTilt?: number;
  /** How much the card grows while hovered. `1` keeps its size. */
  hoverScale?: number;
  /** Viewing distance in px. Smaller values exaggerate the depth. */
  perspective?: number;
  /** Shows the highlight that follows the cursor. */
  glare?: boolean;
  /** Strongest opacity of the glare, from 0 to 1. */
  glareOpacity?: number;
  /** Keeps the card flat and ignores the cursor. */
  disabled?: boolean;
  /** Reports the lean as the cursor moves: x and y from -1 to 1, both 0 when the card rests. */
  onTiltChange?: (tilt: { x: number; y: number }) => void;
  /** Extra class names for the root element. */
  className?: string;
  /** Inline styles for the root element, for sizes and CSS variables. */
  style?: CSSProperties;
}

export interface TiltCardLayerProps {
  /** Content that floats above the card face. */
  children: ReactNode;
  /** Distance above the card face in px. Higher layers shift more as the card leans. */
  depth?: number;
  /** Extra class names for the root element. */
  className?: string;
}

/** Follows the cursor closely but settles without wobble: the card should feel held, not loose. */
const follow: SpringOptions = { stiffness: 260, damping: 26, mass: 0.6 };
const settle: SpringOptions = { stiffness: 320, damping: 30 };
/** How far the card is into its hover, 0 to 1. Layers read it so they sit flat on the face at rest, where text stays sharp. */
const LiftContext = createContext<MotionValue<number> | null>(null);

export function TiltCard({ children, maxTilt = 10, hoverScale = 1.02, perspective = 900, glare = true, glareOpacity = 0.18, disabled = false, onTiltChange, className, style }: TiltCardProps) {
  const reduce = useReducedMotion();
  const still = disabled || !!reduce;

  // Cursor position over the card, from -0.5 to 0.5 on each axis; 0 is the center.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const hover = useMotionValue(0);
  const sx = useSpring(px, follow);
  const sy = useSpring(py, follow);
  const lift = useSpring(hover, settle);

  const rotateX = useTransform(sy, value => -value * 2 * maxTilt);
  const rotateY = useTransform(sx, value => value * 2 * maxTilt);
  const scale = useTransform(lift, value => 1 + (hoverScale - 1) * value);
  const glareX = useTransform(sx, value => `${(value + 0.5) * 100}%`);
  const glareY = useTransform(sy, value => `${(value + 0.5) * 100}%`);
  const glareAlpha = useTransform(lift, value => value * glareOpacity);
  // A highlight, which is what a glare is: a radial falloff centered on the cursor. The only gradient in this component.
  const glareFill = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, var(--neutral-0), transparent 62%)`;

  function onPointerEnter(event: ReactPointerEvent<HTMLDivElement>) {
    if (still || event.pointerType !== "mouse") return;
    hover.set(1);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (still || event.pointerType !== "mouse") return;
    // Measured against the untilted slot, not the leaning card, so the reading does not drift as the card moves under the cursor.
    const box = event.currentTarget.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const x = Math.min(Math.max((event.clientX - box.left) / box.width - 0.5, -0.5), 0.5);
    const y = Math.min(Math.max((event.clientY - box.top) / box.height - 0.5, -0.5), 0.5);
    px.set(x);
    py.set(y);
    if (hover.get() !== 1) hover.set(1);
    onTiltChange?.({ x: x * 2, y: y * 2 });
  }

  function onPointerLeave() {
    if (px.get() === 0 && py.get() === 0 && hover.get() === 0) return;
    px.set(0);
    py.set(0);
    hover.set(0);
    onTiltChange?.({ x: 0, y: 0 });
  }

  return (
    <div className={[styles.slot, className].filter(Boolean).join(" ")} style={{ ...style, perspective }} onPointerEnter={onPointerEnter} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} onPointerCancel={onPointerLeave}>
      <motion.div className={styles.card} style={still ? undefined : { rotateX, rotateY, scale }}>
        <LiftContext.Provider value={still ? null : lift}>{children}</LiftContext.Provider>
        {glare && !still ? <motion.span className={styles.glare} style={{ background: glareFill, opacity: glareAlpha }} aria-hidden="true" /> : null}
      </motion.div>
    </div>
  );
}

/** A part of the card that floats above its face, so it shifts against the background as the card leans. */
export function TiltCardLayer({ children, depth = 24, className }: TiltCardLayerProps) {
  const lift = useContext(LiftContext);
  const rest = useMotionValue(0);
  // The layer rises with the hover instead of floating all the time: at rest it has no 3D transform at all.
  const z = useTransform(lift ?? rest, value => value * depth);
  return <motion.div className={[styles.layer, className].filter(Boolean).join(" ")} style={lift ? { z } : undefined}>{children}</motion.div>;
}

export default TiltCard;
