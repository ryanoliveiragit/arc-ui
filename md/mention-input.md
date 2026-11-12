# Mention input

> Caixa de texto com menções a @pessoas e #canais que funcionam como um único bloco.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/mention-input
- Descrição original (inglês): A textarea with @people and #channel mentions that act as single tokens, with suggestions at the caret.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/mention-input.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/mention-input.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/mention-input.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/mention-input.json`. Caminho do registro, relativo ao endereço do site: `r/mention-input.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/mention-input/mention-input.tsx`
  - `components/ryan-ui/mention-input/mention-input.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/mention-input.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Comentários, mensagens e notas em que se cita gente com `@` ou canais com `#` e é preciso saber quem foi mencionado.
- Quando o texto vai ser guardado ou gerar notificações: o valor traz o texto puro e `mentions` com `id` e posições, e `serializeMentions` o converte para `<@id>` e `<#id>`.
- Caixas de envio rápido: com `submitOnEnter`, `Enter` chama `onSubmit` e `Shift + Enter` quebra a linha.

## Quando não usar

- Use [`textarea`](textarea.md) quando o texto não tem menções.
- Use [`rich-text-editor`](rich-text-editor.md) quando é preciso formatação, como negrito, listas e títulos.
- Use [`prompt-input`](prompt-input.md) para a caixa de mensagem de um assistente, com anexos e botão de enviar.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import MentionInput, { type MentionValue } from "@/components/ryan-ui/mention-input/mention-input";
import { avatar } from "@/components/ryan-ui/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 480 };

const people = [
  { id: "emma-collins", name: "Emma Collins", role: "Product designer", avatar: avatar("emma-collins") },
  { id: "marcus-johnson", name: "Marcus Johnson", role: "Frontend engineer", avatar: avatar("marcus-johnson") },
  { id: "jasmine-brooks", name: "Jasmine Brooks", role: "Design lead", avatar: avatar("jasmine-brooks") },
  { id: "olivia-bennett", name: "Olivia Bennett", role: "Platform engineer", avatar: avatar("olivia-bennett") },
];
const channels = [
  { id: "design", name: "design", description: "Design critique and reviews", members: 24 },
  { id: "launch", name: "launch", description: "Q4 launch coordination", members: 18 },
  { id: "frontend", name: "frontend", description: "Web engineering", members: 31 },
];

// The comment already holds a #channel mention and is mid-way through typing "@", so the preview shows a mention token
// and the open suggestions together. The space below the field is reserved for the list.
const start = "Moving the review to #design. Looping in @";
const initial: MentionValue = { text: start, mentions: [{ kind: "channel", id: "design", label: "design", start: 21, end: 28 }] };

