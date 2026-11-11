# Overflow actions

> Barra de ações que mede a própria largura e guarda no menu “mais” o que não cabe, animando a cada ajuste.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/overflow-actions
- Descrição original (inglês): A toolbar that measures its width and moves the actions that do not fit into a "more" menu, with buttons that scale out and a menu button that glides into place.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/overflow-actions.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/overflow-actions.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/overflow-actions.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/overflow-actions.json`. Caminho do registro, relativo ao endereço do site: `r/overflow-actions.json`.

- Pacotes npm: `@radix-ui/react-dropdown-menu`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/overflow-actions/overflow-actions.tsx`
  - `components/ryan-ui/blocks/overflow-actions/overflow-actions.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-dropdown-menu lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/overflow-actions.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Barra de ferramentas cuja largura muda (painéis redimensionáveis, colunas estreitas, telas pequenas) e que tem mais ações do que cabem.
- Quando todas as ações precisam continuar alcançáveis: as que não cabem vão para o menu “mais”, começando pelas últimas da lista.

## Quando não usar

- Use [`button-group`](button-group.md) quando são poucas ações relacionadas que sempre cabem.
- Use [`dropdown-menu`](dropdown-menu.md) quando as ações secundárias podem ficar num menu desde o início.
- Use [`toggle-group`](toggle-group.md) para alternadores de formatação que cabem sempre e não precisam de menu.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import OverflowActionsPreview from "@/components/ryan-ui/blocks/overflow-actions/overflow-actions";

export default function OverflowActionsDemo() {
  return <OverflowActionsPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `OverflowActions`

A toolbar that always fits. It measures every action once in a hidden row, then shows as many as the current width allows and moves the rest into a "more" menu. Buttons leave and return with a short scale, and the "more" button glides to its new place on a layout spring.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `actions` (obrigatória) | `OverflowAction[]` | — | Actions in priority order: the last ones move into the menu first. |
| `label` | `string` | `"Actions"` | Accessible name of the toolbar. |
| `moreLabel` | `string` | `"More actions"` | Accessible name of the "more" button. |
| `onAction` | `(id: string) => void` | — | Called with the action id whenever an action is used. |
| `onOverflowChange` | `(hiddenIds: string[]) => void` | — | Called when the set of actions that moved into the menu changes. |
| `className` | `string` | — | Extra class for the toolbar root. |

### `OverflowActionsPreview`

Ready preview: a small editor whose toolbar you can resize with the handle, the arrow keys or the width presets.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

#### `OverflowAction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable key; also passed to `onAction`. |
| `label` (obrigatória) | `string` | Visible text in the bar and in the menu. |
| `icon` | `ReactNode` | Icon shown before the label. |
| `pressed` | `boolean` | Marks a toggle as on (`aria-pressed` in the bar, a check state in the menu). Leave undefined for plain actions. |
| `disabled` | `boolean` | Disabled actions stay in place but cannot be used. |
| `onSelect` | `() => void` | Runs when the action is used, from the bar or from the menu. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `←` | Movem o foco entre as ações visíveis e o botão “mais”, dando a volta nas pontas e pulando as desativadas. |
| `Home` ou `End` | Levam o foco à primeira ou à última parada da barra. |
| `Tab` | A barra tem uma única parada de Tab; as setas fazem o resto. |
| `Enter` ou `Espaço` | Acionam a ação em foco ou abrem o menu “mais”. |
| `↓` ou `↑` | No menu “mais”, movem entre os itens; `↓` no botão também abre o menu. |
| `Esc` | Fecha o menu e devolve o foco ao botão “mais”. |

## Acessibilidade

- A barra é um `role="toolbar"` com `aria-label` vindo de `label` e roving tabindex; ações com `pressed` expõem `aria-pressed`.
- O botão “mais” recebe `moreLabel` com a contagem no `aria-label`, e no menu uma ação ligada ganha um ponto com o texto “On” para leitor de tela.
- A fileira de medição, com cópias de todas as ações, fica com `aria-hidden` e `inert`.

## Movimento

- As ações que deixam de caber encolhem para 80% e esmaecem, e as que voltam fazem o caminho inverso; o botão “mais” desliza até a nova posição numa mola de layout.
- O número no botão “mais” rola na vertical quando a contagem muda, e o menu abre com os itens em cascata de 28 ms.
- Com “reduzir movimento” ligado, entradas, saídas e deslocamentos acontecem na hora e as animações do menu são removidas.

## Comportamento responsivo

- A largura que conta é a do próprio componente, que ocupa 100% do pai: ele mede todas as ações numa fileira oculta e mostra quantas couberem, sem nunca quebrar linha.
- Quando não cabe nenhuma ação, sobra só o botão “mais”, com todas dentro do menu.

## Desempenho

- Um `ResizeObserver` observa a raiz e a fileira de medição e refaz a conta a cada mudança de largura, rótulo ou fonte; cada ação é renderizada duas vezes por causa dessa cópia.

## Notas para IA

- Importe o componente nomeado `OverflowActions`; o export padrão é o preview de um editor com alça de redimensionar.
- Ordene `actions` por prioridade, porque as últimas vão primeiro para o menu, e dê ao contêiner uma largura real (em flex, `min-width: 0`).
- `pressed` é controlado por você: guarde o estado e alterne em `onSelect` ou em `onAction(id)`; `onOverflowChange(ids)` avisa quais ações estão no menu.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/overflow-actions · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
