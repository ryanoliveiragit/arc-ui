# Bar chart

> Compare uma medida ao longo dos dias e passe o dedo por qualquer barra para ver o valor.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/bar-chart
- Descrição original (inglês): Compare one measure across days and scrub any bar for its value.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bar-chart.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bar-chart.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bar-chart.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bar-chart.json`. Caminho do registro, relativo ao endereço do site: `r/bar-chart.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/bar-chart/bar-chart.tsx`
  - `components/ryan-ui/bar-chart/bar-chart.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/bar-chart.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Uma medida ao longo de dias, semanas ou meses, quando a pessoa compara cada período com os outros e com a média.
- Trocar de intervalo (semana, 30 dias) sem redesenhar: barras com a mesma `key` ficam no lugar e o eixo aproxima ou afasta em torno da mais recente.
- Leitura por toque: arrastar o dedo sobre as barras mostra o valor de cada uma no título.

## Quando não usar

- Use [`line-chart`](line-chart.md) para mais de uma série ou quando a forma da tendência importa mais que cada valor.
- Use [`sparkline`](sparkline.md) para uma tendência compacta ao lado de um número, sem eixos.
- Use [`composition-chart`](composition-chart.md) para as partes de um todo; este gráfico mostra uma única medida e não desenha valores negativos.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import BarChart, { type BarChartDatum } from "@/components/ryan-ui/bar-chart/bar-chart";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const day = (iso: string) => new Date(`${iso}T00:00:00Z`);
const long = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const short = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function range(startIso: string, values: number[], weekly: boolean): BarChartDatum[] {
  return values.map((value, i) => {
    const d = new Date(day(startIso).getTime() + i * 86400000);
    return {
      key: d.toISOString().slice(0, 10),
      label: long.format(d),
      axisLabel: weekly ? "SMTWTFS"[d.getUTCDay()] : i % 5 === 0 ? short.format(d) : undefined,
      value,
    };
  });
}

const week = range("2026-09-15", [42, 67, 55, 81, 38, 24, 59], true);
const month = range("2026-08-23", [30, 44, 52, 61, 48, 22, 18, 39, 57, 63, 70, 51, 27, 20, 46, 58, 66, 49, 72, 33, 25, 41, 62, 68, 74, 55, 29, 21, 47, 64], false);

export default function BarChartDemo() {
  const [mode, setMode] = useState("week");
  return (
    <Stack gap={4} width={560}>
      <SegmentedControl label="Range" value={mode} onValueChange={setMode} options={[{ value: "week", label: "Week" }, { value: "month", label: "30 days" }]} />
      <Surface>
        <BarChart
          data={mode === "week" ? week : month}
          label="Active minutes"
          period={mode === "week" ? "Sep 15–21, 2026" : "Aug 23 – Sep 21, 2026"}
          unit="min"
        />
      </Surface>
      <Caption>Drag across the bars to scrub values. Switching the range morphs the bars and the average line.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `BarChart`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `BarChartDatum[]` | — | — |
| `label` (obrigatória) | `string` | — | What is measured, such as "Active minutes". Names the chart for assistive technology. |
| `period` (obrigatória) | `string` | — | The range on show, such as "Sep 15–21, 2026". It rests under the headline. |
| `unit` | `string` | `""` | Unit after each value, such as "min". |
| `averageLabel` | `string` | `"Daily average"` | Headline label at rest, above the average. |
| `valueLabel` | `string` | `"Total"` | Headline label while a bar is scrubbed. |
| `categoryLabel` | `string` | `"Day"` | Header of the first column in the data table read by screen readers. |
| `showAverage` | `boolean` | `true` | Draws the average as a reference line that springs to each new range. |
| `height` | `number` | `176` | Plot height in pixels. |
| `formatValue` | `(value: number) => string` | `value => grouped.format(value)` | — |

### Tipos exportados

#### `BarChartDatum`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | Stable identity, such as an ISO date. A bar whose key survives a data change keeps its place, so switching ranges morphs instead of redrawing. |
| `label` (obrigatória) | `string` | Full label for the headline and screen readers, such as "Tue, Sep 15". |
| `axisLabel` | `string` | Short label under the bar, such as "T" or "Sep 14". Leave it out to keep the axis quiet. |
| `value` (obrigatória) | `number` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Leva o foco à área do gráfico, que se comporta como um `slider`, e ativa a barra mais recente. |
| `←` ou `↓` | Vai à barra anterior. |
| `→` ou `↑` | Vai à barra seguinte. |
| `Page Up` ou `Page Down` | Avança ou recua sete barras. |
| `Home` ou `End` | Vai à primeira ou à última barra. |
| `Esc` | Sai da leitura: o título volta a mostrar a média. |

## Acessibilidade

- A área de leitura é um `role="slider"` focável cujo `aria-valuetext` diz o rótulo e o valor da barra ativa; o SVG é um `img` com um resumo de média, maior e menor valor.
- Uma tabela oculta lista todos os pontos para o leitor de tela, e uma região `aria-live` anuncia período e média quando os dados mudam.
- `label` e `period` são obrigatórios e nomeiam o gráfico; “Avg”, “Highest” e “Lowest” ficam em inglês no código, mas `averageLabel`, `valueLabel` e `categoryLabel` são seus.

## Movimento

- As barras crescem da base, da esquerda para a direita, quando o gráfico entra na tela, e a linha da média sobe junto.
- Num intervalo novo, o eixo do tempo aproxima ou afasta com mola em torno da barra mais recente: as barras que ficam mudam de altura no lugar, as que saem afundam na base e a média desliza.
- Com “reduzir movimento”, alturas, escala e cursor saltam para o valor final e os textos do título só esmaecem.

## Comportamento responsivo

- O gráfico mede a própria largura, e os rótulos do eixo rareiam (um sim, um não, e assim por diante, contando da barra mais recente) para não se tocarem.
- A camada de leitura usa `touch-action: pan-y`: arrastar na horizontal lê as barras e na vertical continua rolando a página; a altura é fixa em `height` (176 px por padrão).

## Desempenho

- Cada barra é um `path` recalculado a cada quadro durante as transições e ocupa 58% da sua fatia (no máximo 28 px): o componente serve a dezenas de barras, não a centenas.

## Notas para IA

- Cada ponto é `{ key, label, axisLabel?, value }`, do mais antigo ao mais novo; a `key` tem de ser estável (uma data ISO) para a troca de intervalo transformar as barras em vez de redesenhar.
- A barra ativa é estado interno: não há prop nem callback para ler ou controlar qual está sendo lida.
- A média do título é arredondada para inteiro antes de `formatValue`, e o formato padrão não tem casas decimais: para medidas fracionárias, passe os valores numa unidade menor.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/bar-chart · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
