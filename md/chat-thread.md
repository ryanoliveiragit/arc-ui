# Chat thread

> Conversa com mensagens agrupadas, reações, confirmação de leitura, indicador de digitação e campo de envio com anexos.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/chat-thread
- Descrição original (inglês): A chat thread with grouped messages, reactions, read receipts, typing, and a composer with attachments.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/chat-thread.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/chat-thread.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/chat-thread.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/chat-thread.json`. Caminho do registro, relativo ao endereço do site: `r/chat-thread.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/chat-thread/chat-thread.tsx`
  - `components/ryan-ui/chat-thread/chat-thread.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/chat-thread.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Conversa entre pessoas ou atendimento: mensagens agrupadas por autor e por dia, reações, indicador de digitação e confirmação de leitura.
- Quando o estado de entrega da própria mensagem importa: enviando, enviada, entregue, lida ou falhou, com botão de repetir via `onRetry`.
- Quando a pessoa anexa arquivos pelo botão, colando ou arrastando para o campo de envio.

## Quando não usar

- Use [`chat-app`](chat-app.md) para conversa com assistente de IA, com resposta em fluxo, parar e regenerar.
- Use [`comment-thread`](comment-thread.md) para discussão presa a um conteúdo, com respostas aninhadas, menções, edição e resolver.
- Use [`message-bubble`](message-bubble.md) quando só precisa do balão, sem lista, rolagem nem campo de envio.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useEffect, useMemo, useState } from "react";
import { ChatThread, type ChatMessage, type ChatParticipant, type ChatDraft } from "@/components/ryan-ui/chat-thread/chat-thread";
import { avatar } from "@/components/ryan-ui/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 620 };

const participants: ChatParticipant[] = [
  { id: "me", name: "You" },
  { id: "hannah", name: "Hannah Walsh", avatar: avatar("hannah-walsh") },
  { id: "jordan", name: "Jordan Reyes", avatar: avatar("jordan-reyes") },
];

