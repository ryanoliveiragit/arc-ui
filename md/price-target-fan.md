# Price target fan

> Histórico de preço que se abre em leque até os alvos alto, mediano e baixo, cada um com rótulo e variação.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/price-target-fan
- Descrição original (inglês): A price history line that draws to the last close and fans out into dashed high, median and low target lines with labeled end points you can bring forward.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/price-target-fan.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/price-target-fan.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/price-target-fan.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/price-target-fan.json`. Caminho do registro, relativo ao endereço do site: `r/price-target-fan.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/price-target-fan/price-target-fan.tsx`
  - `components/ryan-ui/price-target-fan/price-target-fan.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/price-target-fan.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Página de um ativo que mostra no mesmo gráfico o histórico de fechamentos e os alvos de analistas (alto, mediano e baixo) para uma data futura.
- Quando o leitor compara cenários: passar o ponteiro ou focar um rótulo traz aquele alvo para a frente, e o clique o mantém em destaque.
- Quando a distância até o último fechamento importa: cada rótulo traz o preço-alvo e a variação percentual em relação a ele.

## Quando não usar

- Use [`line-chart`](line-chart.md) quando só há histórico, sem alvos, ou várias séries para comparar.
- Use [`candlestick-chart`](candlestick-chart.md) quando o leitor precisa de abertura, máxima, mínima e fechamento de cada período.
- Projeções com mais ou menos de três cenários não cabem: o componente recebe exatamente `high`, `median` e `low`.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useMemo, useState } from "react";
import PriceTargetFan, { type PricePoint, type PriceTargetKey, type PriceTargets } from "@/components/ryan-ui/price-target-fan/price-target-fan";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

/** Small seeded generator: the same seed always draws the same history, so the demo never changes between visits. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

/** Eighteen months of weekly closes ending November 10, 2026, walking from `from` to `to` with some weather on the way. */
function closes(seed: number, from: number, to: number, swing: number): PricePoint[] {
  const rand = seeded(seed);
  const weeks = 78;
  const last = Date.UTC(2026, 10, 10);
  let drift = 0;
  return Array.from({ length: weeks }, (_, index) => {
    const progress = index / (weeks - 1);
    drift = (drift + (rand() - 0.5) * swing) * 0.9;
    const wave = Math.sin(progress * Math.PI * 3 + seed) * swing * 0.9 * Math.sin(progress * Math.PI);
    const value = from + (to - from) * progress + (drift + wave) * (1 - progress ** 6);
    return { date: new Date(last - (weeks - 1 - index) * 7 * 86_400_000).toISOString().slice(0, 10), value: Math.round(value * 100) / 100 };
  });
}

const companies: Record<string, { name: string; analysts: number; history: PricePoint[]; targets: PriceTargets }> = {
  nwd: { name: "Northwind Robotics", analysts: 34, history: closes(5, 118, 197.2, 16), targets: { high: 262, median: 228, low: 168 } },
  hlx: { name: "Helix Biologics", analysts: 19, history: closes(17, 92, 64.4, 9), targets: { high: 96, median: 71, low: 48 } },
};

const notes: Record<PriceTargetKey, string> = {
  high: "The most optimistic desk assumes the new product line ships on time and margins keep widening.",
  median: "Half of the covering analysts sit above this price and half below.",
  low: "The most cautious desk expects slower demand and a lower multiple.",
};

