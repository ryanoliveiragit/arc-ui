"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { ChevronDown } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./todo-list.module.css";

export type TodoStatus = "pending" | "running" | "done";

export interface TodoItem {
  /** Stable id, used as the key. */
  id: string;
  /** What the step does. */
  label: string;
  /** Where the step stands. */
  status: TodoStatus;
  /** A line shown under the label while the step runs, such as the file being read. */
  detail?: string;
}

/**
 * The plan an agent is working through. Each step moves from pending to running (a spinner and a shimmer on its label) to done
 * (the check draws itself and the label is struck through), while the header counts progress. The header folds the list away
 * and then shows the step in progress.
 */
export interface TodoListProps {
  /** The steps, in order. Change an item's `status` to move it along. */
  items: TodoItem[];
  /** Heading of the list. */
  title?: string;
  /** Shows the "2 of 5" count and the progress bar. */
  showProgress?: boolean;
  /** Controlled open state of the list. */
  open?: boolean;
  /** Whether the list starts open when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the header is pressed. */
  onOpenChange?: (open: boolean) => void;
  /** Extra class for the root element. */
  className?: string;
}

const statusText: Record<TodoStatus, string> = { pending: "To do", running: "In progress", done: "Done" };
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const enterEase = [...motionTokens.ease.enter] as [number, number, number, number];
const fade: Transition = { duration: motionTokens.duration.fast, ease: standard };
/** The check lands with a small bounce: finishing a step is the one moment worth a little celebration. */
const land: Transition = { type: "spring", visualDuration: 0.32, bounce: 0.32 };

function Mark({ status, reduce }: { status: TodoStatus; reduce: boolean }) {
  return (
    <span className={styles.mark} data-status={status} aria-hidden="true">
      <AnimatePresence mode="popLayout" initial={false}>
        {status === "done" ? (
          <motion.span key="done" className={styles.done} initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, transition: fade }} transition={reduce ? fade : { ...land, opacity: fade }}>
            <svg viewBox="0 0 16 16"><motion.path d="M4.2 8.3 7 11 11.9 5.4" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: motionTokens.duration.standard, ease: standard, delay: 0.1 }} /></svg>
          </motion.span>
        ) : status === "running" ? (
          <motion.span key="running" className={styles.running} initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, transition: fade }} transition={reduce ? fade : motionTokens.spring.snappy}><span className={styles.spinner} /></motion.span>
        ) : (
          <motion.span key="pending" className={styles.pending} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: fade }} transition={fade} />
        )}
      </AnimatePresence>
    </span>
  );
}

export function TodoList({ items, title = "Plan", showProgress = true, open, defaultOpen = true, onOpenChange, className }: TodoListProps) {
  const reduce = !!useReducedMotion();
  const listId = useId();
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const isOpen = open ?? ownOpen;
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; }, []);
  const total = items.length;
  const done = items.filter(item => item.status === "done").length;
  const current = items.find(item => item.status === "running");
  const summary = current?.label ?? (total > 0 && done === total ? "All steps done" : items.find(item => item.status === "pending")?.label ?? "");
  const roll = reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : { initial: { opacity: 0, y: "70%" }, animate: { opacity: 1, y: "0%" }, exit: { opacity: 0, y: "-70%" } };
  const swap = reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : { initial: { opacity: 0, y: "0.4em", filter: `blur(${motionTokens.blur.soft}px)` }, animate: { opacity: 1, y: "0em", filter: "blur(0px)" }, exit: { opacity: 0, y: "-0.4em", filter: `blur(${motionTokens.blur.subtle}px)` } };

  function toggle() {
    if (open === undefined) setOwnOpen(!isOpen);
    onOpenChange?.(!isOpen);
  }

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} data-complete={total > 0 && done === total ? "" : undefined}>
      <button type="button" className={styles.header} aria-expanded={isOpen} aria-controls={listId} onClick={toggle}>
        <span className={styles.heading}>
          <span className={styles.title}>{title}</span>
          {/* Folded, the header carries the step in progress, so the plan still says what is happening. */}
          <AnimatePresence mode="popLayout" initial={false}>
            {!isOpen && summary ? <motion.span key={summary} className={styles.summary} data-status={current ? "running" : undefined} {...swap} transition={{ duration: motionTokens.duration.standard, ease: enterEase }}><span className={styles.shine}>{summary}</span></motion.span> : null}
          </AnimatePresence>
        </span>
        {showProgress ? (
          <span className={styles.count} aria-live="polite" aria-atomic="true">
            <span className={styles.srOnly}>{done} of {total} steps done</span>
            <span className={styles.digits} aria-hidden="true">
              <AnimatePresence mode="popLayout" initial={false}><motion.span key={done} className={styles.digit} {...roll} transition={fade}>{done}</motion.span></AnimatePresence>
            </span>
            <span aria-hidden="true"> of {total}</span>
          </span>
        ) : null}
        <ChevronDown className={styles.chevron} width={16} height={16} strokeWidth={2} aria-hidden="true" />
      </button>
      {showProgress ? (
        <div className={styles.track} role="progressbar" aria-label={`${title} progress`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
          <motion.span className={styles.fill} initial={false} animate={{ scaleX: total ? done / total : 0 }} transition={reduce ? { duration: 0 } : motionTokens.spring.smooth} />
        </div>
      ) : null}
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div key="list" id={listId} className={styles.region} initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={reduce ? fade : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: standard } }}>
            <ol className={styles.list}>
              <AnimatePresence initial>
                {items.map((item, index) => (
                  <motion.li
                    key={item.id}
                    className={styles.item}
                    data-status={item.status}
                    // First paint: steps rise in one after another. Steps added later open their own height instead.
                    initial={reduce ? { opacity: 0 } : mounted.current ? { opacity: 0, height: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={reduce ? fade : { ...motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: enterEase }, delay: mounted.current ? 0 : Math.min(index * motionTokens.stagger.item, 0.4) }}
                  >
                    <div className={styles.row}>
                      <Mark status={item.status} reduce={reduce} />
                      <div className={styles.copy}>
                        <p className={styles.label}><span className={styles.srOnly}>{statusText[item.status]}: </span><span className={styles.strike}><span className={styles.shine}>{item.label}</span></span></p>
                        <AnimatePresence initial={false}>
                          {item.status === "running" && item.detail ? (
                            <motion.p key="detail" className={styles.detail} initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={reduce ? fade : { height: motionTokens.spring.smooth, opacity: fade }}><span>{item.detail}</span></motion.p>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export default TodoList;
