# Date range picker

> Seletor de período que cresce a partir do gatilho, com dois meses, atalhos e destaque elástico.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/date-range-picker
- Descrição original (inglês): A range picker that grows from its trigger into two months with presets and a stretching range highlight.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/date-range-picker.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/date-range-picker.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/date-range-picker.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/date-range-picker.json`. Caminho do registro, relativo ao endereço do site: `r/date-range-picker.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/date-range-picker/date-range-picker.tsx`
  - `components/ryan-ui/lib/use-today.ts`
  - `components/ryan-ui/date-range-picker/date-range-picker.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/date-range-picker.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Período de um relatório ou filtro de painel, em que atalhos como “Last 7 days” resolvem a maioria dos casos.
- Reservas e buscas em que início e fim são escolhidos juntos e só valem depois de confirmar em `Apply`.
- Barras de ferramentas: fechado, ocupa só a largura do próprio texto, e o painel cresce por cima da página sem empurrar o conteúdo.

## Quando não usar

- Use [`date-picker`](date-picker.md) quando basta uma data.
- Use [`calendar`](calendar.md) quando o mês precisa ficar sempre aberto na página.
- Quando é preciso bloquear dias avulsos, como feriados ou fins de semana: só existem `minDate` e `maxDate`, sem função para desabilitar datas.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import DateRangePicker, { type DateRange } from "@/components/ryan-ui/date-range-picker/date-range-picker";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function DateRangePickerDemo() {
  const [range, setRange] = useState<DateRange | null>(null);
  return (
    <Stack gap={3} width={360}>
      <DateRangePicker label="Reporting period" value={range} onChange={setRange} placeholder="Select dates" />
      <Caption>{range ? `Showing ${fmt(range.start)} to ${fmt(range.end)}.` : "Choose a preset or click two days."}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `DateRangePicker`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` | `DateRange \| null` | — | Controlled value. Pass `null` for no selection. |
| `defaultValue` | `DateRange \| null` | `null` | Uncontrolled starting value. |
| `onChange` | `(range: DateRange) => void` | — | Called with the applied range. |
| `label` | `string` | `"Date range"` | Accessible name of the trigger and the dialog. Defaults to "Date range". |
| `placeholder` | `string` | `"Select dates"` | — |
| `presets` | `DateRangePreset[]` | `defaultDateRangePresets` | — |
| `minDate` | `Date` | — | — |
| `maxDate` | `Date` | — | — |
| `weekStartsOn` | `0 \| 1` | `0` | 0 is Sunday, 1 is Monday. Defaults to 0. |
| `locale` | `string` | `"en-US"` | — |
| `months` | `"auto" \| 1 \| 2` | `"auto"` | Force one or two months. `auto` picks two when the boundary is wide enough. |
| `boundary` | `() => HTMLElement \| null` | — | The element the panel should stay inside. Defaults to the viewport. |
| `className` | `string` | — | — |

### Tipos exportados

#### `DateRange`

An inclusive range of whole days.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `start` (obrigatória) | `Date` | — |
| `end` (obrigatória) | `Date` | — |

#### `DateRangePreset`

A shortcut in the preset rail. `range` receives the viewer's local today.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `range` (obrigatória) | `(today: Date) => DateRange` | — |

### Outras exportações

- `defaultDateRangePresets` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No gatilho, abrem o painel; num dia, marcam o início e, na segunda vez, o fim do período. |
| `←` ou `→` ou `↑` ou `↓` | Nos dias, movem o foco um dia ou uma semana; depois de marcado o início, o período se estica até o dia em foco. |
| `Home` ou `End` | Vão ao primeiro ou ao último dia da semana, conforme `weekStartsOn`. |
| `Page Up` ou `Page Down` | Mudam um mês; com `Shift`, um ano. |
| `↑` ou `↓` ou `←` ou `→` | Na lista de atalhos, passam de um atalho ao outro: `↑` e `↓` no painel largo, `←` e `→` no compacto. |
| `Esc` | Fecha sem aplicar e devolve o foco ao gatilho. |

## Acessibilidade

- O gatilho tem `aria-label` com `label` e o período atual; o painel é um `role="dialog"`, cada mês um `role="grid"`, e os dias dentro do período recebem `aria-selected`.
- Uma região `aria-live` anuncia o início marcado e depois o período com a contagem de dias; ao abrir, o foco vai ao início do período ou a hoje, e `Esc`, `Cancel` e `Apply` o devolvem ao gatilho.
- `label` não aparece na tela, e `Cancel`, `Apply`, `Presets` e os anúncios são fixos em inglês; só os rótulos dos atalhos mudam, pela prop `presets`.

## Movimento

- A superfície do gatilho cresce com uma mola até o tamanho do painel e encolhe de volta; ao aplicar, o texto do período voa do rodapé para o gatilho.
- O destaque se estica semana a semana enquanto o cursor ou o foco se movem, as pontas deslizam de um dia ao outro e os meses entram pelo lado da navegação.
- Com “reduzir movimento” ligado, tamanhos e posições saltam para o fim e o conteúdo só esmaece.

## Comportamento responsivo

- Com menos de 712 px livres no limite (a janela ou o elemento de `boundary`), mostra um mês só e os atalhos viram uma linha com rolagem horizontal; `months` força 1 ou 2.
- O painel se desloca na horizontal para caber no limite com 8 px de margem e, em telas baixas, rola a página até o botão `Apply` aparecer.

## Desempenho

- O painel só é montado enquanto está aberto; nesse tempo há um `ResizeObserver` nele e um ouvinte de `resize` na janela, além do observador permanente do gatilho.

## Notas para IA

- `onChange` só dispara em `Apply`, nunca a cada clique; use `value` (com `null` para vazio) ou `defaultValue`, e lembre que o período inclui os dois dias das pontas.
- Passe `boundary={() => elemento}` quando o seletor vive num painel ou coluna: o painel fica dentro dele e a escolha entre um e dois meses usa essa largura.
- Troque `presets` por rótulos em português (`{ label, range: hoje => ({ start, end }) }`) e passe `locale="pt-BR"` e, se a semana começa na segunda, `weekStartsOn={1}`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/date-range-picker · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
