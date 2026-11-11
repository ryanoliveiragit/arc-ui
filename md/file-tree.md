# File tree

> Árvore de arquivos com pastas que abrem suavemente, ícones por tipo, seleção e navegação completa pelo teclado.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/file-tree
- Descrição original (inglês): A file explorer tree whose folders open on a height spring, with file-type icons, selection, change markers and full keyboard navigation with type-ahead.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-tree.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-tree.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-tree.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-tree.json`. Caminho do registro, relativo ao endereço do site: `r/file-tree.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/file-tree/file-tree.tsx`
  - `components/ryan-ui/file-tree/file-tree.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/file-tree.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Explorador de arquivos de um projeto num editor, revisor de código ou painel de repositório.
- Lista de arquivos alterados, com a marca de versão de cada um (`status`: M, A, D, U) e o ponto que sinaliza pastas com mudanças dentro.
- Árvores em que a pessoa navega só pelo teclado e pula para um arquivo digitando o começo do nome.

## Quando não usar

- Use [`tree-view`](tree-view.md) para hierarquias que não são arquivos (categorias, seções), sem ícone por extensão nem marcas de alteração.
- Use [`tree-table`](tree-table.md) quando cada linha tem colunas, seleção com caixas ou filhos carregados sob demanda.
- Use [`animated-sidebar`](animated-sidebar.md) para a navegação do app com grupos aninhados; esta árvore seleciona arquivos, não troca de página.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { FileTree } from "@/components/ryan-ui/file-tree/file-tree";
import type { FileTreeNode } from "@/components/ryan-ui/file-tree/file-tree";
import { Caption, Stack, Surface } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

const project: FileTreeNode[] = [
  { name: "src", children: [
    { name: "components", children: [
      { name: "checkout", children: [
        { name: "checkout-form.tsx", status: "modified" },
        { name: "checkout-form.module.css" },
        { name: "order-summary.tsx", status: "added" },
      ] },
      { name: "header", children: [
        { name: "header.tsx" },
        { name: "header.module.css" },
        { name: "logo.svg" },
      ] },
    ] },
    { name: "hooks", children: [
      { name: "use-cart.ts", status: "modified" },
      { name: "use-media-query.ts" },
    ] },
    { name: "app.tsx" },
    { name: "main.tsx" },
  ] },
  { name: "public", children: [
    { name: "favicon.svg" },
    { name: "og-image.png" },
  ] },
  { name: "scripts", children: [] },
  { name: ".env.local" },
  { name: "package.json", status: "modified" },
  { name: "README.md" },
  { name: "tsconfig.json" },
  { name: "vite.config.ts" },
];

