# Candlestick chart

> Velas de abertura, máxima, mínima e fechamento, com mira que acompanha o cursor e mostra os valores de cada período.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/candlestick-chart
- Descrição original (inglês): OHLC candles with wicks in the status colors that grow in from left to right, with a crosshair that snaps to each candle and a tooltip of its open, high, low and close.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/candlestick-chart.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/candlestick-chart.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/candlestick-chart.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/candlestick-chart.json`. Caminho do registro, relativo ao endereço do site: `r/candlestick-chart.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/candlestick-chart/candlestick-chart.tsx`
  - `components/ryan-ui/candlestick-chart/candlestick-chart.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/candlestick-chart.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Preços de abertura, máxima, mínima e fechamento ao longo de uma sequência de pregões ou períodos.
- Leitura exata de um período: a mira encaixa em cada vela e a dica mostra os quatro preços, a variação e o volume.
- Trocar de intervalo (1 mês, 3 meses): velas com a mesma `key` deslizam para o novo lugar.

## Quando não usar

- Use [`line-chart`](line-chart.md) quando basta o fechamento ou é preciso comparar ativos.
- Use [`brush-chart`](brush-chart.md) para históricos longos que pedem zoom: aqui todas as velas de `data` ficam na tela.
- Use [`sparkline`](sparkline.md) para a tendência compacta ao lado de um preço.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import CandlestickChart, { type Candle } from "@/components/ryan-ui/candlestick-chart/candlestick-chart";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface, type DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

const long = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const short = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** A small seeded generator, so the sample prices are the same on every load. */
function seeded(seed: number) {
  let state = seed;
  return () => { state = (state * 1664525 + 1013904223) % 4294967296; return state / 4294967296; };
}

/** Sixty-six trading sessions ending Tue, Nov 10, 2026, walked from a fixed seed. */
function sessions(total: number): Candle[] {
  const next = seeded(2026), days: Date[] = [];
  for (let date = new Date(Date.UTC(2026, 10, 10)); days.length < total; date = new Date(date.getTime() - 86400000)) {
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) days.unshift(date);
  }
  let price = 162.4;
  return days.map((date, at) => {
    const open = price + (next() - .5) * 1.2;
    const drift = Math.sin(at / 9) * .9 + .18;
    const close = open + drift + (next() - .5) * 5.4;
    const high = Math.max(open, close) + next() * 2.2 + .15;
    const low = Math.min(open, close) - next() * 2.2 - .15;
    price = close;
    const round = (value: number) => Math.round(value * 100) / 100;
    return { key: date.toISOString().slice(0, 10), label: long.format(date), axisLabel: date.getUTCDay() === 1 ? short.format(date) : undefined, open: round(open), high: round(high), low: round(low), close: round(close), volume: Math.round((1.8 + next() * 2.6 + Math.abs(close - open) * .35) * 1e6) };
  });
}

const quarter = sessions(66);
const month = quarter.slice(-22);

