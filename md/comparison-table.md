# Comparison table

> Tabela comparativa com cabeçalho fixo, seções recolhíveis e filtro para ver só as diferenças.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/comparison-table
- Descrição original (inglês): An us versus them table with a sticky header, a highlighted column, and a stacked phone view.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/comparison-table.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/comparison-table.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/comparison-table.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/comparison-table.json`. Caminho do registro, relativo ao endereço do site: `r/comparison-table.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/comparison-table/comparison-table.tsx`
  - `components/ryan-ui/blocks/comparison-table/comparison-table-data.ts`
  - `components/ryan-ui/blocks/comparison-table/comparison-table.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/comparison-table.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Página de preços ou de produto que compara a sua oferta com alternativas, recurso por recurso, com a sua coluna destacada.
- Tabelas longas em que o cabeçalho precisa continuar visível na rolagem e a opção “Only differences” enxuga a leitura.
- Comparações que precisam funcionar no celular: abaixo de `stackBelow` ficam só a sua coluna e uma concorrente, escolhida por botões.

## Quando não usar

- Use [`plan-comparison`](plan-comparison.md) para comparar os seus próprios planos e períodos de cobrança.
- Use [`sortable-data-table`](sortable-data-table.md) para dados tabulares de verdade, com ordenação e muitas linhas.
- Evite com muitas colunas: todas dividem a largura, sem rolagem horizontal, até o modo empilhado entrar abaixo de `stackBelow`.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import ComparisonTable from "@/components/ryan-ui/blocks/comparison-table/comparison-table";

export default function ComparisonTableDemo() {
  return <ComparisonTable />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ComparisonTable`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` | `string` | `"How Relay compares"` | — |
| `description` | `string` | `"Everything a growing team needs, without the…` | — |
| `columns` | `ComparisonColumn[]` | `comparisonColumns` | — |
| `sections` | `ComparisonSection[]` | `comparisonSections` | — |
| `differencesOnly` | `boolean` | — | Hide rows where every visible column has the same value (controlled). |
| `defaultDifferencesOnly` | `boolean` | `false` | — |
| `onDifferencesOnlyChange` | `(value: boolean) => void` | — | — |
| `compareWith` | `string` | — | Competitor shown beside yours in the stacked phone layout (controlled). |
| `onCompareWithChange` | `(id: string) => void` | — | — |
| `cta` | `{ label: string; href?: string; onClick?: () => void; doneLabel?: string }` | — | Call to action in your column. |
| `stickyTop` | `number` | `0` | Offset for the sticky header, such as the height of a fixed site header. Defaults to 0. |
| `maxHeight` | `number \| string` | — | Caps the table height and scrolls it inside the block, with the header sticking to its top. |
| `stackBelow` | `number` | `640` | Width below which the table stacks into a two column comparison. Defaults to 640. |
| `className` | `string` | — | — |

### `ComparisonTableBlock`

Preview: the comparison inside a capped height so the sticky header shows.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ComparisonValue`: true is included, false is not, "partial" is limited, and a string prints as text (a limit, a price). | `boolean \| "partial" \| string \| { value: boolean \| "partial" \| string; note?: string }` |

#### `ComparisonColumn`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `name` (obrigatória) | `string` | — |
| `caption` | `string` | A short line under the name, such as a price. |
| `highlight` | `boolean` | Your product. It gets the tinted band and stays visible on phones. |

#### `ComparisonRow`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `feature` (obrigatória) | `string` | — |
| `hint` | `string` | Secondary text under the feature name. |
| `values` (obrigatória) | `Record<string, ComparisonValue>` | — |

#### `ComparisonSection`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `title` (obrigatória) | `string` | — |
| `rows` (obrigatória) | `ComparisonRow[]` | — |

### Outras exportações

- `comparisonColumns` (valor)
- `comparisonSections` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Espaço` | No interruptor “Only differences”, liga ou desliga a filtragem das linhas iguais. |
| `Enter` ou `Espaço` | Nos botões de concorrente (modo empilhado) e no botão de chamada da sua coluna, acionam a escolha. |
| `↑` ou `↓` ou `Page Up` ou `Page Down` | Com `maxHeight`, a área da tabela entra na ordem do Tab e rola pelo teclado, com o cabeçalho preso no topo. |

## Acessibilidade

- A grade é uma tabela ARIA (`role="table"`, `row`, `columnheader`, `rowheader`, `cell`) nomeada pelo título, e cada marca tem texto oculto: “Included”, “Partial” ou “Not included”.
- “Only differences” é um checkbox nativo com `role="switch"` dentro do rótulo, e uma região `aria-live` diz se todas as linhas estão visíveis ou só as que diferem.
- Com `maxHeight`, a área de rolagem vira uma `region` focável com o título como nome; os textos fixos (o interruptor, a legenda, “Compare … with”) estão em inglês.

## Movimento

- As marcas de incluído se desenham quando entram na tela, em cascata na sua coluna; ao filtrar, as linhas fecham e abrem a altura com uma mola sem ultrapassagem.
- No modo empilhado, o realce desliza até a concorrente escolhida e os valores trocam com um leve zoom; o botão de chamada muda de largura ao confirmar com `doneLabel`.
- Com “reduzir movimento” ligado, as marcas já aparecem desenhadas, as linhas somem e voltam na hora, o botão troca de largura sem animar e as trocas viram só esmaecer.

## Comportamento responsivo

- Abaixo de `stackBelow` (640px por padrão, medido no próprio bloco), mostra só a sua coluna e a concorrente escolhida; as colunas também se estreitam por container query em 820px e 640px.
- O cabeçalho gruda no topo da rolagem da página ou, com `maxHeight`, no topo da própria tabela; `stickyTop` desconta a altura de um cabeçalho fixo do site.

## Notas para IA

- Importe `ComparisonTable` pelo nome (a exportação padrão é a prévia com altura limitada) e marque a sua coluna com `highlight: true`; sem ela, vale a primeira.
- Valores por coluna: `true`, `false`, `"partial"`, um texto (limite ou preço) ou `{ value, note }`; “Only differences” compara só `value`, então notas diferentes não contam como diferença.
- Sem `cta` não há botão: com `href` e sem `onClick` vira link, e com `doneLabel` o botão confirma no lugar. No modo empilhado, `compareWith` controla a concorrente (o padrão é a primeira).

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/comparison-table · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
