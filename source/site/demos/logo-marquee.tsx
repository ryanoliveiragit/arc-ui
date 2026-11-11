import LogoMarquee from "@/registry/blocks/logo-marquee/logo-marquee";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "fill", frame: true, height: 340 };

export default function LogoMarqueeDemo() {
  return <LogoMarquee />;
}
