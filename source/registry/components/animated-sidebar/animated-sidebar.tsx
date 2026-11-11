"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactElement, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import { HoverHighlight } from "@/registry/components/hover-highlight/hover-highlight";
import styles from "./animated-sidebar.module.css";

export interface AnimatedSidebarItem {
  /** Unique id across the whole sidebar. Leaf ids are the sidebar's value. */
  id: string;
  /** Row text. In the collapsed rail it moves to a tooltip. */
  label: string;
  /** Icon for a top-level row, about 18 px. Nested rows do not show one. */
  icon?: ReactNode;
  /** A count or short word at the end of the row. */
  badge?: string | number;
  /** Renders the row as a link. */
  href?: string;
  /** Keeps the row visible but not pressable. */
  disabled?: boolean;
  /** Nested rows. A row with children opens and closes its group instead of navigating. */
  children?: AnimatedSidebarItem[];
}

export interface AnimatedSidebarSection {
  /** Unique id of the section. */
  id: string;
  /** Small heading above the rows. In the rail it becomes a divider. */
  title?: string;
  /** The rows of the section. */
  items: AnimatedSidebarItem[];
}

/**
 * A sidebar with nested groups. Groups open with a height spring and their rows arrive one after another, one highlight glides
 * under the pointer or keyboard focus, and the whole panel collapses to an icon rail where labels move into tooltips.
 */
export interface AnimatedSidebarProps {
  /** Sections of rows, top to bottom. */
  sections: AnimatedSidebarSection[];
  /** Id of the active leaf row (controlled). */
  value?: string;
  /** Active row when uncontrolled. */
  defaultValue?: string;
  /** Called with the id of the pressed leaf row. */
  onValueChange?: (value: string) => void;
  /** Ids of the open groups (controlled). */
  openIds?: string[];
  /** Open groups when uncontrolled. Defaults to the group that holds the active row. */
  defaultOpenIds?: string[];
  /** Called with the next list of open group ids. */
  onOpenIdsChange?: (openIds: string[]) => void;
  /** Whether the sidebar is the icon rail (controlled). */
  collapsed?: boolean;
  /** Starting state when uncontrolled. */
  defaultCollapsed?: boolean;
  /** Called when the collapse button is pressed, or when a group is opened from the rail. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Brand mark shown in the header. */
  logo?: ReactNode;
  /** Product or workspace name shown beside the brand mark. */
  title?: string;
  /** Panel width in pixels. */
  width?: number;
  /** Rail width in pixels. */
  collapsedWidth?: number;
  /** Accessible name of the navigation landmark. */
  label?: string;
  /** Extra class for the sidebar. */
  className?: string;
}

const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const groupVariants: Variants = {
  closed: { height: 0, opacity: 0, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: standard } } },
  open: { height: "auto", opacity: 1, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: standard }, delayChildren: .03, staggerChildren: motionTokens.stagger.item } },
};
const childVariants: Variants = { closed: { opacity: 0, x: -8 }, open: { opacity: 1, x: 0, transition: motionTokens.spring.snappy } };
const stillGroup: Variants = { closed: { height: 0, opacity: 0, transition: { duration: 0 } }, open: { height: "auto", opacity: 1, transition: { duration: 0 } } };
const stillChild: Variants = { closed: { opacity: 1 }, open: { opacity: 1 } };

const parentOf = (sections: AnimatedSidebarSection[], id: string | undefined) => sections.flatMap(section => section.items).find(item => item.children?.some(child => child.id === id))?.id;

