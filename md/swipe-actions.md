# Swipe actions

> Revela as ações de uma linha ao deslizar, com as mesmas ações também num menu.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/swipe-actions
- Descrição original (inglês): Reveal row actions with a swipe, or from the same actions in a menu.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/swipe-actions.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/swipe-actions.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/swipe-actions.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/swipe-actions.json`. Caminho do registro, relativo ao endereço do site: `r/swipe-actions.json`.

- Pacotes npm: `@radix-ui/react-dropdown-menu`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/swipe-actions/swipe-actions.tsx`
  - `components/ryan-ui/swipe-actions/swipe-actions.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-dropdown-menu lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/swipe-actions.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Listas curtas para triagem rápida, sobretudo no toque, como uma caixa de entrada: arquivar, excluir, marcar como não lida.
- Quando cada linha precisa de duas ou três ações frequentes sem ocupar espaço fixo, com o menu de mais ações como caminho para teclado e leitor de tela.

## Quando não usar

- Use [`context-menu`](context-menu.md) ou [`dropdown-menu`](dropdown-menu.md) quando a lista é usada sobretudo com mouse e teclado: aqui o gesto é o atalho principal.
- Use [`reorderable-list`](reorderable-list.md) quando arrastar deve mudar a ordem dos itens.
- Evite em listas longas ou virtualizadas: cada linha mede a própria largura, empilha uma camada animada por ação e anima a altura ao entrar e sair.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Archive, MailOpen, Pin, Trash2 } from "lucide-react";
import SwipeActions, { SwipeActionsRow } from "@/components/ryan-ui/swipe-actions/swipe-actions";
import { avatar } from "@/components/ryan-ui/lib/media";
import { Caption, Stack, demoStage } from "./_kit";

const initial = [
  { id: 1, from: "Emma Collins", subject: "Updated mockups for the onboarding flow", time: "9:41", face: "emma-collins" as const },
  { id: 2, from: "Marcus Johnson", subject: "Re: API rate limits for the new plan", time: "9:12", face: "marcus-johnson" as const },
  { id: 3, from: "Olivia Bennett", subject: "Deploy window moved to Thursday", time: "Yesterday", face: "olivia-bennett" as const },
  { id: 4, from: "Hannah Walsh", subject: "Customer feedback roundup, week 45", time: "Yesterday", face: "hannah-walsh" as const },
];

export default function SwipeActionsDemo() {
  const [messages, setMessages] = useState(initial);
  const [last, setLast] = useState("None yet");
  const stage = demoStage();
  const remove = (id: number, what: string) => { setMessages(list => list.filter(message => message.id !== id)); setLast(what); };
  return (
    <Stack gap={4} width={440}>
      <SwipeActions label="Inbox">
        {messages.map(message => (
          <SwipeActionsRow
            key={message.id}
            label={message.subject}
            container={stage}
            leading={[{ label: "Unread", icon: <MailOpen size={18} aria-hidden="true" />, tone: "accent", keepRow: true, onSelect: () => setLast(`Marked "${message.subject}" unread`) }]}
            trailing={[
              { label: "Delete", icon: <Trash2 size={18} aria-hidden="true" />, tone: "danger", onSelect: () => remove(message.id, "Deleted") },
              { label: "Archive", icon: <Archive size={18} aria-hidden="true" />, tone: "neutral", onSelect: () => remove(message.id, "Archived") },
              { label: "Pin", icon: <Pin size={18} aria-hidden="true" />, tone: "accent", keepRow: true, onSelect: () => setLast("Pinned") },
            ]}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)" }}>
              <img src={avatar(message.face)} alt="" width={36} height={36} style={{ borderRadius: "50%", flex: "none" }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)" }}>
                  <strong style={{ fontSize: "var(--text-sm)" }}>{message.from}</strong>
                  <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>{message.time}</span>
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{message.subject}</div>
              </div>
            </div>
          </SwipeActionsRow>
        ))}
      </SwipeActions>
      <Caption>{messages.length === 0 ? "Inbox zero." : `Last action: ${last}. Drag a row sideways, or use its menu.`}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SwipeActions`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `children` (obrigatória) | `ReactNode` | — | — |
