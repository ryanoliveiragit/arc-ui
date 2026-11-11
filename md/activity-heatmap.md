# Activity heatmap

> Um ano de atividade num relance, com um quadradinho para cada dia.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/activity-heatmap
- Descrição original (inglês): See a year of activity at a glance, one square per day.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/activity-heatmap.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/activity-heatmap.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/activity-heatmap.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/activity-heatmap.json`. Caminho do registro, relativo ao endereço do site: `r/activity-heatmap.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/activity-heatmap/activity-heatmap.tsx`
  - `components/ryan-ui/activity-heatmap/activity-heatmap.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/activity-heatmap.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um ano de atividade diária (commits, acessos, treinos) em que o ritmo, as sequências e as semanas paradas importam mais que o número exato de cada dia.
- Trocar de ano ou de intervalo sem redesenhar: com `days` novos a grade recolore numa varredura e o total rola dígito a dígito.
- Deixar a pessoa escolher um dia para filtrar o que vem abaixo, com `selectedDate` e `onSelectDate`.

## Quando não usar

- Use [`bar-chart`](bar-chart.md) quando a comparação exata entre os dias é o objetivo.
- Use [`returns-calendar`](returns-calendar.md) para valores diários que podem ser negativos, como ganhos e perdas; aqui contagens abaixo de zero viram zero.
- Use [`date-picker`](date-picker.md) quando a tarefa é escolher uma data, não ler atividade.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useMemo, useState } from "react";
import ActivityHeatmap, { type ActivityDay } from "@/components/ryan-ui/activity-heatmap/activity-heatmap";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function year(y: number, seed: number): ActivityDay[] {
  const rand = seeded(seed);
  const days: ActivityDay[] = [];
  const start = Date.UTC(y, 0, 1);
  const end = Date.UTC(y, 11, 31);
  for (let t = start, i = 0; t <= end; t += 86400000, i++) {
    const d = new Date(t);
    const dow = d.getUTCDay();
    const weekend = dow === 0 || dow === 6;
    const season = 0.6 + 0.4 * Math.sin((i / 365) * Math.PI * 3);
    const burst = rand() > 0.93 ? 2.2 : 1;
    const base = weekend ? 1.2 : 6;
    const count = rand() < (weekend ? 0.55 : 0.12) ? 0 : Math.round(base * season * burst * (0.3 + rand() * 1.4));
    days.push({ date: d.toISOString().slice(0, 10), count });
  }
  return days;
}

export default function ActivityHeatmapDemo() {
  const [period, setPeriod] = useState("2025");
  const [selected, setSelected] = useState<string | null>(null);
  const data = useMemo(() => ({ "2025": year(2025, 7), "2024": year(2024, 21) }), []);
  const days = data[period as "2025" | "2024"];
  const total = days.reduce((n, d) => n + d.count, 0).toLocaleString("en-US");

  return (
    <Stack gap={4} width={820}>
      <Surface>
        <ActivityHeatmap
          days={days}
          label={`Contributions in ${period}`}
          period={period}
          selectedDate={selected}
          onSelectDate={(d) => setSelected((cur) => (cur === d ? null : d))}
          actions={<SegmentedControl label="Year" value={period} onValueChange={setPeriod} options={[{ value: "2025", label: "2025" }, { value: "2024", label: "2024" }]} />}
        />
      </Surface>
      <Caption>{total} contributions in {period}. Hover a square for its day, click one to select it, or switch the year.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ActivityHeatmap`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `days` (obrigatória) | `ActivityDay[]` | — | One entry per day, oldest first. Days missing inside the range count as zero. |
| `label` (obrigatória) | `string` | — | Accessible name for the grid, such as "Contributions in 2025". |
| `period` (obrigatória) | `string` | — | Finishes the summary line: "1,284 contributions in {period}". |
| `unit` | `{ one: string; other: string }` | `CONTRIBUTIONS` | Nouns for the count. |
| `thresholds` | `[number, number, number]` | — | Upper bounds for levels one to three; anything above the last is level four. Defaults to quarters of the busiest day. |
| `weekStartsOn` | `0 \| 1` | `0` | — |
| `selectedDate` | `string \| null` | `null` | — |
| `onSelectDate` | `(date: string) => void` | — | — |
| `actions` | `ReactNode` | — | Controls beside the summary, such as a range switch. |
| `locale` | `string` | `"en-US"` | Formatting locale. Fixed by default so server and client render the same labels. |
| `className` | `string` | — | — |

### Tipos exportados

#### `ActivityDay`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `date` (obrigatória) | `string` | Calendar day as YYYY-MM-DD. |
| `count` (obrigatória) | `number` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Entra na grade pelo último dia que teve foco (ou o selecionado, ou o mais recente) e segue para a legenda; só um dia e um nível ficam na ordem de tabulação. |
| `↑` ou `↓` | Vai ao dia anterior ou ao seguinte. |
| `←` ou `→` | Na grade, recua ou avança uma semana; na legenda, passa ao nível anterior ou ao seguinte. |
| `Home` ou `End` | Vai ao primeiro ou ao último dia do intervalo; na legenda, ao primeiro ou ao último nível. |
| `Enter` ou `Espaço` | Na grade, seleciona o dia em foco e chama `onSelectDate`; na legenda, fixa ou solta o destaque do nível. |
| `Esc` | Fecha a dica do dia em foco; na legenda, desfaz a pré-visualização do nível. |

## Acessibilidade

- A grade tem `role="grid"` com o nome vindo de `label` (obrigatório), e cada dia é um `gridcell` cujo `aria-label` traz a contagem e a data por extenso.
- O total fica numa região `role="status"` oculta; os níveis da legenda são botões com `aria-pressed`, e um texto `aria-live` diz quantos dias há no nível destacado.
- Os textos fixos (“No …”, “in”, “Less”, “More”, “days with”) estão em inglês no código: `locale` só muda datas e números, e `unit` só os substantivos da contagem.

## Movimento

- Na primeira vez que entra na tela, os quadrados surgem numa onda diagonal de cerca de 0,4 s; um intervalo novo recolore a grade na mesma diagonal, para frente ou para trás conforme a data.
- Uma única dica desliza com mola de um dia para outro, e o anel de seleção desliza até o dia escolhido.
- Com “reduzir movimento”, a grade aparece de uma vez, a dica salta para o lugar e as trocas viram um esmaecer curto.

## Comportamento responsivo

- O lado dos quadrados vai de 9 a 15 px conforme a largura do contêiner; abaixo de uns 670 px a grade rola de lado, começa nas semanas mais recentes e mantém os dias da semana fixos à esquerda.
- Em contêineres de até 440 px a legenda encurta para só a contagem de dias; se o fundo não for `--surface`, defina `--heatmap-surface` para os rótulos fixos cobrirem a grade que rola.

## Desempenho

- São cerca de 370 células memorizadas, com eventos delegados à grade; passe `days`, `thresholds` e `onSelectDate` com referência estável (`useMemo`, `useCallback`) para não refazer todas a cada render.

## Notas para IA

- `days` é uma lista `{ date: "YYYY-MM-DD", count }` do dia mais antigo ao mais novo, lida em UTC; dias ausentes contam zero, e `label` e `period` são obrigatórios.
- A seleção é só controlada: guarde `selectedDate` no pai e atualize em `onSelectDate`; sem esse callback, clicar num dia não faz nada.
- Ponha o seletor de ano em `actions` (um `segmented-control`, por exemplo) e troque apenas `days`: mudar a `key` do componente remonta a grade e perde a varredura de recoloração.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/activity-heatmap · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
