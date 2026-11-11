"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, FileCode, FoldVertical, UnfoldVertical } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./file-diff.module.css";

export interface FileDiffProps {
  /** Path of the file, shown in the header. The last segment is emphasized. */
  filename: string;
  /** Earlier path, when the change also renamed the file. */
  previousFilename?: string;
  /** Text of the file before the change. Empty for a new file. */
  before: string;
  /** Text of the file after the change. Empty for a deleted file. */
  after: string;
  /** Unchanged lines kept visible around every change. Longer unchanged runs fold into one expandable row. */
  context?: number;
  /** Tallest the diff body grows before it scrolls, as a CSS length or a number of pixels. */
  maxHeight?: number | string;
  /** Whether the diff body is open (controlled). */
  open?: boolean;
  /** Whether the diff body starts open (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the header toggle opens or closes the diff body. */
  onOpenChange?: (open: boolean) => void;
  /** Class name added to the root element. */
  className?: string;
}

type LineType = "same" | "add" | "remove";
interface DiffLine { type: LineType; text: string; oldNo?: number; newNo?: number; mark?: [number, number] }
type Segment = { kind: "lines"; key: string; lines: DiffLine[] } | { kind: "fold"; key: string; lines: DiffLine[] };

/** Height of a collapsed fold row in px; an expanding range grows from it, so nothing jumps. Keep in sync with the CSS. */
const FOLD_HEIGHT = 32;
/** Rows past this index enter together, so a long diff never waits on its stagger. */
const STAGGER_CAP = 24;

const split = (text: string) => (text === "" ? [] : text.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n"));

/** Line diff from a longest-common-subsequence table. The shared head and tail are trimmed first, so the table only covers the changed middle. */
function diffLines(before: string[], after: string[]): DiffLine[] {
  let head = 0;
  while (head < before.length && head < after.length && before[head] === after[head]) head++;
  let tail = 0;
  while (tail < before.length - head && tail < after.length - head && before[before.length - 1 - tail] === after[after.length - 1 - tail]) tail++;
  const a = before.slice(head, before.length - tail);
  const b = after.slice(head, after.length - tail);
  const width = b.length + 1;
  const table = new Uint32Array((a.length + 1) * width);
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i * width + j] = a[i] === b[j] ? table[(i + 1) * width + j + 1]! + 1 : Math.max(table[(i + 1) * width + j]!, table[i * width + j + 1]!);
    }
  }
  const lines: DiffLine[] = [];
  let oldNo = 1, newNo = 1;
  const same = (text: string) => lines.push({ type: "same", text, oldNo: oldNo++, newNo: newNo++ });
  for (let index = 0; index < head; index++) same(before[index]!);
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) { same(a[i]!); i++; j++; }
    else if (i < a.length && (j >= b.length || table[(i + 1) * width + j]! >= table[i * width + j + 1]!)) { lines.push({ type: "remove", text: a[i]!, oldNo: oldNo++ }); i++; }
    else { lines.push({ type: "add", text: b[j]!, newNo: newNo++ }); j++; }
  }
  for (let index = before.length - tail; index < before.length; index++) same(before[index]!);
  return lines;
}

/** Pairs each removed line with the added line that replaced it and marks the span that differs, when enough of the line is shared. */
function markChanges(lines: DiffLine[]): DiffLine[] {
  const next = lines.map(line => ({ ...line }));
  let index = 0;
  while (index < next.length) {
    if (next[index]!.type !== "remove") { index++; continue; }
    let removed = index;
    while (removed < next.length && next[removed]!.type === "remove") removed++;
    let added = removed;
    while (added < next.length && next[added]!.type === "add") added++;
    if (removed - index === added - removed) {
      for (let offset = 0; offset < removed - index; offset++) {
        const from = next[index + offset]!, to = next[removed + offset]!;
        let prefix = 0;
        while (prefix < from.text.length && prefix < to.text.length && from.text[prefix] === to.text[prefix]) prefix++;
        let suffix = 0;
        while (suffix < from.text.length - prefix && suffix < to.text.length - prefix && from.text[from.text.length - 1 - suffix] === to.text[to.text.length - 1 - suffix]) suffix++;
        const shared = prefix + suffix;
        if (shared < Math.max(from.text.length, to.text.length) * 0.4) continue;
        if (from.text.length - shared > 0) from.mark = [prefix, from.text.length - suffix];
        if (to.text.length - shared > 0) to.mark = [prefix, to.text.length - suffix];
      }
    }
    index = added;
  }
  return next;
}

