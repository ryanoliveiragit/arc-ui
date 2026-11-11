# Expanding search

> Um ícone que se transforma em campo de busca, com resultados logo abaixo.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/expanding-search
- Descrição original (inglês): An icon that morphs into a search field with results beneath it.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expanding-search.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expanding-search.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expanding-search.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expanding-search.json`. Caminho do registro, relativo ao endereço do site: `r/expanding-search.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/expanding-search/expanding-search.tsx`
  - `components/ryan-ui/expanding-search/expanding-search.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/expanding-search.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Cabeçalhos e barras de ferramentas em que um campo de busca sempre aberto apertaria o layout.
- Busca num conjunto que já está no cliente (projetos, documentos, pessoas), com resultados agrupados por `group` logo abaixo do campo.
- Quando vale sugerir algo antes da digitação: `suggestions` aparece assim que o campo abre, sob o título `suggestionsLabel`.

## Quando não usar

- Use [`search-field`](search-field.md) quando a busca é a ação principal da tela e deve ficar sempre visível como campo.
- Use [`command-palette`](command-palette.md) quando os resultados são comandos com atalhos, não itens para abrir.
- Use [`morphing-search`](morphing-search.md) quando precisa controlar o texto e a abertura de fora ou abrir a busca por um atalho de teclado: aqui consulta e estado são internos.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { FileText, Folder, Users } from "lucide-react";
import ExpandingSearch, { type ExpandingSearchItem } from "@/components/ryan-ui/expanding-search/expanding-search";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 460 };

const icon = (n: typeof Folder) => { const I = n; return <I size={16} aria-hidden="true" />; };
const items: ExpandingSearchItem[] = [
  { id: "p1", title: "Q4 launch plan", meta: "Project, edited 2 hours ago", group: "Projects", icon: icon(Folder) },
  { id: "p2", title: "Website redesign", meta: "Project, edited yesterday", group: "Projects", icon: icon(Folder) },
  { id: "p3", title: "Mobile onboarding", meta: "Project, edited Monday", group: "Projects", icon: icon(Folder) },
  { id: "d1", title: "Brand guidelines", meta: "Document, Emma Collins", group: "Docs", icon: icon(FileText), keywords: ["logo", "colors"] },
  { id: "d2", title: "API reference", meta: "Document, Daniel Kim", group: "Docs", icon: icon(FileText) },
  { id: "d3", title: "Pricing FAQ", meta: "Document, Hannah Walsh", group: "Docs", icon: icon(FileText) },
  { id: "t1", title: "Design team", meta: "Team, 12 members", group: "Teams", icon: icon(Users) },
  { id: "t2", title: "Platform engineering", meta: "Team, 8 members", group: "Teams", icon: icon(Users) },
];

export default function ExpandingSearchDemo() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <Stack gap={4} width={420} align="stretch">
      <ExpandingSearch label="Search projects and docs" items={items} suggestions={items.slice(0, 3)} placeholder="Search projects, docs, teams…" onSelect={(i) => setPicked(i.title)} anchor="start" />
      <Caption>{picked ? `Opened “${picked}”.` : "Click the icon, then type “brand” or “team”."}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ExpandingSearch`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | Names the button, the field, and the results, such as "Search projects and docs". |
| `items` (obrigatória) | `ExpandingSearchItem[]` | — | — |
| `suggestions` | `ExpandingSearchItem[]` | `[]` | Shown before anything is typed, such as recent searches. |
| `suggestionsLabel` | `string` | `"Recent"` | — |
| `placeholder` | `string` | — | — |
| `onSelect` | `(item: ExpandingSearchItem) => void` | — | — |
| `onExpandedChange` | `(expanded: boolean) => void` | — | — |
| `expandedWidth` | `number` | `360` | The widest the field grows. It never grows past its container. |
| `maxResults` | `number` | `6` | — |
| `anchor` | `"start" \| "end"` | `"end"` | The edge the button sits on; the field grows away from it. |
| `emptyHint` | `string` | `"Try a shorter word or check the spelling."` | A short tip under the empty state. |
| `className` | `string` | — | — |

### Tipos exportados

#### `ExpandingSearchItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `title` (obrigatória) | `string` | — |
| `meta` | `string` | One short line under the title, such as the type, owner, or last edit. |
| `group` | `string` | Results gather under this heading, in the order groups first appear in `items`. |
| `icon` | `ReactNode` | — |
| `keywords` | `string[]` | Extra words that should also find this item. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No botão da lupa, abrem o campo e levam o foco a ele. |
| `↓` ou `↑` | Movem o destaque pelos resultados ou pelas sugestões, dando a volta nas pontas. |
| `Enter` | No campo, escolhe o item em destaque, chama `onSelect` e recolhe a busca. |
| `Esc` | Recolhe o campo de volta ao ícone, limpa o texto e devolve o foco ao botão. |

## Acessibilidade

- Recolhido, é um `<button>` nomeado por `label`; aberto, o campo é um `role="combobox"` com `aria-activedescendant`, e os resultados formam um `role="listbox"` com grupos rotulados.
- Uma região `role="status"` anuncia a quantidade de resultados ou a falta deles em inglês fixo (`3 results`, `No results for …`); `emptyHint` e `suggestionsLabel` são traduzíveis por prop.
- Ao digitar, o primeiro resultado já fica em destaque, então `Enter` o escolhe; sair do campo vazio o recolhe, e o botão de limpar fica fora da ordem de tabulação.

## Movimento

- O botão redondo estica até virar o campo com uma mola, e o raio dos cantos acompanha a largura, do círculo ao raio de controle.
- O painel desdobra a partir do campo e depois só a altura segue o conteúdo; as linhas deslizam para a nova posição quando a lista muda e o destaque viaja de uma linha a outra.
- Com “reduzir movimento” ligado, a largura muda na hora e painel e resultados só esmaecem.

## Comportamento responsivo

- Ocupa 100% da largura do contêiner como uma faixa que não intercepta cliques; o campo cresce até `expandedWidth` (padrão 360 px) ou até a largura dessa faixa, o que for menor.
- O painel de resultados rola por dentro acima de `min(22rem, 60vh)`, e títulos longos são cortados com reticências.

## Desempenho

- A busca percorre `items` inteiro a cada tecla, mas só `maxResults` linhas (padrão 6) são renderizadas; dois `ResizeObserver` acompanham a faixa e o painel.

## Notas para IA

- Coloque-o num contêiner com a largura que o campo pode ocupar e escolha `anchor` (`start` ou `end`, padrão `end`) para dizer em que borda o botão fica.
- `label` é obrigatório; cada item é `{ id, title, meta?, group?, icon?, keywords? }`, e a ordem dos grupos segue a primeira aparição de cada um em `items`.
- O texto e o estado aberto são internos: reaja a `onSelect(item)` e `onExpandedChange`; a busca é local, olha `title`, `meta` e `keywords` e não diferencia maiúsculas.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/expanding-search · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
