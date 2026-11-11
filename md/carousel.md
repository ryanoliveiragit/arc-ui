# Carousel

> Carrossel arrastável que centraliza o slide ativo, com indicadores, setas e rotação opcional.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/carousel
- Descrição original (inglês): Browse a row of slides by dragging, flicking, or arrowing through them.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/carousel.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/carousel.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/carousel.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/carousel.json`. Caminho do registro, relativo ao endereço do site: `r/carousel.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/carousel/carousel.tsx`
  - `components/ryan-ui/carousel/carousel.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/carousel.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um conjunto curto e ordenado de itens do mesmo tipo, como produtos ou estudos de caso, em que os vizinhos à vista indicam que há mais.
- Navegação por toque (arrastar, deslize rápido, gesto horizontal no trackpad) com setas, indicadores e teclado equivalentes.
- Rotação automática opcional com botão de pausa visível, via `interval`.

## Quando não usar

- Use [`marquee`](marquee.md) para uma faixa que rola sozinha sem parar em cada item, como uma fila de logotipos.
- Use [`image-viewer`](image-viewer.md) para fotos que precisam abrir ampliadas, com zoom.
- Use [`card-stack`](card-stack.md) quando a pessoa decide sobre cada item em vez de só navegar.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { Carousel } from "@/components/ryan-ui/carousel/carousel";
import { photo } from "@/components/ryan-ui/lib/media";
import { Stack } from "./_kit";

const suites = [
  { id: "sunroom", name: "Garden suite", price: "$240 a night", img: photo("sunroom") },
  { id: "reading-chair", name: "Library suite", price: "$285 a night", img: photo("reading-chair") },
  { id: "pool-house", name: "Pool house", price: "$360 a night", img: photo("pool-house") },
  { id: "bedroom", name: "Loft suite", price: "$310 a night", img: photo("home-office") },
  { id: "curved-facade", name: "Courtyard room", price: "$195 a night", img: photo("curved-facade") },
];

export default function CarouselDemo() {
  return (
    <Stack width={720}>
      <Carousel label="Harbour suites" interval={4500}>
        {suites.map(s => (
          <figure key={s.id} style={{ margin: 0, overflow: "hidden", border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", background: "var(--surface)" }}>
            <img src={s.img.src} alt={s.img.alt} draggable={false} style={{ display: "block", width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }} />
            <figcaption style={{ padding: "var(--space-3) var(--space-4)", display: "grid" }}>
              <strong>{s.name}</strong>
              <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{s.price}</span>
            </figcaption>
          </figure>
        ))}
      </Carousel>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Carousel`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | Names the carousel for assistive technology, for example "From the Harbour suites". |
| `children` (obrigatória) | `ReactNode` | — | One child per slide. |
| `index` | `number` | — | Controlled active slide. Pair with `onIndexChange`. |
| `defaultIndex` | `number` | `0` | — |
| `onIndexChange` | `(index: number) => void` | — | — |
| `slideSize` | `string` | `"min(80cqw, 340px)"` | Width of one slide as a CSS length. Use `cqw` for a share of the carousel width. |
| `slideLabel` | `(index: number, count: number) => string` | `defaultSlideLabel` | Names each slide and its indicator. Defaults to "2 of 5". |
| `interval` | `number` | — | Milliseconds per slide. Adds a play control that rotates through the slides; rotation pauses on hover, keyboard focus, and drag, and is unavailable with reduced motion. |
| `autoplay` | `boolean` | `false` | Starts rotating on mount. Off by default, so motion begins with the viewer. |
| `className` | `string` | — | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Vão ao slide anterior ou ao seguinte, com o foco em qualquer parte do carrossel fora de campos de texto. |
| `Home` ou `End` | Vão ao primeiro ou ao último slide. |
| `Tab` | Percorre a área dos slides, o conteúdo do slide ativo, o botão de rotação, o indicador selecionado e as duas setas. |
| `Enter` ou `Espaço` | Acionam o botão em foco: pausar ou iniciar a rotação, escolher um slide, anterior ou próximo. |

## Acessibilidade

- A `section` tem `aria-roledescription="carousel"` e o nome de `label`; cada slide é um `tabpanel` rotulado por `slideLabel`, e os indicadores formam um `tablist` em que só o selecionado fica na ordem de tabulação.
- Slides fora do centro ficam `inert`: links e botões dentro deles só funcionam no slide ativo, e a troca manual é anunciada numa região `aria-live`.
- A rotação pausa ao passar o mouse, no foco do teclado, no arrasto, fora da tela e com a aba oculta; os rótulos dos controles (“Next slide”, “Pause slide rotation”) estão em inglês no código.

## Movimento

- A trilha vai ao slide com mola sem ultrapassagem, levando a velocidade do gesto; nas pontas ela resiste como um elástico.
- Os slides encolhem até 90% e esmaecem até 50% conforme se afastam do centro, e o indicador estica numa pílula que viaja junto, quadro a quadro; na rotação, a pílula esvazia até a troca.
- Com “reduzir movimento”, a trilha salta para o slide e a rotação automática fica indisponível (o botão nem aparece).

## Comportamento responsivo

- A raiz é um contêiner de tamanho e precisa de largura definida; `slideSize` (padrão `min(80cqw, 340px)`) aceita qualquer comprimento CSS, e `cqw` é a fração da largura do carrossel.
- Com até 340 px de contêiner a linha de controles aperta; a área dos slides usa `touch-action: pan-y`, então o gesto vertical rola a página.

## Desempenho

- Todos os slides ficam montados e leem a posição da trilha a cada quadro para escala e opacidade: mantenha o conjunto curto.
- Com `interval`, um `IntersectionObserver` e o evento de visibilidade da página pausam a rotação quando ninguém está vendo.

## Notas para IA

- Cada filho é um slide (dê `key` estável) e `label` é obrigatório; índice controlado com `index` e `onIndexChange`, ou livre com `defaultIndex`.
- `interval` (ms por slide) só adiciona o botão de rotação; ela começa parada, a menos que você passe `autoplay`.
- Não há laço: as setas param no primeiro e no último slide, e só a rotação automática volta ao início.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/carousel · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
