"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { Transition, Variants } from "motion/react";
import { FileText, FolderOpen, Image as ImageIcon, Sheet } from "lucide-react";
import { person } from "@/lib/media";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./morphing-tabs.module.css";

export interface MorphingTab {
  /** Stable value of the tab. */
  id: string;
  /** Tab text. */
  label: string;
  /** Optional icon before the label. */
  icon?: ReactNode;
  /** Panel shown while the tab is active. */
  content: ReactNode;
  /** A disabled tab cannot be picked and is skipped by the arrow keys. */
  disabled?: boolean;
}

export interface MorphingTabsProps {
  /** The tabs, in order. */
  tabs: MorphingTab[];
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

/** Space between the list edge and the pill at rest, in px. Keep in sync with the list padding in the CSS. */
const INSET = 4;
/** How much the pill thins, at most, while it is stretched between two tabs. */
const SQUEEZE = 5;
/** The edge that leads the move arrives first; the other one follows, which is what stretches the pill. */
const lead: Transition = { type: "spring", visualDuration: .24, bounce: 0 };
const follow: Transition = { type: "spring", visualDuration: .46, bounce: .14 };
const ease = [...motionTokens.ease.enter] as [number, number, number, number];
const still: Transition = { duration: 0 };

const panelVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 36, filter: `blur(${motionTokens.blur.soft}px)` }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (direction: number) => ({ opacity: 0, x: direction * -36, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease } }),
};
const fadeVariants: Variants = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };

/**
 * Tabs with a liquid active pill. The pill is a clipped copy of the tab row in the accent color, so the label under it
 * inverts exactly at its edge. When the selection moves, the leading edge springs ahead and the trailing edge follows:
 * the pill stretches, thins and squares off on the way, then settles back into a pill at the new width. The panel
 * leaves and enters along the same direction.
 */
