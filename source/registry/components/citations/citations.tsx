"use client";

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./citations.module.css";

export interface CitationSource {
  /** Stable id that `<Citation source>` refers to. */
  id: string;
  /** Title of the page or document. */
  title: string;
  /** Address the source opens. */
  url: string;
  /** Name of the site. Defaults to the host of `url`. */
  site?: string;
  /** Short passage or summary that supports the claim. */
  snippet?: string;
  /** Publication date or year, as it should be shown. */
  date?: string;
}

export interface CitationsProps {
  /** Every source that can be cited, in the order they are numbered. */
  sources: CitationSource[];
  /** The text with `<Citation>` chips inside it, and usually a `<CitationSources>` list after it. */
  children: ReactNode;
  /** Id of the highlighted source (controlled). */
  activeId?: string | null;
  /** Called when hover, focus or an open card changes the highlighted source. */
  onActiveIdChange?: (id: string | null) => void;
  /** Render the source cards inside this element and limit collisions to it (used by the demo stages). */
  container?: HTMLElement | null;
  /** Class name added to the root element. */
  className?: string;
}

export interface CitationProps {
  /** Id of the source this chip cites. */
  source: string;
  /** Starts with this chip's card pinned open, for previews. Focus stays where it is until a person uses the card. */
  defaultOpen?: boolean;
  /** Class name added to the chip. */
  className?: string;
}

export interface CitationSourcesProps {
  /** Heading above the list. */
  title?: string;
  /** Class name added to the list wrapper. */
  className?: string;
}

interface CitationsContextValue {
  sources: CitationSource[];
  active: string | null;
  setActive: (id: string | null) => void;
  scope: string;
  container: HTMLElement | null;
}

const CitationsContext = createContext<CitationsContextValue | null>(null);
/** The letter marks rotate through the categorical tones, so neighbours in the list never share a color. */
const tones = ["sky", "orchid", "amber", "teal", "violet", "rose", "green"] as const;
const toneOf = (index: number) => `var(--tone-${tones[index % tones.length]})`;

function hostOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

function useCitations(part: string) {
  const context = useContext(CitationsContext);
  if (!context) throw new Error(`<${part}> must be rendered inside <Citations>.`);
  return context;
}

function SiteMark({ site, index }: { site: string; index: number }) {
  return <span className={styles.mark} style={{ "--tone": toneOf(index) } as CSSProperties} aria-hidden="true">{site.charAt(0).toUpperCase()}</span>;
}

/**
 * Groups an answer with its sources. Inside it, `<Citation>` is a numbered chip that opens a card with the source, and `<CitationSources>`
 * lists them all. The parts share one highlight: pointing at a chip marks its row in the list, and pointing at a row lights up its chips.
 */
export function Citations({ sources, children, activeId, onActiveIdChange, container = null, className }: CitationsProps) {
  const scope = useId();
  const [internal, setInternal] = useState<string | null>(null);
  const active = activeId === undefined ? internal : activeId;
  const setActive = useCallback((id: string | null) => { setInternal(id); onActiveIdChange?.(id); }, [onActiveIdChange]);
  const value = useMemo(() => ({ sources, active, setActive, scope, container }), [sources, active, setActive, scope, container]);
  return (
    <CitationsContext.Provider value={value}>
      <div className={[styles.root, className].filter(Boolean).join(" ")}>{children}</div>
    </CitationsContext.Provider>
  );
}

