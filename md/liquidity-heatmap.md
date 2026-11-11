# Liquidity heatmap

> Mapa de calor da liquidez por preço e horário, com legenda em degraus e leitura da célula sob o cursor.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/liquidity-heatmap
- Descrição original (inglês): A price by time grid tinted by resting size, with columns that sweep in, a traded price line, a crosshair that glides to the cell being read, and a stepped legend.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/liquidity-heatmap.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/liquidity-heatmap.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/liquidity-heatmap.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/liquidity-heatmap.json`. Caminho do registro, relativo ao endereço do site: `r/liquidity-heatmap.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/liquidity-heatmap/liquidity-heatmap.tsx`
  - `components/ryan-ui/liquidity-heatmap/liquidity-heatmap.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/liquidity-heatmap.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Telas de negociação que mostram como a liquidez em repouso se distribuiu por preço ao longo do tempo.
- Encontrar paredes de ordens e ver onde elas ficam em relação ao preço negociado, desenhado como linha sobre a grade (`path`).

## Quando não usar

- Use [`order-book`](order-book.md) para ver as ofertas de compra e de venda de agora, com profundidade acumulada e spread.
- Use [`volume-profile`](volume-profile.md) para o volume negociado por nível de preço, num histograma ao lado da linha de preço.
- Use [`activity-heatmap`](activity-heatmap.md) para atividade por dia num calendário; aqui os eixos são sempre horário e preço.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useMemo, useState } from "react";
import LiquidityHeatmap from "@/components/ryan-ui/liquidity-heatmap/liquidity-heatmap";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

