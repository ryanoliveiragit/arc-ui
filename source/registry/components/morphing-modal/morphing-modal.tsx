"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import { X } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./morphing-modal.module.css";

/** What the body and the footer receive when they are written as functions. */
export interface MorphingModalApi {
  /** Closes the modal; it morphs back into the trigger. */
  close: () => void;
}

type Slot = ReactNode | ((api: MorphingModalApi) => ReactNode);

/**
 * A button that becomes the modal. The panel grows out of the trigger's own box (position, size, corner radius and color) and
 * shrinks back into it on close, so there is never a question about where the modal came from. Focus is trapped while it is open,
 * Escape and the scrim close it, and focus returns to the trigger.
 */
export interface MorphingModalProps {
  /** Content of the trigger button: a label, optionally with an icon. */
  trigger: ReactNode;
  /** Title of the modal, also its accessible name. */
  title: string;
  /** Supporting line under the title. */
  description?: string;
  /** The body. Pass a function to receive `close`. */
  children: Slot;
  /** Actions pinned under the body. Pass a function to receive `close`. */
  footer?: Slot;
  /** Whether the modal is open (controlled). */
  open?: boolean;
  /** Initial state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called with the next state when the trigger, Escape, the scrim or the close button is used. */
  onOpenChange?: (open: boolean) => void;
  /** Look of the trigger. The panel starts in the same color and settles into the surface color. */
  variant?: "accent" | "neutral";
  /** Maximum width of the panel in px. */
  width?: number;
  /** Disables the trigger. */
  disabled?: boolean;
  /** Extra class for the panel. */
  className?: string;
  /** Extra class for the trigger button. */
  triggerClassName?: string;
  /**
   * Renders the modal inside this element instead of the page body: the scrim covers only the element and the panel centers in it.
   * The element needs position: relative and overflow: hidden. The page around it stays usable while the modal is open: nothing is
   * scroll-locked or hidden from assistive technology, and Escape, the scrim and the close button still close it.
   */
  container?: HTMLElement | null;
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
/** Opening lands with a touch of life; closing is quicker and exact, so the panel meets the trigger without wobble. */
const openSpring: Transition = { type: "spring", visualDuration: 0.44, bounce: 0.14 };
const closeSpring: Transition = { type: "spring", visualDuration: 0.34, bounce: 0 };
const fade: Transition = { duration: motionTokens.duration.fast, ease: standard };

/** The panel's content arrives in order once the box is most of the way open, and leaves at once so it never rides the shrink. */
const contentMotion: Variants = {
  hidden: { transition: { staggerChildren: 0 } },
  shown: { transition: { staggerChildren: motionTokens.stagger.line, delayChildren: 0.1 } },
};
const partMotion: Variants = {
  hidden: { opacity: 0, y: 10, filter: `blur(${motionTokens.blur.soft}px)`, transition: { duration: motionTokens.duration.instant, ease: standard } },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { default: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: enter }, filter: { duration: motionTokens.duration.standard, ease: enter } } },
};
/** A form should start in its first field; anything else starts on the first control, which is Radix's default. */
const FIRST_FIELD = "[data-autofocus], input:not([type='hidden']):not(:disabled), textarea:not(:disabled), select:not(:disabled)";

const partStill: Variants = { hidden: { opacity: 0, transition: fade }, shown: { opacity: 1, transition: fade } };

export function MorphingModal({ trigger, title, description, children, footer, open: openProp, defaultOpen = false, onOpenChange, variant = "accent", width = 420, disabled = false, className, triggerClassName, container }: MorphingModalProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const open = openProp ?? internal;
  const setOpen = useCallback((next: boolean) => { if (openProp === undefined) setInternal(next); onOpenChange?.(next); }, [onOpenChange, openProp]);
  const reduced = useReducedMotion();
  const layoutId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const triggerRadius = useTokenPx("--radius-control", 18);
  const panelRadius = useTokenPx("--radius-surface", 34);
  const api: MorphingModalApi = { close: () => setOpen(false) };
  const render = (slot: Slot) => typeof slot === "function" ? slot(api) : slot;
  const shared = reduced ? undefined : layoutId;
  const parts = reduced ? partStill : partMotion;

  const scrim = <motion.div className={styles.scrim} data-contained={container ? "" : undefined} aria-hidden={container ? true : undefined} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: motionTokens.duration.standard, ease: standard } }} transition={{ duration: motionTokens.duration.standard, ease: enter }} />;

  // Inside a container the modal is part of a page section, not the whole page, so it is not modal to the page.
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen} modal={!container}>
      <DialogPrimitive.Trigger asChild disabled={disabled}>
        <motion.button type="button" layoutId={shared} className={[styles.trigger, styles[variant], triggerClassName].filter(Boolean).join(" ")} style={{ borderRadius: triggerRadius }} transition={{ layout: closeSpring }}>
          {/* A layout child keeps its own size while the button's box is stretched toward the panel. */}
          <motion.span layout={!reduced} className={styles.triggerLabel}>{trigger}</motion.span>
        </motion.button>
      </DialogPrimitive.Trigger>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal key="modal" forceMount container={container ?? undefined}>
            {/* Radix draws no overlay for a non-modal dialog, so inside a container the scrim is a plain layer; a press on it still closes the modal. */}
            {container ? scrim : <DialogPrimitive.Overlay asChild forceMount>{scrim}</DialogPrimitive.Overlay>}
            <DialogPrimitive.Content
              asChild
              forceMount
              {...(description ? {} : { "aria-describedby": undefined })}
              onOpenAutoFocus={event => {
                const field = panel.current?.querySelector<HTMLElement>(FIRST_FIELD);
                if (!field) return;
                event.preventDefault();
                field.focus({ preventScroll: true });
              }}
            >
              <motion.div
                ref={panel}
                layoutId={shared}
                className={[styles.panel, className].filter(Boolean).join(" ")}
                data-contained={container ? "" : undefined}
                style={{ borderRadius: panelRadius, maxWidth: width }}
                transition={{ layout: openSpring }}
                initial={reduced ? { opacity: 0 } : undefined}
                animate={reduced ? { opacity: 1, transition: fade } : undefined}
                exit={reduced ? { opacity: 0, transition: fade } : undefined}
              >
                <motion.div layout={!reduced} className={styles.inner} variants={contentMotion} initial="hidden" animate="shown" exit="hidden">
                  <motion.header className={styles.header} variants={parts}>
                    <div className={styles.heading}>
                      <DialogPrimitive.Title className={styles.title}>{title}</DialogPrimitive.Title>
                      {description ? <DialogPrimitive.Description className={styles.description}>{description}</DialogPrimitive.Description> : null}
                    </div>
                    <DialogPrimitive.Close className={styles.close} aria-label="Close"><X size={16} strokeWidth={1.75} aria-hidden="true" /></DialogPrimitive.Close>
                  </motion.header>
                  <motion.div className={styles.body} variants={parts}>{render(children)}</motion.div>
                  {footer ? <motion.footer className={styles.footer} variants={parts}>{render(footer)}</motion.footer> : null}
                </motion.div>
                {/* The panel starts in the trigger's color and clears to the surface, and takes the color back as it closes. */}
                {reduced ? null : <motion.span aria-hidden="true" className={[styles.tint, styles[variant]].join(" ")} initial={{ opacity: 1 }} animate={{ opacity: 0, transition: { duration: motionTokens.duration.standard, ease: standard } }} exit={{ opacity: 1, transition: { duration: motionTokens.duration.fast, ease: standard, delay: 0.06 } }} />}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

export default MorphingModal;
