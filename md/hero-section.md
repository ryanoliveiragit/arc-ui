# Hero section

> Hero em três versões sem gradientes: janela de produto viva, fluxo de automação com pulso e tipografia editorial com marquee.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/hero-section
- Descrição original (inglês): A landing page hero in three versions on a solid page with a faint dot grid: a live product window with counting figures, a self-drawing chart and floating cards; an automation graph with a pulse travelling along its lines; and editorial type over a marquee of words.
- Versões: Produto (`hero-section` com `variant="product"`), Fluxo (`hero-section` com `variant="workflow"`), Editorial (`hero-section` com `variant="editorial"`)

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hero-section.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hero-section.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hero-section.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hero-section.json`. Caminho do registro, relativo ao endereço do site: `r/hero-section.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Animated counter](animated-counter.md), [Avatar](avatar.md), [Badge](badge.md), [Button](button.md), [Copy button](copy-button.md), [Marquee](marquee.md), [Segmented control](segmented-control.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/hero-section/hero-section.tsx`
  - `components/ryan-ui/blocks/hero-section/hero-section.module.css`
  - `components/ryan-ui/blocks/hero-section/hero-parts.tsx`
  - `components/ryan-ui/blocks/hero-section/hero-content.tsx`
  - `components/ryan-ui/blocks/hero-section/hero-content.module.css`
  - `components/ryan-ui/blocks/hero-section/hero-motion.ts`
  - `components/ryan-ui/blocks/hero-section/hero-lumen.tsx`
  - `components/ryan-ui/blocks/hero-section/hero-lumen.module.css`
  - `components/ryan-ui/blocks/hero-section/hero-lumen-data.ts`
  - `components/ryan-ui/blocks/hero-section/hero-relay.tsx`
  - `components/ryan-ui/blocks/hero-section/hero-relay.module.css`
  - `components/ryan-ui/blocks/hero-section/hero-cadence.tsx`
  - `components/ryan-ui/blocks/hero-section/hero-cadence.module.css`
  - `components/ryan-ui/animated-counter/animated-counter.tsx`
  - `components/ryan-ui/animated-counter/animated-counter.module.css`
  - `components/ryan-ui/avatar/avatar.tsx`
  - `components/ryan-ui/avatar/avatar.module.css`
  - `components/ryan-ui/lib/ryan-provider.tsx`
  - `components/ryan-ui/badge/badge.tsx`
  - `components/ryan-ui/badge/badge.module.css`
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`
  - `components/ryan-ui/copy-button/copy-button.tsx`
  - `components/ryan-ui/copy-button/copy-button.module.css`
  - `components/ryan-ui/lib/use-copy-feedback.ts`
  - `components/ryan-ui/marquee/marquee.tsx`
  - `components/ryan-ui/marquee/marquee.module.css`
  - `components/ryan-ui/segmented-control/segmented-control.tsx`
  - `components/ryan-ui/segmented-control/segmented-control.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/hero-section.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Abertura de uma landing page de produto: uma janela de produto viva (`product`), um fluxo de automação rodando (`workflow`) ou tipografia grande sobre uma faixa de palavras (`editorial`).
- Hero com o seu próprio conteúdo (título, descrição, ações, comando de instalação e um visual ao lado), passando `title`, sem montar o layout do zero.

## Quando não usar

- Use [`cta-section`](cta-section.md) para uma chamada no meio ou no fim da página.
- Use [`site-header`](site-header.md) para a navegação do site: a barra das versões desenhadas rola junto com o hero e perde os links em telas estreitas.
- Evite usar as versões desenhadas com a sua marca sem editar o código: textos, números e nomes (Lumen, Relay, Cadence) são de exemplo, e só as ações vêm por props.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import HeroSectionBlock, { HeroSection, heroSectionVariants } from "@/components/ryan-ui/blocks/hero-section/hero-section";
import type { DemoStage } from "./_kit";

/** Tall enough for the product window to show under the copy; the frame lets the hero follow its own width. */
export const stage: DemoStage = { layout: "fill", frame: true, height: 920 };

/** With `variant` ("product", "workflow" or "editorial") the demo shows exactly that version; without it, the block's own switcher. */
export default function HeroSectionDemo({ variant }: { variant?: string }) {
  const chosen = heroSectionVariants.find(option => option.value === variant);
  return chosen ? <HeroSection key={chosen.value} variant={chosen.value} /> : <HeroSectionBlock />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `HeroSection`

A landing page hero in three designs on a solid page with a faint dot grid: a live product window with floating cards, an automation graph that routes sample events, and editorial type over a strip of scrolling words. No gradients.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `HeroSectionVariant \| HeroSectionLegacyVariant` | `"product"` | `product` is centered copy over a live product window with floating cards, `workflow` sets the copy beside an automation graph that runs sample events with a pulse along each line, and `editorial` is very large type over a scrolling strip of words. The earlier names `centered`, `split` and `minimal` map to them in that order. |
| `animateIn` | `boolean` | `true` | Plays the entrance once on mount. Defaults to true. |
| `primaryAction` | `HeroAction \| null` | — | The main call to action. With `doneLabel` and no `href`, the button confirms in place. |
| `secondaryAction` | `HeroAction \| null` | — | The second call to action. |
| `title` | `string` | — | Your own headline. When set, the hero renders your content in the chosen layout (see `HeroContent`) instead of the designed sample, together with the props below. |
| `description` | `string` | — | One or two sentences under your own headline. |
| `announcement` | `HeroAction \| null` | — | A small pill above your own headline. |
| `install` | `HeroInstallCommand[] \| null` | — | Install commands for your own content; the first one is shown with a copy button. |
| `media` | `ReactNode` | — | A visual beside your own content in the workflow layout. |
| `meta` | `string[]` | — | Small facts under your own content, such as the version and license. |
| `highlight` | `string` | — | Kept for compatibility; highlighted phrases render as plain text. |
| `className` | `string` | — | — |

### `HeroSectionBlock`

Preview: a slim bar to choose the version, and the chosen hero filling the rest of the screen. Switching replays the entrance.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `"product" \| "workflow" \| "editorial"` | `"product"` | The version shown first. Defaults to `product`. |

### `HeroNav`

The bar across the top of a hero: brand, section links, and the way in.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `brand` (obrigatória) | `string` | — | Product name beside the mark. |
| `mark` | `ReactNode` | — | A small glyph drawn on the accent tile, in the accent's text color. |
| `brandHref` | `string` | — | Where the brand links to. Without it the brand is plain text. |
| `links` | `HeroNavLink[]` | `[]` | Section links. They hide on narrow screens. |
| `signIn` | `HeroNavLink \| null` | `{ label: "Sign in" }` | The quiet entry on the right, such as "Sign in". Hides on narrow screens. |
| `action` | `HeroNavLink \| null` | `{ label: "Get started" }` | The button on the right. |
| `animateIn` | `boolean` | `true` | Fades the bar in on mount. Defaults to true. |

### `HeroBackdrop`

The faint grid of solid dots behind a hero. Set `--dots-fade` on it (a mask image) to choose where the grid fades out.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### `HeroMark`

One phrase of a headline under a solid accent marker that draws in from left to right.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `string` | — | The phrase to mark. Keep it short: it never breaks across lines. |
| `animateIn` | `boolean` | `true` | Draws the marker in from the left on mount. Defaults to true; reduced motion shows it drawn. |

### `ActionLink`

A link or button that looks like a ryan-ui button. Links keep native navigation; a button with `doneLabel` confirms in place.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### `HeroContent`

The hero with your own content: announcement, headline, description, actions, an optional install line, and an optional visual beside the copy, on a solid page. Use it when none of the three designed variants fits the product.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `layout` (obrigatória) | `"centered" \| "split" \| "minimal"` | — | `centered` stacks the copy in the middle, `split` puts `media` beside it, `minimal` aligns large copy to the left. |
| `announcement` | `HeroAction \| null` | — | A small pill above the headline, such as a release note. |
| `title` (obrigatória) | `string` | — | The headline. |
| `description` | `string` | — | One or two sentences under the headline. |
| `primaryAction` | `HeroAction \| null` | — | The main call to action, filled with the accent. |
| `secondaryAction` | `HeroAction \| null` | — | The second call to action, outlined. |
| `install` | `HeroInstallCommand[] \| null` | — | Install commands; the first one is shown with a copy button. |
| `media` | `ReactNode` | — | A visual beside the copy in the split layout. |
| `meta` | `string[]` | — | Small facts under the copy, such as the version and license. |
| `animateIn` | `boolean` | `true` | Plays the entrance once on mount. Defaults to true. |
| `className` | `string` | — | — |

### `HeroLumen`

Product hero: a navigation bar, a headline with one phrase under a solid accent marker, two actions, social proof, and a live product window on a solid page with a faint dot grid. In the window the figures roll up, the chart draws itself and its range control changes every number; two small cards float over its edges. Everything enters in a stagger, and nothing moves under reduced motion.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `primaryAction` | `HeroAction` | `{ label: "Start free trial", doneLabel: "Tria…` | The main call to action. With `doneLabel` and no `href`, the button confirms in place. |
| `secondaryAction` | `HeroAction` | `{ label: "Book a demo", doneLabel: "Demo requ…` | The second call to action. |
| `animateIn` | `boolean` | `true` | Plays the entrance once on mount. Defaults to true. |
| `className` | `string` | — | — |

### `HeroRelay`

Workflow hero, one full screen: the copy beside a live automation graph on a dotted canvas. Sample events arrive on their own and run the workflow node by node: a pulse in the accent travels along each line as the data moves, the branch decides which actions run, and every step reports its time. "Send test event" runs the next sample at once. The run pauses off screen, and under reduced motion each event shows its finished run without playing.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `primaryAction` | `HeroAction` | `{ label: "Start building", doneLabel: "Worksp…` | The main call to action. With `doneLabel` and no `href`, the button confirms in place. |
| `secondaryAction` | `HeroAction` | `{ label: "Read the docs", doneLabel: "Opening…` | The second call to action. |
| `animateIn` | `boolean` | `true` | Plays the entrance once on mount. Defaults to true. |
| `className` | `string` | — | — |

### `HeroCadence`

Editorial hero, one full screen: very large type with one phrase under a solid accent marker, a short paragraph beside the actions, and a strip of words that scrolls along the bottom edge. No product window and no imagery: type does the work.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `primaryAction` | `HeroAction` | `{ label: "Download for Mac", doneLabel: "Down…` | The main call to action. With `doneLabel` and no `href`, the button confirms in place. |
| `secondaryAction` | `HeroAction` | `{ label: "Try it on the web", doneLabel: "Ope…` | The second call to action. |
| `animateIn` | `boolean` | `true` | Plays the entrance once on mount. Defaults to true. |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `HeroSectionVariant` | `"product" \| "workflow" \| "editorial"` |
| `HeroSectionLegacyVariant`: Names the versions had before; they still work. | `"centered" \| "split" \| "minimal"` |
| `Bezier` | `[number, number, number, number]` |
| `LumenRange`: Sample data for Lumen, an invented revenue analytics product. Replace it with your own product's numbers. | `"7d" \| "30d" \| "90d"` |

#### `HeroNavLink`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | Text of the link. |
| `href` | `string` | Where it goes. Without it the entry is a button that only calls `onClick`. |
| `onClick` | `() => void` | Called on press. |

#### `HeroAction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | Text of the button or link. |
| `href` | `string` | Makes it a link. Without it the action is a button. |
| `onClick` | `() => void` | Called on press. |
| `external` | `boolean` | Opens in a new tab and shows an outward arrow. |
| `doneLabel` | `string` | Shown in place of the label for a moment after a press, such as "Trial started". Buttons only. |

#### `HeroInstallCommand`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | Short label, such as npm or pnpm. The first command is shown. |
| `command` (obrigatória) | `string` | — |

#### `LumenKpi`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `"revenue" \| "conversion" \| "sessions"` | — |
| `label` (obrigatória) | `string` | — |
| `value` (obrigatória) | `number` | — |
| `prefix` | `string` | — |
| `suffix` | `string` | — |
| `decimals` | `number` | — |
| `change` (obrigatória) | `string` | Change against the period before, as shown in the badge. |
| `up` (obrigatória) | `boolean` | Whether the change is good news. |

#### `LumenPeriod`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `against` (obrigatória) | `string` | What the change is compared with. |
| `caption` (obrigatória) | `string` | Line under the chart title. |
| `kpis` (obrigatória) | `LumenKpi[]` | — |
| `line` (obrigatória) | `number[]` | Revenue through the period, as a share of the top grid line (0 to 100). Every period has the same number of points, so the line morphs between them. |
| `previous` (obrigatória) | `number[]` | The period before, on the same scale. |
| `yTicks` (obrigatória) | `string[]` | Value axis labels from the top grid line down. |
| `xTicks` (obrigatória) | `string[]` | Date axis labels, spread evenly from the first point to the last. |

#### `LumenTransaction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `customer` (obrigatória) | `string` | — |
| `plan` (obrigatória) | `string` | — |
| `amount` (obrigatória) | `string` | — |
| `status` (obrigatória) | `"Paid" \| "Pending" \| "Refunded"` | — |
| `tone` (obrigatória) | `string` | Token behind the customer's initial, such as `--tone-teal`. |

### Outras exportações

- `heroSectionVariants` (valor)
- `ease` (valor)
- `heroGroup` (valor)
- `heroRise` (valor)
- `heroFade` (valor)
- `instant` (valor)
- `useHeroReducedMotion` (hook)
- `useOnScreen` (hook)
- `useAfter` (hook)
- `lumenRanges` (valor)
- `lumenPeriods` (valor)
- `lumenTransactions` (valor)
- `lumenPayments` (valor)
- `lumenGoal` (valor)
- `lumenFaces` (valor)
- `lumenCustomers` (valor)

## Acessibilidade

- Cada versão tem um único `h1`; os cartões flutuantes são `aria-hidden`, e a janela do produto e o grafo são grupos com nome resumido, como “Lumen revenue dashboard, sample data”.
- No grafo, cada etapa tem estado com nome (“Running”, “Done”, “Skipped”, “Waiting”), e a frase sob o marca-texto é desenhada duas vezes, com a cópia em `aria-hidden`, para ser lida uma vez só.

## Movimento

- Ao montar, as partes sobem em ordem de leitura saindo de um leve desfoque, e um marca-texto na cor de destaque passa da esquerda para a direita sobre uma frase do título.
- Na `product`, os números rolam, o gráfico se desenha e os cartões flutuam; na `workflow`, um pulso percorre as linhas a cada evento; na `editorial`, as palavras correm numa faixa.
- Com “reduzir movimento” ligado, nada se desloca (só esmaece), o gráfico já aparece pronto, o fluxo mostra cada evento concluído, a faixa vira uma área de rolagem comum e o marca-texto já vem pintado.

## Comportamento responsivo

- As versões desenhadas ocupam no mínimo a altura da tela (`100svh`) e se ajustam por container query; abaixo de 760px os links da barra e o “Sign in” somem, sem menu no lugar.
- Na `workflow`, o grafo é desenhado em tamanho fixo e reduzido em escala para caber na coluna, com um arranjo estreito abaixo de 520px.

## Desempenho

- Os laços de eventos e de avisos param quando o hero sai da tela ou a aba fica oculta (`IntersectionObserver` e `visibilitychange`); ainda assim, use uma versão por página.

## Notas para IA

- Importe `HeroSection` pelo nome (a exportação padrão é a prévia com seletor de versões) e escolha `variant`: `product`, `workflow` ou `editorial`; `centered`, `split` e `minimal` também valem.
- Com `title`, o bloco troca a vitrine pelo seu conteúdo (`description`, `announcement`, `install`, `meta` e, em `workflow`, `media`), com altura natural; sem `title`, só as duas ações são suas.
- Depende de `animated-counter`, `avatar`, `badge`, `button`, `copy-button`, `marquee` e `segmented-control`; `HeroNav`, `HeroBackdrop` e `HeroMark` também são exportados para montar a sua versão.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/hero-section · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