export function MorphingTabs({ tabs, value, defaultValue, onValueChange, label = "Sections", className }: MorphingTabsProps) {
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const [internal, setInternal] = useState(defaultValue ?? tabs[0]?.id ?? "");
  const current = value ?? internal;
  const activeIndex = Math.max(0, tabs.findIndex(tab => tab.id === current));
  const active = tabs[activeIndex];
  const previous = useRef(activeIndex);
  const [direction, setDirection] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const placed = useRef(false);
  /** Distance of the pill's left and right edges from the list's edges, plus the width it is heading for. */
  const left = useMotionValue(0);
  const right = useMotionValue(0);
  const rest = useRef({ width: 0, height: 0, list: 0 });
  // The further the pill is stretched beyond its resting width, the thinner and squarer it gets.
  const stretch = useTransform(() => {
    if (!rest.current.width) return 0;
    const width = rest.current.list - left.get() - right.get();
    return Math.min(Math.max((width - rest.current.width) / 90, 0), 1);
  });
  const block = useTransform(() => INSET + stretch.get() * SQUEEZE);
  const radius = useTransform(() => { const full = rest.current.height / 2 || 999; return full - stretch.get() * (full - 9); });
  const clipPath = useMotionTemplate`inset(${block}px ${right}px ${block}px ${left}px round ${radius}px)`;

  const place = useCallback((animated: boolean) => {
    const list = listRef.current;
    const tab = list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!list || !tab) return;
    // Label widths are fractional, so the rounded offset* values would leave the pill a pixel off.
    const listBox = list.getBoundingClientRect(), tabBox = tab.getBoundingClientRect();
    const nextLeft = tabBox.left - listBox.left, nextRight = listBox.right - tabBox.right;
    rest.current = { width: tabBox.width, height: tabBox.height, list: listBox.width };
    if (!animated) { left.jump(nextLeft); right.jump(nextRight); return; }
    const forward = nextLeft > left.get();
    animate(left, nextLeft, forward ? follow : lead);
    animate(right, nextRight, forward ? lead : follow);
  }, [left, right]);

  useLayoutEffect(() => {
    place(placed.current && !reduce);
    placed.current = true;
  }, [place, reduce, current, tabs]);

  useLayoutEffect(() => {
    const list = listRef.current, content = contentRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === list) place(false);
        else setHeight(Math.round((entry.target as HTMLElement).offsetHeight));
      }
    });
    observer.observe(list);
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, [place]);

  const select = (id: string) => {
    if (id === current) return;
    const index = tabs.findIndex(tab => tab.id === id);
    setDirection(index > previous.current ? 1 : -1);
    previous.current = index;
    if (value === undefined) setInternal(id);
    onValueChange?.(id);
  };
  // A controlled value can change from outside; keep the direction right for that case too.
  if (previous.current !== activeIndex) { setDirection(activeIndex > previous.current ? 1 : -1); previous.current = activeIndex; }

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

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.scroller}>
        <div ref={listRef} className={styles.list} role="tablist" aria-label={label} aria-orientation="horizontal" onKeyDown={onKeyDown}>
          {tabs.map(tab => {
            const selected = tab.id === active?.id;
            return (
              <button key={tab.id} type="button" role="tab" id={`${uid}-tab-${tab.id}`} data-tab={tab.id} aria-selected={selected} aria-controls={selected ? `${uid}-panel-${tab.id}` : undefined} tabIndex={selected ? 0 : -1} disabled={tab.disabled} className={styles.tab} onClick={() => select(tab.id)}>
                {tab.icon ? <span className={styles.icon} aria-hidden="true">{tab.icon}</span> : null}
                {tab.label}
              </button>
            );
          })}
          {/* The same row again in the accent color; the clip path is the pill. */}
          <motion.div className={styles.overlay} aria-hidden="true" style={{ clipPath }}>
            {tabs.map(tab => (
              <span key={tab.id} className={styles.tab}>
                {tab.icon ? <span className={styles.icon}>{tab.icon}</span> : null}
                {tab.label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
      <motion.div className={styles.panels} initial={false} animate={height == null ? undefined : { height }} transition={reduce ? still : motionTokens.spring.smooth}>
        <div ref={contentRef} className={styles.panelsInner}>
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            {active ? (
              <motion.div key={active.id} role="tabpanel" id={`${uid}-panel-${active.id}`} aria-labelledby={`${uid}-tab-${active.id}`} tabIndex={0} className={styles.panel} custom={direction} variants={reduce ? fadeVariants : panelVariants} initial="enter" animate="center" exit="exit" transition={reduce ? still : { duration: motionTokens.duration.considered * .75, ease }}>
                {active.content}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function Overview() {
  const stats = [{ label: "Revenue", value: "$48.2k", change: "+12.4%" }, { label: "Active users", value: "3,214", change: "+4.1%" }, { label: "Churn", value: "1.8%", change: "−0.3%" }];
  return (
    <div className={styles.stack}>
      <p className={styles.lead}>October closed above plan. Growth came from the team tier, and churn fell for the third month.</p>
      <dl className={styles.stats}>
        {stats.map(stat => <div key={stat.label} className={styles.stat}><dt>{stat.label}</dt><dd>{stat.value}<span>{stat.change}</span></dd></div>)}
      </dl>
    </div>
  );
}

function Activity() {
  const events = [{ what: "Pricing page shipped", who: "Emma Collins", when: "2h ago" }, { what: "Invoice INV-2041 paid", who: "Billing", when: "5h ago" }, { what: "12 seats added to Northwind", who: "Tyler Hayes", when: "Yesterday" }, { what: "SSO enabled for the workspace", who: "Daniel Kim", when: "Mon" }];
  return (
    <ol className={styles.timeline}>
      {events.map(event => <li key={event.what} className={styles.event}><span className={styles.eventDot} aria-hidden="true" /><span className={styles.eventText}><strong>{event.what}</strong><span>{event.who}</span></span><time>{event.when}</time></li>)}
    </ol>
  );
}

function Team() {
  const members = [person("emma-collins"), person("daniel-kim"), person("sofia-ramirez")];
  return (
    <ul className={styles.members}>
      {members.map(member => <li key={member.id} className={styles.member}><img src={member.src} alt="" width={36} height={36} /><span className={styles.eventText}><strong>{member.name}</strong><span>{member.role}</span></span><span className={styles.chip}>Editor</span></li>)}
    </ul>
  );
}

function Files() {
  const files = [{ name: "Q3 board deck.pdf", size: "4.2 MB", icon: <FileText size={17} /> }, { name: "Pricing model.xlsx", size: "310 KB", icon: <Sheet size={17} /> }, { name: "Launch visuals", size: "18 items", icon: <FolderOpen size={17} /> }, { name: "Homepage hero.png", size: "1.1 MB", icon: <ImageIcon size={17} /> }, { name: "Customer interviews.pdf", size: "860 KB", icon: <FileText size={17} /> }];
  return (
    <ul className={styles.files}>
      {files.map(file => <li key={file.name} className={styles.file}><span className={styles.fileIcon} aria-hidden="true">{file.icon}</span><strong>{file.name}</strong><span>{file.size}</span></li>)}
    </ul>
  );
}

const previewTabs: MorphingTab[] = [
  { id: "overview", label: "Overview", content: <Overview /> },
  { id: "activity", label: "Activity", content: <Activity /> },
  { id: "team", label: "Team", content: <Team /> },
  { id: "files", label: "Files", content: <Files /> },
];

/** Ready preview: a workspace card with four sections of different heights. */
export default function MorphingTabsPreview() {
  return (
    <section className={styles.preview}>
      <div className={styles.card}>
        <header className={styles.cardHeader}>
          <h3>Northwind workspace</h3>
          <p>Team plan · 24 seats</p>
        </header>
        <MorphingTabs tabs={previewTabs} label="Workspace sections" />
      </div>
    </section>
  );
}
