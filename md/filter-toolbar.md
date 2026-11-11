# Filter toolbar

> Barra de filtros ativos que se removem com um toque, com um botão que vira menu para escolher campo e valor.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/filter-toolbar
- Descrição original (inglês): Keep collection filters close and easy to reset.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/filter-toolbar.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/filter-toolbar.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/filter-toolbar.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/filter-toolbar.json`. Caminho do registro, relativo ao endereço do site: `r/filter-toolbar.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/filter-toolbar/filter-toolbar.tsx`
  - `components/ryan-ui/filter-toolbar/filter-toolbar.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/filter-toolbar.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Acima de uma tabela ou lista, para mostrar os filtros ativos como chips removíveis e limpar todos de uma vez.
- Quando a pessoa adiciona filtros escolhendo primeiro o campo e depois o valor, sem sair da barra (`addFilter`).
- Coleções com alguns campos de filtro e um valor por campo: o chip adicionado usa o `id` do campo, para que uma nova escolha substitua a anterior.

## Quando não usar

- Use [`chip-group`](chip-group.md) quando as opções são poucas e podem ficar sempre à vista como chips de ligar e desligar.
- Use [`multi-select`](multi-select.md) quando um mesmo campo precisa de vários valores; aqui cada campo guarda um só.
- Use [`search-field`](search-field.md) para busca por texto livre; o menu daqui só oferece valores predefinidos.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { FilterToolbar, type FilterChip, type FilterField } from "@/components/ryan-ui/filter-toolbar/filter-toolbar";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 460 };

const fields: FilterField[] = [
  { id: "status", label: "Status", options: ["Open", "In review", "Merged", "Closed"] },
  { id: "assignee", label: "Assignee", options: ["Emma Collins", "Marcus Johnson", "Jasmine Brooks", "Olivia Bennett"] },
  { id: "label", label: "Label", options: [{ value: "bug", label: "Bug", hint: 12 }, { value: "feature", label: "Feature", hint: 8 }, { value: "docs", label: "Docs", hint: 3 }] },
  { id: "priority", label: "Priority", options: ["Urgent", "High", "Medium", "Low"] },
];

