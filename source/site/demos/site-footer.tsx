import SiteFooter from "@/registry/blocks/site-footer/site-footer";
import type { DemoStage } from "./_kit";

// Mesma regra do faq-section: a faixa pintada do canvas do site mede 774×612 com respiro de 14;
// o iframe fica em 610 (= 612 − 2 bordas) e o excesso do respiro inferior corta na viewport.
export const stage: DemoStage = { height: 610 };

export default function SiteFooterDemo() {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: 14, background: "var(--surface-muted)" }}>
      <SiteFooter />
    </div>
  );
}
