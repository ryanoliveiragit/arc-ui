# Line chart

> Gráfico de várias linhas com mira deslizante, legenda interativa e curvas que se transformam entre períodos.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/line-chart
- Descrição original (inglês): A multi-series line chart with a gliding crosshair, legend toggles, and paths that morph between ranges.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/line-chart.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/line-chart.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/line-chart.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/line-chart.json`. Caminho do registro, relativo ao endereço do site: `r/line-chart.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/line-chart/line-chart.tsx`
  - `components/ryan-ui/line-chart/line-chart.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/line-chart.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Uma ou mais medidas ao longo do tempo, quando a forma da tendência importa mais que um valor isolado.
- Comparar o período atual com o anterior ou com uma meta, usando uma série tracejada (`dashed`).
- Painéis com troca de intervalo (7, 14, 30 dias): com as mesmas `key`, as linhas se transformam em vez de redesenhar.

## Quando não usar

- Use [`sparkline`](sparkline.md) para uma tendência compacta ao lado de um número, sem eixos nem legenda.
- Use [`bar-chart`](bar-chart.md) para comparar uma medida período a período, lendo cada barra contra a média.
- Use [`brush-chart`](brush-chart.md) para séries densas em que a pessoa precisa ampliar uma janela de tempo.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import LineChart, { type LineChartDatum, type LineChartSeries } from "@/components/ryan-ui/line-chart/line-chart";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const fmtLong = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

function build(days: number, seed: number): LineChartDatum[] {
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const start = Date.UTC(2026, 8, 21) - (days - 1) * 86400000;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start + i * 86400000);
    const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
    const trend = 1 + (i / days) * 0.5;
    const signups = Math.round((weekend ? 70 : 120) * trend + Math.sin(i / 3) * 12 + rand() * 18);
    const trials = Math.round(signups * 0.62 + rand() * 10);
    const previous = Math.round((weekend ? 60 : 100) + Math.sin(i / 4) * 10 + rand() * 14);
    return {
      key: d.toISOString().slice(0, 10),
      label: fmtLong.format(d),
      axisLabel: i % (days > 10 ? 7 : 2) === 0 ? fmt.format(d) : undefined,
      values: { signups, trials, previous },
    };
  });
}

const sets = { "7": build(7, 3), "14": build(14, 5), "30": build(30, 9) };
const series: LineChartSeries[] = [
  { key: "signups", label: "Signups" },
  { key: "trials", label: "Trials started", color: "var(--series-2)", area: false },
  { key: "previous", label: "Previous period", dashed: true, area: false },
];

