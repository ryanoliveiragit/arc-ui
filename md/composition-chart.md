# Composition chart

> Barra empilhada de 100% com legenda: mostra as partes de um todo e desliza os segmentos quando os dados mudam.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/composition-chart
- Descrição original (inglês): 100% stacked bar of the parts of a whole with a legend: segments slide to their new shares when the data changes, and legend rows switch parts off and on.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/composition-chart.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/composition-chart.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/composition-chart.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/composition-chart.json`. Caminho do registro, relativo ao endereço do site: `r/composition-chart.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/composition-chart/composition-chart.tsx`
  - `components/ryan-ui/composition-chart/composition-chart.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/composition-chart.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- As partes de um único todo quando a participação de cada uma importa mais que o histórico: gasto por serviço, receita por plano.
- Deixar a pessoa tirar uma parte da conta: cada linha da legenda desliga ou religa a parte e as demais se redistribuem na barra.
- Comparar as mesmas partes entre períodos: com as mesmas `key`, os segmentos deslizam para as novas participações.

## Quando não usar

- Use [`usage-meter`](usage-meter.md) quando as partes preenchem um limite fixo, como o armazenamento de um plano.
- Use [`treemap`](treemap.md) para partes dentro de partes, com navegação por níveis.
- Use [`streamgraph`](streamgraph.md) quando interessa como a mistura muda ao longo do tempo.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import CompositionChart, { type CompositionPart } from "@/components/ryan-ui/composition-chart/composition-chart";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const services = (values: number[]): CompositionPart[] => [
  { key: "compute", label: "Compute", value: values[0] ?? 0 },
  { key: "database", label: "Databases", value: values[1] ?? 0 },
  { key: "storage", label: "Storage", value: values[2] ?? 0 },
  { key: "network", label: "Networking", value: values[3] ?? 0 },
  { key: "other", label: "Everything else", value: values[4] ?? 0 },
];

const months: Record<string, { name: string; parts: CompositionPart[] }> = {
  sep: { name: "September", parts: services([18400, 7600, 9200, 4100, 2300]) },
  oct: { name: "October", parts: services([21300, 8900, 9800, 3600, 2900]) },
  nov: { name: "November", parts: services([19800, 12400, 11200, 3900, 2600]) },
};

const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function CompositionChartDemo() {
  const [month, setMonth] = useState("nov");
  const current = months[month] ?? months.nov;
  return (
    <Stack gap={4} width={560}>
      <SegmentedControl label="Month" value={month} onValueChange={setMonth} options={[{ value: "sep", label: "Sep" }, { value: "oct", label: "Oct" }, { value: "nov", label: "Nov" }]} />
      <Surface>
        {current && <CompositionChart data={current.parts} label="Cloud spend by service" totalLabel={`total in ${current.name}`} formatValue={(value) => dollars.format(value)} />}
      </Surface>
      <Caption>Switch the month and the segments slide to their new shares. Select a legend row to leave that service out of the whole.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CompositionChart`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `CompositionPart[]` | — | The parts, in the order they should sit in the bar and the legend. |
| `label` (obrigatória) | `string` | — | What the whole is, such as "Cloud spend by service". Names the chart for assistive technology and heads the readout. |
| `totalLabel` | `string` | `"total"` | Short text beside the total, such as "total in November". |
| `formatValue` | `(value: number) => string` | `value => grouped.format(value)` | Formats the total and each part's value. |
| `barHeight` | `number` | `28` | Height of the bar in pixels. |
| `hideHeader` | `boolean` | `false` | Hides the headline with the total. |
| `hiddenKeys` | `string[]` | — | Controlled keys of the parts switched off in the legend. The rest are rescaled to fill the bar. |
| `defaultHiddenKeys` | `string[]` | — | Parts switched off on first render when uncontrolled. |
| `onHiddenChange` | `(keys: string[]) => void` | — | Called when a legend item switches a part on or off. The last part on show cannot be switched off. |
| `className` | `string` | — | Extra class on the root figure. |

### Tipos exportados

#### `CompositionPart`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | Stable identity. A part that survives a data change keeps its segment and slides to its new share. |
| `label` (obrigatória) | `string` | Name in the legend and the tooltip. |
| `value` (obrigatória) | `number` | Size of the part. Shares are worked out against the sum of the parts on show. |
| `color` | `string` | Any CSS color. Parts default to the shared --series-* palette in data order, then neutral steps. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Percorre as linhas da legenda; a parte em foco se destaca na barra e mostra a dica. |
| `Enter` ou `Espaço` | Desligam ou religam a parte em foco; a última parte visível não pode ser desligada. |

## Acessibilidade

- A barra fica em `aria-hidden`: os dados vêm da legenda, em que cada linha é um botão com `aria-pressed`, nome, valor e participação.
- O total do título também está em `aria-hidden`: se ele for essencial, repita-o em `label`, que é obrigatório e nomeia a figura.
- “Value”, “Share”, “Hidden” e a instrução da legenda estão em inglês no código; só `label`, `totalLabel` e os nomes das partes são seus.

## Movimento

- Na primeira aparição os segmentos crescem da borda esquerda, um após o outro, e o total e as porcentagens contam a partir do zero.
- Com dados novos ou uma parte desligada, os segmentos deslizam com mola sem ultrapassagem para as novas larguras; o que foi desligado dobra até sumir onde estava.
- O segmento em foco cresce 3 px para cima e para baixo e a dica desliza até ele; com “reduzir movimento”, larguras e números mudam na hora.

## Comportamento responsivo

- A barra mede a largura do contêiner, e a legenda é uma grade com colunas de no mínimo 232 px, que vira uma coluna só quando falta espaço.

## Notas para IA

- Cada parte é `{ key, label, value, color? }` na ordem em que deve aparecer; partes com valor zero ficam fora da barra e aparecem na legenda como “Hidden”, então filtre antes.
- Total e porcentagens são calculados sobre as partes visíveis: ao desligar uma, o total do título diminui; controle com `hiddenKeys` e `onHiddenChange`, ou use `defaultHiddenKeys`.
- As quatro primeiras partes usam `--series-1` a `--series-4` e as seguintes, três tons neutros que se repetem a partir da oitava: agrupe o resto em “Outros” ou passe `color`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/composition-chart · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