/** Splits the diff into visible runs and folds. A fold needs at least two hidden lines: folding one line would save nothing. */
function toSegments(lines: DiffLine[], context: number): Segment[] {
  const segments: Segment[] = [];
  let visible: DiffLine[] = [];
  const flush = () => { if (visible.length) { segments.push({ kind: "lines", key: `l${segments.length}`, lines: visible }); visible = []; } };
  let index = 0;
  while (index < lines.length) {
    if (lines[index]!.type !== "same") { visible.push(lines[index]!); index++; continue; }
    let end = index;
    while (end < lines.length && lines[end]!.type === "same") end++;
    const run = lines.slice(index, end);
    const keepStart = index === 0 ? 0 : context;
    const keepEnd = end === lines.length ? 0 : context;
    if (run.length - keepStart - keepEnd >= 2) {
      visible.push(...run.slice(0, keepStart));
      flush();
      segments.push({ kind: "fold", key: `f${run[keepStart]!.oldNo}`, lines: run.slice(keepStart, run.length - keepEnd) });
      visible.push(...run.slice(run.length - keepEnd));
    } else visible.push(...run);
    index = end;
  }
  flush();
  return segments;
}

function Line({ line, index }: { line: DiffLine; index: number }) {
  const { text, mark } = line;
  return (
    <div className={styles.row} data-type={line.type} style={{ "--i": Math.min(index, STAGGER_CAP) } as CSSProperties}>
      <span className={styles.gutter} aria-hidden="true">
        <span className={styles.no}>{line.oldNo ?? ""}</span>
        <span className={styles.no}>{line.newNo ?? ""}</span>
        <span className={styles.sign}>{line.type === "add" ? "+" : line.type === "remove" ? "−" : ""}</span>
      </span>
      {line.type !== "same" ? <span className={styles.srOnly}>{line.type === "add" ? "Added: " : "Removed: "}</span> : null}
      <code className={styles.code}>
        {mark ? <>{text.slice(0, mark[0])}<span className={styles.mark}>{text.slice(mark[0], mark[1])}</span>{text.slice(mark[1])}</> : text || " "}
      </code>
    </div>
  );
}