export default function CandlestickChartDemo() {
  const [range, setRange] = useState("1m");
  return (
    <Stack gap={4} width={600}>
      <SegmentedControl label="Range" value={range} onValueChange={setRange} options={[{ value: "1m", label: "1 month" }, { value: "3m", label: "3 months" }]} />
      <Surface>
        <CandlestickChart data={range === "1m" ? month : quarter} label="Northwind Corp. (NWC)" period={range === "1m" ? "past month" : "past 3 months"} formatValue={(value) => `$${value.toFixed(2)}`} />
      </Surface>
      <Caption>Move across the plot for the crosshair and each session's open, high, low and close. The arrow keys step one candle at a time.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CandlestickChart`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `Candle[]` | — | Candles in time order, oldest first. |
| `label` (obrigatória) | `string` | — | What is priced, such as "Northwind Corp." Names the chart for assistive technology and heads the readout. |
| `period` | `string` | — | The range on show, such as "Last 30 sessions". It rests beside the change. |
| `height` | `number` | `240` | Plot height in pixels. |
| `formatValue` | `(value: number) => string` | `value => money.format(value)` | Formats prices on the axis, in the header and in the tooltip. |
| `formatVolume` | `(value: number) => string` | `value => compact.format(value)` | Formats the optional volume in the tooltip. |
| `hideHeader` | `boolean` | `false` | Hides the headline with the last price and the change over the range. |
| `activeIndex` | `number \| null` | — | Controlled index of the candle under the crosshair, or null for none. |
| `defaultActiveIndex` | `number \| null` | `null` | Candle under the crosshair on first render when uncontrolled. |
| `onActiveChange` | `(index: number \| null) => void` | — | Called when the crosshair moves to another candle or leaves the plot. |
| `className` | `string` | — | Extra class on the root figure. |

### Tipos exportados

#### `Candle`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | Stable identity, such as an ISO date. A candle whose key survives a data change slides to its new place instead of redrawing. |
| `label` (obrigatória) | `string` | Full label for the tooltip and screen readers, such as "Tue, Nov 10". |
| `axisLabel` | `string` | Short label under the candle, such as "Nov 10". Leave it out on most candles to keep the axis quiet. |
| `open` (obrigatória) | `number` | Price at the start of the period. |
| `high` (obrigatória) | `number` | Highest price of the period. |
| `low` (obrigatória) | `number` | Lowest price of the period. |
| `close` (obrigatória) | `number` | Price at the end of the period. |
| `volume` | `number` | Optional traded volume, shown in the tooltip. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Leva o foco à área do gráfico e ativa a vela mais recente. |
| `←` ou `↓` | Vai à vela anterior. |
| `→` ou `↑` | Vai à vela seguinte. |
| `Page Up` ou `Page Down` | Avança ou recua cinco velas. |
| `Home` ou `End` | Vai à primeira ou à última vela. |
| `Esc` | Tira a mira e fecha a dica. |

## Acessibilidade

- A área de leitura é um `role="slider"` cujo `aria-valuetext` traz o rótulo do período e os quatro preços; uma tabela oculta lista todas as velas.
- Alta e baixa são distinguidas só pela cor (`--success` e `--danger`); o sinal da variação aparece na dica, não no desenho.
- `label` é obrigatório; “Open”, “High”, “Low”, “Close” e “Volume” estão em inglês no código.

## Movimento

- Na primeira aparição as velas crescem de um traço na altura do corpo, da esquerda para a direita; a linha do último fechamento aparece em seguida.
- A mira vertical encaixa na vela e desliza com mola entre elas, com a dica junto; a linha horizontal segue o ponteiro ou, pelo teclado, repousa no fechamento.
- Com “reduzir movimento”, velas, grade e mira aparecem e mudam sem transição.

## Comportamento responsivo

- A largura é a do contêiner: o corpo de cada vela ocupa 62% da sua fatia, entre 1,5 e 14 px, e os rótulos do eixo guardam ao menos 58 px entre si.
- A dica passa para a esquerda da vela quando não cabe à direita, e a camada de leitura usa `touch-action: pan-y` para a página continuar rolando na vertical.

## Desempenho

- Cada vela é um `path` animado e o corpo nunca fica abaixo de 1,5 px: com mais velas do que a largura comporta elas se sobrepõem, então agregue em períodos maiores.

## Notas para IA

- Cada vela é `{ key, label, axisLabel?, open, high, low, close, volume? }`, da mais antiga à mais nova; ponha `axisLabel` só em algumas (toda segunda-feira, por exemplo).
- A mira pode ser controlada com `activeIndex` e `onActiveChange`, útil para sincronizar com outro gráfico; sem isso, use `defaultActiveIndex` ou deixe livre.
- `formatValue` formata eixo, título e dica (o padrão tem duas casas e nenhum símbolo de moeda); a variação do título é o último fechamento menos a primeira abertura de `data`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/candlestick-chart · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
