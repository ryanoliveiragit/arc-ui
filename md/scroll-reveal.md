# Scroll reveal

> Revela o conteúdo conforme ele entra na tela, em sequência, e acompanha a leitura com uma barra de progresso.

- Tipo: componente (categoria Especial), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/scroll-reveal
- Descrição original (inglês): A wrapper that reveals its children as they enter the viewport (fade, slide, scale or blur) with stagger and once or repeat modes, plus a scroll progress bar.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/scroll-reveal.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/scroll-reveal.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/scroll-reveal.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/scroll-reveal.json`. Caminho do registro, relativo ao endereço do site: `r/scroll-reveal.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/scroll-reveal/scroll-reveal.tsx`
  - `components/ryan-ui/scroll-reveal/scroll-reveal.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/scroll-reveal.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Seções de landing page ou de notas de versão em que cartões, números e listas chegam um depois do outro ao rolar.
- Grades e fileiras de cartões: cada filho direto vira um passo da sequência, e `className` no invólucro monta a grade.
- Leitura longa num painel com rolagem própria, com `root` apontando para o contêiner e `ScrollProgress` no topo mostrando quanto já foi lido.

## Quando não usar

- Use [`in-view-title`](in-view-title.md) para animar só o título de uma seção, palavra por palavra.
- Use [`infinite-masonry`](infinite-masonry.md) para um feed que carrega mais itens ao chegar ao fim.
- Em telas de trabalho, como tabelas, formulários e painéis, revelar ao rolar só atrasa a leitura; mostre o conteúdo direto.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useRef, useState } from "react";
import { CalendarClock, FileSpreadsheet, Gauge, KeyRound, Sparkles, Workflow } from "lucide-react";
import { ScrollProgress, ScrollReveal } from "@/components/ryan-ui/scroll-reveal/scroll-reveal";
import Switch from "@/components/ryan-ui/switch/switch";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./scroll-reveal.module.css";

export const stage: DemoStage = { height: 600 };

const numbers = [
  { value: "2.4×", label: "faster first load" },
  { value: "38%", label: "smaller exports" },
  { value: "112", label: "fixes shipped" },
];

const features = [
  { icon: Workflow, title: "Automations", text: "Chain triggers and actions without leaving the board." },
  { icon: CalendarClock, title: "Scheduled reports", text: "Send a digest to any channel, on your calendar." },
  { icon: FileSpreadsheet, title: "Spreadsheet import", text: "Map columns once and reuse the mapping next time." },
  { icon: KeyRound, title: "Scoped API keys", text: "Limit a key to one workspace and one permission set." },
];

const fixes = ["Comments keep their place after a reload", "Filters survive switching between views", "Avatars no longer flicker in long lists", "Keyboard focus returns to the row you edited", "CSV exports respect the visible columns", "Mentions work in private projects"];

