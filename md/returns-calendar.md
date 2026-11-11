# Returns calendar

> Calendário de retornos diários, mês a mês, com cada dia colorido pela força do ganho ou da perda e o total do mês.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/returns-calendar
- Descrição original (inglês): Small month calendars of daily returns tinted by gain or loss, with month totals, months and cells that wave in, and a tooltip that glides between days.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/returns-calendar.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/returns-calendar.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/returns-calendar.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/returns-calendar.json`. Caminho do registro, relativo ao endereço do site: `r/returns-calendar.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/returns-calendar/returns-calendar.tsx`
  - `components/ryan-ui/returns-calendar/returns-calendar.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/returns-calendar.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar o retorno diário de uma carteira, fundo ou estratégia ao longo de vários meses, com o total de cada mês ao lado do nome.
- Quando o padrão importa mais que a curva: sequências de dias bons ou ruins, o melhor e o pior dia, quantos dias fecharam em alta.
- Como seletor de um pregão para detalhar em outro ponto da tela, com `onSelectDate`.

## Quando não usar

- Use [`activity-heatmap`](activity-heatmap.md) para contagens diárias sem sinal, como contribuições ou acessos ao longo de um ano.
- Use [`calendar`](calendar.md) ou [`date-picker`](date-picker.md) quando a pessoa precisa escolher uma data qualquer; aqui só os dias com dado são clicáveis.
- Use [`line-chart`](line-chart.md) quando o que importa é a evolução acumulada, e não cada dia isolado.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useMemo, useState } from "react";
import ReturnsCalendar, { type DailyReturn } from "@/components/ryan-ui/returns-calendar/returns-calendar";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

/** Small seeded generator: the same seed always draws the same year, so the demo never changes between visits. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

const HOLIDAYS = new Set(["2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19", "2026-07-03", "2026-09-07"]);
/** Average daily drift of each month in percent: a soft spring, a rally into summer, a wobble in autumn. */
const DRIFT = [0.09, 0.02, -0.16, 0.06, 0.2, 0.08, 0.12, -0.05, -0.12, 0.14, 0.05];

/** Trading days from January 2 to November 10, 2026, weekends and market holidays left out. */
function year(): DailyReturn[] {
  const rand = seeded(41);
  const days: DailyReturn[] = [];
  for (let time = Date.UTC(2026, 0, 1); time <= Date.UTC(2026, 10, 10); time += 86_400_000) {
    const date = new Date(time);
    const iso = date.toISOString().slice(0, 10);
    if (date.getUTCDay() === 0 || date.getUTCDay() === 6 || HOLIDAYS.has(iso)) continue;
    const noise = (rand() + rand() + rand() - 1.5) * 1.5;
    const shock = rand() > 0.95 ? (rand() - 0.45) * 4 : 0;
    days.push({ date: iso, value: Math.round((DRIFT[date.getUTCMonth()]! + noise + shock) * 100) / 100 });
  }
  return days;
}

const percent = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero" });
const dayLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

