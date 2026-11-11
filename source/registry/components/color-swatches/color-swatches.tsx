"use client";

import { useId, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./color-swatches.module.css";

export interface ColorSwatch {
  /** The value reported when this swatch is chosen. */
  value: string;
  /** Any CSS color: a hex code, `oklch(...)`, or a token such as `var(--tone-teal)`. */
  color: string;
  /** Spoken name and tooltip, for example "Forest green". Falls back to the value. */
  label?: string;
  /** Shown struck through and skipped by the keyboard, for a color that is unavailable. */
  disabled?: boolean;
}

/**
 * A radio group of color swatches. One ring marks the choice and glides from swatch to swatch on a spring,
 * and each swatch dips under the finger. Arrow keys move the choice, as in any radio group.
 */
export interface ColorSwatchesProps {
  /** The colors to choose from. */
  options: ColorSwatch[];
  /** The chosen value (controlled). */
  value?: string;
  /** The value chosen at first (uncontrolled). */
  defaultValue?: string;
  /** Runs when a swatch is chosen. */
  onValueChange?: (value: string) => void;
  /** Accessible name of the group, for example "Color". */
  label: string;
  /** Swatch diameter: `sm` 24 px, `md` 32 px, `lg` 40 px. */
  size?: "sm" | "md" | "lg";
  /** Swatch shape. */
  shape?: "circle" | "rounded";
  /** Field name: adds a hidden input so the value submits with a form. */
  name?: string;
  /** Turns the whole group off. */
  disabled?: boolean;
  /** Extra class names for the root element. */
  className?: string;
}

const press = { scale: 0.86 };
const lift = { scale: 1.08 };

export function ColorSwatches({ options, value, defaultValue, onValueChange, label, size = "md", shape = "circle", name, disabled = false, className }: ColorSwatchesProps) {
  const reduce = useReducedMotion();
  const groupId = useId();
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const refs = useRef(new Map<string, HTMLButtonElement>());

  const enabled = options.filter(option => !option.disabled);
  // Roving tabindex: Tab lands on the chosen swatch, or on the first one while nothing is chosen.
  const tabStop = enabled.some(option => option.value === selected) ? selected : enabled[0]?.value;

  function choose(next: string) {
    if (next === selected) return;
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, current: string) {
    const at = enabled.findIndex(option => option.value === current);
    if (at === -1 || !enabled.length) return;
    let to = at;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") to = (at + 1) % enabled.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") to = (at - 1 + enabled.length) % enabled.length;
    else if (event.key === "Home") to = 0;
    else if (event.key === "End") to = enabled.length - 1;
    else return;
    event.preventDefault();
    const next = enabled[to]!;
    refs.current.get(next.value)?.focus();
    choose(next.value);
  }

  return (
    <LayoutGroup id={groupId}>
      <div role="radiogroup" aria-label={label} aria-disabled={disabled || undefined} className={[styles.group, className].filter(Boolean).join(" ")} data-size={size} data-shape={shape}>
        {options.map(option => {
          const active = option.value === selected;
          const off = disabled || !!option.disabled;
          return (
            <motion.button
              key={option.value}
              ref={node => { if (node) refs.current.set(option.value, node); else refs.current.delete(option.value); }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={option.label ?? option.value}
              title={option.label}
              disabled={off}
              tabIndex={option.value === tabStop && !off ? 0 : -1}
              className={styles.swatch}
              data-active={active}
              style={{ "--swatch": option.color } as CSSProperties}
              whileTap={reduce || off ? undefined : press}
              whileHover={reduce || off ? undefined : lift}
              transition={motionTokens.spring.snappy}
              onClick={() => choose(option.value)}
              onKeyDown={event => onKeyDown(event, option.value)}
            >
              {/* One ring for the whole group: the shared layout id makes it travel instead of blinking from swatch to swatch. */}
              {active ? <motion.span layoutId="ring" className={styles.ring} transition={reduce ? { duration: 0 } : motionTokens.spring.gentle} aria-hidden="true" /> : null}
              <span className={styles.fill} aria-hidden="true" />
            </motion.button>
          );
        })}
        {name ? <input type="hidden" name={name} value={selected ?? ""} /> : null}
      </div>
    </LayoutGroup>
  );
}

export default ColorSwatches;
