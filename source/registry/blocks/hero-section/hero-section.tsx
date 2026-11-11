"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { HeroLumen } from "./hero-lumen";
import { HeroRelay } from "./hero-relay";
import { HeroCadence } from "./hero-cadence";
import { HeroContent } from "./hero-content";
import type { HeroAction, HeroInstallCommand } from "./hero-content";
import { HeroBackdrop, HeroMark, HeroNav } from "./hero-parts";
import type { HeroNavLink } from "./hero-parts";
import styles from "./hero-section.module.css";

export { HeroBackdrop, HeroCadence, HeroContent, HeroLumen, HeroMark, HeroNav, HeroRelay };
/** The three designs under the names of their versions. */
export { HeroLumen as HeroProduct, HeroRelay as HeroWorkflow, HeroCadence as HeroEditorial };
export type { HeroAction, HeroInstallCommand, HeroNavLink };

export type HeroSectionVariant = "product" | "workflow" | "editorial";
/** Names the versions had before; they still work. */
export type HeroSectionLegacyVariant = "centered" | "split" | "minimal";

const LEGACY: Record<HeroSectionLegacyVariant, HeroSectionVariant> = { centered: "product", split: "workflow", minimal: "editorial" };
const LAYOUT: Record<HeroSectionVariant, HeroSectionLegacyVariant> = { product: "centered", workflow: "split", editorial: "minimal" };

export interface HeroSectionProps {
  /**
   * `product` is centered copy over a live product window with floating cards, `workflow` sets the copy beside an automation
   * graph that runs sample events with a pulse along each line, and `editorial` is very large type over a scrolling strip of
   * words. The earlier names `centered`, `split` and `minimal` map to them in that order.
   */
  variant?: HeroSectionVariant | HeroSectionLegacyVariant;
  /** Plays the entrance once on mount. Defaults to true. */
  animateIn?: boolean;
  /** The main call to action. With `doneLabel` and no `href`, the button confirms in place. */
  primaryAction?: HeroAction | null;
  /** The second call to action. */
  secondaryAction?: HeroAction | null;
  /**
   * Your own headline. When set, the hero renders your content in the chosen layout (see `HeroContent`) instead of the
   * designed sample, together with the props below.
   */
  title?: string;
  /** One or two sentences under your own headline. */
  description?: string;
  /** A small pill above your own headline. */
  announcement?: HeroAction | null;
  /** Install commands for your own content; the first one is shown with a copy button. */
  install?: HeroInstallCommand[] | null;
  /** A visual beside your own content in the workflow layout. */
  media?: ReactNode;
  /** Small facts under your own content, such as the version and license. */
  meta?: string[];
  /** Kept for compatibility; highlighted phrases render as plain text. */
  highlight?: string;
  className?: string;
}

/**
 * A landing page hero in three designs on a solid page with a faint dot grid: a live product window with floating cards, an
 * automation graph that routes sample events, and editorial type over a strip of scrolling words. No gradients.
 */
export function HeroSection({ variant = "product", animateIn = true, primaryAction, secondaryAction, title, description, announcement, install, media, meta, className }: HeroSectionProps) {
  const design = variant in LEGACY ? LEGACY[variant as HeroSectionLegacyVariant] : variant as HeroSectionVariant;
  if (title) return <HeroContent layout={LAYOUT[design]} title={title} description={description} announcement={announcement} primaryAction={primaryAction} secondaryAction={secondaryAction} install={install} media={media} meta={meta} animateIn={animateIn} className={className} />;
  const actions = { primaryAction: primaryAction ?? undefined, secondaryAction: secondaryAction ?? undefined };
  if (design === "workflow") return <HeroRelay animateIn={animateIn} className={className} {...actions} />;
  if (design === "editorial") return <HeroCadence animateIn={animateIn} className={className} {...actions} />;
  return <HeroLumen animateIn={animateIn} className={className} {...actions} />;
}

/** The three versions, in the order the switcher shows them. */
export const heroSectionVariants: { value: HeroSectionVariant; label: string }[] = [
  { value: "product", label: "Product" },
  { value: "workflow", label: "Workflow" },
  { value: "editorial", label: "Editorial" },
];

export interface HeroSectionBlockProps {
  /** The version shown first. Defaults to `product`. */
  variant?: HeroSectionVariant;
}

/**
 * Preview: a slim bar to choose the version, and the chosen hero filling the rest of the screen. Switching replays the entrance.
 */
export function HeroSectionBlock({ variant: initial = "product" }: HeroSectionBlockProps) {
  const [variant, setVariant] = useState<HeroSectionVariant>(initial);
  return <div className={styles.preview}>
    <div className={styles.switcher}>
      <SegmentedControl label="Hero version" options={heroSectionVariants} value={variant} onValueChange={value => setVariant(value as HeroSectionVariant)} />
    </div>
    <HeroSection key={variant} variant={variant} />
  </div>;
}

export default HeroSectionBlock;
