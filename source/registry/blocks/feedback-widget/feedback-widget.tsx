"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { Angry, Frown, Laugh, Meh, MessageSquareText, Smile, X } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./feedback-widget.module.css";

export type FeedbackMood = "terrible" | "bad" | "okay" | "good" | "great";

export interface Feedback {
  /** The mood that was picked. */
  mood: FeedbackMood;
  /** The optional message, trimmed. */
  message: string;
}

export interface FeedbackWidgetProps {
  /** Text on the floating button. */
  label?: string;
  /** Heading of the form. */
  title?: string;
  /** Placeholder of the message field. */
  placeholder?: string;
  /** Heading of the thank-you state. */
  thanksTitle?: string;
  /** Line under the thank-you heading. */
  thanksMessage?: string;
  /** Receives the feedback. Return a promise to hold the sending state until it settles; reject it to show an error and keep the form. */
  onSubmit?: (feedback: Feedback) => void | Promise<void>;
  /** Whether the form is open (controlled). */
  open?: boolean;
  /** Whether the form starts open (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the form opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Corner the widget sits in. */
  placement?: "bottom-right" | "bottom-left";
  /** Pins the widget inside the nearest positioned ancestor instead of the window, for panels and previews. */
  contained?: boolean;
  /** Extra class for the root. */
  className?: string;
}

const moods: { id: FeedbackMood; label: string; icon: typeof Smile }[] = [
  { id: "terrible", label: "Terrible", icon: Angry },
  { id: "bad", label: "Bad", icon: Frown },
  { id: "okay", label: "Okay", icon: Meh },
  { id: "good", label: "Good", icon: Smile },
  { id: "great", label: "Great", icon: Laugh },
];
const MAX_LENGTH = 400;
const ease = [...motionTokens.ease.enter] as [number, number, number, number];
const still: Transition = { duration: 0 };

/**
 * A floating feedback button that grows into a small form, from its own corner, on a layout spring. Pick a mood (the
 * highlight glides between faces), add a note, and the button walks through sending into a drawn check and a thank-you.
 * Escape or a click outside closes it and returns focus to the button.
 */
