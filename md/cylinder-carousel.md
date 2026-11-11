# Cylinder carousel

> Cartões dispostos em volta de um cilindro 3D que gira com arraste, setas ou teclado e para sempre em um cartão.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/cylinder-carousel
- Descrição original (inglês): Cards placed around a 3D cylinder that turns by drag, arrows and keys, snaps to the nearest card and dims the cards that turn away.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cylinder-carousel.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cylinder-carousel.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cylinder-carousel.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cylinder-carousel.json`. Caminho do registro, relativo ao endereço do site: `r/cylinder-carousel.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/cylinder-carousel/cylinder-carousel.tsx`
  - `components/ryan-ui/cylinder-carousel/cylinder-carousel.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/cylinder-carousel.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Vitrine de um conjunto pequeno de cartões visuais (salas, produtos, planos) em que um fica de frente por vez e os vizinhos aparecem em perspectiva.
- Escolha de um item entre poucos, quando o resto da tela reage ao cartão da frente: `onValueChange` informa em qual cartão o cilindro vai parar.

## Quando não usar

- Use [`carousel`](carousel.md) para uma fileira comum de slides, com indicador de página e rotação automática opcional.
- Use [`card-stack`](card-stack.md) quando a pessoa decide cartão a cartão, descartando ou escolhendo, com opção de desfazer.
- Evite com dezenas de cartões: o raio do cilindro cresce com a quantidade e todos ficam montados; uma grade ou lista serve melhor.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { MapPin, Users } from "lucide-react";
import { CylinderCarousel } from "@/components/ryan-ui/cylinder-carousel/cylinder-carousel";
import { photo } from "@/components/ryan-ui/lib/media";
import type { PhotoId } from "@/components/ryan-ui/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./cylinder-carousel.module.css";

export const stage: DemoStage = { height: 520 };

const rooms: { id: PhotoId; name: string; place: string; seats: number; price: string; open: boolean }[] = [
  { id: "sunroom", name: "The Sunroom", place: "Floor 4, east wing", seats: 8, price: "$42 / hour", open: true },
  { id: "home-office", name: "Quiet Corner", place: "Floor 2, library side", seats: 2, price: "$18 / hour", open: true },
  { id: "living-room", name: "The Lounge", place: "Ground floor", seats: 12, price: "$55 / hour", open: false },
  { id: "concert-hall", name: "Town Hall", place: "Floor 1, atrium", seats: 60, price: "$180 / hour", open: true },
  { id: "reading-chair", name: "Reading Nook", place: "Floor 3, north wing", seats: 1, price: "$9 / hour", open: true },
  { id: "wine-bar", name: "The Cellar", place: "Basement", seats: 16, price: "$70 / hour", open: false },
  { id: "pool-house", name: "Pool House", place: "Garden level", seats: 10, price: "$64 / hour", open: true },
  { id: "curved-facade", name: "Skyline Deck", place: "Roof terrace", seats: 24, price: "$95 / hour", open: true },
];

export default function CylinderCarouselDemo() {
  const [front, setFront] = useState(0);
  const room = rooms[front] ?? rooms[0]!;
  return (
    <Stack gap={3} width={640} align="center">
      <CylinderCarousel label="Rooms to book" value={front} onValueChange={setFront}>
        {rooms.map(item => (
          <article key={item.id} className={styles.room}>
            <img className={styles.photo} src={photo(item.id).src} alt="" draggable={false} />
            <div className={styles.info}>
              <span className={styles.status} data-open={item.open}>{item.open ? "Free now" : "Booked until 3:00"}</span>
              <h3 className={styles.name}>{item.name}</h3>
              <p className={styles.place}><MapPin size={13} aria-hidden="true" />{item.place}</p>
              <p className={styles.meta}><span><Users size={13} aria-hidden="true" />{item.seats}</span><strong>{item.price}</strong></p>
            </div>
          </article>
        ))}
      </CylinderCarousel>
      <Caption>Drag the cylinder, click a side card, or focus it and press the arrow keys. Facing you: {room.name}.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CylinderCarousel`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactNode` | — | One card per child. Three or more make a proper cylinder. |
| `value` | `number` | — | Index of the card facing the viewer (controlled). |
| `defaultValue` | `number` | `0` | Index of the card facing the viewer at first when uncontrolled. |
| `onValueChange` | `(index: number) => void` | — | Called with the index of the card that the cylinder settles on. |
| `cardWidth` | `number` | `220` | Card width in px. It shrinks to fit narrow containers. |
| `cardHeight` | `number` | `290` | Card height in px at full width; it scales with the card's width. |
| `gap` | `number` | `18` | Space in px between neighboring cards, measured along the cylinder. |
| `perspective` | `number` | `1100` | Viewing distance in px. Smaller values exaggerate the depth. |
| `controls` | `boolean` | `true` | Shows the previous and next buttons and the position counter. |
| `label` | `string` | `"Carousel"` | Accessible name of the carousel. |
| `className` | `string` | — | Extra class for the root element. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Com o foco no palco, giram para o cartão anterior ou o próximo; toques rápidos se acumulam. |
| `Home` ou `End` | Giram até o primeiro ou o último cartão pelo caminho mais curto. |
| `Tab` | Passa pelo palco, pelos controles do cartão da frente e pelos botões de anterior e próximo; os outros cartões ficam fora da ordem de foco. |
| `Enter` ou `Espaço` | Nos botões de anterior e próximo, giram um cartão. |

## Acessibilidade

- A raiz é um grupo com `aria-roledescription="carousel"` nomeado por `label`; cada cartão é um grupo `slide` rotulado “N of M”, e só o da frente fica exposto: os demais recebem `aria-hidden` e `inert`.
- Uma região `aria-live="polite"` anuncia “Card N of M” a cada troca, e os botões de anterior e próximo têm `aria-label` próprio.
- Passe `label` com o nome do conjunto; os demais textos lidos (“Previous card”, “Card 2 of 8”) estão fixos em inglês no código.

## Movimento

- O cartão da frente acompanha o arraste ponto a ponto; ao soltar, um arremesso leva o giro um pouco adiante e uma mola com leve ultrapassagem o assenta no cartão mais próximo.
- Os cartões escurecem conforme se afastam da frente e os de trás somem; na entrada, o cilindro chega girando pouco mais de um cartão e para no inicial.
- Com “reduzir movimento”, o giro salta direto para o cartão de destino, sem mola nem entrada, e o contador troca só com um esmaecer.

## Comportamento responsivo

- Um `ResizeObserver` mede o palco: o cartão usa `cardWidth` ou 58% da largura disponível, o que for menor, e a altura encolhe na mesma proporção.
- O palco usa `touch-action: pan-y`: no toque, arrastar na horizontal gira o cilindro e a rolagem vertical da página continua livre.

## Desempenho

- Todos os cartões ficam montados (os de trás só são ocultados por `backface-visibility`) e cada um acompanha o giro para calcular a própria opacidade; prefira poucos cartões e imagens leves.

## Notas para IA

- Cada filho vira um cartão: passe três ou mais (com dois, ficam frente e verso; sem filhos, nada é renderizado).
- Controle com `value` e `onValueChange` (índice do cartão da frente) ou deixe livre com `defaultValue`; `onValueChange` dispara quando o destino é decidido, antes de a mola terminar.
- Dê largura ao pai (a raiz ocupa 100%) e deixe a altura por conta de `cardHeight` mais 96 px; dentro do cartão, marque com `data-no-drag` as áreas que não devem iniciar o arraste.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/cylinder-carousel · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
