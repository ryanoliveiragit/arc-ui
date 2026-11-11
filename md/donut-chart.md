# Donut chart

> Gráfico de rosca cujos arcos se transformam entre conjuntos de dados, com o valor ativo rolando no centro.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/donut-chart
- Descrição original (inglês): A donut whose arcs morph between datasets, with the active value rolling into the center.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/donut-chart.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/donut-chart.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/donut-chart.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/donut-chart.json`. Caminho do registro, relativo ao endereço do site: `r/donut-chart.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/donut-chart/donut-chart.tsx`
  - `components/ryan-ui/donut-chart/donut-chart.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/donut-chart.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Poucas partes de um todo (até umas seis), quando a fatia de cada uma importa mais que a comparação exata entre valores.
- Alternar entre conjuntos de dados com as mesmas chaves (mês a mês, plano a plano): os arcos se transformam em vez de redesenhar.
- Quando a pessoa precisa esconder categorias na legenda para ver como o restante do anel se redistribui.

## Quando não usar

- Use [`composition-chart`](composition-chart.md) quando o espaço é uma faixa horizontal: as mesmas partes cabem numa barra empilhada com legenda.
- Use [`treemap`](treemap.md) quando há muitas partes ou níveis de hierarquia; aqui, o que fica abaixo de `groupBelow` ou além de `maxSegments` é agrupado em “Other”.
- Use [`gauge`](gauge.md) para um único valor contra uma faixa conhecida; a rosca divide um total em partes.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import DonutChart, { type DonutChartDatum } from "@/components/ryan-ui/donut-chart/donut-chart";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const datasets: Record<string, DonutChartDatum[]> = {
  august: [
    { key: "search", label: "Organic search", value: 48200 },
    { key: "direct", label: "Direct", value: 31400 },
    { key: "social", label: "Social", value: 14800 },
    { key: "email", label: "Email", value: 11900 },
    { key: "referral", label: "Referral", value: 8300 },
    { key: "ads", label: "Paid ads", value: 2100 },
  ],
  september: [
    { key: "search", label: "Organic search", value: 52600 },
    { key: "direct", label: "Direct", value: 29800 },
    { key: "social", label: "Social", value: 21700 },
    { key: "email", label: "Email", value: 9400 },
    { key: "referral", label: "Referral", value: 10200 },
    { key: "ads", label: "Paid ads", value: 6500 },
  ],
};

