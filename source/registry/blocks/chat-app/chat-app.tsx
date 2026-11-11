"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { ArrowUp, Check, Copy, PanelLeft, RefreshCw, Sparkles, Square, SquarePen } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import { useCopyFeedback } from "@/lib/use-copy-feedback";
import { StreamingResponse, takeWords } from "@/registry/components/streaming-response/streaming-response";
import { ThinkingShimmer } from "@/registry/components/loading-states/loading-states";
import { sampleConversations, sampleReply, sampleSuggestions, sampleUser } from "./chat-app-data";
import type { ChatConversation, ChatMessage, ChatSuggestion, ChatUser } from "./chat-app-data";
import styles from "./chat-app.module.css";

export type { ChatConversation, ChatMessage, ChatSuggestion, ChatUser } from "./chat-app-data";

export interface ChatAppProps {
  /** Conversations the screen starts with. The first one is open. */
  conversations?: ChatConversation[];
  /** Prompt ideas shown in an empty conversation. */
  suggestions?: ChatSuggestion[];
  /** Produces the simulated reply to a prompt. `attempt` grows by one on every regenerate. Replace it with your own canned answers. */
  reply?: (prompt: string, attempt: number) => string;
  /** Called when the person sends a prompt, with the conversation it went to. */
  onSend?: (prompt: string, conversationId: string) => void;
  /** Name of the assistant, used in labels. */
  assistantName?: string;
  /** The signed-in person shown at the foot of the conversation list. */
  user?: ChatUser;
  /** Words per second of the streamed replies. */
  speed?: number;
  /** Height of the screen, as a CSS length or a number of pixels. Defaults to the full viewport height. */
  height?: number | string;
  /** Class name added to the root element. */
  className?: string;
}

const standard = [...motionTokens.ease.standard] as [number, number, number, number];
/** Below this width in px the conversation list becomes a drawer. */
const COMPACT_BELOW = 760;
const MAX_PROMPT_HEIGHT = 168;
const titleFrom = (prompt: string) => { const line = prompt.replace(/\s+/g, " ").trim(); return line.length > 44 ? `${line.slice(0, 43).trimEnd()}…` : line; };

function AssistantActions({ text, canRegenerate, onRegenerate }: { text: string; canRegenerate: boolean; onRegenerate: () => void }) {
  const reduceMotion = useReducedMotion() ?? false;
  const { state, copy } = useCopyFeedback();
  const copied = state === "copied";
  return (
    <motion.div className={styles.actions} initial={reduceMotion ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { duration: motionTokens.duration.standard, ease: standard, delay: 0.1 }}>
      <button type="button" className={styles.action} onClick={() => { void copy(text); }} aria-label={copied ? "Copied" : "Copy reply"} title="Copy">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={copied ? "check" : "copy"} className={styles.glyph} initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0, transition: { duration: reduceMotion ? 0 : motionTokens.duration.instant } }} transition={motionTokens.spring.snappy}>
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
          </motion.span>
        </AnimatePresence>
      </button>
      {canRegenerate ? <button type="button" className={styles.action} onClick={onRegenerate} aria-label="Regenerate reply" title="Regenerate"><RefreshCw size={15} aria-hidden="true" /></button> : null}
    </motion.div>
  );
}

/**
 * A complete chat screen: a list of conversations, the thread of the open one and a prompt box. Replies are simulated in the browser:
 * a short "thinking" beat, then the answer streams in word by word and can be stopped, copied or regenerated. In a narrow container
 * the conversation list turns into a drawer.
 */