export default function FileTreeDemo() {
  const [selected, setSelected] = useState<string | null>("src/components/checkout/checkout-form.tsx");
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <Stack width={340} gap={3}>
      <Surface padding={2}>
        <FileTree nodes={project} value={selected} onValueChange={id => { setSelected(id); setOpened(null); }} onOpen={id => setOpened(id)} defaultExpandedIds={["src", "src/components", "src/components/checkout"]} label="Storefront project files" />
      </Surface>
      <Caption>{opened ? `Opened ${opened}.` : selected ? `Selected ${selected}.` : "Nothing selected."} Enter opens a file, arrows move, typing a name jumps to it.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `FileTree`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `nodes` (obrigatória) | `FileTreeNode[]` | — | The root level of files and folders. |
| `value` | `string \| null` | — | Id of the selected file (controlled). Pass null for none. |
| `defaultValue` | `string \| null` | `null` | Selected file when uncontrolled. |
| `onValueChange` | `(id: string, node: FileTreeNode) => void` | — | Called when a row is selected. |
| `expandedIds` | `string[]` | — | Ids of the open folders (controlled). |
| `defaultExpandedIds` | `string[]` | `[]` | Open folders when uncontrolled. |
| `onExpandedChange` | `(expandedIds: string[]) => void` | — | Called with the next list of open folder ids. |
| `onOpen` | `(id: string, node: FileTreeNode) => void` | — | Called when a file is opened with Enter or a double click. |
| `selectFolders` | `boolean` | `false` | Lets folders be selected as well as opened. |
| `label` | `string` | `"Files"` | Accessible name of the tree. |
| `className` | `string` | — | Extra class for the tree. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `FileTreeStatus` | `"modified" \| "added" \| "deleted" \| "untracked"` |

#### `FileTreeNode`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` (obrigatória) | `string` | File or folder name, with its extension. The extension picks the icon. |
| `id` | `string` | Unique id. Defaults to the path from the root, such as `src/app/page.tsx`. |
| `children` | `FileTreeNode[]` | Present on folders (use an empty array for an empty folder); absent on files. |
| `status` | `"modified" \| "added" \| "deleted" \| "untracked"` | Version control state, shown as a letter at the end of the row. A folder shows a dot when anything inside it changed. |
| `disabled` | `boolean` | Keeps the row visible but skips it for selection and keyboard focus. |
| `icon` | `ReactNode` | Replaces the icon picked from the extension. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Movem o foco para a linha visível anterior ou seguinte, pulando as desabilitadas. |
| `→` ou `←` | `→` abre a pasta ou, se já aberta, vai ao primeiro item dela; `←` fecha a pasta ou, num arquivo, volta à pasta mãe. |
| `Home` ou `End` | Vão à primeira e à última linha visível. |
| `Enter` ou `Espaço` | Selecionam o arquivo ou abrem e fecham a pasta; `Enter` num arquivo também chama `onOpen`. |
| `*` | Abre todas as pastas irmãs da linha em foco. |
| `A–Z` | Digitar o começo de um nome (letras, números ou ponto) leva o foco à linha correspondente; repetir a mesma tecla percorre as que começam com ela. |

## Acessibilidade

- Segue o padrão de árvore: `role="tree"` nomeado por `label`, linhas `treeitem` com `aria-level`, `aria-setsize` e `aria-posinset`, `aria-expanded` nas pastas e `aria-selected` nos arquivos.
- Só uma linha fica na ordem de `Tab` (a que tem foco, senão a selecionada, senão a primeira); nós com `disabled` continuam visíveis, mas o teclado os pula e eles não podem ser selecionados.
- A letra de status traz o nome por extenso para leitor de tela e a pasta com mudanças diz “contains changes”; esses textos e “Empty folder” estão fixos em inglês.

## Movimento

- Abrir uma pasta anima a altura do grupo numa mola sem ultrapassagem, e as linhas entram em sequência, deslizando 8 px da esquerda, com atraso total limitado a 0,2 s.
- A seta gira 90°, o ícone encolhe um pouco ao ser pressionado e a linha selecionada ganha uma barra de destaque que cresce a partir do meio.
- Com “reduzir movimento”, as pastas abrem e fecham na hora e as transições de seta, ícone e barra são desligadas.

## Comportamento responsivo

- Nomes longos são cortados com reticências; cada nível recua 1rem (`--tree-indent`) e cada linha tem 1.875rem de altura (`--tree-row`).
- A árvore não rola sozinha: ponha-a num contêiner com altura e rolagem (por exemplo `scroll-area`) quando houver muitos arquivos.

## Desempenho

- Pastas fechadas não renderizam os filhos, mas não há virtualização: cada linha visível é um elemento; mantenha `nodes` com referência estável, pois a lista visível é recalculada quando ele muda.

## Notas para IA

- Pasta é todo nó com `children` (use `[]` para pasta vazia); o `id` padrão é o caminho desde a raiz, como `src/app/page.tsx`, e é ele que vai em `value` e `expandedIds`.
- Seleção (`value`, `onValueChange`) e pastas abertas (`expandedIds`, `onExpandedChange`) aceitam uso controlado ou não; `onOpen` é separado e dispara com `Enter` ou duplo clique num arquivo.
- Por padrão as pastas só abrem e fecham: passe `selectFolders` para que também sejam selecionáveis; o ícone vem da extensão do nome ou de `icon` no nó.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/file-tree · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
