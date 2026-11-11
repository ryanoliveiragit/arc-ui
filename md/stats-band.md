# Stats band

> Faixa de números que contam até o valor final, em layout simples ou em cartões.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/stats-band
- Descrição original (inglês): Headline numbers that count up in view, each with a tiny visual that proves it and a context line on hover, plain or in a hairline grid.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/stats-band.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/stats-band.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/stats-band.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/stats-band.json`. Caminho do registro, relativo ao endereço do site: `r/stats-band.json`.

- Pacotes npm: `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Segmented control](segmented-control.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/stats-band/stats-band.tsx`
  - `components/ryan-ui/blocks/stats-band/stats-band-data.ts`
  - `components/ryan-ui/blocks/stats-band/stats-band.module.css`
  - `components/ryan-ui/blocks/stats-band/stats-band-world.ts`
  - `components/ryan-ui/segmented-control/segmented-control.tsx`
  - `components/ryan-ui/segmented-control/segmented-control.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/stats-band.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Faixa de três ou quatro números de destaque numa landing ou página institucional, cada um com um gráfico mínimo que o comprova: tendência, disponibilidade, distribuição ou mapa.
- Quando cada número tem uma linha de contexto que vale mostrar sob demanda, no hover ou no foco.

## Quando não usar

- Use [`metric-card`](metric-card.md) para um número com contexto num painel; esta faixa é uma seção de página e conta só uma vez, ao entrar na tela.
- Use [`animated-counter`](animated-counter.md) quando precisa só de um número que anima entre valores.
- Use [`bar-chart`](bar-chart.md) ou [`line-chart`](line-chart.md) quando o gráfico é o conteúdo principal e a pessoa precisa ler valores nele.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import StatsBand from "@/components/ryan-ui/blocks/stats-band/stats-band";

export default function StatsBandDemo() {
  return <StatsBand />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `StatsBand`

A band of three or four headline numbers, each with an optional tiny visual that proves it: a trend, an uptime strip, a latency histogram, or a dotted world. The numbers count up in a staggered sequence the first time the band is in view, then the visuals draw in. Hovering or focusing a stat swaps its detail line for one line of context and gives its visual the accent. Numbers use tabular figures and reserve their final width; screen readers get final values.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `stats` | `Stat[]` | `exampleStats` | Three or four stats read best. |
| `layout` | `"plain" \| "divided"` | `"plain"` | `plain` lets the stats float on whitespace; `divided` sets them in a hairline grid ruled above and below. |
| `title` | `string` | — | — |
| `description` | `string` | — | — |
| `duration` | `number` | `1.6` | Seconds each number takes to count up. Defaults to 1.6. |
| `locale` | `string` | `"en-US"` | Number formatting locale. Fixed by default so server and client agree. |
| `className` | `string` | — | — |

### `StatsBandBlock`

Preview: the band in either layout. Switching layouts plays the sequence again.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `StatsBandLayout` | `"plain" \| "divided"` |
| `StatVisual`: A small visual that proves the number beside it. Every kind is optional; a stat without one is just the number. - `trend`: a sparkline of a series, oldest first, such as twelve monthly totals. - `uptime`: one bar per day as a percentage. Full days are full height; a day with downtime is visibly shorter. - `distribution`: a histogram of equal width bins across `0..max`, with the bars below `marker` (the median) inked. - `map`: a dotted world with a dot lit for each [longitude, latitude] point. | `\| { kind: "trend"; values: number[] } \| { kind: "uptime"; days: number[] } \| { kind: "distribution"; bins: number[]; max: number; marker: number } \| { kind: "map"; points: [number, number][] }` |

#### `Stat`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `number` | The final number. The band counts up to it. |
| `prefix` | `string` | Text before the number, such as "$". |
| `suffix` | `string` | Text after the number, such as "%", "ms", or "+". |
| `decimals` | `number` | Digits after the decimal point. Defaults to 0. |
| `notation` | `"standard" \| "compact"` | `compact` shortens large numbers to 2.3M or 12K. The unit renders like a suffix. Defaults to `standard`. |
| `label` (obrigatória) | `string` | — |
| `detail` | `string` | One short supporting line under the number. |
| `context` | `string` | One line of context that replaces the detail while the stat is hovered or focused, such as "Up from 41% last year". |
| `visual` | `StatVisual` | A tiny chart that draws in after the number lands. |

### Outras exportações

- `stats` (valor)
- `WORLD` (valor)
- `worldLand` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Chega a cada número que tem `context`; com foco, a linha de detalhe dá lugar à de contexto e o visual ganha a cor de destaque. |

## Acessibilidade

- Leitores de tela recebem só o valor final de cada número, em texto escondido; a contagem animada e os visuais ficam com `aria-hidden`, então ponha em `detail` ou `context` o que o gráfico mostra.
- A faixa é uma `<section>` nomeada pelo `title` (ou “Key numbers”) e os números formam uma `<dl>`; `detail` e `context` ficam os dois no DOM, então ambos são lidos.
- Um número com `context` recebe `tabIndex=0`, mas o contorno de foco é removido: o foco aparece só pela troca de linha e pela cor do visual.

## Movimento

- Na primeira vez que 40% da lista entra na tela, os números sobem em sequência (90 ms de intervalo) e contam de zero ao valor em 1,6 s (`duration`); números compactos contam já na unidade final, de 0,0M a 2,3M.
- Quando cada número está quase no valor, o visual se desenha: linha e mapa se revelam da esquerda para a direita, as barras crescem em onda e, em `divided`, as linhas finas correm pela faixa e entre os números.
- Com “reduzir movimento” ligado (lido depois da hidratação, com o CSS cobrindo a primeira pintura), os números já aparecem no valor final e visuais e linhas ficam prontos, sem transição.

## Comportamento responsivo

- Container queries da faixa: até 800 px os números ficam dois a dois e uma faixa de três empilha numa coluna; até 520 px vai um por linha, com o visual ao lado do número.
- A largura final de cada número fica reservada desde o início, então a contagem nunca empurra o layout.

## Desempenho

- A contagem escreve direto no `textContent` do número a cada quadro, sem re-renderizar o React, e `useInView` com `once` dispara uma vez só.
- O visual `map` desenha cerca de 760 círculos SVG, um por ponto de terra da grade de 80 × 30, e é o mais pesado dos quatro.

## Notas para IA

- Importe o componente nomeado `StatsBand`; o export padrão é `StatsBandBlock`, o preview com troca de layout, e `stats` usa os dados de exemplo de `stats-band-data.ts`.
- Cada `Stat` leva `value`, `label` e, se quiser, `prefix`, `suffix`, `decimals`, `notation: "compact"`, `detail`, `context` e `visual` (`trend`, `uptime`, `distribution` ou `map`); a grade vai até 4 colunas.
- `locale` é `en-US` por padrão para servidor e cliente formatarem igual; use `pt-BR` para vírgula decimal, e troque a `key` para tocar a contagem de novo.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/stats-band · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
