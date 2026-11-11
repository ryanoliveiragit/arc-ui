# Chat app

> Tela de chat completa: lista de conversas, respostas simuladas que chegam aos poucos e caixa de prompt.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/chat-app
- Descrição original (inglês): A complete chat screen: a conversation list with a gliding active marker, a thread whose simulated replies think, stream in and can be stopped, copied or regenerated, and a growing prompt box.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/chat-app.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/chat-app.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/chat-app.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/chat-app.json`. Caminho do registro, relativo ao endereço do site: `r/chat-app.json`.

- Pacotes npm: `motion`, `lucide-react`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Streaming response](streaming-response.md), [Loading states](loading-states.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/chat-app/chat-app.tsx`
  - `components/ryan-ui/blocks/chat-app/chat-app.module.css`
  - `components/ryan-ui/blocks/chat-app/chat-app-data.ts`
  - `components/ryan-ui/lib/use-copy-feedback.ts`
  - `components/ryan-ui/lib/media.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/chat-app.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Protótipo ou demonstração de um produto de chat com IA: lista de conversas e respostas que “pensam”, chegam palavra por palavra e podem ser paradas, copiadas ou refeitas.
- Testes de usabilidade, tours guiados ou páginas de apresentação em que respostas prontas (`reply`) bastam e não há servidor.
- Telas que precisam ir do desktop ao celular: abaixo de 760px de largura, a lista de conversas vira uma gaveta.

## Quando não usar

- Use [`chat-thread`](chat-thread.md) para conversa entre pessoas, com reações, confirmação de leitura e anexos.
- Use [`ai-sidebar`](ai-sidebar.md) quando o assistente fica num painel ao lado da página, e não numa tela própria.
- Evite ligar direto a um modelo com streaming: `reply` é síncrona e devolve o texto inteiro; para respostas reais, combine [`prompt-input`](prompt-input.md), [`message`](message.md) e [`message-scroller`](message-scroller.md) ou edite o bloco.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import ChatAppPreview from "@/components/ryan-ui/blocks/chat-app/chat-app";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "fill", frame: true, height: 680 };

export default function ChatAppDemo() {
  return <ChatAppPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ChatApp`

A complete chat screen: a list of conversations, the thread of the open one and a prompt box. Replies are simulated in the browser: a short "thinking" beat, then the answer streams in word by word and can be stopped, copied or regenerated. In a narrow container the conversation list turns into a drawer.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `conversations` | `ChatConversation[]` | `sampleConversations` | Conversations the screen starts with. The first one is open. |
| `suggestions` | `ChatSuggestion[]` | `sampleSuggestions` | Prompt ideas shown in an empty conversation. |
| `reply` | `(prompt: string, attempt: number) => string` | `sampleReply` | Produces the simulated reply to a prompt. `attempt` grows by one on every regenerate. Replace it with your own canned answers. |
| `onSend` | `(prompt: string, conversationId: string) => void` | — | Called when the person sends a prompt, with the conversation it went to. |
| `assistantName` | `string` | `"Assistant"` | Name of the assistant, used in labels. |
| `user` | `ChatUser` | `sampleUser` | The signed-in person shown at the foot of the conversation list. |
| `speed` | `number` | `26` | Words per second of the streamed replies. |
| `height` | `number \| string` | — | Height of the screen, as a CSS length or a number of pixels. Defaults to the full viewport height. |
| `className` | `string` | — | Class name added to the root element. |

### `ChatAppPreview`

Ready-made preview with sample conversations.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

#### `ChatMessage`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable id of the message. |
| `role` (obrigatória) | `"user" \| "assistant"` | Who wrote it. |
| `text` (obrigatória) | `string` | The message text. Blank lines split paragraphs. |
| `state` (obrigatória) | `"thinking" \| "streaming" \| "done" \| "stopped"` | Where an assistant reply is: waiting to start, arriving, finished, or stopped early. User messages are always "done". |

#### `ChatConversation`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable id of the conversation. |
| `title` (obrigatória) | `string` | Title shown in the list and above the thread. |
| `updated` (obrigatória) | `string` | Short label of when it last changed: "Now", "2h", "Yesterday". |
| `messages` (obrigatória) | `ChatMessage[]` | Messages, oldest first. |

#### `ChatSuggestion`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `title` (obrigatória) | `string` | Short heading of the card. |
| `prompt` (obrigatória) | `string` | The prompt the card sends. |

#### `ChatUser`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` (obrigatória) | `string` | Name shown at the foot of the conversation list. |
| `detail` | `string` | Second line under the name, such as a plan or an email. |
| `avatar` | `string` | Avatar image address. |

### Outras exportações

- `sampleUser` (valor)
- `sampleConversations` (valor)
- `sampleSuggestions` (valor)
- `sampleReply` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` | Na caixa de mensagem, envia o texto; enquanto uma resposta chega, não faz nada (o botão ao lado vira o de parar). |
| `Shift + Enter` | Quebra a linha; a caixa cresce até 168px e depois rola. |
| `Esc` | Na largura estreita, fecha a gaveta de conversas e devolve o foco ao botão que a abriu. |
| `Enter` ou `Espaço` | Nos botões, abrem uma conversa, criam outra, enviam uma sugestão ou param, copiam e refazem a resposta. |

## Acessibilidade

- As mensagens ficam numa lista `ol`, cada fala começa com “You:” ou com `assistantName` só para o leitor de tela, e uma região `role="status"` avisa quando o assistente está respondendo.
- Na largura estreita, a gaveta recebe `inert` quando fechada e o resto da tela quando aberta; abrir leva o foco a “New chat” e fechar o devolve ao botão de conversas.
- A conversa aberta tem `aria-current`, o botão de envio passa a se chamar “Stop the reply” durante a resposta e o de copiar vira “Copied”; os textos fixos estão em inglês.

## Movimento

- As mensagens sobem com uma mola suave; a resposta “pensa” por cerca de um segundo com um brilho no texto e depois chega palavra por palavra na velocidade de `speed`.
- O marcador da conversa ativa desliza entre os itens, a gaveta entra de lado com uma mola sem ultrapassagem e o ícone de enviar gira até virar o de parar.
- Com “reduzir movimento” ligado, molas, deslizes e pressões são desligados e a resposta aparece inteira depois do intervalo de “pensando”, sem o efeito palavra por palavra.

## Comportamento responsivo

- Abaixo de 760px de largura do próprio bloco (medida por `ResizeObserver`), a lista de conversas vira uma gaveta sobre a conversa, com fundo escurecido e um botão no cabeçalho.
- Ocupa `100dvh` por padrão, com mínimo de 30rem; dentro de uma página ou de um quadro, passe `height` para não empurrar o resto do layout.

## Desempenho

- Usa dois `ResizeObserver` (largura do bloco e altura da conversa, para seguir a resposta até o fim) e um temporizador por resposta; todas as mensagens da conversa aberta ficam no DOM.

## Notas para IA

- Importe `ChatApp` pelo nome (a exportação padrão é a prévia); `conversations` só define o estado inicial: depois disso, conversas e mensagens vivem dentro do bloco.
- As respostas são simuladas: `reply(prompt, attempt)` devolve o texto (linhas em branco separam parágrafos) e `onSend` avisa cada envio; o selo “Simulated replies” do cabeçalho é fixo no código.
- Depende de `streaming-response` e `loading-states`, instalados junto; passe `user` para trocar a pessoa de exemplo no pé da lista e `assistantName` para os rótulos.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/chat-app · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
