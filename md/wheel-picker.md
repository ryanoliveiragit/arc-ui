# Wheel picker

> Seletor de roda como o de hora do celular: arraste, solte com impulso e ele encaixa na opção; aceita várias colunas e teclado.

- Tipo: componente (categoria Entradas), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/wheel-picker
- Descrição original (inglês): A vertical wheel picker with snap and drag momentum, like a phone time picker, with several columns, disabled options and full keyboard support.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/wheel-picker.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/wheel-picker.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/wheel-picker.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/wheel-picker.json`. Caminho do registro, relativo ao endereço do site: `r/wheel-picker.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/wheel-picker/wheel-picker.tsx`
  - `components/ryan-ui/wheel-picker/wheel-picker.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/wheel-picker.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Escolher hora, duração ou data em telas de toque, com o gesto de roda que as pessoas conhecem do celular.
- Combinações de várias colunas, como hora, minuto e AM/PM, ou dia e turno.
- Listas curtas com opções indisponíveis que precisam continuar visíveis, como dias lotados.

## Quando não usar

- Use [`time-picker`](time-picker.md) em formulários de desktop, onde um campo com lista ocupa menos espaço.
- Use [`select`](select.md) ou [`combobox`](combobox.md) para listas longas de texto, em que ler ou digitar é mais rápido que girar.
- Use [`date-picker`](date-picker.md) para escolher datas num calendário.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { WheelPicker } from "@/components/ryan-ui/wheel-picker/wheel-picker";
import type { WheelColumn, WheelValue } from "@/components/ryan-ui/wheel-picker/wheel-picker";
import { Caption, Row, Stack } from "./_kit";

const two = (value: number) => String(value).padStart(2, "0");

const time: WheelColumn[] = [
  { id: "hour", label: "Hour", options: Array.from({ length: 12 }, (_, index) => ({ value: String(index + 1) })), suffix: ":", align: "end" },
  { id: "minute", label: "Minute", options: Array.from({ length: 12 }, (_, index) => ({ value: two(index * 5) })) },
  { id: "period", label: "AM or PM", options: [{ value: "AM" }, { value: "PM" }] },
];

const delivery: WheelColumn[] = [
  {
    id: "day",
    label: "Delivery day",
    options: [
      { value: "mon", label: "Mon, Nov 16" },
      { value: "tue", label: "Tue, Nov 17", disabled: true },
      { value: "wed", label: "Wed, Nov 18" },
      { value: "thu", label: "Thu, Nov 19" },
      { value: "fri", label: "Fri, Nov 20", disabled: true },
      { value: "sat", label: "Sat, Nov 21" },
      { value: "mon2", label: "Mon, Nov 23" },
    ],
  },
];

