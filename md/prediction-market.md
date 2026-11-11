# Prediction market

> Cartão de mercado de previsões com preços de sim e não, linha de probabilidade, valor e estimativa de retorno (dados fictícios).

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/prediction-market
- Descrição original (inglês): A market card with yes and no prices, a probability line that flips to the picked outcome, an amount field and a payout estimate that counts to each new value (play money).

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/prediction-market.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/prediction-market.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/prediction-market.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/prediction-market.json`. Caminho do registro, relativo ao endereço do site: `r/prediction-market.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/prediction-market/prediction-market.tsx`
  - `components/ryan-ui/blocks/prediction-market/prediction-market.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/prediction-market.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mercado de sim ou não com dinheiro fictício, em demos, conteúdo educativo ou jogos: preço de cada resultado, histórico da probabilidade e um bilhete com estimativa de retorno.
- Quando a pessoa precisa ler o histórico ponto a ponto, com ponteiro ou teclado, e ver o retorno se atualizar enquanto digita o valor.

## Quando não usar

- Use [`line-chart`](line-chart.md) quando só precisa mostrar a série histórica, ou várias séries, sem o bilhete de compra.
- Use [`token-swap`](token-swap.md) para trocar um ativo por outro com taxa e tarifa.
- Para dinheiro real o bloco não basta: saldo e posição vivem só no estado local e uma ordem rejeitada volta ao início sem mensagem de erro.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import PredictionMarketPreview from "@/components/ryan-ui/blocks/prediction-market/prediction-market";
import type { DemoStage } from "./_kit";

// The card is taller than the default block stage.
export const stage: DemoStage = { height: 840 };

export default function PredictionMarketDemo() {
  return <PredictionMarketPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `PredictionMarket`

A market card for a yes or no question: the price of each outcome, the probability over time, and an order ticket with a live payout estimate. Picking the other outcome flips the line to that outcome's history, numbers count to their new values, and the confirm button walks through sending and done. All amounts are play money.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `question` (obrigatória) | `string` | — | The question the market settles. |
| `category` | `string` | — | Small label above the question. |
| `ranges` (obrigatória) | `PredictionRange[]` | — | History of the "yes" probability, one entry per time range. The last point of the active range is the current price. |
| `defaultRange` | `string` | — | Range shown first. Defaults to the first one. |
| `volume` | `string` | — | Traded volume, already formatted. |
| `closes` | `string` | — | When the market closes, already formatted. |
| `side` | `"yes" \| "no"` | — | Selected outcome (controlled). |
| `defaultSide` | `"yes" \| "no"` | `"yes"` | Selected outcome on first render (uncontrolled). |
| `onSideChange` | `(side: PredictionSide) => void` | — | Called when the outcome changes. |
| `defaultAmount` | `number` | `25` | Amount in the field on first render. |
| `balance` | `number` | `250` | Play balance available to spend. It goes down as orders are placed. |
| `onPlaceOrder` | `(order: PredictionOrder) => void \| Promise<void>` | — | Called when an order is confirmed. Return a promise to keep the button in its sending state until it settles. |
| `className` | `string` | — | Extra class for the card. |

### `PredictionMarketPreview`

Ready preview with fixed sample data.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `PredictionSide` | `"yes" \| "no"` |

#### `PredictionRange`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable key of the range, such as "1w". |
| `label` (obrigatória) | `string` | Short label on the range switch. |
| `points` (obrigatória) | `number[]` | Probability of "yes" over time, each from 0 to 1. Every range must have the same number of points so the line can morph. |
| `labels` (obrigatória) | `string[]` | One label per point for the readout, such as "Oct 12" or "14:00". |

#### `PredictionOrder`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `side` (obrigatória) | `"yes" \| "no"` | The outcome that was bought. |
| `amount` (obrigatória) | `number` | Amount spent, in the market's currency. |
| `price` (obrigatória) | `number` | Price per share, from 0 to 1. |
| `shares` (obrigatória) | `number` | Shares bought: amount divided by price. Each share pays 1 if the outcome happens. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | No gráfico em foco, leem o ponto anterior ou o seguinte da série; o valor lido é anunciado. |
| `Home` ou `End` | No gráfico, saltam para o primeiro ou o último ponto do período. |
| `←` ou `→` ou `↑` ou `↓` | Nos seletores de período e de resultado (Yes e No), escolhem a opção vizinha, levam o foco junto e dão a volta nas pontas. |
| `Tab` | Cada seletor é uma única parada, na opção escolhida, e o gráfico é outra parada. |

## Acessibilidade

- O gráfico é um `role="group"` focável cujo `aria-label` traz a probabilidade atual e explica as setas; o ponto lido é anunciado por uma região `aria-live="polite"` e o SVG fica com `aria-hidden`.
- Período e resultado são `role="radiogroup"` com botões `role="radio"`, `aria-checked` e roving tabindex.
- O campo de valor tem rótulo, `aria-invalid` acima do saldo e `aria-describedby` para a estimativa; o botão de compra recebe `aria-busy` ao enviar e a linha de posição é `aria-live="polite"`.

## Movimento

- A linha se desenha em 1,1 s na primeira vez; trocar de período ou de resultado transforma o traçado numa mola sem ultrapassagem e o marcador do fim desliza até o novo ponto, pulsando em repouso.
- Probabilidade, preços, cotas, retorno e saldo contam até cada valor novo em 0,48 s, as pílulas de seleção deslizam e o rótulo do botão passa por “Placing order” e “Order placed”.
- Com “reduzir movimento” ligado, os números trocam na hora, a linha aparece sem desenho nem transformação, pílulas e marcador saltam e o pulso e o indicador de envio param.

## Comportamento responsivo

- O cartão vai até 27rem; o gráfico tem 136 px de altura fixa e largura medida por um `ResizeObserver`, e até 26rem de viewport o respiro interno diminui.

## Notas para IA

- Importe o componente nomeado `PredictionMarket` (o export padrão é o preview com dados de exemplo) e controle o resultado com `side` e `onSideChange` ou use `defaultSide`.
- Em `ranges`, todo período precisa do mesmo número de `points` (probabilidade de “Yes”, de 0 a 1) e de um item de `labels` por ponto; o último ponto do período ativo é o preço atual.
- `onPlaceOrder(order)` recebe `side`, `amount`, `price` e `shares`: devolva uma Promise para segurar “Placing order” e mostre o seu erro se rejeitar; `balance` é só o saldo inicial.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/prediction-market · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
