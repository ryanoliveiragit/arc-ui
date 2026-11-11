"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Copy, Download, ImageOff, RefreshCw, Sparkles } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import { useCopyFeedback } from "@/lib/use-copy-feedback";
import styles from "./image-generation.module.css";

export type ImageGenerationStatus = "idle" | "generating" | "done" | "error";

export interface ImageGenerationProps {
  /** The prompt the image was requested with. */
  prompt: string;
  /** Address of the finished image. It is shown when the status is "done". */
  src?: string;
  /** Alternative text of the finished image. Defaults to the prompt. */
  alt?: string;
  /** Where the request is (controlled). Leave it out and the card runs a timed preview: `duration` of progress on mount and on every regenerate. */
  status?: ImageGenerationStatus;
  /** Progress from 0 to 1 while generating (controlled, used together with `status`). */
  progress?: number;
  /** Length of the built-in timed preview in milliseconds, when `status` is not controlled. */
  duration?: number;
  /** Name of the model or style, shown next to the prompt. */
  model?: string;
  /** Aspect ratio of the image frame, as a CSS `aspect-ratio` value. */
  aspectRatio?: string;
  /** Message shown when the status is "error". */
  error?: string;
  /** Called by Generate, Regenerate and Try again. Swap `src` here to show a new result. */
  onRegenerate?: () => void;
  /** Called when the built-in timed preview reaches the end. */
  onComplete?: () => void;
  /** Class name added to the root element. */
  className?: string;
}

/** The placeholder is a field of cells that a diagonal wave runs across. Keep in sync with the grid in the CSS. */
const COLUMNS = 8, ROWS = 6;
const cells = Array.from({ length: COLUMNS * ROWS }, (_, index) => ({ x: index % COLUMNS, y: Math.floor(index / COLUMNS) }));
const phases = ["Sketching the composition", "Adding detail", "Refining light and texture"] as const;
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];

/**
 * A card for one image request. While the image is being made, a field of cells shimmers behind a progress line and a phase
 * label; when it is ready the image resolves from blurred to sharp and the footer turns into the actions: regenerate, download, copy prompt.
 */
