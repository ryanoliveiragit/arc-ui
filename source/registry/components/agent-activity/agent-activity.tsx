"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { BookOpen, Brain, Check, ChevronDown, PenLine, Search, Terminal, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./agent-activity.module.css";

export type AgentStepKind = "search" | "read" | "write" | "think" | "run";
export type AgentStepStatus = "pending" | "running" | "done" | "error";

export interface AgentStep {
  /** Stable id of the step. */
  id: string;
  /** What kind of work the step is; it picks the icon. */
  kind: AgentStepKind;
  /** What the agent is doing, in a few words: "Searching the codebase". */
  title: string;
  /** One line of detail: the query, the file, the command. */
  detail?: string;
  /** Short things the step found or touched (file names, sites, results). They appear as chips, one by one as the list grows. */
  items?: string[];
  /** Where the step is. */
  status: AgentStepStatus;
  /** How long the step took, in milliseconds. Shown once it has finished. */
  duration?: number;
}

export interface AgentActivityProps {
  /** The steps in order. Update their status as the agent works. */
  steps: AgentStep[];
  /** Heading of the timeline: usually the task the agent was given. */
  title?: string;
  /** Whether the finished steps are shown in full (controlled). */
  expanded?: boolean;
  /** Whether the finished steps start shown in full (uncontrolled). By default they fold into one summary row. */
  defaultExpanded?: boolean;
  /** Called when the summary row opens or closes the finished steps. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Class name added to the root element. */
  className?: string;
}

const icons: Record<AgentStepKind, LucideIcon> = { search: Search, read: BookOpen, write: PenLine, think: Brain, run: Terminal };
const standard = [...motionTokens.ease.standard] as [number, number, number, number];

function formatDuration(ms: number) {
  const seconds = ms / 1000;
  if (seconds < 10) return `${seconds.toFixed(1)}s`;
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

function StepRow({ step, line, reduceMotion }: { step: AgentStep; line: boolean; reduceMotion: boolean }) {
  const Icon = step.status === "done" ? Check : step.status === "error" ? X : icons[step.kind];
  return (
    <div className={styles.step} data-status={step.status}>
      <span className={styles.rail} aria-hidden="true">
        <span className={styles.node}><Icon size={13} strokeWidth={step.status === "done" || step.status === "error" ? 2.75 : 2} /></span>
        {line ? <span className={styles.line} /> : null}
      </span>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{step.title}</span>
          {step.status === "pending" ? <span className={styles.srOnly}> (waiting)</span> : null}
          {step.status === "error" ? <span className={styles.srOnly}> (failed)</span> : null}
          {step.duration != null && (step.status === "done" || step.status === "error") ? <span className={styles.duration}>{formatDuration(step.duration)}</span> : null}
        </div>
        {step.detail ? <p className={styles.detail}>{step.detail}</p> : null}
        {step.items?.length ? (
          <ul className={styles.chips}>
            <AnimatePresence initial={false}>
              {step.items.map(item => (
                <motion.li key={item} className={styles.chip} initial={reduceMotion ? false : { opacity: 0, scale: 0.8, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={motionTokens.spring.snappy}>{item}</motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/**
 * A live timeline of what an agent is doing. The step in progress pulses and collects what it finds as chips; a step that finishes
 * leaves the live list and folds into one summary row that counts steps and time, which opens to show them again.
 */
export function AgentActivity({ steps, title = "Agent activity", expanded, defaultExpanded = false, onExpandedChange, className }: AgentActivityProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const regionId = useId();
  const [internal, setInternal] = useState(defaultExpanded);
  const isExpanded = expanded ?? internal;
  const finished = steps.filter(step => step.status === "done" || step.status === "error");
  const live = steps.filter(step => step.status === "running" || step.status === "pending");
  const running = steps.find(step => step.status === "running");
  const failed = finished.filter(step => step.status === "error").length;
  const allDone = steps.length > 0 && live.length === 0;
  const elapsed = finished.reduce((sum, step) => sum + (step.duration ?? 0), 0);
  const fold: Transition = reduceMotion ? { duration: 0 } : motionTokens.spring.smooth;
  const toggle = () => { const next = !isExpanded; if (expanded === undefined) setInternal(next); onExpandedChange?.(next); };

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} aria-label={title} data-state={allDone ? "done" : running ? "running" : "idle"}>
      <header className={styles.header}>
        <span className={styles.state} aria-hidden="true">
          <AnimatePresence initial={false} mode="popLayout">
            {allDone ? (
              <motion.span key="done" className={styles.stateDone} initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={motionTokens.spring.snappy}><Check size={12} strokeWidth={3} /></motion.span>
            ) : (
              <motion.span key="spin" className={styles.spinner} data-active={Boolean(running)} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: motionTokens.duration.instant }} />
            )}
          </AnimatePresence>
        </span>
        <h3 className={styles.heading}>{title}</h3>
        <span className={styles.tally} aria-label={`${finished.length} of ${steps.length} steps finished`}>
          {allDone ? "Done" : <><span className={styles.tallyNow}>{finished.length}</span> / {steps.length}</>}
        </span>
      </header>

      <div className={styles.timeline}>
        <AnimatePresence initial={false}>
          {finished.length > 0 ? (
            <motion.div key="summary" className={styles.fold} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={fold}>
              <div className={styles.step} data-status="summary">
                <span className={styles.rail} aria-hidden="true">
                  <span className={styles.node}><Check size={13} strokeWidth={2.75} /></span>
                  {live.length > 0 || isExpanded ? <span className={styles.line} /> : null}
                </span>
                <button type="button" className={styles.summary} onClick={toggle} aria-expanded={isExpanded} aria-controls={regionId}>
                  <span className={styles.summaryText}>
                    <span className={styles.roll}>
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.span key={finished.length} className={styles.rollDigit} initial={reduceMotion ? false : { y: "0.7em", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { y: "-0.7em", opacity: 0, transition: { duration: motionTokens.duration.fast, ease: standard } }} transition={motionTokens.spring.snappy}>{finished.length}</motion.span>
                      </AnimatePresence>
                    </span>
                    {finished.length === 1 ? " step finished" : " steps finished"}
                    {failed ? <span className={styles.failedCount}>{failed} failed</span> : null}
                  </span>
                  {elapsed > 0 ? <span className={styles.duration}>{formatDuration(elapsed)}</span> : null}
                  <ChevronDown className={styles.chevron} size={15} aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div id={regionId} className={styles.fold} initial={false} animate={{ height: isExpanded && finished.length ? "auto" : 0, opacity: isExpanded ? 1 : 0 }} transition={fold} inert={!isExpanded}>
          <ol className={styles.list} aria-label="Finished steps">
            <AnimatePresence initial={false}>
              {finished.map((step, index) => (
                <motion.li key={step.id} className={styles.fold} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={fold}>
                  <StepRow step={step} line={index < finished.length - 1 || live.length > 0} reduceMotion={reduceMotion} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </motion.div>

        <ol className={styles.list} aria-label="Steps in progress">
          <AnimatePresence initial={false}>
            {live.map((step, index) => (
              <motion.li key={step.id} className={styles.fold} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={fold}>
                <StepRow step={step} line={index < live.length - 1} reduceMotion={reduceMotion} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      </div>
      <span className={styles.srOnly} role="status">{allDone ? `Finished ${steps.length} steps` : running ? running.title : ""}</span>
    </section>
  );
}

export default AgentActivity;
