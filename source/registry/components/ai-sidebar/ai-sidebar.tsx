"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import { ThinkingDots } from "@/registry/components/loading-states/loading-states";
import styles from "./ai-sidebar.module.css";

export interface AiSidebarMessage {
  /** Stable id of the message. */
  id: string;
  /** Who wrote it. */
  role: "user" | "assistant";
  /** The message. Text, or any node (a streaming response, a card). */
  content: ReactNode;
}

export interface AiSidebarProps {
  /** The page the assistant docks beside. */
  children: ReactNode;
  /** The conversation, oldest first. */
  messages: AiSidebarMessage[];
  /** Whether the panel is open (controlled). */
  open?: boolean;
  /** Whether the panel starts open (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the launcher, the close button or Escape opens or closes the panel. */
  onOpenChange?: (open: boolean) => void;
  /** Called with the trimmed text when the person sends a prompt or picks a suggestion. */
  onSend?: (text: string) => void;
  /** Shows the thinking indicator after the last message and holds the send button. */
  pending?: boolean;
  /** Prompt ideas shown as chips above the prompt box. Picking one sends it. */
  suggestions?: string[];
  /** Heading of the panel. */
  title?: string;
  /** Short line under the heading, such as what the assistant can see. */
  subtitle?: string;
  /** Placeholder of the prompt box. */
  placeholder?: string;
  /** Text shown while the conversation is empty. */
  emptyText?: string;
  /** Side the panel docks on. */
  side?: "left" | "right";
  /** Width of the docked panel in pixels. */
  width?: number;
  /** Below this container width in pixels the panel slides over the page instead of pushing it aside. */
  overlayBelow?: number;
  /** Shows a floating button that opens the panel while it is closed. Turn it off when the page has its own trigger. */
  launcher?: boolean;
  /** Class name added to the root element. */
  className?: string;
}

const standard = [...motionTokens.ease.standard] as [number, number, number, number];
/** The prompt box stops growing at this height in px and scrolls instead. */
const MAX_PROMPT_HEIGHT = 132;

/**
 * An assistant panel docked beside the page. It slides in on a spring and pushes the page aside; in a narrow container it slides
 * over the page behind a scrim instead. Inside: a header, a message list that follows new messages, suggestion chips and a prompt
 * box that grows with the text. Enter sends, Shift+Enter adds a line, Escape closes.
 */
