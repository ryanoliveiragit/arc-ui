"use client";

import { createContext, useCallback, useContext, useId, useMemo, useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./collapsible.module.css";

interface CollapsibleState {
  open: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
  toggle: () => void;
}

const CollapsibleContext = createContext<CollapsibleState | null>(null);

function useCollapsible(part: string) {
  const state = useContext(CollapsibleContext);
  if (!state) throw new Error(`Render <${part}> inside <Collapsible>.`);
  return state;
}

/**
 * One region that opens and closes in place. The height follows the content on a spring, the content comes into focus as it
 * arrives, and the chevron turns with it. Use it for optional detail next to its heading; for a set of related sections use an accordion.
 */
export interface CollapsibleProps {
  /** Whether the region is open. Pass it together with `onOpenChange` to control the state yourself. */
  open?: boolean;
  /** Initial state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called with the next state whenever the trigger is used. */
  onOpenChange?: (open: boolean) => void;
  /** Keeps the current state and ignores the trigger. */
  disabled?: boolean;
  /** "card" draws one bordered surface around the trigger and the content; "plain" leaves both bare for your own layout. */
  variant?: "card" | "plain";
  /** Extra class for the root element. */
  className?: string;
  /** A `CollapsibleTrigger`, a `CollapsibleContent`, and anything that should stay visible between them. */
  children: ReactNode;
}

export interface CollapsibleTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** Short supporting text shown under the label, such as a summary of what is inside. */
  hint?: ReactNode;
  /** Leading icon or avatar. */
  icon?: ReactNode;
  /** Removes the chevron, for triggers that carry their own affordance. */
  hideChevron?: boolean;
  /** Extra class for the button. */
  className?: string;
  /** The label. */
  children: ReactNode;
}

export interface CollapsibleContentProps {
  /** Extra class for the padded inner element that holds the content. */
  className?: string;
  /** The content that opens and closes. It stays mounted, so fields inside keep their values. */
  children: ReactNode;
}

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];

/** The panel leaves the tab order and the accessibility tree only after it has finished closing. */
const panelMotion: Variants = {
  open: { height: "auto", opacity: 1, visibility: "visible", transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: enter } } },
  closed: { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" }, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: standard } } },
};
/** A small rise and a brief focus pull, so the content reads as arriving instead of being uncovered. */
const innerMotion: Variants = {
  open: { y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" }, transition: { y: motionTokens.spring.smooth, filter: { duration: motionTokens.duration.standard, ease: enter } } },
  closed: { y: -8, filter: `blur(${motionTokens.blur.soft}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } },
};
const panelStill: Variants = { open: { height: "auto", opacity: 1, visibility: "visible", transition: { duration: 0 } }, closed: { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" }, transition: { duration: 0 } } };
const innerStill: Variants = { open: { y: 0, filter: "none", transition: { duration: 0 } }, closed: { y: 0, filter: "none", transition: { duration: 0 } } };

export function Collapsible({ open: openProp, defaultOpen = false, onOpenChange, disabled = false, variant = "card", className, children }: CollapsibleProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const open = openProp ?? internal;
  const id = useId();
  const toggle = useCallback(() => {
    if (disabled) return;
    if (openProp === undefined) setInternal(!open);
    onOpenChange?.(!open);
  }, [disabled, onOpenChange, open, openProp]);
  const state = useMemo<CollapsibleState>(() => ({ open, disabled, toggle, triggerId: `${id}-trigger`, contentId: `${id}-content` }), [disabled, id, open, toggle]);
  return (
    <CollapsibleContext.Provider value={state}>
      <div className={[styles.collapsible, styles[variant], className].filter(Boolean).join(" ")} data-state={open ? "open" : "closed"} data-disabled={disabled || undefined}>{children}</div>
    </CollapsibleContext.Provider>
  );
}

export function CollapsibleTrigger({ hint, icon, hideChevron = false, className, children, onClick, disabled, ...props }: CollapsibleTriggerProps) {
  const state = useCollapsible("CollapsibleTrigger");
  const reduced = useReducedMotion();
  return (
    <button
      {...props}
      type="button"
      id={state.triggerId}
      className={[styles.trigger, className].filter(Boolean).join(" ")}
      aria-expanded={state.open}
      aria-controls={state.contentId}
      data-state={state.open ? "open" : "closed"}
      disabled={disabled ?? state.disabled}
      onClick={event => { onClick?.(event); if (!event.defaultPrevented) state.toggle(); }}
    >
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      <span className={styles.copy}>
        <span className={styles.label}>{children}</span>
        {hint ? <span className={styles.hint}>{hint}</span> : null}
      </span>
      {hideChevron ? null : (
        <motion.span className={styles.chevron} aria-hidden="true" initial={false} animate={{ rotate: state.open ? 180 : 0 }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}>
          <ChevronDown width={18} height={18} strokeWidth={1.75} />
        </motion.span>
      )}
    </button>
  );
}

export function CollapsibleContent({ className, children }: CollapsibleContentProps) {
  const state = useCollapsible("CollapsibleContent");
  const reduced = useReducedMotion();
  return (
    <motion.div
      id={state.contentId}
      role="region"
      aria-labelledby={state.triggerId}
      className={styles.panel}
      initial={false}
      animate={state.open ? "open" : "closed"}
      variants={reduced ? panelStill : panelMotion}
    >
      <motion.div className={[styles.inner, className].filter(Boolean).join(" ")} variants={reduced ? innerStill : innerMotion}>{children}</motion.div>
    </motion.div>
  );
}

export default Collapsible;
