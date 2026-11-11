# Not found

> Página 404 com uma ilustração animada feita de formas, um campo de busca e atalhos para voltar ao site.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/not-found
- Descrição original (inglês): A 404 page with an illustration built from shapes (a zero with eyes that follow the pointer between two fours), a search field that filters the suggested pages, and links back.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/not-found.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/not-found.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/not-found.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/not-found.json`. Caminho do registro, relativo ao endereço do site: `r/not-found.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/not-found/not-found.tsx`
  - `components/ryan-ui/blocks/not-found/not-found.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/not-found.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Página 404 de um site ou app que tem alguns destinos conhecidos para sugerir e, de preferência, uma busca para onde mandar a consulta.
- Produtos em que uma página de erro pode ter tom leve: a ilustração tem um zero com rosto que segue o mouse e pula ao ser clicado.

## Quando não usar

- Use [`empty-state`](empty-state.md) quando a página existe, mas uma lista ou busca não tem o que mostrar.
- Use [`alert`](alert.md) para um erro recuperável dentro de uma tela que continua útil.
- Para erro 500 ou manutenção a arte não serve: os dois quatros e o zero estão desenhados no SVG do arquivo.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import NotFoundPreview from "@/components/ryan-ui/blocks/not-found/not-found";
import type { DemoStage } from "./_kit";

// The whole page (picture, copy, search and links) is taller than the default block stage.
export const stage: DemoStage = { height: 820 };

export default function NotFoundDemo() {
  return <NotFoundPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `NotFound`

A 404 page that is pleasant to land on. The picture is built from plain shapes: two fours and a round zero with eyes that follow the pointer, blink, and hop when poked, while small shapes drift around with depth. Below it, a search field filters the suggested pages as you type.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `eyebrow` | `string` | `"Error 404"` | Small label above the title. |
| `title` | `string` | `"This page wandered off"` | Main heading. |
| `description` | `string` | `"The link may be old, or the page may have mo…` | Text under the heading. |
| `links` | `NotFoundLink[]` | `defaultLinks` | Pages offered as a way back. The search field filters them as you type. |
| `homeHref` | `string` | `"/"` | Target of the main button. |
| `homeLabel` | `string` | `"Back to home"` | Text of the main button. |
| `searchPlaceholder` | `string` | `"Search pages"` | Placeholder of the search field. |
| `onSearch` | `(query: string) => void` | — | Called with the trimmed query when the search form is submitted. |
| `onNavigate` | `(link: NotFoundLink, event: MouseEvent<HTMLAnchorElement>) => void` | — | Called when a link or the main button is used. Call `event.preventDefault()` to route on the client. |
| `className` | `string` | — | Extra class for the section. |

### `NotFoundPreview`

Ready preview. Links stay on the page and report what they would open.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

#### `NotFoundLink`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | Link text. |
| `href` (obrigatória) | `string` | Where the link goes. |
| `description` | `string` | One short line under the label. |
| `icon` | `ReactNode` | Icon in the link's tile. |
| `keywords` | `string` | Extra words the search should match, separated by spaces. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` | No campo de busca, envia o formulário e chama `onSearch` com o texto sem espaços nas pontas. |

## Acessibilidade

- A seção é nomeada pelo `<h1>` do título, e a ilustração é um `role="img"` com `aria-label` em inglês, fixo no arquivo.
- A busca é um formulário `role="search"` cujo campo usa `searchPlaceholder` como `aria-label`; a linha “N of M pages match” é `aria-live="polite"` e anuncia o resultado do filtro.
- O pulo do zero ao clique não tem equivalente no teclado nem papel de botão: é enfeite e não carrega informação.

## Movimento

- As peças pousam uma após a outra com uma mola de pequeno salto: os quatros e o zero caem de cima e as formas menores surgem crescendo.
- Em repouso, animações CSS fazem o zero flutuar e piscar, o segundo quatro balançar e as formas derivar e girar; com mouse, os olhos seguem o ponteiro e as camadas se deslocam em profundidades diferentes.
- Com “reduzir movimento” ligado, a ilustração aparece parada, sem laços, sem seguir o ponteiro e sem pulo, e os links filtrados trocam na hora.

## Comportamento responsivo

- O bloco é uma coluna centralizada de até 36rem; abaixo de 30rem de viewport a grade de links passa de duas colunas para uma e os espaços diminuem.

## Notas para IA

- Importe o componente nomeado `NotFound`; o export padrão é `NotFoundPreview`, que bloqueia a navegação dos links para a demonstração.
- Passe os `links` do seu site (cada `href` é usado como chave e precisa ser único) e `onSearch` para levar a consulta à sua busca; sem `onSearch`, enviar o formulário não faz nada.
- Para roteamento no cliente, use `onNavigate(link, event)` e chame `event.preventDefault()`; o bloco renderiza um `<h1>`, então deve ser o conteúdo principal da página.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/not-found · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
