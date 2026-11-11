"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import { X } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./center-morph-modal.module.css";

export interface CenterMorphItem {
  /** Unique id; this is what `value` and `onValueChange` carry. */
  id: string;
  /** Title shown on the card and carried into the modal. */
  title: string;
  /** One line under the title, on the card and in the modal. */
  subtitle?: string;
  /** Icon or small image. It travels from the card to the modal header and grows on the way. */
  media?: ReactNode;
  /** Short text shown only on the card. It fades out as the card opens. */
  summary?: ReactNode;
  /** Small trailing label on the card, such as a status or a count. */
  meta?: ReactNode;
  /** The expanded content, shown only in the modal. */
  content: ReactNode;
}

/**
 * A grid of cards in which the chosen card lifts out of its cell and becomes a centered modal. The card's box, icon and title are
 * the same elements before and after, so they travel; the short summary fades away and the full content fades in behind them.
 */
export interface CenterMorphModalProps {
  /** The cards, in order. */
  items: CenterMorphItem[];
  /** Id of the open card, or null when none is open (controlled). */
  value?: string | null;
  /** Id of the card open at first when uncontrolled. */
  defaultValue?: string | null;
  /** Called with the id of the card that opened, or null when the modal closes. */
  onValueChange?: (id: string | null) => void;
  /** Actions shown under the expanded content. Receives the open item and a function that closes the modal. */
  renderFooter?: (item: CenterMorphItem, close: () => void) => ReactNode;
  /** Narrowest a card may get in px before the grid drops a column. */
  minColumnWidth?: number;
  /** Maximum width of the modal in px. */
  width?: number;
  /** Extra class for the grid. */
  className?: string;
}

