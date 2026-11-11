# Sankey chart

> Diagrama de fluxo em colunas: as faixas têm a espessura do valor e, ao passar o mouse, só o caminho escolhido fica aceso.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/sankey-chart
- Descrição original (inglês): Flow diagram with nodes in columns joined by curved ribbons sized by value: ribbons draw in column by column, and hovering a node or ribbon dims everything else.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sankey-chart.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sankey-chart.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sankey-chart.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sankey-chart.json`. Caminho do registro, relativo ao endereço do site: `r/sankey-chart.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/sankey-chart/sankey-chart.tsx`
  - `components/ryan-ui/sankey-chart/sankey-chart.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/sankey-chart.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar como um total se divide e se recombina em duas ou mais etapas: origem do tráfego, página de entrada e resultado.
- Quando o leitor precisa seguir um caminho: apontar um nó acende suas faixas e os nós nas pontas; apontar uma faixa acende os dois nós que ela liga.
- Comparar dois períodos com os mesmos nós: ao trocar `links`, barras e faixas deslizam até os novos tamanhos.

## Quando não usar

- Use [`funnel-chart`](funnel-chart.md) quando o fluxo é uma sequência única de etapas e o que interessa é a perda entre uma e a próxima.
- Use [`composition-chart`](composition-chart.md) ou [`donut-chart`](donut-chart.md) quando o total se divide uma única vez, sem etapas seguintes.
- Fluxos que voltam a uma etapa anterior não cabem: o layout põe cada nó numa coluna, da esquerda para a direita, pelo caminho mais longo desde a origem.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import SankeyChart, { type SankeyLink, type SankeyNode } from "@/components/ryan-ui/sankey-chart/sankey-chart";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface, type DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const nodes: SankeyNode[] = [
  { id: "search", label: "Organic search" },
  { id: "ads", label: "Paid ads" },
  { id: "social", label: "Social" },
  { id: "email", label: "Email" },
  { id: "home", label: "Home" },
  { id: "pricing", label: "Pricing" },
  { id: "blog", label: "Blog" },
  { id: "signup", label: "Signed up" },
  { id: "browse", label: "Browsed" },
  { id: "bounce", label: "Bounced" },
];

const flow = (source: string, target: string, value: number): SankeyLink => ({ source, target, value });
const weeks: Record<string, SankeyLink[]> = {
  current: [
    flow("search", "home", 2100), flow("search", "pricing", 800), flow("search", "blog", 2300),
    flow("ads", "home", 1200), flow("ads", "pricing", 1900),
    flow("social", "home", 900), flow("social", "blog", 1500),
    flow("email", "pricing", 1100), flow("email", "blog", 600),
    flow("home", "signup", 900), flow("home", "browse", 1800), flow("home", "bounce", 1500),
    flow("pricing", "signup", 1700), flow("pricing", "browse", 1300), flow("pricing", "bounce", 800),
    flow("blog", "signup", 500), flow("blog", "browse", 1600), flow("blog", "bounce", 2300),
  ],
  previous: [
    flow("search", "home", 1800), flow("search", "pricing", 700), flow("search", "blog", 2900),
    flow("ads", "home", 800), flow("ads", "pricing", 1400),
    flow("social", "home", 1300), flow("social", "blog", 2200),
    flow("email", "pricing", 900), flow("email", "blog", 400),
    flow("home", "signup", 700), flow("home", "browse", 1700), flow("home", "bounce", 1500),
    flow("pricing", "signup", 1300), flow("pricing", "browse", 1100), flow("pricing", "bounce", 600),
    flow("blog", "signup", 600), flow("blog", "browse", 2100), flow("blog", "bounce", 2800),
  ],
};

