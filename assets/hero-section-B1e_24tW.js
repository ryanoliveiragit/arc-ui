var e=`import HeroSectionBlock, { HeroSection, type HeroSectionVariant } from "@/registry/blocks/hero-section/hero-section";
import type { DemoStage } from "./_kit";

/** Tall enough for the product window to show under the copy; the frame lets the hero follow its own width. */
export const stage: DemoStage = { layout: "fill", frame: true, height: 920 };

/** With \`variant\` ("centered", "split" or "minimal") the demo shows exactly that version; without it, the block's own switcher. */
export default function HeroSectionDemo({ variant }: { variant?: string }) {
  const chosen = (["centered", "split", "minimal"] as const).find(v => v === variant);
  return chosen ? <HeroSection key={chosen} variant={chosen as HeroSectionVariant} /> : <HeroSectionBlock />;
}
`;export{e as default};