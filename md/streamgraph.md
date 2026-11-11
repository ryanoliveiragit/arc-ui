# Streamgraph

> Camadas fluidas que se transformam entre períodos, com uma camada para isolar e ler semana a semana.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/streamgraph
- Descrição original (inglês): Layered streams on a wiggle baseline that morph between ranges, with a layer you can isolate and read week by week.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/streamgraph.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/streamgraph.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/streamgraph.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/streamgraph.json`. Caminho do registro, relativo ao endereço do site: `r/streamgraph.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/streamgraph/streamgraph.tsx`
  - `components/ryan-ui/streamgraph/streamgraph.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/streamgraph.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar como a mistura de várias partes muda ao longo do tempo, quando a forma geral importa mais que valores exatos: chamados por assunto, tráfego por canal.
- Quando o leitor quer isolar uma parte: apontar uma camada ou sua entrada na legenda esmaece as outras, e a dica lê os valores ponto a ponto.
- Alternar entre períodos de tamanhos diferentes: as camadas são reamostradas numa grade comum e se transformam de um conjunto no outro.

## Quando não usar

- Use [`line-chart`](line-chart.md) quando o leitor precisa comparar valores exatos entre séries: aqui só a espessura da camada é legível, e a linha de base ondula.
- Use [`bump-chart`](bump-chart.md) quando o que importa é a posição de cada série no ranking a cada período.
- Use [`composition-chart`](composition-chart.md) ou [`donut-chart`](donut-chart.md) para a divisão de um total num único momento.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useMemo, useState } from "react";
import Streamgraph, { type StreamgraphDatum, type StreamgraphSeries } from "@/components/ryan-ui/streamgraph/streamgraph";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const series: StreamgraphSeries[] = [
  { key: "billing", label: "Billing" },
  { key: "login", label: "Login" },
  { key: "bugs", label: "Bugs" },
  { key: "howto", label: "How-to" },
  { key: "api", label: "API" },
];
const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function build(weeks: number, startMs: number, seed: number): StreamgraphDatum[] {
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const bases = [60, 38, 52, 44, 26];
  return Array.from({ length: weeks }, (_, i) => {
    const d = new Date(startMs + i * 7 * 86400000);
    const values: Record<string, number> = {};
    series.forEach((sr, k) => {
      values[sr.key] = Math.round((bases[k] ?? 40) * (1 + 0.45 * Math.sin(i / 2.5 + k * 1.3)) + rand() * 10);
    });
    return { key: d.toISOString().slice(0, 10), label: `Week of ${fmt.format(d)}`, axisLabel: i % 3 === 0 ? fmt.format(d) : undefined, values };
  });
}

