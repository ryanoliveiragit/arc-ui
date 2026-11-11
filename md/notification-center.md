# Notification center

> Central de notificações com estado de lido, avisos agrupados e abertura animada.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/notification-center
- Descrição original (inglês): A home for updates with read state, grouped information, and animated disclosure.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/notification-center.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/notification-center.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/notification-center.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/notification-center.json`. Caminho do registro, relativo ao endereço do site: `r/notification-center.json`.

- Pacotes npm: `@radix-ui/react-popover`, `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Avatar](avatar.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/notification-center/notification-center.tsx`
  - `components/ryan-ui/notification-center/notification-center.module.css`
  - `components/ryan-ui/avatar/avatar.tsx`
  - `components/ryan-ui/avatar/avatar.module.css`
  - `components/ryan-ui/lib/ryan-provider.tsx`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-popover lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/notification-center.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Caixa de avisos atrás de um sino no cabeçalho de um app, com estado de lido e não lido e contagem no selo.
- Quando a pessoa precisa triar: abrir o detalhe de um aviso, marcar como lido, dispensar, marcar todos como lidos ou limpar os lidos.

## Quando não usar

- Use [`toast`](toast.md) ou [`toast-stack`](toast-stack.md) para o retorno imediato de uma ação que a pessoa acabou de fazer.
- Use [`notification-stack`](notification-stack.md) quando os avisos ficam visíveis na página como uma pilha de cartões que se dispensa um a um, sem estado de leitura.
- Use [`timeline`](timeline.md) para um histórico de atividade em página inteira, agrupado por dia.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { NotificationCenter, type NotificationItem } from "@/components/ryan-ui/notification-center/notification-center";
import { avatar } from "@/components/ryan-ui/lib/media";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "center", height: 560 };

const notifications: NotificationItem[] = [
  { id: "n1", title: "Emma Collins commented on Checkout redesign", description: "The review step looks great. Can we show the total while editing?", time: "2m ago", tone: "info", actor: { name: "Emma Collins", photo: avatar("emma-collins") } },
  { id: "n2", title: "Deploy finished", description: "Production is live on version 4.12.0.", time: "18m ago", tone: "success" },
  { id: "n3", title: "Storage is 90% full", description: "Archive old exports or upgrade your workspace storage.", time: "1h ago", tone: "warning" },
  { id: "n4", title: "Marcus Johnson invited you to Mobile app", description: "You can now view and edit the board.", time: "3h ago", read: true, tone: "info", actor: { name: "Marcus Johnson", photo: avatar("marcus-johnson") } },
  { id: "n5", title: "Weekly summary is ready", description: "42 issues closed, 9 opened.", time: "Yesterday", read: true },
];

export default function NotificationCenterDemo() {
  return <NotificationCenter notifications={notifications} />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `NotificationCenter`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `notifications` (obrigatória) | `NotificationItem[]` | — | — |
| `label` | `string` | `"Notifications"` | — |
| `onReadChange` | `(notification: NotificationItem, read: boolean) => void` | — | — |
| `onDismiss` | `(notification: NotificationItem) => void` | — | — |
| `open` | `boolean` | — | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `avoidCollisions` | `boolean` | `true` | — |

### Tipos exportados

#### `NotificationItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `title` (obrigatória) | `string` | — |
| `description` | `string` | — |
| `time` (obrigatória) | `string` | — |
| `read` | `boolean` | — |
| `tone` | `"info" \| "success" \| "warning"` | — |
| `actor` | `{ name: string; photo: string }` | A local portrait asset for person-generated updates. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No sino, abrem ou fecham o painel; numa linha, mostram ou escondem o detalhe com as ações. |
| `Esc` | Fecha o painel e devolve o foco ao sino. |
| `Tab` ou `Shift + Tab` | Percorrem os controles do painel: fechar, filtros “All” e “Unread”, linhas e ações. |

## Acessibilidade

- É um popover Radix: o sino recebe `aria-expanded` do primitivo e um `aria-label` com `label` mais a contagem de não lidos; o painel leva `aria-label` e o resumo é `aria-live="polite"`.
- Cada linha é um botão com `aria-expanded` e um nome que junta título, estado de não lido e a ação de mostrar ou esconder detalhes; os filtros usam `aria-pressed`.
- O foco é reposicionado depois de cada ação: ao dispensar vai para a linha vizinha, e depois das ações em lote vai para os botões de filtro.

## Movimento

- O painel cresce a partir do sino, que inclina 12° enquanto está aberto; as linhas entram em cascata de 35 ms e fecham a própria altura numa mola ao sair, em sequência nas ações em lote.
- As contagens rolam como um odômetro (número maior sobe de baixo, menor desce de cima), o destaque do filtro desliza entre “All” e “Unread” e o botão de marcar como lido anima a largura ao trocar de rótulo.
- Com “reduzir movimento” ligado, as animações CSS são removidas e as trocas viram um esmaecer curto ou acontecem na hora.

## Comportamento responsivo

- O painel tem largura `min(424px, 100vw - 24px)` e altura máxima `min(590px, 100vh - 24px)`; a lista rola por dentro, com a barra de rolagem escondida.
- Até 380 px de viewport os espaçamentos encolhem e “Mark all read” perde o texto, ficando só o ícone.

## Desempenho

- Todas as notificações são renderizadas de uma vez, cada linha com animação de altura e sem virtualização; mantenha a lista na casa das dezenas.

## Notas para IA

- `notifications` é só o estado inicial (vai para um `useState`): mudanças posteriores na prop são ignoradas, então para injetar avisos novos remonte com outra `key`.
- Persista com `onReadChange(notification, read)` e `onDismiss(notification)`, chamados uma vez por item também nas ações em lote; `time` é um texto pronto, o componente não formata datas.
- Importe de `@/components/ryan-ui/notification-center/notification-center` (não fica em `blocks/`); ele já desenha o sino, depende de `avatar` e aceita `open` com `onOpenChange`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/notification-center · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
