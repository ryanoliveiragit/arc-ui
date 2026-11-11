"use client";

import { MotionConfig, motion } from "motion/react";
import { Asterisk } from "lucide-react";
import { Marquee } from "@/registry/components/marquee/marquee";
import { motionTokens } from "@/lib/motion-tokens";
import { ActionLink } from "./hero-content";
import type { HeroAction } from "./hero-content";
import { HeroBackdrop, HeroMark, HeroNav } from "./hero-parts";
import { heroGroup, heroRise } from "./hero-motion";
import shell from "./hero-section.module.css";
import styles from "./hero-cadence.module.css";

export interface HeroCadenceProps {
  /** The main call to action. With `doneLabel` and no `href`, the button confirms in place. */
  primaryAction?: HeroAction;
  /** The second call to action. */
  secondaryAction?: HeroAction;
  /** Plays the entrance once on mount. Defaults to true. */
  animateIn?: boolean;
  className?: string;
}

const LINKS = [{ label: "Features" }, { label: "Teams" }, { label: "Pricing" }, { label: "Download" }];
/** What the product plans, as the words that scroll along the bottom edge. */
const WORDS = ["Deep work", "Stand-ups", "Deadlines", "One-on-ones", "Reviews", "Lunch, actually", "Focus time", "Travel days"];

/**
 * Editorial hero, one full screen: very large type with one phrase under a solid accent marker, a short paragraph beside the
 * actions, and a strip of words that scrolls along the bottom edge. No product window and no imagery: type does the work.
 */
export function HeroCadence({ primaryAction = { label: "Download for Mac", doneLabel: "Download started" }, secondaryAction = { label: "Try it on the web", doneLabel: "Opening Cadence" }, animateIn = true, className }: HeroCadenceProps) {
  const item = heroRise;
  // Reduced motion: Motion skips every transform (rise); opacity still fades briefly, and the strip of words stops scrolling.
  return <MotionConfig reducedMotion="user"><section className={[shell.hero, shell.screen, styles.hero, className].filter(Boolean).join(" ")}>
    <HeroBackdrop className={styles.dots} />
    <HeroNav brand="Cadence" mark={<CadenceMark />} links={LINKS} animateIn={animateIn} />
    <motion.div className={styles.inner} variants={heroGroup} initial={animateIn ? "hidden" : false} animate="shown">
      <motion.p variants={item} className={styles.kicker}><span className={styles.tag}>3.0</span>The calendar that plans itself</motion.p>
      <motion.h1 variants={item} className={[shell.title, styles.title].join(" ")}>Your week, planned <br className={styles.break} /><HeroMark animateIn={animateIn}>before Monday</HeroMark></motion.h1>
      <div className={styles.row}>
        <motion.p variants={item} className={[shell.description, styles.description].join(" ")}>Cadence reads your tasks, meetings and focus goals, then books time for the work that matters. When plans change, it moves everything for you.</motion.p>
        <motion.div variants={item} className={styles.cta}>
          <div className={styles.actions}>
            <ActionLink action={primaryAction} kind="primary" />
            <ActionLink action={secondaryAction} kind="secondary" />
          </div>
          <p className={styles.fine}>Free for personal use. Teams from $8 a seat.</p>
        </motion.div>
      </div>
    </motion.div>
    <motion.div className={styles.band} initial={animateIn ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: motionTokens.duration.considered, delay: .36 }}>
      <Marquee label="What Cadence plans" speed={56} gap="var(--band-gap)" fade="8%">
        {WORDS.map((word, index) => <span key={word} className={styles.word} data-quiet={index % 2 === 1 || undefined}>
          {word}
          <span className={styles.sep} aria-hidden="true"><Asterisk strokeWidth={2.5} /></span>
        </span>)}
      </Marquee>
    </motion.div>
  </section></MotionConfig>;
}

/** The brand glyph: three bars of a week, the middle one tallest. */
function CadenceMark() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <rect x="2" y="6.5" width="3" height="7" rx="1.2" /><rect x="6.5" y="2.5" width="3" height="11" rx="1.2" /><rect x="11" y="5" width="3" height="8.5" rx="1.2" />
  </svg>;
}

export { HeroCadence as HeroEditorial };
export type { HeroCadenceProps as HeroEditorialProps };
export default HeroCadence;