export default function StreamgraphDemo() {
  const sets = useMemo(() => ({ q3: build(13, Date.UTC(2026, 6, 6), 4), q4: build(13, Date.UTC(2026, 9, 5), 12) }), []);
  const [q, setQ] = useState<"q3" | "q4">("q3");
  return (
    <Stack gap={4} width={760}>
      <SegmentedControl label="Quarter" value={q} onValueChange={(v) => setQ(v as "q3" | "q4")} options={[{ value: "q3", label: "Q3 2026" }, { value: "q4", label: "Q4 2026" }]} />
      <Surface>
        <Streamgraph data={sets[q]} series={series} label="Support tickets by topic" unit="tickets" />
      </Surface>
      <Caption>Hover a layer to isolate it and read it week by week; toggle topics in the legend; switch quarters to morph.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Streamgraph`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `StreamgraphDatum[]` | — | — |
| `series` (obrigatória) | `StreamgraphSeries[]` | — | Layers from the centre out: the first runs through the middle of the stream, the rest alternate above and below it. |
| `label` (obrigatória) | `string` | — | What is measured, such as "Support tickets by topic". Names the chart for assistive technology. |
| `unit` | `string` | `""` | Unit after each value, such as "tickets". |
| `height` | `number` | `260` | Plot height in pixels. The width follows the container. |
| `offset` | `"wiggle" \| "silhouette" \| "zero"` | `"wiggle"` | "wiggle" minimises layer slopes for a flowing stream, "silhouette" centres the stack, "zero" stacks from a flat baseline. |
| `formatValue` | `(value: number, series: StreamgraphSeries) => string` | — | — |
| `hiddenSeries` | `string[]` | — | Controlled hidden layer keys. A hidden layer thins to nothing and the rest reflow. |
| `defaultHiddenSeries` | `string[]` | — | — |
| `onHiddenSeriesChange` | `(hidden: string[]) => void` | — | — |
| `onActiveChange` | `(index: number \| null, seriesKey: string \| null) => void` | — | Called as the reading moves, and with nulls when it leaves. |
| `legend` | `boolean` | `true` | Layer toggles above the plot. |
| `directLabels` | `boolean` | `true` | Names each layer inside its widest stretch when it is thick enough to hold the text. |
| `categoryLabel` | `string` | `"Date"` | Header of the first column in the screen reader table. |
| `emptyLabel` | `string` | `"No data for this range"` | — |
| `ref` | `Ref<HTMLElement>` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

#### `StreamgraphSeries`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | Stable identity. A layer keeps its place and color across data changes, so switching datasets morphs it. |
| `label` (obrigatória) | `string` | Name in the legend, the direct label, the tooltip, and the data table. |
| `color` | `string` | Any CSS color. Defaults to the chart series for the first four layers (the first in the accent), then neutral steps. |

#### `StreamgraphDatum`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | Stable identity, such as an ISO week. |
| `label` (obrigatória) | `string` | Full label for the tooltip and screen readers, such as "Week of Sep 14". |
| `axisLabel` | `string` | Short label on the time axis. Leave it out to keep the axis quiet at that point. |
| `values` (obrigatória) | `Record<string, number \| undefined>` | One value per series key. Missing values count as zero; negatives are treated as zero. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Com o foco no gráfico, recua ou avança um ponto no tempo. |
| `↑` ou `↓` | Troca a camada em destaque, seguindo a ordem de `series`. |
| `Page Up` ou `Page Down` | Avança ou recua cerca de um sexto do período. |
| `Home` ou `End` | Vai ao primeiro ou ao último ponto. |
| `Enter` ou `Espaço` | Na legenda, esconde ou mostra a camada do botão em foco. |
| `Esc` | Encerra a leitura e esconde a dica. |

## Acessibilidade

- A área do gráfico é um grupo focável com `aria-roledescription="stream graph"`; ao receber foco pelo teclado, a leitura começa no ponto mais recente.
- Uma região `aria-live="polite"` lê o ponto atual, a camada em destaque com seu valor e o total; um resumo e uma tabela ocultos trazem todos os dados.
- A legenda é um grupo de botões com `aria-pressed` (pressionado = camada visível); o cabeçalho da primeira coluna da tabela vem de `categoryLabel`, que por padrão é `Date`.

## Movimento

- Na primeira vez em tela, o fluxo se abre a partir de um fio ao longo do centro; dados novos fazem cada camada se transformar com mola a partir da forma atual.
- Esconder uma camada pela legenda a afina até sumir enquanto as outras fecham o espaço; a mira desliza entre pontos e a dica segue numa mola própria.
- Com “reduzir movimento” ligado, as camadas vão direto ao estado final e a mira e a dica saltam.

## Comportamento responsivo

- A largura segue o contêiner e a altura é a prop `height` (260 px); o eixo mostra no máximo um `axisLabel` a cada 72 px, contando a partir do mais recente.
- O nome dentro da camada só aparece onde ela tem ao menos 19 px de espessura e o texto cabe; nas camadas finas a identificação fica com a legenda e a dica.

## Desempenho

- O desenho é imperativo: a cada quadro de animação todas as camadas têm o caminho refeito com 161 amostras e a linha de base recalculada, então o custo cresce com o número de camadas.

## Notas para IA

- Passe `series` (`{ key, label, color? }`) e `data` com um objeto `values` por ponto, indexado pela `key` da série; valores ausentes ou negativos contam como zero.
- A ordem de `series` vai do centro para fora: a primeira corre pelo meio e as demais alternam acima e abaixo; só as quatro primeiras recebem cor de série, e o resto fica neutro sem `color`.
- `offset="zero"` empilha a partir de uma base reta e `offset="silhouette"` centraliza a pilha; `hiddenSeries` com `onHiddenSeriesChange` controla as camadas escondidas.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/streamgraph · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
