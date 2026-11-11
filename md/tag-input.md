# Tag input

> Transforma textos curtos em etiquetas removíveis, com animação suave ao adicionar e remover.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/tag-input
- Descrição original (inglês): Turn short text values into removable tags.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tag-input.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tag-input.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tag-input.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tag-input.json`. Caminho do registro, relativo ao endereço do site: `r/tag-input.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/tag-input/tag-input.tsx`
  - `components/ryan-ui/tag-input/tag-input.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/tag-input.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Palavras-chave, tópicos ou rótulos livres digitados pela pessoa, como as tags de um post.
- Listas curtas de valores digitados, como domínios ou e-mails num filtro ou convite.

## Quando não usar

- Use [`multi-select`](multi-select.md) quando as opções vêm de uma lista conhecida.
- Use [`chip-group`](chip-group.md) para filtros com facetas fixas que a pessoa liga e desliga.
- Use [`mention-input`](mention-input.md) quando os itens são menções a pessoas ou canais dentro de um texto.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { TagInput } from "@/components/ryan-ui/tag-input/tag-input";
import { Caption, Stack } from "./_kit";

export default function TagInputDemo() {
  const [tags, setTags] = useState(["design systems", "react", "accessibility"]);
  return (
    <Stack width={420} gap={3}>
      <TagInput label="Topics" description="Press Enter or comma to add. Backspace selects, then removes." placeholder="Add a topic" value={tags} onValueChange={setTags} />
      <Caption>{tags.length} topic{tags.length === 1 ? "" : "s"}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `TagInput`

Tags keep the field still: a new tag blurs in where its text was typed while the caret glides aside, a removed tag leaves its slot and the rest glide in, and the shell follows wrapped rows on a spring. Backspace or the arrow keys pick a tag first, a ring glides to it, and the next Backspace removes it.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `value` | `string[]` | — | — |
| `defaultValue` | `string[]` | `[]` | — |
| `onValueChange` | `(value: string[]) => void` | — | — |
| `placeholder` | `string` | `"Add a tag"` | — |
| `description` | `string` | — | — |
| `id` | `string` | — | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `,` | Transformam o texto digitado em etiqueta; sair do campo também adiciona, e uma repetida só faz pulsar a que já existe. |
| `Backspace` | Com o cursor no início do campo, seleciona a última etiqueta; com uma selecionada, remove-a, como o Delete. |
| `←` ou `→` | Movem a seleção entre as etiquetas (← a partir do início do campo); passando da última, voltam ao texto. |
| `Esc` | Desfaz a seleção da etiqueta sem remover. |

## Acessibilidade

- Cada etiqueta tem um botão “Remove {tag}” na ordem de tabulação, e remover devolve o foco ao campo.
- Uma região `aria-live` anuncia adicionar, remover, selecionar e repetidas (“react is already added”); os textos são em inglês e fixos no código.
- O `label` visível nomeia o campo e a `description` entra por `aria-describedby`.

## Movimento

- Uma etiqueta nova aparece com desfoque onde o texto foi digitado enquanto o cursor desliza para o lado, e ao remover as outras deslizam para ocupar o lugar.
- A caixa acompanha as linhas que quebram numa mola, um anel desliza entre as etiquetas selecionadas pelo teclado e uma repetida pulsa.
- Com “reduzir movimento” ligado, as etiquetas só esmaecem, nada desliza e a caixa muda de altura na hora.

## Comportamento responsivo

- As etiquetas quebram em várias linhas e a caixa cresce com elas, sem limite de altura nem rolagem interna.

## Notas para IA

- O valor é `string[]`, com `value` e `onValueChange` ou `defaultValue`; não há limite de quantidade, sugestões nem validação, então filtre em `onValueChange` se precisar.
- Repetidas são ignoradas sem diferenciar maiúsculas, e a vírgula sempre separa, então uma etiqueta não pode conter vírgula.
- Import nomeado, `import { TagInput } from "@/components/ryan-ui/tag-input/tag-input"`; o `placeholder` some depois da primeira etiqueta.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/tag-input · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
