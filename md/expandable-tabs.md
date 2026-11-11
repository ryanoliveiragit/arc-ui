# Expandable tabs

> Abas de ícones em que só a aba ativa mostra o rótulo, que se abre com uma mola enquanto as outras se recolhem.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/expandable-tabs
- Descrição original (inglês): Icon tabs in which only the active tab shows its label, unfolding on a spring while the others fold back to icons.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-tabs.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-tabs.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-tabs.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-tabs.json`. Caminho do registro, relativo ao endereço do site: `r/expandable-tabs.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/expandable-tabs/expandable-tabs.tsx`
  - `components/ryan-ui/blocks/expandable-tabs/expandable-tabs.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/expandable-tabs.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Barra inferior de app ou alternador compacto com quatro ou cinco destinos, em que só o ativo precisa mostrar o nome.
- Navegação por ícones conhecidos (início, busca, caixa de entrada, perfil), com contador de não lidos no ícone (`badge: 3`).

## Quando não usar

- Use [`tabs`](tabs.md) ou [`segmented-control`](segmented-control.md) quando todos os rótulos devem ficar visíveis o tempo todo.
- Use [`morphing-tabs`](morphing-tabs.md) quando as abas têm rótulo e o destaque deve viajar entre elas.
- Evite com ícones ambíguos ou muitos destinos: os nomes ficam escondidos e a lista não rola nem quebra linha.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import ExpandableTabsPreview from "@/components/ryan-ui/blocks/expandable-tabs/expandable-tabs";

export default function ExpandableTabsDemo() {
  return <ExpandableTabsPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ExpandableTabs`

Icon tabs that spend their width on the active tab only: its label unfolds on a spring while the others fold back to icons, so five destinations fit where two labeled tabs would. Arrow keys, Home and End move between tabs.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `tabs` (obrigatória) | `ExpandableTab[]` | — | The tabs, in order. |
| `value` | `string` | — | Active tab id (controlled). |
| `defaultValue` | `string` | — | Active tab id on first render (uncontrolled). Defaults to the first tab. |
| `onValueChange` | `(value: string) => void` | — | Called with the id of the tab that was picked. |
| `label` | `string` | `"Sections"` | Accessible name of the tab list. |
| `className` | `string` | — | Extra class for the root. |

### `ExpandableTabsPreview`

Ready preview: a compact app screen with five destinations in its bottom bar.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

#### `ExpandableTab`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable value of the tab. |
| `label` (obrigatória) | `string` | Text shown only while the tab is active; always the tab's accessible name. |
| `icon` (obrigatória) | `ReactNode` | Icon, always visible. |
| `badge` | `number` | Small count on the icon, for unread items and the like. |
| `content` | `ReactNode` | Panel shown while the tab is active. Leave it out to use the tabs as a plain switcher. |
| `disabled` | `boolean` | A disabled tab cannot be picked and is skipped by the arrow keys. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Selecionam a aba anterior ou a próxima, pulando as desabilitadas e dando a volta, e levam o foco junto. |
| `Home` ou `End` | Selecionam a primeira ou a última aba habilitada. |

## Acessibilidade

- Segue o padrão de abas com foco itinerante: `tablist` nomeado por `label`, `aria-selected` em cada aba e, quando há `content`, um `tabpanel` ligado à aba ativa.
- O nome de cada aba é sempre o `label` (com “, 3 new” quando há `badge`), mesmo com o texto escondido; o rótulo visível fica em `aria-hidden` para não ser lido duas vezes.

## Movimento

- O rótulo da aba ativa se abre numa mola sem ultrapassagem enquanto o da anterior se fecha, o fundo de destaque cresce a partir da própria aba e o ícone pulsa uma vez.
- Quando há `content`, o painel troca subindo de um leve desfoque.
- Com “reduzir movimento” ligado, rótulos e painéis trocam na hora, sem pulso nem desfoque, e as transições CSS do fundo são desligadas.

## Comportamento responsivo

- A lista se centraliza e cresce com o rótulo ativo, sem rolagem nem quebra de linha: confira se os ícones mais o rótulo mais longo cabem na tela mais estreita.

## Notas para IA

- Importe `ExpandableTabs` pelo nome (a exportação padrão é a prévia de um app); cada aba precisa de `id`, `label` e `icon`, e contagens acima de 9 em `tab.badge` aparecem como “9+”.
- Sem `content` em nenhuma aba, vira um alternador simples, sem `tabpanel`: use `value` e `onValueChange` para trocar a tela por fora, como numa barra inferior.
- Com `content`, o painel aparece acima da lista; para fixar a barra no rodapé da tela, posicione o componente pelo pai.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/expandable-tabs · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
