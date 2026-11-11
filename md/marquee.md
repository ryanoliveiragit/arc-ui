# Marquee

> Faixa que rola sem fim na horizontal ou na vertical, com bordas esmaecidas, e desacelera até parar quando o cursor passa.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/marquee
- Descrição original (inglês): An infinite horizontal or vertical scroller with speed and direction control, faded edges, and a pause on hover that eases to a stop.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/marquee.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/marquee.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/marquee.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/marquee.json`. Caminho do registro, relativo ao endereço do site: `r/marquee.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/marquee/marquee.tsx`
  - `components/ryan-ui/marquee/marquee.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/marquee.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Fileira de logos de clientes, depoimentos curtos ou um letreiro de novidades que serve de ambiente, não de conteúdo essencial.
- Feed vertical de atividade que rola devagar num espaço de altura fixa (`direction="up"`).

## Quando não usar

- Use [`logo-marquee`](logo-marquee.md) quando quiser a fileira de marcas pronta, já com controle de pausa.
- Use [`carousel`](carousel.md) quando a pessoa precisa parar em cada item e controlar a passagem.
- Use [`announcement-bar`](announcement-bar.md) para avisos importantes no topo da página; informação essencial não deve depender de texto em movimento.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { Anchor, Aperture, Box, Feather, Hexagon, Leaf, Mountain, Pause, Play, Sun, Waves } from "lucide-react";
import { Marquee } from "@/components/ryan-ui/marquee/marquee";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack } from "./_kit";
import styles from "./marquee.module.css";

const customers = [
  { name: "Northwind", icon: Mountain },
  { name: "Harbor & Co", icon: Anchor },
  { name: "Lumen", icon: Sun },
  { name: "Tidewater", icon: Waves },
  { name: "Quill", icon: Feather },
  { name: "Hexa Labs", icon: Hexagon },
  { name: "Fernway", icon: Leaf },
  { name: "Parcel", icon: Box },
  { name: "Iris Optics", icon: Aperture },
];

const quotes = [
  { text: "Cut our release notes from a day to an hour.", by: "Emma, Northwind" },
  { text: "The first tool the whole team opened without being asked.", by: "Marcus, Lumen" },
  { text: "Setup took one coffee.", by: "Sofia, Parcel" },
  { text: "We retired three dashboards the week we switched.", by: "Daniel, Quill" },
  { text: "Support answers in minutes, not tickets.", by: "Ava, Fernway" },
];

const activity = [
  "Jasmine merged “Checkout redesign”",
  "Nathan deployed api v4.18",
  "Chloe shared the Q3 retention report",
  "Mateo fixed the Android login crash",
  "Hannah closed 12 support threads",
  "Tyler added 3 seats to the Sales team",
];

export default function MarqueeDemo() {
  const [paused, setPaused] = useState(false);

  return (
    <Stack width={680} gap={5}>
      <Marquee label="Customers" speed={56} gap={40} paused={paused}>
        {customers.map(({ name, icon: Icon }) => (
          <span key={name} className={styles.logo}><Icon size={20} aria-hidden="true" />{name}</span>
        ))}
      </Marquee>

      <Marquee label="What customers say" direction="right" speed={32} gap={12} paused={paused}>
        {quotes.map(quote => (
          <figure key={quote.by} className={styles.quote}>
            <blockquote>{quote.text}</blockquote>
            <figcaption>{quote.by}</figcaption>
          </figure>
        ))}
      </Marquee>

      <Row gap={6} align="center">
        <div className={styles.feed}>
          <Marquee label="Team activity" direction="up" speed={22} gap={10} fade="28%" paused={paused}>
            {activity.map(line => <span key={line} className={styles.line}><i aria-hidden="true" />{line}</span>)}
          </Marquee>
        </div>
        <Stack gap={2} align="flex-start">
          <Button variant="secondary" size="sm" onClick={() => setPaused(value => !value)} aria-pressed={paused}>
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            {paused ? "Play" : "Pause"}
          </Button>
          <Caption>Hover a row and it eases to a stop.</Caption>
        </Stack>
      </Row>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Marquee`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactNode` | — | The items to scroll. They are laid out in a row, or in a column for the vertical directions. |
| `direction` | `"left" \| "right" \| "up" \| "down"` | `"left"` | Where the content travels. `left` and `right` scroll a row; `up` and `down` scroll a column and need a height on the marquee. |
| `speed` | `number` | `48` | Travel speed in px per second. |
| `gap` | `number \| string` | `24` | Space between items, and between one repetition and the next, in px or any CSS length. |
| `pauseOnHover` | `boolean` | `true` | Slows to a stop while the pointer is over the marquee or focus is inside it. |
| `paused` | `boolean` | `false` | Stops the motion, for a pause button. People must be able to stop content that moves for more than a few seconds. |
| `fade` | `boolean \| string` | `true` | Fades the two edges the content enters and leaves through. Pass a CSS length to set how wide the fade is. |
| `label` | `string` | — | Accessible name for the group, for example "Customers". |
| `className` | `string` | — | Extra class names for the root element. |
| `style` | `CSSProperties` | — | Inline styles for the root element, for sizes and CSS variables. |

## Acessibilidade

- As repetições levam `aria-hidden` e `inert`, de modo que cada item é lido e recebe foco uma única vez; com `label`, a raiz vira um `role="group"` nomeado.
- Com `pauseOnHover` (padrão), o cursor sobre a faixa ou o foco dentro dela a fazem desacelerar até parar; para movimento que dura mais que alguns segundos, ofereça também um botão de pausa ligado a `paused`.

## Movimento

- O conteúdo corre a `speed` px por segundo num laço de quadros de animação e se repete quantas vezes for preciso (até 24 cópias) para emendar sem costura.
- Pausar e retomar passam por uma mola que leva o ritmo de 1 a 0 e de volta, então a faixa freia e arranca em vez de congelar; fora da tela, ela descansa.
- Com “reduzir movimento”, nada se move sozinho: as cópias não são renderizadas e a faixa vira uma área de rolagem comum, focável pelo teclado.

## Comportamento responsivo

- A faixa ocupa a largura do pai e recalcula o número de cópias quando ela ou o conteúdo mudam de tamanho.
- Nas direções `up` e `down` a raiz usa `height: 100%`: o pai precisa ter altura definida.

## Desempenho

- Cada instância roda um laço de quadros (`useAnimationFrame`) que só move um `transform`; os filhos são renderizados em todas as cópias, então evite itens pesados ou com estado e efeitos próprios.

## Notas para IA

- Passe os itens como filhos diretos: o marquee os alinha em linha (ou em coluna) e aplica `gap` entre eles e entre as repetições.
- `speed` é em px por segundo (48 por padrão), `direction` aceita `left`, `right`, `up` e `down`, e `fade` controla a máscara das bordas (`true`, um comprimento CSS como `"28%"` ou `false`).
- Para pausar por botão, guarde um estado e passe em `paused`: o componente não traz esse botão.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/marquee · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
