# Notification stack

> Pilha de notificações que se abre em leque ao passar o mouse; dispense arrastando ou pelo botão e as demais se reorganizam com mola.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/notification-stack
- Descrição original (inglês): A pile of notification cards that fans out into a list on hover or focus; cards leave by swipe, close button or Delete, and the rest restack on a spring.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/notification-stack.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/notification-stack.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/notification-stack.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/notification-stack.json`. Caminho do registro, relativo ao endereço do site: `r/notification-stack.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/notification-stack/notification-stack.tsx`
  - `components/ryan-ui/blocks/notification-stack/notification-stack.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/notification-stack.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um punhado de avisos pendentes num painel ou dashboard, empilhados para ocupar pouco e abertos em lista quando a pessoa chega perto.
- Avisos que se resolvem dispensando: arrastar o cartão para o lado, botão de fechar ou tecla `Delete`.

## Quando não usar

- Use [`toast-stack`](toast-stack.md) para resultados passageiros que aparecem na borda da tela e somem sozinhos.
- Use [`notification-center`](notification-center.md) quando precisa de lido e não lido, filtro e ações em lote atrás de um sino.
- Use [`swipe-actions`](swipe-actions.md) quando o gesto lateral deve revelar ações numa linha de lista, e não remover o item.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import NotificationStackPreview from "@/components/ryan-ui/blocks/notification-stack/notification-stack";

export default function NotificationStackDemo() {
  return <NotificationStackPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `NotificationStack`

A pile of notifications that fans out into a list on hover or focus; cards leave by swipe, button, or Delete, and the rest close ranks on a spring.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `notifications` | `StackNotification[]` | — | Notifications, newest first. Pass it with `onNotificationsChange` to control the list. |
| `defaultNotifications` | `StackNotification[]` | `sampleNotifications` | Starting list when uncontrolled. Defaults to sample notifications. |
| `onNotificationsChange` | `(next: StackNotification[]) => void` | — | Called with the remaining list after a dismissal, a clear, or a restore. |
| `onDismiss` | `(id: string) => void` | — | Called with the id of each dismissed notification. |
| `expanded` | `boolean` | — | Keeps the stack fanned out. Hover and keyboard focus fan it out on their own. |
| `defaultExpanded` | `boolean` | `false` | Whether the stack starts fanned out when uncontrolled. |
| `onExpandedChange` | `(expanded: boolean) => void` | — | Called when the person pins or unpins the fanned out state. |
| `visible` | `number` | `3` | How many cards show in the collapsed pile. |
| `title` | `string` | `"Notifications"` | Heading above the stack. |
| `className` | `string` | — | Extra class for the stack. |

### `NotificationStackPreview`

Ready preview: the stack on a quiet stage, with room underneath to fan out.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `StackNotificationKind` | `"message" \| "billing" \| "review" \| "security" \| "team"` |

#### `StackNotification`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique id, used for dismissal. |
| `title` (obrigatória) | `string` | First line: who or what the notification is about. |
| `body` (obrigatória) | `string` | Message, clamped to two lines. |
| `time` (obrigatória) | `string` | Short relative time, such as "2m". |
| `kind` | `"message" \| "billing" \| "review" \| "security" \| "team"` | Picks the icon and its tone. Defaults to `message`. |
| `unread` | `boolean` | Shows the unread dot next to the title. |

### Outras exportações

- `sampleNotifications` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Ao entrar na pilha pelo teclado ela se abre em lista; cada cartão tem uma parada, no botão de dispensar. |
| `Delete` ou `Backspace` | Dispensam o cartão em foco e levam o foco ao cartão seguinte, ou ao botão “Bring them back” quando a pilha esvazia. |
| `Enter` ou `Espaço` | Acionam o botão em foco: dispensar um cartão, fixar a lista aberta (“Show all”) ou limpar tudo (“Clear all”). |

## Acessibilidade

- Com a pilha fechada, os cartões de trás ficam com `aria-hidden` e fora da ordem de Tab; o botão “Show all” fixa a lista aberta e expõe `aria-expanded`.
- Um `role="status"` escondido anuncia quantos avisos restam, cada botão de fechar tem `aria-label` com o título do cartão e o ponto de não lido traz o texto “Unread” para leitor de tela.
- Arrastar não é o único caminho: o botão de fechar e `Delete` fazem o mesmo, e em telas de toque um toque na pilha a abre.

## Movimento

- Fechada, cada cartão de trás mostra 10 px e encolhe 5%; com mouse por cima, foco de teclado ou lista fixada, os cartões descem para uma lista numa mola e a altura do contêiner acompanha.
- Um cartão dispensado desliza para o lado do arrasto e some, e os demais sobem para fechar a fila numa mola; arrastar além de 110 px ou soltar acima de 650 px/s confirma a saída.
- Com “reduzir movimento” ligado, o arrasto é desligado, os cartões só esmaecem ao sair e as posições trocam na hora.

## Comportamento responsivo

- A largura é `min(25rem, 100%)` e o texto de cada cartão é cortado em duas linhas, o que mantém todos com a mesma altura.
- A lista aberta cresce para baixo no fluxo da página e empurra o que vem depois; `touch-action: pan-y` deixa a rolagem vertical passar enquanto o arrasto lateral dispensa.

## Desempenho

- Todos os avisos ficam montados, mesmo os que não aparecem na pilha, cada um com um `ResizeObserver` e arrasto próprio; o bloco foi pensado para poucos itens, não para centenas.

## Notas para IA

- Importe o componente nomeado `NotificationStack`; o export padrão é o preview com avisos de exemplo.
- Controle com `notifications` e `onNotificationsChange` (lista do mais novo para o mais antigo) ou use `defaultNotifications`; `onDismiss(id)` dispara por cartão, inclusive para cada um em “Clear all”.
- No modo controlado passe também `defaultNotifications`: o botão “Bring them back” do estado vazio devolve essa lista e, sem ela, entrega os avisos de exemplo ao seu `onNotificationsChange`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/notification-stack · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
