# Order book

> Livro de ofertas com compras e vendas lado a lado, barras de profundidade, spread e linhas que piscam a cada mudança.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/order-book
- Descrição original (inglês): Bids and asks side by side with cumulative depth bars, a spread row, rows that flash when their size changes and slide when the price moves, plus a seeded feed hook.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/order-book.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/order-book.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/order-book.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/order-book.json`. Caminho do registro, relativo ao endereço do site: `r/order-book.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/order-book/order-book.tsx`
  - `components/ryan-ui/order-book/order-book.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/order-book.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Tela de negociação que mostra as ofertas de compra e de venda do momento, com profundidade acumulada, spread e preço médio entre as melhores ofertas.
- Deixar a pessoa escolher o preço de uma ordem limitada clicando num nível (`onSelectLevel`).
- Demonstrações e telas de exemplo de produtos de trading, com o feed simulado `useOrderBookFeed`.

## Quando não usar

- Use [`liquidity-heatmap`](liquidity-heatmap.md) para ver como a liquidez evoluiu ao longo do tempo, e não só o retrato de agora.
- Use [`candlestick-chart`](candlestick-chart.md) para o histórico de preços em velas.
- Use [`sortable-data-table`](sortable-data-table.md) para tabelas genéricas de registros com ordenação; o livro tem colunas e ordem fixas.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Pause, Play } from "lucide-react";
import OrderBook, { useOrderBookFeed, type OrderLevel, type OrderSide } from "@/components/ryan-ui/order-book/order-book";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack, Surface } from "./_kit";

