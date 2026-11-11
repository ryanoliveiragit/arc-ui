# Bump chart

> Ranking ao longo do tempo: as linhas trocam de posição a cada período e a série escolhida vem para a frente.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/bump-chart
- Descrição original (inglês): Ranking over time: lines swap positions between periods, draw in from the first period, and hovering a series brings it forward with its rank at every period.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bump-chart.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bump-chart.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bump-chart.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bump-chart.json`. Caminho do registro, relativo ao endereço do site: `r/bump-chart.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/bump-chart/bump-chart.tsx`
  - `components/ryan-ui/bump-chart/bump-chart.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/bump-chart.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Quando a ordem importa mais que os valores: quem liderou, quem ultrapassou quem e em que período.
- Rankings por período com poucos itens, como regiões por mês ou times por rodada, com o nome de cada série no fim da linha.
- Trocar a medida do ranking mantendo os itens: séries com a mesma `key` deslizam para as novas posições.

## Quando não usar

- Use [`line-chart`](line-chart.md) quando a distância entre os valores importa: aqui só a posição aparece no desenho.
- Use [`slope-chart`](slope-chart.md) para comparar exatamente dois momentos.
- Use [`sortable-data-table`](sortable-data-table.md) para o ranking de um único período com várias colunas.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import BumpChart, { type BumpSeries } from "@/components/ryan-ui/bump-chart/bump-chart";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

const region = (key: string, label: string, values: number[]): BumpSeries => ({ key, label, values });
const metrics: Record<string, { label: string; format: (value: number) => string; series: BumpSeries[] }> = {
  revenue: {
    label: "Sales regions ranked by monthly revenue",
    format: (value) => `$${value}k`,
    series: [
      region("online", "Online", [240, 286, 338, 381, 426, 472]),
      region("west", "West", [430, 419, 436, 450, 438, 447]),
      region("northeast", "Northeast", [412, 428, 405, 398, 441, 456]),
      region("southeast", "Southeast", [388, 395, 418, 432, 420, 415]),
      region("midwest", "Midwest", [301, 322, 340, 365, 402, 430]),
      region("southwest", "Southwest", [355, 340, 332, 318, 305, 298]),
    ],
  },
  customers: {
    label: "Sales regions ranked by new customers",
    format: (value) => `${value} new`,
    series: [
      region("online", "Online", [58, 79, 100, 112, 121, 138]),
      region("west", "West", [110, 104, 98, 95, 102, 94]),
      region("northeast", "Northeast", [96, 88, 91, 84, 80, 86]),
      region("southeast", "Southeast", [72, 85, 93, 101, 97, 92]),
      region("midwest", "Midwest", [64, 70, 66, 78, 88, 99]),
      region("southwest", "Southwest", [81, 76, 70, 73, 69, 62]),
    ],
  },
};

export default function BumpChartDemo() {
  const [metric, setMetric] = useState("revenue");
  const current = metrics[metric] ?? metrics.revenue;
  return (
    <Stack gap={4} width={600}>
      <SegmentedControl label="Rank by" value={metric} onValueChange={setMetric} options={[{ value: "revenue", label: "Revenue" }, { value: "customers", label: "New customers" }]} />
      <Surface>
        {current && <BumpChart series={current.series} periods={months} label={current.label} formatValue={current.format} />}
      </Surface>
      <Caption>Hover a line to bring that region forward with its rank in every month. Switching the measure slides each line to its new places.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `BumpChart`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `series` (obrigatória) | `BumpSeries[]` | — | The items being ranked. |
| `periods` (obrigatória) | `string[]` | — | Label of each period on the axis, such as ["Jun", "Jul", "Aug"]. |
| `label` (obrigatória) | `string` | — | What is ranked, such as "Regions ranked by monthly revenue". Names the chart for assistive technology. |
| `order` | `"desc" \| "asc"` | `"desc"` | "desc" ranks the highest value first; "asc" ranks the lowest first, for times or costs. |
| `rowHeight` | `number` | `40` | Vertical distance between two ranks in pixels. |
| `formatValue` | `(value: number) => string` | `value => grouped.format(value)` | Formats the value behind a rank in the tooltip and the table. |
| `activeKey` | `string \| null` | — | Controlled key of the series brought forward, or null for none. The others fade while one is forward. |
| `defaultActiveKey` | `string \| null` | `null` | Series brought forward on first render when uncontrolled. |
| `onActiveChange` | `(key: string \| null) => void` | — | Called when hover, touch or the keyboard brings another series forward, or lets go. |
| `className` | `string` | — | Extra class on the root figure. |

### Tipos exportados

#### `BumpSeries`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | Stable identity. A series that survives a data change keeps its line and slides to its new ranks. |
| `label` (obrigatória) | `string` | Name at the end of the line, in the tooltip and in the table. |
| `values` (obrigatória) | `number[]` | One value per period, in the order of `periods`. Ranks are worked out from these. |
| `color` | `string` | Any CSS color. Series default to the shared --series-* palette in data order, then neutral steps. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Leva o foco à área do gráfico e traz à frente a série que está em primeiro no último período. |
| `↑` ou `↓` | Passa à série uma posição acima ou abaixo no período atual. |
| `←` ou `→` | Vai ao período anterior ou ao seguinte, mantendo a série. |
| `Home` ou `End` | Vai ao primeiro ou ao último período. |
| `Esc` | Solta a série: todas voltam ao mesmo peso. |

## Acessibilidade

- A área de leitura é um `role="slider"` vertical cujo `aria-valuetext` diz série, período, posição, valor e a mudança desde o período anterior.
- Uma tabela oculta traz a posição e o valor de cada série em cada período; `label` é obrigatório e nomeia a figura.
- Ordinais e frases da dica (“1st of 6”, “Up 2 from Oct”) são gerados em inglês no código e não têm prop de tradução.

## Movimento

- Na primeira aparição cada linha se desenha do primeiro ao último período, uma série depois da outra, e os pontos surgem acompanhando o traço.
- Quando os dados mudam, linhas, pontos e nomes deslizam com mola sem ultrapassagem para as novas posições; a série em foco ganha traço mais grosso e um anel com a posição em cada período, e as outras esmaecem.
- Com “reduzir movimento”, tudo aparece e troca na hora, e a dica salta em vez de deslizar.

## Comportamento responsivo

- A altura é `rowHeight` (40 px) vezes o número de séries e a largura é a do contêiner; a coluna de nomes ocupa até 36% e corta com reticências.
- Os rótulos de período não rareiam quando falta espaço: com muitos períodos em tela estreita eles se sobrepõem, então use rótulos curtos.

## Notas para IA

- Cada série é `{ key, label, values, color? }`, com um valor por item de `periods` na mesma ordem; as posições são calculadas dos valores, e `order="asc"` põe o menor em primeiro (tempos, custos).
- Série em foco: controlada com `activeKey` e `onActiveChange` (`null` para nenhuma), ou livre com `defaultActiveKey`.
- As quatro primeiras séries usam `--series-1` a `--series-4` e as seguintes, três tons neutros que se repetem a partir da oitava: passe `color` se houver mais.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/bump-chart · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