export default function SankeyChartDemo() {
  const [week, setWeek] = useState("current");
  return (
    <Stack gap={4} width={600}>
      <SegmentedControl label="Week" value={week} onValueChange={setWeek} options={[{ value: "current", label: "This week" }, { value: "previous", label: "Last week" }]} />
      <Surface>
        <SankeyChart nodes={nodes} links={weeks[week] ?? []} label="Visits by source, landing page and outcome" columns={["Source", "Landing page", "Outcome"]} unit="visits" />
      </Surface>
      <Caption>Hover a node or a ribbon to trace its flows. Focus the chart and use the arrow keys to walk the nodes.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SankeyChart`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `nodes` (obrigatória) | `SankeyNode[]` | — | Every node, in the order they should stack inside the first column. |
| `links` (obrigatória) | `SankeyLink[]` | — | Flows between nodes. One link per source and target pair. |
| `label` (obrigatória) | `string` | — | What flows, such as "Visits by source and outcome". Names the chart for assistive technology. |
| `columns` | `string[]` | — | Optional heading above each column, such as ["Source", "Landing page", "Outcome"]. |
| `height` | `number` | `300` | Plot height in pixels. |
| `nodeWidth` | `number` | `10` | Width of each node bar in pixels. |
| `nodeGap` | `number` | `16` | Vertical space between nodes of one column in pixels. |
| `unit` | `string` | `""` | Unit after each value, such as "visits". |
| `formatValue` | `(value: number) => string` | `value => grouped.format(value)` | Formats values in labels, the tooltip and the table. |
| `activeId` | `string \| null` | — | Controlled item in focus: a node id, or a link id written as "source>target". The rest dims while one is in focus. |
| `defaultActiveId` | `string \| null` | `null` | Item in focus on first render when uncontrolled. |
| `onActiveChange` | `(id: string \| null) => void` | — | Called when hover, touch or the keyboard moves the focus to another node or ribbon, or clears it. |
| `className` | `string` | — | Extra class on the root figure. |

### Tipos exportados

#### `SankeyNode`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable identity, used by links. A node that survives a data change keeps its place and morphs. |
| `label` (obrigatória) | `string` | Name beside the node, in the tooltip and in the table. |
| `color` | `string` | Any CSS color. First-column nodes default to the shared --series-* palette; later nodes default to a neutral ink. |

#### `SankeyLink`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `source` (obrigatória) | `string` | Id of the node the flow leaves. |
| `target` (obrigatória) | `string` | Id of the node the flow enters. |
| `value` (obrigatória) | `number` | Size of the flow. The ribbon is as thick as this value on the shared scale. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Com o foco no gráfico, passa ao nó anterior ou seguinte, coluna por coluna. |
| `←` ou `→` | Salta para o nó mais próximo, na vertical, da coluna anterior ou da seguinte. |
| `Home` ou `End` | Vai ao primeiro ou ao último nó. |
| `Esc` | Tira o destaque. |

## Acessibilidade

- O gráfico é um `role="slider"` vertical focável: ao receber foco pelo teclado, destaca o primeiro nó, e `aria-valuetext` lê nome, valor e coluna do nó atual.
- O teclado percorre só os nós; as faixas respondem ao ponteiro ou a `activeId`, e todos os fluxos estão numa tabela oculta para leitor de tela.
- O `label` vira a legenda oculta da `<figure>`; os textos da dica (`Total`, `To`, `From`, `Flow`) e o nome do slider são fixos em inglês.

## Movimento

- Na primeira vez em tela, as barras dos nós crescem a partir do centro e as faixas se desenham saindo da origem, uma coluna depois da outra.
- Depois disso, mudanças de dados não repetem a entrada: nós, faixas e rótulos que continuam existindo deslizam com mola até a nova posição e espessura.
- Com “reduzir movimento” ligado, tudo é desenhado direto no estado final e o destaque troca sem transição.

## Comportamento responsivo

- A largura segue o contêiner e a altura é a prop `height` (300 px); as colunas dividem a largura por igual, então muitas etapas em pouco espaço apertam os rótulos.
- Quando o espaço entre colunas aperta, os rótulos passam para `--text-xs` e são cortados com reticências; o valor ao lado do nome só aparece com 100 px livres.

## Desempenho

- O layout é recalculado quando `nodes`, `links` ou a largura mudam; mantenha os dois arrays estáveis (constante ou `useMemo`) para não refazê-lo a cada render.

## Notas para IA

- Passe `nodes` (`{ id, label, color? }`) e `links` (`{ source, target, value }`), com um único link por par de origem e destino: o id do link é `source>target`.
- A ordem de `nodes` define o empilhamento da primeira coluna e `columns` dá os títulos; nós sem fluxo e links com valor zero ou negativo são ignorados.
- Só os quatro primeiros nós da primeira coluna recebem cor de série (`--series-1` a `--series-4`); os demais ficam em tom neutro, a menos que você passe `color`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/sankey-chart · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
