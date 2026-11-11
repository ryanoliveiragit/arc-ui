# Calendar

> Navegue pelas datas em uma visão mensal clara e compacta.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/calendar
- Descrição original (inglês): Browse dates in a clear, compact month view.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/calendar.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/calendar.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/calendar.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/calendar.json`. Caminho do registro, relativo ao endereço do site: `r/calendar.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/calendar/calendar.tsx`
  - `components/ryan-ui/lib/use-today.ts`
  - `components/ryan-ui/calendar/calendar.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/calendar.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Escolha de um único dia com o mês sempre visível na página: agendamento, entrega, painel lateral de agenda.
- Quando parte dos dias não pode ser escolhida: `minDate`, `maxDate` e a função `disabledDates` bloqueiam dias, e o teclado passa por cima deles.
- Como peça de um seletor próprio: `month` e `onMonthChange` controlam o mês visível, como faz o `date-picker`.

## Quando não usar

- Use [`date-picker`](date-picker.md) quando o calendário deve abrir a partir de um campo de formulário e fechar depois da escolha.
- Use [`date-range-picker`](date-range-picker.md) para escolher início e fim: este calendário guarda um dia só.
- Use [`activity-heatmap`](activity-heatmap.md) para exibir valores por dia ao longo do ano; este calendário serve para escolher uma data, não para visualizar dados.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Calendar, addDays, startOfDay } from "@/components/ryan-ui/calendar/calendar";
import { Caption, Stack } from "./_kit";

export default function CalendarDemo() {
  const today = startOfDay(new Date());
  const [value, setValue] = useState<Date>(addDays(today, 3));
  return (
    <Stack gap={4} align="center">
      <Calendar
        value={value}
        onChange={setValue}
        showToday
        disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
      />
      <Caption>Selected: {value.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}. Weekends are unavailable.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Calendar`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` | `Date` | — | — |
| `onChange` | `(date: Date) => void` | — | — |
| `month` | `Date` | — | — |
| `onMonthChange` | `(month: Date) => void` | — | — |
| `minDate` | `Date` | — | — |
| `maxDate` | `Date` | — | — |
| `disabledDates` | `(date: Date) => boolean` | — | — |
| `locale` | `string` | `"en-US"` | — |
| `className` | `string` | — | — |
| `showToday` | `boolean` | `false` | Adds a Today button that slides back to the current month and selects today when it is available. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `CalendarDateMatcher` | `(date: Date) => boolean` |

### Outras exportações

- `startOfDay` (função)
- `sameDay` (função)
- `addDays` (função)
- `addMonths` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Move o foco um dia para trás ou para a frente, pulando dias bloqueados. |
| `↑` ou `↓` | Move o foco uma semana para trás ou para a frente. |
| `Home` ou `End` | Vai para o domingo ou para o sábado da semana em foco. |
| `Page Up` ou `Page Down` | Vai para o mesmo dia do mês anterior ou do seguinte, e o mês visível acompanha. |
| `Shift + Page Up` ou `Shift + Page Down` | Volta ou avança um ano. |
| `Enter` ou `Espaço` | Seleciona o dia em foco. |

## Acessibilidade

- Cada mês é um `role="grid"` e cada dia um botão com a data por extenso em `aria-label`, `aria-selected` e, no dia de hoje, `aria-current="date"`.
- Só um dia fica na ordem de tabulação (o último focado, o selecionado, hoje ou o primeiro livre), e a troca de mês é anunciada por uma região `aria-live`.
- `locale` traduz o mês, os dias da semana e a data lida em cada dia, mas `Today`, `Previous month` e `Next month` são textos fixos em inglês.

## Movimento

- Os meses ficam lado a lado numa faixa que desliza com uma mola sem ultrapassagem; cliques rápidos redirecionam a mesma mola em vez de enfileirar animações.
- O disco da seleção desliza em linha reta de um dia ao outro, e cada número troca de cor no momento em que o disco passa por ele.
- Com “reduzir movimento” ligado, mês, título e disco trocam no lugar, sem deslocamento.

## Comportamento responsivo

- Ocupa `min(100%, 328px)` e toda grade tem seis semanas, então a altura não muda de um mês para outro.
- O cabeçalho é um contêiner próprio: abaixo de 260 px de largura o título ocupa uma linha inteira e os controles descem para a linha seguinte.

## Desempenho

- Só ficam montados o mês de destino e os que ainda estão passando pela faixa, com 42 botões cada; o mês que sai fica `inert`.

## Notas para IA

- A seleção é sempre controlada: guarde a data em estado e passe `value` e `onChange`, senão nenhum dia fica marcado; já o mês visível pode ficar por conta do componente ou vir de `month`.
- A semana começa sempre no domingo e `locale` tem padrão `en-US`: passe `locale="pt-BR"` para ter os nomes em português.
- Sem `value` nem `month`, a grade só é preenchida depois da hidratação, porque o “hoje” vem do relógio do visitante (`useToday`).

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/calendar · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
