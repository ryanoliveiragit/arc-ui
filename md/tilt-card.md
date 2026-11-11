# Tilt card

> Cartão que se inclina em 3D na direção do cursor, com um brilho que acompanha o movimento, e volta ao lugar com mola.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/tilt-card
- Descrição original (inglês): A card that tilts in 3D toward the cursor with a glare highlight and springs back flat on leave; it stays still on touch and with reduced motion.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tilt-card.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tilt-card.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tilt-card.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tilt-card.json`. Caminho do registro, relativo ao endereço do site: `r/tilt-card.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/tilt-card/tilt-card.tsx`
  - `components/ryan-ui/tilt-card/tilt-card.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/tilt-card.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Cartões de destaque numa vitrine ou página de produto, como um destino de viagem ou um cartão de embarque, em que a profundidade chama a atenção para poucos itens.
- Quando partes do conteúdo devem flutuar acima da face: cada `TiltCardLayer` sobe `depth` px durante o hover e se desloca contra o fundo conforme o cartão inclina.

## Quando não usar

- Use [`card`](card.md) para cartões comuns em listas e painéis, em que o movimento só distrairia.
- Use [`wallet-card`](wallet-card.md) para um cartão de pagamento que também vira para mostrar o verso.
- Em interfaces usadas sobretudo no toque o efeito some: o cartão só se inclina com mouse.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { Plane, Star } from "lucide-react";
import { TiltCard, TiltCardLayer } from "@/components/ryan-ui/tilt-card/tilt-card";
import { photo } from "@/components/ryan-ui/lib/media";
import { Caption, Row, Stack } from "./_kit";
import styles from "./tilt-card.module.css";

export default function TiltCardDemo() {
  const cover = photo("alpine-lake");
  return (
    <Stack gap={5} align="center" width={620}>
      <Row gap={6} justify="center" align="stretch">
        <TiltCard className={styles.trip} maxTilt={12}>
          <img className={styles.cover} src={cover.src} alt={cover.alt} draggable={false} />
          <TiltCardLayer depth={36} className={styles.tripBody}>
            <span className={styles.tag}><Star size={12} aria-hidden="true" />Editor's pick</span>
            <div>
              <h3 className={styles.title}>Lake Bled, Slovenia</h3>
              <p className={styles.meta}>4 nights · from $640 per person</p>
            </div>
          </TiltCardLayer>
        </TiltCard>

        <TiltCard className={styles.pass} maxTilt={8}>
          <div className={styles.passBody}>
            <TiltCardLayer depth={18} className={styles.passHead}>
              <span className={styles.airline}><Plane size={16} aria-hidden="true" />Northwind Air</span>
              <span className={styles.gate}>Gate B14</span>
            </TiltCardLayer>
            <TiltCardLayer depth={40} className={styles.route}>
              <span><strong>LIS</strong>Lisbon</span>
              <span className={styles.line} aria-hidden="true" />
              <span><strong>LJU</strong>Ljubljana</span>
            </TiltCardLayer>
            <TiltCardLayer depth={18} className={styles.passFoot}>
              <span><small>Boarding</small>07:45</span>
              <span><small>Seat</small>14A</span>
              <span><small>Group</small>2</span>
            </TiltCardLayer>
          </div>
        </TiltCard>
      </Row>
      <Caption>Move the cursor across a card. It stays flat on touch screens and with reduced motion.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `TiltCard`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactNode` | — | Card content. Wrap parts in `TiltCardLayer` to float them above the card face. |
| `maxTilt` | `number` | `10` | Largest lean in degrees, reached at the card's edges. |
| `hoverScale` | `number` | `1.02` | How much the card grows while hovered. `1` keeps its size. |
| `perspective` | `number` | `900` | Viewing distance in px. Smaller values exaggerate the depth. |
| `glare` | `boolean` | `true` | Shows the highlight that follows the cursor. |
| `glareOpacity` | `number` | `0.18` | Strongest opacity of the glare, from 0 to 1. |
| `disabled` | `boolean` | `false` | Keeps the card flat and ignores the cursor. |
| `onTiltChange` | `(tilt: { x: number; y: number }) => void` | — | Reports the lean as the cursor moves: x and y from -1 to 1, both 0 when the card rests. |
| `className` | `string` | — | Extra class names for the root element. |
| `style` | `CSSProperties` | — | Inline styles for the root element, for sizes and CSS variables. |

### `TiltCardLayer`

A part of the card that floats above its face, so it shifts against the background as the card leans.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactNode` | — | Content that floats above the card face. |
| `depth` | `number` | `24` | Distance above the card face in px. Higher layers shift more as the card leans. |
| `className` | `string` | — | Extra class names for the root element. |

## Acessibilidade

- É um contêiner visual, sem papel nem foco próprios: se o cartão inteiro leva a algum lugar, ponha dentro dele um link ou botão com o texto da ação.
- A inclinação só responde ao mouse; teclado, toque, caneta e leitor de tela não a percebem, então nenhuma informação deve depender dela.
- O brilho é `aria-hidden` e tem `pointer-events: none`, então links e botões sob ele continuam clicáveis.

## Movimento

- O cartão gira até `maxTilt` graus (10 por padrão) nas bordas, seguindo o cursor com uma mola firme e sem balanço, cresce até `hoverScale` e mostra um brilho na posição do cursor.
- Ao sair, volta a ficar plano com mola; as camadas `TiltCardLayer` sobem com o hover e voltam à face em repouso, onde o texto fica nítido.
- Com “reduzir movimento” ligado, assim como com `disabled`, o cartão fica plano: sem giro, sem escala, sem brilho e sem camadas elevadas.

## Desempenho

- O cartão mantém `will-change: transform` o tempo todo (exceto com “reduzir movimento”), o que reserva uma camada de composição por instância; numa grade com dezenas deles, use o efeito só nos destaques.

## Notas para IA

- Importe `TiltCard` (e `TiltCardLayer`, se quiser camadas) de `@/components/ryan-ui/tilt-card/tilt-card`; dê largura e altura por `className` ou `style`, porque o cartão interno preenche a altura do contêiner.
- Todo elemento entre o cartão e as camadas precisa de `transform-style: preserve-3d`, como o corpo do cartão de embarque no demo; sem isso as camadas achatam na face.
- O cartão não recorta o conteúdo: numa imagem de capa, use `position: absolute`, `inset: 0` e `border-radius: inherit`; `onTiltChange` dispara a cada movimento do mouse, então evite estado pesado ali.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/tilt-card · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
