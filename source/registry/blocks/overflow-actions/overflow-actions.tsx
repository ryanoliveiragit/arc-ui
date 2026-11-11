"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { Bold, Code, Ellipsis, GripVertical, Image, Italic, Link, List, ListOrdered, Quote, Strikethrough, Underline } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./overflow-actions.module.css";

export interface OverflowAction {
  /** Stable key; also passed to `onAction`. */
  id: string;
  /** Visible text in the bar and in the menu. */
  label: string;
  /** Icon shown before the label. */
  icon?: ReactNode;
  /** Marks a toggle as on (`aria-pressed` in the bar, a check state in the menu). Leave undefined for plain actions. */
  pressed?: boolean;
  /** Disabled actions stay in place but cannot be used. */
  disabled?: boolean;
  /** Runs when the action is used, from the bar or from the menu. */
  onSelect?: () => void;
}

export interface OverflowActionsProps {
  /** Actions in priority order: the last ones move into the menu first. */
  actions: OverflowAction[];
  /** Accessible name of the toolbar. */
  label?: string;
  /** Accessible name of the "more" button. */
  moreLabel?: string;
  /** Called with the action id whenever an action is used. */
  onAction?: (id: string) => void;
  /** Called when the set of actions that moved into the menu changes. */
  onOverflowChange?: (hiddenIds: string[]) => void;
  /** Extra class for the toolbar root. */
  className?: string;
}

const fadeEase = [...motionTokens.ease.standard] as [number, number, number, number];
const still: Transition = { duration: 0 };

/**
 * A toolbar that always fits. It measures every action once in a hidden row, then shows as many as the current width
 * allows and moves the rest into a "more" menu. Buttons leave and return with a short scale, and the "more" button
 * glides to its new place on a layout spring.
 */
