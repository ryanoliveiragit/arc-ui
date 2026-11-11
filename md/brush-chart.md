# Brush chart

> Série temporal densa com faixa de visão geral: arraste a janela para dar zoom e leia eventos no próprio gráfico.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/brush-chart
- Descrição original (inglês): A dense time series with an overview strip: drag a window to zoom, resize it by its handles, and read events in place.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/brush-chart.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/brush-chart.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/brush-chart.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/brush-chart.json`. Caminho do registro, relativo ao endereço do site: `r/brush-chart.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/brush-chart/brush-chart.tsx`
  - `components/ryan-ui/brush-chart/brush-chart.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/brush-chart.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Série temporal longa e densa em que a pessoa precisa do histórico inteiro e de olhar de perto qualquer trecho.
- Marcar eventos na série (lançamentos, mudanças de preço) com `annotations` e ler cada um no próprio gráfico.
- Sincronizar a janela com atalhos ou com outros painéis, por `range` e `onRangeChange`.

## Quando não usar

- Use [`line-chart`](line-chart.md) para comparar mais de uma série: aqui há uma só.
- Use [`bar-chart`](bar-chart.md) para poucos períodos comparados um a um e com a média.
- Use [`sparkline`](sparkline.md) para uma tendência compacta ao lado de um número.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useMemo, useState } from "react";
import BrushChart, { type BrushChartDatum, type BrushChartAnnotation } from "@/components/ryan-ui/brush-chart/brush-chart";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack, Surface } from "./_kit";

const DAY = 86400000;
const START = Date.UTC(2025, 9, 1);

function build(): BrushChartDatum[] {
  let s = 11;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  return Array.from({ length: 400 }, (_, i) => {
    const date = START + i * DAY;
    const dow = new Date(date).getUTCDay();
    const trend = 8200 + i * 18;
    const weekly = dow === 0 || dow === 6 ? -1400 : 600;
    const wave = Math.sin(i / 23) * 700;
    return { date, value: Math.round(trend + weekly + wave + (rand() - 0.5) * 900) };
  });
}

const annotations: BrushChartAnnotation[] = [
  { date: Date.UTC(2025, 11, 2), label: "v2 launch", description: "Redesigned onboarding shipped to everyone." },
  { date: Date.UTC(2026, 2, 10), label: "Pricing change", description: "Free tier limits lowered." },
  { date: Date.UTC(2026, 5, 18), label: "Mobile app", description: "iOS and Android apps released." },
];

