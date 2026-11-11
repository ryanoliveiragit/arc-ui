"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, usePresence, useReducedMotion } from "motion/react";
import type { PanInfo } from "motion/react";
import { BellOff, ChevronsDownUp, ChevronsUpDown, CreditCard, GitPullRequest, MessageSquare, ShieldAlert, UserPlus, X } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./notification-stack.module.css";

export type StackNotificationKind = "message" | "billing" | "review" | "security" | "team";

export interface StackNotification {
  /** Unique id, used for dismissal. */
  id: string;
  /** First line: who or what the notification is about. */
  title: string;
  /** Message, clamped to two lines. */
  body: string;
  /** Short relative time, such as "2m". */
  time: string;
  /** Picks the icon and its tone. Defaults to `message`. */
  kind?: StackNotificationKind;
  /** Shows the unread dot next to the title. */
  unread?: boolean;
}

export interface NotificationStackProps {
  /** Notifications, newest first. Pass it with `onNotificationsChange` to control the list. */
  notifications?: StackNotification[];
  /** Starting list when uncontrolled. Defaults to sample notifications. */
  defaultNotifications?: StackNotification[];
  /** Called with the remaining list after a dismissal, a clear, or a restore. */
  onNotificationsChange?: (next: StackNotification[]) => void;
  /** Called with the id of each dismissed notification. */
  onDismiss?: (id: string) => void;
  /** Keeps the stack fanned out. Hover and keyboard focus fan it out on their own. */
  expanded?: boolean;
  /** Whether the stack starts fanned out when uncontrolled. */
  defaultExpanded?: boolean;
  /** Called when the person pins or unpins the fanned out state. */
  onExpandedChange?: (expanded: boolean) => void;
  /** How many cards show in the collapsed pile. */
  visible?: number;
  /** Heading above the stack. */
  title?: string;
  /** Extra class for the stack. */
  className?: string;
}

export const sampleNotifications: StackNotification[] = [
  { id: "review", kind: "review", title: "Review requested", body: "Daniel Kim asked you to review “Cache invoices per workspace”.", time: "2m", unread: true },
  { id: "message", kind: "message", title: "Jasmine Brooks", body: "The onboarding copy is ready. Can you take a look before the 3 pm sync?", time: "14m", unread: true },
  { id: "billing", kind: "billing", title: "Payment received", body: "Invoice INV-2041 for $1,280.00 was paid by Northwind Labs.", time: "1h" },
  { id: "security", kind: "security", title: "New sign-in", body: "Your account was opened from Chrome on macOS in Lisbon, Portugal.", time: "3h" },
  { id: "team", kind: "team", title: "Mateo joined Design", body: "Mateo Alvarez accepted the invitation and can now edit shared files.", time: "Tue" },
];

const ICONS = { message: MessageSquare, billing: CreditCard, review: GitPullRequest, security: ShieldAlert, team: UserPlus } as const;
/** Sliver of each tucked card that shows under the one in front, in px. */
const PEEK = 10;
const GAP = 8;
const SHRINK = 0.05;

interface Slot { y: number; scale: number; opacity: number }

