# Morphing search

> Ícone de busca que se estica em campo e depois abre um painel de resultados; Esc desfaz o caminho passo a passo.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/morphing-search
- Descrição original (inglês): A search icon that stretches into a field and then grows a results panel with a gliding highlight; Escape walks the same steps back.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morphing-search.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morphing-search.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morphing-search.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morphing-search.json`. Caminho do registro, relativo ao endereço do site: `r/morphing-search.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/morphing-search/morphing-search.tsx`
  - `components/ryan-ui/blocks/morphing-search/morphing-search.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/morphing-search.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Busca na barra superior de um app em que o espaço é curto: em repouso é só um ícone de 44 px e abre por clique ou pela tecla `/`.
- Navegação rápida por uma lista local de páginas, pessoas e ações, agrupada por tipo e limitada a poucos resultados (`limit`, padrão 6).

## Quando não usar

- Use [`command-palette`](command-palette.md) quando a busca é a superfície principal de comandos, com atalhos por item, e não um campo dentro da barra.
- Use [`expanding-search`](expanding-search.md) quando precisa de sugestões recentes antes de digitar ou de dar nome acessível próprio ao campo; aqui os rótulos são fixos em inglês.
- Use [`search-field`](search-field.md) quando o campo fica sempre visível e os resultados aparecem em outra parte da tela.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import MorphingSearchPreview from "@/components/ryan-ui/blocks/morphing-search/morphing-search";
import type { DemoStage } from "./_kit";

// The toolbar app fills the frame; opened, the search panel covers the page inside it.
export const stage: DemoStage = { height: 600 };

export default function MorphingSearchDemo() {
  return <MorphingSearchPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `MorphingSearch`

A search icon that stretches into a field and then lets a results panel grow out of it; Escape walks the same steps back.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` | `SearchItem[]` | `sampleSearchItems` | Everything that can be found. Defaults to sample pages, people and actions. |
| `open` | `boolean` | — | Whether the icon has grown into the field. Pass it with `onOpenChange` to control it. |
| `defaultOpen` | `boolean` | `false` | Whether the search starts open when uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the search opens or closes. |
| `query` | `string` | — | Text in the field. Pass it with `onQueryChange` to control it. |
| `defaultQuery` | `string` | `""` | Starting text when uncontrolled. |
| `onQueryChange` | `(query: string) => void` | — | Called with the text of the field whenever it changes. |
| `onSelect` | `(item: SearchItem) => void` | — | Called with the chosen result. The search closes afterwards. |
| `placeholder` | `string` | `"Search pages, people, actions"` | Hint shown in the empty field. |
| `width` | `number` | `440` | Width of the open field in px. It never grows past the space the component is given. |
| `align` | `"start" \| "end"` | `"end"` | Edge the field grows from: `end` keeps the icon's right edge in place, `start` its left edge. |
| `shortcut` | `string` | `"/"` | Key that opens the search from anywhere on the page. Pass an empty string to turn it off. |
| `limit` | `number` | `6` | Most results listed at once. |
| `className` | `string` | — | Extra class for the anchor box. |

### `MorphingSearchPreview`

Ready preview: the search living at the end of an app toolbar, above a page it can cover.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

#### `SearchItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique id. |
| `title` (obrigatória) | `string` | Main line. This is what the query is matched against. |
| `subtitle` | `string` | Second line: where the item lives or what it does. |
| `group` (obrigatória) | `string` | Heading the item is listed under. |
| `icon` | `ReactNode` | Icon shown before the title. Defaults to one that fits the sample groups. |
| `keywords` | `string` | Extra words that should match the item. Only the title and these words are searched. |

### Outras exportações

- `sampleSearchItems` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `/` | Abre a busca de qualquer ponto da página, desde que o foco não esteja num campo de texto; a tecla vem de `shortcut`. |
| `↓` ou `↑` | Movem o destaque pela lista de resultados, dando a volta nas pontas. |
| `Enter` | Escolhe o resultado destacado, chama `onSelect`, fecha a busca e devolve o foco ao ícone. |
| `Esc` | Primeiro limpa o texto; com o campo vazio, fecha a busca e devolve o foco ao ícone. |
| `Tab` | Fecha a busca e limpa o texto, sem impedir que o foco siga adiante. |

## Acessibilidade

- O campo é um `role="combobox"` com `aria-expanded`, `aria-controls` e `aria-activedescendant`; os resultados são `role="option"` dentro de um `listbox`, em grupos nomeados pelos títulos.
- O foco fica no campo enquanto o destaque percorre as opções; fechada, a busca deixa o campo `disabled` e o painel `inert`, e o estado sem resultados usa `role="status"`.
- Os nomes acessíveis (“Search”, “Results”, “Clear search”) e os títulos “Suggested …” estão fixos em inglês no arquivo.

## Movimento

- O ícone estica até virar o campo com uma mola sem ultrapassagem e só depois o painel de resultados cresce para baixo; ao fechar, o painel dobra primeiro e o campo encolhe em seguida.
- Um único destaque desliza entre as linhas conforme as setas ou o ponteiro, e os resultados entram subindo 8 px e se reposicionam quando a lista filtra.
- Com “reduzir movimento” ligado, largura, altura, destaque e linhas trocam na hora.

## Comportamento responsivo

- A largura aberta é o menor valor entre `width` (padrão 440 px) e o espaço medido da âncora, então o campo nunca passa do contêiner.
- Abaixo de 36rem de viewport, a linha de dicas de teclado no rodapé do painel é escondida.

## Desempenho

- A filtragem é local e síncrona sobre `items` a cada tecla, sem estado de carregamento: serve para listas em memória, não para busca remota.
- Usa dois `ResizeObserver` (âncora e painel) e ouvintes no `document` só enquanto precisa: `keydown` para o atalho quando fechada e `pointerdown` quando aberta.

## Notas para IA

- Importe o componente nomeado `MorphingSearch`; o export padrão do arquivo é `MorphingSearchPreview`, a demonstração com um app fictício em volta.
- A âncora ocupa 100% da largura do pai e reserva só 44 px de altura: o campo cresce até `width` a partir da borda de `align` e flutua sobre o conteúdo, então o pai precisa dar esse espaço e não pode cortar com `overflow: hidden`.
- Só `title` e `keywords` entram na busca (`subtitle` não); controle com `open` e `onOpenChange`, `query` e `onQueryChange`, e passe `shortcut=""` para desligar a tecla global.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/morphing-search · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
