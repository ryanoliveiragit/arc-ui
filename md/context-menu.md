# Context menu

> Ações secundárias ao alcance do clique direito, junto do objeto selecionado.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/context-menu
- Descrição original (inglês): Secondary actions kept close to the selected object.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/context-menu.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/context-menu.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/context-menu.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/context-menu.json`. Caminho do registro, relativo ao endereço do site: `r/context-menu.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/context-menu/context-menu.tsx`
  - `components/ryan-ui/context-menu/context-menu.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/context-menu.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Ações secundárias sobre um objeto que a pessoa já está vendo, como um arquivo, um cartão ou um projeto, abertas com o botão direito no próprio objeto.
- Superfícies que não devem exibir um botão de menu, mas cujas ações precisam continuar alcançáveis pelo teclado (`Shift + F10` ou a tecla de menu).

## Quando não usar

- Use [`dropdown-menu`](dropdown-menu.md) quando as ações precisam de um gatilho visível ou de separadores entre grupos; este menu é uma lista plana aberta sobre o objeto.
- Evite em objetos que já respondem a clique, como links, cartões que abrem ou linhas selecionáveis: um clique ou toque simples em qualquer ponto do alvo também abre o menu.
- Use [`swipe-actions`](swipe-actions.md) quando as ações de cada linha de uma lista devem aparecer com um gesto de deslizar no toque.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Copy, Download, FolderInput, Pencil, Pin, Trash2 } from "lucide-react";
import ContextMenu from "@/components/ryan-ui/context-menu/context-menu";
import { Caption, Stack, Surface } from "./_kit";

export default function ContextMenuDemo() {
  const [last, setLast] = useState("Nothing yet");
  const [pinned, setPinned] = useState(false);
  const act = (name: string) => () => setLast(name);
  return (
    <Stack gap={4} align="center" width={420}>
      <ContextMenu
        label="Q3 roadmap actions"
        items={[
          { id: "rename", label: "Rename", icon: <Pencil size={15} aria-hidden="true" />, onSelect: act("Rename") },
          { id: "copy", label: "Copy link", icon: <Copy size={15} aria-hidden="true" />, onSelect: act("Copy link") },
          { id: "pin", label: "Pin to top", icon: <Pin size={15} aria-hidden="true" />, checked: pinned, onSelect: () => { setPinned(value => !value); setLast(pinned ? "Unpinned" : "Pinned"); } },
          { id: "move", label: "Move to folder", icon: <FolderInput size={15} aria-hidden="true" />, onSelect: act("Move to folder") },
          { id: "download", label: "Download", icon: <Download size={15} aria-hidden="true" />, disabled: true },
          { id: "delete", label: "Delete", icon: <Trash2 size={15} aria-hidden="true" />, destructive: true, onSelect: act("Delete") },
        ]}
      >
        <Surface padding={8} style={{ textAlign: "center" }}>
          <strong style={{ display: "block", fontSize: "var(--text-xl)" }}>Q3 roadmap.pdf</strong>
          <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>Right-click, or long-press on touch</span>
        </Surface>
      </ContextMenu>
      <Caption>Last choice: {last}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ContextMenu`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactNode` | — | — |
| `items` (obrigatória) | `ContextMenuItem[]` | — | — |
| `label` | `string` | `"Context menu"` | — |

### Tipos exportados

#### `ContextMenuItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `icon` | `ReactNode` | — |
| `onSelect` | `() => void` | — |
| `disabled` | `boolean` | — |
| `destructive` | `boolean` | — |
| `checked` | `boolean` | — |

### Outras exportações

- `contextMenuExampleItems` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Shift + F10` ou `Menu` | Com o foco no alvo, abrem o menu logo abaixo dele, com o foco no primeiro item habilitado. |
| `↓` ou `↑` | Percorrem os itens habilitados e dão a volta nas pontas. |
| `Home` ou `End` | Vão para o primeiro e o último item habilitado. |
| `Enter` ou `Espaço` | Escolhem o item em foco, fecham o menu e devolvem o foco ao alvo. |
| `Esc` | Com o foco no menu, fecha e devolve o foco ao alvo. |

## Acessibilidade

- O alvo é um `<div>` com `tabIndex=0`, `aria-haspopup="menu"`, `aria-expanded` e `aria-label`; o menu é `role="menu"`, com itens `role="menuitem"`, e recebe o mesmo `label` (padrão em inglês, “Context menu”).
- Ao abrir, o foco vai para o primeiro item habilitado, mas o menu não prende o foco: `Tab` sai dele sem fechá-lo e, com o foco fora, `Esc` não o fecha mais (só um toque fora ou a rolagem).
- `checked` não vira `aria-checked` e só desenha um visto quando o item não tem `icon`; o estado não chega ao leitor de tela.

## Movimento

- O menu cresce a partir do ponto do clique (a origem fica no ponteiro mesmo quando o menu é empurrado para dentro da tela) numa mola curta, e sai esmaecendo mais rápido do que entrou.
- Os itens entram em sequência, 35 ms entre um e outro, e um realce único desliza entre as linhas sob o ponteiro; com o teclado, ele salta direto para o item em foco.
- Com “reduzir movimento”, o menu só esmaece, os itens aparecem sem sequência e o realce não desliza.

## Comportamento responsivo

- O menu usa `position: fixed` e é empurrado para ficar a 8 px das bordas da janela; acima de 300 px de altura (ou da altura da tela) ele rola por dentro, e rótulos longos terminam em reticências.
- Ele fecha quando a página rola ou a janela muda de tamanho, em vez de acompanhar o alvo.

## Notas para IA

- Envolva o objeto: `<ContextMenu label="Ações do arquivo" items={itens}>…</ContextMenu>`; o alvo vira um `<div>` em bloco, e cada item precisa de `id` e `label`, com a ação em `onSelect`.
- Dê um `icon` a todo item: sem ele aparece um ícone de reticências, e `checked` só troca esse ícone por um visto; `destructive` pinta o item com a cor de perigo.
- Não ponha links ou botões dentro do alvo esperando que funcionem sozinhos: o clique neles sobe até o alvo e também abre o menu.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/context-menu · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