function Item({ item, index, slot, front, fanned, direction, onHeight, onDismiss, onKeyDismiss }: {
  item: StackNotification; index: number; slot: Slot; front: boolean; fanned: boolean; direction: number;
  onHeight: (id: string, height: number) => void; onDismiss: (id: string, direction: number) => void; onKeyDismiss: (id: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [present, safeToRemove] = usePresence();
  const card = useRef<HTMLDivElement>(null);
  // An exiting card keeps the slot it last had and only slides away.
  const last = useRef({ slot, index });
  if (present) last.current = { slot, index };
  const Icon = ICONS[item.kind ?? "message"];

  useLayoutEffect(() => {
    const node = card.current;
    if (!node) return;
    const report = () => onHeight(item.id, node.offsetHeight);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(node);
    return () => observer.disconnect();
  }, [item.id, onHeight]);

  // Safety net: a card whose exit changes nothing visible (already faded out under reduced motion) still has to leave the list.
  useEffect(() => {
    if (present) return;
    const timer = window.setTimeout(safeToRemove, 700);
    return () => window.clearTimeout(timer);
  }, [present, safeToRemove]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 650) onDismiss(item.id, info.offset.x < 0 ? -1 : 1);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); onKeyDismiss(item.id); }
  };
  const reachable = present && (fanned || front);
  const spring = reduceMotion ? { duration: 0 } : motionTokens.spring.gentle;

  return (
    <motion.li
      className={styles.item}
      data-front={front}
      data-fanned={fanned}
      style={{ zIndex: 100 - last.current.index, pointerEvents: reachable ? "auto" : "none" }}
      initial={reduceMotion ? { opacity: 0, y: slot.y, scale: slot.scale } : { opacity: 0, y: slot.y - 18, scale: slot.scale * 0.96 }}
      animate={present
        ? { x: 0, y: slot.y, scale: slot.scale, opacity: slot.opacity, transition: spring }
        : { x: reduceMotion ? 0 : direction * 460, y: last.current.slot.y, scale: last.current.slot.scale, opacity: 0, transition: reduceMotion ? { duration: motionTokens.duration.fast } : { duration: 0.26, ease: motionTokens.ease.exit, delay: Math.min(last.current.index * 0.04, 0.2) } }}
      onAnimationComplete={() => { if (!present) safeToRemove(); }}
      drag={reachable && !reduceMotion ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={onDragEnd}
      whileDrag={{ cursor: "grabbing" }}
      onKeyDown={onKeyDown}
      aria-hidden={reachable ? undefined : true}
    >
      <div ref={card} className={styles.card}>
        <span className={styles.icon} data-kind={item.kind ?? "message"}><Icon size={16} aria-hidden="true" /></span>
        <div className={styles.copy}>
          <p className={styles.heading}>
            <span className={styles.title}>{item.title}</span>
            {item.unread ? <span className={styles.unread}><span className={styles.srOnly}>Unread</span></span> : null}
            <time className={styles.time}>{item.time}</time>
          </p>
          <p className={styles.body}>{item.body}</p>
        </div>
        <button type="button" className={styles.dismiss} data-dismiss={item.id} tabIndex={reachable ? 0 : -1} aria-label={`Dismiss: ${item.title}`} onClick={() => onDismiss(item.id, 1)} onPointerDown={event => event.stopPropagation()}>
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </motion.li>
  );
}