export function ChatApp({ conversations: initial = sampleConversations, suggestions = sampleSuggestions, reply = sampleReply, onSend, assistantName = "Assistant", user = sampleUser, speed = 26, height, className }: ChatAppProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const scope = useId();
  const [conversations, setConversations] = useState(initial);
  const [activeId, setActiveId] = useState(initial[0]?.id ?? "");
  const [generating, setGenerating] = useState<{ conversationId: string; messageId: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [compact, setCompact] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const newChatRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const shownWords = useRef(0);
  const ids = useRef(0);
  const attempts = useRef(0);
  const pinned = useRef(true);
  const active = conversations.find(conversation => conversation.id === activeId) ?? conversations[0];
  const busy = generating !== null;
  const nextId = (prefix: string) => `${prefix}-${++ids.current}`;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => setCompact(root.clientWidth < COMPACT_BELOW);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { if (!compact) setDrawer(false); }, [compact]);
  const drawerWas = useRef(false);
  useEffect(() => {
    if (drawerWas.current === drawer) return;
    drawerWas.current = drawer;
    if (drawer) newChatRef.current?.focus({ preventScroll: true });
    else if (compact) menuRef.current?.focus({ preventScroll: true });
  }, [drawer, compact]);

  // The thread follows new text to the bottom unless the reader has scrolled up.
  const toBottom = (smooth: boolean) => { const scroller = scrollerRef.current; if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: smooth && !reduceMotion ? "smooth" : "auto" }); };
  useLayoutEffect(() => { pinned.current = true; toBottom(false); }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { pinned.current = true; toBottom(true); }, [active?.messages.length]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    const observer = new ResizeObserver(() => { if (pinned.current) toBottom(false); });
    observer.observe(thread);
    return () => observer.disconnect();
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const field = promptRef.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, MAX_PROMPT_HEIGHT)}px`;
    // Measured again when the layout changes, because the width of the box decides where the text wraps.
  }, [draft, compact]);

  const patchMessage = (conversationId: string, messageId: string, patch: (message: ChatMessage) => ChatMessage) => {
    setConversations(list => list.map(conversation => conversation.id !== conversationId ? conversation : { ...conversation, messages: conversation.messages.map(message => message.id === messageId ? patch(message) : message) }));
  };
  const startReply = (conversationId: string, messageId: string) => {
    shownWords.current = 0;
    setGenerating({ conversationId, messageId });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => patchMessage(conversationId, messageId, message => ({ ...message, state: "streaming" })), 950);
  };
  /** Ends the reply in progress: "done" keeps the whole text, "stopped" keeps only the words that had appeared. */
  const finish = (how: "done" | "stopped") => {
    if (!generating) return;
    window.clearTimeout(timer.current);
    const words = shownWords.current;
    patchMessage(generating.conversationId, generating.messageId, message => how === "done" ? { ...message, state: "done" } : { ...message, state: "stopped", text: message.state === "thinking" ? "" : takeWords(message.text, words) });
    setGenerating(null);
  };

  const send = (text: string) => {
    const prompt = text.trim();
    if (!prompt || busy || !active) return;
    const replyId = nextId("reply");
    const messages: ChatMessage[] = [{ id: nextId("prompt"), role: "user", text: prompt, state: "done" }, { id: replyId, role: "assistant", text: reply(prompt, 0), state: "thinking" }];
    setConversations(list => list.map(conversation => conversation.id !== active.id ? conversation : { ...conversation, title: conversation.messages.length === 0 ? titleFrom(prompt) : conversation.title, updated: "Now", messages: [...conversation.messages, ...messages] }));
    setDraft("");
    startReply(active.id, replyId);
    onSend?.(prompt, active.id);
  };
  const regenerate = () => {
    if (busy || !active) return;
    const last = active.messages[active.messages.length - 1];
    const prompt = [...active.messages].reverse().find(message => message.role === "user");
    if (!last || last.role !== "assistant" || !prompt) return;
    attempts.current += 1;
    patchMessage(active.id, last.id, message => ({ ...message, text: reply(prompt.text, attempts.current), state: "thinking" }));
    startReply(active.id, last.id);
  };
  const select = (id: string) => {
    // A reply still arriving when the reader leaves simply finishes in the background.
    if (id !== activeId) finish("done");
    setActiveId(id);
    setDrawer(false);
  };
  const newChat = () => {
    finish("done");
    const empty = conversations.find(conversation => conversation.messages.length === 0);
    if (empty) setActiveId(empty.id);
    else {
      const id = nextId("chat");
      setConversations(list => [{ id, title: "New chat", updated: "Now", messages: [] }, ...list]);
      setActiveId(id);
    }
    setDrawer(false);
    promptRef.current?.focus({ preventScroll: true });
  };

  const onSubmit = (event: FormEvent) => { event.preventDefault(); if (busy) finish("stopped"); else send(draft); };
  const onPromptKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!busy) send(draft); }
  };
  const spring: Transition = reduceMotion ? { duration: 0 } : motionTokens.spring.smooth;
  const pop: Transition = reduceMotion ? { duration: 0 } : motionTokens.spring.gentle;
  const lastMessage = active?.messages[active.messages.length - 1];

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} style={height === undefined ? undefined : { height }} data-compact={compact} data-drawer={drawer} onKeyDown={event => { if (event.key === "Escape" && drawer) { event.stopPropagation(); setDrawer(false); } }}>
      <AnimatePresence>
        {compact && drawer ? <motion.div key="scrim" className={styles.scrim} onClick={() => setDrawer(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : motionTokens.duration.standard, ease: standard }} /> : null}
      </AnimatePresence>

      <motion.nav className={styles.sidebar} aria-label="Conversations" inert={compact && !drawer} initial={false} animate={{ x: compact && !drawer ? "-100%" : "0%" }} transition={spring}>
        <div className={styles.sidebarTop}>
          <span className={styles.brand}><span className={styles.brandMark} aria-hidden="true"><Sparkles size={14} /></span>Chats</span>
          <button ref={newChatRef} type="button" className={styles.iconButton} onClick={newChat} aria-label="New chat" title="New chat"><SquarePen size={16} aria-hidden="true" /></button>
        </div>
        <LayoutGroup>
          <ul className={styles.conversations}>
            <AnimatePresence initial={false}>
              {conversations.map(conversation => {
                const current = conversation.id === active?.id;
                const preview = conversation.messages[conversation.messages.length - 1]?.text.replace(/\s+/g, " ") ?? "No messages yet";
                return (
                  <motion.li key={conversation.id} className={styles.conversationItem} layout={reduceMotion ? false : "position"} initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={pop}>
                    {current ? <motion.span layoutId={`${scope}-active`} className={styles.activeMark} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.morph} /> : null}
                    <button type="button" className={styles.conversation} onClick={() => select(conversation.id)} aria-current={current ? "true" : undefined}>
                      <span className={styles.conversationTop}>
                        <span className={styles.conversationTitle}>{conversation.title}</span>
                        <span className={styles.conversationTime}>{conversation.updated}</span>
                      </span>
                      <span className={styles.conversationPreview}>{preview || "Stopped"}</span>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </LayoutGroup>
        <div className={styles.user}>
          {user.avatar ? <img className={styles.avatar} src={user.avatar} alt="" width={32} height={32} /> : <span className={styles.avatar} aria-hidden="true">{user.name.charAt(0)}</span>}
          <span className={styles.userText}><span className={styles.userName}>{user.name}</span>{user.detail ? <span className={styles.userDetail}>{user.detail}</span> : null}</span>
        </div>
      </motion.nav>

      <section className={styles.main} aria-label={active ? active.title : "Chat"} inert={compact && drawer}>
        <header className={styles.header}>
          {compact ? <button ref={menuRef} type="button" className={styles.iconButton} onClick={() => setDrawer(true)} aria-label="Show conversations" aria-expanded={drawer}><PanelLeft size={16} aria-hidden="true" /></button> : null}
          <h2 className={styles.title}>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span key={active?.title ?? "none"} className={styles.titleText} initial={reduceMotion ? false : { opacity: 0, y: 6, filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, transition: { duration: 0 } }} transition={reduceMotion ? { duration: 0 } : { duration: motionTokens.duration.standard, ease: standard }}>{active?.title ?? "Chat"}</motion.span>
            </AnimatePresence>
          </h2>
          <span className={styles.model}><span className={styles.modelDot} aria-hidden="true" />Simulated replies</span>
        </header>

        <div ref={scrollerRef} className={styles.scroller} onScroll={event => { const node = event.currentTarget; pinned.current = node.scrollHeight - node.scrollTop - node.clientHeight < 56; }}>
          <motion.div key={active?.id} ref={threadRef} className={styles.thread} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { duration: motionTokens.duration.standard, ease: standard }}>
            {active && active.messages.length === 0 ? (
              <div className={styles.empty}>
                <motion.span className={styles.emptyMark} aria-hidden="true" initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={pop}><Sparkles size={22} /></motion.span>
                <h3 className={styles.emptyTitle}>What are we working on?</h3>
                <ul className={styles.suggestions}>
                  {suggestions.map((suggestion, index) => (
                    <motion.li key={suggestion.title} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { ...motionTokens.spring.gentle, delay: 0.08 + index * motionTokens.stagger.item * 1.6 }}>
                      <button type="button" className={styles.suggestion} onClick={() => send(suggestion.prompt)}>
                        <span className={styles.suggestionTitle}>{suggestion.title}</span>
                        <span className={styles.suggestionPrompt}>{suggestion.prompt}</span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ) : null}
            <ol className={styles.messages} aria-label="Messages">
              <AnimatePresence initial={false}>
                {active?.messages.map(message => (
                  <motion.li key={message.id} className={styles.message} data-role={message.role} initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={pop}>
                    {message.role === "user" ? (
                      <div className={styles.bubble}><span className={styles.srOnly}>You: </span>{message.text}</div>
                    ) : (
                      <>
                        <span className={styles.assistantMark} aria-hidden="true"><Sparkles size={14} /></span>
                        <div className={styles.reply}>
                          <span className={styles.srOnly}>{assistantName}: </span>
                          {message.state === "thinking" ? (
                            <ThinkingShimmer className={styles.thinking} />
                          ) : message.text ? (
                            <StreamingResponse
                              className={styles.replyText}
                              text={message.text}
                              speed={speed}
                              controls={false}
                              instant={message.state !== "streaming"}
                              onProgress={shown => { if (message.state === "streaming") shownWords.current = shown; }}
                              onComplete={() => finish("done")}
                            />
                          ) : null}
                          {message.state === "stopped" ? <p className={styles.stopped}>{message.text ? "Stopped." : "Stopped before the reply started."}</p> : null}
                          {message.state === "done" || message.state === "stopped" ? <AssistantActions text={message.text} canRegenerate={message.id === lastMessage?.id && !busy} onRegenerate={regenerate} /> : null}
                        </div>
                      </>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          </motion.div>
        </div>

        <footer className={styles.composer}>
          <form className={styles.prompt} onSubmit={onSubmit}>
            <textarea ref={promptRef} className={styles.field} rows={1} value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={onPromptKeyDown} placeholder={`Message ${assistantName}`} aria-label={`Message ${assistantName}`} />
            <button type="submit" className={styles.send} data-busy={busy} disabled={!busy && !draft.trim()} aria-label={busy ? "Stop the reply" : "Send message"}>
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span key={busy ? "stop" : "send"} className={styles.glyph} initial={reduceMotion ? false : { scale: 0.4, opacity: 0, rotate: busy ? -90 : 90 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.4, opacity: 0, transition: { duration: reduceMotion ? 0 : motionTokens.duration.instant } }} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.snappy}>
                  {busy ? <Square size={12} fill="currentColor" aria-hidden="true" /> : <ArrowUp size={17} strokeWidth={2.5} aria-hidden="true" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </form>
          <p className={styles.hint}>Replies are simulated in your browser. Enter sends, Shift+Enter adds a line.</p>
        </footer>
        <span className={styles.srOnly} role="status">{busy ? `${assistantName} is replying` : ""}</span>
      </section>
    </div>
  );
}

/** Ready-made preview with sample conversations. */
export default function ChatAppPreview() {
  return <ChatApp />;
}
