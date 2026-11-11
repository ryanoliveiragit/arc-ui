# Rich text editor

> Editor leve com atalhos de markdown, barra flutuante, menu de barra e saída em HTML ou markdown.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/rich-text-editor
- Descrição original (inglês): A lightweight editor with markdown shortcuts, a floating toolbar, a slash menu, and HTML and markdown output.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/rich-text-editor.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/rich-text-editor.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/rich-text-editor.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/rich-text-editor.json`. Caminho do registro, relativo ao endereço do site: `r/rich-text-editor.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/rich-text-editor/rich-text-editor.tsx`
  - `components/ryan-ui/rich-text-editor/rich-text-editor.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/rich-text-editor.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Notas, comentários longos, descrições de produto ou notas de versão que precisam de títulos, listas e links.
- Quem escreve já conhece Markdown: atalhos como `## `, `- `, `1. ` e `> ` viram formatação enquanto digita.
- Quando você precisa guardar o texto como Markdown ou HTML limpo sem trazer uma biblioteca de editor.

## Quando não usar

- Use [`textarea`](textarea.md) para texto simples, sem formatação.
- Use [`mention-input`](mention-input.md) quando o que importa são menções a pessoas e canais, não a formatação.
- Documentos longos, tabelas, imagens ou edição colaborativa pedem um editor completo; este cobre títulos, listas, citações, código e links.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import RichTextEditor, { type RichTextValue } from "@/components/ryan-ui/rich-text-editor/rich-text-editor";
import { Caption, Stack, Surface } from "./_kit";

const intro = `# Release notes

Version 2.4 makes **search** noticeably faster and adds *saved filters*.

- Faster indexing for large workspaces
- Saved filters on every list
- Fewer layout jumps while loading

Select text for the toolbar, or type / on an empty line for blocks.`;

