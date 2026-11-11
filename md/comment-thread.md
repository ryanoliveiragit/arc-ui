# Comment thread

> Comentários em fio, com respostas, reações, menções, edição no local e opção de resolver a conversa.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/comment-thread
- Descrição original (inglês): Threaded comments with replies, reactions, mentions, inline edit, and resolve.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/comment-thread.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/comment-thread.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/comment-thread.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/comment-thread.json`. Caminho do registro, relativo ao endereço do site: `r/comment-thread.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/comment-thread/comment-thread.tsx`
  - `components/ryan-ui/comment-thread/comment-thread.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/comment-thread.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Discussão presa a um conteúdo específico (um título do layout, um parágrafo, uma tarefa), com o assunto em `title`.
- Quando a conversa precisa de respostas aninhadas, reações, menções com `@` e edição ou exclusão dos próprios comentários no lugar.
- Revisões que se encerram: resolver dobra a conversa inteira num resumo de uma linha que pode ser reaberto.

## Quando não usar

- Use [`chat-thread`](chat-thread.md) para conversa em tempo real, com balões, indicador de digitação e confirmação de leitura.
- Use [`mention-input`](mention-input.md) quando só precisa do campo com menções, sem a conversa em volta.
- Use [`timeline`](timeline.md) para um histórico só de leitura do que aconteceu.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { CommentThread, type CommentAuthor, type ThreadComment } from "@/components/ryan-ui/comment-thread/comment-thread";
import { avatar } from "@/components/ryan-ui/lib/media";
import { Stack } from "./_kit";

const emma: CommentAuthor = { id: "emma", name: "Emma Collins", avatar: avatar("emma-collins") };
const marcus: CommentAuthor = { id: "marcus", name: "Marcus Johnson", avatar: avatar("marcus-johnson") };
const jasmine: CommentAuthor = { id: "jasmine", name: "Jasmine Brooks", avatar: avatar("jasmine-brooks") };
const me: CommentAuthor = { id: "olivia", name: "Olivia Bennett", avatar: avatar("olivia-bennett") };

const comments: ThreadComment[] = [
  {
    id: "c1", author: emma, createdAt: "3h",
    body: "The headline wraps onto three lines at tablet width. Can we shorten it?",
    reactions: [{ emoji: "👀", users: ["marcus", "jasmine"] }],
    replies: [
      { id: "c2", author: marcus, createdAt: "2h", body: "Agreed. What about \"Ship interfaces people remember\"?", reactions: [{ emoji: "👍", users: ["emma", "olivia"] }] },
      { id: "c3", author: jasmine, createdAt: "1h", body: "Works for me. @Emma Collins can you confirm it fits the brand voice?" },
    ],
  },
  { id: "c4", author: marcus, createdAt: "35m", body: "I also bumped the subheading contrast to meet AA." },
];

