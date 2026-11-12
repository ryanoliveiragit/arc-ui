# Citations

> Números de citação no meio do texto que abrem um cartão com a fonte, mais a lista de fontes com destaque compartilhado.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/citations
- Descrição original (inglês): Numbered citation chips inside text that open a card with the source title, site and snippet, plus a sources list; chips and rows share one gliding highlight.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/citations.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/citations.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/citations.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/citations.json`. Caminho do registro, relativo ao endereço do site: `r/citations.json`.

- Pacotes npm: `motion`, `lucide-react`, `@radix-ui/react-popover`
- Arquivos, depois de instalados:
  - `components/ryan-ui/citations/citations.tsx`
  - `components/ryan-ui/citations/citations.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react @radix-ui/react-popover`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/citations.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Respostas de IA ou textos de pesquisa em que cada afirmação aponta para uma fonte numerada.
- Quando o leitor deve conferir título, site e trecho da fonte sem sair do parágrafo, e abrir o original só se quiser.
- Quando há uma lista de fontes no fim e ela deve destacar a fonte do chip apontado no texto, e o chip quando se aponta a linha.

## Quando não usar

- Use [`hover-card`](hover-card.md) para a prévia de uma pessoa ou de um link solto, sem numeração nem lista de fontes.
- Use [`tooltip`](tooltip.md) quando a nota é só um texto curto, sem link nem conteúdo interativo.
- Fontes sem endereço não cabem aqui: o endereço é obrigatório, e tanto o título do cartão quanto a linha da lista são links para ele.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { Citation, Citations, CitationSources } from "@/components/ryan-ui/citations/citations";
import type { CitationSource } from "@/components/ryan-ui/citations/citations";
import { Caption, Stack, Surface, demoStage } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

const sources: CitationSource[] = [
  {
    id: "mdn",
    title: "prefers-reduced-motion",
    site: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion",
    snippet: "A media feature that tells a page whether the person has asked their system to keep non-essential motion to a minimum.",
  },
  {
    id: "wcag",
    title: "Understanding SC 2.3.3: Animation from Interactions",
    site: "W3C WAI",
    url: "https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html",
    snippet: "Motion that an interaction triggers should be possible to turn off, unless the animation is essential to the function or to the information.",
  },
  {
    id: "webdev",
    title: "prefers-reduced-motion: Sometimes less movement is more",
    site: "web.dev",
    url: "https://web.dev/articles/prefers-reduced-motion",
    snippet: "Not everyone enjoys decorative animation, and for some people it causes real discomfort. The article shows how to adapt a page to the preference.",
  },
  {
    id: "webkit",
    title: "Responsive Design for Motion",
    site: "WebKit Blog",
    date: "2017",
    url: "https://webkit.org/blog/7551/responsive-design-for-motion/",
    snippet: "Introduces the media query and walks through the kinds of movement that tend to trigger vestibular symptoms, with ways to tone each one down.",
  },
];

export default function CitationsDemo() {
  return (
    <Stack width={560} gap={3}>
      <Surface padding={6}>
        <Citations sources={sources} container={demoStage()}>
          <p>
            Operating systems let people ask for less motion, and browsers pass that choice to your CSS through a media feature
            <Citation source="mdn" />. The accessibility guidelines treat it as more than taste: movement that an interaction starts should be
            possible to switch off unless it is essential
            <Citation source="wcag" defaultOpen />. In practice you rarely remove animation altogether. Swapping a long slide for a short fade keeps the
            feedback without the travel
            <Citation source="webdev" />
            <Citation source="webkit" />.
          </p>
          <CitationSources />
        </Citations>
      </Surface>
      <Caption>Hover a number to preview its source, or click to pin the card. Chips and list rows share one highlight.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Citations`

