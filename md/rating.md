# Rating

> Avaliação por estrelas acessível, com meias estrelas, teclado e opção de limpar.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/rating
- Descrição original (inglês): A simple, accessible way to capture a numeric opinion.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/rating.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/rating.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/rating.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/rating.json`. Caminho do registro, relativo ao endereço do site: `r/rating.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/rating/rating.tsx`
  - `components/ryan-ui/rating/rating.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/rating.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Pedir uma nota rápida depois de uma compra, estadia ou atendimento.
- Mostrar a média de avaliações com meias estrelas, em modo `readOnly`.
- Formulários com vários critérios, cada um com sua nota e uma linha de apoio em `description`.

## Quando não usar

- Use [`reactions`](reactions.md) para reconhecer um post com um toque, sem escala de nota.
- Use [`slider`](slider.md) quando a escala tem muitos pontos, como de 0 a 100.
- Use [`radio-group`](radio-group.md) quando cada ponto da escala precisa de um texto próprio visível, como numa escala de concordância.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Rating } from "@/components/ryan-ui/rating/rating";
import { Caption, Stack } from "./_kit";

export default function RatingDemo() {
  const [score, setScore] = useState(4);
  return (
    <Stack gap={6} width={360}>
      <Rating label="How was your stay?" description="Tap a star, or click it again to clear." value={score} onChange={setScore} size="lg" />
      <Rating label="Cleanliness (half stars)" defaultValue={3.5} allowHalf />
      <Rating label="Average from 212 reviews" defaultValue={4.5} allowHalf readOnly size="sm" />
      <Caption>Your score: {score || "none"}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Rating`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `value` | `number` | — | — |
| `defaultValue` | `number` | `0` | — |
| `onChange` | `(value: number) => void` | — | Receives the committed value; 0 means the rating was cleared. |
| `max` | `number` | `5` | — |
| `readOnly` | `boolean` | `false` | — |
| `disabled` | `boolean` | `false` | — |
| `description` | `string` | — | — |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | — |
| `className` | `string` | — | — |
| `allowHalf` | `boolean` | `false` | Pointer, touch, and arrow keys move in half stars. |
| `allowClear` | `boolean` | `true` | Choosing the current value again clears it; Backspace and Delete clear from the keyboard. |
| `showValue` | `boolean` | `true` | Show the word or number for the previewed value beside the stars. |
| `valueLabels` | `readonly string[]` | — | One word per whole star. Five whole stars default to "Poor" through "Excellent"; anything else reads "4 out of 5". |
| `emptyLabel` | `string` | `"Not rated"` | Shown beside empty stars. |
| `name` | `string` | — | Submits the value with a surrounding form. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `↑` | Sobem a nota em um passo (meia estrela com `allowHalf`) e levam o foco junto. |
| `←` ou `↓` | Descem um passo; abaixo da primeira estrela, a nota é apagada se `allowClear` estiver ligado. |
| `Home` ou `End` | Vão à menor nota ou à máxima. |
| `1–9` | Dão essa nota direto, até o valor de `max`. |
| `Backspace` ou `Delete` | Apagam a nota quando `allowClear` está ligado, que é o padrão. |
| `Espaço` ou `Enter` | Escolhem a estrela em foco. |

## Acessibilidade

- As estrelas formam um `radiogroup` ligado ao rótulo, com um botão `role="radio"` por valor (dois por estrela com `allowHalf`) lido como “Great, 4 of 5 stars”, e só o valor atual entra no Tab.
- Com `readOnly`, o grupo vira `role="img"` com a nota no nome (“… 4.5 out of 5”) e nada recebe foco.
- Escolhas com ponteiro e a nota apagada são anunciadas numa região `aria-live`; as palavras padrão (“Poor” a “Excellent”, “Not rated”) são em inglês, troque com `valueLabels` e `emptyLabel`.

## Movimento

- Ao escolher, o preenchimento varre as estrelas da esquerda para a direita e cada uma dá um pulinho em onda; escolhas seguidas e rápidas, como uma seta segurada, fazem pular só a estrela escolhida.
- Passar o mouse mostra uma prévia sobre a nota guardada, que fica como marca fraca, e a palavra do valor rola na direção da mudança.
- Com “reduzir movimento” ligado, preenchimento, pulo e palavras trocam na hora.

## Comportamento responsivo

- As células de `sm`, `md` e `lg` medem 28, 36 e 44px; em telas de toque prefira `lg`, e o dedo pode deslizar pelas estrelas, valendo a nota ao soltar.
- Quando falta largura, a palavra do valor desce para a linha de baixo; ela reserva o espaço da palavra mais longa e não empurra nada ao mudar.

## Notas para IA

- `onChange` recebe a nota confirmada e 0 significa apagada; clicar de novo na nota atual também apaga, a menos que `allowClear={false}`.
- Para média de avaliações, use `readOnly` com `allowHalf` e um valor como 4.5; valores são arredondados ao passo, meia estrela ou inteira.
- As palavras padrão só aparecem com `max={5}` sem meias estrelas, e nos outros casos o texto é “4 out of 5”, então em português passe `valueLabels` ou `showValue={false}`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/rating · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