export default function FilterToolbarDemo() {
  const [filters, setFilters] = useState<FilterChip[]>([
    { id: "status", label: "Status", value: "Open" },
    { id: "assignee", label: "Assignee", value: "Marcus Johnson" },
  ]);
  const add = (chip: FilterChip) => setFilters(current => [...current.filter(f => f.id !== chip.id), chip]);

  return (
    <Stack width={640} gap={4}>
      <FilterToolbar
        filters={filters}
        onRemove={id => setFilters(current => current.filter(f => f.id !== id))}
        onClearAll={() => setFilters([])}
        addFilter={{ fields, onAdd: add, align: "start" }}
      />
      <Caption>{filters.length ? `${filters.length} active filter${filters.length === 1 ? "" : "s"}` : "No filters applied"}. Use Add filter to pick a field, then a value.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `FilterMenu`

An Add filter button that grows into its own menu: pick a field, then a value. The shape springs between the button and the panel, and the panel renders in place, so keep its ancestors free of overflow clipping.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `fields` (obrigatória) | `FilterField[]` | — | — |
| `onSelect` (obrigatória) | `(filter: FilterChip, field: FilterField) => void` | — | Receives a chip whose id is the field id, so a second pick for a field replaces the first. |
| `active` | `FilterChip[]` | `[]` | Applied filters. Each field shows its current value and the value step marks it. |
| `label` | `string` | `"Add filter"` | — |
| `align` | `"start" \| "end"` | `"end"` | The trigger edge the panel lines up with. It flips or shifts when the viewport, or a clipping ancestor, has no room. |

### `FilterToolbar`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `filters` (obrigatória) | `FilterChip[]` | — | — |
| `onRemove` (obrigatória) | `(id: string) => void` | — | — |
| `onClearAll` | `() => void` | — | — |
| `children` | `ReactNode` | — | — |
| `label` | `string` | `"Active filters"` | — |
| `addFilter` | `{ fields: FilterField[]; onAdd: (filter: FilterChip, field: FilterField) => void; label?: string; align?: "start" \| "end" }` | — | Adds an Add filter trigger that morphs into a two step field and value menu. |

### Tipos exportados

#### `FilterChip`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `value` | `string` | — |

#### `FilterOption`

One value a field can take. `hint` sits at the end of the row, for example a count.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | — |
| `label` | `string` | — |
| `hint` | `string \| number` | — |
| `icon` | `ReactNode` | — |

#### `FilterField`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `icon` | `ReactNode` | — |
| `options` (obrigatória) | `(string \| FilterOption)[]` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Abrem o menu “Add filter” com o foco no primeiro campo e, dentro dele, escolhem o item em foco. |
| `↓` ou `↑` | No botão, abrem o menu no primeiro ou no último item; dentro do menu, movem o foco dando a volta nas pontas. |
| `Home` ou `End` | Vão ao primeiro e ao último item do menu; digitar letras pula para o item que começa com elas. |
| `→` ou `←` | `→` entra nos valores do campo em foco; `←` volta à lista de campos. |
| `Esc` | Fecha o menu e devolve o foco ao botão que o abriu. |
| `Tab` | Percorre o botão de remover de cada chip e as ações da barra; sair do menu aberto com `Tab` o fecha. |

## Acessibilidade

- A barra é um `role="group"` nomeado por `label`; cada botão de remover tem `aria-label` com campo e valor, e uma região `role="status"` anuncia filtros adicionados, alterados e removidos.
- Ao remover um chip pelo teclado, o foco passa para o chip vizinho ou, se a lista esvaziar, para o botão “Add filter”; ao fechar o menu, o foco volta para esse botão.
- O menu é um `role="dialog"` com listas `role="menu"` (`menuitemradio` nos valores) e uma só parada de `Tab` por lista; os textos fixos (“Clear all”, “No filters applied”, “Remove…”) estão em inglês.

## Movimento

- Cada chip abre e fecha a largura do próprio espaço numa mola, então vizinhos e ações deslizam junto; um chip que muda de linha desliza até lá, e a altura da barra acompanha.
- O botão “Add filter” cresce até virar o painel do menu (largura, altura e posição na mesma mola) e volta mais rápido ao fechar; os passos de campo e valor entram deslizando no sentido da navegação.
- Com “reduzir movimento”, chips, painel e passos trocam na hora ou com um esmaecer curto.

## Comportamento responsivo

- Em telas de até 520 px a barra vira coluna, com os chips em cima e as ações embaixo, alinhadas à direita; os chips sempre quebram linha e rótulos longos são cortados.
- O painel do menu abre para cima quando falta espaço embaixo, desloca-se para caber na janela ou no ancestral que corta o conteúdo e rola por dentro acima de `min(20rem, 55vh)`.

## Desempenho

- As quebras de linha são animadas por observadores de tamanho em cada chip e um `MutationObserver` na lista, e só nos 0,9 s seguintes a uma mudança de filtros; redimensionar a janela não anima nada.

## Notas para IA

- É totalmente controlado: guarde `filters` no estado e atualize em `onRemove`, `onClearAll` e `addFilter.onAdd`; no `onAdd`, substitua o chip de mesmo `id`, que é o `id` do campo.
- O chip recebido em `onAdd` traz em `value` o texto exibido da opção (o `label` dela), não o `value`; passe sempre `onClearAll`, porque o botão “Clear all” aparece mesmo sem ele.
- O painel não usa portal: evite `overflow: hidden` nos ancestrais; `children` entra entre o botão de adicionar e o “Clear all”, e `FilterMenu` também é exportado para uso avulso.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/filter-toolbar · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
