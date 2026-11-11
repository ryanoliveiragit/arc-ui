# Date picker

> Escolha uma data sem perder o contexto da página.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/date-picker
- Descrição original (inglês): Choose a date without losing context.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/date-picker.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/date-picker.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/date-picker.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/date-picker.json`. Caminho do registro, relativo ao endereço do site: `r/date-picker.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Calendar](calendar.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/date-picker/date-picker.tsx`
  - `components/ryan-ui/date-picker/date-picker.module.css`
  - `components/ryan-ui/calendar/calendar.tsx`
  - `components/ryan-ui/lib/use-today.ts`
  - `components/ryan-ui/calendar/calendar.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/date-picker.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Uma data única dentro de um formulário, com rótulo, texto de ajuda e o calendário abrindo sob o campo.
- Datas com restrição: `minDate`, `maxDate` e `disabledDates` bloqueiam dias, como os fins de semana numa entrega.
- Quando a data pode ficar vazia: o rodapé do calendário tem um botão de limpar, que chama `onChange(undefined)`.

## Quando não usar

- Use [`date-range-picker`](date-range-picker.md) para escolher o início e o fim de um período.
- Use [`calendar`](calendar.md) quando o mês deve ficar sempre visível na página, sem campo nem popover.
- Para datas distantes que a pessoa sabe de cor, como a de nascimento: não há digitação, e o ano só muda pelo teclado ou mês a mês.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { DatePicker } from "@/components/ryan-ui/date-picker/date-picker";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

export default function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Stack gap={3} width={320}>
      <DatePicker label="Delivery date" description="Pick a weekday." value={date} onChange={setDate} showToday minDate={new Date()} disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6} />
      <Caption>{date ? `Arriving ${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.` : "No date chosen yet."}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `DatePicker`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `value` | `Date` | — | — |
| `onChange` | `(date: Date \| undefined) => void` | — | — |
| `description` | `string` | — | — |
| `placeholder` | `string` | `"Select a date"` | — |
| `minDate` | `Date` | — | — |
| `maxDate` | `Date` | — | — |
| `disabledDates` | `CalendarDateMatcher` | — | — |
| `locale` | `string` | `"en-US"` | — |
| `format` | `Intl.DateTimeFormatOptions` | `{ month: "short", day: "numeric", year: "nume…` | — |
| `showToday` | `boolean` | — | Adds a Today button to the calendar header. |
| `...props` | `ButtonHTMLAttributes<HTMLButtonElement>` | — | Também aceita as props deste tipo, menos `value` e `onChange`. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` ou `↓` | No campo, abrem o calendário e levam o foco ao dia selecionado, a hoje ou ao primeiro dia livre do mês. |
| `←` ou `→` ou `↑` ou `↓` | No calendário, movem o foco um dia ou uma semana, pulando dias bloqueados. |
| `Home` ou `End` | Vão para o domingo ou para o sábado da semana em foco. |
| `Page Up` ou `Page Down` | Trocam de mês; com `Shift`, de ano. |
| `Enter` ou `Espaço` | Num dia, escolhem a data e fecham o calendário. |
| `Esc` | Fecha o calendário sem mudar a data e devolve o foco ao campo. |

## Acessibilidade

- O campo é um `<button>` com `aria-haspopup="dialog"` e `aria-expanded`, ligado ao `label` visível e à `description`; o valor formatado também vai num texto só para leitor de tela.
- Ao abrir, o foco vai para um dia do calendário; ao escolher um dia ou fechar com `Esc`, volta ao campo, e sair com `Tab` fecha o popover.
- O popover é um `role="dialog"` sem prisão de foco, e seus textos (`Clear`, `Choose a day`, `Selected …`) são fixos em inglês, mesmo com `locale`.

## Movimento

- O calendário cresce a partir do ícone do campo com uma mola curta e só fecha 300 ms depois da escolha, para o destaque chegar ao dia.
- No campo, só as partes da data que mudaram rolam: uma data posterior sobe por baixo, uma anterior desce por cima.
- Com “reduzir movimento” ligado, tudo vira esmaecimento e o calendário fecha na hora depois da escolha.

## Comportamento responsivo

- O popover tem `min(320px, 100vw - 32px)`, abre sempre abaixo do campo, alinhado à esquerda, e em telas de até 360 px passa a ter a largura do campo.
- Não há portal nem inversão para cima: deixe espaço livre abaixo do campo e evite ancestrais com `overflow: hidden`.

## Notas para IA

- É sempre controlado: guarde `Date | undefined` em estado e passe `value` e `onChange`; não existe `defaultValue`.
- Passe `locale="pt-BR"` (o padrão é `en-US`) e, para outro formato no campo, `format` com opções de `Intl.DateTimeFormat`.
- Depende de `calendar`; as props extras e `disabled` vão para o botão do campo, e `showToday` acrescenta o botão de hoje ao cabeçalho.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/date-picker · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
