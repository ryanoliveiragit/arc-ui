# Slope chart

> Antes e depois em dois eixos, com variação de posição ao lado de cada valor.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/slope-chart
- Descrição original (inglês): Before and after on two axes: lines draw in, rank moves sit beside each value, and switching datasets slides every line to its new slope.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slope-chart.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slope-chart.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slope-chart.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slope-chart.json`. Caminho do registro, relativo ao endereço do site: `r/slope-chart.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/slope-chart/slope-chart.tsx`
  - `components/ryan-ui/slope-chart/slope-chart.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/slope-chart.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar como vários itens mudaram entre exatamente dois momentos: antes e depois, um trimestre e o seguinte.
- Quando a troca de posição conta tanto quanto o valor: a seta ao lado de cada valor final diz quantas posições o item subiu ou desceu.
- Contar a história de um item no meio dos outros: `highlightKey` pinta uma linha na cor de destaque e deixa as demais neutras.

## Quando não usar

- Use [`bump-chart`](bump-chart.md) quando o ranking muda ao longo de três ou mais períodos.
- Use [`line-chart`](line-chart.md) quando existem valores intermediários e a trajetória entre os extremos importa.
- Use [`bar-chart`](bar-chart.md) para comparar os itens num único momento, sem antes e depois.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import SlopeChart, { type SlopeItem } from "@/components/ryan-ui/slope-chart/slope-chart";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const channels = {
  h1: { start: "Q1", end: "Q2", data: [
    { key: "email", label: "Email", start: 4.8, end: 5.6 },
    { key: "search", label: "Organic search", start: 3.9, end: 4.2 },
    { key: "referral", label: "Referral", start: 3.1, end: 3.9 },
    { key: "social", label: "Social", start: 2.2, end: 1.8 },
    { key: "paid", label: "Paid ads", start: 2.6, end: 2.1 },
    { key: "direct", label: "Direct", start: 3.5, end: 3.4 },
  ] as SlopeItem[] },
  h2: { start: "Q3", end: "Q4", data: [
    { key: "email", label: "Email", start: 5.8, end: 6.4 },
    { key: "search", label: "Organic search", start: 4.3, end: 4.0 },
    { key: "referral", label: "Referral", start: 4.0, end: 4.9 },
    { key: "social", label: "Social", start: 1.9, end: 2.7 },
    { key: "paid", label: "Paid ads", start: 2.0, end: 3.2 },
    { key: "direct", label: "Direct", start: 3.3, end: 3.1 },
  ] as SlopeItem[] },
};

export default function SlopeChartDemo() {
  const [half, setHalf] = useState<"h1" | "h2">("h1");
  const c = channels[half];
  return (
    <Stack gap={4} width={560}>
      <SegmentedControl label="Period" value={half} onValueChange={(v) => setHalf(v as "h1" | "h2")} options={[{ value: "h1", label: "Q1 to Q2" }, { value: "h2", label: "Q3 to Q4" }]} />
      <Surface>
        <SlopeChart data={c.data} label="Conversion rate by channel" startLabel={c.start} endLabel={c.end} highlightKey="email" formatValue={(v) => `${v.toFixed(1)}%`} />
      </Surface>
      <Caption>Email is highlighted. Hover a line to focus it, or switch quarters to slide every line to its new slope.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SlopeChart`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `SlopeItem[]` | — | — |
| `label` (obrigatória) | `string` | — | What is measured, such as "Conversion rate by channel". Names the chart for assistive technology. |
| `startLabel` (obrigatória) | `string` | — | Heading of the first column, such as "Q1". |
| `endLabel` (obrigatória) | `string` | — | Heading of the second column, such as "Q2". |
| `formatValue` | `(value: number) => string` | — | — |
| `formatChange` | `(change: number, item: SlopeItem) => string` | — | Formats the change in the tooltip. Defaults to the difference in formatValue's terms. |
| `height` | `number` | — | Plot height in pixels. Defaults to 44 pixels per item. |
| `highlightKey` | `string \| null` | `null` | The item drawn in the accent, such as the one the story is about. |
| `activeKey` | `string \| null` | — | Controlled item in focus. The others fade while one is in focus. |
| `onActiveChange` | `(key: string \| null) => void` | — | — |
| `ranks` | `boolean` | `true` | Rank movement beside each end value. |
| `emptyLabel` | `string` | `"No data"` | — |
| `ref` | `Ref<HTMLElement>` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

#### `SlopeItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | Stable identity. An item keeps its line across datasets, so switching morphs it. |
| `label` (obrigatória) | `string` | Name beside the start value, in the tooltip, and in the table. |
| `start` (obrigatória) | `number` | Value in the first period. |
| `end` (obrigatória) | `number` | Value in the second period. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↓` ou `→` | Com o foco no gráfico, destaca o item seguinte, na ordem do valor final. |
| `↑` ou `←` | Destaca o item anterior. |
| `Home` ou `End` | Vai ao primeiro ou ao último item dessa ordem. |
| `Esc` | Desfaz o destaque e esconde a dica. |

## Acessibilidade

- A área do gráfico é um grupo focável com `aria-roledescription="slope chart"`; ao receber foco pelo teclado, destaca o primeiro item na ordem do valor final.
- Uma região `aria-live="polite"` lê o item em destaque (nome, os dois valores, variação e mudança de posição), e um resumo e uma tabela ocultos trazem todos os itens.
- As frases de posição, como `up 2 to rank 1`, são fixas em inglês e aparecem também na dica visível.

## Movimento

- Ao entrar na tela, os pontos iniciais surgem em sequência, cada linha se desenha da esquerda para a direita e só então aparecem o ponto e o rótulo finais.
- Ao trocar `data` mantendo as mesmas `key`, linhas, pontos e rótulos deslizam com mola até a nova inclinação, e o número de posições rola para o novo valor.
- Com “reduzir movimento” ligado, o gráfico aparece pronto e as trocas de dados e de destaque são imediatas.

## Comportamento responsivo

- A largura segue o contêiner; abaixo de 440 px as colunas de rótulos encolhem e o texto passa para `--text-xs`, com reticências nos nomes longos.
- A altura padrão é de 44 px por item, com mínimo de 200 px (`height` fixa outro valor); rótulos que se sobreporiam são afastados e ligados ao ponto por um traço.

## Notas para IA

- Passe `data` como `{ key, label, start, end }` e os títulos das colunas em `startLabel` e `endLabel`; os dois lados usam o mesmo eixo de valor.
- Mantenha `key` estável entre conjuntos para as linhas se transformarem em vez de sumir e reaparecer; `formatValue` e `formatChange` cuidam de unidade e sinal.
- `activeKey` só existe na forma controlada, com `onActiveChange`; sem ele o destaque é interno e some ao sair do gráfico, e `ranks={false}` esconde as setas de posição.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/slope-chart · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
