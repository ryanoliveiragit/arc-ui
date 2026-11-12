# Time picker

> Escolha um horário com um comportamento de teclado sensato, em formato 12h ou 24h.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/time-picker
- Descrição original (inglês): Choose a time with sensible keyboard behavior.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/time-picker.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/time-picker.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/time-picker.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/time-picker.json`. Caminho do registro, relativo ao endereço do site: `r/time-picker.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/time-picker/time-picker.tsx`
  - `components/ryan-ui/time-picker/time-picker.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/time-picker.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Agendar reunião, lembrete ou entrega com horários em passos fixos de 5, 15 ou 30 minutos.
- Formulários compactos em que um campo com lista é mais rápido que digitar horas e minutos.

## Quando não usar

- Use [`wheel-picker`](wheel-picker.md) em telas de toque, onde o gesto de roda é o esperado, ou quando alguns horários estão indisponíveis.
- Use [`date-picker`](date-picker.md) quando a escolha principal é o dia; para dia e hora, combine os dois.
- Use [`select`](select.md) quando os horários possíveis são poucos e fixos, como turnos.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { TimePicker } from "@/components/ryan-ui/time-picker/time-picker";
import { Caption, Room, Row, Stack } from "./_kit";

export default function TimePickerDemo() {
  const [time, setTime] = useState("14:30");
  // The first picker opens with the list centered on its time, so the preview shows the list, not just two buttons.
  // The caption sits under the second picker, clear of the open list.
  return (
    <Room below={200}>
      <Row gap={4} align="start" justify="center">
        <TimePicker label="Meeting starts" value={time} onChange={setTime} defaultOpen />
        <Stack gap={3}>
          <TimePicker label="Reminder (24h)" format="24h" minuteStep={5} defaultValue="08:45" />
          <Caption>Stored value: {time}</Caption>
        </Stack>
      </Row>
    </Room>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `TimePicker`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `value` | `string` | — | — |
| `defaultValue` | `string` | `"09:00"` | — |
| `onChange` | `(value: string) => void` | — | — |
| `description` | `string` | — | — |
| `placeholder` | `string` | `"Select a time"` | — |
| `minuteStep` | `1 \| 5 \| 10 \| 15 \| 30` | `15` | — |
| `format` | `"12h" \| "24h"` | `"12h"` | — |
| `disabled` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | Start with the list open, centered on the selected time (used by previews). Focus stays where it is. |
| `className` | `string` | — | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No botão, abrem a lista centrada no horário atual; com a lista aberta, escolhem o horário em destaque. |
| `↓` ou `↑` | Abrem a lista; aberta, movem o destaque, voltando ao começo depois do fim. |
| `Esc` | Fecha a lista sem mudar o horário. |

## Acessibilidade

- O botão tem `aria-haspopup="listbox"`, `aria-expanded` e `aria-controls`, e seu nome junta o rótulo ao horário escolhido (“Meeting starts 2:30 PM”).
- O foco fica no botão enquanto as setas movem o destaque, sem `aria-activedescendant`, então o leitor de tela só ouve o novo horário depois da escolha.
- A lista é uma `listbox` chamada “{label} options”, e a opção escolhida tem `aria-selected`.

## Movimento

- O horário exibido rola como num relógio: um horário mais tarde sobe por baixo e um mais cedo desce por cima.
- A lista surge com uma mola curta, um leve deslocamento e escala, já centrada no horário escolhido, e a seta gira.
- Com “reduzir movimento” ligado, a lista e o horário só esmaecem.

## Comportamento responsivo

- A lista tem a largura do campo e no máximo 250px de altura, rolando por dentro sem arrastar a página.

## Desempenho

- A lista renderiza todos os horários do dia como botões: 96 com `minuteStep` de 15, mas 1.440 com 1, então prefira passos de 5 ou mais.

## Notas para IA

- O valor é sempre `"HH:MM"` em 24 horas, mesmo com `format="12h"`, que só muda a exibição para AM e PM.
- Use `value` com `onChange` ou `defaultValue` (padrão `"09:00"`); um horário fora da grade de `minuteStep` é exibido, mas não aparece marcado na lista.
- Não há `name`, horário mínimo nem horários bloqueados; para bloquear horários, use `wheel-picker` com opções desabilitadas ou valide no pai.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/time-picker · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
