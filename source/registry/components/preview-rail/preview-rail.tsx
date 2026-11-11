"use client";

import { useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./preview-rail.module.css";

export interface PreviewRailItem {
  /** Unique id, used as the rail's value. */
  id: string;
  /** Card title, shown on the closed card's label and in the open preview. */
  title: string;
  /** Short line above the title: a category, a place, a date. */
  eyebrow?: string;
  /** One or two sentences shown only while the card is open. */
  description?: string;
  /** Detail shown at the bottom of the preview, such as a duration or a count. */
  meta?: string;
  /** Image URL for the card background. */
  image: string;
  /** Alternative text for the image. Leave empty when the title already says it. */
  alt?: string;
}

/**
 * A rail of cards in which one is open: the hovered or focused card widens to show its preview while the others shrink to a slice.
 * In a narrow container the rail turns into a column and the open card grows taller instead.
 */
export interface PreviewRailProps {
  /** The cards, in order. */
  items: PreviewRailItem[];
  /** Id of the open card (controlled). */
  value?: string;
  /** Open card when uncontrolled. Defaults to the first one. */
  defaultValue?: string;
  /** Called when another card opens. */
  onValueChange?: (value: string) => void;
  /** Called when the open card is pressed (click, tap, Enter or Space). */
  onSelect?: (item: PreviewRailItem) => void;
  /** What opens a card with a mouse: hovering it, or only pressing it. Keyboard focus and taps always open. */
  trigger?: "hover" | "press";
  /** How many times wider the open card is than a closed one. */
  ratio?: number;
  /** Rail height in pixels. */
  height?: number;
  /** Accessible name of the group. */
  label?: string;
  /** Extra class for the outer element. */
  className?: string;
}

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const captionVariants: Variants = {
  closed: { opacity: 0, transition: { duration: motionTokens.duration.instant, ease: standard } },
  open: { opacity: 1, transition: { duration: motionTokens.duration.standard, ease: enter, delay: .1, delayChildren: .12, staggerChildren: motionTokens.stagger.line } },
};
const lineVariants: Variants = {
  closed: { opacity: 0, y: 10 },
  open: { opacity: 1, y: 0, transition: motionTokens.spring.smooth },
};
const stillLine: Variants = { closed: { opacity: 0 }, open: { opacity: 1 } };

export function PreviewRail({ items, value, defaultValue, onValueChange, onSelect, trigger = "hover", ratio = 4, height = 320, label = "Previews", className }: PreviewRailProps) {
  const reduce = useReducedMotion();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id);
  const active = value !== undefined ? value : internal;
  const railRef = useRef<HTMLDivElement>(null);
  /** Whether the pressed card was already open when the press began: the first tap on a closed card only opens it. */
  const openAtPress = useRef(true);
  const lines = reduce ? stillLine : lineVariants;

  function open(id: string) {
    if (id === active) return;
    if (value === undefined) setInternal(id);
    onValueChange?.(id);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const cards = Array.from(railRef.current?.querySelectorAll<HTMLElement>("[data-rail-card]") ?? []);
    const at = cards.indexOf(document.activeElement as HTMLElement);
    if (at < 0) return;
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
    const to = forward ? Math.min(at + 1, cards.length - 1) : back ? Math.max(at - 1, 0) : event.key === "Home" ? 0 : cards.length - 1;
    event.preventDefault();
    cards[to]?.focus();
  }

  const vars = { "--rail-height": `${height}px`, "--rail-count": items.length, "--rail-ratio": ratio } as CSSProperties;
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} style={vars}>
      <div ref={railRef} className={styles.rail} role="group" aria-label={label} onKeyDown={onKeyDown}>
        {items.map(item => {
          const isOpen = item.id === active;
          return (
            <motion.button
              key={item.id}
              type="button"
              className={styles.card}
              data-rail-card=""
              data-open={isOpen}
              aria-expanded={isOpen}
              initial={false}
              animate={{ flexGrow: isOpen ? ratio : 1 }}
              transition={reduce ? { duration: 0 } : motionTokens.spring.morph}
              onPointerEnter={event => { if (trigger === "hover" && event.pointerType === "mouse") open(item.id); }}
              onPointerDown={() => { openAtPress.current = isOpen; }}
              onFocus={() => open(item.id)}
              onClick={event => {
                // A keyboard press arrives with detail 0 and always lands on the open (focused) card.
                if (isOpen && (openAtPress.current || event.detail === 0)) onSelect?.(item);
                else open(item.id);
                openAtPress.current = true;
              }}
            >
              <img className={styles.media} src={item.image} alt={item.alt ?? ""} draggable={false} />
              <span className={styles.srOnly}>{item.title}</span>
              <span className={styles.chip} aria-hidden="true"><span className={styles.chipText}>{item.title}</span></span>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.span key="caption" className={styles.caption} variants={captionVariants} initial="closed" animate="open" exit="closed">
                    {item.eyebrow ? <motion.span className={styles.eyebrow} variants={lines}>{item.eyebrow}</motion.span> : null}
                    <motion.span className={styles.title} variants={lines} aria-hidden="true">{item.title}</motion.span>
                    {item.description ? <motion.span className={styles.description} variants={lines}>{item.description}</motion.span> : null}
                    <motion.span className={styles.footer} variants={lines}>
                      <span className={styles.meta}>{item.meta}</span>
                      <span className={styles.arrow} aria-hidden="true"><ArrowUpRight size={16} strokeWidth={2} /></span>
                    </motion.span>
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default PreviewRail;
