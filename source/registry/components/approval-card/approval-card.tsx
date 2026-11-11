"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { ChevronDown, ShieldQuestion, Undo2 } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./approval-card.module.css";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalDetail {
  /** Name of the fact, such as "Amount". */
  label: string;
  /** Its value. */
  value: ReactNode;
}

/**
 * A request for a person's decision before an agent acts. It states the action, keeps the fine print behind a details toggle, and
 * once approved or rejected it settles into a resolved state: the icon turns into a drawn check or cross and the buttons give
 * way to the outcome, with an undo.
 */
export interface ApprovalCardProps {
  /** The action waiting for a decision, in one line. */
  title: string;
  /** A sentence or two on what will happen and why. */
  summary?: ReactNode;
  /** Who is asking, shown above the title (an agent or a workflow name). */
  source?: string;
  /** Icon of the request while it is pending. */
  icon?: ReactNode;
  /** Facts shown when the details are open, as label and value rows. */
  details?: ApprovalDetail[];
  /** Extra content under the detail rows, such as a preview of the change. */
  children?: ReactNode;
  /** Controlled decision. */
  status?: ApprovalStatus;
  /** Decision the card starts with when uncontrolled. */
  defaultStatus?: ApprovalStatus;
  /** Called when the person approves, rejects or undoes. */
  onStatusChange?: (status: ApprovalStatus) => void;
  /** Controlled open state of the details. */
  detailsOpen?: boolean;
  /** Whether the details start open when uncontrolled. */
  defaultDetailsOpen?: boolean;
  /** Called when the details toggle is pressed. */
  onDetailsOpenChange?: (open: boolean) => void;
  /** Text of the approve button. */
  approveLabel?: string;
  /** Text of the reject button. */
  rejectLabel?: string;
  /** Outcome text per decision, shown in the resolved state. */
  resolvedLabels?: Partial<Record<Exclude<ApprovalStatus, "pending">, string>>;
  /** Offers an undo in the resolved state that returns the card to pending. */
  allowUndo?: boolean;
  /** Extra class for the root element. */
  className?: string;
}

const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const enterEase = [...motionTokens.ease.enter] as [number, number, number, number];
const fade: Transition = { duration: motionTokens.duration.fast, ease: standard };
const draw: Transition = { duration: 0.3, ease: standard, delay: 0.1 };
const defaultResolved = { approved: "Approved", rejected: "Rejected" };