export default function BrushChartDemo() {
  const data = useMemo(build, []);
  const [range, setRange] = useState<[number, number] | undefined>(undefined);
  const jump = (from: number, to: number) => setRange([from, to]);
  return (
    <Stack gap={4} width={820}>
      <Row>
        <Button size="sm" variant="secondary" onClick={() => jump(Date.UTC(2026, 2, 1), Date.UTC(2026, 3, 30))}>Spring 2026</Button>
        <Button size="sm" variant="secondary" onClick={() => jump(Date.UTC(2026, 4, 20), Date.UTC(2026, 6, 20))}>Around the app launch</Button>
        <Button size="sm" variant="ghost" onClick={() => jump(Number(data[0]?.date), Number(data[data.length - 1]?.date))}>Show all</Button>
      </Row>
      <Surface>
        <BrushChart
          data={data}
          label="Daily active users"
          unit="users"
          annotations={annotations}
          range={range}
          defaultRange={[Date.UTC(2026, 0, 1), Date.UTC(2026, 3, 15)]}
          onRangeChange={setRange}
        />
      </Surface>
      <Caption>Drag the window in the strip below to pan, pull its handles to zoom, or use the shortcuts to glide it.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `BrushChart`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `BrushChartDatum[]` | — | — |
| `label` (obrigatória) | `string` | — | What is measured, such as "Daily active users". Names the chart for assistive technology. |
| `unit` | `string` | `""` | Unit after each value, such as "users". |
| `formatValue` | `(value: number) => string` | `value => grouped.format(value)` | — |
| `formatTick` | `(value: number) => string` | `value => compact.format(value)` | Formats the value axis. Defaults to a compact number, such as 12K. |
| `formatDate` | `(date: Date) => string` | `date => fullDate.format(date)` | Formats a date in the tooltip and announcements. |
| `annotations` | `BrushChartAnnotation[]` | `[]` | Events drawn as markers on both charts. |
| `range` | `[number, number]` | — | Controlled window as [start, end] epoch milliseconds. A new value glides the window there. |
| `defaultRange` | `[number, number]` | — | Initial window when uncontrolled. Defaults to the whole series. |
| `onRangeChange` | `(range: [number, number]) => void` | — | Called while the window is dragged, resized, stepped, or reset. |
| `minSpan` | `number` | `7 * DAY` | Smallest window in milliseconds. Defaults to seven days. |
| `height` | `number` | `240` | Main plot height in pixels. |
| `overviewHeight` | `number` | `52` | Overview strip height in pixels. |
| `emptyLabel` | `string` | `"No data yet"` | — |
| `ref` | `Ref<HTMLElement>` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

#### `BrushChartDatum`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `date` (obrigatória) | `Date \| number` | A point in time, as a Date or epoch milliseconds. Points must be in ascending order. |
| `value` (obrigatória) | `number` | — |

#### `BrushChartAnnotation`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `date` (obrigatória) | `Date \| number` | — |
| `label` (obrigatória) | `string` | Short label printed beside the marker, such as "v2 launch". |
| `description` | `string` | Longer note for the tooltip and screen readers. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Passa por quatro paradas: o gráfico, a janela da faixa de visão geral, a alça inicial e a alça final. |
| `←` ou `→` ou `Home` ou `End` | No gráfico, levam a leitura ao ponto anterior, ao seguinte, ao primeiro e ao último ponto visível. |
| `←` ou `→` ou `↑` ou `↓` | Na janela, deslocam o intervalo em 10% da sua largura; numa alça, movem aquela borda um ponto; com `Shift`, o passo vira 50% ou dez pontos. |
| `Page Up` ou `Page Down` | No gráfico, saltam cerca de um oitavo dos pontos visíveis; na janela e nas alças, dão o passo grande. |
| `+` ou `-` | Com o foco na janela, aproximam (metade do intervalo) ou afastam (o dobro). |
| `Esc` ou `0` | Na janela ou nas alças, voltam à série inteira; no gráfico, `Esc` apaga a leitura. |

## Acessibilidade

- O gráfico é um grupo focável que anuncia a data e o valor do ponto lido numa região `aria-live`; uma tabela oculta traz os pontos e os eventos da janela atual.
- A janela e as duas alças são `role="slider"` com `aria-valuetext` em datas, e cada uma é uma parada de `Tab`.
- `label` é obrigatório; a instrução do grupo, os nomes das alças e as datas dos eixos estão em inglês no código (`formatDate` só muda a dica e os anúncios).

## Movimento

- A linha se desenha da esquerda para a direita na primeira vez que aparece; ao aproximar, o eixo de valores se ajusta com mola ao ponto mais alto da janela.
- A janela segue o dedo sem atraso no arrasto e desliza com mola quando `range` muda por fora ou quando volta à série inteira; a dica acompanha a mira com mola.
- Com “reduzir movimento”, a linha já aparece inteira, a janela e o eixo saltam para o destino e a dica acompanha sem mola.

## Comportamento responsivo

- Mede a própria largura: os rótulos de data passam de dias a semanas, meses, trimestres e anos conforme o espaço, e rótulos de evento que colidiriam ficam ocultos.
- Gráfico e faixa usam `touch-action: pan-y`, então arrastar na vertical continua rolando a página; as alturas vêm de `height` (240) e `overviewHeight` (52), em pixels.

## Desempenho

- Acima de dois pontos por pixel a linha guarda só o mínimo e o máximo de cada coluna; a tabela oculta, porém, tem uma linha por ponto da janela, então agregue séries muito longas antes de passar.
- Mantenha `data` e `annotations` com referência estável (`useMemo`): a suavização e a faixa de visão geral são recalculadas sempre que elas mudam.

## Notas para IA

- `data` é `{ date, value }` com `date` em `Date` ou milissegundos, em ordem crescente; com menos de dois pontos aparece `emptyLabel`, e o eixo de valores sempre parte do zero.
- `range` é um destino, não uma trava: a janela anda sozinha no arrasto e só desliza quando `range` muda, então guarde em estado o que vier de `onRangeChange`; sem `range`, use `defaultRange`.
- O componente pressupõe um ponto por dia: com o zoom afastado a linha vira uma média de sete pontos com faixa, e a dica compara com sete pontos antes chamando isso de “a week earlier”.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/brush-chart · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