export default function ReturnsCalendarDemo() {
  const [half, setHalf] = useState("h1");
  const [selected, setSelected] = useState<string | null>(null);
  const all = useMemo(year, []);
  const returns = useMemo(() => all.filter(day => (day.date < "2026-07-01") === (half === "h1")), [all, half]);
  const picked = returns.find(day => day.date === selected);

  return (
    <Stack gap={4} width={600}>
      <SegmentedControl label="Period" value={half} onValueChange={value => { setHalf(value); setSelected(null); }}
        options={[{ value: "h1", label: "First half" }, { value: "h2", label: "Second half to date" }]} />
      <Surface>
        <ReturnsCalendar label={`Daily returns of the Core Growth portfolio, ${half === "h1" ? "January to June" : "July to November"} 2026`} returns={returns} selectedDate={selected} onSelectDate={setSelected} />
      </Surface>
      <Caption>
        {picked
          ? `${dayLabel.format(new Date(`${picked.date}T00:00:00Z`))}: the portfolio closed ${percent.format(picked.value)}%.`
          : "Core Growth portfolio, daily close to close. Hover a day, walk the calendar with the arrow keys, or click a day to pin it."}
      </Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ReturnsCalendar`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `returns` (obrigatória) | `DailyReturn[]` | — | One entry per trading day, in any order. Days without an entry are drawn as closed. |
| `label` (obrigatória) | `string` | — | Accessible name of the calendar, such as "Daily returns, first half of 2026". |
| `period` | `string` | — | Text beside the overall total. Defaults to the range of months the data covers. |
| `weekends` | `boolean` | `false` | Shows Saturday and Sunday columns. Off by default, for markets that close on weekends. |
| `scale` | `number` | — | Return in percent at which the color saturates. Defaults to a high percentile of the data. |
| `compound` | `boolean` | `true` | Compounds daily returns into the totals. Set false to add them up instead. |
| `selectedDate` | `string \| null` | — | Selected day as YYYY-MM-DD, or null for none. Leave undefined to let the calendar keep its own selection. |
| `defaultSelectedDate` | `string \| null` | `null` | Day selected at first when the calendar keeps its own selection. |
| `onSelectDate` | `(date: string \| null) => void` | — | Called with the day that was clicked, or null when the selected day is clicked again. |
| `locale` | `string` | `"en-US"` | Formatting locale. Fixed by default so server and client render the same labels. |
| `className` | `string` | — | Extra class for the root element. |

### Tipos exportados

#### `DailyReturn`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `date` (obrigatória) | `string` | Trading day as YYYY-MM-DD. |
| `value` (obrigatória) | `number` | Return of the day in percent: 1.2 means the day closed 1.2% up. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Leva o foco ao dia com dado anterior ou seguinte, atravessando os meses, e mostra a dica desse dia. |
| `↑` ou `↓` | Recua ou avança cinco dias com dado (sete com `weekends`), o que equivale a uma semana quando não há feriados no caminho. |
| `Home` ou `End` | Vai ao primeiro ou ao último dia do período. |
| `Enter` ou `Espaço` | Seleciona o dia em foco; de novo, desfaz a seleção. |
| `Esc` | Fecha a dica. |
| `Tab` | Entra no calendário por um único dia (o último focado ou o mais recente) e sai dele. |

## Acessibilidade

- O conjunto é um `role="group"` nomeado por `label`; cada mês é uma `<section>` com mês e total no nome, e cada dia com dado é um `<button>` com `aria-pressed`.
- O foco usa tabindex itinerante: só um dia fica na ordem de `Tab` e as setas levam aos outros; dias sem dado são decorativos e ficam fora da navegação.
- O nome de cada dia traz a data por extenso e o retorno (`up`, `down` ou `flat` mais o percentual); esses termos e os rótulos visíveis, como `Best day` e `Closed`, são fixos em inglês.

## Movimento

- Ao entrar na tela, os meses sobem um após o outro e as células de cada um aparecem em onda diagonal, crescendo a partir da metade do tamanho; o total geral conta de zero até o valor.
- A dica é uma só: aparece já no lugar e depois desliza com mola de um dia para o outro; com mouse, o dia sob o cursor cresce um pouco.
- Com “reduzir movimento” ligado, meses e células apenas esmaecem, o total aparece direto e a dica não desliza.

## Comportamento responsivo

- Os meses se distribuem em colunas de pelo menos 128 px conforme a largura do contêiner; abaixo de 420 px ficam sempre em duas colunas.
- No toque, a dica continua visível por cerca de dois segundos depois que o dedo sai, para dar tempo de ler.

## Desempenho

- Cada dia com dado é um `<button>` (um ano de pregões dá cerca de 250), e a entrada em onda usa só transições CSS com atraso, sem JavaScript por célula.

## Notas para IA

- Passe `returns` como `{ date: "YYYY-MM-DD", value }`, com `value` em pontos percentuais (`1.2` = +1,2%); dias sem entrada aparecem como fechados e meses sem entrada não são desenhados.
- Os totais são compostos por padrão: `compound={false}` soma os retornos, `weekends` mostra sábado e domingo e `scale` fixa o percentual em que a cor satura.
- Seleção controlada com `selectedDate` e `onSelectDate` (`null` = nenhuma) ou interna com `defaultSelectedDate`; guarde `returns` em `useMemo`, pois o calendário inteiro é recalculado quando o array muda.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/returns-calendar · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
