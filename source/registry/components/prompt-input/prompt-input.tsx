"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { ArrowUp, Check, ChevronDown, FileText, Plus, X } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./prompt-input.module.css";

export interface PromptAttachment {
  /** Stable id, used as the key and passed back on removal. */
  id: string;
  /** File or item name shown on the chip. */
  name: string;
  /** Short note after the name, such as a size or a type. */
  detail?: string;
}

export interface PromptModel {
  /** Value reported by `onModelChange` and `onSubmit`. */
  id: string;
  /** Name shown on the trigger and in the menu. */
  label: string;
  /** One line under the name in the menu. */
  description?: string;
}

export interface PromptSubmission {
  /** The trimmed prompt text. */
  value: string;
  /** Attachments on the prompt when it was sent. */
  attachments: PromptAttachment[];
  /** Selected model id, when models are given. */
  model?: string;
}

/**
 * The prompt box of an assistant. It grows with the text up to `maxRows`, carries attachment chips and a model menu, and its
 * send button turns into a stop button while `running` is true. Enter sends; Shift+Enter adds a line.
 */
export interface PromptInputProps {
  /** Controlled text. */
  value?: string;
  /** Text the box starts with when uncontrolled. */
  defaultValue?: string;
  /** Called on every edit, and with an empty string after a send. */
  onValueChange?: (value: string) => void;
  /** Called when the person sends (Enter or the send button) with text or attachments present. */
  onSubmit?: (submission: PromptSubmission) => void;
  /** True while a response is being generated: the send button becomes a stop button. */
  running?: boolean;
  /** Called when the stop button is pressed. */
  onStop?: () => void;
  /** Controlled attachment list. */
  attachments?: PromptAttachment[];
  /** Attachments the box starts with when uncontrolled. */
  defaultAttachments?: PromptAttachment[];
  /** Called when a chip is removed, files are picked, or the list is cleared after a send. */
  onAttachmentsChange?: (attachments: PromptAttachment[]) => void;
  /** Called when the attach button is pressed. Without it the button opens the system file picker and adds the chosen files as chips. */
  onAttach?: () => void;
  /** Models offered in the menu. The menu is hidden when the list is empty. */
  models?: PromptModel[];
  /** Controlled model id. */
  model?: string;
  /** Model selected at first when uncontrolled. Defaults to the first one. */
  defaultModel?: string;
  /** Called when another model is picked. */
  onModelChange?: (model: string) => void;
  /** Placeholder text of the empty box. */
  placeholder?: string;
  /** Accessible name of the text box. */
  label?: string;
  /** Lines the box grows to before it scrolls. */
  maxRows?: number;
  /** Empties the text and the attachments after a send. */
  clearOnSubmit?: boolean;
  /** Blocks typing, attaching and sending. */
  disabled?: boolean;
  /** Render the model menu inside this element and limit collisions to it (used by the demo stages). */
  container?: HTMLElement | null;
  /** Extra class for the root element. */
  className?: string;
}

