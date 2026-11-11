# Funnel chart

> Funil de conversão em que cada etapa surge depois da anterior, com o valor da etapa e a queda percentual entre elas.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/funnel-chart
- Descrição original (inglês): Conversion funnel with a value per stage and the drop-off percentage between stages: stages grow in one after another and morph when the data changes.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/funnel-chart.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/funnel-chart.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/funnel-chart.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/funnel-chart.json`. Caminho do registro, relativo ao endereço do site: `r/funnel-chart.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/funnel-chart/funnel-chart.tsx`
  - `components/ryan-ui/funnel-chart/funnel-chart.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/funnel-chart.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Sequência fixa de etapas (checkout, cadastro, onboarding) em que a pergunta é quantos seguem de cada etapa para a próxima.
- Comparar o mesmo funil entre segmentos ou períodos trocando `data`: etapas com a mesma `key` se transformam até a nova largura.
- Relatórios em que a queda percentual entre etapas e a conversão total precisam ficar à vista, sem depender do cursor.

## Quando não usar

- Use [`sankey-chart`](sankey-chart.md) quando o fluxo se divide ou se junta entre vários nós, em vez de seguir uma fila única de etapas.
- Use [`stepper`](stepper.md) para mostrar em que passo uma pessoa está num fluxo; o funil mostra quantas chegaram a cada etapa.
- Use [`composition-chart`](composition-chart.md) ou [`donut-chart`](donut-chart.md) quando os valores são partes de um todo, e não etapas em que cada uma contém a seguinte.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import FunnelChart, { type FunnelStage } from "@/components/ryan-ui/funnel-chart/funnel-chart";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface, type DemoStage } from "./_kit";

export const stage: DemoStage = { height: 660 };

const stages = (values: number[]): FunnelStage[] => [
  { key: "views", label: "Product views", value: values[0] ?? 0 },
  { key: "cart", label: "Added to cart", value: values[1] ?? 0 },
  { key: "checkout", label: "Checkout", value: values[2] ?? 0 },
  { key: "payment", label: "Payment", value: values[3] ?? 0 },
  { key: "purchase", label: "Purchased", value: values[4] ?? 0 },
];

const devices: Record<string, FunnelStage[]> = {
  desktop: stages([18400, 11960, 8130, 5690, 4380]),
  mobile: stages([26900, 13180, 7250, 4060, 2640]),
};

export default function FunnelChartDemo() {
  const [device, setDevice] = useState("desktop");
  return (
    <Stack gap={4} width={560}>
      <SegmentedControl label="Device" value={device} onValueChange={setDevice} options={[{ value: "desktop", label: "Desktop" }, { value: "mobile", label: "Mobile" }]} />
      <Surface>
        <FunnelChart data={devices[device] ?? []} label="Checkout funnel, last 30 days" unit="shoppers" />
      </Surface>
      <Caption>Stages grow in from the top. Hover a stage, or focus the chart and use the arrow keys, to see how many continued and how many dropped.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `FunnelChart`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `FunnelStage[]` | — | Stages from first to last. |
| `label` (obrigatória) | `string` | — | What moves through the funnel, such as "Checkout funnel". Names the chart for assistive technology and heads the readout. |
| `unit` | `string` | `""` | Unit after counts in the header and tooltip, such as "shoppers". |
| `formatValue` | `(value: number) => string` | `value => grouped.format(value)` | Formats stage values. |
| `stageHeight` | `number` | `44` | Height of each stage bar in pixels. |
| `connectorHeight` | `number` | `28` | Height of the tapered connector between two stages in pixels. |
| `hideHeader` | `boolean` | `false` | Hides the headline with the overall conversion. |
| `activeKey` | `string \| null` | — | Controlled key of the stage in focus, or null for none. The other stages dim while one is in focus. |
| `defaultActiveKey` | `string \| null` | `null` | Stage in focus on first render when uncontrolled. |
| `onActiveChange` | `(key: string \| null) => void` | — | Called when hover, touch or the keyboard moves to another stage, or leaves the chart. |
| `className` | `string` | — | Extra class on the root figure. |

### Tipos exportados

#### `FunnelStage`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | Stable identity. A stage that survives a data change keeps its place and morphs to its new width. |
| `label` (obrigatória) | `string` | Name of the stage, such as "Added to cart". |
| `value` (obrigatória) | `number` | How many reached this stage. Stages are drawn in the order given. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Com o foco no gráfico, passam à etapa anterior ou à seguinte e mostram o tooltip dela; `←` e `→` fazem o mesmo. |
| `Home` ou `End` | Vão à primeira e à última etapa. |
| `Esc` | Tira o destaque da etapa atual. |
| `Tab` | O gráfico é uma única parada de `Tab`: ao receber o foco pelo teclado, destaca a primeira etapa; ao perdê-lo, nenhuma. |

## Acessibilidade

- Sobre o gráfico fica um `role="slider"` vertical focável, cujo `aria-valuetext` descreve a etapa atual: nome, valor, parte da primeira etapa e queda desde a anterior.
- O desenho, os rótulos e o tooltip ficam em `aria-hidden`; os mesmos números estão numa tabela oculta com etapa, valor, parte da primeira etapa e queda.
- `label` é obrigatório e nomeia a figura; os textos fixos (“overall conversion”, “Reached”, “dropped off before this stage”) estão em inglês.

## Movimento

- Quando 30% do gráfico entra na tela, as barras crescem do centro para fora, uma etapa após a outra, de cima para baixo, seguidas dos afunilamentos e das pílulas de queda; os números contam a partir de zero.
- Depois disso, trocar `data` transforma todas as etapas de uma vez, e o tooltip desliza de etapa em etapa numa mola enquanto as outras esmaecem.
- Com “reduzir movimento”, o gráfico aparece pronto e as trocas são instantâneas.

## Comportamento responsivo

- A largura é medida com `ResizeObserver` e o desenho usa pixels reais; a coluna de rótulos ocupa de 84 px a 176 px (no máximo 34% da largura) e nomes longos são cortados.
- A altura cresce com o número de etapas (44 px de `stageHeight` mais 28 px de `connectorHeight` por padrão); no toque, tocar numa etapa mostra o tooltip e a rolagem vertical continua livre.

## Notas para IA

- `label` é obrigatório; passe `data` na ordem das etapas, com `key` estável: a largura de cada barra é relativa ao maior valor, e as porcentagens, à primeira etapa e à anterior.
- Passe valores que não crescem de uma etapa para a seguinte: o componente não valida isso, e a queda sairia negativa.
- Só a largura vem do pai; para controlar a etapa em destaque use `activeKey` com `onActiveChange` (sem atualizar o estado, o cursor não faz nada), e `hideHeader` remove o cabeçalho com a conversão total.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/funnel-chart · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
