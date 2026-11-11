"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./expandable-control.module.css";

export interface ExpandableControlAction {
  /** Icon of the trailing button. */
  icon: ReactNode;
  /** Accessible name of the trailing button, for example "Copy link". */
  label: string;
  /** Runs when the trailing button is pressed. */
  onClick: () => void;
}

/**
 * An icon button or chip that opens in place: press it and it widens on a spring to show its label and, if given, a trailing action.
 * Use it where a row of icons needs to name the one in use without spending the room for every label.
 */
export interface ExpandableControlProps {
  /** Always visible. Usually a 16 to 18 px icon. */
  icon: ReactNode;
  /** The text revealed when the control opens. Also its accessible name while only the icon shows. */
  label: string;
  /** Open state (controlled). */
  expanded?: boolean;
  /** Open at first (uncontrolled). */
  defaultExpanded?: boolean;
  /** Runs when the control opens or closes. */
  onExpandedChange?: (expanded: boolean) => void;
  /** A second button revealed after the label, such as copy, clear or dismiss. */
  action?: ExpandableControlAction;
  /** `button` is a round control at the standard control height; `chip` is the compact pill for tags and filters. */
  variant?: "button" | "chip";
  /** `accent` fills the control with the accent color while it is open. */
  tone?: "neutral" | "accent";
  /** Extra content shown after the label while open, such as a count. */
  detail?: ReactNode;
  /** Turns the control off: it is dimmed and ignores pointer and keyboard input. */
  disabled?: boolean;
  /** Extra class names for the root element. */
  className?: string;
}

const ease = [...motionTokens.ease.standard] as [number, number, number, number];
const fade: Transition = { duration: motionTokens.duration.fast, ease };
/** The width rides the morph spring; opacity and blur tween, so they never overshoot. */
const open: Transition = { width: motionTokens.spring.morph, opacity: { duration: motionTokens.duration.standard, ease, delay: 0.04 } };
const close: Transition = { width: motionTokens.spring.morph, opacity: { duration: motionTokens.duration.instant, ease } };

export function ExpandableControl({ icon, label, expanded, defaultExpanded = false, onExpandedChange, action, variant = "button", tone = "neutral", detail, disabled = false, className }: ExpandableControlProps) {
  const reduce = !!useReducedMotion();
  const [internal, setInternal] = useState(defaultExpanded);
  const isOpen = expanded ?? internal;
  const mainRef = useRef<HTMLButtonElement>(null);

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (expanded === undefined) setInternal(next);
    onExpandedChange?.(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || !isOpen) return;
    event.stopPropagation();
    // Closing removes the trailing button, so focus returns to the part that stays.
    mainRef.current?.focus();
    setOpen(false);
  }

  // The slot animates its own width between nothing and its content, so neighbors make room in step instead of jumping.
  const slot = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: fade }, exit: { opacity: 0, transition: fade } }
    : { initial: { width: 0, opacity: 0 }, animate: { width: "auto", opacity: 1, transition: open }, exit: { width: 0, opacity: 0, transition: close } };
  const text = reduce
    ? {}
    : { initial: { x: -8, filter: `blur(${motionTokens.blur.soft}px)` }, animate: { x: 0, filter: "blur(0px)" }, exit: { x: -4, filter: `blur(${motionTokens.blur.subtle}px)` }, transition: { x: motionTokens.spring.morph, filter: { duration: motionTokens.duration.standard, ease } } };

  return (
    <div className={[styles.control, className].filter(Boolean).join(" ")} data-variant={variant} data-tone={tone} data-expanded={isOpen} data-disabled={disabled || undefined} onKeyDown={onKeyDown}>
      <button ref={mainRef} type="button" className={styles.main} aria-expanded={isOpen} aria-label={label} disabled={disabled} onClick={() => setOpen(!isOpen)}>
        <span className={styles.icon} aria-hidden="true">{icon}</span>
        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.span key="label" className={styles.slot} {...slot} aria-hidden="true">
              <motion.span className={styles.label} {...text}>
                {label}
                {detail != null ? <span className={styles.detail}>{detail}</span> : null}
              </motion.span>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && action ? (
          <motion.span key="action" className={styles.slot} {...slot}>
            <span className={styles.actionWrap}>
              <button type="button" className={styles.action} aria-label={action.label} title={action.label} disabled={disabled} onClick={action.onClick}>{action.icon}</button>
            </span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default ExpandableControl;