/** The label of a rail row. It only opens while the sidebar is collapsed, so the panel never shows a tooltip that repeats the visible text. */
function RailTip({ label, enabled, children }: { label: string; enabled: boolean; children: ReactElement }) {
  const [open, setOpen] = useState(false);
  // Radix reports only changes, so a hover that began in the panel must not be remembered as "open" when the rail arrives.
  useEffect(() => { if (!enabled) setOpen(false); }, [enabled]);
  return (
    <TooltipPrimitive.Root open={enabled && open} onOpenChange={next => setOpen(enabled && next)}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content className={styles.tip} side="right" sideOffset={10} collisionPadding={8}>{label}</TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export function AnimatedSidebar({ sections, value, defaultValue, onValueChange, openIds, defaultOpenIds, onOpenIdsChange, collapsed, defaultCollapsed = false, onCollapsedChange, logo, title, width = 264, collapsedWidth = 64, label = "Sidebar", className }: AnimatedSidebarProps) {
  const reduce = useReducedMotion();
  const baseId = useId();
  const navRef = useRef<HTMLElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalOpen, setInternalOpen] = useState<string[]>(() => { const parent = parentOf(sections, value ?? defaultValue); return defaultOpenIds ?? (parent ? [parent] : []); });
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const active = value !== undefined ? value : internalValue;
  const open = openIds ?? internalOpen;
  const rail = collapsed !== undefined ? collapsed : internalCollapsed;
  const activeParent = parentOf(sections, active);

  function select(id: string) {
    if (value === undefined) setInternalValue(id);
    onValueChange?.(id);
  }

  function setOpen(id: string, next: boolean) {
    const list = next ? [...open.filter(entry => entry !== id), id] : open.filter(entry => entry !== id);
    if (openIds === undefined) setInternalOpen(list);
    onOpenIdsChange?.(list);
  }

  function setRail(next: boolean) {
    if (collapsed === undefined) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }

  function pressGroup(item: AnimatedSidebarItem) {
    // From the rail there is nowhere to show the nested rows, so the panel opens first.
    if (rail) { setRail(false); setOpen(item.id, true); return; }
    setOpen(item.id, !open.includes(item.id));
  }

  function onRowKeyDown(event: KeyboardEvent<HTMLElement>, item: AnimatedSidebarItem, parentId?: string) {
    if (event.key === "ArrowRight" && item.children && (rail || !open.includes(item.id))) { event.preventDefault(); pressGroup(item); }
    else if (event.key === "ArrowLeft" && item.children && !rail && open.includes(item.id)) { event.preventDefault(); setOpen(item.id, false); }
    else if (event.key === "ArrowLeft" && parentId) {
      event.preventDefault();
      Array.from(navRef.current?.querySelectorAll<HTMLElement>("[data-row-id]") ?? []).find(node => node.dataset.rowId === parentId)?.focus();
    }
  }

  function renderRow(item: AnimatedSidebarItem, parentId?: string) {
    const nested = parentId !== undefined;
    const isGroup = !!item.children?.length;
    const isOpen = isGroup && open.includes(item.id);
    // A closed or collapsed group stands in for its active child, so the current place is never lost.
    const isActive = item.id === active || (isGroup && item.id === activeParent && (rail || !isOpen));
    const shared = {
      className: styles.row,
      "data-highlight-item": "",
      "data-row-id": item.id,
      "data-nested": nested || undefined,
      "data-active": isActive || undefined,
      "data-disabled": item.disabled ? "" : undefined,
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => onRowKeyDown(event, item, parentId),
    };
    const content = <>
      {nested ? null : <span className={styles.icon} aria-hidden="true">{item.icon}</span>}
      <span className={styles.label}>{item.label}</span>
      {item.badge !== undefined ? <span className={styles.badge}>{item.badge}</span> : null}
      {isGroup ? <span className={styles.chevron} data-open={isOpen && !rail} aria-hidden="true"><ChevronRight size={15} strokeWidth={2} /></span> : null}
    </>;
    const control = isGroup
      ? <button {...shared} type="button" disabled={item.disabled} aria-expanded={isOpen && !rail} aria-controls={`${baseId}-${item.id}`} onClick={() => pressGroup(item)}>{content}</button>
      : item.href !== undefined
        ? <a {...shared} href={item.disabled ? undefined : item.href} aria-disabled={item.disabled || undefined} aria-current={isActive ? "page" : undefined} onClick={() => { if (!item.disabled) select(item.id); }}>{content}</a>
        : <button {...shared} type="button" disabled={item.disabled} aria-current={isActive ? "page" : undefined} onClick={() => select(item.id)}>{content}</button>;
    return nested ? control : <RailTip label={item.label} enabled={rail}>{control}</RailTip>;
  }

  return (
    <TooltipPrimitive.Provider delayDuration={150} skipDelayDuration={400}>
      <motion.nav ref={navRef} aria-label={label} className={[styles.sidebar, className].filter(Boolean).join(" ")} data-collapsed={rail} initial={false} animate={{ width: rail ? collapsedWidth : width }} transition={reduce ? { duration: 0 } : motionTokens.spring.smooth}>
        <div className={styles.header}>
          <div className={styles.brand}>
            {logo !== undefined ? <span className={styles.logo} aria-hidden="true">{logo}</span> : null}
            {title !== undefined ? <span className={styles.title}>{title}</span> : null}
          </div>
          <RailTip label="Expand sidebar" enabled={rail}>
            <button type="button" className={styles.toggle} aria-label={rail ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!rail} onClick={() => setRail(!rail)}>
              {rail ? <PanelLeftOpen size={18} strokeWidth={1.75} aria-hidden="true" /> : <PanelLeftClose size={18} strokeWidth={1.75} aria-hidden="true" />}
            </button>
          </RailTip>
        </div>
        <div className={styles.scroller}>
          <HoverHighlight className={styles.rows}>
            {sections.map(section => (
              <div key={section.id} className={styles.section} role="group" aria-label={section.title}>
                {section.title !== undefined ? <div className={styles.sectionTitle} aria-hidden="true"><span>{section.title}</span></div> : null}
                <ul className={styles.list}>
                  {section.items.map(item => {
                    const showChildren = !!item.children?.length && open.includes(item.id) && !rail;
                    return (
                      <li key={item.id}>
                        {renderRow(item)}
                        <AnimatePresence initial={false}>
                          {showChildren ? (
                            <motion.ul key="group" id={`${baseId}-${item.id}`} className={styles.group} variants={reduce ? stillGroup : groupVariants} initial="closed" animate="open" exit="closed">
                              {item.children!.map(child => <motion.li key={child.id} variants={reduce ? stillChild : childVariants}>{renderRow(child, item.id)}</motion.li>)}
                            </motion.ul>
                          ) : null}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </HoverHighlight>
        </div>
      </motion.nav>
    </TooltipPrimitive.Provider>
  );
}

export default AnimatedSidebar;
