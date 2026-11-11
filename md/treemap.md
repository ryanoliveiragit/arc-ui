# Treemap

> Mapa de árvore em blocos: clique para detalhar e os blocos crescem até preencher a vista.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/treemap
- Descrição original (inglês): A squarified treemap: click to drill and the tiles grow to fill the view, with a breadcrumb back and metrics that morph every tile.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/treemap.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/treemap.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/treemap.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/treemap.json`. Caminho do registro, relativo ao endereço do site: `r/treemap.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/treemap/treemap.tsx`
  - `components/ryan-ui/treemap/treemap.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/treemap.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar uma hierarquia de partes de um todo, como receita por linha de negócio e produto, quando o tamanho relativo importa mais que comparações exatas.
- Explorar por níveis: clicar num bloco amplia aquele ramo até preencher a vista, e a trilha no topo volta a qualquer nível acima.
- Mostrar uma segunda medida, como crescimento, na intensidade da cor, com `colorLabel` e uma escala em degraus abaixo do gráfico.

## Quando não usar

- Use [`bar-chart`](bar-chart.md) quando o leitor precisa comparar valores com precisão: áreas são difíceis de comparar a olho.
- Use [`composition-chart`](composition-chart.md) ou [`donut-chart`](donut-chart.md) para poucas partes num único nível.
- Use [`tree-table`](tree-table.md) quando cada nó da hierarquia precisa de números exatos em colunas.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useMemo, useState } from "react";
import Treemap, { type TreemapNode } from "@/components/ryan-ui/treemap/treemap";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

type Leaf = [string, string, number, number, number, number]; // id, label, value 2025, value 2026, growth 2025, growth 2026
const groups: { id: string; label: string; items: Leaf[] }[] = [
  { id: "software", label: "Software", items: [
    ["saas", "Subscriptions", 420, 510, 0.18, 0.21],
    ["licenses", "Licenses", 180, 150, -0.06, -0.17],
    ["marketplace", "Marketplace", 90, 130, 0.32, 0.44],
  ] },
  { id: "services", label: "Services", items: [
    ["consulting", "Consulting", 210, 225, 0.05, 0.07],
    ["training", "Training", 70, 95, 0.12, 0.36],
    ["support", "Premium support", 140, 160, 0.09, 0.14],
  ] },
  { id: "hardware", label: "Hardware", items: [
    ["devices", "Devices", 230, 190, -0.08, -0.17],
    ["accessories", "Accessories", 85, 80, 0.02, -0.06],
  ] },
  { id: "partners", label: "Partners", items: [
    ["resellers", "Resellers", 160, 185, 0.1, 0.16],
    ["affiliates", "Affiliates", 55, 75, 0.2, 0.36],
  ] },
];

function tree(year: 0 | 1): TreemapNode {
  return {
    id: "root",
    label: "Revenue",
    children: groups.map((g) => ({
      id: g.id,
      label: g.label,
      children: g.items.map((i) => ({ id: i[0], label: i[1], value: year ? i[3] : i[2], color: year ? i[5] : i[4] })),
    })),
  };
}

