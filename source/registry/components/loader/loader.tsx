"use client";

import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./loader.module.css";

export type LoaderVariant = "spinner" | "dots" | "bars" | "ring" | "orbit";
export type LoaderSize = "sm" | "md" | "lg";

/**
 * A family of loaders that share one box, one color and one label. Pick the shape that suits the wait: a spinner for a short
 * action, dots for "someone is working", bars for media, a pulse ring for a live signal, an orbit for longer jobs.
 */
export interface LoaderProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Which loader to draw. */
  variant?: LoaderVariant;
  /** Box size: 16 px, 24 px or 40 px. */
  size?: LoaderSize;
  /** What is loading. Screen readers announce it; it is hidden visually unless `showLabel` is set. */
  label?: string;
  /** Shows the label next to the loader. */
  showLabel?: boolean;
  /** "accent" draws in the accent color; "current" inherits the surrounding text color, for loaders inside buttons. */
  tone?: "accent" | "current";
  /** Speed multiplier: 2 runs twice as fast, 0.5 at half speed. */
  speed?: number;
  /** Extra class for the root element. */
  className?: string;
}

/** Each part reads its place in the sequence from --i, so the CSS staggers the family with one rule. */
const part = (index: number): CSSProperties => ({ "--i": index } as CSSProperties);

function Glyph({ variant }: { variant: LoaderVariant }) {
  if (variant === "spinner") {
    return (
      <svg className={styles.spinner} viewBox="0 0 24 24" fill="none" focusable="false">
        <circle className={styles.track} cx="12" cy="12" r="9.5" />
        <circle className={styles.arc} cx="12" cy="12" r="9.5" pathLength={100} />
      </svg>
    );
  }
  if (variant === "dots") {
    return <span className={styles.dots}>{[0, 1, 2].map(index => <span key={index} className={styles.dot} style={part(index)} />)}</span>;
  }
  if (variant === "bars") {
    return <span className={styles.bars}>{[0, 1, 2, 3].map(index => <span key={index} className={styles.bar} style={part(index)} />)}</span>;
  }
  if (variant === "ring") {
    return (
      <span className={styles.ring}>
        <span className={styles.wave} style={part(0)} />
        <span className={styles.wave} style={part(1)} />
        <span className={styles.core} />
      </span>
    );
  }
  return (
    <span className={styles.orbit}>
      <span className={styles.path} />
      {[0, 1, 2].map(index => <span key={index} className={styles.arm} style={part(index)}><span className={styles.satellite} /></span>)}
    </span>
  );
}

export function Loader({ variant = "spinner", size = "md", label = "Loading", showLabel = false, tone = "accent", speed = 1, className, style, ...props }: LoaderProps) {
  const classes = [styles.loader, styles[size], tone === "current" ? styles.current : "", className].filter(Boolean).join(" ");
  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;
  return (
    <span {...props} role="status" aria-live="polite" className={classes} data-variant={variant} style={{ ...style, "--loader-speed": safeSpeed } as CSSProperties}>
      <span className={styles.glyph} aria-hidden="true"><Glyph variant={variant} /></span>
      <span className={showLabel ? styles.label : styles.srOnly}>{label}</span>
    </span>
  );
}

export default Loader;