Groups an answer with its sources. Inside it, `<Citation>` is a numbered chip that opens a card with the source, and `<CitationSources>` lists them all. The parts share one highlight: pointing at a chip marks its row in the list, and pointing at a row lights up its chips.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `sources` (obrigatória) | `CitationSource[]` | — | Every source that can be cited, in the order they are numbered. |
| `children` (obrigatória) | `ReactNode` | — | The text with `<Citation>` chips inside it, and usually a `<CitationSources>` list after it. |
| `activeId` | `string \| null` | — | Id of the highlighted source (controlled). |
| `onActiveIdChange` | `(id: string \| null) => void` | — | Called when hover, focus or an open card changes the highlighted source. |
| `container` | `HTMLElement \| null` | `null` | Render the source cards inside this element and limit collisions to it (used by the demo stages). |
| `className` | `string` | — | Class name added to the root element. |

### `Citation`

A numbered chip for the middle of a sentence. Hover, focus plus Enter, or a tap opens a card with the source; a click pins it open.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `source` (obrigatória) | `string` | — | Id of the source this chip cites. |
| `defaultOpen` | `boolean` | `false` | Starts with this chip's card pinned open, for previews. Focus stays where it is until a person uses the card. |
| `className` | `string` | — | Class name added to the chip. |

### `CitationSources`

The numbered list of every source. One highlight glides to the row under the pointer or keyboard focus, or to the source whose chip is active.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` | `string` | `"Sources"` | Heading above the list. |
| `className` | `string` | — | Class name added to the list wrapper. |

### Tipos exportados

#### `CitationSource`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable id that `<Citation source>` refers to. |
| `title` (obrigatória) | `string` | Title of the page or document. |
| `url` (obrigatória) | `string` | Address the source opens. |
| `site` | `string` | Name of the site. Defaults to the host of `url`. |
| `snippet` | `string` | Short passage or summary that supports the claim. |
| `date` | `string` | Publication date or year, as it should be shown. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Passa pelos chips no texto e pelas linhas da lista; o foco numa linha acende os chips da mesma fonte. |
| `Enter` ou `Espaço` | No chip, abre o cartão da fonte e leva o foco para ele. |
| `Enter` | No título do cartão ou numa linha da lista, abre a fonte em nova aba. |
| `Esc` | Fecha o cartão e devolve o foco ao chip. |

## Acessibilidade

- Cada chip é um `<button>` com `aria-label` “Source N: título”; o cartão é um popover do Radix (`role="dialog"`) que só recebe o foco quando aberto por clique ou teclado, nunca por hover.
- A lista é uma `<section>` rotulada pelo próprio título, com um `<ol>` de links que abrem em nova aba com `rel="noreferrer noopener"`.
- Os rótulos “Source N” estão fixos em inglês; o título da lista vem da prop `title` de `CitationSources` (padrão “Sources”).

## Movimento

- O cartão cresce a partir do chip, com escala e esmaecer, e suas linhas entram em sequência; o chip ativo aumenta um pouco.
- Um único realce desliza entre as linhas da lista com uma mola, seguindo o ponteiro, o foco ou o chip ativo; as linhas entram escalonadas na montagem.
- Com “reduzir movimento” ligado, cartão e linhas aparecem sem animação e o realce troca de linha na hora.

## Comportamento responsivo

- O cartão tem no máximo 20rem de largura e encolhe com a janela; abre acima do chip e o Radix o reposiciona para caber, com 12 px de folga.
- O chip nunca se separa da palavra anterior na quebra de linha; na lista, o título corta em duas linhas, e no cartão o trecho corta em quatro.

## Notas para IA

- São três partes do mesmo arquivo: `Citations` recebe `sources` e envolve o texto, `Citation source="id"` vai dentro da frase e `CitationSources` lista tudo; as duas últimas lançam erro fora de `Citations`.
- O número vem da posição em `sources` (índice + 1), não da ordem em que o chip aparece no texto; um `source` que não existe em `sources` não renderiza nada.
- Ponha `<Citation>` logo depois da palavra e antes da pontuação; `site` é opcional e, sem ele, aparece o host de `url`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/citations · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
