"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { Archive, Check, ChevronUp, Copy, Download, FolderInput, RotateCcw, Share2, Star, Tag, Trash2 } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import { photos } from "@/lib/media";
import styles from "./expandable-action-bar.module.css";

export interface BarAction {
  /** Unique id, passed to `onAction`. */
  id: string;
  /** Visible name: the tile's text when expanded, the button's accessible name when compact. */
  label: string;
  /** Icon, about 18 px. */
  icon: ReactNode;
  /** Primary actions stay visible in the compact pill. Keep them to three or four. */
  primary?: boolean;
  /** `danger` tints a destructive action. */
  tone?: "danger";
}

export interface BarShortcut {
  /** Unique id, passed to `onShortcut`. */
  id: string;
  /** Text on the chip. */
  label: string;
}

export interface ExpandableActionBarProps {
  /** Short text at the start of the bar, such as "3 selected". It crossfades when it changes. */
  label?: string;
  /** Every action, in order. Defaults to sample file actions. */
  actions?: BarAction[];
  /** Chips of the secondary row, shown when the bar is expanded. Leave empty to drop the row. */
  shortcuts?: BarShortcut[];
  /** Text before the secondary row's chips. */
  shortcutsLabel?: string;
  /** Whether the bar is expanded. Pass it with `onExpandedChange` to control it. */
  expanded?: boolean;
  /** Whether the bar starts expanded when uncontrolled. */
  defaultExpanded?: boolean;
  /** Called when the toggle or Escape expands or collapses the bar. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Called with the id of the action that was pressed. */
  onAction?: (id: string) => void;
  /** Called with the id of the secondary chip that was pressed. */
  onShortcut?: (id: string) => void;
  /** Widest the expanded bar gets, in px. It never grows past the space the component is given. */
  width?: number;
  /** Extra class for the root box. */
  className?: string;
}

export const sampleActions: BarAction[] = [
  { id: "share", label: "Share", icon: <Share2 size={18} />, primary: true },
  { id: "download", label: "Download", icon: <Download size={18} />, primary: true },
  { id: "delete", label: "Delete", icon: <Trash2 size={18} />, primary: true, tone: "danger" },
  { id: "duplicate", label: "Duplicate", icon: <Copy size={18} /> },
  { id: "move", label: "Move", icon: <FolderInput size={18} /> },
  { id: "tag", label: "Tag", icon: <Tag size={18} /> },
  { id: "favorite", label: "Favorite", icon: <Star size={18} /> },
  { id: "archive", label: "Archive", icon: <Archive size={18} /> },
];
export const sampleShortcuts: BarShortcut[] = [{ id: "inbox", label: "Inbox" }, { id: "design", label: "Design" }, { id: "marketing", label: "Marketing" }, { id: "clients", label: "Client work" }, { id: "2024", label: "Archive 2024" }];

