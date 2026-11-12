import LogoMarquee from "@/registry/blocks/logo-marquee/logo-marquee";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "fill", frame: true, height: 520 };

export default function LogoMarqueeDemo() {
  // The band is a page section: centered in the frame with a page margin around it, not glued to the top edge.
  return (
    <div style={{ display: "grid", minHeight: "100dvh", alignContent: "center", padding: "var(--space-8) var(--space-6)" }}>
      <LogoMarquee />
    </div>
  );
}