export default function PriceTargetFanDemo() {
  const [ticker, setTicker] = useState("nwd");
  const [target, setTarget] = useState<PriceTargetKey | null>(null);
  const company = companies[ticker]!;
  const label = useMemo(() => `${company.name} weekly closes and 12-month analyst targets`, [company]);

  return (
    <Stack gap={4} width={680}>
      <SegmentedControl label="Company" value={ticker} onValueChange={setTicker} options={[{ value: "nwd", label: "Northwind" }, { value: "hlx", label: "Helix" }]} />
      <Surface>
        <PriceTargetFan label={label} history={company.history} targets={company.targets} targetDate="2027-11-10" activeTarget={target} onActiveTargetChange={setTarget} />
      </Surface>
      <Caption>
        {target ? notes[target] : `${company.name}, weekly closes with targets from ${company.analysts} analysts. Hover a target to bring it forward, click to keep it, or scrub the history.`}
      </Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `PriceTargetFan`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `history` (obrigatória) | `PricePoint[]` | — | Price history, one point per close. Any order: the chart sorts by date. |
| `targets` (obrigatória) | `PriceTargets` | — | The three targets at the end of the horizon. |
| `label` (obrigatória) | `string` | — | Accessible name of the chart, such as "Northwind price and 12-month analyst targets". |
| `targetDate` | `string` | — | Day the targets refer to, as YYYY-MM-DD. Defaults to one year after the last close. |
| `currency` | `string` | `"USD"` | Currency code used by the default price format. |
| `formatValue` | `(value: number) => string` | — | Formats a price. Defaults to the currency format of the locale. |
| `height` | `number` | `300` | Height of the chart in px, time axis included. |
| `activeTarget` | `PriceTargetKey \| null` | — | Scenario brought forward, or null for none. Leave undefined to let the chart keep its own. |
| `defaultActiveTarget` | `PriceTargetKey \| null` | `null` | Scenario brought forward at first when the chart keeps its own. |
| `onActiveTargetChange` | `(target: PriceTargetKey \| null) => void` | — | Called when a target label is clicked: with its key, or null when the active one is clicked again. |
| `locale` | `string` | `"en-US"` | Formatting locale. Fixed by default so server and client render the same labels. |
| `className` | `string` | — | Extra class for the root element. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `PriceTargetKey` | `"high" \| "median" \| "low"` |

#### `PricePoint`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `date` (obrigatória) | `string` | Day of the close as YYYY-MM-DD. |
| `value` (obrigatória) | `number` | Closing price. |

#### `PriceTargets`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `high` (obrigatória) | `number` | Most optimistic target. |
| `median` (obrigatória) | `number` | Median of the targets. |
| `low` (obrigatória) | `number` | Most cautious target. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `↓` | Com o foco no histórico, recua um fechamento e mostra data e preço na dica. |
| `→` ou `↑` | Avança um fechamento. |
| `Page Up` ou `Page Down` | Avança ou recua dez fechamentos. |
| `Home` ou `End` | Vai ao primeiro ou ao último fechamento. |
| `Enter` ou `Espaço` | Num rótulo de alvo, fixa aquele cenário em destaque; de novo, solta. |
| `Esc` | Fecha a dica do histórico. |

## Acessibilidade

- O SVG tem `role="img"` com o `label` e um resumo oculto (último fechamento e os três alvos); o histórico é um `role="slider"` cujo `aria-valuetext` lê data e preço.
- Cada alvo é um `<button>` com `aria-pressed`, nomeado com preço e variação; o alvo em destaque no cabeçalho fica numa região `aria-live="polite"`.
- Os textos fixos (`Last close`, `Today`, `High`, `Median`, `Low`) e os nomes para leitor de tela estão em inglês, sem prop de tradução; `locale` só muda números e datas.

## Movimento

- Ao entrar na tela, a linha do histórico se desenha até o último fechamento; em seguida o cone e as três linhas tracejadas se abrem a partir dele com mola e os rótulos surgem em sequência.
- Um anel pulsa continuamente no último fechamento; a mira e a dica deslizam com mola entre fechamentos, e novos `targets` fazem o leque deslizar até os novos valores.
- Com “reduzir movimento” ligado, tudo aparece no estado final, o pulso é desligado e a mira salta de um ponto ao outro.

## Comportamento responsivo

- A largura acompanha o contêiner e a altura é fixa em `height` (300 px por padrão); a coluna de rótulos à direita reserva pelo menos 72 px.
- No toque, arrastar na horizontal percorre o histórico e o gesto vertical continua rolando a página; abaixo de 400 px de contêiner os números do cabeçalho diminuem.

## Notas para IA

- Passe `history` (`{ date: "YYYY-MM-DD", value }`), `targets` (`{ high, median, low }`) e `label`; sem `targetDate`, o horizonte é de um ano após o último fechamento.
- Mantenha `history` com referência estável (constante ou `useMemo`): um array novo a cada render faz a linha se redesenhar toda vez.
- `activeTarget` com `onActiveTargetChange` controla o cenário fixado (`null` = nenhum); para valores em reais, passe `currency="BRL"` e `locale="pt-BR"`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/price-target-fan · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
