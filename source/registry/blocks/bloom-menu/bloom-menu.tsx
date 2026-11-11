"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { Camera, ListTodo, Mic, Plus, StickyNote } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./bloom-menu.module.css";

export type BloomDirection = "up" | "up-left" | "up-right" | "left" | "right" | "down" | "down-left" | "down-right";

export interface BloomAction {
  /** Stable key; also passed to `onAction`. */
  id: string;
  /** Name of the action: the button's accessible name and the label shown on hover and focus. */
  label: string;
  /** Icon inside the round button. */
  icon: ReactNode;
  /** A disabled action stays in the arc but cannot be used. */
  disabled?: boolean;
  /** Runs when the action is chosen. */
  onSelect?: () => void;
}

export interface BloomMenuProps {
  /** The actions, placed along the arc in order. Three to six read best. */
  actions: BloomAction[];
  /** Where the arc opens, seen from the button. Use a diagonal for a button in a corner. */
  direction?: BloomDirection;
  /** Angle the actions spread over, in degrees. Defaults to 90 for diagonals and 150 for the four sides. */
  sweep?: number;
  /** Distance from the button to the actions, in px. It grows by itself when the actions would overlap. */
  radius?: number;
  /** Whether the menu is open (controlled). */
  open?: boolean;
  /** Whether the menu starts open (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Called with the action id when an action is chosen. The menu closes afterwards. */
  onAction?: (id: string) => void;
  /** Accessible name of the floating button and of the menu. */
  label?: string;
  /** Icon of the floating button. It turns 135 degrees while the menu is open, so a plus becomes a close mark. */
  icon?: ReactNode;
  /** Extra class for the root. */
  className?: string;
}

const centers: Record<BloomDirection, number> = { right: 0, "up-right": 45, up: 90, "up-left": 135, left: 180, "down-left": 225, down: 270, "down-right": 315 };
/** Action buttons are 48 px; this keeps a little air between neighbors on the arc. */
const PITCH = 58;
/** The one bouncy spring of this block: petals overshoot a touch as they open. */
const bloom: Transition = { type: "spring", visualDuration: .34, bounce: .3 };
const still: Transition = { duration: 0 };

/**
 * A floating button whose actions bloom outward along an arc, one after another, and fold back in reverse. It is a real
 * menu: arrow keys move between actions, Escape or a click outside closes it and focus returns to the button.
 */
export function BloomMenu({ actions, direction = "up-left", sweep, radius = 96, open, defaultOpen = false, onOpenChange, onAction, label = "Quick actions", icon, className }: BloomMenuProps) {
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = open ?? internal;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  /** Set when the keyboard opened the menu, so focus moves to the first action once it exists. */
  const focusFirst = useRef(false);

  const setOpen = (next: boolean) => { if (open === undefined) setInternal(next); onOpenChange?.(next); };
  const close = (returnFocus: boolean) => { setOpen(false); if (returnFocus) triggerRef.current?.focus(); };
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) closeRef.current(false); };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !focusFirst.current) return;
    focusFirst.current = false;
    rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus();
  }, [isOpen]);

  const spread = sweep ?? (direction.includes("-") ? 90 : 150);
  const center = centers[direction];
  const distance = Math.max(radius, actions.length > 1 ? ((actions.length - 1) * PITCH) / ((spread * Math.PI) / 180) : radius);
  const petals = actions.map((action, index) => {
    const angle = ((center + (actions.length > 1 ? spread / 2 - (spread * index) / (actions.length - 1) : 0)) * Math.PI) / 180;
    return { action, cos: Math.cos(angle), sin: Math.sin(angle) };
  });

  const moveFocus = (step: number | "first" | "last") => {
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? []);
    if (!items.length) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = step === "first" ? 0 : step === "last" ? items.length - 1 : (index + step + items.length) % items.length;
    items[next]?.focus();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && isOpen) { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (!isOpen) {
      if (event.target === triggerRef.current && ["ArrowUp", "ArrowDown"].includes(event.key)) { event.preventDefault(); focusFirst.current = true; setOpen(true); }
      return;
    }
    if (event.key === "Tab") { setOpen(false); return; }
    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : event.key === "Home" ? "first" : event.key === "End" ? "last" : null;
    if (step == null) return;
    event.preventDefault();
    moveFocus(event.target === triggerRef.current && step === -1 ? "last" : event.target === triggerRef.current ? "first" : step);
  };
  const choose = (action: BloomAction) => { action.onSelect?.(); onAction?.(action.id); close(true); };

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} data-open={isOpen ? "" : undefined} onKeyDown={onKeyDown}>
      <div id={`${uid}-menu`} className={styles.menu} role="menu" aria-label={label} aria-orientation="vertical">
        <AnimatePresence>
          {isOpen ? petals.map(({ action, cos, sin }, index) => (
            <motion.button
              key={action.id}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={action.disabled}
              aria-label={action.label}
              className={styles.petal}
              style={{ "--cos": cos.toFixed(4), "--sin": sin.toFixed(4) } as CSSProperties}
              initial={{ x: 0, y: 0, scale: reduce ? 1 : .3, opacity: 0 }}
              animate={{ x: cos * distance, y: -sin * distance, scale: 1, opacity: 1, transition: reduce ? { duration: motionTokens.duration.fast } : { ...bloom, delay: index * motionTokens.stagger.item, opacity: { duration: motionTokens.duration.fast, delay: index * motionTokens.stagger.item } } }}
              exit={{ x: reduce ? cos * distance : 0, y: reduce ? -sin * distance : 0, scale: reduce ? 1 : .3, opacity: 0, transition: reduce ? { duration: motionTokens.duration.instant } : { ...motionTokens.spring.snappy, delay: (actions.length - 1 - index) * .025, opacity: { duration: motionTokens.duration.fast, delay: (actions.length - 1 - index) * .025 } } }}
              whileTap={reduce || action.disabled ? undefined : { scale: .9 }}
              onClick={() => choose(action)}
            >
              <span className={styles.petalIcon} aria-hidden="true">{action.icon}</span>
              <span className={styles.petalLabel} aria-hidden="true">{action.label}</span>
            </motion.button>
          )) : null}
        </AnimatePresence>
      </div>
      <motion.button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={`${uid}-menu`}
        whileTap={reduce ? undefined : { scale: .93 }}
        transition={motionTokens.spring.snappy}
        onClick={event => { focusFirst.current = event.detail === 0 && !isOpen; setOpen(!isOpen); }}
      >
        <motion.span className={styles.triggerIcon} aria-hidden="true" animate={{ rotate: isOpen ? 135 : 0 }} transition={reduce ? still : bloom}>{icon ?? <Plus size={24} strokeWidth={2.2} />}</motion.span>
      </motion.button>
    </div>
  );
}