/** A pile of notifications that fans out into a list on hover or focus; cards leave by swipe, button, or Delete, and the rest close ranks on a spring. */
export function NotificationStack({ notifications, defaultNotifications = sampleNotifications, onNotificationsChange, onDismiss, expanded, defaultExpanded = false, onExpandedChange, visible = 3, title = "Notifications", className }: NotificationStackProps) {
  const reduceMotion = useReducedMotion();
  const initial = useRef(defaultNotifications);
  const [internal, setInternal] = useState(defaultNotifications);
  const [pinnedInternal, setPinnedInternal] = useState(defaultExpanded);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1);
  const root = useRef<HTMLElement>(null);
  const list = notifications ?? internal;
  const pinned = expanded ?? pinnedInternal;
  const fanned = pinned || hovered || focused;

  const commit = (next: StackNotification[]) => { if (notifications === undefined) setInternal(next); onNotificationsChange?.(next); };
  const setPinned = (next: boolean) => { if (expanded === undefined) setPinnedInternal(next); onExpandedChange?.(next); };
  const onHeight = useCallback((id: string, height: number) => setHeights(current => (current[id] === height ? current : { ...current, [id]: height })), []);

  const dismiss = (id: string, toward: number) => {
    setDirection(toward);
    commit(list.filter(item => item.id !== id));
    onDismiss?.(id);
  };
  // Keyboard dismissal keeps focus inside the stack: it moves to the next card, or to the header when none is left.
  const dismissByKey = (id: string) => {
    const index = list.findIndex(item => item.id === id);
    const neighbour = list[index + 1] ?? list[index - 1];
    dismiss(id, 1);
    const target = neighbour ? root.current?.querySelector<HTMLElement>(`[data-dismiss="${neighbour.id}"]`) : root.current?.querySelector<HTMLElement>("[data-restore]");
    window.requestAnimationFrame(() => (target ?? root.current?.querySelector<HTMLElement>("[data-restore]"))?.focus());
  };
  const clear = () => { setDirection(1); list.forEach(item => onDismiss?.(item.id)); commit([]); };

  const frontHeight = heights[list[0]?.id ?? ""] ?? 76;
  const shown = Math.min(list.length, visible);
  let offset = 0;
  const slots: Slot[] = list.map((item, index) => {
    const height = heights[item.id] ?? frontHeight;
    if (fanned) { const slot = { y: offset, scale: 1, opacity: 1 }; offset += height + GAP; return slot; }
    const depth = Math.min(index, visible - 1);
    // Tucked cards scale from their bottom edge, so exactly PEEK px of each shows under the card in front.
    return { y: frontHeight - height + depth * PEEK, scale: 1 - depth * SHRINK, opacity: index < visible ? 1 : 0 };
  });
  const listHeight = list.length === 0 ? 0 : fanned ? offset - GAP : frontHeight + (shown - 1) * PEEK;

  const onPointerEnter = (event: ReactPointerEvent) => { if (event.pointerType === "mouse") setHovered(true); };
  const onFocus = (event: FocusEvent) => { if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) setFocused(true); };
  const onBlur = (event: FocusEvent<HTMLElement>) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); };

  return (
    <section ref={root} className={[styles.stack, className].filter(Boolean).join(" ")} aria-label={title}>
      <header className={styles.header}>
        <h2 className={styles.label}>{title}</h2>
        <AnimatePresence mode="popLayout" initial={false}>
          {list.length ? (
            <motion.span key={list.length} className={styles.count} initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.08 } }} transition={motionTokens.spring.snappy} aria-label={`${list.length} notifications`}>{list.length}</motion.span>
          ) : null}
        </AnimatePresence>
        <span className={styles.spacer} />
        {list.length > 1 ? (
          <button type="button" className={styles.tool} aria-expanded={pinned} onClick={() => setPinned(!pinned)}>
            {pinned ? <ChevronsDownUp size={14} aria-hidden="true" /> : <ChevronsUpDown size={14} aria-hidden="true" />}
            {pinned ? "Stack" : "Show all"}
          </button>
        ) : null}
        {list.length ? <button type="button" className={styles.tool} onClick={clear}>Clear all</button> : null}
      </header>

      <div className={styles.zone} onPointerEnter={onPointerEnter} onPointerLeave={() => setHovered(false)} onFocus={onFocus} onBlur={onBlur}>
        <motion.ul className={styles.list} initial={{ height: listHeight }} animate={{ height: listHeight }} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.smooth}>
          <AnimatePresence initial>
            {list.map((item, index) => (
              <Item key={item.id} item={item} index={index} slot={slots[index]!} front={index === 0} fanned={fanned} direction={direction} onHeight={onHeight} onDismiss={dismiss} onKeyDismiss={dismissByKey} />
            ))}
          </AnimatePresence>
        </motion.ul>
        {/* On touch there is no hover: a tap on the pile fans it out. */}
        {!fanned && list.length > 1 ? <button type="button" className={styles.reveal} tabIndex={-1} aria-hidden="true" onClick={() => setPinned(true)} /> : null}
      </div>

      <AnimatePresence initial={false}>
        {list.length === 0 ? (
          <motion.div key="empty" className={styles.empty} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ ...motionTokens.spring.gentle, delay: reduceMotion ? 0 : 0.18 }}>
            <span className={styles.emptyIcon}><BellOff size={18} aria-hidden="true" /></span>
            <p className={styles.emptyTitle}>You are all caught up</p>
            <p className={styles.emptyBody}>New notifications will pile up here.</p>
            <button type="button" className={styles.restore} data-restore onClick={() => commit(initial.current)}>Bring them back</button>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <p className={styles.srOnly} role="status">{list.length === 0 ? "No notifications" : `${list.length} notifications`}</p>
    </section>
  );
}

/** Ready preview: the stack on a quiet stage, with room underneath to fan out. */
export function NotificationStackPreview() {
  return (
    <div className={styles.preview}>
      <NotificationStack />
      <p className={styles.hint}>Hover or tab into the pile to fan it out. Swipe a card sideways, press its close button, or hit Delete to dismiss it.</p>
    </div>
  );
}

export default NotificationStackPreview;