export function FeedbackWidget({ label = "Feedback", title = "How is it going?", placeholder = "Tell us what happened (optional)", thanksTitle = "Thank you", thanksMessage = "Your feedback goes straight to the team.", onSubmit, open, defaultOpen = false, onOpenChange, placement = "bottom-right", contained = false, className }: FeedbackWidgetProps) {
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = open ?? internal;
  const [mood, setMood] = useState<FeedbackMood | null>(null);
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<"form" | "sending" | "done">("form");
  const [failed, setFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(isOpen);
  const timer = useRef<number | undefined>(undefined);
  const spring: Transition = reduce ? still : motionTokens.spring.morph;
  const fade: Transition = reduce ? still : { duration: motionTokens.duration.standard, ease };

  const setOpen = (next: boolean) => { if (open === undefined) setInternal(next); onOpenChange?.(next); };
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;
  const busy = phase === "sending";

  // Focus follows the morph: into the form when it opens, back to the button when it closes.
  useEffect(() => {
    if (isOpen === wasOpen.current) return;
    wasOpen.current = isOpen;
    if (isOpen) {
      rootRef.current?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')?.focus({ preventScroll: true });
    } else {
      window.clearTimeout(timer.current);
      setPhase("form"); setMood(null); setMessage(""); setFailed(false);
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || busy) return;
    const onPointerDown = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpenRef.current(false); };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, busy]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!mood || busy) return;
    setPhase("sending");
    setFailed(false);
    try {
      // With no handler the widget still shows its sending state for a moment.
      await (onSubmit ? onSubmit({ mood, message: message.trim() }) : new Promise<void>(resolve => { timer.current = window.setTimeout(resolve, 1100); }));
      setPhase("done");
      timer.current = window.setTimeout(() => setOpenRef.current(false), 2600);
    } catch {
      setPhase("form");
      setFailed(true);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && isOpen && !busy) { event.preventDefault(); event.stopPropagation(); setOpen(false); }
  };
  const onMoodKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const index = moods.findIndex(entry => entry.id === mood);
    const next = moods[(index === -1 ? (step === 1 ? 0 : moods.length - 1) : index + step + moods.length) % moods.length];
    if (!next) return;
    setMood(next.id);
    event.currentTarget.querySelector<HTMLElement>(`[data-mood="${next.id}"]`)?.focus();
  };
  const picked = moods.find(entry => entry.id === mood);

  return (
    <div ref={rootRef} className={[styles.root, styles[placement], contained ? styles.contained : "", className].filter(Boolean).join(" ")} onKeyDown={onKeyDown}>
      <LayoutGroup id={uid}>
        {/* One shell: it is the button when closed and the panel when open, so the size change is a single morph. */}
        <motion.div layout className={styles.shell} data-open={isOpen ? "" : undefined} style={{ borderRadius: isOpen ? 26 : 24 }} transition={spring}>
          <AnimatePresence initial={false} mode="popLayout">
            {!isOpen ? (
              <motion.button key="trigger" ref={triggerRef} layout="position" type="button" className={styles.trigger} aria-haspopup="dialog" aria-expanded={false} onClick={() => setOpen(true)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: reduce ? 0 : motionTokens.duration.instant } }} transition={{ ...fade, layout: spring }}>
                <MessageSquareText size={18} aria-hidden="true" />
                {label}
              </motion.button>
            ) : (
              <motion.div key="panel" layout="position" className={styles.panel} role="dialog" aria-labelledby={`${uid}-title`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: reduce ? 0 : motionTokens.duration.instant } }} transition={{ ...fade, delay: reduce ? 0 : .08, layout: spring }}>
                <AnimatePresence initial={false} mode="popLayout">
                  {phase === "done" ? (
                    <motion.div key="done" className={styles.done} role="status" initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={fade}>
                      <motion.span className={styles.badge} initial={{ scale: reduce ? 1 : .5 }} animate={{ scale: 1 }} transition={reduce ? still : { type: "spring", visualDuration: .4, bounce: .35 }}>
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
                          <motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={reduce ? still : { duration: .42, ease, delay: .18 }} />
                        </svg>
                      </motion.span>
                      <h3 id={`${uid}-title`} className={styles.title}>{thanksTitle}</h3>
                      <p className={styles.note}>{thanksMessage}</p>
                      <button type="button" className={styles.ghost} onClick={() => setOpen(false)}>Close</button>
                    </motion.div>
                  ) : (
                    <motion.form key="form" className={styles.form} onSubmit={submit} exit={{ opacity: 0, transition: { duration: reduce ? 0 : motionTokens.duration.instant } }}>
                      <div className={styles.header}>
                        <h3 id={`${uid}-title`} className={styles.title}>{title}</h3>
                        <button type="button" className={styles.close} aria-label="Close feedback" disabled={busy} onClick={() => setOpen(false)}><X size={16} aria-hidden="true" /></button>
                      </div>
                      <div className={styles.moods} role="radiogroup" aria-label="Your mood" onKeyDown={onMoodKey}>
                        {moods.map((entry, index) => {
                          const selected = entry.id === mood;
                          const Icon = entry.icon;
                          return (
                            <button key={entry.id} type="button" role="radio" aria-checked={selected} aria-label={entry.label} data-mood={entry.id} tabIndex={selected || (!mood && index === 0) ? 0 : -1} disabled={busy} className={styles.mood} onClick={() => setMood(entry.id)}>
                              {selected ? <motion.span layoutId="mood" className={styles.moodFill} transition={spring} /> : null}
                              <motion.span className={styles.moodIcon} animate={{ scale: selected && !reduce ? [1, 1.28, 1] : 1, rotate: selected && !reduce ? [0, -10, 0] : 0 }} transition={reduce ? still : { duration: .4, ease }}><Icon size={24} strokeWidth={1.9} aria-hidden="true" /></motion.span>
                            </button>
                          );
                        })}
                      </div>
                      <p className={styles.moodName} aria-live="polite">
                        <AnimatePresence initial={false} mode="popLayout">
                          <motion.span key={picked?.id ?? "none"} initial={{ opacity: 0, y: reduce ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -6, transition: { duration: reduce ? 0 : motionTokens.duration.instant } }} transition={fade}>{picked ? picked.label : "Pick a face"}</motion.span>
                        </AnimatePresence>
                      </p>
                      <label className={styles.srOnly} htmlFor={`${uid}-message`}>Your feedback</label>
                      <div className={styles.field}>
                        <textarea id={`${uid}-message`} className={styles.textarea} rows={3} maxLength={MAX_LENGTH} placeholder={placeholder} value={message} disabled={busy} onChange={event => setMessage(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void submit(); }} />
                        <span className={styles.counter} aria-hidden="true">{message.length}/{MAX_LENGTH}</span>
                      </div>
                      {failed ? <p className={styles.error} role="alert">That did not go through. Please try again.</p> : null}
                      <motion.button type="submit" className={styles.submit} disabled={!mood || busy} aria-busy={busy} whileTap={reduce || !mood || busy ? undefined : { scale: .98 }} transition={motionTokens.spring.snappy}>
                        <AnimatePresence initial={false} mode="popLayout">
                          <motion.span key={busy ? "sending" : "idle"} className={styles.submitLabel} initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -8, transition: { duration: reduce ? 0 : motionTokens.duration.instant } }} transition={fade}>
                            {busy ? <><span className={styles.spinner} aria-hidden="true" />Sending</> : "Send feedback"}
                          </motion.span>
                        </AnimatePresence>
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}

/** Ready preview: a help article with the widget in its corner. `defaultOpen` starts with the panel open. */
export default function FeedbackWidgetPreview({ defaultOpen = false }: { defaultOpen?: boolean } = {}) {
  return (
    <section className={styles.preview}>
      <div className={styles.page}>
        <p className={styles.crumb}>Help center · Contacts</p>
        <h2 className={styles.pageTitle}>Import contacts from a spreadsheet</h2>
        <p className={styles.pageText}>Export your sheet as a CSV file, then open Contacts and choose Import. Columns named Name, Email and Company are matched for you; anything else can be mapped by hand before the import runs.</p>
        <p className={styles.pageText}>Rows with an email that already exists are merged, never duplicated. A summary shows what was added, what was updated and which rows were skipped.</p>
        <p className={styles.pageHint}>Was this article useful? Tell us with the button in the corner.</p>
        <FeedbackWidget contained defaultOpen={defaultOpen} />
      </div>
    </section>
  );
}