/** Reads a length token in px. Motion keeps corners round during the morph only when it knows the radius as a number. */
function useTokenPx(token: string, fallback: number) {
  const [px, setPx] = useState(fallback);
  useLayoutEffect(() => {
    const probe = document.createElement("span");
    probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:var(${token})`;
    document.body.appendChild(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    if (width > 0) setPx(width);
  }, [token]);
  return px;
}

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const openSpring: Transition = { type: "spring", visualDuration: 0.46, bounce: 0.12 };
const closeSpring: Transition = { type: "spring", visualDuration: 0.36, bounce: 0 };
const fade: Transition = { duration: motionTokens.duration.fast, ease: standard };

/** The expanded parts arrive after the box is most of the way open, one after another, and leave at once. */
const revealGroup: Variants = {
  hidden: { transition: { staggerChildren: 0 } },
  shown: { transition: { staggerChildren: motionTokens.stagger.line, delayChildren: 0.14 } },
};
const revealPart: Variants = {
  hidden: { opacity: 0, y: 12, filter: `blur(${motionTokens.blur.soft}px)`, transition: { duration: motionTokens.duration.instant, ease: standard } },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { default: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: enter }, filter: { duration: motionTokens.duration.standard, ease: enter } } },
};
const revealStill: Variants = { hidden: { opacity: 0, transition: fade }, shown: { opacity: 1, transition: fade } };

export function CenterMorphModal({ items, value, defaultValue = null, onValueChange, renderFooter, minColumnWidth = 220, width = 480, className }: CenterMorphModalProps) {
  const [internal, setInternal] = useState<string | null>(defaultValue);
  const openId = value === undefined ? internal : value;
  const setOpenId = useCallback((next: string | null) => { if (value === undefined) setInternal(next); onValueChange?.(next); }, [onValueChange, value]);
  const close = useCallback(() => setOpenId(null), [setOpenId]);
  const reduced = useReducedMotion();
  const base = useId();
  const cards = useRef(new Map<string, HTMLButtonElement>());
  /** The card that opened the modal keeps the focus target, also while the modal animates out. */
  const lastOpened = useRef<string | null>(openId);
  if (openId) lastOpened.current = openId;
  const cardRadius = useTokenPx("--radius-panel", 26);
  const panelRadius = useTokenPx("--radius-surface", 34);
  const mediaRadius = useTokenPx("--radius-control", 18);
  const active = items.find(item => item.id === openId) ?? null;
  const shared = (part: string, id: string) => reduced ? undefined : `${base}-${part}-${id}`;
  const parts = reduced ? revealStill : revealPart;
  const footer = active && renderFooter ? renderFooter(active, close) : null;

  return (
    <>
      <div className={[styles.grid, className].filter(Boolean).join(" ")} style={{ "--center-morph-column": `${minColumnWidth}px` } as CSSProperties}>
        {items.map(item => (
          <motion.button
            key={item.id}
            ref={node => { if (node) cards.current.set(item.id, node); else cards.current.delete(item.id); }}
            type="button"
            layoutId={shared("card", item.id)}
            className={styles.card}
            style={{ borderRadius: cardRadius }}
            transition={{ layout: closeSpring }}
            aria-haspopup="dialog"
            aria-expanded={openId === item.id}
            onClick={() => setOpenId(item.id)}
          >
            {/* A layout child keeps the card's content at its own size while the card's box is stretched toward the modal. */}
            <motion.span layout={!reduced} className={styles.cardInner}>
              <span className={styles.cardTop}>
                {item.media ? <motion.span layoutId={shared("media", item.id)} className={styles.media} style={{ borderRadius: mediaRadius }} transition={{ layout: closeSpring }} aria-hidden="true">{item.media}</motion.span> : null}
                {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
              </span>
              <motion.span layoutId={shared("title", item.id)} className={styles.cardTitle} transition={{ layout: closeSpring }}>{item.title}</motion.span>
              {item.subtitle ? <span className={styles.cardSubtitle}>{item.subtitle}</span> : null}
              {item.summary ? <span className={styles.summary}>{item.summary}</span> : null}
            </motion.span>
          </motion.button>
        ))}
      </div>

      <DialogPrimitive.Root open={active !== null} onOpenChange={next => { if (!next) close(); }}>
        <AnimatePresence>
          {active && (
            <DialogPrimitive.Portal key={active.id} forceMount>
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div className={styles.scrim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: motionTokens.duration.standard, ease: standard } }} transition={{ duration: motionTokens.duration.standard, ease: enter }} />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content
                asChild
                forceMount
                {...(active.subtitle ? {} : { "aria-describedby": undefined })}
                onCloseAutoFocus={event => {
                  // There is no Radix trigger here, so focus goes back to the card that opened the modal.
                  event.preventDefault();
                  if (lastOpened.current) cards.current.get(lastOpened.current)?.focus({ preventScroll: true });
                }}
              >
                <motion.div
                  layoutId={shared("card", active.id)}
                  className={styles.panel}
                  style={{ borderRadius: panelRadius, maxWidth: width }}
                  transition={{ layout: openSpring }}
                  initial={reduced ? { opacity: 0 } : undefined}
                  animate={reduced ? { opacity: 1, transition: fade } : undefined}
                  exit={reduced ? { opacity: 0, transition: fade } : undefined}
                >
                  <motion.div layout={!reduced} className={styles.panelInner} variants={revealGroup} initial="hidden" animate="shown" exit="hidden">
                    <header className={styles.header}>
                      {active.media ? <motion.span layoutId={shared("media", active.id)} className={`${styles.media} ${styles.mediaLarge}`} style={{ borderRadius: mediaRadius }} transition={{ layout: openSpring }} aria-hidden="true">{active.media}</motion.span> : null}
                      <div className={styles.heading}>
                        <DialogPrimitive.Title asChild>
                          <motion.h2 layoutId={shared("title", active.id)} className={styles.title} transition={{ layout: openSpring }}>{active.title}</motion.h2>
                        </DialogPrimitive.Title>
                        {active.subtitle ? <DialogPrimitive.Description asChild><motion.p className={styles.subtitle} variants={parts}>{active.subtitle}</motion.p></DialogPrimitive.Description> : null}
                      </div>
                      <DialogPrimitive.Close asChild>
                        <motion.button type="button" className={styles.close} aria-label="Close" variants={parts}><X size={16} strokeWidth={1.75} aria-hidden="true" /></motion.button>
                      </DialogPrimitive.Close>
                    </header>
                    <motion.div className={styles.body} variants={parts}>{active.content}</motion.div>
                    {footer ? <motion.footer className={styles.footer} variants={parts}>{footer}</motion.footer> : null}
                  </motion.div>
                </motion.div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          )}
        </AnimatePresence>
      </DialogPrimitive.Root>
    </>
  );
}

export default CenterMorphModal;
