"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/registry/components/button/button";
import { CopyButton } from "@/registry/components/copy-button/copy-button";
import { heroGroup, heroRise } from "./hero-motion";
import shell from "./hero-section.module.css";
import styles from "./hero-content.module.css";

export interface HeroAction {
  /** Text of the button or link. */
  label: string;
  /** Makes it a link. Without it the action is a button. */
  href?: string;
  /** Called on press. */
  onClick?: () => void;
  /** Opens in a new tab and shows an outward arrow. */
  external?: boolean;
  /** Shown in place of the label for a moment after a press, such as "Trial started". Buttons only. */
  doneLabel?: string;
}

export interface HeroInstallCommand {
  /** Short label, such as npm or pnpm. The first command is shown. */
  label: string;
  command: string;
}

export interface HeroContentProps {
  /** `centered` stacks the copy in the middle, `split` puts `media` beside it, `minimal` aligns large copy to the left. */
  layout: "centered" | "split" | "minimal";
  /** A small pill above the headline, such as a release note. */
  announcement?: HeroAction | null;
  /** The headline. */
  title: string;
  /** One or two sentences under the headline. */
  description?: string;
  /** The main call to action, filled with the accent. */
  primaryAction?: HeroAction | null;
  /** The second call to action, outlined. */
  secondaryAction?: HeroAction | null;
  /** Install commands; the first one is shown with a copy button. */
  install?: HeroInstallCommand[] | null;
  /** A visual beside the copy in the split layout. */
  media?: ReactNode;
  /** Small facts under the copy, such as the version and license. */
  meta?: string[];
  /** Plays the entrance once on mount. Defaults to true. */
  animateIn?: boolean;
  className?: string;
}

/** A link or button that looks like a ryan-ui button. Links keep native navigation; a button with `doneLabel` confirms in place. */
export function ActionLink({ action, kind, className }: { action: HeroAction; kind: "primary" | "secondary"; className?: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setDone(false), 2400);
    return () => window.clearTimeout(timer);
  }, [done]);
  const cls = [styles.action, styles[kind], className].filter(Boolean).join(" ");
  const icon = action.external ? <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" /> : kind === "primary" ? <ArrowRight className={styles.arrow} size={16} strokeWidth={1.75} aria-hidden="true" /> : null;
  if (action.href) return <a className={cls} href={action.href} onClick={action.onClick} {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{action.label}{icon}</a>;
  return <Button variant={kind} size="lg" className={[styles.button, className].filter(Boolean).join(" ")} onClick={() => { action.onClick?.(); if (action.doneLabel) setDone(true); }}>
    {done ? <><Check size={16} strokeWidth={1.75} aria-hidden="true" />{action.doneLabel}</> : <>{action.label}{icon}</>}
  </Button>;
}

/**
 * The hero with your own content: announcement, headline, description, actions, an optional install line, and an
 * optional visual beside the copy, on a solid page. Use it when none of the three designed variants fits the product.
 */
export function HeroContent({ layout, announcement, title, description, primaryAction, secondaryAction, install, media, meta, animateIn = true, className }: HeroContentProps) {
  const item = heroRise;
  const command = install?.[0];
  // Reduced motion: Motion skips every transform (rise, zoom, tilt entrance); opacity still fades briefly.
  return <MotionConfig reducedMotion="user"><section className={[shell.hero, styles.hero, styles[layout], className].filter(Boolean).join(" ")}>
    <div className={styles.inner}>
      <motion.div className={styles.copy} variants={heroGroup} initial={animateIn ? "hidden" : false} animate="shown">
        {announcement && <motion.div variants={item}>
          {announcement.href
            ? <a className={styles.announcement} href={announcement.href} onClick={announcement.onClick}>{announcement.label}<ArrowRight className={styles.arrow} size={14} strokeWidth={1.75} aria-hidden="true" /></a>
            : <button type="button" className={styles.announcement} onClick={announcement.onClick}>{announcement.label}<ArrowRight className={styles.arrow} size={14} strokeWidth={1.75} aria-hidden="true" /></button>}
        </motion.div>}
        <motion.h1 variants={item} className={[shell.title, styles.title].join(" ")}>{title}</motion.h1>
        {description && <motion.p variants={item} className={[shell.description, styles.description].join(" ")}>{description}</motion.p>}
        {(primaryAction || secondaryAction) && <motion.div variants={item} className={styles.actions}>
          {primaryAction && <ActionLink action={primaryAction} kind="primary" />}
          {secondaryAction && <ActionLink action={secondaryAction} kind="secondary" />}
        </motion.div>}
        {command && <motion.div variants={item} className={styles.install}>
          <span className={styles.prompt} aria-hidden="true">$</span>
          <code className={styles.command}>{command.command}</code>
          <CopyButton value={command.command} label="Copy install command" iconOnly variant="plain" />
        </motion.div>}
        {meta && meta.length > 0 && <motion.ul variants={item} className={styles.meta}>{meta.map(entry => <li key={entry}>{entry}</li>)}</motion.ul>}
      </motion.div>
      {media && <motion.div className={styles.media} variants={item} initial={animateIn ? "hidden" : false} animate="shown">{media}</motion.div>}
    </div>
  </section></MotionConfig>;
}

export default HeroContent;