export function OverflowActions({ actions, label = "Actions", moreLabel = "More actions", onAction, onOverflowChange, className }: OverflowActionsProps) {
  const reduce = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(actions.length);
  const [roving, setRoving] = useState<string | null>(null);
  const spring: Transition = reduce ? still : motionTokens.spring.morph;
  const pop: Transition = reduce ? still : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: fadeEase } };

  const fit = useCallback(() => {
    const root = rootRef.current, row = measureRef.current;
    if (!root || !row) return;
    const cells = Array.from(row.children) as HTMLElement[];
    const more = cells.pop();
    if (!more) return;
    const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0;
    const widths = cells.map(cell => Math.ceil(cell.getBoundingClientRect().width));
    const available = root.clientWidth;
    const all = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(widths.length - 1, 0);
    let next = widths.length;
    if (all > available) {
      let used = Math.ceil(more.getBoundingClientRect().width);
      next = 0;
      for (const width of widths) {
        if (used + gap + width > available) break;
        used += gap + width;
        next++;
      }
    }
    setCount(current => (current === next ? current : next));
  }, []);

  useLayoutEffect(() => {
    fit();
    const root = rootRef.current, row = measureRef.current;
    if (!root || !row || typeof ResizeObserver === "undefined") return;
    // The root reports width changes; the hidden row reports label or font changes.
    const observer = new ResizeObserver(fit);
    observer.observe(root);
    observer.observe(row);
    return () => observer.disconnect();
  }, [fit, actions]);

  const shown = actions.slice(0, count);
  const hidden = actions.slice(count);
  const hiddenKey = hidden.map(action => action.id).join("|");
  const notify = useRef(onOverflowChange);
  notify.current = onOverflowChange;
  useEffect(() => { notify.current?.(hiddenKey ? hiddenKey.split("|") : []); }, [hiddenKey]);

  const run = (action: OverflowAction) => { action.onSelect?.(); onAction?.(action.id); };
  const tabStop = shown.some(action => action.id === roving) ? roving : shown[0]?.id ?? "__more";

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    const stops = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-stop]:not(:disabled)"));
    const index = stops.indexOf(document.activeElement as HTMLElement);
    if (index === -1 || !stops.length) return;
    event.preventDefault();
    const target = event.key === "Home" ? 0 : event.key === "End" ? stops.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + stops.length) % stops.length;
    stops[target]?.focus();
  };

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.bar} role="toolbar" aria-label={label} aria-orientation="horizontal" onKeyDown={onKeyDown}>
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map(action => (
            <motion.button
              key={action.id}
              layout="position"
              type="button"
              className={styles.action}
              data-stop=""
              data-pressed={action.pressed ? "" : undefined}
              aria-pressed={action.pressed}
              disabled={action.disabled}
              tabIndex={tabStop === action.id ? 0 : -1}
              onFocus={() => setRoving(action.id)}
              onClick={() => run(action)}
              initial={{ opacity: 0, scale: reduce ? 1 : .8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : .8 }}
              transition={{ ...pop, layout: spring }}
            >
              {action.icon ? <span className={styles.icon} aria-hidden="true">{action.icon}</span> : null}
              <span>{action.label}</span>
            </motion.button>
          ))}
          {hidden.length ? (
            <motion.div key="__more" layout="position" className={styles.moreSlot} initial={{ opacity: 0, scale: reduce ? 1 : .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduce ? 1 : .8 }} transition={{ ...pop, layout: spring }}>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className={styles.more} data-stop="" aria-label={`${moreLabel} (${hidden.length})`} tabIndex={tabStop === "__more" ? 0 : -1} onFocus={() => setRoving("__more")}>
                  <Ellipsis size={17} strokeWidth={2} aria-hidden="true" />
                  <span className={styles.count} aria-hidden="true">
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.span key={hidden.length} className={styles.countValue} initial={{ opacity: 0, y: reduce ? 0 : "55%" }} animate={{ opacity: 1, y: "0%" }} exit={{ opacity: 0, y: reduce ? 0 : "-55%" }} transition={pop}>{hidden.length}</motion.span>
                    </AnimatePresence>
                  </span>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className={styles.menu} align="end" sideOffset={8} collisionPadding={12}>
                    {hidden.map((action, index) => (
                      <DropdownMenu.Item key={action.id} className={styles.item} style={{ "--i": index } as CSSProperties} disabled={action.disabled} data-pressed={action.pressed ? "" : undefined} onSelect={() => run(action)}>
                        {action.icon ? <span className={styles.icon} aria-hidden="true">{action.icon}</span> : null}
                        <span className={styles.itemLabel}>{action.label}</span>
                        {action.pressed ? <span className={styles.dot}><span className={styles.srOnly}>On</span></span> : null}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      {/* Every action plus the "more" button at natural size, only to be measured. */}
      <div ref={measureRef} className={styles.measure} aria-hidden="true" inert>
        {actions.map(action => (
          <span key={action.id} className={styles.action}>
            {action.icon ? <span className={styles.icon}>{action.icon}</span> : null}
            <span>{action.label}</span>
          </span>
        ))}
        <span className={styles.more}><Ellipsis size={17} strokeWidth={2} /><span className={styles.count}><span className={styles.countValue}>{actions.length}</span></span></span>
      </div>
    </div>
  );
}

type Format = "bold" | "italic" | "underline" | "strike" | "quote" | "code";
const presets = [{ id: "phone", label: "Phone", width: 300 }, { id: "tablet", label: "Tablet", width: 520 }, { id: "desktop", label: "Desktop", width: 760 }];
const MIN_WIDTH = 220;

/** Ready preview: a small editor whose toolbar you can resize with the handle, the arrow keys or the width presets. */
export default function OverflowActionsPreview() {
  const reduce = useReducedMotion() ?? false;
  const [formats, setFormats] = useState<Record<Format, boolean>>({ bold: true, italic: false, underline: false, strike: false, quote: false, code: false });
  const [last, setLast] = useState("Nothing yet");
  const [hiddenCount, setHiddenCount] = useState(0);
  const [shownWidth, setShownWidth] = useState(520);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const width = useMotionValue(520);
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  const limit = () => stageRef.current?.clientWidth ?? 760;
  const resize = (target: number, animated: boolean) => {
    const next = Math.round(Math.min(Math.max(target, MIN_WIDTH), limit()));
    setShownWidth(next);
    if (animated && !reduce) animate(width, next, motionTokens.spring.smooth); else width.set(next);
  };
  // Start from what actually fits, so the handle and the readout agree on a narrow screen.
  useLayoutEffect(() => { const fits = Math.min(520, limit()); width.set(fits); setShownWidth(fits); }, [width]);

  const toggle = (format: Format) => setFormats(current => ({ ...current, [format]: !current[format] }));
  const action = (id: string, label: string, icon: ReactNode, format?: Format): OverflowAction => ({ id, label, icon, pressed: format ? formats[format] : undefined, onSelect: format ? () => toggle(format) : undefined });
  const actions: OverflowAction[] = [
    action("bold", "Bold", <Bold size={16} />, "bold"),
    action("italic", "Italic", <Italic size={16} />, "italic"),
    action("underline", "Underline", <Underline size={16} />, "underline"),
    action("strike", "Strike", <Strikethrough size={16} />, "strike"),
    action("link", "Link", <Link size={16} />),
    action("bullets", "Bullets", <List size={16} />),
    action("numbers", "Numbered", <ListOrdered size={16} />),
    action("quote", "Quote", <Quote size={16} />, "quote"),
    action("code", "Code", <Code size={16} />, "code"),
    action("image", "Image", <Image size={16} />),
  ];

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startWidth: frameRef.current?.offsetWidth ?? width.get() };
  };
  // The frame is centered, so the edge follows the pointer when the width grows by twice the distance.
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => { if (drag.current) resize(drag.current.startWidth + (event.clientX - drag.current.startX) * 2, false); };
  const onPointerUp = () => { drag.current = null; };
  const onHandleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" ? 32 : event.key === "ArrowLeft" ? -32 : 0;
    if (event.key === "Home") { event.preventDefault(); resize(MIN_WIDTH, true); }
    else if (event.key === "End") { event.preventDefault(); resize(limit(), true); }
    else if (step) { event.preventDefault(); resize((frameRef.current?.offsetWidth ?? width.get()) + step, true); }
  };

  return (
    <section className={styles.preview}>
      <div className={styles.presets} role="group" aria-label="Toolbar width">
        {presets.map(preset => <button key={preset.id} type="button" className={styles.preset} onClick={() => resize(preset.width, true)}>{preset.label}</button>)}
      </div>
      <div ref={stageRef} className={styles.stage}>
        <motion.div ref={frameRef} className={styles.frame} style={{ width }}>
          <div className={styles.toolbarRow}>
            <OverflowActions actions={actions} label="Formatting" onAction={id => setLast(actions.find(item => item.id === id)?.label ?? id)} onOverflowChange={ids => setHiddenCount(ids.length)} />
          </div>
          <div className={styles.page}>
            <p className={styles.sample} data-quote={formats.quote ? "" : undefined} data-code={formats.code ? "" : undefined} style={{ fontWeight: formats.bold ? 650 : 400, fontStyle: formats.italic ? "italic" : "normal", textDecorationLine: [formats.underline ? "underline" : "", formats.strike ? "line-through" : ""].join(" ").trim() || "none" }}>
              Release notes are due Thursday. Keep the summary to three lines and link the migration guide.
            </p>
            <p className={styles.status} aria-live="polite">Last action: {last} · {hiddenCount === 0 ? "everything fits" : `${hiddenCount} in the menu`} · {shownWidth}px</p>
          </div>
          <div className={styles.handle} role="separator" tabIndex={0} aria-orientation="vertical" aria-label="Resize toolbar" aria-valuemin={MIN_WIDTH} aria-valuemax={760} aria-valuenow={shownWidth} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onHandleKey}>
            <GripVertical size={14} aria-hidden="true" />
          </div>
        </motion.div>
      </div>
      <p className={styles.hint}>Drag the handle or pick a width: actions that no longer fit move into the menu.</p>
    </section>
  );
}
