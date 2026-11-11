# Volume profile

> Histograma horizontal do volume em cada faixa de preço, ao lado da linha de preço, com o ponto de controle em destaque.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/volume-profile
- Descrição original (inglês): Horizontal histogram of volume by price level beside a price line: bars grow outward from the point of control, which is highlighted along with the value area.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/volume-profile.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/volume-profile.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/volume-profile.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/volume-profile.json`. Caminho do registro, relativo ao endereço do site: `r/volume-profile.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/volume-profile/volume-profile.tsx`
  - `components/ryan-ui/volume-profile/volume-profile.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/volume-profile.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar em que preços a negociação se concentrou num pregão ou em poucas sessões, ao lado de como o preço andou no tempo.
- Destacar o ponto de controle, o nível com mais volume, e a área de valor, que por padrão reúne 70% do volume em volta dele.
- Ler cada faixa de preço com volume, fatia do total e posição em relação à área de valor, pelo ponteiro ou pelas setas.

## Quando não usar

- Use [`candlestick-chart`](candlestick-chart.md) quando o foco é abertura, máxima, mínima e fechamento de cada período.
- Use [`order-book`](order-book.md) para a profundidade das ordens de compra e venda em aberto, e não para o que já foi negociado.
- Use [`bar-chart`](bar-chart.md) para volume por período, como por dia ou por hora; aqui o volume é agrupado por preço.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import VolumeProfile, { type VolumePoint } from "@/components/ryan-ui/volume-profile/volume-profile";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface, type DemoStage } from "./_kit";

export const stage: DemoStage = { height: 580 };

const stamp = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" });
const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", timeZone: "UTC" });
const dayName = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** A small seeded generator, so the sample trades are the same on every load. */
function seeded(seed: number) {
  let state = seed;
  return () => { state = (state * 1664525 + 1013904223) % 4294967296; return state / 4294967296; };
}

/** One session from 9:30 in equal steps. The price is pulled back toward an anchor, and volume is heavier at the open and the close. */
function session(next: () => number, day: number, start: number, anchor: number, points: number, minutes: number, swing: number, hourMarks: boolean): VolumePoint[] {
  let price = start;
  return Array.from({ length: points }, (_, at) => {
    const time = new Date(Date.UTC(2026, 10, day, 9, 30 + at * minutes));
    price += (anchor - price) * .09 + (next() - .5) * swing;
    const edge = Math.abs(at / (points - 1) - .5) * 2;
    const firstOfDay = at === 0;
    return {
      key: time.toISOString(),
      label: stamp.format(time),
      axisLabel: hourMarks ? (time.getUTCMinutes() === 0 && time.getUTCHours() % 2 === 0 ? clock.format(time) : undefined) : firstOfDay ? dayName.format(time) : undefined,
      price: Math.round(price * 100) / 100,
      volume: Math.round((38000 + edge * edge * 64000) * (.6 + next() * .8) * (minutes / 5)),
    };
  });
}

const todayRandom = seeded(77);
const today = session(todayRandom, 10, 196.9, 198.7, 78, 5, 1.1, true);
const daysRandom = seeded(41);
const threeDays = [
  ...session(daysRandom, 6, 191.6, 193.4, 26, 15, 1.7, false),
  ...session(daysRandom, 9, 194.2, 196.3, 26, 15, 1.7, false),
  ...session(daysRandom, 10, 196.9, 198.7, 26, 15, 1.7, false),
];