interface BoardItem { key: number; kind: string; title: string; note: string }
const kinds: Record<string, { label: string; icon: ReactNode; titles: string[]; note: string }> = {
  note: { label: "Note", icon: <StickyNote size={20} />, titles: ["Ideas for the launch post", "Questions for Thursday", "Books to pick up"], note: "Note" },
  task: { label: "Task", icon: <ListTodo size={20} />, titles: ["Send the revised quote", "Book the venue", "Renew the domain"], note: "Task · due tomorrow" },
  photo: { label: "Photo", icon: <Camera size={20} />, titles: ["Whiteboard, sprint plan", "Receipt, team lunch", "Packaging sample"], note: "Photo · 2.4 MB" },
  voice: { label: "Voice memo", icon: <Mic size={20} />, titles: ["Call recap with Andre", "Tagline options", "Reminder for Monday"], note: "Voice memo · 0:42" },
};
const starting: BoardItem[] = [{ key: 2, kind: "task", title: "Review the Q3 roadmap", note: "Task · due today" }, { key: 1, kind: "note", title: "Notes from the design critique", note: "Note" }];

/** Ready preview: a capture board. Each action adds a card. */
export default function BloomMenuPreview() {
  const reduce = useReducedMotion() ?? false;
  const [items, setItems] = useState(starting);
  const next = useRef(3);
  const add = (kind: string) => {
    const entry = kinds[kind];
    if (!entry) return;
    const key = next.current++;
    setItems(current => [{ key, kind, title: entry.titles[key % entry.titles.length] ?? entry.label, note: entry.note }, ...current].slice(0, 4));
  };
  const actions: BloomAction[] = Object.entries(kinds).map(([id, entry]) => ({ id, label: entry.label, icon: entry.icon }));
  return (
    <section className={styles.preview}>
      <div className={styles.board}>
        <header className={styles.boardHeader}>
          <h3>Inbox</h3>
          <p aria-live="polite">{items.length} captured · press the button to add more</p>
        </header>
        <ul className={styles.items}>
          <AnimatePresence initial={false} mode="popLayout">
            {items.map(item => (
              <motion.li key={item.key} layout className={styles.item} initial={{ opacity: 0, scale: reduce ? 1 : .9, y: reduce ? 0 : -12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: reduce ? 1 : .96, transition: { duration: motionTokens.duration.fast } }} transition={reduce ? still : motionTokens.spring.smooth}>
                <span className={styles.itemIcon} aria-hidden="true">{kinds[item.kind]?.icon}</span>
                <span className={styles.itemText}><strong>{item.title}</strong><span>{item.note}</span></span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <BloomMenu className={styles.corner} actions={actions} direction="up-left" label="Add to inbox" onAction={add} />
      </div>
    </section>
  );
}