/** Small seeded generator: the same seed always draws the same book, so the demo never changes between visits. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

const COLS = 48, ROWS = 24;

/** Four hours of resting orders in five-minute buckets: a wandering price, a thin background and a few large walls that vanish once the price trades through them. */
function book(seed: number, mid: number, tick: number, depth: number) {
  const rand = seeded(seed);
  const prices = Array.from({ length: ROWS }, (_, row) => mid + (row - ROWS / 2) * tick);
  const times = Array.from({ length: COLS }, (_, col) => { const minutes = 9 * 60 + col * 5; return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`; });
  const rows: number[] = [];
  let level = ROWS / 2 - 3;
  for (let col = 0; col < COLS; col++) {
    const trend = Math.sin(col / 7.5 + seed) * .55 + .12;
    level = Math.min(ROWS - 4, Math.max(3, level + trend + (rand() - .5) * 1.5));
    rows.push(level);
  }
  const walls = Array.from({ length: 7 }, () => ({ row: 1 + Math.floor(rand() * (ROWS - 2)), from: Math.floor(rand() * 26), length: 12 + Math.floor(rand() * 26), size: depth * (.5 + rand() * .5) }));
  const values = Array.from({ length: COLS }, (_, col) => Array.from({ length: ROWS }, (_, row) => {
    const distance = Math.abs(row - rows[col]!);
    if (distance < .8) return 0;
    let size = depth * (.01 + rand() * .15) * Math.min(1, distance / 5);
    for (const wall of walls) {
      if (wall.row !== row || col < wall.from || col >= wall.from + wall.length) continue;
      const traded = rows.slice(wall.from, col + 1).some((at, index, list) => index > 0 && (at - row) * (list[index - 1]! - row) <= 0);
      if (!traded) size += wall.size * Math.min(1, (col - wall.from + 1) / 3) * (.85 + rand() * .15);
    }
    return Math.round(size * 10) / 10;
  }));
  return { times, prices, values, path: rows.map(row => Math.round((mid + (row - ROWS / 2) * tick) * 10) / 10) };
}

const markets = {
  btc: { name: "BTC-USD", unit: "BTC", ...book(11, 64_200, 25, 180) },
  eth: { name: "ETH-USD", unit: "ETH", ...book(29, 3_420, 2, 2400) },
};

export default function LiquidityHeatmapDemo() {
  const [market, setMarket] = useState<keyof typeof markets>("btc");
  const [cell, setCell] = useState<{ time: string; price: number; value: number } | null>(null);
  const data = markets[market];
  const largest = useMemo(() => {
    let best = { value: 0, price: 0, time: "" };
    data.values.forEach((column, col) => column.forEach((value, row) => { if (value > best.value) best = { value, price: data.prices[row]!, time: data.times[col]! }; }));
    return best;
  }, [data]);

  return (
    <Stack gap={4} width={720}>
      <SegmentedControl label="Market" value={market} onValueChange={value => setMarket(value as keyof typeof markets)}
        options={[{ value: "btc", label: "BTC-USD" }, { value: "eth", label: "ETH-USD" }]} />
      <Surface>
        <LiquidityHeatmap label={`${data.name} resting liquidity, 09:00 to 13:00`} times={data.times} prices={data.prices} values={data.values} path={data.path} unit={data.unit} onCellChange={setCell} />
      </Surface>
      <Caption>
        {cell
          ? `${cell.value.toLocaleString("en-US")} ${data.unit} waiting at ${cell.price.toLocaleString("en-US")} at ${cell.time}.`
          : `Largest wall: ${largest.value.toLocaleString("en-US")} ${data.unit} at ${largest.price.toLocaleString("en-US")}, ${largest.time}. Move over the grid or focus it and use the arrow keys.`}
      </Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `LiquidityHeatmap`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `times` (obrigatória) | `string[]` | — | Label of each time bucket, oldest first. One column per entry. |
| `prices` (obrigatória) | `number[]` | — | Price of each level, evenly spaced. Any order: the chart draws the highest price at the top. |
| `values` (obrigatória) | `number[][]` | — | Size resting in each cell, as `values[timeIndex][priceIndex]`. Missing cells count as zero. |
| `path` | `number[]` | — | Traded price at each time bucket, drawn as a line over the grid. |
| `label` (obrigatória) | `string` | — | Accessible name of the chart, such as "BTC-USD resting liquidity, last four hours". |
| `unit` | `string` | `""` | Unit written after a size, such as "BTC". |
| `formatPrice` | `(price: number) => string` | — | Formats a price for the axis and the readout. |
| `formatValue` | `(value: number) => string` | — | Formats a size for the readout and the legend. |
| `max` | `number` | — | Size at which the color saturates. Defaults to the largest size in the data. |
| `height` | `number` | `268` | Height of the plot in px, time axis included. |
| `onCellChange` | `(cell: { time: string; price: number; value: number } \| null) => void` | — | Called when the cell under the pointer or the keyboard changes; null when the chart goes back to the latest column. |
| `locale` | `string` | `"en-US"` | Formatting locale. Fixed by default so server and client render the same labels. |
| `className` | `string` | — | Extra class for the root element. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Movem a leitura uma coluna de tempo para trás ou para a frente. |
| `↑` ou `↓` | Sobem ou descem um nível de preço. |
| `Page Up` ou `Page Down` | Sobem ou descem quatro níveis de preço. |
| `Home` ou `End` | Vão à primeira e à última coluna, no mesmo preço. |
| `Esc` | Larga a célula e volta à leitura da coluna mais recente. |

## Acessibilidade

- O gráfico é um `role="application"` focável, descrito como “heatmap”, com uma dica oculta de uso; cada movimento pelo teclado anuncia horário, preço e tamanho numa região `role="status"`.
- O SVG fica em `aria-hidden` e não há tabela alternativa: os valores são lidos célula a célula pelo teclado, e o resumo acima da grade mostra horário, preço e tamanho da célula lida.
- `label` é obrigatório; os rótulos da interface (“Latest”, “Resting size”, “Traded price”) estão fixos em inglês, e `locale` muda apenas o formato dos números.

## Movimento

- Quando 30% do gráfico entra na tela, as colunas surgem da esquerda para a direita, subindo 8 px, e em seguida a linha do preço negociado se desenha sobre elas.
- Com dados novos, as células mudam de cor na mesma varredura; as faixas e o anel da mira deslizam numa mola até a célula lida, e o marcador da legenda acompanha o degrau de cor.
- Com “reduzir movimento”, a grade e a linha aparecem prontas e a mira salta de célula em célula.

## Comportamento responsivo

- O gráfico mede a própria largura e desenha em pixels reais; a altura é a prop `height` (268 px, eixo de tempo incluído), e a faixa de preços à direita se ajusta ao rótulo mais longo.
- Os rótulos dos eixos rareiam quando as células encolhem, e em contêineres de até 400 px o resumo e a legenda ficam mais compactos.

## Desempenho

- Cada célula é um `<rect>` no SVG (colunas × níveis; a demo usa 48 × 24 = 1.152): a grade é memorizada durante a leitura com o cursor, mas é refeita a cada mudança de dados ou de largura.

## Notas para IA

- `values` é indexado como `values[tempo][preço]`, alinhado a `times` e `prices`; os preços podem vir em qualquer ordem, mas precisam ser igualmente espaçados.
- Fixe `max` quando os dados se atualizam, senão a escala de cor se recalcula pelo maior valor de cada conjunto; `path` é opcional e traz o preço negociado de cada coluna.
- Passe arrays memorizados: o modelo é recalculado sempre que `times`, `prices` ou `values` mudam de identidade; `onCellChange` recebe a célula lida ou `null` quando a leitura volta ao repouso.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/liquidity-heatmap · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
