var e=`import PageHeader from "@/registry/blocks/page-header/page-header";
import type { DemoStage } from "./_kit";

// O palco do site dá ao frame 665 px de largura (canvas 775 − 2×54 de respiro). É nessa largura que o header se
// recolhe (Follow/Share vão para o menu ⋯), e é esse estado que o item exibe. A faixa pintada do canvas mede
// 774×738 na ref (a pintura corta ~12px antes da base do rect), então o iframe fica em 736 = 738 − 2 bordas.
export const stage: DemoStage = { height: 736 };

export default function PageHeaderDemo() {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: 54 }}>
      <PageHeader />
    </div>
  );
}
`;export{e as default};