const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const fade: Transition = { duration: motionTokens.duration.fast, ease: standard };
const noAttachments: PromptAttachment[] = [];
const noModels: PromptModel[] = [];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PromptInput({ value, defaultValue = "", onValueChange, onSubmit, running = false, onStop, attachments, defaultAttachments = noAttachments, onAttachmentsChange, onAttach, models = noModels, model, defaultModel, onModelChange, placeholder = "Ask anything", label = "Prompt", maxRows = 8, clearOnSubmit = true, disabled = false, container, className }: PromptInputProps) {
  const reduce = !!useReducedMotion();
  const hintId = useId();
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const picked = useRef(0);
  const [ownValue, setOwnValue] = useState(defaultValue);
  const [ownAttachments, setOwnAttachments] = useState(defaultAttachments);
  const [ownModel, setOwnModel] = useState(defaultModel ?? models[0]?.id);
  const [height, setHeight] = useState<number | null>(null);
  const [scrolls, setScrolls] = useState(false);
  const text = value ?? ownValue;
  const files = attachments ?? ownAttachments;
  const modelId = model ?? ownModel ?? models[0]?.id;
  const current = models.find(item => item.id === modelId) ?? models[0];
  const canSend = !disabled && !running && (text.trim().length > 0 || files.length > 0);

  const setText = useCallback((next: string) => { if (value === undefined) setOwnValue(next); onValueChange?.(next); }, [onValueChange, value]);
  const setFiles = useCallback((next: PromptAttachment[]) => { if (attachments === undefined) setOwnAttachments(next); onAttachmentsChange?.(next); }, [attachments, onAttachmentsChange]);

  // Measure the text at its natural height, then let the wrapper spring to it. Past maxRows the box scrolls instead of growing.
  const measure = useCallback(() => {
    const area = areaRef.current;
    if (!area) return;
    const style = getComputedStyle(area);
    const line = parseFloat(style.lineHeight) || 22;
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const previous = area.style.height;
    area.style.height = "0px";
    const natural = area.scrollHeight;
    area.style.height = previous;
    const limit = Math.round(line * maxRows + padding);
    setHeight(Math.max(Math.round(line + padding), Math.min(natural, limit)));
    setScrolls(natural > limit + 1);
  }, [maxRows]);
  useLayoutEffect(measure, [measure, text]);
  useEffect(() => {
    const area = areaRef.current;
    if (!area || typeof ResizeObserver === "undefined") return;
    let width = area.clientWidth;
    const observer = new ResizeObserver(() => { if (area.clientWidth !== width) { width = area.clientWidth; measure(); } });
    observer.observe(area);
    return () => observer.disconnect();
  }, [measure]);

  function submit() {
    if (!canSend) return;
    onSubmit?.({ value: text.trim(), attachments: files, model: current?.id });
    if (clearOnSubmit) { setText(""); if (files.length) setFiles([]); }
    areaRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter during text composition (IME) confirms the composition; it must not send.
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  }

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files ?? []).map((file): PromptAttachment => ({ id: `file-${++picked.current}-${file.name}`, name: file.name, detail: formatSize(file.size) }));
    if (chosen.length) setFiles([...files, ...chosen]);
    event.target.value = "";
  }

  // A press on the box's own padding lands the caret in the text, as if the whole surface were the field.
  function onSurfacePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || (event.target as Element).closest("button, textarea, input, a, [role='menu']")) return;
    event.preventDefault();
    areaRef.current?.focus();
  }

  const chipMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: fade }
    : { initial: { opacity: 0, scale: 0.7 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.7, transition: fade }, transition: { ...motionTokens.spring.snappy, opacity: fade, layout: motionTokens.spring.smooth } };
  const stopping = running;

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} data-disabled={disabled || undefined} data-running={running || undefined} onPointerDown={onSurfacePointerDown}>
      {/* The chip tray opens its own height, so the box grows instead of jumping when the first file lands. */}
      <AnimatePresence initial={false}>
        {files.length ? (
          <motion.div key="tray" className={styles.tray} initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={reduce ? fade : { height: motionTokens.spring.smooth, opacity: fade }}>
            <ul className={styles.chips} aria-label="Attachments">
              <AnimatePresence mode="popLayout" initial={false}>
                {files.map(file => (
                  <motion.li key={file.id} className={styles.chip} layout={reduce ? false : "position"} {...chipMotion}>
                    <FileText className={styles.chipIcon} width={14} height={14} strokeWidth={1.9} aria-hidden="true" />
                    <span className={styles.chipName}>{file.name}</span>
                    {file.detail ? <span className={styles.chipDetail}>{file.detail}</span> : null}
                    <button type="button" className={styles.chipRemove} aria-label={`Remove ${file.name}`} disabled={disabled} onClick={() => setFiles(files.filter(item => item.id !== file.id))}><X width={12} height={12} strokeWidth={2.25} aria-hidden="true" /></button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div className={styles.grow} initial={false} animate={height === null ? undefined : { height }} transition={reduce ? { duration: 0 } : motionTokens.spring.snappy}>
        <textarea ref={areaRef} className={styles.area} rows={1} value={text} placeholder={placeholder} aria-label={label} aria-describedby={hintId} disabled={disabled} data-scrolls={scrolls || undefined} style={height === null ? undefined : { height }} onChange={event => setText(event.target.value)} onKeyDown={onKeyDown} />
      </motion.div>
      <span id={hintId} className={styles.srOnly}>Press Enter to send, Shift and Enter for a new line.</span>

      <div className={styles.bar}>
        <button type="button" className={styles.tool} aria-label="Attach files" disabled={disabled} onClick={() => { if (onAttach) onAttach(); else fileRef.current?.click(); }}><Plus width={18} height={18} strokeWidth={2} aria-hidden="true" /></button>
        {onAttach ? null : <input ref={fileRef} className={styles.srOnly} type="file" multiple tabIndex={-1} aria-hidden="true" onChange={onPick} />}
        {current ? (
          <Menu.Root>
            <Menu.Trigger className={styles.model} type="button" disabled={disabled} aria-label={`Model: ${current.label}`}>
              <span className={styles.modelLabel}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={current.id} className={styles.modelText} initial={reduce ? { opacity: 0 } : { opacity: 0, y: "55%", filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-55%", filter: `blur(${motionTokens.blur.subtle}px)` }} transition={fade}>{current.label}</motion.span>
                </AnimatePresence>
              </span>
              <ChevronDown className={styles.chevron} width={14} height={14} strokeWidth={2} aria-hidden="true" />
            </Menu.Trigger>
            <Menu.Portal container={container ?? undefined}>
              <Menu.Content className={styles.menu} side="top" align="start" sideOffset={8} collisionPadding={12} collisionBoundary={container ?? undefined} loop>
                <Menu.Label className={styles.menuLabel}>Model</Menu.Label>
                <Menu.RadioGroup value={current.id} onValueChange={next => { if (model === undefined) setOwnModel(next); onModelChange?.(next); }}>
                  {models.map((item, index) => (
                    <Menu.RadioItem key={item.id} className={styles.option} value={item.id} style={{ "--i": index } as CSSProperties}>
                      <span className={styles.optionCopy}>
                        <span className={styles.optionName}>{item.label}</span>
                        {item.description ? <span className={styles.optionNote}>{item.description}</span> : null}
                      </span>
                      <Menu.ItemIndicator className={styles.optionCheck}><Check width={15} height={15} strokeWidth={2.25} aria-hidden="true" /></Menu.ItemIndicator>
                    </Menu.RadioItem>
                  ))}
                </Menu.RadioGroup>
              </Menu.Content>
            </Menu.Portal>
          </Menu.Root>
        ) : null}
        <span className={styles.spacer} />
        <span className={styles.hint} aria-hidden="true"><kbd>Enter</kbd> to send</span>
        {/* One button, two jobs: the arrow leaves upward as the prompt is sent, and the stop square grows in its place. */}
        <button type="button" className={styles.send} data-mode={stopping ? "stop" : "send"} aria-label={stopping ? "Stop response" : "Send prompt"} disabled={stopping ? disabled || !onStop : !canSend} onClick={() => { if (stopping) onStop?.(); else submit(); }}>
          {stopping ? <svg className={styles.spinner} viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21.5" /></svg> : null}
          <AnimatePresence mode="popLayout" initial={false}>
            {stopping
              ? <motion.span key="stop" className={styles.glyph} initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.3 }} transition={reduce ? fade : { ...motionTokens.spring.snappy, opacity: fade }}><span className={styles.square} /></motion.span>
              : <motion.span key="send" className={styles.glyph} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -14 }} transition={reduce ? fade : { ...motionTokens.spring.snappy, opacity: fade }}><ArrowUp width={18} height={18} strokeWidth={2.4} aria-hidden="true" /></motion.span>}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

export default PromptInput;
