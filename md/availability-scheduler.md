# Availability scheduler

> Grade semanal para marcar horários livres com clique e arraste, com atalhos prontos e um resumo por dia que se atualiza na hora.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/availability-scheduler
- Descrição original (inglês): Week grid of one-hour slots chosen by click, rectangle drag or keyboard, with one-click presets and a live summary of merged ranges per day.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/availability-scheduler.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/availability-scheduler.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/availability-scheduler.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/availability-scheduler.json`. Caminho do registro, relativo ao endereço do site: `r/availability-scheduler.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/availability-scheduler/availability-scheduler.tsx`
  - `components/ryan-ui/blocks/availability-scheduler/availability-scheduler.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/availability-scheduler.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Perguntar a alguém em que horários da semana está livre, para marcar reuniões, plantões ou atendimentos em blocos de uma hora.
- Configurar janelas que se repetem toda semana, como horário de funcionamento ou período em que notificações podem chegar.
- Quando o resultado precisa ser conferido de relance: o resumo ao lado junta os blocos vizinhos em faixas por dia e soma as horas.

## Quando não usar

- Use [`date-picker`](date-picker.md) ou [`date-range-picker`](date-range-picker.md) quando a escolha é de datas do calendário, e não de horários que se repetem toda semana.
- Use [`time-picker`](time-picker.md) quando basta um único horário.
- Evite quando a precisão precisa ser menor que uma hora: cada célula é um bloco de uma hora cheia, sem meia hora nem quinze minutos.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import AvailabilityScheduler from "@/components/ryan-ui/blocks/availability-scheduler/availability-scheduler";
import type { DemoStage } from "./_kit";

// A little taller than the default: the grid has twelve hour rows plus presets and a header.
export const stage: DemoStage = { height: 700 };

export default function AvailabilitySchedulerDemo() {
  return <AvailabilityScheduler />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `AvailabilityScheduler`

Week grid of one-hour slots: click or drag a rectangle to mark when you are free, apply a preset, and read the result as merged ranges per day.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` | `string[]` | — | Selected one-hour slots as `"day-hour"` ids: day from 0 (first column), hour on the 24 h clock. Pass it with `onValueChange` to control the grid. |
| `defaultValue` | `string[]` | — | Starting selection when uncontrolled. Defaults to weekdays 9 to 5 with a lunch break. |
| `onValueChange` | `(slots: string[]) => void` | — | Called with the sorted selection after a click, a drag, a key press or a preset. |
| `startHour` | `number` | `8` | First hour shown (24 h clock). |
| `endHour` | `number` | `20` | Hour at which the last slot ends (24 h clock). |
| `days` | `string[]` | `WEEK` | Column names, one per day. |
| `presets` | `AvailabilityPreset[]` | `defaultPresets` | One-click selections offered above the grid. |
| `title` | `string` | `"When are you free?"` | Heading above the grid. |
| `className` | `string` | — | Extra class for the section. |

### Tipos exportados

#### `AvailabilityPreset`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | Text on the preset's button. |
| `includes` (obrigatória) | `(day: number, hour: number) => boolean` | Whether the slot that starts at `hour` (24 h clock) on `day` (0 is the first column) belongs to the preset. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` ou `←` ou `→` | Movem o foco pela grade, uma célula por vez. |
| `Espaço` ou `Enter` | Marca ou desmarca o horário em foco. |
| `Shift + ↑` ou `Shift + ↓` ou `Shift + ←` ou `Shift + →` | Pintam: a célula de destino recebe o estado (marcada ou não) da célula de onde o foco saiu. |
| `Home` ou `End` | Levam o foco ao primeiro ou ao último dia, na mesma hora. |
| `Tab` | Passa pelos atalhos prontos, por “Clear”, pelos botões de dia (que marcam ou limpam o dia inteiro) e entra na grade pela célula atual. |

## Acessibilidade

- A grade usa `role="grid"` com `aria-multiselectable`; cada célula é um `gridcell` com `aria-selected` e um nome como “Monday, 9 AM to 10 AM”, e só a célula atual fica na ordem do Tab (roving tabindex).
- O total de horas fica numa região `aria-live="polite"`, os atalhos prontos expõem `aria-pressed` e cada cabeçalho de dia é um botão com nome próprio.
- Os textos internos (ajuda, “Clear”, “Available”, “Unavailable”, nomes das células e o relógio AM/PM) estão fixos em inglês no código; só `title`, `days` e os rótulos de `presets` vêm por props.

## Movimento

- Cada horário marcado cresce do centro da célula numa curva de mola sem ultrapassagem e some com um esmaecer simples; em mudanças em lote (atalho pronto, dia inteiro) as células se preenchem em onda a partir da origem.
- O total de horas troca rolando: o número antigo sobe e o novo entra por baixo, com uma mola sem ultrapassagem.
- Com “reduzir movimento” ligado, as transições das células e dos botões são desligadas e o total troca na hora.

## Comportamento responsivo

- Usa container query: abaixo de 46rem de largura do bloco o resumo desce para baixo da grade, e abaixo de 30rem os dias mostram só a inicial.
- O corpo da grade tem `touch-action: none`: no toque, arrastar sobre os horários seleciona em vez de rolar a página, então deixe área livre ao redor para a rolagem.

## Desempenho

- Cada horário é um elemento do DOM (`days` × horas visíveis, 84 no padrão), e durante o arrasto o estado só muda quando o ponteiro entra em outra célula, não a cada pixel.

## Notas para IA

- Controle com `value` e `onValueChange`: a seleção é uma lista de ids `"dia-hora"`, com o dia contado a partir de 0 e a hora no relógio de 24 h (`"0-9"` é o primeiro dia às 9h).
- Sem `value` nem `defaultValue`, a grade já nasce com as cinco primeiras colunas marcadas das 9h às 17h, menos o meio-dia; passe `defaultValue={[]}` para começar vazia.
- `startHour` e `endHour` definem as linhas (8 e 20 por padrão), `days` as colunas e `presets` os atalhos, cada um com `label` e uma função `includes(day, hour)`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/availability-scheduler · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
