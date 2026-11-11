"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { Check, ChevronDown, Copy } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import { writeClipboard } from "@/lib/use-copy-feedback";
import styles from "./tool-result.module.css";

export type ToolResultStatus = "running" | "success" | "error";

/**
 * The record of one tool call in an agent transcript. Folded, it is a single line: status, tool name, a short summary and how long
 * the call took (counting live while it runs). Open, it shows the input and the output formatted as code, each with a copy button.
 */
export interface ToolResultProps {
  /** Name of the tool that was called. */
  tool: string;
  /** Where the call stands. */
  status?: ToolResultStatus;
  /** Short text after the name, usually the main argument. */
  summary?: string;
  /** How long the call took, in milliseconds. While `status` is "running" and this is not set, a live timer counts from mount. */
  durationMs?: number;
  /** What the tool was called with. Objects are printed as highlighted JSON; strings are shown as they are. */
  input?: unknown;
  /** What the tool returned. Same formatting as `input`. */
  output?: unknown;
  /** Error message, shown in place of the output when `status` is "error". */
  error?: string;
  /** Controlled open state. */
  open?: boolean;
  /** Whether the record starts open when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the header is pressed. */
  onOpenChange?: (open: boolean) => void;
  /** Extra class for the root element. */
  className?: string;
}

const statusText: Record<ToolResultStatus, string> = { running: "Running", success: "Succeeded", error: "Failed" };
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const enterEase = [...motionTokens.ease.enter] as [number, number, number, number];
const fade: Transition = { duration: motionTokens.duration.fast, ease: standard };

export function formatDuration(ms: number) {
  if (ms < 1000) return `${Math.max(0, Math.round(ms))} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.floor(ms / 60_000)} m ${Math.round((ms % 60_000) / 1000)} s`;
}

const tokenPattern = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

/** Prints a value as code. Objects become indented JSON with keys, strings, numbers and literals in their own tones. */
function highlight(value: unknown): { text: string; nodes: ReactNode } {
  if (typeof value === "string") return { text: value, nodes: value };
  let text: string;
  try { text = JSON.stringify(value, null, 2) ?? String(value); } catch { text = String(value); }
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(tokenPattern)) {
    const at = match.index;
    if (at > last) nodes.push(text.slice(last, at));
    if (match[1] !== undefined && match[2] !== undefined) nodes.push(<span key={at} className={styles.key}>{match[1]}</span>, match[2]);
    else if (match[1] !== undefined) nodes.push(<span key={at} className={styles.string}>{match[1]}</span>);
    else if (match[3] !== undefined) nodes.push(<span key={at} className={styles.literal}>{match[0]}</span>);
    else nodes.push(<span key={at} className={styles.number}>{match[0]}</span>);
    last = at + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return { text, nodes };
}

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

/** Counts up while a call runs. Ticks ten times a second, or once a second under reduced motion. */
function useElapsed(active: boolean, reduce: boolean) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active) return;
    const started = performance.now();
    setElapsed(0);
    const timer = window.setInterval(() => setElapsed(performance.now() - started), reduce ? 1000 : 100);
    return () => window.clearInterval(timer);
  }, [active, reduce]);
  return elapsed;
}

function Section({ label, tone, value, pending, reduce, index }: { label: string; tone?: "error"; value: unknown; pending?: boolean; reduce: boolean; index: number }) {
  const code = useMemo(() => highlight(value), [value]);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  async function copy() {
    try { await writeClipboard(code.text); } catch { return; }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1900);
  }
  return (
    <motion.div className={styles.section} data-tone={tone} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: motionTokens.duration.standard, ease: enterEase, delay: 0.05 + index * motionTokens.stagger.line }}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionLabel}>{label}</span>
        {pending ? null : (
          <button type="button" className={styles.copy} data-done={copied || undefined} aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`} onClick={copy}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={copied ? "done" : "copy"} className={styles.copyGlyph} initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }} transition={reduce ? fade : { ...motionTokens.spring.snappy, opacity: fade }}>{copied ? <Check width={13} height={13} strokeWidth={2.4} aria-hidden="true" /> : <Copy width={13} height={13} strokeWidth={1.9} aria-hidden="true" />}</motion.span>
            </AnimatePresence>
          </button>
        )}
      </div>
      {pending
        ? <div className={styles.waiting} role="status" aria-label="Waiting for the result"><span /><span /><span /></div>
        : <pre className={styles.code} tabIndex={0}><code>{code.nodes}</code></pre>}
    </motion.div>
  );
}

export function ToolResult({ tool, status = "success", summary, durationMs, input, output, error, open, defaultOpen = false, onOpenChange, className }: ToolResultProps) {
  const reduce = !!useReducedMotion();
  const bodyId = useId();
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const isOpen = open ?? ownOpen;
  const [contentRef, height] = useContentHeight();
  const running = status === "running";
  const elapsed = useElapsed(running && durationMs === undefined, reduce);
  const duration = durationMs ?? (running ? elapsed : undefined);
  const hasInput = input !== undefined;
  const failed = status === "error";
  const result = failed ? error ?? output : output;

  function toggle() {
    if (open === undefined) setOwnOpen(!isOpen);
    onOpenChange?.(!isOpen);
  }

  const pop = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: fade }
    : { initial: { opacity: 0, scale: 0.4 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.4, transition: fade }, transition: { type: "spring" as const, visualDuration: 0.3, bounce: 0.3, opacity: fade } };
  const stroke = reduce ? { initial: false as const } : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 0.26, ease: standard, delay: 0.1 } };

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} data-status={status} data-open={isOpen || undefined}>
      <button type="button" className={styles.header} aria-expanded={isOpen} aria-controls={bodyId} onClick={toggle}>
        <span className={styles.state} aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false}>
            {running
              ? <motion.span key="running" className={styles.spinner} {...pop} />
              : <motion.span key={status} className={styles.badge} {...pop}>
                  <svg viewBox="0 0 16 16">
                    {failed
                      ? <><motion.path d="M5 5 11 11" {...stroke} /><motion.path d="M11 5 5 11" {...stroke} /></>
                      : <motion.path d="M4 8.4 6.9 11.1 12 5.2" {...stroke} />}
                  </svg>
                </motion.span>}
          </AnimatePresence>
        </span>
        <span className={styles.srOnly}>{statusText[status]}: </span>
        <code className={styles.tool}>{tool}</code>
        <span className={styles.summary}>{summary}</span>
        {duration !== undefined ? <span className={styles.duration}><span className={styles.srOnly}>{running ? "running for " : "took "}</span>{formatDuration(duration)}</span> : null}
        <ChevronDown className={styles.chevron} width={15} height={15} strokeWidth={2} aria-hidden="true" />
      </button>
      {/* The body stays mounted so its height is always known: opening, closing and a result arriving all spring to the measured size. */}
      <motion.div id={bodyId} className={styles.region} inert={!isOpen} initial={false} animate={{ height: isOpen ? height ?? "auto" : 0, opacity: isOpen ? 1 : 0 }} transition={reduce ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: standard } }}>
        <div ref={contentRef} className={styles.body}>
          {/* Keyed by the open state so the sections step in again each time the record opens. */}
          <div key={isOpen ? "open" : "closed"} className={styles.sections}>
            {hasInput ? <Section label="Input" value={input} reduce={reduce || !isOpen} index={0} /> : null}
            <Section key={running ? "waiting" : status} label={failed ? "Error" : "Output"} tone={failed ? "error" : undefined} value={result ?? ""} pending={running} reduce={reduce || !isOpen} index={hasInput ? 1 : 0} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ToolResult;
