"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./streaming-response.module.css";

export interface StreamingResponseProps {
  /** The text to stream. Blank lines split it into paragraphs. If the text grows (a real stream appending to it), the reveal carries on from where it is; any other change starts over. */
  text: string;
  /** Words revealed per second. Sentence ends and commas add a short natural pause. */
  speed?: number;
  /** Whether the stream is running (controlled). Set it to false to hold the text where it is. */
  playing?: boolean;
  /** Whether the stream starts running on mount (uncontrolled). */
  defaultPlaying?: boolean;
  /** Called when the built-in controls pause, resume or replay the stream. */
  onPlayingChange?: (playing: boolean) => void;
  /** Shows the whole text at once with no stream, for a response that had already finished. */
  instant?: boolean;
  /** Shows the status line with the progress, pause, skip and replay controls. */
  controls?: boolean;
  /** Shows the caret while text is arriving. */
  caret?: boolean;
  /** Called as words appear, with the number of words shown and the total. */
  onProgress?: (shown: number, total: number) => void;
  /** Called once per run when the last word has appeared. */
  onComplete?: () => void;
  /** Class name added to the root element. */
  className?: string;
}

const toParagraphs = (text: string) => text.trim().split(/\n\s*\n/).map(paragraph => paragraph.split(/\s+/).filter(Boolean)).filter(words => words.length > 0);

/** The first `count` words of a text, split the way the stream splits it. Use it to keep what was shown when a stream is stopped early. */
export function takeWords(text: string, count: number): string {
  let left = Math.max(0, Math.floor(count));
  const kept: string[] = [];
  for (const words of toParagraphs(text)) {
    if (left <= 0) break;
    kept.push(words.slice(0, left).join(" "));
    left -= words.length;
  }
  return kept.join("\n\n");
}

/** A beat after a sentence, half a beat after a comma, a longer one between paragraphs: the rhythm reads as written, not as a ticker. */
function delayAfter(word: string | undefined, endsParagraph: boolean, speed: number) {
  const base = 1000 / Math.max(1, speed);
  if (!word) return base;
  if (endsParagraph) return base * 4.5;
  if (/[.!?:]["')\]]?$/.test(word)) return base * 3.2;
  if (/[,;]$/.test(word)) return base * 1.9;
  return base;
}

/**
 * Text that arrives word by word, the way a model response does: each word fades up out of a soft blur behind a caret, the pace
 * breathes at punctuation, and the caret leaves when the text settles. The status line can pause, skip to the end or replay.
 * With reduced motion the whole text is shown at once.
 */
export function StreamingResponse({ text, speed = 16, playing, defaultPlaying = true, onPlayingChange, instant = false, controls = true, caret = true, onProgress, onComplete, className }: StreamingResponseProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const whole = instant || reduceMotion;
  const paragraphs = useMemo(() => toParagraphs(text), [text]);
  const flat = useMemo(() => paragraphs.flatMap(words => words.map((word, index) => ({ word, endsParagraph: index === words.length - 1 }))), [paragraphs]);
  const total = flat.length;
  const [internalPlaying, setInternalPlaying] = useState(defaultPlaying);
  const isPlaying = playing ?? internalPlaying;
  const [count, setCount] = useState(0);
  const [run, setRun] = useState(0);
  // Appended text keeps streaming from the same place; a different text starts a new run.
  const [tracked, setTracked] = useState(text);
  if (tracked !== text) {
    setTracked(text);
    if (!text.startsWith(tracked)) { setCount(0); setRun(run + 1); }
  }
  const shown = whole ? total : Math.min(count, total);
  const done = shown >= total;
  const state = done ? "done" : isPlaying ? "streaming" : "paused";

  const callbacks = useRef({ onProgress, onComplete });
  callbacks.current = { onProgress, onComplete };

  useEffect(() => {
    if (whole || !isPlaying || count >= total) return;
    const last = flat[count - 1];
    const timer = window.setTimeout(() => setCount(current => current + 1), delayAfter(last?.word, last?.endsParagraph ?? false, speed));
    return () => window.clearTimeout(timer);
  }, [whole, isPlaying, count, total, flat, speed]);

  useEffect(() => { callbacks.current.onProgress?.(shown, total); }, [shown, total]);
  const completed = useRef(-1);
  useEffect(() => {
    if (instant || !done || total === 0 || completed.current === run) return;
    completed.current = run;
    callbacks.current.onComplete?.();
  }, [instant, done, total, run]);

  const setPlaying = (next: boolean) => { if (playing === undefined) setInternalPlaying(next); onPlayingChange?.(next); };
  const replay = () => { setCount(0); setRun(run + 1); setPlaying(true); };

  let start = 0;
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} data-state={state} data-whole={whole || undefined}>
      {/* The animated words are for the eyes; assistive technology reads the complete text once instead of a word at a time. */}
      <div className={styles.srOnly}>{paragraphs.map((words, index) => <p key={index}>{words.join(" ")}</p>)}</div>
      <div key={run} className={styles.text} aria-hidden="true">
        {paragraphs.map((words, index) => {
          const from = start;
          start += words.length;
          const visible = Math.max(0, Math.min(words.length, shown - from));
          if (visible === 0 && index > 0) return null;
          const holdsCaret = shown === 0 ? index === 0 : shown > from && shown <= from + words.length;
          return (
            <p key={index} className={styles.paragraph}>
              {words.slice(0, visible).map((word, position) => <span key={position}><span className={styles.word}>{word}</span>{" "}</span>)}
              {caret && !whole && holdsCaret ? <span className={styles.caret} /> : null}
            </p>
          );
        })}
      </div>
      {controls ? (
        <div className={styles.footer}>
          <span className={styles.track} aria-hidden="true"><span className={styles.fill} style={{ transform: `scaleX(${total ? shown / total : 0})` }} /></span>
          <div className={styles.status} role="status">
            <span className={styles.indicator} aria-hidden="true">
              <AnimatePresence initial={false} mode="popLayout">
                {done ? (
                  <motion.span key="done" className={styles.check} initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={motionTokens.spring.snappy}><Check size={11} strokeWidth={3} /></motion.span>
                ) : (
                  <motion.span key="dot" className={styles.dot} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: motionTokens.duration.instant }} />
                )}
              </AnimatePresence>
            </span>
            <span className={styles.label}>{done ? "Complete" : isPlaying ? "Streaming" : "Paused"}</span>
            <span className={styles.count} aria-hidden={!done}>{done ? `${total} words` : `${shown} / ${total}`}</span>
          </div>
          {reduceMotion || instant ? null : (
            <div className={styles.controls}>
              <button type="button" className={styles.control} onClick={() => setPlaying(!isPlaying)} disabled={done} aria-label={isPlaying ? "Pause" : "Resume"} title={isPlaying ? "Pause" : "Resume"}>
                {isPlaying && !done ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
              </button>
              <button type="button" className={styles.control} onClick={() => setCount(total)} disabled={done} aria-label="Skip to the end" title="Skip to the end">
                <SkipForward size={15} aria-hidden="true" />
              </button>
              <button type="button" className={styles.control} data-replay onClick={replay} aria-label="Replay" title="Replay">
                <RotateCcw key={run} className={run > 0 ? styles.turn : undefined} size={15} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default StreamingResponse;
