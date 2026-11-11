# Status bar

> Faixa de disponibilidade com uma barra por dia, colorida pelo estado, dica por dia e o percentual geral.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/status-bar
- Descrição original (inglês): An uptime strip with one bar per day colored by status, bars that lift around the pointer, a gliding tooltip and an overall percentage that counts up.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/status-bar.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/status-bar.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/status-bar.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/status-bar.json`. Caminho do registro, relativo ao endereço do site: `r/status-bar.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/status-bar/status-bar.tsx`
  - `components/ryan-ui/status-bar/status-bar.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/status-bar.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Página de status: a disponibilidade de um serviço nos últimos dias, uma barra por dia, com o percentual geral e o estado atual no cabeçalho.
- Quando cada dia pode trazer uma nota de incidente: a dica mostra data, estado, disponibilidade e o texto de `note`.
- Como seletor de dia para abrir o detalhe do incidente em outro ponto da tela, com `onSelectDate`.

## Quando não usar

- Use [`activity-heatmap`](activity-heatmap.md) para volume de atividade por dia ao longo de um ano, sem estados de serviço.
- Use [`line-chart`](line-chart.md) ou [`sparkline`](sparkline.md) para uma métrica contínua, como latência, em vez de um estado por dia.
- Estados fora dos cinco previstos (`operational`, `degraded`, `outage`, `maintenance`, `unknown`) não têm como ser representados.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import StatusBar, { type StatusDay } from "@/components/ryan-ui/status-bar/status-bar";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

type Incident = Omit<StatusDay, "date">;
const LAST_DAY = Date.UTC(2026, 10, 10);

/** Ninety days ending on a fixed date; every day is operational unless an incident is listed for it. */
function history(incidents: Record<number, Incident>): StatusDay[] {
  return Array.from({ length: 90 }, (_, index) => ({
    date: new Date(LAST_DAY - (89 - index) * 86_400_000).toISOString().slice(0, 10),
    ...(incidents[index] ?? { status: "operational" as const }),
  }));
}

const services: Record<string, { name: string; days: StatusDay[] }> = {
  api: {
    name: "API gateway",
    days: history({
      12: { status: "degraded", uptime: 99.1, note: "Elevated latency in eu-west for 13 minutes." },
      13: { status: "degraded", uptime: 99.6, note: "Latency recovering after the eu-west rollback." },
      41: { status: "outage", uptime: 94.2, note: "Primary database failover, 83 minutes of errors." },
      58: { status: "maintenance", uptime: 100, note: "Scheduled certificate rotation, no downtime." },
      77: { status: "degraded", uptime: 99.3, note: "Slow token refresh for a share of sessions." },
    }),
  },
  dashboard: {
    name: "Dashboard",
    days: history({
      0: { status: "unknown" }, 1: { status: "unknown" }, 2: { status: "unknown" },
      27: { status: "maintenance", uptime: 100, note: "Planned upgrade of the reporting cluster." },
      63: { status: "degraded", uptime: 98.8, note: "Charts loaded slowly for 17 minutes." },
    }),
  },
  webhooks: {
    name: "Webhooks",
    days: history({
      19: { status: "outage", uptime: 91.5, note: "Delivery queue stalled for two hours." },
      20: { status: "degraded", uptime: 98.9, note: "Backlog draining, deliveries delayed." },
      52: { status: "degraded", uptime: 99.5, note: "Retries delayed by a few minutes." },
      70: { status: "maintenance", uptime: 100, note: "Queue storage migration." },
      88: { status: "degraded", uptime: 99.2, note: "Delayed deliveries to some endpoints." },
      89: { status: "degraded", uptime: 99.7, note: "Still investigating delayed deliveries." },
    }),
  },
};

const dayLabel = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