export default function LineChartDemo() {
  const [range, setRange] = useState<keyof typeof sets>("14");
  return (
    <Stack gap={4} width={680}>
      <SegmentedControl label="Range" value={range} onValueChange={(v) => setRange(v as keyof typeof sets)} options={[{ value: "7", label: "7 days" }, { value: "14", label: "14 days" }, { value: "30", label: "30 days" }]} />
      <Surface>
        <LineChart data={sets[range]} series={series} label="Signups" unit="" />
      </Surface>
      <Caption>Move across the plot for the crosshair, click a legend entry to hide a line, or change the range to morph the paths.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `LineChart`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `LineChartDatum[]` | — | — |
| `series` (obrigatória) | `LineChartSeries[]` | — | — |
| `label` (obrigatória) | `string` | — | What is measured, such as "Signups". Names the chart for assistive technology. |
| `unit` | `string` | `""` | Unit after each value in the tooltip, such as "ms". |
| `height` | `number` | `220` | Plot height in pixels. The width follows the container. |
| `formatValue` | `(value: number, series: LineChartSeries) => string` | — | Formats values in the tooltip and data table. |
| `formatTick` | `(value: number) => string` | `value => compact.format(value)` | Formats the value axis. Defaults to a compact number, such as 1.2K. |
| `hiddenSeries` | `string[]` | — | Controlled hidden series keys. |
| `defaultHiddenSeries` | `string[]` | — | — |
| `onHiddenSeriesChange` | `(hidden: string[]) => void` | — | — |
| `onActiveChange` | `(index: number \| null, datum: LineChartDatum \| null) => void` | — | Called as the crosshair moves, and with null when it leaves. Use it to drive a headline readout. |
| `loading` | `boolean` | `false` | Keeps the current lines on screen, dimmed, while the next range loads. |
| `emptyLabel` | `string` | `"No data for this range"` | Shown when there are no points. |
| `legend` | `boolean` | — | Series toggles above the plot. Shown by default when there is more than one series. |
| `categoryLabel` | `string` | `"Date"` | Header of the first column in the data table read by screen readers. |
| `curve` | `"smooth" \| "linear"` | `"smooth"` | Smooth monotone curves that never swing past the data, or straight segments. |
| `ref` | `Ref<HTMLElement>` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

#### `LineChartSeries`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | Stable identity. A series keeps its line across data changes, so switching ranges morphs the path instead of redrawing it. |
| `label` (obrigatória) | `string` | Name in the legend, the tooltip, and the data table. |
| `color` | `string` | Any CSS color. Defaults to the accent for the first series, then quieter neutral steps. |
| `dashed` | `boolean` | Draws a dashed stroke, useful for a previous period or a target. |
| `area` | `boolean` | Fills the area under the line with a faint tint of its color. Defaults to true for the first series. |

#### `LineChartDatum`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | Stable identity, such as an ISO date. |
| `label` (obrigatória) | `string` | Full label for the tooltip and screen readers, such as "Tue, Sep 15". |
| `axisLabel` | `string` | Short label on the x axis, such as "Sep 15". Leave it out to keep the axis quiet at that point. |
| `values` (obrigatória) | `Record<string, number \| undefined>` | One value per series key. A missing value counts as zero. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Com o foco no gráfico, movem a mira para o ponto anterior ou o próximo; `↓` e `↑` fazem o mesmo. |
| `Page Up` ou `Page Down` | `Page Up` avança e `Page Down` recua cerca de um sexto dos pontos. |
| `Home` ou `End` | Vão ao primeiro e ao último ponto. |
| `Esc` | Solta a mira e esconde o tooltip. |
| `Enter` ou `Espaço` | Nos botões da legenda, escondem ou mostram a série. |
| `Tab` | Passa pelos botões da legenda e pelo gráfico; ao receber o foco pelo teclado, a mira começa no ponto mais recente. |

## Acessibilidade

- A área do gráfico é um `role="slider"` cujo `aria-valuetext` lê o ponto atual com o valor de cada série visível; SVG, eixos e tooltip ficam em `aria-hidden`.
- Há um resumo oculto com o intervalo e o último valor de cada série, e uma tabela oculta com todos os pontos, cuja primeira coluna usa `categoryLabel`.
- Os botões da legenda usam `aria-pressed`, e a série escondida fica com o nome riscado, não só sem cor; `label` é obrigatório, e `loading` marca a figura com `aria-busy`.

## Movimento

- Na primeira vez que entra na tela com dados, as linhas se desenham da esquerda para a direita em cerca de 0,8 s.
- Trocar `data` transforma cada linha a partir da forma atual, mesmo com outro número de pontos, enquanto a escala e as linhas de grade se reajustam; esconder uma série a achata até a base.
- A mira desliza entre os pontos e o tooltip a segue numa mola própria, mudando de lado antes de sair do gráfico; com “reduzir movimento”, tudo isso é imediato.

## Comportamento responsivo

- A largura acompanha o contêiner e a altura é fixa pela prop `height` (220 px por padrão); o eixo de valores ocupa 48 px à direita.
- O eixo de datas mostra no máximo um rótulo a cada 76 px, contando a partir do mais recente; no toque, pressionar e arrastar na horizontal move a mira.

## Desempenho

- Um único pintor escreve os caminhos direto no SVG a cada quadro, sem re-renderizar o React; a tabela oculta para leitor de tela tem uma linha por ponto, o que pesa com milhares de pontos.

## Notas para IA

- `label`, `data` e `series` são obrigatórios; cada ponto traz `values` indexado pela `key` das séries, e um valor ausente conta como zero, não como lacuna.
- Só os pontos com `axisLabel` ganham rótulo no eixo; a primeira série usa a cor de destaque com área preenchida, e as demais ficam em tons neutros até receberem `color`.
- Use `onActiveChange` para alimentar um número de destaque fora do gráfico e `loading` para manter as linhas atuais esmaecidas enquanto o próximo intervalo carrega.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/line-chart · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