export default function MentionInputDemo() {
  const [value, setValue] = useState<MentionValue>(initial);
  return (
    <Stack gap={3} width={440}>
      <div style={{ paddingBottom: 176 }}>
        <MentionInput aria-label="Comment" value={value} onChange={setValue} people={people} channels={channels} placeholder="Write a comment. Type @ for people or # for channels." minRows={3} placement="bottom" defaultOpen />
      </div>
      <Caption>{value.mentions.length ? `${value.mentions.length} mention${value.mentions.length > 1 ? "s" : ""}: ${value.mentions.map((m) => (m.kind === "channel" ? "#" : "@") + m.label).join(", ")}. Type @ or # to add more.` : "Type @ for people or # for channels."}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `MentionInput`

A textarea with `@` people and `#` channel mentions. Mentions are atomic: the caret steps over them and one Backspace removes the whole token. The value carries plain text plus a structured `mentions` array with offsets, ready to store or notify.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` | `MentionValue` | — | — |
| `defaultValue` | `MentionValue` | — | — |
| `onChange` | `(value: MentionValue) => void` | — | — |
| `people` | `MentionPerson[]` | — | People offered after `@`. Leave it out to turn person mentions off. |
| `channels` | `MentionChannel[]` | — | Channels offered after `#`. Leave it out to turn channel mentions off. |
| `onMentionAdd` | `(mention: Mention) => void` | — | Called when a suggestion becomes a mention. |
| `onSubmit` | `(value: MentionValue) => void` | — | With `submitOnEnter`, Enter submits and Shift+Enter adds a line. |
| `submitOnEnter` | `boolean` | `false` | — |
| `placeholder` | `string` | — | — |
| `minRows` | `number` | `1` | — |
| `maxRows` | `number` | `8` | The field grows to this many rows, then scrolls. |
| `placement` | `"auto" \| "top" \| "bottom"` | `"auto"` | Where suggestions open. `auto` flips above when there is no room below. |
| `defaultOpen` | `boolean` | `false` | Show the suggestions for the text before the end of the value on first render, without focusing the field (for previews and onboarding). They close on a click outside; once the field is focused it behaves as usual. |
| `maxSuggestions` | `number` | `6` | — |
| `disabled` | `boolean` | — | — |
| `name` | `string` | — | — |
| `id` | `string` | — | — |
| `aria-label` | `string` | — | — |
| `aria-describedby` | `string` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `MentionKind` | `"person" \| "channel"` |

#### `MentionPerson`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `name` (obrigatória) | `string` | — |
| `role` | `string` | One short line under the name, such as a job title. |
| `avatar` | `string` | Portrait URL. Initials show when it is missing. |

#### `MentionChannel`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `name` (obrigatória) | `string` | — |
| `description` | `string` | — |
| `members` | `number` | — |

#### `Mention`

A mention inside `text`. `start` and `end` are character offsets; the text between them is `@label` or `#label`.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `kind` (obrigatória) | `"person" \| "channel"` | — |
| `id` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `start` (obrigatória) | `number` | — |
| `end` (obrigatória) | `number` | — |

#### `MentionValue`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `text` (obrigatória) | `string` | — |
| `mentions` (obrigatória) | `Mention[]` | — |

#### `MentionInputHandle`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `focus` (obrigatória) | `() => void` | — |
| `insert` (obrigatória) | `(text: string) => void` | Inserts text at the caret, as if typed. |
| `openSuggestions` (obrigatória) | `(kind: MentionKind) => void` | Types a trigger at the caret so the suggestions open, adding a space first when needed. |
| `clear` (obrigatória) | `() => void` | — |
| `textarea` (obrigatória) | `HTMLTextAreaElement \| null` | — |

### Outras exportações

- `mentionText` (função)
- `serializeMentions` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↓` ou `↑` | Com as sugestões abertas, movem o destaque, dando a volta nas pontas. |
| `Enter` ou `Tab` | Com as sugestões abertas, inserem a que está em destaque como menção. |
| `Esc` | Fecha as sugestões sem apagar o que foi digitado. |
| `Backspace` ou `Delete` | Junto de uma menção, apagam o token inteiro de uma vez. |
| `←` ou `→` | Saltam por cima de uma menção: o cursor nunca para dentro dela. |
| `Shift + Enter` | Com `submitOnEnter`, quebra a linha, enquanto `Enter` sozinho envia. |

## Acessibilidade

- A caixa é um `<textarea>` com `role="combobox"`, `aria-expanded` e `aria-activedescendant`; as sugestões são um `role="listbox"`, e o foco nunca sai do texto.
- Não há rótulo visível embutido: passe `aria-label`, ou um `id` com um `<label>` seu apontando para ele.
- Uma região `aria-live` anuncia quantas pessoas ou canais combinam, mas em inglês fixo (`3 people`, `No matches`), assim como os nomes das listas.

## Movimento

- A altura da caixa acompanha o texto com uma mola, entre `minRows` e `maxRows`; daí em diante o conteúdo rola.
- As sugestões surgem junto ao caractere `@` ou `#`, o destaque desliza entre as linhas e a altura do painel segue a quantidade de resultados.
- Com “reduzir movimento” ligado, alturas e destaque mudam na hora e o painel só esmaece.

## Comportamento responsivo

- Ocupa 100% da largura; o painel de sugestões tem 272 px, fica preso dentro da largura da caixa e, com `placement="auto"`, abre para cima quando há menos de 300 px livres abaixo.

## Desempenho

- O texto é desenhado por uma camada espelho refeita a cada tecla, e a busca percorre `people` ou `channels` inteiros para mostrar no máximo `maxSuggestions` (padrão 6); os avatares usam `loading="lazy"`.

## Notas para IA

- O valor é `{ text, mentions }`, não uma string: use `value` + `onChange` ou `defaultValue`, e leia `mentions` (`kind`, `id`, `label`, `start`, `end`) na hora de salvar.
- Passe `people` para ativar `@` e `channels` para ativar `#`; sem a lista, o gatilho correspondente fica desligado.
- O `ref` expõe `focus()`, `insert(texto)`, `openSuggestions(kind)` e `clear()`: serve para um botão “@” na barra e para limpar a caixa depois do envio.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/mention-input · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
