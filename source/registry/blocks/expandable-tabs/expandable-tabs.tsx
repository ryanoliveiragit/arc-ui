"use client";

import { useId, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { CalendarDays, House, Inbox, Search, User } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./expandable-tabs.module.css";

export interface ExpandableTab {
  /** Stable value of the tab. */
  id: string;
  /** Text shown only while the tab is active; always the tab's accessible name. */
  label: string;
  /** Icon, always visible. */
  icon: ReactNode;
  /** Small count on the icon, for unread items and the like. */
  badge?: number;
  /** Panel shown while the tab is active. Leave it out to use the tabs as a plain switcher. */
  content?: ReactNode;
  /** A disabled tab cannot be picked and is skipped by the arrow keys. */
  disabled?: boolean;
}

export interface ExpandableTabsProps {
  /** The tabs, in order. */
  tabs: ExpandableTab[];
  /** Active tab id (controlled). */
  value?: string;
  /** Active tab id on first render (uncontrolled). Defaults to the first tab. */
  defaultValue?: string;
  /** Called with the id of the tab that was picked. */
  onValueChange?: (value: string) => void;
  /** Accessible name of the tab list. */
  label?: string;
  /** Extra class for the root. */
  className?: string;
}

const ease = [...motionTokens.ease.enter] as [number, number, number, number];
const still: Transition = { duration: 0 };

/**
 * Icon tabs that spend their width on the active tab only: its label unfolds on a spring while the others fold back to
 * icons, so five destinations fit where two labeled tabs would. Arrow keys, Home and End move between tabs.
 */
export function ExpandableTabs({ tabs, value, defaultValue, onValueChange, label = "Sections", className }: ExpandableTabsProps) {
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const [internal, setInternal] = useState(defaultValue ?? tabs[0]?.id ?? "");
  const current = value ?? internal;
  const active = tabs.find(tab => tab.id === current) ?? tabs[0];
  const spring: Transition = reduce ? still : motionTokens.spring.morph;
  const fade: Transition = reduce ? still : { duration: motionTokens.duration.standard, ease };

  const select = (id: string) => {
    if (id === current) return;
    if (value === undefined) setInternal(id);
    onValueChange?.(id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    const enabled = tabs.filter(tab => !tab.disabled);
    const index = enabled.findIndex(tab => tab.id === active?.id);
    if (!enabled.length) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + enabled.length) % enabled.length;
    const target = enabled[next];
    if (!target) return;
    select(target.id);
    event.currentTarget.querySelector<HTMLElement>(`[data-tab="${CSS.escape(target.id)}"]`)?.focus();
  };

  const hasPanels = tabs.some(tab => tab.content != null);
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      {hasPanels && active ? (
        <div className={styles.panels}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={active.id}
              role="tabpanel"
              id={`${uid}-panel-${active.id}`}
              aria-labelledby={`${uid}-tab-${active.id}`}
              className={styles.panel}
              initial={{ opacity: 0, y: reduce ? 0 : 10, filter: reduce ? "blur(0px)" : `blur(${motionTokens.blur.soft}px)` }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: reduce ? 0 : -6, filter: reduce ? "blur(0px)" : `blur(${motionTokens.blur.subtle}px)`, transition: reduce ? still : { duration: motionTokens.duration.fast, ease } }}
              transition={fade}
            >
              {active.content}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : null}
      <div className={styles.list} role="tablist" aria-label={label} aria-orientation="horizontal" onKeyDown={onKeyDown}>
        {tabs.map(tab => {
          const selected = tab.id === active?.id;
          return (
            <motion.button
              key={tab.id}
              type="button"
              role="tab"
              id={`${uid}-tab-${tab.id}`}
              data-tab={tab.id}
              data-active={selected ? "" : undefined}
              aria-selected={selected}
              aria-controls={hasPanels && selected ? `${uid}-panel-${tab.id}` : undefined}
              aria-label={tab.badge ? `${tab.label}, ${tab.badge} new` : tab.label}
              tabIndex={selected ? 0 : -1}
              disabled={tab.disabled}
              className={styles.tab}
              onClick={() => select(tab.id)}
              whileTap={reduce || tab.disabled ? undefined : { scale: .94 }}
              transition={motionTokens.spring.snappy}
            >
              <span className={styles.fill} aria-hidden="true" />
              <motion.span className={styles.icon} aria-hidden="true" animate={{ scale: selected && !reduce ? [1, 1.16, 1] : 1 }} transition={reduce ? still : { duration: .36, ease }}>
                {tab.icon}
                {tab.badge ? <span className={styles.badge}>{tab.badge > 9 ? "9+" : tab.badge}</span> : null}
              </motion.span>
              <AnimatePresence initial={false}>
                {selected ? (
                  <motion.span key="label" className={styles.label} aria-hidden="true" initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ width: spring, opacity: fade }}>
                    <motion.span className={styles.labelText} initial={{ x: reduce ? 0 : -8 }} animate={{ x: 0 }} exit={{ x: reduce ? 0 : -8 }} transition={spring}>{tab.label}</motion.span>
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

interface Screen { title: string; note: string; rows: { primary: string; secondary: string; meta: string }[] }
const screens: Record<string, Screen> = {
  home: { title: "Good morning, Maya", note: "Three things need you today.", rows: [{ primary: "Review Q3 roadmap", secondary: "Product · due 11:00", meta: "Soon" }, { primary: "Approve travel request", secondary: "Jordan Reyes · Lisbon offsite", meta: "New" }, { primary: "Weekly numbers", secondary: "Signups up 12% on last week", meta: "Read" }] },
  search: { title: "Search", note: "Pick up where you left off.", rows: [{ primary: "onboarding checklist", secondary: "12 documents", meta: "2h ago" }, { primary: "invoice 2041", secondary: "1 invoice · 3 emails", meta: "Mon" }, { primary: "brand colors", secondary: "Design library", meta: "Fri" }] },
  inbox: { title: "Inbox", note: "3 unread conversations.", rows: [{ primary: "Emma Collins", secondary: "The new empty states are ready for review.", meta: "9:42" }, { primary: "Daniel Kim", secondary: "Deploy finished, all checks green.", meta: "9:10" }, { primary: "Sofia Ramirez", secondary: "Can we move the sync to Thursday?", meta: "8:55" }] },
  calendar: { title: "Wednesday", note: "A light day with one long block.", rows: [{ primary: "Design critique", secondary: "Studio room · 45 min", meta: "10:00" }, { primary: "Focus time", secondary: "Notifications paused", meta: "13:00" }, { primary: "1:1 with Andre", secondary: "Video call · 30 min", meta: "16:30" }] },
  profile: { title: "Maya Okafor", note: "Product lead · Team plan", rows: [{ primary: "Notifications", secondary: "Mentions and direct messages", meta: "On" }, { primary: "Appearance", secondary: "Follows the system theme", meta: "Auto" }, { primary: "Two-step sign in", secondary: "Authenticator app", meta: "On" }] },
};

function ScreenView({ screen }: { screen: Screen }) {
  const reduce = useReducedMotion() ?? false;
  return (
    <div className={styles.screen}>
      <h3 className={styles.screenTitle}>{screen.title}</h3>
      <p className={styles.screenNote}>{screen.note}</p>
      <ul className={styles.rows}>
        {screen.rows.map((row, index) => (
          <motion.li key={row.primary} className={styles.row} initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? still : { duration: motionTokens.duration.standard, ease, delay: .06 + index * motionTokens.stagger.item }}>
            <span className={styles.rowText}><span className={styles.rowPrimary}>{row.primary}</span><span className={styles.rowSecondary}>{row.secondary}</span></span>
            <span className={styles.rowMeta}>{row.meta}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

const previewTabs: ExpandableTab[] = [
  { id: "home", label: "Home", icon: <House size={19} />, content: <ScreenView screen={screens.home!} /> },
  { id: "search", label: "Search", icon: <Search size={19} />, content: <ScreenView screen={screens.search!} /> },
  { id: "inbox", label: "Inbox", icon: <Inbox size={19} />, badge: 3, content: <ScreenView screen={screens.inbox!} /> },
  { id: "calendar", label: "Calendar", icon: <CalendarDays size={19} />, content: <ScreenView screen={screens.calendar!} /> },
  { id: "profile", label: "Profile", icon: <User size={19} />, content: <ScreenView screen={screens.profile!} /> },
];

/** Ready preview: a compact app screen with five destinations in its bottom bar. */
export default function ExpandableTabsPreview() {
  return (
    <section className={styles.preview}>
      <div className={styles.device}>
        <ExpandableTabs tabs={previewTabs} defaultValue="inbox" label="App sections" />
      </div>
    </section>
  );
}