export default function RichTextEditorDemo() {
  const [words, setWords] = useState(0);
  const onChange = (v: RichTextValue) => setWords(v.text.trim() ? v.text.trim().split(/\s+/).length : 0);
  return (
    <Stack width={560} gap={3}>
      <Surface padding={4}>
        <RichTextEditor defaultMarkdown={intro} onChange={onChange} aria-label="Release notes" />
      </Surface>
      <Caption>Markdown shortcuts work as you type (## , - , 1. , &gt; ). {words > 0 ? `${words} words.` : ""}</Caption>
    </Stack>
  );
}
export const stage = { height: 520 };
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `RichTextEditor`

A light rich text editor on contentEditable. Markdown shortcuts as you type, a floating selection toolbar that morphs into a link field, a slash menu for blocks, its own undo history, and HTML plus Markdown output. No dependencies beyond Motion and icons.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` | `string` | — | Controlled HTML. The editor only rewrites its content when this differs from what it last emitted. |
| `defaultValue` | `string` | — | — |
| `defaultMarkdown` | `string` | — | Initial content as Markdown, used when no HTML value is given. |
| `onChange` | `(value: RichTextValue) => void` | — | — |
| `onHistoryChange` | `(state: { canUndo: boolean; canRedo: boolean }) => void` | — | Reports whether undo and redo are available, for your own toolbar. |
| `placeholder` | `string` | `"Start writing"` | — |
| `blockHint` | `string` | `"Type / for blocks"` | The hint on an empty line while typing. |
| `readOnly` | `boolean` | `false` | — |
| `autoFocus` | `boolean` | `false` | — |
| `aria-label` | `string` | — | — |
| `className` | `string` | — | — |
| `style` | `CSSProperties` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `BlockType` | `"p" \| "h1" \| "h2" \| "h3" \| "ul" \| "ol" \| "blockquote" \| "pre" \| "hr"` |

#### `RichTextValue`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `html` (obrigatória) | `string` | — |
| `markdown` (obrigatória) | `string` | — |
| `text` (obrigatória) | `string` | — |
| `empty` (obrigatória) | `boolean` | — |

#### `RichTextEditorHandle`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `focus` (obrigatória) | `() => void` | — |
| `getHTML` (obrigatória) | `() => string` | — |
| `getMarkdown` (obrigatória) | `() => string` | — |
| `getText` (obrigatória) | `() => string` | — |
| `setHTML` (obrigatória) | `(html: string) => void` | — |
| `setMarkdown` (obrigatória) | `(markdown: string) => void` | — |
| `clear` (obrigatória) | `() => void` | — |
| `undo` (obrigatória) | `() => void` | — |
| `redo` (obrigatória) | `() => void` | — |
| `element` (obrigatória) | `HTMLDivElement \| null` | — |

### Outras exportações

- `normalizeUrl` (função)
- `markdownToHtml` (função)
- `htmlToMarkdown` (função)
- `sanitizeHtml` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Ctrl + Z` | Desfaz pelo histórico próprio do editor; Ctrl + Shift + Z ou Ctrl + Y refazem (⌘ no Mac). |
| `Ctrl + B` | Negrito; Ctrl + I faz itálico, Ctrl + Shift + X tachado e Ctrl + E código na linha. |
| `Ctrl + K` | Abre o campo de link na barra flutuante, onde Enter aplica e Esc volta à formatação. |
| `/` | No começo da linha ou depois de um espaço, abre o menu de blocos: ↑ e ↓ escolhem, Enter ou Tab inserem e Esc fecha. |
| `Tab` ou `Shift + Tab` | Numa lista, aumentam ou diminuem o recuo do item; num bloco de código, Tab insere dois espaços, e fora deles o foco sai do editor. |
| `Alt + F10` | Com a barra flutuante aberta, leva o foco a ela; ← e → andam entre os botões e Esc volta ao texto. |

## Acessibilidade

- A área de escrita é `role="textbox"` com `aria-multiline`; passe `aria-label` com o nome do campo, porque o padrão é “Editor”.
- A barra é um `role="toolbar"` com botões nomeados e `aria-pressed`, e o menu de blocos é uma `listbox` ligada ao texto por `aria-activedescendant`, então o foco não sai do texto ao escolher.
- Uma região `aria-live` anuncia desfazer, refazer, atalhos de Markdown aplicados, blocos inseridos e links; os textos da interface são em inglês e fixos no código.

## Movimento

- A barra flutuante surge com uma mola curta junto da seleção, desliza quando a seleção muda e troca de tamanho numa mola quando vira o campo de link, com as faces deslizando de lado.
- No menu de blocos, um destaque desliza entre as opções e o painel acompanha a altura dos resultados filtrados.
- Com “reduzir movimento” ligado, barra e menu só esmaecem e mudam de tamanho e de posição na hora.

## Comportamento responsivo

- Com o editor abaixo de 330px de largura (consulta de contêiner), a barra esconde os botões de bloco e fica só com as marcas de texto; os blocos seguem no menu de barra.
- Barra e menu abrem para cima ou para baixo conforme o espaço visível no ancestral que rola ou corta, para não ficarem escondidos.

## Desempenho

- A cada mudança o editor gera HTML, Markdown e texto do documento inteiro, e o desfazer guarda até 300 cópias do HTML; ele foi feito para notas e descrições, não para documentos longos.

## Notas para IA

- Comece com `defaultMarkdown` ou `defaultValue` (HTML) e leia `onChange`, que entrega `{ html, markdown, text, empty }`; o `value` controlado só reescreve o conteúdo quando difere do último HTML emitido.
- Não há `name` nem campo de formulário: guarde `html` ou `markdown` no estado; pelo `ref` há `getHTML`, `getMarkdown`, `setMarkdown`, `clear`, `undo` e `redo`.
- Trate o `html` como entrada do usuário e sanitize no servidor antes de mostrar a outras pessoas, porque a limpeza embutida vale para o que é colado; não há sublinhado nem imagens.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/rich-text-editor · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