export default function ChatThreadDemo() {
  const base = useMemo(() => Date.now(), []);
  const min = 60_000;
  const messages = useMemo<ChatMessage[]>(() => [
    { id: "m1", authorId: "hannah", createdAt: base - 26 * 60 * min, text: "Hi! Our invoice for October shows two charges for the Team plan." },
    { id: "m2", authorId: "me", createdAt: base - 25 * 60 * min, text: "Thanks for flagging it, Hannah. Let me look at the billing record.", status: "read" },
    { id: "m3", authorId: "hannah", createdAt: base - 40 * min, text: "Any luck? Finance closes the books on Friday." },
    { id: "m4", authorId: "hannah", createdAt: base - 39 * min, text: "Here is the invoice in case it helps.", reactions: [{ emoji: "🙏", count: 1 }] },
    { id: "m5", authorId: "me", createdAt: base - 30 * min, text: "Found it: a seat was added twice during the migration. I refunded the duplicate charge.", status: "read", reactions: [{ emoji: "🎉", count: 1 }] },
    { id: "m6", authorId: "me", createdAt: base - 29 * min, text: "The refund shows up in 3 to 5 business days.", status: "delivered" },
  ], [base]);
  const [typing, setTyping] = useState<string[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => setTyping(["hannah"]), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const onSend = (_draft: ChatDraft) => {
    setTyping(["hannah"]);
    window.setTimeout(() => setTyping([]), 2500);
  };

  return (
    <Stack width={460} gap={3}>
      <div style={{ height: 520, border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <ChatThread participants={participants} currentUserId="me" defaultMessages={messages} typing={typing} readBy={{ hannah: "m5" }} onSend={onSend} placeholder="Reply to Hannah" label="Billing support conversation" />
      </div>
      <Caption>Send a message, hover one to react, or attach a file.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ChatComposer`

The message box on its own: autosizing text, attachments by button, paste, or drop, and a send button that morphs when there is something to send.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `onSend` (obrigatória) | `(draft: ChatDraft) => void` | — | — |
| `placeholder` | `string` | `"Message"` | — |
| `allowAttachments` | `boolean` | `true` | — |
| `accept` | `string` | — | — |
| `disabled` | `boolean` | — | — |
| `labels` | `ChatComposerLabels` | — | Words for localization. Leave out any key to keep its English default. |
| `className` | `string` | — | — |

### `ChatThread`

A chat or support thread: grouped messages with day separators, reactions, read receipts that glide to the latest read message, a typing indicator, and a composer. The list stays pinned to the newest message and offers a pill when new messages land out of view.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `participants` (obrigatória) | `ChatParticipant[]` | — | — |
| `currentUserId` (obrigatória) | `string` | — | — |
| `messages` | `ChatMessage[]` | — | Controlled messages, oldest first. Leave it out to let the thread keep its own list. |
| `defaultMessages` | `ChatMessage[]` | — | — |
| `typing` | `string[]` | `[]` | Participant ids currently typing. |
| `readBy` | `Record<string, string>` | — | The last message each participant has read, by participant id. Their avatar sits under that message and glides as it moves. |
| `onSend` | `(draft: ChatDraft) => void \| Promise<void>` | — | Called with the composer's text and files. Uncontrolled threads also append the message themselves. |
| `onReact` | `(messageId: string, emoji: string) => void` | — | — |
| `onRetry` | `(messageId: string) => void` | — | — |
| `reactions` | `string[]` | `DEFAULT_REACTIONS` | Emoji offered by the reaction picker. |
| `placeholder` | `string` | `"Message"` | — |
| `composer` | `boolean` | `true` | Show the composer. Defaults to true. |
| `allowAttachments` | `boolean` | `true` | — |
| `accept` | `string` | — | File types the attach button offers, as for `<input accept>`. |
| `groupWindow` | `number` | `5 * 60_000` | Messages from one person closer together than this, in ms, share a group. Defaults to five minutes. |
| `locale` | `string` | `"en-US"` | — |
| `label` | `string` | `"Conversation"` | Accessible name of the message log. |
| `labels` | `ChatThreadLabels` | — | Words for localization. Leave out any key to keep its English default. |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ChatMessageStatus` | `"sending" \| "sent" \| "delivered" \| "read" \| "failed"` |

#### `ChatParticipant`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `name` (obrigatória) | `string` | — |
| `avatar` | `string` | Portrait URL. Initials show when it is missing. |

#### `ChatAttachment`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `name` (obrigatória) | `string` | — |
| `kind` (obrigatória) | `"image" \| "file"` | — |
| `url` | `string` | — |
| `size` | `number` | Bytes. |
| `width` | `number` | Intrinsic image size, used to reserve space before the image loads. |
| `height` | `number` | — |
| `alt` | `string` | — |

#### `ChatReaction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `emoji` (obrigatória) | `string` | — |
| `count` (obrigatória) | `number` | — |
| `mine` | `boolean` | The current user reacted with this emoji. |

#### `ChatMessage`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `authorId` (obrigatória) | `string` | — |
| `text` | `string` | — |
| `createdAt` (obrigatória) | `Date \| string \| number` | — |
| `attachments` | `ChatAttachment[]` | — |
| `reactions` | `ChatReaction[]` | — |
| `status` | `"sending" \| "sent" \| "delivered" \| "read" \| "failed"` | Delivery state of the current user's own messages. |

#### `ChatDraft`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `text` (obrigatória) | `string` | — |
| `files` (obrigatória) | `File[]` | — |

#### `ChatComposerLabels`

Words the composer shows or announces. Each has an English default.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `send` | `string` | Accessible name of the send button. |
| `attach` | `string` | Accessible name of the attach button. |
| `attachments` | `string` | Accessible name of the list of files waiting to send. |
| `removeFile` | `(name: string) => string` | Accessible name of the button that takes a file back out. |

#### `ChatThreadLabels`

Every word the thread shows or announces. Each has an English default; words with a count or names are functions, so an app can apply its own plural rules.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `sending` | `string` | — |
| `sent` | `string` | — |
| `delivered` | `string` | — |
| `read` | `string` | — |
| `failed` | `string` | — |
| `retry` | `string` | — |
| `readBy` | `(names: string[]) => string` | Accessible name of the read receipts under a message. |
| `today` | `string` | Day separators for the last two days. Older days are formatted by `locale`. Defaults come from Intl for `locale`. |
| `yesterday` | `string` | — |
| `typing` | `(names: string[]) => string` | Screen reader announcement of who is typing. |
| `newMessages` | `(count: number) => string` | The pill when new messages land out of view. The count inside it rolls. |
| `jumpToLatest` | `string` | — |
| `unknownAuthor` | `string` | Name shown for a message whose author is not in `participants`. |
| `addReaction` | `string` | — |
| `reactions` | `string` | Accessible name of the reaction picker and of the reactions under a message. |
| `reactWith` | `(emoji: string) => string` | Accessible name of an emoji in the picker. |
| `reactionCount` | `(emoji: string, count: number, includesYou: boolean) => string` | Accessible name of a reaction under a message. |
| `...props` | `ChatComposerLabels` | Também aceita as props deste tipo. |

#### `ChatThreadHandle`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `scrollToBottom` (obrigatória) | `(smooth?: boolean) => void` | — |
| `focusComposer` (obrigatória) | `() => void` | — |

#### `ChatComposerHandle`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `focus` (obrigatória) | `() => void` | — |

### Outras exportações

- `formatBytes` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` | No campo de mensagem, envia o texto e os anexos. |
| `Shift + Enter` | Quebra a linha sem enviar. |
| `←` ou `→` | No seletor de reações, passam de um emoji a outro, dando a volta nas pontas. |
| `Esc` | Fecha o seletor de reações e devolve o foco ao botão que o abriu. |
| `Espaço` ou `Enter` | Numa reação sob a mensagem, alternam a sua participação; no seletor, escolhem o emoji em foco. |
| `Tab` | Percorre anexos, reações, a pílula de novas mensagens, anexar, campo e enviar; o botão de reagir de uma mensagem aparece quando o foco entra nela. |

## Acessibilidade

- A lista é um `role="log"` com `aria-live="polite"`, então mensagens novas são anunciadas; quem está digitando sai numa região `role="status"` separada.
- Reações são botões com `aria-pressed` e rótulo com a contagem; o seletor abre com o foco no primeiro emoji e o devolve ao fechar.
- Todo texto visível ou anunciado tem padrão em inglês e pode ser trocado por `labels`; informe também `label` (o nome da conversa) e `alt` nos anexos de imagem.

## Movimento

- Cada mensagem nova salta do seu lado com mola e, se você está no fim, a conversa sobe de onde estava em vez de pular.
- Reações surgem com escala e a contagem rola; os avatares de leitura deslizam até a última mensagem lida, e os pontos de digitação pulsam em sequência.
- Com “reduzir movimento”, tudo vira um esmaecer curto, os pontos ficam parados e a rolagem até o fim é instantânea.

## Comportamento responsivo

- A raiz tem `height: 100%` e rola por dentro: o pai precisa ter altura definida, senão a lista não rola nem fica presa ao fim.
- Os balões ocupam até 78% da largura (84% em telas de até 420 px), e em telas de toque o botão de reagir fica sempre visível.

## Desempenho

- Todas as mensagens ficam no DOM, sem virtualização: em históricos longos, carregue por páginas.
- As imagens usam `loading="lazy"`, e `width` e `height` no anexo reservam o espaço de uma imagem única antes de ela carregar.

## Notas para IA

- Com `messages` (controlado) você mesmo acrescenta a mensagem em `onSend` e atualiza as reações em `onReact`; com `defaultMessages` a lista cuida disso e os callbacks só avisam.
- `onSend` recebe `{ text, files }` com objetos `File` que você precisa enviar ao servidor; `currentUserId` define o lado dos balões, e cada `authorId` deve existir em `participants`.
- O texto das mensagens é puro, sem markdown; `ChatComposer` é exportado à parte, e o `ref` oferece `scrollToBottom()` e `focusComposer()`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/chat-thread · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
