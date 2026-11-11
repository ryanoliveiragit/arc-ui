"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { ChevronsLeft } from "lucide-react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./bounce-sidebar.module.css";

export interface BounceSidebarItem {
  /** Unique id, used as the sidebar's value. */
  id: string;
  /** Text next to the icon. It stays in the accessibility tree while the sidebar is a rail. */
  label: string;
  /** Icon, about 18 px. */
  icon: ReactNode;
  /** A count or short word at the end of the row; the rail shows it as a dot on the icon. */
  badge?: string | number;
  /** Keeps the row visible but not pressable. */
  disabled?: boolean;
}

/**
 * An app sidebar that switches between an icon rail and a full panel. The width rides a slightly bouncy spring,
 * labels arrive one after another, and a solid accent marker glides to the active row.
 */
export interface BounceSidebarProps {
  /** Main destinations, top to bottom. */
  items: BounceSidebarItem[];
  /** Destinations pinned to the bottom, such as settings and help. */
  secondaryItems?: BounceSidebarItem[];
  /** Id of the active row (controlled). */
  value?: string;
  /** Active row when uncontrolled. Defaults to the first item. */
  defaultValue?: string;
  /** Called with the id of the pressed row. */
  onValueChange?: (value: string) => void;
  /** Whether the full panel shows (controlled). False is the icon rail. */
  expanded?: boolean;
  /** Starting state when uncontrolled. */
  defaultExpanded?: boolean;
  /** Called when the toggle is pressed. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Brand mark for the header tile: a glyph or a letter. */
  logo?: ReactNode;
  /** Product or workspace name beside the brand mark. */
  title?: string;
  /** Width of the icon rail in pixels. */
  railWidth?: number;
  /** Width of the full panel in pixels. */
  panelWidth?: number;
  /** Accessible name of the navigation landmark. */
  label?: string;
  /** Extra class for the sidebar. */
  className?: string;
}

/** The signature: a short overshoot on the width, small enough that the content beside it never jitters. */
const bounce: Transition = { type: "spring", visualDuration: .42, bounce: .34 };
const still: Transition = { duration: 0 };
const fadeOut: Transition = { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] as [number, number, number, number] };

export function BounceSidebar({ items, secondaryItems = [], value, defaultValue, onValueChange, expanded, defaultExpanded = true, onExpandedChange, logo, title, railWidth = 64, panelWidth = 232, label = "Main", className }: BounceSidebarProps) {
  const reduce = useReducedMotion();
  const id = useId();
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.id);
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const active = value !== undefined ? value : internalValue;
  const open = expanded !== undefined ? expanded : internalExpanded;
  const bodyRef = useRef<HTMLDivElement>(null);
  const markerY = useMotionValue(0);
  const markerHeight = useMotionValue(0);
  const markerOpacity = useMotionValue(0);
  const placed = useRef(false);

  /** Puts the marker behind the active row; it glides when it was already showing. */
  const place = useCallback((glide: boolean) => {
    const body = bodyRef.current;
    const row = body ? Array.from(body.querySelectorAll<HTMLElement>("[data-sidebar-item]")).find(node => node.dataset.value === active) : undefined;
    if (!body || !row) { placed.current = false; markerOpacity.set(0); return; }
    const top = row.getBoundingClientRect().top - body.getBoundingClientRect().top;
    markerHeight.set(row.offsetHeight);
    markerY.stop();
    if (glide && placed.current && !reduce) animate(markerY, top, { type: "spring", visualDuration: .36, bounce: .22 });
    else markerY.jump(top);
    placed.current = true;
    markerOpacity.set(1);
  }, [active, markerHeight, markerOpacity, markerY, reduce]);

  useLayoutEffect(() => { place(true); }, [place]);
  const latestPlace = useRef(place);
  useEffect(() => { latestPlace.current = place; }, [place]);
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || typeof ResizeObserver === "undefined") return;
    // Only a height change moves rows; the width animation must not cut a glide short.
    let lastHeight = body.offsetHeight;
    const observer = new ResizeObserver(() => { if (body.offsetHeight !== lastHeight) { lastHeight = body.offsetHeight; latestPlace.current(false); } });
    observer.observe(body);
    return () => observer.disconnect();
  }, []);

  function select(next: string) {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }

  function toggle() {
    if (expanded === undefined) setInternalExpanded(!open);
    onExpandedChange?.(!open);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const rows = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled)"));
    const at = rows.indexOf(document.activeElement as HTMLElement);
    if (at < 0) return;
    const to = event.key === "ArrowDown" ? (at + 1) % rows.length : event.key === "ArrowUp" ? (at - 1 + rows.length) % rows.length : event.key === "Home" ? 0 : rows.length - 1;
    event.preventDefault();
    rows[to]?.focus();
  }

  // Labels arrive one after another as the panel opens and leave together when it closes.
  let order = 0;
  const reveal = () => {
    const step = order++;
    return {
      initial: false as const,
      animate: { opacity: open ? 1 : 0, x: open || reduce ? 0 : -6 },
      transition: reduce ? still : open ? { ...motionTokens.spring.smooth, delay: .06 + step * motionTokens.stagger.item } : fadeOut,
    };
  };

  const row = (item: BounceSidebarItem) => {
    const isActive = item.id === active;
    return (
      <li key={item.id}>
        <button type="button" className={styles.item} data-sidebar-item="" data-value={item.id} data-active={isActive || undefined} aria-current={isActive ? "page" : undefined} disabled={item.disabled} onClick={() => select(item.id)}>
          <span className={styles.icon} aria-hidden="true">{item.icon}{item.badge !== undefined ? <span className={styles.dot} /> : null}</span>
          <motion.span className={styles.reveal} {...reveal()}>
            <span className={styles.label}>{item.label}</span>
            {item.badge !== undefined ? <span className={styles.badge}>{item.badge}</span> : null}
          </motion.span>
        </button>
      </li>
    );
  };

  return (
    <motion.nav id={id} aria-label={label} className={[styles.sidebar, className].filter(Boolean).join(" ")} data-expanded={open} initial={false} animate={{ width: open ? panelWidth : railWidth }} transition={reduce ? still : bounce} onKeyDown={onKeyDown}>
      {logo !== undefined || title !== undefined ? (
        <div className={styles.header}>
          <span className={styles.logo} aria-hidden="true">{logo}</span>
          {title !== undefined ? <motion.span className={styles.title} {...reveal()}>{title}</motion.span> : null}
        </div>
      ) : null}
      <div ref={bodyRef} className={styles.body}>
        <motion.span className={styles.marker} style={{ y: markerY, height: markerHeight, opacity: markerOpacity }} aria-hidden="true" />
        <ul className={styles.list}>{items.map(row)}</ul>
        <div className={styles.spacer} />
        {secondaryItems.length ? <ul className={styles.list}>{secondaryItems.map(row)}</ul> : null}
        <button type="button" className={styles.item} data-toggle="" aria-expanded={open} aria-controls={id} onClick={toggle}>
          <motion.span className={styles.icon} aria-hidden="true" initial={false} animate={{ rotate: open ? 0 : 180 }} transition={reduce ? still : bounce}><ChevronsLeft size={18} strokeWidth={1.75} /></motion.span>
          <motion.span className={styles.reveal} aria-hidden="true" {...reveal()}><span className={styles.label}>Collapse</span></motion.span>
          {/* The visible word fades out in the rail, so the name for assistive tech is kept separately. */}
          <span className={styles.srOnly}>{open ? "Collapse sidebar" : "Expand sidebar"}</span>
        </button>
      </div>
    </motion.nav>
  );
}

export default BounceSidebar;