function FoldedLines({ lines, focus, reduceMotion }: { lines: DiffLine[]; focus: boolean; reduceMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  // The fold button that had focus is gone once its range opens, so focus moves to the lines it revealed.
  useEffect(() => { if (focus) ref.current?.focus({ preventScroll: true }); }, [focus]);
  return (
    <motion.div
      ref={ref}
      className={styles.unfolded}
      tabIndex={-1}
      initial={reduceMotion ? false : { height: FOLD_HEIGHT, opacity: 0.4 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { height: FOLD_HEIGHT, opacity: 0, transition: { ...motionTokens.spring.snappy } }}
      transition={motionTokens.spring.smooth}
    >
      {lines.map((line, index) => <Line key={`${line.oldNo}`} line={line} index={index} />)}
    </motion.div>
  );
}

/**
 * A unified diff of one file, computed from the text before and after. Changed lines carry line numbers, a sign and a tint; the part of a
 * line that actually changed is marked. Long unchanged runs fold into one row that springs open, and the header counts additions and removals.
 */
export function FileDiff({ filename, previousFilename, before, after, context = 3, maxHeight, open, defaultOpen = true, onOpenChange, className }: FileDiffProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const bodyId = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const lastExpanded = useRef<string | null>(null);

  const lines = useMemo(() => markChanges(diffLines(split(before), split(after))), [before, after]);
  const segments = useMemo(() => toSegments(lines, Math.max(0, context)), [lines, context]);
  const added = lines.filter(line => line.type === "add").length;
  const removed = lines.filter(line => line.type === "remove").length;
  const folds = segments.filter(segment => segment.kind === "fold");
  const allExpanded = folds.length > 0 && folds.every(fold => expanded.has(fold.key));
  // A new diff starts folded again.
  useEffect(() => { setExpanded(new Set()); lastExpanded.current = null; }, [before, after]);

  const status = previousFilename ? "Renamed" : before === "" && after !== "" ? "New file" : after === "" && before !== "" ? "Deleted" : null;
  const slash = filename.lastIndexOf("/");
  const directory = slash >= 0 ? filename.slice(0, slash + 1) : "";
  const basename = slash >= 0 ? filename.slice(slash + 1) : filename;
  // Five blocks share out the change the way the counts do; any change at all earns at least one block.
  const total = added + removed;
  const addBlocks = total === 0 ? 0 : Math.max(added > 0 ? 1 : 0, Math.min(removed > 0 ? 4 : 5, Math.round((added / total) * 5)));
  const removeBlocks = total === 0 ? 0 : 5 - addBlocks;

  const toggle = () => { const next = !isOpen; if (open === undefined) setInternalOpen(next); onOpenChange?.(next); };
  const expand = (key: string) => { lastExpanded.current = key; setExpanded(current => new Set(current).add(key)); };
  const toggleAll = () => { lastExpanded.current = null; setExpanded(allExpanded ? new Set() : new Set(folds.map(fold => fold.key))); };
  let offset = 0;

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} aria-label={`Changes to ${filename}`} data-open={isOpen}>
      <header className={styles.header}>
        <FileCode className={styles.fileIcon} size={16} aria-hidden="true" />
        <div className={styles.names}>
          <span className={styles.path} title={filename}><span className={styles.directory}>{directory}</span><span className={styles.basename}>{basename}</span></span>
          {previousFilename ? <span className={styles.previous}>from {previousFilename}</span> : null}
        </div>
        {status ? <span className={styles.status}>{status}</span> : null}
        <div className={styles.stats}>
          <span className={styles.added} aria-label={`${added} ${added === 1 ? "addition" : "additions"}`}>+{added}</span>
          <span className={styles.removed} aria-label={`${removed} ${removed === 1 ? "removal" : "removals"}`}>−{removed}</span>
          <span className={styles.blocks} aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className={styles.block} data-kind={index < addBlocks ? "add" : index < addBlocks + removeBlocks ? "remove" : "none"} style={{ "--i": index } as CSSProperties} />
            ))}
          </span>
        </div>
        {folds.length ? (
          <button type="button" className={styles.iconButton} onClick={toggleAll} disabled={!isOpen} aria-pressed={allExpanded} aria-label={allExpanded ? "Fold unchanged lines" : "Show all unchanged lines"} title={allExpanded ? "Fold unchanged lines" : "Show all unchanged lines"}>
            {allExpanded ? <FoldVertical size={16} aria-hidden="true" /> : <UnfoldVertical size={16} aria-hidden="true" />}
          </button>
        ) : null}
        <button type="button" className={styles.iconButton} onClick={toggle} aria-expanded={isOpen} aria-controls={bodyId} aria-label={isOpen ? "Collapse file" : "Expand file"}>
          <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />
        </button>
      </header>
      <motion.div
        id={bodyId}
        className={styles.collapse}
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={reduceMotion ? { duration: 0 } : motionTokens.spring.smooth}
        inert={!isOpen}
      >
        <div className={styles.scroller} style={{ maxHeight }} tabIndex={0} role="group" aria-label={`Diff of ${filename}, ${added} added and ${removed} removed`}>
          <div className={styles.lines}>
            {lines.length === 0 || total === 0 ? <p className={styles.empty}>{lines.length === 0 ? "Empty file" : "No changes"}</p> : null}
            {total > 0 && segments.map(segment => {
              if (segment.kind === "lines") {
                const start = offset;
                offset += segment.lines.length;
                return segment.lines.map((line, index) => <Line key={`${line.type}-${line.oldNo ?? ""}-${line.newNo ?? ""}`} line={line} index={start + index} />);
              }
              offset += 1;
              const hidden = segment.lines.length;
              return (
                <AnimatePresence key={segment.key} initial={false} mode="wait">
                  {expanded.has(segment.key) ? (
                    <FoldedLines key="lines" lines={segment.lines} focus={lastExpanded.current === segment.key} reduceMotion={reduceMotion} />
                  ) : (
                    <motion.button
                      key="fold"
                      type="button"
                      className={styles.fold}
                      onClick={() => expand(segment.key)}
                      aria-expanded={false}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.08 } }}
                      transition={{ duration: reduceMotion ? 0 : motionTokens.duration.fast }}
                    >
                      <span className={styles.foldLabel}>
                        <UnfoldVertical size={14} aria-hidden="true" />
                        {hidden} unchanged lines
                        <span className={styles.foldRange}>{segment.lines[0]!.newNo}–{segment.lines[hidden - 1]!.newNo}</span>
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default FileDiff;