export default function TreemapDemo() {
  const [year, setYear] = useState<"2025" | "2026">("2025");
  const data = useMemo(() => tree(year === "2025" ? 0 : 1), [year]);
  return (
    <Stack gap={4} width={760}>
      <SegmentedControl label="Year" value={year} onValueChange={(v) => setYear(v as "2025" | "2026")} options={[{ value: "2025", label: "2025" }, { value: "2026", label: "2026" }]} />
      <Surface>
        <Treemap
          data={data}
          label="Revenue by line of business"
          formatValue={(v) => `$${v}K`}
          colorLabel="Growth"
          formatColor={(v) => `${v > 0 ? "+" : ""}${Math.round(v * 100)}%`}
          height={340}
        />
      </Surface>
      <Caption>Click a block to drill in and use the breadcrumb to climb back. Shading shows growth; switch years to morph the tiles.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Treemap`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `TreemapNode` | — | The root. Its label names the whole in the first breadcrumb. |
| `label` (obrigatória) | `string` | — | What the whole is, such as "Revenue". Names the chart for assistive technology. |
| `formatValue` | `(value: number) => string` | `value => grouped.format(value)` | — |
| `colorLabel` | `string` | — | Names the shading measure in the tooltip and scale, such as "Growth". Tiles take the hue of their top level branch and grow deeper with the measure. Leave it out to draw every tile at one depth. |
| `formatColor` | `(value: number) => string` | `value => grouped.format(value)` | — |
| `colorDomain` | `[number, number]` | — | Range of the color measure. Defaults to the range of the leaves. |
| `focus` | `string` | — | Controlled id of the node that fills the view. |
| `defaultFocus` | `string` | — | — |
| `onFocusChange` | `(id: string) => void` | — | — |
| `height` | `number` | `420` | Height of the tiles in pixels. |
| `emptyLabel` | `string` | `"No data yet"` | — |
| `ref` | `Ref<HTMLElement>` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

#### `TreemapNode`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable identity, unique in the tree. A tile that survives a data change morphs to its new size. |
| `label` (obrigatória) | `string` | — |
| `value` | `number` | Leaf size. A branch's size is the sum of its children. |
| `color` | `number` | Optional second measure for shading, such as growth. A branch uses the size weighted mean of its children. |
| `children` | `TreemapNode[]` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` ou `↑` ou `↓` | Com o foco no gráfico, salta para o bloco de primeiro nível mais próximo naquela direção. |
| `Home` ou `End` | Vai ao primeiro ou ao último bloco de primeiro nível, na ordem de `data`. |
| `Enter` ou `Espaço` | Amplia o bloco em foco, quando ele tem filhos, e passa o destaque ao primeiro filho. |
| `Esc` ou `Backspace` | Volta um nível e destaca o bloco de onde veio; na raiz, tira o destaque. |

## Acessibilidade

- A área dos blocos é um grupo focável com `aria-roledescription="treemap"` e as instruções no nome, em inglês; o teclado percorre só os blocos do primeiro nível da vista.
- Uma região `aria-live="polite"` lê o bloco ativo (caminho, valor, fatia do pai e a medida de cor), e uma tabela oculta lista todos os nós com caminho e valores.
- A trilha é um `<nav>` com lista ordenada e `aria-current="location"` no nível atual; a dica é decorativa (`aria-hidden`).

## Movimento

- Na primeira vez em tela, os blocos crescem a partir do próprio centro, numa onda rápida que começa pelos maiores.
- Ao ampliar, o bloco escolhido cresce até preencher a vista e os filhos surgem; ao voltar, a vista encolhe até ele; com dados novos, cada bloco muda de tamanho no lugar.
- Com “reduzir movimento” ligado, cada mudança vai direto ao layout final, a dica não desliza e a trilha troca sem deslocamento.

## Comportamento responsivo

- A largura segue o contêiner e a altura é fixa em `height` (420 px); nome e valor só aparecem em blocos com espaço (mais de 64 × 38 px), e os pequenos dependem da dica.
- No toque não há dica ao passar: tocar num bloco amplia o ramo dele, e tocar numa folha do primeiro nível mostra seus números.

## Desempenho

- Todos os nós da árvore têm um elemento no DOM, mesmo fora da vista, `data` é serializado a cada render e a animação reposiciona os blocos por JavaScript a cada quadro; com milhares de folhas, agregue antes.

## Notas para IA

- Passe uma raiz em `data` (`{ id, label, children }`) com `value` só nas folhas: o valor de um ramo é a soma dos filhos, e o `label` da raiz abre a trilha.
- Para colorir pela segunda medida, dê `color` às folhas e passe `colorLabel` (e `formatColor`); os quatro primeiros ramos ganham matiz de série e os seguintes ficam neutros.
- `focus` com `onFocusChange` controla o ramo ampliado (um id de folha mostra a raiz); mantenha os `id` estáveis entre conjuntos para os blocos se transformarem em vez de reaparecerem.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/treemap · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
