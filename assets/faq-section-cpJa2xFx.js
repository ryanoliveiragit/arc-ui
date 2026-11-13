var e=`import FaqSectionBlock from "@/registry/blocks/faq-section/faq-section";
import type { DemoStage } from "./_kit";

// O canvas do site encolhe ao conteúdo e pinta ~12px a menos que o rect de layout (base cortada antes da borda):
// medido na ref de 11/12, a faixa pintada é 774×1085 com respiro de 14. O palco reproduz isso: iframe de 1083
// (= 1085 menos as duas bordas do painel), respiro 14 e cor de canvas; o excesso dos últimos px do respiro
// transborda a viewport do iframe e some, exatamente como a pintura do site corta.
export const stage: DemoStage = { height: 1083 };

export default function FaqSectionDemo() {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: 14, background: "var(--surface-muted)" }}>
      <FaqSectionBlock />
    </div>
  );
}
`;export{e as default};