# Expandable action bar

> Barra de ações flutuante que cresce de uma pílula compacta para uma grade com todas as ações e uma linha secundária.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/expandable-action-bar
- Descrição original (inglês): Floating action bar that grows upward from a compact pill into a labeled grid of every action plus a secondary row, with the icons gliding to their new places.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-action-bar.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-action-bar.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-action-bar.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-action-bar.json`. Caminho do registro, relativo ao endereço do site: `r/expandable-action-bar.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/expandable-action-bar/expandable-action-bar.tsx`
  - `components/ryan-ui/blocks/expandable-action-bar/expandable-action-bar.module.css`
  - `components/ryan-ui/lib/media.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/expandable-action-bar.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Barra flutuante de ações em massa sobre uma seleção (arquivos, fotos, linhas), com as três ou quatro ações principais sempre à mão e o resto a um toque.
- Telas de celular ou painéis estreitos, em que a pílula compacta cabe sobre o conteúdo e só se abre numa grade rotulada quando pedida.

## Quando não usar

- Use [`overflow-actions`](overflow-actions.md) para uma barra fixa que leva para um menu “mais” só as ações que não cabem na largura.
- Use [`bloom-menu`](bloom-menu.md) para criar itens novos a partir de um botão flutuante, sem seleção.
- Use [`dropdown-menu`](dropdown-menu.md) quando a lista de ações é longa ou tem submenus.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import ExpandableActionBarPreview from "@/components/ryan-ui/blocks/expandable-action-bar/expandable-action-bar";
import type { DemoStage } from "./_kit";

// Taller than the default so the expanded bar opens below the board instead of over its second row.
export const stage: DemoStage = { height: 720 };

export default function ExpandableActionBarDemo() {
  return <ExpandableActionBarPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ExpandableActionBar`

Floating action bar: a compact pill of the main actions that grows upward into a labeled grid of every action plus a secondary row, with the icons gliding to their new places.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | — | Short text at the start of the bar, such as "3 selected". It crossfades when it changes. |
| `actions` | `BarAction[]` | `sampleActions` | Every action, in order. Defaults to sample file actions. |
| `shortcuts` | `BarShortcut[]` | `sampleShortcuts` | Chips of the secondary row, shown when the bar is expanded. Leave empty to drop the row. |
| `shortcutsLabel` | `string` | `"Move to"` | Text before the secondary row's chips. |
| `expanded` | `boolean` | — | Whether the bar is expanded. Pass it with `onExpandedChange` to control it. |
| `defaultExpanded` | `boolean` | `false` | Whether the bar starts expanded when uncontrolled. |
| `onExpandedChange` | `(expanded: boolean) => void` | — | Called when the toggle or Escape expands or collapses the bar. |
| `onAction` | `(id: string) => void` | — | Called with the id of the action that was pressed. |
| `onShortcut` | `(id: string) => void` | — | Called with the id of the secondary chip that was pressed. |
| `width` | `number` | `416` | Widest the expanded bar gets, in px. It never grows past the space the component is given. |
| `className` | `string` | — | Extra class for the root box. |

### `ExpandableActionBarPreview`

Ready preview: select files on a board and act on them from the bar that floats over its bottom edge.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

#### `BarAction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique id, passed to `onAction`. |
| `label` (obrigatória) | `string` | Visible name: the tile's text when expanded, the button's accessible name when compact. |
| `icon` (obrigatória) | `ReactNode` | Icon, about 18 px. |
| `primary` | `boolean` | Primary actions stay visible in the compact pill. Keep them to three or four. |
| `tone` | `"danger"` | `danger` tints a destructive action. |

#### `BarShortcut`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique id, passed to `onShortcut`. |
| `label` (obrigatória) | `string` | Text on the chip. |

### Outras exportações

- `sampleActions` (valor)
- `sampleShortcuts` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Movem o foco entre todos os botões da barra, incluindo o de expandir e os da fileira secundária, dando a volta. |
| `Home` ou `End` | Focam o primeiro ou o último botão da barra. |
| `Esc` | Com a barra expandida, recolhe e devolve o foco ao botão de expandir. |
| `Enter` ou `Espaço` | Acionam a ação em foco, ou expandem e recolhem a barra no botão da seta. |

## Acessibilidade

- A barra é um `role="toolbar"` horizontal com nome fixo “Actions”, e o botão de expandir tem `aria-expanded` e nome “Show all actions” ou “Show fewer actions”.
- Na forma compacta, cada botão recebe `aria-label` e `title` com o `label` da ação; expandida, o texto visível vira o nome. A fileira secundária é um `group` nomeado por `shortcutsLabel`.
- Todos os botões ficam na ordem do Tab (não há foco itinerante); as setas são um atalho a mais para percorrê-los.

## Movimento

- A barra é uma janela que muda de largura e altura numa mola com leve quique, crescendo para cima a partir da pílula, enquanto os ícones que já estavam lá deslizam para o novo lugar.
- Os ícones extras surgem em cascata, os rótulos sobem logo depois e a seta gira 180°; quando `label` muda, o texto novo entra por baixo e o antigo sai por cima.
- Com “reduzir movimento” ligado, a barra assume o novo tamanho na hora e ícones e rótulos só aparecem, sem deslize nem cascata.

## Comportamento responsivo

- A largura expandida é `width` (416px por padrão), limitada ao espaço do contêiner; a fileira secundária rola na horizontal, com a borda final esmaecida indicando que há mais.

## Desempenho

- Um `ResizeObserver` acompanha o contêiner e o conteúdo, e só um novo tamanho-alvo dispara a mola, então redimensionar a janela não reinicia a animação a cada quadro.

## Notas para IA

- Importe `ExpandableActionBar` pelo nome (a exportação padrão é a prévia com o quadro de arquivos) e marque com `primary: true` as três ou quatro ações da pílula compacta.
- O componente ocupa a largura do pai e se ancora na borda de baixo dele: posicione o pai (por exemplo, `position: absolute` no rodapé) e mostre a barra só quando houver seleção.
- Trate os cliques em `onAction(id)` e `onShortcut(id)`; `label` (como “3 selected”) é o texto que troca com animação, e `shortcuts={[]}` remove a fileira secundária.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/expandable-action-bar · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
