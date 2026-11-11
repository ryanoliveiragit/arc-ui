"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { Check, Copy, RotateCcw, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import { writeClipboard } from "@/lib/use-copy-feedback";
import styles from "./message.module.css";

export type MessageRating = "up" | "down" | null;

/**
 * A full assistant message: avatar, name, formatted content and a bar of actions that appears when the row is hovered or focused.
 * `content` takes a small Markdown subset (paragraphs, bullet and numbered lists, headings, fenced code, `inline code`, **bold**, links);
 * pass `children` instead to render your own content.
 */
export interface MessageProps {
  /** Sender name shown next to the avatar. */
  name?: string;
  /** Image URL for the avatar. Without it (and without `avatar`) a spark mark on the accent is shown. */
  avatarSrc?: string;
  /** Custom avatar element, for a logo or initials. Wins over `avatarSrc`. */
  avatar?: ReactNode;
  /** Small note after the name, such as the model or the time. */
  meta?: string;
  /** Message text in the small Markdown subset described above. */
  content?: string;
  /** Custom content. When given, `content` is only used as the text to copy. */
  children?: ReactNode;
  /** When the action bar shows: on hover or focus, always, or never. Touch screens always show it. */
  actions?: "hover" | "always" | "none";
  /** Called after the message text was copied. */
  onCopy?: (text: string) => void;
  /** Called when the person asks for another answer. The retry button is hidden without it. */
  onRetry?: () => void;
  /** Controlled rating. */
  rating?: MessageRating;
  /** Rating the message starts with when uncontrolled. */
  defaultRating?: MessageRating;
  /** Called when the person rates the answer or clears the rating. The rating buttons are hidden when neither this nor a rating prop is given. */
  onRatingChange?: (rating: MessageRating) => void;
  /** Staggers the content blocks in when the message mounts. Turn it off for history. */
  animateIn?: boolean;
  /** Extra class for the root element. */
  className?: string;
}

type Inline = { kind: "text" | "code" | "strong"; text: string } | { kind: "link"; text: string; href: string };
type Block = { kind: "paragraph" | "heading"; inline: Inline[] } | { kind: "bullets" | "numbers"; items: Inline[][] } | { kind: "code"; text: string };

const inlinePattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\s]+\))/g;
/** Links keep only web, mail and in-page targets, so message text can never run a script URL. */
const safeHref = (href: string) => /^(https?:|mailto:|\/|#)/i.test(href) ? href : undefined;

function parseInline(source: string): Inline[] {
  return source.split(inlinePattern).filter(Boolean).map((part): Inline => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return { kind: "code", text: part.slice(1, -1) };
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return { kind: "strong", text: part.slice(2, -2) };
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    const href = link ? safeHref(link[2]!) : undefined;
    if (link && href) return { kind: "link", text: link[1]!, href };
    return { kind: "text", text: link ? link[1]! : part };
  });
}

/** Turns the Markdown subset into blocks. Anything it does not know stays a paragraph, so no text is ever dropped. */
function parseContent(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let fence: string[] | null = null;
  const flush = () => { if (paragraph.length) blocks.push({ kind: "paragraph", inline: parseInline(paragraph.join(" ")) }); paragraph = []; };
  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    if (fence) { if (raw.trim().startsWith("```")) { blocks.push({ kind: "code", text: fence.join("\n") }); fence = null; } else fence.push(raw); continue; }
    const line = raw.trim();
    if (line.startsWith("```")) { flush(); fence = []; continue; }
    if (!line) { flush(); continue; }
    const heading = /^#{1,4}\s+(.*)$/.exec(line);
    if (heading) { flush(); blocks.push({ kind: "heading", inline: parseInline(heading[1]!) }); continue; }
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const number = bullet ? null : /^\d+[.)]\s+(.*)$/.exec(line);
    const item = bullet ?? number;
    if (item) {
      flush();
      const kind = bullet ? "bullets" : "numbers";
      const last = blocks[blocks.length - 1];
      if (last && "items" in last && last.kind === kind) last.items.push(parseInline(item[1]!)); else blocks.push({ kind, items: [parseInline(item[1]!)] });
      continue;
    }
    paragraph.push(line);
  }
  if (fence) blocks.push({ kind: "code", text: fence.join("\n") });
  flush();
  return blocks;
}

function renderInline(inline: Inline[]) {
  return inline.map((part, index) => {
    if (part.kind === "code") return <code key={index} className={styles.code}>{part.text}</code>;
    if (part.kind === "strong") return <strong key={index}>{part.text}</strong>;
    if (part.kind === "link") return <a key={index} href={part.href} target={part.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{part.text}</a>;
    return part.text;
  });
}

function renderBlock(block: Block) {
  if ("text" in block) return <pre tabIndex={0}><code>{block.text}</code></pre>;
  if ("inline" in block) return block.kind === "heading" ? <h4>{renderInline(block.inline)}</h4> : <p>{renderInline(block.inline)}</p>;
  const items = block.items.map((item, index) => <li key={index}>{renderInline(item)}</li>);
  return block.kind === "bullets" ? <ul>{items}</ul> : <ol>{items}</ol>;
}

const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const enterEase = [...motionTokens.ease.enter] as [number, number, number, number];
const fade: Transition = { duration: motionTokens.duration.fast, ease: standard };
const swap = { initial: { opacity: 0, scale: 0.5, filter: `blur(${motionTokens.blur.subtle}px)` }, animate: { opacity: 1, scale: 1, filter: "blur(0px)" }, exit: { opacity: 0, scale: 0.5, filter: `blur(${motionTokens.blur.subtle}px)`, transition: fade }, transition: { ...motionTokens.spring.snappy, opacity: fade, filter: fade } };
const swapReduced = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: fade };

