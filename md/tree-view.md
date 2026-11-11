# Tree view

> Árvore de navegação para pastas e conteúdo aninhado, com suporte completo ao teclado.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/tree-view
- Descrição original (inglês): Navigate nested folders and structured content.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tree-view.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tree-view.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tree-view.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tree-view.json`. Caminho do registro, relativo ao endereço do site: `r/tree-view.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/tree-view/tree-view.tsx`
  - `components/ryan-ui/tree-view/tree-view.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/tree-view.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Navegar em pastas e conteúdo aninhado num painel lateral: arquivos de um projeto, seções de uma documentação, categorias de um catálogo.
- Quando cada nó precisa só de nome e ícone, e a pessoa abre e fecha ramos para chegar a um item.
- Quando se espera o teclado do padrão de árvore: setas para mover, abrir e fechar, e Enter para escolher.

## Quando não usar

- Use [`tree-table`](tree-table.md) quando cada nó tem colunas de dados, seleção múltipla ou filhos carregados sob demanda.
- Use [`file-tree`](file-tree.md) para um explorador de arquivos com marcadores de alteração e busca por digitação.
- Use [`animated-sidebar`](animated-sidebar.md) para o menu de navegação de um aplicativo, com grupos que abrem e um trilho de ícones recolhido.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { TreeView, type TreeNode } from "@/components/ryan-ui/tree-view/tree-view";
import { Caption, Stack } from "./_kit";

const nodes: TreeNode[] = [
  { id: "src", label: "src", children: [
    { id: "components", label: "components", children: [
      { id: "button", label: "button.tsx" },
      { id: "dialog", label: "dialog.tsx" },
      { id: "tabs", label: "tabs.tsx" },
    ] },
    { id: "hooks", label: "hooks", children: [{ id: "debounce", label: "use-debounced-value.ts" }, { id: "media", label: "use-media-query.ts" }] },
    { id: "app", label: "App.tsx" },
    { id: "main", label: "main.tsx" },
  ] },
  { id: "public", label: "public", children: [{ id: "favicon", label: "favicon.svg" }, { id: "robots", label: "robots.txt" }] },
  { id: "pkg", label: "package.json" },
  { id: "readme", label: "README.md" },
];

export default function TreeViewDemo() {
  const [selected, setSelected] = useState("button.tsx");
  return (
    <Stack width={320} gap={3}>
      <TreeView nodes={nodes} defaultExpandedIds={["src", "components"]} onSelect={n => setSelected(n.label)} aria-label="Project files" />
      <Caption>Selected: {selected}. Arrow keys move, Right and Left open and close.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `TreeView`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `nodes` (obrigatória) | `TreeNode[]` | — | — |
| `defaultExpandedIds` | `string[]` | `[]` | — |
| `expandedIds` | `string[]` | — | — |
| `onExpandedChange` | `(expandedIds: string[]) => void` | — | — |
| `onSelect` | `(node: TreeNode) => void` | — | — |
| `aria-label` | `string` | — | — |

### Tipos exportados

#### `TreeNode`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `children` | `TreeNode[]` | — |
| `icon` | `ReactNode` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Move o foco para o item visível anterior ou seguinte. |
| `Home` ou `End` | Vai ao primeiro ou ao último item visível. |
| `→` | Abre a pasta fechada; numa pasta aberta, leva o foco ao primeiro filho. |
| `←` | Fecha a pasta aberta; num arquivo ou numa pasta fechada, leva o foco à pasta pai. |
| `Enter` ou `Espaço` | Seleciona o item e chama `onSelect`; numa pasta, também abre ou fecha. |
| `Tab` | Entra na árvore pelo último item focado e sai dela; os outros itens ficam fora da ordem de `Tab`. |

## Acessibilidade

- É um `role="tree"` de seleção única em que cada linha é um `<button>` com `role="treeitem"`, `aria-level`, `aria-posinset`, `aria-setsize`, `aria-selected` e, nas pastas, `aria-expanded`.
- O foco é itinerante: só um item fica na ordem de `Tab`, e se ele some porque a pasta fechou, a parada passa ao primeiro item visível.
- O nome padrão é `File tree`, em inglês: passe `aria-label` descrevendo o conteúdo; os ícones são decorativos (`aria-hidden`).

## Movimento

- Ao abrir uma pasta, o espaço se abre numa só mola e os filhos novos entram em sequência, deslizando da esquerda; ao fechar, recolhem em altura e somem rápido.
- O fundo da seleção desliza de um item a outro, a seta gira 90°, o ícone troca entre pasta fechada e aberta e a guia de recuo cresce de cima para baixo.
- Com “reduzir movimento” ligado, os itens aparecem e somem sem altura nem deslocamento, a seleção salta e os ícones trocam na hora.

## Comportamento responsivo

- Cada nível recua 18 px e o nome é cortado com reticências, então árvores profundas num painel estreito deixam pouco espaço para o texto.

## Desempenho

- Todos os itens das pastas abertas ficam no DOM, cada um com animação de entrada, saída e posição; pastas com centenas de itens devem começar fechadas.

## Notas para IA

- Passe `nodes` (`{ id, label, children?, icon? }`) e `aria-label`; um nó com `children` não vazio vira pasta, e o ícone dos arquivos ganha cor pela extensão (`.ts`, `.tsx`, `.css`, `.md`, `.json`).
- A abertura pode ser controlada (`expandedIds` com `onExpandedChange`) ou não (`defaultExpandedIds`); a seleção é sempre interna, começa vazia e não pode ser definida por prop.
- Clicar numa pasta também a seleciona e chama `onSelect`: se só arquivos devem abrir conteúdo, confira `node.children` no handler.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/tree-view · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
