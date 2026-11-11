# Blog grid

> Índice de blog com post em destaque, filtro por categoria, cartões, paginação e leitor no próprio lugar.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/blog-grid
- Descrição original (inglês): A blog index with a featured post, category filter, post cards, pagination and an in-place reader.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/blog-grid.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/blog-grid.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/blog-grid.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/blog-grid.json`. Caminho do registro, relativo ao endereço do site: `r/blog-grid.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/blog-grid/blog-grid.tsx`
  - `components/ryan-ui/blocks/blog-grid/blog-grid-data.ts`
  - `components/ryan-ui/blocks/blog-grid/blog-grid.module.css`
  - `components/ryan-ui/lib/media.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/blog-grid.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Índice de blog ou de novidades de um site, com um post em destaque, filtro por categoria e paginação, tudo a partir de uma lista de posts em memória.
- Protótipos e sites estáticos sem roteador: sem `getHref`, o clique abre o post num leitor no próprio lugar e “All posts” volta ao índice.
- Listas editoriais com imagem de capa, resumo, autor e tempo de leitura em cada cartão.

## Quando não usar

- Use [`changelog-feed`](changelog-feed.md) para notas de versão, com tipo de mudança, número da versão e navegação por mês.
- Use [`infinite-masonry`](infinite-masonry.md) quando o conteúdo é um feed de imagens de alturas diferentes que carrega ao rolar.
- Evite quando os posts chegam paginados do servidor: o bloco ordena, filtra e pagina no cliente a lista inteira passada em `posts`.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import BlogGrid from "@/components/ryan-ui/blocks/blog-grid/blog-grid";

export default function BlogGridDemo() {
  return <BlogGrid />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `BlogGrid`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` | `string` | `"Journal"` | — |
| `description` | `string` | `"Product news, design notes and engineering d…` | — |
| `posts` | `BlogPost[]` | `blogPosts` | — |
| `categories` | `string[]` | `blogCategories` | Category filter labels, in order. "All" is added in front. |
| `category` | `string` | — | Active category, or "All" (controlled). |
| `defaultCategory` | `string` | `"All"` | — |
| `onCategoryChange` | `(category: string) => void` | — | — |
| `page` | `number` | — | One based page (controlled). |
| `defaultPage` | `number` | `1` | — |
| `onPageChange` | `(page: number) => void` | — | — |
| `pageSize` | `number` | `6` | Cards per page below the featured post. Defaults to 6. |
| `showFeatured` | `boolean` | `true` | Shows the newest post of the current filter as a large card on page one. Defaults to true. |
| `getHref` | `(post: BlogPost) => string` | — | Link for each post. When set, cards render as links and the in-place reader is off. |
| `onPostOpen` | `(post: BlogPost) => void` | — | Called when a post opens, from a link or the in-place reader. |
| `className` | `string` | — | — |

### `BlogGridBlock`

Preview: the blog index with the in-place reader.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

#### `BlogAuthor`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` (obrigatória) | `string` | — |
| `avatar` | `string` | — |
| `role` | `string` | — |

#### `BlogPost`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `title` (obrigatória) | `string` | — |
| `excerpt` (obrigatória) | `string` | — |
| `category` (obrigatória) | `string` | — |
| `date` (obrigatória) | `string` | ISO date, used for sorting and the visible date. |
| `readTime` (obrigatória) | `number` | Minutes to read. |
| `author` (obrigatória) | `BlogAuthor` | — |
| `image` | `{ src: string; alt: string }` | — |
| `body` | `string[]` | Paragraphs for the in-place reader. Leave out when every post links out through getHref. |
| `featured` | `boolean` | — |

### Outras exportações

- `blogCategories` (valor)
- `blogPosts` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` | Num cartão, abre o post no leitor e leva o foco ao botão “All posts”; com `getHref`, segue o link. |
| `Enter` ou `Espaço` | Acionam os filtros de categoria, os números de página e os botões “Previous”, “Next” e “All posts”. |

## Acessibilidade

- Os cartões são links (`<a>`), os filtros são botões com `aria-pressed` e a paginação é um `<nav>` com `aria-current="page"` na página atual.
- Ao abrir o leitor o foco vai para “All posts”; ao fechar, volta ao cartão de origem, que é rolado para a área visível; não há tecla Esc para fechar.
- Preencha `image.alt` de cada post: é o texto alternativo da capa no cartão e no leitor; o avatar do autor é decorativo (`alt=""`).

## Movimento

- A capa do cartão viaja e cresce até virar a imagem do leitor (elemento compartilhado, mola sem ultrapassagem) e faz o caminho de volta ao fechar, enquanto o resto do índice some e reaparece aos poucos.
- Trocar de página desliza o conteúdo no sentido da navegação, os realces do filtro e da página deslizam até o novo item e a altura acompanha com uma mola, sem salto da paginação.
- Com “reduzir movimento” ligado, a capa não viaja, as trocas viram um esmaecer, os realces e a altura mudam na hora e a rolagem até o topo deixa de ser suave.

## Comportamento responsivo

- Container query no próprio bloco: três colunas, duas abaixo de 900px e uma abaixo de 540px; abaixo de 680px o destaque empilha a imagem sobre o texto.
- A faixa de filtros rola na horizontal sem barra de rolagem, e abaixo de 540px “Previous” e “Next” ficam só com o ícone.

## Desempenho

- As capas usam `<img>` simples com `loading="lazy"` (a do destaque carrega na hora), então sirva arquivos já redimensionados; um `ResizeObserver` mede a página para animar a altura.

## Notas para IA

- Importe `BlogGrid` pelo nome para passar props (a exportação padrão, `BlogGridBlock`, é só a prévia); `category` e `page` aceitam uso controlado com `onCategoryChange` e `onPageChange`.
- Com `getHref` os cartões viram links reais e o leitor é desligado; sem ele, preencha `body` de cada post (parágrafos em texto puro), senão o leitor mostra só o resumo.
- Passe `categories` com as mesmas categorias usadas em `posts` (o padrão é a lista de exemplo; “All” é acrescentada pelo bloco) e datas ISO em `date` (`2026-09-18`), que ordenam os posts e geram a data exibida.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/blog-grid · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
