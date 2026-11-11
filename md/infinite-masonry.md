# Infinite masonry

> Mural em colunas com cartões de alturas diferentes que carrega mais conforme você rola, com os novos subindo em sequência.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/infinite-masonry
- Descrição original (inglês): Masonry feed of cards with different heights that loads the next page as the end scrolls into view, with new cards rising in on a stagger.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/infinite-masonry.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/infinite-masonry.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/infinite-masonry.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/infinite-masonry.json`. Caminho do registro, relativo ao endereço do site: `r/infinite-masonry.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/infinite-masonry/infinite-masonry.tsx`
  - `components/ryan-ui/blocks/infinite-masonry/infinite-masonry.module.css`
  - `components/ryan-ui/lib/media.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/infinite-masonry.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Galerias e feeds de imagens com proporções diferentes (portfólios, inspiração, fotos de produtos) que carregam a próxima página ao chegar perto do fim.
- Conteúdo vindo de uma API paginada: `loadPage(page)` recebe o número da página e devolve os cartões, e uma lista vazia encerra o feed.

## Quando não usar

- Use [`blog-grid`](blog-grid.md) quando os itens são posts com texto, categoria e paginação numerada.
- Use [`pagination`](pagination.md) com uma grade comum quando a pessoa precisa voltar a uma posição exata ou chegar ao rodapé da página.
- Evite para milhares de itens: não há virtualização, e todos os cartões carregados ficam no DOM.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import InfiniteMasonry from "@/components/ryan-ui/blocks/infinite-masonry/infinite-masonry";

export default function InfiniteMasonryDemo() {
  return <InfiniteMasonry />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `InfiniteMasonry`

Masonry feed: cards of different heights fill the shortest column, and the next page loads when the end scrolls into view.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `initialItems` | `MasonryItem[]` | — | Cards shown before any loading. Defaults to the first sample page. |
| `loadPage` | `(page: number) => Promise<MasonryItem[]>` | `simulatedLoad` | Loads the next page. Receives the page number (1 for the first load after the initial cards). Resolve with an empty list to end the feed. Defaults to a simulated loader. |
| `minColumnWidth` | `number` | `160` | Narrowest a column may get, in px. The grid fits as many columns as its width allows. |
| `maxColumns` | `number` | `4` | Most columns the grid uses, however wide it gets. |
| `title` | `string` | `"Fresh from the studio"` | Heading above the grid. |
| `onLikeChange` | `(id: string, liked: boolean) => void` | — | Called when a card's like button is toggled. |
| `className` | `string` | — | Extra class for the section. |

### Tipos exportados

#### `MasonryItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique id. Cards with an id already in the feed are skipped. |
| `title` (obrigatória) | `string` | Name of the shot, shown under the image. |
| `author` (obrigatória) | `string` | Who made it, shown under the title. |
| `avatar` (obrigatória) | `string` | Avatar image of the author. |
| `image` (obrigatória) | `string` | Image address. |
| `alt` (obrigatória) | `string` | Text alternative of the image. |
| `ratio` (obrigatória) | `number` | Image height divided by its width. The grid reserves this space before the image loads. |
| `likes` (obrigatória) | `number` | Like count before the visitor's own like. |

### Outras exportações

- `sampleMasonryPage` (função)

## Acessibilidade

- O contêiner usa `role="feed"` com `aria-busy` durante o carregamento, e cada cartão é um `article` com `aria-posinset`, `aria-setsize` (−1 até o fim do feed) e nome “título by autor”.
- O botão de curtir expõe `aria-pressed` e um nome com o total de curtidas, e o rodapé `role="status"` anuncia o carregamento e o fim do feed.
- Preencha `alt` de cada item: é o texto alternativo da imagem; o avatar do autor é decorativo.

## Movimento

- Os cartões novos sobem e crescem um pouco com uma mola suave, em cascata dentro da página que chegou; os que já apareceram não repetem a entrada ao mudar de coluna.
- Enquanto carrega, cada coluna ganha um bloco de espera com um brilho que passa e três pontos saltam no rodapé; curtir faz o coração pular.
- Com “reduzir movimento” ligado, os cartões só esmaecem, o coração não pula, o brilho e os pontos param e a imagem não amplia ao passar o mouse.

## Comportamento responsivo

- O número de colunas sai da largura do próprio bloco (`minColumnWidth`, até `maxColumns`), medida por `ResizeObserver`; colunas com menos de 200px escondem o avatar.
- Cada imagem reserva a altura por `ratio` antes de carregar, então a grade não pula quando as fotos chegam.

## Desempenho

- Um `IntersectionObserver` dispara `loadPage` 320px antes do fim e continua pedindo páginas enquanto o fim estiver à vista; as imagens usam `loading="lazy"`.

## Notas para IA

- Passe `loadPage` (sem ele, o bloco simula quatro páginas de exemplo) e devolva `[]` para encerrar; um erro também encerra o feed, sem nova tentativa.
- Cada item precisa de `ratio` (altura dividida pela largura da imagem): é com ele que o bloco reserva espaço e equilibra as colunas; ids repetidos são descartados.
- As curtidas são estado interno e começam vazias: `onLikeChange(id, liked)` avisa a mudança, mas não há prop para carregar o que a pessoa já curtiu.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/infinite-masonry · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