| `className` | `string` | — | — |

### `SwipeActionsRow`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | Names the row in its menu button, for example the message subject. |
| `leading` | `SwipeAction[]` | `[]` | — |
| `trailing` | `SwipeAction[]` | `[]` | — |
| `fullSwipe` | `boolean` | `true` | Lets a long swipe commit the outermost action without a tap. On by default. |
| `container` | `HTMLElement \| null` | — | Render the menu inside this element and limit collisions to it (used by the demo stages). |
| `children` (obrigatória) | `ReactNode` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

#### `SwipeAction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `icon` (obrigatória) | `ReactNode` | — |
| `tone` | `"neutral" \| "accent" \| "danger"` | Fill of the revealed action. Pair `danger` with a label that names the destructive result. |
| `onSelect` (obrigatória) | `() => void` | Runs for a full swipe, a tap on the revealed action, or the More actions menu. Remove the item here unless `keepRow` is set. |
| `keepRow` | `boolean` | The row springs home after the action instead of sliding away and collapsing, for actions such as Mark as unread. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Passa pelo botão de mais ações de cada linha; as ações reveladas pelo gesto ficam fora da ordem de tabulação. |
| `Enter` ou `Espaço` ou `↓` | No botão de mais ações, abrem o menu da linha, com as mesmas ações do gesto. |
| `↓` ou `↑` | No menu, percorrem as ações e dão a volta nas pontas; `Enter` ou `Espaço` executam a ação em foco. |
| `Esc` | Recolhe a linha que estiver aberta pelo gesto; com o menu da linha aberto, fecha o menu e devolve o foco ao botão. |

## Acessibilidade

- A lista é um `<ul role="list">` com `label` como nome; cada linha tem um botão com nome montado em inglês (“More actions for …”, a partir do `label` da linha) que abre um menu do Radix com as mesmas ações.
- As ações reveladas pelo gesto são `aria-hidden` e ficam fora do `Tab`: o menu é o caminho para teclado e leitor de tela, e quando a linha sai por ele, o foco vai para o botão da linha vizinha.
- Dê à linha um `label` que identifique o item, como o assunto da mensagem, e às ações com `tone="danger"` um rótulo que diga o resultado, como “Excluir”.

## Movimento

- A linha segue o dedo ou o mouse depois de 8 px na horizontal (movimento vertical fica com a rolagem) e resiste como elástico depois da última parada; ao soltar, a velocidade decide se ela abre, fecha ou executa.
- Um deslize longo, além de cerca de 56% da largura, arma a ação mais externa, que se estica sobre a linha inteira; a linha sai na direção do gesto e a lista fecha o espaço numa mola.
- Com “reduzir movimento”, a linha salta para cada parada, a remoção é só um esmaecer e o menu aparece sem crescer.

## Comportamento responsivo

- Cada ação ocupa 76 px quando a linha repousa aberta; em telas estreitas, prefira uma ou duas por lado.
- No toque, `touch-action: pan-y` deixa a rolagem vertical com a página; no mouse, a linha mostra o cursor de arrastar.

## Desempenho

- Cada linha mantém um `ResizeObserver` e uma camada animada por ação; o componente foi feito para listas curtas de triagem, não para milhares de linhas.

## Notas para IA

- Monte `<SwipeActions label="Caixa de entrada">` com um `<SwipeActionsRow key={id} label={assunto} leading={…} trailing={…}>` por item; a `key` estável permite a saída animada e o retorno num Desfazer.
- No `onSelect`, remova o item do estado (a linha sai e a lista fecha o espaço); para ações que mantêm o item, como marcar como não lida, use `keepRow`.
- A ação mais externa de cada lado (`leading[0]` e a última de `trailing`) é a que executa no deslize longo; `fullSwipe={false}` desliga esse atalho.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/swipe-actions · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