/** A numbered chip for the middle of a sentence. Hover, focus plus Enter, or a tap opens a card with the source; a click pins it open. */
export function Citation({ source, defaultOpen = false, className }: CitationProps) {
  const { sources, active, setActive, container } = useCitations("Citation");
  const index = sources.findIndex(entry => entry.id === source);
  const entry = sources[index];
  const [open, setOpen] = useState(defaultOpen);
  /** A card that starts pinned does not pull focus in on its first frame. */
  const quiet = useRef(defaultOpen);
  const startOpen = useRef(defaultOpen);
  useEffect(() => { if (startOpen.current && entry) setActive(entry.id); }, [entry, setActive]);
  // A card opened by hovering closes when the pointer leaves and never takes focus; one opened by click or keyboard behaves like a popover.
  const byHover = useRef(false);
  const skipFocusReturn = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  if (!entry) return null;
  const site = entry.site ?? hostOf(entry.url);

  const change = (next: boolean) => {
    window.clearTimeout(timer.current);
    setOpen(next);
    setActive(next ? entry.id : null);
    if (!next) { skipFocusReturn.current = byHover.current; byHover.current = false; }
  };
  const hover = (next: boolean) => {
    window.clearTimeout(timer.current);
    if (next && open) return;
    if (!next && !byHover.current) return;
    timer.current = window.setTimeout(() => { if (next) byHover.current = true; change(next); }, next ? 110 : 170);
  };

  return (
    <Popover.Root open={open} onOpenChange={change}>
      {/* A word joiner inside a no-wrap span keeps the chip on the same line as the word it follows. */}
      <span className={styles.joint}>
        {"\u2060"}
        <Popover.Trigger asChild>
          <button
            type="button"
            className={[styles.chip, className].filter(Boolean).join(" ")}
            data-active={active === entry.id || undefined}
            aria-label={`Source ${index + 1}: ${entry.title}`}
            onPointerEnter={event => { if (event.pointerType === "mouse") hover(true); }}
            onPointerLeave={event => { if (event.pointerType === "mouse") hover(false); }}
            onClick={event => {
              // The card is already showing from the hover: the click pins it instead of toggling it shut.
              if (open && byHover.current) { event.preventDefault(); byHover.current = false; window.clearTimeout(timer.current); }
            }}
          >
            {index + 1}
          </button>
        </Popover.Trigger>
      </span>
      <Popover.Portal container={container ?? undefined}>
        <Popover.Content
          className={styles.card}
          side="top"
          align="center"
          sideOffset={8}
          collisionPadding={12}
          collisionBoundary={container ?? undefined}
          aria-label={`Source ${index + 1}`}
          onOpenAutoFocus={event => { if (byHover.current || quiet.current) { quiet.current = false; event.preventDefault(); } }}
          onCloseAutoFocus={event => { if (skipFocusReturn.current) event.preventDefault(); }}
          onPointerEnter={() => window.clearTimeout(timer.current)}
          onPointerLeave={event => { if (event.pointerType === "mouse") hover(false); }}
        >
          <div className={styles.cardSite}>
            <SiteMark site={site} index={index} />
            <span className={styles.cardHost}>{site}</span>
            {entry.date ? <span className={styles.cardDate}>{entry.date}</span> : null}
            <span className={styles.cardNumber} aria-hidden="true">{index + 1}</span>
          </div>
          <a className={styles.cardTitle} href={entry.url} target="_blank" rel="noreferrer noopener">
            {entry.title}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          {entry.snippet ? <p className={styles.cardSnippet}>{entry.snippet}</p> : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** The numbered list of every source. One highlight glides to the row under the pointer or keyboard focus, or to the source whose chip is active. */
export function CitationSources({ title = "Sources", className }: CitationSourcesProps) {
  const { sources, active, setActive, scope } = useCitations("CitationSources");
  const reduceMotion = useReducedMotion() ?? false;
  const headingId = useId();
  return (
    <section className={[styles.sources, className].filter(Boolean).join(" ")} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sourcesTitle}>{title}<span className={styles.sourcesCount}>{sources.length}</span></h3>
      <ol className={styles.list} onPointerLeave={() => setActive(null)}>
        {sources.map((entry, index) => {
          const site = entry.site ?? hostOf(entry.url);
          return (
            <motion.li
              key={entry.id}
              className={styles.item}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { ...motionTokens.spring.gentle, delay: 0.08 + index * motionTokens.stagger.item * 1.6 }}
            >
              {active === entry.id ? <motion.span layoutId={`${scope}-highlight`} className={styles.highlight} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.morph} /> : null}
              <a
                className={styles.row}
                href={entry.url}
                target="_blank"
                rel="noreferrer noopener"
                data-active={active === entry.id || undefined}
                onPointerEnter={event => { if (event.pointerType === "mouse") setActive(entry.id); }}
                onFocus={() => setActive(entry.id)}
                onBlur={() => setActive(null)}
              >
                <span className={styles.number} aria-hidden="true">{index + 1}</span>
                <SiteMark site={site} index={index} />
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>{entry.title}</span>
                  <span className={styles.rowSite}>{site}{entry.date ? ` · ${entry.date}` : ""}</span>
                </span>
                <ArrowUpRight className={styles.rowArrow} size={15} aria-hidden="true" />
              </a>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}

export default Citations;
