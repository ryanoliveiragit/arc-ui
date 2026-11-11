# Sortable data table

> Tabela de registros com colunas ordenáveis, seleção de linhas e contagem de itens.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/sortable-data-table
- Descrição original (inglês): Compare structured records with sortable columns.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sortable-data-table.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sortable-data-table.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sortable-data-table.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sortable-data-table.json`. Caminho do registro, relativo ao endereço do site: `r/sortable-data-table.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/sortable-data-table/sortable-data-table.tsx`
  - `components/ryan-ui/sortable-data-table/sortable-data-table.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/sortable-data-table.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Comparar registros estruturados em colunas, deixando a pessoa ordenar por qualquer uma: projetos, faturas, membros de uma equipe.
- Selecionar várias linhas para uma ação em lote: `selectable` acrescenta a coluna de caixas, a seleção por clique na linha, o intervalo com `Shift` e a contagem no rodapé.
- Tabelas que cabem inteiras na página, em que a ordenação pode acontecer no navegador.

## Quando não usar

- Use [`tree-table`](tree-table.md) quando as linhas têm filhos e a ordenação precisa respeitar a hierarquia.
- Use [`comparison-table`](comparison-table.md) para comparar planos ou produtos recurso a recurso, com uma coluna em destaque.
- Coleções grandes ou ordenadas no servidor pedem outra solução: a ordenação é local, todas as linhas vão para o DOM e não há prop para controlar a ordem por fora.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { SortableDataTable, type DataColumn } from "@/components/ryan-ui/sortable-data-table/sortable-data-table";
import { Stack } from "./_kit";

type Project = { id: string; name: string; owner: string; status: string; budget: number; progress: number };

const rows: Project[] = [
  { id: "p1", name: "Checkout redesign", owner: "Emma Collins", status: "In progress", budget: 48000, progress: 64 },
  { id: "p2", name: "Mobile onboarding", owner: "Mateo Alvarez", status: "In review", budget: 32500, progress: 90 },
  { id: "p3", name: "Billing migration", owner: "Olivia Bennett", status: "At risk", budget: 76000, progress: 38 },
  { id: "p4", name: "Help center refresh", owner: "Hannah Walsh", status: "Planned", budget: 15800, progress: 0 },
  { id: "p5", name: "Analytics dashboard", owner: "Chloe Nguyen", status: "In progress", budget: 54200, progress: 52 },
  { id: "p6", name: "Partner API v2", owner: "Daniel Kim", status: "Shipped", budget: 61000, progress: 100 },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const columns: DataColumn<Project>[] = [
  { key: "name", label: "Project", sortable: true },
  { key: "owner", label: "Owner", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "budget", label: "Budget", sortable: true, numeric: true, render: v => money.format(v as number) },
  { key: "progress", label: "Progress", sortable: true, numeric: true, render: v => `${v}%` },
];

export default function SortableDataTableDemo() {
  return (
    <Stack width={760}>
      <SortableDataTable rows={rows} columns={columns} rowKey="id" caption="Active projects" defaultSort={{ key: "budget", direction: "desc" }} selectable itemName={{ one: "project", other: "projects" }} />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SortableDataTable`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `rows` (obrigatória) | `T[]` | — | — |
| `columns` (obrigatória) | `DataColumn<T>[]` | — | — |
| `rowKey` (obrigatória) | `keyof T \| ((row: T) => string)` | — | — |
| `caption` | `string` | `"Data table"` | — |
| `emptyMessage` | `string` | `"No rows to show"` | — |
| `defaultSort` | `SortState` | — | Sort applied on the first render. |
| `onSortChange` | `(sort: SortState) => void` | — | — |
| `selectable` | `boolean` | `false` | Adds a checkbox column, row click selection, and a count line with a clear action. |
| `selectedKeys` | `string[]` | — | — |
| `defaultSelectedKeys` | `string[]` | — | — |
| `onSelectionChange` | `(keys: string[]) => void` | — | — |
| `itemName` | `{ one: string; other: string }` | `{ one: "row", other: "rows" }` | Noun for the count line, as in "6 projects". |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `SortDirection` | `"asc" \| "desc"` |

#### `SortState`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | — |
| `direction` (obrigatória) | `"asc" \| "desc"` | — |

#### `DataColumn`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `sortable` | `boolean` | — |
| `render` | `(value: unknown, row: T) => ReactNode` | — |
| `numeric` | `boolean` | Right-aligns the column with tabular numerals. Detected when every value is a number. |
| `width` | `number \| string` | Fixed width such as 120 or "20%". Other columns are measured once and held, so sorting never reflows them. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Num cabeçalho, ordena pela coluna; de novo, inverte entre crescente e decrescente. |
| `Espaço` | Numa caixa de seleção, marca ou desmarca a linha; na caixa do cabeçalho, todas as linhas. |
| `←` ou `→` | No cabeçalho, move o foco entre a caixa de selecionar tudo e os botões de ordenação. |
| `↑` ou `↓` | Move o foco entre as caixas das linhas; da primeira linha, `↑` sobe para a caixa de selecionar tudo, e dela `↓` desce de volta. |
| `Home` ou `End` | Vai ao primeiro ou ao último controle do cabeçalho, ou à primeira ou última caixa de linha. |
| `Esc` | Limpa a seleção quando há linhas marcadas. |

## Acessibilidade

- É uma `<table>` nativa com `caption` oculta e papéis ARIA explícitos, que mantêm a semântica quando o CSS a redesenha em telas estreitas; cabeçalhos ordenáveis levam `aria-sort`.
- Uma região `role="status"` anuncia a coluna e o sentido da ordenação e quantas linhas estão selecionadas; a caixa do cabeçalho usa o estado indeterminado.
- A caixa de cada linha é nomeada pelo valor da primeira coluna; os textos fixos (`Sort by`, `Select all rows`, `Clear selection`) estão em inglês.

## Movimento

- Ao ordenar, as linhas deslizam com mola até a nova posição sobre uma faixa fixa que tinge a coluna ordenada; a seta surge na coluna e gira quando o sentido inverte.
- A marca da caixa se desenha e, no cabeçalho, se transforma entre visto e traço; a contagem do rodapé troca de texto subindo ou descendo, com a largura acompanhando.
- Com “reduzir movimento” ligado, as linhas trocam de lugar na hora e os textos apenas alternam, sem deslocamento nem desfoque.

## Comportamento responsivo

- Em janelas de até 620 px o cabeçalho vira uma faixa rolável de botões de ordenação e cada linha se dobra em duas: primeira coluna e primeiro número em cima, o resto embaixo.
- A regra é uma media query da janela, não do contêiner: num painel estreito em tela larga a tabela mantém 560 px de largura mínima e rola na horizontal.

## Desempenho

- Não há paginação nem virtualização, e cada linha é um `motion.tr` com animação de layout: para coleções longas, fatie `rows` e combine com `pagination`.
- As larguras das colunas são medidas uma vez e travadas com `table-layout: fixed`, para a ordenação não causar reflow; a medição só se repete se as colunas mudarem.

## Notas para IA

- Passe `rows`, `columns` (`{ key, label, render?, numeric?, width? }`) e `rowKey`; toda coluna é ordenável, a menos que tenha `sortable: false`.
- A ordenação usa o valor bruto de `row[key]`, não o que `render` devolve: guarde números e `Date` nos dados e formate só no `render`; valores vazios ficam sempre no fim.
- A ordenação é só interna (`defaultSort` e `onSortChange`); a seleção pode ser controlada com `selectedKeys` e `onSelectionChange`, e a primeira coluna deve identificar a linha.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/sortable-data-table · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