/** Floating action bar: a compact pill of the main actions that grows upward into a labeled grid of every action plus a secondary row, with the icons gliding to their new places. */
export function ExpandableActionBar({ label, actions = sampleActions, shortcuts = sampleShortcuts, shortcutsLabel = "Move to", expanded, defaultExpanded = false, onExpandedChange, onAction, onShortcut, width = 416, className }: ExpandableActionBarProps) {
  const reduceMotion = useReducedMotion();
  const [internal, setInternal] = useState(defaultExpanded);
  const [room, setRoom] = useState(width);
  // Size of the bar's window. Motion values, so the first measurement lands without animating and later ones spring.
  const barWidth = useMotionValue(56), barHeight = useMotionValue(56);
  const target = useRef({ width: 0, height: 0 });
  const still = useRef(reduceMotion);
  still.current = reduceMotion;
  const root = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const open = expanded ?? internal;
  const setOpen = (next: boolean) => { if (expanded === undefined) setInternal(next); onExpandedChange?.(next); };
  const shown = open ? actions : actions.filter(action => action.primary);

  // The bar is a window onto its content: the content takes its natural size at once, and the window springs to it.
  useLayoutEffect(() => {
    const frame = root.current, content = inner.current;
    if (!frame || !content) return;
    const measure = () => {
      setRoom(frame.clientWidth);
      // Two extra px for the bar's own border.
      const width = content.offsetWidth + 2, height = content.offsetHeight + 2;
      // The root resizes on every frame of the spring, so only a new target may start an animation.
      if (target.current.width === width && target.current.height === height) return;
      const first = target.current.width === 0;
      target.current = { width, height };
      if (first || still.current) { barWidth.set(width); barHeight.set(height); return; }
      const spring = { type: "spring" as const, visualDuration: 0.4, bounce: 0.16 };
      animate(barWidth, width, spring);
      animate(barHeight, height, spring);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(content);
    return () => observer.disconnect();
  }, [barWidth, barHeight]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && open) { event.preventDefault(); setOpen(false); toggle.current?.focus(); return; }
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (at + (event.key === "ArrowRight" ? 1 : buttons.length - 1)) % buttons.length;
    buttons[next]?.focus();
  };

  const glide = reduceMotion ? { duration: 0 } : { type: "spring" as const, visualDuration: 0.4, bounce: 0.16 };
  const position = reduceMotion ? false : ("position" as const);

  return (
    <div ref={root} className={[styles.root, className].filter(Boolean).join(" ")}>
      <motion.div className={styles.bar} data-expanded={open} style={{ width: barWidth, height: barHeight }}>
        <div ref={inner} className={styles.inner} data-expanded={open} role="toolbar" aria-label="Actions" aria-orientation="horizontal" style={{ width: open ? Math.min(width, room) - 2 : undefined }} onKeyDown={onKeyDown}>
          {label ? (
            <motion.p layout={position} className={styles.label} transition={glide}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={label} className={styles.labelText} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}>{label}</motion.span>
              </AnimatePresence>
            </motion.p>
          ) : null}

          <div className={styles.actions}>
            {shown.map((action, index) => (
              <button key={action.id} type="button" className={styles.action} data-tone={action.tone} aria-label={open ? undefined : action.label} title={open ? undefined : action.label} onClick={() => onAction?.(action.id)}>
                {/* Icons that exist in both states glide to their new slot; the ones that only exist expanded pop in after them. */}
                <motion.span
                  layout={position}
                  className={styles.icon}
                  aria-hidden="true"
                  initial={action.primary || reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ layout: glide, default: reduceMotion ? { duration: 0 } : { ...motionTokens.spring.snappy, delay: 0.08 + index * motionTokens.stagger.item } }}
                >
                  {action.icon}
                </motion.span>
                {open ? <motion.span className={styles.name} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { ...motionTokens.spring.gentle, delay: 0.2 + index * motionTokens.stagger.item }}>{action.label}</motion.span> : null}
              </button>
            ))}
          </div>

          <motion.button ref={toggle} layout={position} type="button" className={styles.toggle} aria-expanded={open} aria-label={open ? "Show fewer actions" : "Show all actions"} onClick={() => setOpen(!open)} transition={glide}>
            <motion.span className={styles.chevron} initial={false} animate={{ rotate: open ? 180 : 0 }} transition={glide}><ChevronUp size={18} aria-hidden="true" /></motion.span>
          </motion.button>

          {open && shortcuts.length ? (
            <motion.div className={styles.secondary} role="group" aria-label={shortcutsLabel} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { ...motionTokens.spring.gentle, delay: 0.2 }}>
              <span className={styles.secondaryLabel}>{shortcutsLabel}</span>
              <div className={styles.chips}>
                {shortcuts.map(shortcut => <button key={shortcut.id} type="button" className={styles.chip} onClick={() => onShortcut?.(shortcut.id)}>{shortcut.label}</button>)}
              </div>
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

const FILES = [
  { id: "a", name: "Coastline.jpg", image: photos[20]!.src }, { id: "b", name: "Ridges.jpg", image: photos[18]!.src }, { id: "c", name: "Arches.jpg", image: photos[8]!.src },
  { id: "d", name: "Lamp study.jpg", image: photos[1]!.src }, { id: "e", name: "Pool house.jpg", image: photos[16]!.src }, { id: "f", name: "Rooftops.jpg", image: photos[25]!.src },
];
const DONE: Record<string, string> = { share: "Link copied for", download: "Downloading", delete: "Deleted", duplicate: "Duplicated", move: "Pick a folder for", tag: "Tagged", favorite: "Added to favorites:", archive: "Archived" };

/** Ready preview: select files on a board and act on them from the bar that floats over its bottom edge. */
export function ExpandableActionBarPreview() {
  const [files, setFiles] = useState(FILES);
  const [selected, setSelected] = useState<string[]>(["a", "c", "e"]);
  const [message, setMessage] = useState<string | null>(null);
  const count = selected.length;
  const noun = (total: number) => `${total} ${total === 1 ? "file" : "files"}`;

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 1800);
    return () => window.clearTimeout(timer);
  }, [message]);

  const act = (text: string, remove: boolean) => {
    // While a confirmation is still showing for an emptied selection, there is nothing left to act on.
    if (count === 0) return;
    setMessage(text);
    if (remove) { setFiles(current => current.filter(file => !selected.includes(file.id))); setSelected([]); }
  };

  return (
    <section className={styles.preview} aria-label="Expandable action bar">
      <header className={styles.boardHeader}>
        <p className={styles.boardTitle}>Site visit, March</p>
        {files.length < FILES.length ? <button type="button" className={styles.reset} onClick={() => { setFiles(FILES); setSelected(["a", "c", "e"]); }}><RotateCcw size={13} aria-hidden="true" />Restore files</button> : <span className={styles.boardNote}>Select files to act on them</span>}
      </header>
      <ul className={styles.board}>
        {files.map(file => {
          const on = selected.includes(file.id);
          return (
            <li key={file.id}>
              <button type="button" className={styles.file} role="checkbox" aria-checked={on} aria-label={file.name} onClick={() => setSelected(current => (on ? current.filter(id => id !== file.id) : [...current, file.id]))}>
                <img src={file.image} alt="" draggable={false} />
                <span className={styles.tick} aria-hidden="true"><Check size={12} strokeWidth={3} /></span>
                <span className={styles.fileName}>{file.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className={styles.dock}>
        <AnimatePresence>
          {count > 0 || message ? (
            <motion.div key="bar" className={styles.floater} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96, transition: { duration: motionTokens.duration.fast } }} transition={motionTokens.spring.gentle}>
              <ExpandableActionBar
                label={message ?? `${count} selected`}
                onAction={id => act(`${DONE[id] ?? "Done:"} ${noun(count)}`, id === "delete" || id === "archive")}
                onShortcut={id => act(`Moved ${noun(count)} to ${sampleShortcuts.find(shortcut => shortcut.id === id)?.label ?? "folder"}`, true)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <p className={styles.srOnly} role="status">{message ?? ""}</p>
    </section>
  );
}

export default ExpandableActionBarPreview;