export default function VolumeProfileDemo() {
  const [range, setRange] = useState("today");
  return (
    <Stack gap={4} width={600}>
      <SegmentedControl label="Range" value={range} onValueChange={setRange} options={[{ value: "today", label: "Today" }, { value: "days", label: "3 sessions" }]} />
      <Surface>
        <VolumeProfile data={range === "today" ? today : threeDays} label="Northwind Corp. (NWC)" formatPrice={(value) => `$${value.toFixed(2)}`} />
      </Surface>
      <Caption>Each bar is the volume traded at that price. The brightest bar is the point of control; hover a level or use the arrow keys to read it.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `VolumeProfile`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `VolumePoint[]` | — | Trades or intervals in time order, oldest first. |
| `label` (obrigatória) | `string` | — | What is traded, such as "Northwind Corp." Names the chart for assistive technology and heads the readout. |
| `levels` | `number` | `16` | Number of price levels the range is split into. |
| `valueArea` | `number` | `.7` | Share of the total volume that defines the value area around the point of control, from 0 to 1. |
| `height` | `number` | `260` | Plot height in pixels. |
| `formatPrice` | `(value: number) => string` | `value => money.format(value)` | Formats prices on the axis, in the header and in the tooltip. |
| `formatVolume` | `(value: number) => string` | `value => compact.format(value)` | Formats volumes in the header and in the tooltip. |
| `hideHeader` | `boolean` | `false` | Hides the headline with the point of control and the value area. |
| `activeLevel` | `number \| null` | — | Controlled index of the price level in focus, counted from the lowest price, or null for none. |
| `defaultActiveLevel` | `number \| null` | `null` | Price level in focus on first render when uncontrolled. |
| `onActiveChange` | `(level: number \| null) => void` | — | Called when hover, touch or the keyboard moves to another price level, or leaves the plot. |
| `className` | `string` | — | Extra class on the root figure. |

### Tipos exportados

#### `VolumePoint`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | Stable identity, such as an ISO timestamp. |
| `label` (obrigatória) | `string` | Full label for screen readers, such as "Nov 10, 10:35". |
| `axisLabel` | `string` | Short label under the price line, such as "10:00". Leave it out on most points to keep the axis quiet. |
| `price` (obrigatória) | `number` | Price traded in this interval. |
| `volume` (obrigatória) | `number` | Volume traded in this interval. It is added to the price level the price falls in. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `→` | Com o foco no gráfico, sobe para a faixa de preço seguinte. |
| `↓` ou `←` | Desce para a faixa anterior. |
| `Page Up` ou `Page Down` | Sobe ou desce quatro faixas. |
| `Home` ou `End` | Vai à faixa de preço mais baixa ou à mais alta. |
| `Esc` | Encerra a leitura e esconde a dica. |

## Acessibilidade

- O gráfico é um `role="slider"` vertical: ao receber foco pelo teclado começa no ponto de controle, e `aria-valuetext` lê a faixa, o volume, a fatia do total e se ela está na área de valor.
- A `<figure>` tem legenda oculta e uma tabela oculta com todas as faixas, da mais alta para a mais baixa, com volume e fatia; o SVG, o cabeçalho e a dica ficam ocultos para leitor de tela.
- As frases lidas e o cabeçalho (`point of control`, `Inside the value area`, `Value area`) são fixos em inglês; `formatPrice` e `formatVolume` mudam só os números.

## Movimento

- Ao entrar na tela, as barras crescem a partir do eixo, começando pelo ponto de controle e se espalhando para os níveis mais distantes, enquanto a linha de preço se desenha da esquerda para a direita.
- Depois disso, dados novos não repetem a entrada: barras, linha e marca do ponto de controle deslizam com mola, e uma série com outro número de pontos redesenha a linha desde o início.
- Com “reduzir movimento” ligado, tudo aparece no estado final, e a faixa realçada e a dica saltam de um nível ao outro.

## Comportamento responsivo

- A largura segue o contêiner: o histograma fica com 32% dela (entre 64 e 190 px), a linha de preço com o resto, e uma coluna fixa de 62 px à direita guarda os preços; a altura é `height` (260 px).
- No toque, tocar numa altura lê aquela faixa; arrastar na vertical rola a página e encerra a leitura.

## Desempenho

- A linha de preço é refeita a cada render, inclusive quando o ponteiro muda de faixa; com milhares de negócios, agregue em intervalos antes, como o demo faz com 5 e 15 minutos.

## Notas para IA

- Passe `data` em ordem de tempo com `{ key, label, price, volume }` e `axisLabel` só em alguns pontos; cada ponto soma seu volume à faixa em que o preço cai, e `levels` (16) define quantas faixas há.
- `valueArea` (0,7) é a fração do volume que forma a área de valor; `formatPrice` e `formatVolume` formatam eixo, cabeçalho e dica, e `hideHeader` esconde o título com o ponto de controle.
- `activeLevel` com `onActiveChange` controla a faixa lida, contada a partir do preço mais baixo (0), ou `null` para nenhuma; sem controle, `defaultActiveLevel` define a inicial.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/volume-profile · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
