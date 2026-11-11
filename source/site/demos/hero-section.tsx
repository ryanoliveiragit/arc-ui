import HeroSectionBlock, { HeroSection, heroSectionVariants } from "@/registry/blocks/hero-section/hero-section";
import type { DemoStage } from "./_kit";

/** Tall enough for the product window to show under the copy; the frame lets the hero follow its own width. */
export const stage: DemoStage = { layout: "fill", frame: true, height: 920 };

/** With `variant` ("product", "workflow" or "editorial") the demo shows exactly that version; without it, the block's own switcher. */
export default function HeroSectionDemo({ variant }: { variant?: string }) {
  const chosen = heroSectionVariants.find(option => option.value === variant);
  return chosen ? <HeroSection key={chosen.value} variant={chosen.value} /> : <HeroSectionBlock />;
}