export function ApprovalCard({ title, summary, source, icon, details, children, status, defaultStatus = "pending", onStatusChange, detailsOpen, defaultDetailsOpen = false, onDetailsOpenChange, approveLabel = "Approve", rejectLabel = "Reject", resolvedLabels, allowUndo = true, className }: ApprovalCardProps) {
  const reduce = !!useReducedMotion();
  const detailsId = useId();
  const titleId = useId();
  const [ownStatus, setOwnStatus] = useState<ApprovalStatus>(defaultStatus);
  const [ownOpen, setOwnOpen] = useState(defaultDetailsOpen);
  const state = status ?? ownStatus;
  const open = detailsOpen ?? ownOpen;
  const hasDetails = (details?.length ?? 0) > 0 || children != null;
  const resolved = { ...defaultResolved, ...resolvedLabels };

  function decide(next: ApprovalStatus) {
    if (status === undefined) setOwnStatus(next);
    onStatusChange?.(next);
  }
  function toggle() {
    if (detailsOpen === undefined) setOwnOpen(!open);
    onDetailsOpenChange?.(!open);
  }

  const glyph = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: fade }
    : { initial: { opacity: 0, scale: 0.5, filter: `blur(${motionTokens.blur.subtle}px)` }, animate: { opacity: 1, scale: 1, filter: "blur(0px)" }, exit: { opacity: 0, scale: 0.5, filter: `blur(${motionTokens.blur.subtle}px)`, transition: fade }, transition: { ...motionTokens.spring.snappy, opacity: fade, filter: fade } };
  const footer = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: fade }
    : { initial: { opacity: 0, y: 10, filter: `blur(${motionTokens.blur.soft}px)` }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, exit: { opacity: 0, y: -8, filter: `blur(${motionTokens.blur.subtle}px)`, transition: fade }, transition: { duration: motionTokens.duration.standard, ease: enterEase } };
  const stroke = reduce ? { initial: false as const } : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: draw };

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} data-status={state} aria-labelledby={titleId}>
      <header className={styles.header}>
        <span className={styles.badge} aria-hidden="true">
          {/* One ripple leaves the badge at the moment of the decision. */}
          {state !== "pending" && !reduce ? <motion.span key={state} className={styles.ripple} initial={{ opacity: 0.55, scale: 1 }} animate={{ opacity: 0, scale: 1.9 }} transition={{ duration: 0.6, ease: standard }} /> : null}
          <AnimatePresence mode="popLayout" initial={false}>
            {state === "pending"
              ? <motion.span key="pending" className={styles.glyph} {...glyph}>{icon ?? <ShieldQuestion width={19} height={19} strokeWidth={1.8} />}</motion.span>
              : <motion.span key={state} className={styles.glyph} {...glyph}>
                  <svg className={styles.sign} viewBox="0 0 20 20">
                    {state === "approved"
                      ? <motion.path d="M4.6 10.4 8.4 14 15.4 6.2" {...stroke} />
                      : <><motion.path d="M5.8 5.8 14.2 14.2" {...stroke} /><motion.path d="M14.2 5.8 5.8 14.2" {...stroke} transition={reduce ? undefined : { ...draw, delay: 0.2 }} /></>}
                  </svg>
                </motion.span>}
          </AnimatePresence>
        </span>
        <div className={styles.heading}>
          {source ? <p className={styles.source}>{source}<span className={styles.sourceNote}>{state === "pending" ? " needs your approval" : ""}</span></p> : null}
          <h3 id={titleId} className={styles.title}>{title}</h3>
        </div>
      </header>

      {summary ? <p className={styles.summary}>{summary}</p> : null}

      {hasDetails ? (
        <div className={styles.details}>
          <button type="button" className={styles.toggle} aria-expanded={open} aria-controls={detailsId} onClick={toggle}>
            <ChevronDown className={styles.chevron} width={15} height={15} strokeWidth={2} aria-hidden="true" />
            {open ? "Hide details" : "Show details"}
          </button>
          <AnimatePresence initial={false}>
            {open ? (
              <motion.div key="details" id={detailsId} className={styles.region} initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={reduce ? fade : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: standard } }}>
                <div className={styles.panel}>
                  {details?.length ? (
                    <dl className={styles.facts}>
                      {details.map((detail, index) => (
                        <motion.div key={detail.label} className={styles.fact} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: motionTokens.duration.standard, ease: enterEase, delay: 0.04 + Math.min(index * motionTokens.stagger.item, 0.3) }}>
                          <dt>{detail.label}</dt>
                          <dd>{detail.value}</dd>
                        </motion.div>
                      ))}
                    </dl>
                  ) : null}
                  {children != null ? <div className={styles.extra}>{children}</div> : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}

      <footer className={styles.footer}>
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "pending" ? (
            <motion.div key="actions" className={styles.actions} {...footer}>
              <button type="button" className={styles.reject} onClick={() => decide("rejected")}>{rejectLabel}</button>
              <button type="button" className={styles.approve} onClick={() => decide("approved")}>{approveLabel}</button>
            </motion.div>
          ) : (
            <motion.div key={state} className={styles.outcome} role="status" {...footer}>
              <span className={styles.outcomeText}><span className={styles.dot} aria-hidden="true" />{resolved[state]}</span>
              {allowUndo ? <button type="button" className={styles.undo} onClick={() => decide("pending")}><Undo2 width={14} height={14} strokeWidth={2} aria-hidden="true" />Undo</button> : null}
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </section>
  );
}

export default ApprovalCard;