export default function CommentThreadDemo() {
  return (
    <Stack width={520}>
      <CommentThread defaultComments={comments} currentUser={me} people={[emma, marcus, jasmine, me]} title="Hero headline" />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CommentThread`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `comments` | `ThreadComment[]` | — | — |
| `defaultComments` | `ThreadComment[]` | `[]` | — |
| `onCommentsChange` | `(comments: ThreadComment[], event: CommentThreadEvent) => void` | — | — |
| `currentUser` (obrigatória) | `CommentAuthor` | — | The person writing. Their comments can be edited and deleted. |
| `people` | `CommentAuthor[]` | — | People who can be mentioned. Defaults to everyone in the thread. |
| `resolved` | `boolean` | — | — |
| `defaultResolved` | `boolean` | `false` | — |
| `onResolvedChange` | `(resolved: boolean) => void` | — | — |
| `title` | `ReactNode` | — | What the thread is about, shown in its header, such as "Hero headline". |
| `reactions` | `string[]` | `DEFAULT_REACTIONS` | Emoji offered by the reaction picker. |
| `placeholder` | `string` | `"Reply, or @mention someone"` | — |
| `maxDepth` | `number` | `2` | Replies deeper than this attach to the deepest allowed parent. Defaults to 2. |
| `nowLabel` | `string` | `"Just now"` | Label for comments written now. |
| `labels` | `CommentThreadLabels` | — | Words for localization. Leave out any key to keep its English default. |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `CommentThreadEvent`: What changed, for syncing to a server. `comments` on `onCommentsChange` is always the full next tree. | `\| { type: "reply"; comment: ThreadComment; parentId: string \| null } \| { type: "edit"; id: string; body: string } \| { type: "delete"; id: string } \| { type: "react"; id: string; emoji: string; added: boolean }` |

#### `CommentAuthor`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `name` (obrigatória) | `string` | — |
| `avatar` | `string` | Square image URL. Initials are shown without one. |

#### `CommentReaction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `emoji` (obrigatória) | `string` | — |
| `users` (obrigatória) | `string[]` | Ids of the people who reacted. |

#### `ThreadComment`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `author` (obrigatória) | `CommentAuthor` | — |
| `body` (obrigatória) | `string` | Plain text. "@Full Name" mentions of known people are highlighted. |
| `createdAt` (obrigatória) | `string` | Display label such as "2h" or "Sep 18". |
| `edited` | `boolean` | — |
| `deleted` | `boolean` | A deleted comment that still has replies keeps its place as a quiet placeholder. |
| `reactions` | `CommentReaction[]` | — |
| `replies` | `ThreadComment[]` | — |

#### `CommentThreadLabels`

Every word the thread shows or announces. Each one has an English default; words with a count or a name are functions, so an app can apply its own plural rules.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `thread` | `string` | Accessible name of the whole thread. |
| `commentCount` | `(count: number) => string` | Header and resolved chip, such as "3 comments". |
| `peopleCount` | `(count: number) => string` | Resolved chip, such as "2 people". |
| `resolve` | `string` | — |
| `resolved` | `string` | Title of the resolved chip. |
| `reopen` | `string` | — |
| `empty` | `string` | Shown when there are no comments. |
| `reply` | `string` | — |
| `edit` | `string` | — |
| `delete` | `string` | — |
| `cancel` | `string` | — |
| `send` | `string` | — |
| `save` | `string` | Saves an edit. |
| `editComment` | `string` | Placeholder and accessible name of the edit field. |
| `edited` | `string` | After the time of an edited comment. |
| `deleteConfirm` | `string` | — |
| `deletedText` | `string` | Placeholder text of a deleted comment that still has replies. |
| `deletedComment` | `string` | Accessible name of that placeholder. |
| `replyingTo` | `(name: string) => string` | Above the composer while replying. The name inside it is highlighted. |
| `cancelReply` | `string` | — |
| `showReplies` | `(count: number) => string` | — |
| `hideReplies` | `string` | — |
| `addReaction` | `string` | — |
| `closeReactions` | `string` | — |
| `reactions` | `string` | Accessible name of the reaction picker. |
| `reactWith` | `(emoji: string) => string` | Accessible name of an emoji in the picker. |
| `reactionCount` | `(emoji: string, count: number, includesYou: boolean) => string` | Accessible name of a reaction under a comment. |
| `mentions` | `string` | Accessible name of the @mention suggestions. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Ctrl + Enter` ou `Cmd + Enter` | Enviam o comentário ou salvam a edição; `Enter` sozinho quebra a linha. |
| `↑` ou `↓` | Com as sugestões de menção abertas, percorrem a lista. |
| `Enter` ou `Tab` | Com as sugestões abertas, inserem a pessoa destacada como `@Nome Completo`. |
| `Esc` | Fecha as sugestões; sem elas, cancela a resposta ou a edição, e também fecha o seletor de reações e a confirmação de exclusão. |
| `Tab` | Percorre os botões de cada comentário; as ações (reagir, responder, editar, excluir) aparecem quando o foco entra nele. |

## Acessibilidade

- A raiz é uma `section` nomeada e cada comentário é um `article` com autor e hora no rótulo; o campo é um `combobox` ligado à lista de menções por `aria-activedescendant`.
- O foco é conduzido: resolver leva ao botão de reabrir e vice-versa, responder leva ao campo, e a confirmação de exclusão abre com o foco no botão de excluir.
- Todos os textos têm padrão em inglês e são trocados por `labels`; não há região viva, então comentários que chegam de fora não são anunciados.

## Movimento

- Comentários e respostas entram e saem abrindo a própria altura com mola; recolher respostas faz o mesmo e gira a seta.
- Editar troca o texto pelo campo com um esmaecer enquanto a altura do comentário acompanha em mola; reações surgem com escala e a contagem rola.
- Resolver cruza a conversa com o resumo enquanto a altura da caixa anima; com “reduzir movimento”, sobram esmaecimentos curtos e as alturas mudam na hora.

## Comportamento responsivo

- Em telas de até 420 px o campo perde o avatar ao lado e as respostas recuam 12 px em vez de 24; em toque, as ações de cada comentário ficam sempre visíveis.
- O campo cresce com o texto por `field-sizing: content` (até 160 px); em navegadores sem essa propriedade ele fica com uma linha e rola.

## Desempenho

- A árvore inteira é refeita a cada mudança e cada comentário mantém um observador de altura: serve a discussões de dezenas de comentários, não a um feed longo.

## Notas para IA

- Controlado ou não nos dois eixos: `comments` com `onCommentsChange` e `resolved` com `onResolvedChange`, ou `defaultComments` e `defaultResolved`; o callback entrega a árvore nova inteira e o evento que a causou, para sincronizar o servidor.
- `createdAt` é o texto já formatado (“2h”, “18 set”), não uma data; comentários novos saem com `nowLabel` e um `id` local, que você troca pelo do servidor.
- `currentUser` decide quem pode editar e excluir; `people` alimenta as menções, e respostas além de `maxDepth` (2) se prendem ao nível mais fundo permitido.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/comment-thread · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