export default function WheelPickerDemo() {
  const [at, setAt] = useState<WheelValue>({ hour: "7", minute: "30", period: "AM" });
  const [slot, setSlot] = useState<WheelValue>({ day: "wed" });
  const day = delivery[0]!.options.find(option => option.value === slot.day)?.label;

  return (
    <Row gap={8} justify="center" align="flex-start">
      <Stack gap={3} align="center">
        <WheelPicker label="Alarm time" columns={time} value={at} onValueChange={setAt} />
        <Caption>Alarm set for {at.hour}:{at.minute} {at.period}</Caption>
      </Stack>
      <Stack gap={3} align="center">
        <WheelPicker label="Delivery" columns={delivery} value={slot} onValueChange={setSlot} visibleCount={5} />
        <Caption>Arrives {day}. Struck days are fully booked.</Caption>
      </Stack>
    </Row>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `WheelPicker`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `columns` (obrigatória) | `WheelColumn[]` | — | One wheel per entry, left to right. |
| `value` | `Record<string, string>` | — | Chosen values by column id (controlled). |
| `defaultValue` | `Record<string, string>` | — | Values chosen at first (uncontrolled). A column without one starts on its first enabled option. |
| `onValueChange` | `(value: WheelValue, columnId: string) => void` | — | Runs with every column's value when one settles on a new option; `columnId` says which one moved. |
| `label` | `string` | — | Accessible name of the whole picker, for example "Reminder time". |
| `itemHeight` | `number` | `38` | Height of one row in px. |
| `visibleCount` | `number` | `5` | How many rows show at once. Use an odd number so one row sits in the middle. |
| `disabled` | `boolean` | `false` | Turns the control off: it is dimmed and ignores pointer and keyboard input. |
| `className` | `string` | — | Extra class names for the root element. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `WheelValue`: One chosen value per column, keyed by column id. | `Record<string, string>` |

#### `WheelOption`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | The value reported when this option is chosen. |
| `label` | `string` | What the wheel shows. Falls back to the value. |
| `disabled` | `boolean` | Shown dimmed; the wheel never comes to rest on it. |

#### `WheelColumn`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Key of this column in the picker's value object, for example "hour". |
| `label` (obrigatória) | `string` | Accessible name of the column, for example "Hour". |
| `options` (obrigatória) | `WheelOption[]` | The options from top to bottom. |
| `suffix` | `ReactNode` | Fixed text shown beside the selection band after this column, such as ":" or "min". It does not scroll. |
| `width` | `number \| string` | Column width in px or any CSS length. By default it fits its widest option. |
| `align` | `"start" \| "center" \| "end"` | How labels line up inside the column. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↓` ou `↑` | Giram a coluna em foco uma opção, pulando as desabilitadas. |
| `Page Down` ou `Page Up` | Giram uma tela de opções (`visibleCount` menos uma). |
| `Home` ou `End` | Vão à primeira ou à última opção habilitada. |
| `←` ou `→` | Levam o foco à coluna anterior ou à seguinte. |
| `A–Z` ou `0–9` | Digitar o começo de um rótulo pula para ele, como numa lista nativa. |

## Acessibilidade

- Cada coluna é uma `listbox` vertical focável, com o `label` da coluna e `aria-activedescendant` apontando a opção escolhida; opções desabilitadas têm `aria-disabled`.
- O conjunto é um `role="group"`: passe `label` no `WheelPicker`, como “Alarm time”, e um `label` claro em cada coluna, como “Hour” e “Minute”.
- O `suffix` (como “:” ou “min”) é `aria-hidden`; se a unidade importa para entender a coluna, coloque-a no `label` da coluna.

## Movimento

- Arrastar gira a coluna com o dedo; solta com impulso, ela segue com inércia e para na opção habilitada mais próxima, com uma pequena folga elástica nas pontas.
- As linhas inclinam, encolhem e esmaecem conforme se afastam da faixa central, como num tambor, e teclas e roda do mouse giram com uma mola curta.
- Com “reduzir movimento” ligado, não há inércia nem inclinação: a coluna para onde foi solta e as teclas saltam direto.

## Comportamento responsivo

- No toque, a coluna bloqueia a rolagem da página (`touch-action: none`) para o arraste girar a roda; com o mouse, a roda gira uma linha por passo e, nas pontas, deixa a página rolar.

## Desempenho

- Cada opção recalcula inclinação e opacidade a cada quadro do giro, então colunas com centenas de opções, como uma lista de anos, pesam mais que as de horas e minutos.

## Notas para IA

- Descreva as colunas em `columns` (`id`, `label`, `options`, `suffix`); o valor é um objeto por coluna, como `{ hour: "7", minute: "30", period: "AM" }`, e `onValueChange` traz o `columnId` que mudou.
- Toda coluna sempre tem valor: sem um valor válido, ela assume a primeira opção habilitada, e opções `disabled` aparecem riscadas e nunca são a parada da roda.
- `itemHeight` (38px) e `visibleCount` (5, sempre ímpar) definem a altura; cada coluna se ajusta à opção mais larga, ou use `width`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/wheel-picker · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