const price = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function OrderBookDemo() {
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState<(OrderLevel & { side: OrderSide }) | null>(null);
  const feed = useOrderBookFeed({ mid: 64_210, tick: 0.5, levels: 9, size: 0.42, seed: 23, paused });

  return (
    <Stack gap={4} width={560}>
      <Row justify="space-between">
        <Caption>BTC-USD, simulated ticks. {feed.running ? "Rows flash as sizes change." : "The feed is paused."}</Caption>
        <Button variant="secondary" size="sm" onClick={() => setPaused(value => !value)}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {paused ? "Resume feed" : "Pause feed"}
        </Button>
      </Row>
      <Surface padding={4}>
        <OrderBook label="BTC-USD order book" bids={feed.bids} asks={feed.asks} depth={9} baseSymbol="BTC" quoteSymbol="USD"
          selectedPrice={level?.price ?? null} onSelectLevel={setLevel} />
      </Surface>
      <Caption>
        {level
          ? `Limit price set to ${price.format(level.price)} USD, taken from the ${level.side} side. Click the row again to clear it.`
          : "Hover a row to see the cost of trading through to it, or click one to use its price. Arrow keys move between rows and sides."}
      </Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `OrderBook`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `bids` (obrigatória) | `OrderLevel[]` | — | Buy orders. Any order: the highest price is drawn first. |
| `asks` (obrigatória) | `OrderLevel[]` | — | Sell orders. Any order: the lowest price is drawn first. |
| `label` (obrigatória) | `string` | — | Accessible name of the book, such as "BTC-USD order book". |
| `depth` | `number` | `10` | Rows shown per side. |
| `baseSymbol` | `string` | `""` | Code of the asset sizes are counted in, such as "BTC". |
| `quoteSymbol` | `string` | `""` | Code of the asset prices are quoted in, such as "USD". |
| `pricePrecision` | `number` | `2` | Decimal places of a price. |
| `sizePrecision` | `number` | `3` | Decimal places of a size. |
| `selectedPrice` | `number \| null` | — | Selected price, or null for none. Leave undefined to let the book keep its own selection. |
| `defaultSelectedPrice` | `number \| null` | `null` | Price selected at first when the book keeps its own selection. |
| `onSelectLevel` | `(level: (OrderLevel & { side: OrderSide }) \| null) => void` | — | Called with the level that was clicked, or with null when the selected level is clicked again. |
| `locale` | `string` | `"en-US"` | Formatting locale. Fixed by default so server and client render the same numbers. |
| `className` | `string` | — | Extra class for the root element. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `OrderSide` | `"bid" \| "ask"` |

#### `OrderLevel`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `price` (obrigatória) | `number` | Price of the level. |
| `size` (obrigatória) | `number` | Size resting at that price, in the base asset. |

#### `OrderBookFeedOptions`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `mid` (obrigatória) | `number` | Price the book starts around. |
| `tick` (obrigatória) | `number` | Price step between two levels. |
| `levels` | `number` | Levels kept on each side. |
| `size` | `number` | Typical size of a level near the best price. |
| `interval` | `number` | Milliseconds between two ticks. |
| `seed` | `number` | Seed of the generator. The same seed always replays the same session. |
| `paused` | `boolean` | Stops the ticks while true. |

#### `OrderBookFeed`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `bids` (obrigatória) | `OrderLevel[]` | Buy levels, best first. |
| `asks` (obrigatória) | `OrderLevel[]` | Sell levels, best first. |
| `running` (obrigatória) | `boolean` | False while paused, while the tab is hidden, or when the person asked for reduced motion. |

### Outras exportações

- `useOrderBookFeed` (hook)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Movem o foco para o nível acima ou abaixo, no mesmo lado. |
| `←` ou `→` | Passam para o lado das compras ou o das vendas, na mesma linha. |
| `Home` ou `End` | Vão ao melhor preço e ao último nível do lado atual. |
| `Enter` ou `Espaço` | Selecionam o preço da linha; na linha já selecionada, desfazem a seleção. |
| `Tab` | O livro inteiro é uma única parada de `Tab`; as setas fazem o resto. |

## Acessibilidade

- A raiz é um `role="group"` nomeado por `label`, com duas listas rotuladas (compras e vendas, melhor preço primeiro); cada linha é um botão com `aria-pressed` e um `aria-label` com lado, preço, tamanho e total.
- O foco numa linha faz o mesmo que o cursor: destaca os níveis até ela e mostra no rodapé quanto custa negociar até ali; as mudanças do feed não são anunciadas, pois não há região viva.
- `label` é obrigatório; cabeçalhos e frases (“Bid”, “Ask”, “Spread”, “at an average of”) estão fixos em inglês, e `locale` só muda o formato dos números.

## Movimento

- Quando o tamanho de um nível muda, a linha pisca por 0,6 s: na cor do lado se cresceu, num tom neutro se diminuiu.
- Quando o preço anda, as linhas deslizam para a nova posição numa mola, as novas entram esmaecendo e as barras de profundidade se esticam a partir do meio do livro.
- Com “reduzir movimento”, não há pisca nem deslize, e o `useOrderBookFeed` deixa de emitir atualizações.

## Comportamento responsivo

- A raiz é um contêiner: com 520 px ou mais cada lado ganha a coluna de total acumulado; com até 360 px o respiro das linhas diminui e, com até 300 px, a fonte também.
- Os dois lados ficam sempre lado a lado; abaixo de 520 px a coluna de preço usa a largura do próprio texto, então quem encolhe é a de tamanho.

## Desempenho

- As linhas são memorizadas e só `depth` níveis por lado são renderizados; o feed simulado usa um intervalo (850 ms por padrão) que para com a aba oculta.
- Num feed real de alta frequência, agrupe as atualizações antes de trocar `bids` e `asks`: cada troca recalcula os totais e dispara piscas e deslizes.

## Notas para IA

- Passe `bids` e `asks` como `{ price, size }` em qualquer ordem: o componente ordena, descarta tamanhos zerados, corta em `depth` e calcula totais, spread e o preço médio (mid).
- `selectedPrice` controla a seleção (`null` para nenhuma; `undefined` deixa o livro cuidar dela), e `onSelectLevel` recebe `{ side, price, size }` ou `null` ao clicar de novo na linha.
- `useOrderBookFeed` é uma simulação com semente para demos, não uma conexão de mercado: com dados reais, passe os seus arrays e mantenha os preços arredondados de forma estável, pois são a chave de cada linha.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/order-book · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
