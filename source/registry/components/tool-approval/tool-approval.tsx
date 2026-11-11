"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { Wrench } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./tool-approval.module.css";

export type ToolDecision = "pending" | "once" | "always" | "denied";

/**
 * An inline permission request inside a conversation: the agent names the tool and shows the arguments it wants to call it with,
 * and the person allows it once, allows it from now on, or denies it. Once decided, the request folds into a single line that
 * records the answer.
 */
export interface ToolApprovalProps {
  /** Name of the tool, as the agent calls it (for example "run_command"). */
  tool: string;
  /** Arguments of the call: an object shown as key and value lines, or a ready-made string. */
  args?: Record<string, unknown> | string;
  /** Why the agent wants to run it, in a short sentence. */
  description?: string;
  /** Icon of the tool. */
  icon?: ReactNode;
  /** Controlled decision. */
  decision?: ToolDecision;
  /** Decision the request starts with when uncontrolled. */
  defaultDecision?: ToolDecision;
  /** Called when the person decides, or reopens the request. */
  onDecisionChange?: (decision: ToolDecision) => void;
  /** Shows a "Change" button on the result line that reopens the request. */
  allowChange?: boolean;
  /** Button and result texts, to translate or reword them. */
  labels?: Partial<Record<"once" | "always" | "deny" | "allowedOnce" | "allowedAlways" | "denied" | "change", string>>;
  /** Extra class for the root element. */
  className?: string;
}

const defaultLabels = { once: "Allow once", always: "Always allow", deny: "Deny", allowedOnce: "Allowed once", allowedAlways: "Always allowed", denied: "Denied", change: "Change" };
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const enterEase = [...motionTokens.ease.enter] as [number, number, number, number];
const fade: Transition = { duration: motionTokens.duration.fast, ease: standard };
const draw: Transition = { duration: 0.28, ease: standard, delay: 0.12 };

const show = (value: unknown) => typeof value === "string" ? value : JSON.stringify(value) ?? String(value);
function argLines(args: ToolApprovalProps["args"]): { name?: string; value: string }[] {
  if (args == null) return [];
  if (typeof args === "string") return args.split("\n").map(value => ({ value }));
  return Object.entries(args).map(([name, value]) => ({ name, value: show(value) }));
}

/** Follows the height of whatever is inside, so the frame can spring between the request and its one-line result. */
function useContentHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    setHeight(node.offsetHeight);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, height] as const;
}

export function ToolApproval({ tool, args, description, icon, decision, defaultDecision = "pending", onDecisionChange, allowChange = true, labels, className }: ToolApprovalProps) {
  const reduce = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [contentRef, height] = useContentHeight();
  const [own, setOwn] = useState<ToolDecision>(defaultDecision);
  const state = decision ?? own;
  const text = { ...defaultLabels, ...labels };
  const lines = argLines(args);
  const refocus = useRef(false);

  function decide(next: ToolDecision) {
    // The pressed button is about to leave; remember to hand keyboard focus to what replaces it.
    refocus.current = !!rootRef.current?.contains(document.activeElement);
    if (decision === undefined) setOwn(next);
    onDecisionChange?.(next);
  }
  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    const root = rootRef.current;
    // The outgoing view is still in the tree while it fades, so the target is looked up by the view it belongs to.
    (root?.querySelector<HTMLElement>(`[data-focus="${state === "pending" ? "request" : "result"}"]`) ?? root)?.focus({ preventScroll: true });
  }, [state]);

  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: fade }
    : { initial: { opacity: 0, y: 8, filter: `blur(${motionTokens.blur.soft}px)` }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, exit: { opacity: 0, y: -6, filter: `blur(${motionTokens.blur.subtle}px)`, transition: fade }, transition: { duration: motionTokens.duration.standard, ease: enterEase, delay: 0.04 } };
  const stroke = reduce ? { initial: false as const } : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: draw };
  const resultText = state === "once" ? text.allowedOnce : state === "always" ? text.allowedAlways : text.denied;
  const glyph = icon ?? <Wrench width={15} height={15} strokeWidth={1.9} />;

  return (
    <motion.div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} data-decision={state} role="group" aria-label={`Permission request for ${tool}`} tabIndex={-1} initial={false} animate={height === null ? undefined : { height }} transition={reduce ? { duration: 0 } : motionTokens.spring.smooth}>
      <div ref={contentRef} className={styles.content}>
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "pending" ? (
            <motion.div key="request" className={styles.request} {...swap}>
              <div className={styles.head}>
                <span className={styles.icon} aria-hidden="true">{glyph}</span>
                <p className={styles.ask}>Wants to run <code className={styles.tool}>{tool}</code>{description ? <span className={styles.why}>{description}</span> : null}</p>
              </div>
              {lines.length ? (
                <div className={styles.args} role="group" aria-label="Arguments">
                  {lines.map((line, index) => <div key={index} className={styles.arg}>{line.name ? <span className={styles.argName}>{line.name}</span> : null}<span className={styles.argValue} title={line.value}>{line.value}</span></div>)}
                </div>
              ) : null}
              <div className={styles.actions}>
                <button type="button" className={styles.deny} onClick={() => decide("denied")}>{text.deny}</button>
                <button type="button" className={styles.always} onClick={() => decide("always")}>{text.always}</button>
                <button type="button" className={styles.once} data-focus="request" onClick={() => decide("once")}>{text.once}</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" className={styles.result} role="status" {...swap}>
              <span className={styles.verdict} aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  {state === "denied"
                    ? <><motion.path key="x1" d="M4.6 4.6 11.4 11.4" {...stroke} /><motion.path key="x2" d="M11.4 4.6 4.6 11.4" {...stroke} transition={reduce ? undefined : { ...draw, delay: 0.2 }} /></>
                    : <motion.path key="check" d="M3.8 8.4 6.8 11.2 12.2 5" {...stroke} />}
                </svg>
              </span>
              <span className={styles.resultText}>{resultText}</span>
              <code className={styles.resultTool}>{tool}</code>
              {lines[0] ? <span className={styles.resultArgs}>{lines[0].value}</span> : <span className={styles.resultArgs} />}
              {allowChange ? <button type="button" className={styles.change} data-focus="result" onClick={() => decide("pending")}>{text.change}</button> : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default ToolApproval;
