"use client";

import { Children, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { CircleAlert } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./message-bubble.module.css";

export type MessageBubbleFrom = "user" | "assistant";
export type MessageBubblePosition = "single" | "first" | "middle" | "last";
export type MessageBubbleStatus = "sending" | "sent" | "delivered" | "read" | "failed";

/**
 * One chat bubble. The person's bubbles sit on the right in the accent; the assistant's sit on the left on a quiet surface.
 * Consecutive bubbles from one sender group: inner corners tighten and only the last one keeps the tail.
 */
export interface MessageBubbleProps {
  /** Who wrote it. Decides the side, the color and where the tail points. */
  from?: MessageBubbleFrom;
  /** The message. Text wraps; links, emphasis and inline code are fine. */
  children?: ReactNode;
  /** Place inside a run of bubbles from the same sender. `MessageBubbleGroup` sets it for you. */
  position?: MessageBubblePosition;
  /** Time shown under the bubble, already formatted (for example "9:41"). */
  timestamp?: string;
  /** Delivery state shown as ticks after the timestamp. Each new tick draws itself in. */
  status?: MessageBubbleStatus;
  /** Shows three bouncing dots instead of the content while the other side is writing. */
  typing?: boolean;
  /** Draws the tail on a single or last bubble. */
  tail?: boolean;
  /** Pops the bubble in from its tail corner when it mounts. Turn it off for history that is already there. */
  animateIn?: boolean;
  /** Name read by screen readers before the message. Defaults to "You" or "Assistant". */
  author?: string;
  /** Extra class for the row element. */
  className?: string;
}

export interface MessageBubbleGroupProps {
  /** Sender of every bubble in the group. */
  from?: MessageBubbleFrom;
  /** `MessageBubble` elements, as direct children. Each one gets its `from` and `position` from the group. */
  children: ReactNode;
  /** Accessible name of the group, for example "Messages from Dana". */
  label?: string;
  /** Extra class for the group element. */
  className?: string;
}

const statusLabels: Record<MessageBubbleStatus, string> = { sending: "Sending", sent: "Sent", delivered: "Delivered", read: "Read", failed: "Not delivered" };
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
/** A bubble may land with a small bounce: it is a new object arriving, not a control reporting a state. */
const pop: Transition = { type: "spring", visualDuration: 0.34, bounce: 0.3, opacity: { duration: motionTokens.duration.fast, ease: standard } };
const draw: Transition = { duration: motionTokens.duration.standard, ease: standard };
const fade: Transition = { duration: motionTokens.duration.fast, ease: standard };

function Ticks({ status, reduce }: { status: MessageBubbleStatus; reduce: boolean }) {
  const second = status === "delivered" || status === "read";
  const stroke = reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: fade } : { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, exit: { opacity: 0 }, transition: draw };
  return (
    <span className={styles.status} data-status={status}>
      <span className={styles.srOnly}>{statusLabels[status]}</span>
      {/* initial={false}: ticks that are already there when the bubble mounts do not replay; only a change draws. */}
      <AnimatePresence mode="popLayout" initial={false}>
        {status === "sending" ? <motion.span key="sending" className={styles.pending} aria-hidden="true" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={fade} /> : null}
        {status === "failed" ? <motion.span key="failed" className={styles.failed} initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={reduce ? fade : motionTokens.spring.snappy}><CircleAlert width={13} height={13} strokeWidth={2} aria-hidden="true" /><span aria-hidden="true">{statusLabels.failed}</span></motion.span> : null}
        {status === "sent" || second ? (
          <motion.svg key="ticks" className={styles.ticks} viewBox="0 0 20 12" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
            <motion.path d="M1.5 6.6 5 10 11.6 2.2" {...stroke} />
            <AnimatePresence initial={false}>{second ? <motion.path key="second" d="M8.4 8.2 10.2 10 16.8 2.2" {...stroke} /> : null}</AnimatePresence>
          </motion.svg>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

export function MessageBubble({ from = "assistant", children, position = "single", timestamp, status, typing = false, tail = true, animateIn = true, author, className }: MessageBubbleProps) {
  const reduce = !!useReducedMotion();
  const tailed = tail && (position === "single" || position === "last");
  const origin = from === "user" ? "100% 100%" : "0% 100%";
  return (
    <motion.div
      className={[styles.row, className].filter(Boolean).join(" ")}
      data-from={from}
      data-position={position}
      style={{ transformOrigin: origin }}
      initial={animateIn ? (reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 10 }) : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={reduce ? fade : pop}
    >
      <div className={styles.bubble}>
        <span className={styles.srOnly}>{author ?? (from === "user" ? "You" : "Assistant")}: </span>
        {typing
          ? <span className={styles.typing} role="status" aria-label="Typing"><i /><i /><i /></span>
          : <div className={styles.text}>{children}</div>}
        {tailed ? <svg className={styles.tail} viewBox="0 0 12 16" aria-hidden="true"><path d="M0 0H6C6 8 8.5 13.5 12 16H0Z" /></svg> : null}
      </div>
      {timestamp || status ? (
        <div className={styles.meta}>
          {timestamp ? <time className={styles.time}>{timestamp}</time> : null}
          {status ? <Ticks status={status} reduce={reduce} /> : null}
        </div>
      ) : null}
    </motion.div>
  );
}

const positionAt = (index: number, count: number): MessageBubblePosition => count === 1 ? "single" : index === 0 ? "first" : index === count - 1 ? "last" : "middle";

/** A run of bubbles from one sender. It spaces them tightly and gives each its place, so only the last one carries the tail. */
export function MessageBubbleGroup({ from = "assistant", children, label, className }: MessageBubbleGroupProps) {
  const items = Children.toArray(children).filter((child): child is ReactElement<MessageBubbleProps> => isValidElement(child));
  return (
    <div className={[styles.group, className].filter(Boolean).join(" ")} data-from={from} role="group" aria-label={label}>
      {items.map((child, index) => cloneElement(child, { from: child.props.from ?? from, position: child.props.position ?? positionAt(index, items.length) }))}
    </div>
  );
}

export default MessageBubble;