export function Message({ name = "Assistant", avatarSrc, avatar, meta, content = "", children, actions = "hover", onCopy, onRetry, rating, defaultRating = null, onRatingChange, animateIn = true, className }: MessageProps) {
  const reduce = !!useReducedMotion();
  const blocks = useMemo(() => parseContent(content), [content]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [spins, setSpins] = useState(0);
  const [ownRating, setOwnRating] = useState<MessageRating>(defaultRating);
  const rated = rating !== undefined ? rating : ownRating;
  const canRate = rating !== undefined || onRatingChange !== undefined || defaultRating !== null;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copy() {
    const text = content || bodyRef.current?.innerText || "";
    try { await writeClipboard(text); } catch { return; }
    onCopy?.(text);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1900);
  }

  function rate(value: "up" | "down") {
    const next = rated === value ? null : value;
    if (rating === undefined) setOwnRating(next);
    onRatingChange?.(next);
  }

  const block = (index: number) => animateIn
    ? { initial: reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: `blur(${motionTokens.blur.soft}px)` }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, transition: { duration: motionTokens.duration.considered, ease: enterEase, delay: reduce ? 0 : Math.min(index * motionTokens.stagger.line, 0.4) } }
    : { initial: false as const };
  const iconSwap = reduce ? swapReduced : swap;
  let slot = 0;

  return (
    <article className={[styles.root, className].filter(Boolean).join(" ")} data-actions={actions} aria-label={`Message from ${name}`}>
      <span className={styles.avatar} aria-hidden="true">
        {avatar ?? (avatarSrc ? <img src={avatarSrc} alt="" /> : <span className={styles.mark}><Sparkles width={16} height={16} strokeWidth={2} /></span>)}
      </span>
      <div className={styles.main}>
        <header className={styles.header}>
          <span className={styles.name}>{name}</span>
          {meta ? <span className={styles.meta}>{meta}</span> : null}
        </header>
        <div ref={bodyRef} className={styles.body}>
          {children ?? blocks.map((item, index) => <motion.div key={index} className={styles.block} {...block(index)}>{renderBlock(item)}</motion.div>)}
        </div>
        {actions === "none" ? null : (
          <div className={styles.actions} role="toolbar" aria-label="Message actions">
            <button type="button" className={styles.action} style={{ "--i": slot++ } as CSSProperties} data-tip={copied ? "Copied" : "Copy"} aria-label={copied ? "Copied" : "Copy message"} data-done={copied || undefined} onClick={copy}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={copied ? "done" : "copy"} className={styles.glyph} {...iconSwap}>{copied ? <Check width={15} height={15} strokeWidth={2.25} aria-hidden="true" /> : <Copy width={15} height={15} strokeWidth={1.9} aria-hidden="true" />}</motion.span>
              </AnimatePresence>
            </button>
            {onRetry ? (
              <button type="button" className={styles.action} style={{ "--i": slot++ } as CSSProperties} data-tip="Try again" aria-label="Try again" onClick={() => { setSpins(count => count + 1); onRetry(); }}>
                <motion.span className={styles.glyph} animate={{ rotate: reduce ? 0 : spins * -360 }} transition={motionTokens.spring.smooth}><RotateCcw width={15} height={15} strokeWidth={1.9} aria-hidden="true" /></motion.span>
              </button>
            ) : null}
            {canRate ? (["up", "down"] as const).map(value => {
              const Icon = value === "up" ? ThumbsUp : ThumbsDown;
              const on = rated === value;
              return (
                <button key={value} type="button" className={styles.action} style={{ "--i": slot++ } as CSSProperties} data-tip={value === "up" ? "Good answer" : "Bad answer"} aria-label={value === "up" ? "Good answer" : "Bad answer"} aria-pressed={on} onClick={() => rate(value)}>
                  {/* A chosen thumb jumps toward its own direction, then settles. */}
                  <motion.span className={styles.glyph} initial={false} animate={on && !reduce ? { scale: [1, 1.28, 1], rotate: [0, value === "up" ? -14 : 14, 0], y: [0, value === "up" ? -2 : 2, 0] } : { scale: 1, rotate: 0, y: 0 }} transition={{ duration: 0.36, ease: standard }}><Icon width={15} height={15} strokeWidth={1.9} aria-hidden="true" /></motion.span>
                </button>
              );
            }) : null}
            <span className={styles.srOnly} role="status">{copied ? "Message copied" : ""}</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default Message;