export default function StatusBarDemo() {
  const [service, setService] = useState("api");
  const [selected, setSelected] = useState<string | null>(null);
  const { name, days } = services[service]!;
  const day = days.find(entry => entry.date === selected);

  return (
    <Stack gap={4} width={640}>
      <SegmentedControl label="Service" value={service} onValueChange={value => { setService(value); setSelected(null); }}
        options={[{ value: "api", label: "API" }, { value: "dashboard", label: "Dashboard" }, { value: "webhooks", label: "Webhooks" }]} />
      <Surface>
        <StatusBar label={name} days={days} selectedDate={selected} onSelectDate={setSelected} />
      </Surface>
      <Caption>
        {day
          ? `${dayLabel.format(new Date(`${day.date}T00:00:00Z`))}: ${day.note ?? (day.status === "unknown" ? "No data recorded for this day." : "No incidents reported.")}`
          : "Hover or use the arrow keys along the strip, click a day to pin it, or pick a status in the legend."}
      </Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `StatusBar`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `days` (obrigatória) | `StatusDay[]` | — | One entry per day, oldest first. |
| `label` (obrigatória) | `string` | — | Name of the service. It also names the strip for assistive technology. |
| `uptime` | `number` | — | Overall uptime in percent. Defaults to the average of the days that have data. |
| `precision` | `number` | `2` | Decimal places of the overall percentage. |
| `caption` | `string` | — | Text under the percentage. Defaults to "uptime, last {n} days". |
| `selectedDate` | `string \| null` | — | Selected day as YYYY-MM-DD, or null for none. Leave undefined to let the strip keep its own selection. |
| `defaultSelectedDate` | `string \| null` | `null` | Day selected at first when the strip keeps its own selection. |
| `onSelectDate` | `(date: string \| null) => void` | — | Called with the day that was clicked, or null when the selected day is clicked again. |
| `locale` | `string` | `"en-US"` | Formatting locale. Fixed by default so server and client render the same labels. |
| `className` | `string` | — | Extra class for the root element. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `DayStatus` | `"operational" \| "degraded" \| "outage" \| "maintenance" \| "unknown"` |

#### `StatusDay`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `date` (obrigatória) | `string` | Calendar day as YYYY-MM-DD. |
| `status` (obrigatória) | `"operational" \| "degraded" \| "outage" \| "maintenance" \| "unknown"` | Worst state the service reached that day. |
| `uptime` | `number` | Share of the day the service answered, from 0 to 100. Defaults by status when omitted; days without data are left out of the average. |
| `note` | `string` | Short note for the tooltip, such as the incident title. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Leva o foco ao dia anterior ou seguinte e mostra a dica desse dia. |
| `↑` ou `Page Up` | Recua sete dias. |
| `↓` ou `Page Down` | Avança sete dias. |
| `Home` ou `End` | Vai ao primeiro ou ao último dia. |
| `Enter` ou `Espaço` | Num dia, seleciona ou desfaz a seleção; na legenda, fixa ou solta o realce daquele estado. |
| `Esc` | Fecha a dica. |

## Acessibilidade

- A faixa é um `role="group"` nomeado com o serviço e o número de dias; cada dia é um `<button>` com `aria-pressed` cujo nome traz data por extenso, estado, disponibilidade e nota.
- O foco usa tabindex itinerante (um só dia na ordem de `Tab`, a princípio o mais recente); a legenda é um grupo de botões de alternância com a contagem de dias de cada estado.
- Os nomes de estado e as frases do cabeçalho (`All systems operational`, `Degraded performance`) são fixos em inglês; só `caption` e os formatos de `locale` mudam.

## Movimento

- Quando metade da faixa entra na tela, as barras sobem em onda da esquerda para a direita (cerca de meio segundo no total) e o percentual conta até o valor.
- A barra sob o ponteiro se alonga e as duas vizinhas de cada lado a acompanham cada vez menos; a dica única desliza com mola entre os dias e um anel pulsa sem parar no ponto do estado atual.
- Com “reduzir movimento” ligado, as barras apenas esmaecem, sem escala, o pulso é desligado e o percentual aparece direto.

## Comportamento responsivo

- As barras dividem a largura do contêiner por igual, com vão de 1 a 3 px: muitos dias num contêiner estreito dão barras muito finas, então encurte o período no celular.
- Abaixo de 380 px de contêiner o percentual diminui; a dica desliza de lado para não sair do componente e, no toque, fica visível por cerca de dois segundos.

## Desempenho

- Cada dia é um `<button>`, e o realce em volta do ponteiro é calculado em CSS a partir de uma variável, sem JavaScript por barra; o custo cresce com o número de dias.

## Notas para IA

- Passe `days` do mais antigo para o mais recente (`{ date, status, uptime?, note? }`) e `label` com o nome do serviço; o estado do cabeçalho é o do último dia.
- Sem `uptime` em cada dia, a média usa valores presumidos por estado (99,4 para `degraded`, 96 para `outage`); informe o valor real por dia ou o total na prop `uptime`.
- Apesar do nome, não é a barra de status de um aplicativo: é a faixa de disponibilidade de um serviço; a seleção é controlada com `selectedDate` e `onSelectDate`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/status-bar · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