export default function DonutChartDemo() {
  const [month, setMonth] = useState("august");
  return (
    <Stack gap={4} width={520}>
      <SegmentedControl label="Month" value={month} onValueChange={setMonth} options={[{ value: "august", label: "August" }, { value: "september", label: "September" }]} />
      <Surface>
        <DonutChart data={datasets[month] ?? []} label="Visits by source" unit="visits" totalLabel="Total visits" />
      </Surface>
      <Caption>Hover a segment or legend row to read it in the center; click a legend row to hide it.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `DonutChart`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `DonutChartDatum[]` | — | — |
| `label` (obrigatória) | `string` | — | What the whole is, such as "Visits by source". Names the chart for assistive technology. |
| `unit` | `string` | `""` | Unit after values, such as "visits". |
| `formatValue` | `(value: number) => string` | `value => grouped.format(value)` | — |
| `totalLabel` | `string` | `"Total"` | Center label at rest, above the total. |
| `size` | `number` | `208` | Diameter in pixels. The chart scales down to fit narrower containers. |
| `thickness` | `number` | `24` | Ring thickness in pixels. |
| `groupBelow` | `number` | `.04` | Segments below this share of the total join "Other". |
| `maxSegments` | `number` | `6` | The most segments drawn, counting "Other". The smallest parts beyond it are grouped. |
| `otherLabel` | `string` | `"Other"` | — |
| `activeKey` | `string \| null` | — | Controlled selected segment key. Hover and focus preview other segments without changing it. |
| `defaultActiveKey` | `string \| null` | `null` | — |
| `onActiveChange` | `(key: string \| null) => void` | — | — |
| `hiddenKeys` | `string[]` | — | Controlled hidden segment keys. A hidden segment closes and the rest of the ring redistributes. |
| `defaultHiddenKeys` | `string[]` | — | — |
| `onHiddenKeysChange` | `(keys: string[]) => void` | — | — |
| `legendAction` | `"toggle" \| "select"` | `"toggle"` | What clicking a legend row does: show or hide its segment, or pin it as the selected segment. |
| `legend` | `boolean` | `true` | The synced legend beside or below the ring. |
| `emptyLabel` | `string` | `"No data yet"` | — |
| `ref` | `Ref<HTMLElement>` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

#### `DonutChartDatum`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | Stable identity. A segment whose key survives a data change keeps its place and color, so switching datasets morphs the arcs. |
| `label` (obrigatória) | `string` | — |
| `value` (obrigatória) | `number` | — |
| `color` | `string` | Any CSS color. Segments default to the shared --series-* palette in data order, then neutral steps. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` ou `←` ou `→` | Movem o foco entre as linhas da legenda, dando a volta nas pontas; a linha em foco destaca o arco e aparece no centro. |
| `Home` ou `End` | Vão à primeira e à última linha da legenda. |
| `Enter` ou `Espaço` | Na legenda, escondem ou mostram o segmento (`legendAction="toggle"`) ou o fixam como selecionado (`legendAction="select"`). |
| `Esc` | Desfaz a seleção fixada. |

## Acessibilidade

- O SVG é decorativo (`aria-hidden`): o leitor de tela recebe um resumo com total e fatias, uma tabela oculta com segmento, valor e participação, e anúncios `aria-live` quando um segmento é mostrado ou escondido.
- Cada linha da legenda é um botão com `aria-pressed` e `aria-label` com nome, valor e porcentagem; com `legend={false}`, o anel vira um grupo focável em que as setas leem cada segmento e `Enter` ou `Espaço` o fixam.
- `label` é obrigatório e nomeia a figura; os textos gerados para leitor de tela (“hidden”, “Segment”, “Includes…”) estão fixos em inglês.

## Movimento

- Na primeira vez que 35% do gráfico entra na tela, os arcos abrem a partir do topo numa varredura única, com a borda final de cada um um instante atrás da anterior.
- Ao trocar `data` ou esconder um segmento, cada arco vai de onde está até o novo ângulo numa mola sem ultrapassagem; chaves iguais mantêm lugar e cor, e o segmento que sai fecha até sumir.
- O segmento ativo desliza para fora e engrossa enquanto os outros esmaecem, e o centro troca de leitura rolando como um tambor; com “reduzir movimento”, tudo isso muda na hora.

## Comportamento responsivo

- A figura é um contêiner (`container-type: inline-size`): com 460 px ou mais a legenda fica ao lado do anel; abaixo disso, vai para baixo dele.
- O anel tem `size` px de diâmetro (208 por padrão) e encolhe para caber em contêineres mais estreitos; rótulos longos no centro são cortados com reticências.

## Desempenho

- Durante as animações, as formas são escritas direto no DOM, uma pintura por quadro, e os números direto no texto: nenhum quadro re-renderiza o React.

## Notas para IA

- `label` é obrigatório, e cada item de `data` precisa de `key` estável, `label` e `value`; valores zero ou negativos são descartados.
- Seleção (`activeKey`, `onActiveChange`) e ocultos (`hiddenKeys`, `onHiddenKeysChange`) podem ser controlados ou não; o cursor só pré-visualiza, clicar num arco fixa ou solta a seleção, e o último segmento visível nunca é escondido.
- As cores seguem `--series-1` a `--series-4` e depois tons neutros (passe `color` no item para ir além); basta um pai com largura, pois a altura vem do conteúdo.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/donut-chart · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