export function ImageGeneration({ prompt, src, alt, status, progress, duration = 4200, model, aspectRatio = "4 / 3", error = "The image could not be generated.", onRegenerate, onComplete, className }: ImageGenerationProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const controlled = status !== undefined;
  const [run, setRun] = useState<{ status: ImageGenerationStatus; progress: number; id: number }>({ status: "generating", progress: 0, id: 0 });
  const [loaded, setLoaded] = useState(false);
  const { state: copyState, copy } = useCopyFeedback();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // The timed preview: quick at first, slower near the end, the way real progress tends to feel.
  useEffect(() => {
    if (controlled || run.status !== "generating") return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = Math.min(1, (performance.now() - started) / Math.max(200, duration));
      if (elapsed >= 1) {
        window.clearInterval(timer);
        setRun(current => ({ ...current, status: "done", progress: 1 }));
        onCompleteRef.current?.();
      } else setRun(current => ({ ...current, progress: 1 - Math.pow(1 - elapsed, 1.7) }));
    }, 70);
    return () => window.clearInterval(timer);
  }, [controlled, run.status, run.id, duration]);

  const current = controlled ? status : run.status;
  const amount = Math.max(0, Math.min(1, controlled ? progress ?? 0 : run.progress));
  const percent = Math.round(amount * 100);
  const phase = phases[Math.min(phases.length - 1, Math.floor(amount * phases.length))]!;
  const showImage = current === "done" && Boolean(src);
  const revealed = showImage && loaded;
  // A new image waits for its own load before it is revealed.
  useEffect(() => { setLoaded(false); }, [src]);
  const imageRef = useCallback((node: HTMLImageElement | null) => { if (node?.complete && node.naturalWidth > 0) setLoaded(true); }, []);

  const regenerate = () => {
    if (!controlled) setRun(previous => ({ status: "generating", progress: 0, id: previous.id + 1 }));
    onRegenerate?.();
  };
  const fade = { duration: reduceMotion ? 0 : motionTokens.duration.standard, ease: standard };
  const swap = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 6, filter: `blur(${motionTokens.blur.soft}px)` }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, exit: { opacity: 0, y: -6, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } }, transition: { duration: motionTokens.duration.standard, ease: enter } };

  return (
    <article className={[styles.root, className].filter(Boolean).join(" ")} data-status={current}>
      <header className={styles.header}>
        <span className={styles.badge} aria-hidden="true"><Sparkles size={15} /></span>
        <div className={styles.heading}>
          <p className={styles.prompt}>{prompt}</p>
          {model ? <p className={styles.model}>{model}</p> : null}
        </div>
      </header>

      <div
        className={styles.frame}
        style={{ aspectRatio }}
        {...(current === "generating" ? { role: "progressbar", "aria-label": "Generating image", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": percent, "aria-valuetext": `${phase}, ${percent}%` } : {})}
      >
        <AnimatePresence initial={false}>
          {!revealed && current !== "error" ? (
            <motion.div key="placeholder" className={styles.placeholder} data-active={current === "generating" || (showImage && !loaded)} aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : motionTokens.duration.considered, ease: standard }}>
              {cells.map((cell, index) => <span key={index} className={styles.cell} style={{ "--d": cell.x + cell.y } as CSSProperties} />)}
            </motion.div>
          ) : null}
        </AnimatePresence>
        {showImage ? (
          <motion.img
            key={src}
            ref={imageRef}
            className={styles.image}
            src={src}
            alt={alt ?? prompt}
            onLoad={() => setLoaded(true)}
            initial={false}
            animate={loaded ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: reduceMotion ? 1 : 1.08, filter: reduceMotion ? "blur(0px)" : "blur(28px)" }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: enter, opacity: { duration: 0.45, ease: standard } }}
            draggable={false}
          />
        ) : null}
        {current === "error" ? (
          <div className={styles.failed} role="alert">
            <ImageOff size={22} aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}
        <span className={styles.progress} aria-hidden="true" data-visible={current === "generating"}><span className={styles.progressFill} style={{ transform: `scaleX(${amount})` }} /></span>
      </div>

      <footer className={styles.footer}>
        <AnimatePresence initial={false} mode="popLayout">
          {current === "generating" ? (
            <motion.div key="progress" className={styles.working} {...swap}>
              <span className={styles.phase}>
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span key={phase} className={styles.phaseText} {...swap}>{phase}</motion.span>
                </AnimatePresence>
              </span>
              <span className={styles.percent}>{percent}%</span>
            </motion.div>
          ) : current === "done" ? (
            <motion.div key="actions" className={styles.actions} initial="hidden" animate="shown" exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : motionTokens.duration.fast } }} variants={{ shown: { transition: { staggerChildren: reduceMotion ? 0 : 0.06, delayChildren: reduceMotion ? 0 : 0.18 } } }}>
              {[
                <button key="regenerate" type="button" className={styles.action} onClick={regenerate}><RefreshCw size={15} aria-hidden="true" />Regenerate</button>,
                src ? <a key="download" className={styles.action} href={src} download><Download size={15} aria-hidden="true" />Download</a> : null,
                <button key="copy" type="button" className={styles.action} onClick={() => { void copy(prompt); }}>
                  <span className={styles.swapIcon} aria-hidden="true">
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.span key={copyState === "copied" ? "check" : "copy"} className={styles.swapGlyph} initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0, transition: fade }} transition={motionTokens.spring.snappy}>
                        {copyState === "copied" ? <Check size={15} /> : <Copy size={15} />}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  {copyState === "copied" ? "Copied" : "Copy prompt"}
                </button>,
              ].filter(Boolean).map((action, index) => (
                <motion.span key={index} className={styles.actionSlot} variants={{ hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }, shown: { opacity: 1, y: 0, scale: 1, transition: reduceMotion ? { duration: 0 } : motionTokens.spring.snappy } }}>{action}</motion.span>
              ))}
            </motion.div>
          ) : (
            <motion.div key={current} className={styles.actions} {...swap}>
              <button type="button" className={styles.action} data-primary onClick={regenerate}>
                {current === "error" ? <RefreshCw size={15} aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />}
                {current === "error" ? "Try again" : "Generate"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
      <span className={styles.srOnly} role="status">{current === "done" ? "Image ready" : ""}</span>
    </article>
  );
}

export default ImageGeneration;
