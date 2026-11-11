# Number field

> Informe um número limitado com controles de incremento claros e dígitos em odômetro.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/number-field
- Descrição original (inglês): Enter a bounded number with clear increment controls.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/number-field.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/number-field.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/number-field.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/number-field.json`. Caminho do registro, relativo ao endereço do site: `r/number-field.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/number-field/number-field.tsx`
  - `components/ryan-ui/number-field/number-field.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/number-field.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Números limitados que a pessoa pode tanto digitar quanto ajustar passo a passo: assentos, quantidade, preço por unidade.
- Valores com unidade que acompanha o número, como “1 assento” e “2 assentos”: `prefix` e `suffix` aceitam texto ou uma função do valor.
- Painéis de propriedades em que arrastar é mais rápido que clicar: com `scrub`, arrastar o rótulo para os lados muda um passo a cada 6 px.

## Quando não usar

- Use [`adaptive-stepper`](adaptive-stepper.md) para contadores pequenos que não precisam de digitação e devem manter a largura fixa.
- Use [`money-input`](money-input.md) para dinheiro, com moeda, centavos e saída em unidades menores.
- Use [`scrub-input`](scrub-input.md) em editores compactos que pedem unidades, contas no próprio campo e passo fino com `Alt`.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { NumberField } from "@/components/ryan-ui/number-field/number-field";
import { Caption, Row, Stack } from "./_kit";

export default function NumberFieldDemo() {
  const [seats, setSeats] = useState(5);
  const [price, setPrice] = useState(19.5);
  return (
    <Stack gap={6} width={420}>
      <NumberField label="Team seats" description="Hold a button to speed up, or drag the label." value={seats} onValueChange={setSeats} min={1} max={50} scrub suffix={(v) => (v === 1 ? " seat" : " seats")} />
      <Row>
        <NumberField label="Price" value={price} onValueChange={setPrice} min={0} max={999} step={0.5} prefix="$" size="sm" />
      </Row>
      <Caption>Total: ${(seats * price).toFixed(2)} per month.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `NumberField`

A bounded number with odometer digits. Buttons and arrow keys repeat and speed up while held, PageUp and PageDown take large steps, Home and End jump to the limits, and `scrub` lets the label be dragged. Typing edits a plain draft that applies live while valid; the rolling digits return once it commits on Enter, blur, or the next step.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `value` | `number` | — | — |
| `defaultValue` | `number` | `0` | — |
| `onValueChange` | `(value: number) => void` | — | — |
| `min` | `number` | `0` | — |
| `max` | `number` | `Number.MAX_SAFE_INTEGER` | — |
| `step` | `number` | `1` | — |
| `largeStep` | `number` | — | PageUp, PageDown, and Shift with an arrow move this far. Defaults to ten steps. |
| `description` | `string` | — | — |
| `disabled` | `boolean` | — | — |
| `id` | `string` | — | — |
| `prefix` | `string \| ((value: number) => string)` | — | Text before the number, such as "$". |
| `suffix` | `string \| ((value: number) => string)` | — | Text after the number, such as " seats". |
| `scrub` | `boolean` | `false` | Drag the label sideways to scrub the value, one step every few pixels. |
| `locale` | `string` | `"en-US"` | Formatting locale. Fixed by default so server and client render the same digits. |
| `formatOptions` | `{ minimumFractionDigits?: number; maximumFractionDigits?: number; useGrouping?: boolean }` | — | Fraction digits and grouping. Fraction digits follow the precision of `step` by default. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height, type size, and default width. |
| `limitHint` | `boolean \| ((edge: "min" \| "max", limit: number) => string)` | `true` | A short note beside the label when a press meets a limit or a typed value passes one. `false` hides it; a function writes the copy. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `NumberFieldAffix`: Text shown beside the number. A function receives the value, so a unit can follow it: `n => n === 1 ? " seat" : " seats"`. | `string \| ((value: number) => string)` |
| `NumberFieldSize` | `"sm" \| "md" \| "lg"` |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Somam ou subtraem `step`; segurar repete e acelera, e com `Shift` o passo vira `largeStep`. |
| `Page Up` ou `Page Down` | Somam ou subtraem `largeStep` (por padrão, dez passos). |
| `Home` ou `End` | Vão para `min` ou para `max` (`End` só quando `max` foi definido); durante a digitação, movem o cursor. |
| `Enter` | Aplica o valor digitado, ajustado ao passo e aos limites; sem digitação, seleciona o número. |
| `Esc` | Durante a digitação, descarta o texto e volta ao valor de antes da edição. |
| `Tab` | Passa pelo botão de menos, pelo número e pelo de mais; nos botões, `Enter` e `Espaço` dão um passo. |

## Acessibilidade

- O número é um `<input>` com `role="spinbutton"` ligado ao `label` visível, com `aria-valuenow`, `aria-valuetext` já com `prefix` e `suffix`, e os limites quando definidos.
- Os botões ficam na ordem de tabulação e, no limite, recebem `aria-disabled` sem perder o foco; seus nomes são `Decrease …` e `Increase …`, em inglês.
- Uma região `aria-live` anuncia o valor após um clique nos botões ou um arrasto do rótulo, e o limite atingido; a nota visível `Max …`/`Min …` muda com `limitHint` ou some com `false`.

## Movimento

- Cada dígito gira como um odômetro no sentido da mudança, dando a volta de 9 para 0, e as colunas abrem ou fecham a largura quando o número ganha ou perde um dígito.
- No limite, o valor força em direção a ele e volta com uma mola, um pouco mais a cada insistência seguida; o ícone do botão recusado treme e uma nota com o limite surge ao lado do rótulo.
- Com “reduzir movimento” ligado, nada se desloca: os dígitos só esmaecem e insistir num limite apenas tinge o número por um instante.

## Comportamento responsivo

- A largura vem de `--number-field-width` (196 px; 164 em `sm` e 228 em `lg`), limitada a 100% do contêiner, e a altura segue `size`: 36, 44 ou 50 px.

## Desempenho

- Cada dígito monta uma roda com os dez algarismos, cada um com estilos animados próprios: numa tabela com dezenas de campos, prefira um campo simples como `input`.

## Notas para IA

- Controlado com `value` + `onValueChange` ou não controlado com `defaultValue` (padrão `0`); como `min` também é `0` por padrão, passe um `min` negativo para aceitar valores abaixo de zero.
- Um valor digitado dentro dos limites e do passo já chama `onValueChange` durante a digitação; o resto é ajustado ao confirmar ou sair do campo, e as casas decimais seguem as de `step`.
- Passe `locale="pt-BR"` para vírgula decimal e ponto de milhar e `formatOptions` para casas ou agrupamento; não há prop `name`, então envie o valor a partir do seu estado.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/number-field · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
