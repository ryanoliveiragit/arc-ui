# Tree table

> Tabela com linhas aninhadas, seleção em três estados, ordenação que preserva a hierarquia e carga sob demanda.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/tree-table
- Descrição original (inglês): A table with nested rows, tri-state selection, hierarchy-preserving sort, and lazy-loaded children.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tree-table.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tree-table.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tree-table.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tree-table.json`. Caminho do registro, relativo ao endereço do site: `r/tree-table.json`.

- Pacotes npm: `@radix-ui/react-checkbox`, `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Checkbox](checkbox.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/tree-table/tree-table.tsx`
  - `components/ryan-ui/tree-table/tree-table.module.css`
  - `components/ryan-ui/checkbox/checkbox.tsx`
  - `components/ryan-ui/checkbox/checkbox.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-checkbox lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/tree-table.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Dados hierárquicos com colunas para comparar: pastas e arquivos com dono e tamanho, orçamento por área e subárea, equipes e pessoas.
- Seleção em lote numa hierarquia: marcar um pai marca tudo abaixo dele, e o pai fica em estado misto quando só parte dos filhos está marcada.
- Árvores grandes cujos filhos vêm do servidor ao abrir, com `loadChildren`, uma linha de carregamento e um botão de nova tentativa quando a carga falha.

## Quando não usar

- Use [`tree-view`](tree-view.md) para navegar numa hierarquia só pelos nomes, sem colunas de dados.
- Use [`sortable-data-table`](sortable-data-table.md) quando os registros não têm filhos.
- Milhares de linhas abertas ao mesmo tempo pedem virtualização, que este componente não tem.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { Folder, FileText } from "lucide-react";
import { TreeTable, type TreeTableColumn, type TreeTableRow } from "@/components/ryan-ui/tree-table/tree-table";
import { Stack } from "./_kit";

type Item = { name: string; owner: string; size: number; kind: "folder" | "file" };

const file = (id: string, name: string, owner: string, size: number): TreeTableRow<Item> => ({ id, data: { name, owner, size, kind: "file" } });
const folder = (id: string, name: string, owner: string, children?: TreeTableRow<Item>[]): TreeTableRow<Item> => ({ id, data: { name, owner, size: 0, kind: "folder" }, children, hasChildren: !children });

const rows: TreeTableRow<Item>[] = [
  folder("design", "Design", "Emma Collins", [
    file("brand", "Brand guidelines.pdf", "Emma Collins", 4200),
    folder("icons", "Icons", "Jasmine Brooks", [file("i1", "Outline set.fig", "Jasmine Brooks", 1800), file("i2", "Filled set.fig", "Jasmine Brooks", 2100)]),
  ]),
  folder("eng", "Engineering", "Nathan Cole", [
    file("arch", "Architecture.md", "Olivia Bennett", 48),
    file("api", "API reference.md", "Daniel Kim", 126),
  ]),
  folder("finance", "Finance", "Andre Williams"),
];

const fmt = (kb: number) => (kb >= 1000 ? `${(kb / 1000).toFixed(1)} MB` : `${kb} KB`);

const columns: TreeTableColumn<Item>[] = [
  { id: "name", header: "Name", width: "minmax(0, 2fr)", sortValue: d => d.name, cell: d => <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", minWidth: 0 }}>{d.kind === "folder" ? <Folder size={16} aria-hidden="true" /> : <FileText size={16} aria-hidden="true" />}<span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span></span> },
  { id: "owner", header: "Owner", width: "minmax(0, 1fr)", hideBelow: 480, sortValue: d => d.owner, cell: d => d.owner },
  { id: "size", header: "Size", width: "90px", align: "end", sortValue: d => d.size, cell: d => d.kind === "file" ? fmt(d.size) : "" },
];

const loadChildren = (row: TreeTableRow<Item>) => new Promise<TreeTableRow<Item>[]>(resolve => window.setTimeout(() => resolve([
  file(`${row.id}-1`, "Q3 budget.xlsx", "Andre Williams", 320),
  file(`${row.id}-2`, "Invoices 2026.zip", "Andre Williams", 8400),
]), 900));

export default function TreeTableDemo() {
  return (
    <Stack width={680}>
      <TreeTable rows={rows} columns={columns} label="Team files" selectable defaultExpanded={["design"]} defaultSort={null} loadChildren={loadChildren} rowLabel={d => d.name} maxHeight={380} />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `TreeTable`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `rows` (obrigatória) | `TreeTableRow<T>[]` | — | — |
| `columns` (obrigatória) | `TreeTableColumn<T>[]` | — | — |
| `label` (obrigatória) | `string` | — | Accessible name of the table. |
| `expanded` | `string[]` | — | — |
| `defaultExpanded` | `string[]` | `[]` | — |
| `onExpandedChange` | `(ids: string[]) => void` | — | — |
| `selectable` | `boolean` | `false` | Adds a checkbox column. Checking a parent checks everything under it. |
| `selected` | `string[]` | — | — |
| `defaultSelected` | `string[]` | `[]` | — |
| `onSelectedChange` | `(ids: string[]) => void` | — | — |
| `sort` | `TreeTableSort \| null` | — | — |
| `defaultSort` | `TreeTableSort \| null` | `null` | — |
| `onSortChange` | `(sort: TreeTableSort \| null) => void` | — | — |
| `loadChildren` | `(row: TreeTableRow<T>) => Promise<TreeTableRow<T>[]>` | — | Loads the children of a row with hasChildren the first time it expands. A rejected promise shows a retry row. |
| `rowLabel` | `(data: T) => string` | — | Names a row for its checkbox, such as the file or team name. |
| `onRowActivate` | `(row: TreeTableRow<T>) => void` | — | Called when a row without children is clicked or gets Enter. Parent rows toggle instead. |
| `maxHeight` | `number \| string` | — | Caps the height; the header stays pinned while the body scrolls. |
| `emptyState` | `ReactNode` | — | — |
| `className` | `string` | — | — |
| `ref` | `Ref<HTMLDivElement>` | — | — |

### Tipos exportados

#### `TreeTableRow`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `data` (obrigatória) | `T` | — |
| `children` | `TreeTableRow<T>[]` | Nested rows. Leave undefined and set hasChildren to load them on first expand with loadChildren. |
| `hasChildren` | `boolean` | Marks a row whose children are not loaded yet. |

#### `TreeTableCellContext`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `row` (obrigatória) | `TreeTableRow<T>` | — |
| `depth` (obrigatória) | `number` | One for top level rows. |
| `expanded` (obrigatória) | `boolean` | — |

#### `TreeTableColumn`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `header` (obrigatória) | `string` | — |
| `cell` (obrigatória) | `(data: T, context: TreeTableCellContext<T>) => ReactNode` | — |
| `sortValue` | `(data: T) => string \| number` | Makes the column sortable. Siblings are sorted within their parent, so the hierarchy never breaks. |
| `width` | `string` | A grid track, such as "120px" or "minmax(0, 2fr)". Defaults to "minmax(0, 1fr)". |
| `align` | `"start" \| "end"` | — |
| `hideBelow` | `number` | Hides the column while the table is narrower than this many px. |

#### `TreeTableSort`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `columnId` (obrigatória) | `string` | — |
| `direction` (obrigatória) | `"ascending" \| "descending"` | — |

### Outras exportações

- `collectExpandableIds` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` ou `Page Up` ou `Page Down` | Move o foco uma linha para cima ou para baixo; Page Up e Page Down saltam dez linhas. |
| `Home` ou `End` | Vai à primeira ou à última linha visível. |
| `→` ou `←` | → abre a linha ou, se ela já está aberta, desce ao primeiro filho; ← fecha a linha ou, se ela já está fechada, sobe ao pai. |
| `Enter` | Abre ou fecha uma linha com filhos, chama `onRowActivate` numa folha e, depois de uma falha de carga, tenta de novo. |
| `Espaço` ou `Ctrl + A` | Com `selectable`, Espaço marca ou desmarca a linha e seus descendentes; Ctrl + A (⌘ + A no Mac) marca tudo ou limpa a seleção. |
| `*` | Abre todas as linhas irmãs da linha em foco, carregando os filhos que faltam. |

## Acessibilidade

- Segue o padrão `treegrid`: as linhas têm `aria-level`, `aria-posinset`, `aria-setsize` e `aria-expanded`, e o foco é itinerante, com uma única linha na ordem de `Tab`.
- Com `selectable`, a grade é `aria-multiselectable` e as linhas marcadas têm `aria-selected`; as caixas ficam fora do `Tab` (a marcação é pelo Espaço) e recebem nome de `rowLabel`.
- Uma região `aria-live` anuncia ordenação, abrir ou fechar tudo e o resultado das cargas; se a linha em foco some ao fechar um ramo, o foco sobe para o ancestral visível mais próximo.

## Movimento

- Abrir uma linha faz os filhos crescerem em altura com mola e aparecerem em leve sequência; fechar recolhe na mesma mola, e a seta gira 90°.
- Ao ordenar, as linhas deslizam até a nova posição dentro do seu nível; quando os filhos chegam de `loadChildren`, o primeiro ocupa o lugar da linha de carregamento, sem empurrão.
- Com “reduzir movimento” ligado, as linhas aparecem e somem com um esmaecer curto, sem crescer em altura; o esqueleto de carga para de pulsar e o indicador gira mais devagar.

## Comportamento responsivo

- `hideBelow` esconde uma coluna enquanto a tabela for mais estreita que aquele valor em px; a medida é da própria tabela, então vale também para painéis estreitos em telas largas.
- Com `maxHeight`, o corpo rola por dentro e o cabeçalho fica fixo; a linha que recebe foco pelo teclado é rolada para a vista sem ficar escondida sob o cabeçalho.

## Desempenho

- Só as linhas dos ramos abertos vão para o DOM, mas sem virtualização: abrir tudo numa árvore de milhares de nós renderiza todos, cada um com animação de altura e de posição.

## Notas para IA

- Cada linha é `{ id, data, children? }`; para carga sob demanda, deixe `children` indefinido, marque `hasChildren: true` e passe `loadChildren`, que devolve uma `Promise` com os filhos.
- A primeira coluna leva a árvore; `sortValue` torna a coluna ordenável (crescente, decrescente, sem ordem), `width` aceita uma trilha de grid (`"90px"`, `"minmax(0, 2fr)"`) e `align: "end"` alinha números.
- Depende do item `checkbox`, instalado junto; `Loading`, `Couldn't load` e `Retry` são fixos em inglês, e para abrir tudo por fora use `collectExpandableIds(rows)` com `expanded` e `onExpandedChange`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/tree-table · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