export function AiSidebar({ children, messages, open, defaultOpen = false, onOpenChange, onSend, pending = false, suggestions, title = "Assistant", subtitle, placeholder = "Ask anything", emptyText = "Ask about this page, or start from a suggestion.", side = "right", width = 360, overlayBelow = 640, launcher = true, className }: AiSidebarProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const titleId = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = open ?? internal;
  const [overlay, setOverlay] = useState(false);
  const [draft, setDraft] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(isOpen);
  const pinned = useRef(true);

  const setOpen = (next: boolean) => { if (open === undefined) setInternal(next); onOpenChange?.(next); };

  // The panel docks or overlays by the width of its own container, not the window, so it also works inside a split view.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => setOverlay(root.clientWidth < overlayBelow);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [overlayBelow]);

  // Opening moves focus to the prompt; closing hands it back to whatever opened the panel.
  useEffect(() => {
    if (wasOpen.current === isOpen) return;
    wasOpen.current = isOpen;
    if (isOpen) {
      const active = document.activeElement;
      returnFocus.current = active instanceof HTMLElement && active !== document.body ? active : null;
      promptRef.current?.focus({ preventScroll: true });
    } else if (rootRef.current?.contains(document.activeElement) || document.activeElement === document.body) {
      const target = returnFocus.current;
      if (target?.isConnected) target.focus({ preventScroll: true });
    }
  }, [isOpen]);

  // Follow the conversation: stay at the bottom while it grows, unless the reader has scrolled up.
  const toBottom = (smooth: boolean) => { const scroller = scrollerRef.current; if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: smooth && !reduceMotion ? "smooth" : "auto" }); };
  useEffect(() => { pinned.current = true; toBottom(true); }, [messages.length, pending]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => { if (pinned.current) toBottom(false); });
    observer.observe(list);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resize = () => {
    const field = promptRef.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, MAX_PROMPT_HEIGHT)}px`;
  };
  // Measured again when the layout changes, because the width of the box decides where the text wraps.
  useLayoutEffect(resize, [draft, overlay]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || pending) return;
    onSend?.(value);
    setDraft("");
  };
  const onSubmit = (event: FormEvent) => { event.preventDefault(); send(draft); };
  const onPromptKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(draft); }
  };
  const onPanelKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape" && !event.defaultPrevented) { event.stopPropagation(); setOpen(false); } };

  const spring: Transition = reduceMotion ? { duration: 0 } : motionTokens.spring.smooth;
  const away = side === "right" ? "100%" : "-100%";
  const dockAnimate = overlay ? { x: isOpen ? "0%" : away } : { width: isOpen ? width : 0 };

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} data-side={side} data-overlay={overlay} data-open={isOpen}>
      <div className={styles.content} inert={overlay && isOpen}>{children}</div>

      {overlay ? (
        <AnimatePresence>
          {isOpen ? <motion.div key="scrim" className={styles.scrim} onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : motionTokens.duration.standard, ease: standard }} /> : null}
        </AnimatePresence>
      ) : null}

      {/* Remounting on a mode change keeps a width animation from running into a slide animation. */}
      <motion.div key={overlay ? "overlay" : "dock"} className={styles.dock} initial={false} animate={dockAnimate} transition={spring} style={overlay ? { width: `min(100%, ${Math.max(width, 320)}px)` } : undefined}>
        <aside className={styles.panel} style={overlay ? undefined : { width }} aria-labelledby={titleId} inert={!isOpen} onKeyDown={onPanelKeyDown}>
          <header className={styles.header}>
            <span className={styles.badge} aria-hidden="true"><Sparkles size={15} /></span>
            <div className={styles.heading}>
              <h2 id={titleId} className={styles.title}>{title}</h2>
              {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
            </div>
            <button type="button" className={styles.iconButton} onClick={() => setOpen(false)} aria-label={`Close ${title}`}><X size={16} aria-hidden="true" /></button>
          </header>

          <div ref={scrollerRef} className={styles.scroller} onScroll={event => { const node = event.currentTarget; pinned.current = node.scrollHeight - node.scrollTop - node.clientHeight < 48; }}>
            {messages.length === 0 && !pending ? (
              <div className={styles.empty}>
                <span className={styles.emptyMark} aria-hidden="true"><Sparkles size={20} /></span>
                <p>{emptyText}</p>
              </div>
            ) : null}
            <ol ref={listRef} className={styles.messages} aria-live="polite" aria-label="Conversation">
              <AnimatePresence initial={false}>
                {messages.map(message => (
                  <motion.li
                    key={message.id}
                    className={styles.message}
                    data-role={message.role}
                    initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={reduceMotion ? { duration: 0 } : motionTokens.spring.gentle}
                  >
                    <span className={styles.srOnly}>{message.role === "user" ? "You: " : `${title}: `}</span>
                    <div className={styles.bubble}>{message.content}</div>
                  </motion.li>
                ))}
                {pending ? (
                  <motion.li key="pending" className={styles.message} data-role="assistant" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0 } }} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.gentle}>
                    <div className={styles.bubble} data-pending><ThinkingDots label={`${title} is thinking`} /></div>
                  </motion.li>
                ) : null}
              </AnimatePresence>
            </ol>
          </div>

          <footer className={styles.footer}>
            {suggestions?.length ? (
              <ul className={styles.suggestions} aria-label="Suggestions">
                {suggestions.map((suggestion, index) => (
                  <motion.li
                    key={suggestion}
                    initial={false}
                    animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={reduceMotion ? { duration: 0 } : { ...motionTokens.spring.gentle, delay: isOpen ? 0.14 + index * motionTokens.stagger.item * 1.5 : 0 }}
                  >
                    <button type="button" className={styles.suggestion} onClick={() => send(suggestion)} disabled={pending}>{suggestion}</button>
                  </motion.li>
                ))}
              </ul>
            ) : null}
            <form className={styles.prompt} onSubmit={onSubmit}>
              <textarea ref={promptRef} className={styles.field} rows={1} value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={onPromptKeyDown} placeholder={placeholder} aria-label={`Message ${title}`} />
              <button type="submit" className={styles.send} disabled={!draft.trim() || pending} aria-label="Send message"><ArrowUp size={16} strokeWidth={2.5} aria-hidden="true" /></button>
            </form>
          </footer>
        </aside>
      </motion.div>

      {launcher ? (
        <AnimatePresence initial={false}>
          {!isOpen ? (
            <motion.button
              key="launcher"
              type="button"
              className={styles.launcher}
              onClick={() => setOpen(true)}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.8, transition: { duration: motionTokens.duration.fast, ease: standard } }}
              transition={reduceMotion ? { duration: 0 } : { ...motionTokens.spring.gentle, delay: 0.12 }}
            >
              <Sparkles size={15} aria-hidden="true" />
              Ask {title.toLowerCase()}
            </motion.button>
          ) : null}
        </AnimatePresence>
      ) : null}
    </div>
  );
}

export default AiSidebar;