export default function ScrollRevealDemo() {
  const scroller = useRef<HTMLDivElement>(null);
  const [repeat, setRepeat] = useState(false);

  return (
    <Stack gap={4} width={540}>
      <div ref={scroller} className={styles.scroller} tabIndex={0} role="region" aria-label="Atlas 3.0 release notes">
        <ScrollProgress container={scroller} label="Reading progress" />
        {/* The key remounts the page when the mode changes, so every section starts hidden again. */}
        <article key={repeat ? "repeat" : "once"} className={styles.page}>
          <ScrollReveal root={scroller} effect="blur" once={!repeat} amount={0.4}>
            <p className={styles.kicker}><Sparkles size={14} aria-hidden="true" />Release notes</p>
            <h3 className={styles.title}>Atlas 3.0 is here</h3>
            <p className={styles.lead}>A faster workspace, automations for the repetitive parts, and a long list of fixes you asked for. Scroll to see what changed.</p>
          </ScrollReveal>

          <ScrollReveal root={scroller} effect="scale" once={!repeat} stagger={0.1} className={styles.numbers}>
            {numbers.map(item => <div key={item.label} className={styles.number}><strong>{item.value}</strong><span>{item.label}</span></div>)}
          </ScrollReveal>

          <ScrollReveal root={scroller} effect="slide" from="bottom" once={!repeat} className={styles.features}>
            {features.map(item => (
              <div key={item.title} className={styles.feature}>
                <span className={styles.featureIcon}><item.icon size={17} aria-hidden="true" /></span>
                <div><strong>{item.title}</strong><p>{item.text}</p></div>
              </div>
            ))}
          </ScrollReveal>

          <ScrollReveal root={scroller} effect="slide" from="left" once={!repeat} amount={0.5}>
            <figure className={styles.quote}>
              <Gauge size={18} aria-hidden="true" />
              <blockquote>“Our monthly close went from two days of exports to one scheduled report.”</blockquote>
              <figcaption>Sofia Ramirez, operations lead</figcaption>
            </figure>
          </ScrollReveal>

          <ScrollReveal root={scroller} effect="fade" once={!repeat} stagger={0.05}>
            <h4 className={styles.subtitle}>Fixes</h4>
            <ul className={styles.fixes}>{fixes.map(fix => <li key={fix}>{fix}</li>)}</ul>
            <p className={styles.end}>That is everything in 3.0. Thanks for the reports.</p>
          </ScrollReveal>
        </article>
      </div>
      <Switch label="Replay on re-entry" checked={repeat} onCheckedChange={setRepeat} />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ScrollReveal`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactNode` | — | Each direct child is revealed as one step. |
| `effect` | `"fade" \| "slide" \| "scale" \| "blur"` | `"slide"` | How the children arrive: a plain fade, a slide from one side, a scale up, or a blur that comes into focus. |
| `from` | `"bottom" \| "top" \| "left" \| "right"` | `"bottom"` | The side the "slide" effect comes from. |
| `distance` | `number` | `28` | Distance in px that the "slide" effect travels. |
| `stagger` | `number` | `motionTokens.stagger.line` | Seconds between one child and the next. Use 0 to reveal them together. |
| `delay` | `number` | `0` | Seconds to wait before the first child starts. |
| `once` | `boolean` | `true` | True reveals once and keeps the result; false hides the children again when they leave and replays on every entry. |
| `amount` | `number` | `0.2` | How much of the wrapper must be visible before it starts, from 0 to 1. |
| `root` | `RefObject<Element \| null>` | — | The scrolling element to watch. Leave it out when the page itself scrolls. |
| `className` | `string` | — | Extra class for the wrapper, for example a grid or a flex row. |
| `itemClassName` | `string` | — | Extra class for the element wrapped around each child. |
| `style` | `CSSProperties` | — | Inline style for the wrapper. |

### `ScrollProgress`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `container` | `RefObject<HTMLElement \| null>` | — | The scrolling element to measure. Leave it out to follow the page. |
| `label` | `string` | `"Scroll progress"` | Accessible name of the progress bar. |
| `position` | `"sticky" \| "fixed" \| "static"` | `"sticky"` | "sticky" stays at the top of its scroll container, "fixed" pins to the top of the window, "static" stays where it is rendered. |
| `thickness` | `number` | `3` | Bar thickness in px. |
| `className` | `string` | — | Extra class for the track. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ScrollRevealEffect` | `"fade" \| "slide" \| "scale" \| "blur"` |

## Acessibilidade

- Os filhos ficam no DOM o tempo todo, só invisíveis antes de entrar na tela, então o leitor de tela os lê normalmente; a animação não muda a ordem nem o foco.
- `ScrollProgress` é `role="progressbar"` com `aria-valuenow` de 0 a 100 atualizado na rolagem; passe `label` em português (padrão “Scroll progress”).

## Movimento

- Cada filho entra com o efeito escolhido: `fade` esmaece, `slide` vem de um lado (`from`, `distance`), `scale` cresce de 90% e `blur` sobe 6 px saindo de um desfoque, com uma mola sem ultrapassagem.
- Os filhos entram em sequência a cada `stagger` (padrão 0,08 s) depois de `delay`; com `once={false}`, somem rápido ao sair da tela e entram de novo na volta.
- Com “reduzir movimento”, tudo vira um esmaecer curto, sem deslocamento, escala, desfoque nem sequência, e a barra de progresso segue a rolagem sem suavizar.

## Desempenho

- Cada `ScrollReveal` usa um observador de interseção e `will-change` só vale durante a animação; `blur` anima filtro, que custa mais que mover ou esmaecer, então em listas longas prefira `fade` ou `slide`.

## Notas para IA

- Importe `ScrollReveal` e `ScrollProgress` de `@/components/ryan-ui/scroll-reveal/scroll-reveal`. Cada filho direto é envolvido num `div`: aplique grid ou flex com `className` no próprio `ScrollReveal`.
- Quando quem rola é um contêiner, e não a página, passe o mesmo `ref` em `root` (no `ScrollReveal`) e em `container` (no `ScrollProgress`).
- Os filhos começam invisíveis até 20% do invólucro aparecer (`amount`); não envolva conteúdo que precisa estar visível logo no carregamento.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/scroll-reveal · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
