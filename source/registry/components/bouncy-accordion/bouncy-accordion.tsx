"use client";

import { createElement, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./bouncy-accordion.module.css";

export interface BouncyAccordionItem {
  /** Unique id of the item; this is what `value` and `onValueChange` carry. */
  value: string;
  /** The question or section name shown on the trigger. */
  title: ReactNode;
  /** The content revealed when the item opens. */
  content: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Keeps the item closed and skips it during keyboard navigation. */
  disabled?: boolean;
}

/**
 * An accordion that reads as one segmented block while closed. The item you open detaches from its neighbors: the gaps around it
 * widen, the corners on both sides of each gap round off, and everything lands with a small bounce.
 */
export interface BouncyAccordionProps {
  /** The sections, in order. */
  items: BouncyAccordionItem[];
  /** Values of the open items (controlled). */
  value?: string[];
  /** Values of the items open at first when uncontrolled. */
  defaultValue?: string[];
  /** Called with the values of the open items after each change. */
  onValueChange?: (value: string[]) => void;
  /** Lets several items stay open. By default opening one closes the others. */
  multiple?: boolean;
  /** Gap in px around an open item. Closed neighbors sit 3 px apart. */
  gap?: number;
  /** Corner radius in px of the block's outer corners and of every corner that faces an open gap. */
  radius?: number;
  /** Heading level that wraps each trigger, to fit the page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Extra class for the root element. */
  className?: string;
}

/** Closed neighbors: a hairline gap and tight inner corners, so the block reads as one segmented shape. */
const SEAM = 3;
const INNER_RADIUS = 8;

/** The one place in the library that is allowed to bounce on purpose: small, and settled in under half a second. */
const bounce: Transition = { type: "spring", visualDuration: 0.42, bounce: 0.32 };
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const still: Transition = { duration: 0 };

const panelMotion: Variants = {
  open: { height: "auto", opacity: 1, visibility: "visible", transition: { height: bounce, opacity: { duration: motionTokens.duration.standard, ease: enter } } },
  closed: { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" }, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: standard } } },
};
const panelStill: Variants = {
  open: { height: "auto", opacity: 1, visibility: "visible", transition: still },
  closed: { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" }, transition: still },
};
const contentMotion: Variants = {
  open: { y: 0, opacity: 1, transition: { y: bounce, opacity: { duration: motionTokens.duration.standard, ease: enter, delay: 0.04 } } },
  closed: { y: -10, opacity: 0, transition: { duration: motionTokens.duration.fast, ease: standard } },
};
const contentStill: Variants = { open: { y: 0, opacity: 1, transition: still }, closed: { y: 0, opacity: 0, transition: still } };

export function BouncyAccordion({ items, value, defaultValue, onValueChange, multiple = false, gap = 12, radius = 22, headingLevel = 3, className }: BouncyAccordionProps) {
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const open = value ?? internal;
  const reduced = useReducedMotion();
  const id = useId();
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const isOpen = (index: number) => { const item = items[index]; return !!item && open.includes(item.value); };

  function toggle(itemValue: string) {
    const next = open.includes(itemValue) ? open.filter(entry => entry !== itemValue) : multiple ? [...open, itemValue] : [itemValue];
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const enabled = items.map((item, at) => item.disabled ? -1 : at).filter(at => at >= 0);
    const position = enabled.indexOf(index);
    if (position < 0 || enabled.length === 0) return;
    let target: number | undefined;
    if (event.key === "ArrowDown") target = enabled[(position + 1) % enabled.length];
    else if (event.key === "ArrowUp") target = enabled[(position - 1 + enabled.length) % enabled.length];
    else if (event.key === "Home") target = enabled[0];
    else if (event.key === "End") target = enabled[enabled.length - 1];
    if (target === undefined) return;
    event.preventDefault();
    triggers.current[target]?.focus();
  }

  return (
    <div className={[styles.accordion, className].filter(Boolean).join(" ")}>
      {items.map((item, index) => {
        const active = isOpen(index);
        const last = index === items.length - 1;
        // A gap opens on each side of an open item, so the item above and the item below round their facing corners too.
        const splitAbove = index > 0 && (active || isOpen(index - 1));
        const splitBelow = !last && (active || isOpen(index + 1));
        const top = index === 0 || splitAbove ? radius : INNER_RADIUS;
        const bottom = last || splitBelow ? radius : INNER_RADIUS;
        const triggerId = `${id}-trigger-${index}`, panelId = `${id}-panel-${index}`;
        return (
          <motion.div
            key={item.value}
            className={styles.item}
            data-state={active ? "open" : "closed"}
            data-disabled={item.disabled || undefined}
            initial={false}
            animate={{ marginTop: index === 0 ? 0 : splitAbove ? gap : SEAM, borderTopLeftRadius: top, borderTopRightRadius: top, borderBottomLeftRadius: bottom, borderBottomRightRadius: bottom }}
            transition={reduced ? still : bounce}
          >
            {createElement(`h${headingLevel}`, { className: styles.heading },
              <button
                ref={node => { triggers.current[index] = node; }}
                type="button"
                id={triggerId}
                className={styles.trigger}
                aria-expanded={active}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggle(item.value)}
                onKeyDown={event => onKeyDown(event, index)}
              >
                {item.icon ? <span className={styles.icon} aria-hidden="true">{item.icon}</span> : null}
                <span className={styles.title}>{item.title}</span>
                <span className={styles.toggle} aria-hidden="true">
                  <motion.span className={styles.glyph} initial={false} animate={{ rotate: active ? 135 : 0 }} transition={reduced ? still : bounce}><Plus width={16} height={16} strokeWidth={2} /></motion.span>
                </span>
              </button>,
            )}
            <motion.div id={panelId} role="region" aria-labelledby={triggerId} className={styles.panel} initial={false} animate={active ? "open" : "closed"} variants={reduced ? panelStill : panelMotion}>
              <motion.div className={styles.content} variants={reduced ? contentStill : contentMotion}>{item.content}</motion.div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default BouncyAccordion;
