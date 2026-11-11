# Aspect ratio

> Caixa que mantém a proporção e desliza suavemente para outra (16:9, 4:3, 1:1, 9:16) sem deixar a mídia descoberta.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/aspect-ratio
- Descrição original (inglês): A box that holds a width to height ratio and springs to a new one when it changes, keeping the media inside covered.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/aspect-ratio.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/aspect-ratio.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/aspect-ratio.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/aspect-ratio.json`. Caminho do registro, relativo ao endereço do site: `r/aspect-ratio.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/aspect-ratio/aspect-ratio.tsx`
  - `components/ryan-ui/aspect-ratio/aspect-ratio.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/aspect-ratio.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Pré-visualização que alterna entre paisagem, quadrado e retrato (um seletor de formato de corte, por exemplo) sem salto de layout.
- Reservar o espaço de imagem, vídeo ou `iframe` antes do carregamento, com a mídia recortada pelo centro.
- Formatos verticais que não devem empurrar a página: com `maxHeight` a caixa estreita em vez de crescer.

## Quando não usar

- Quando a proporção nunca muda e não há recorte, a propriedade CSS `aspect-ratio` resolve sem um componente cliente.
- Use [`image-compare`](image-compare.md) para confrontar duas imagens com uma divisória.
- Use [`image-viewer`](image-viewer.md) quando as fotos precisam abrir ampliadas, com zoom e navegação.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { AspectRatio } from "@/components/ryan-ui/aspect-ratio/aspect-ratio";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { photo } from "@/components/ryan-ui/lib/media";
import { Caption, Stack } from "./_kit";
import styles from "./aspect-ratio.module.css";

const formats = [
  { value: "16/9", label: "16:9", use: "Widescreen video and hero banners" },
  { value: "4/3", label: "4:3", use: "Product shots and presentation slides" },
  { value: "1/1", label: "1:1", use: "Feed posts and catalog thumbnails" },
  { value: "9/16", label: "9:16", use: "Stories and vertical video" },
];

export default function AspectRatioDemo() {
  const [ratio, setRatio] = useState("16/9");
  const picture = photo("mountain-ridges");
  const format = formats.find(entry => entry.value === ratio) ?? formats[0]!;

  return (
    <Stack width={480} gap={4} align="center">
      <div className={styles.frame}>
        <AspectRatio ratio={ratio} maxHeight={264}>
          <img src={picture.src} alt={picture.alt} draggable={false} />
          <span className={styles.badge}>{format.label}</span>
        </AspectRatio>
      </div>
      <SegmentedControl label="Crop format" options={formats.map(({ value, label }) => ({ value, label }))} value={ratio} onValueChange={setRatio} />
      <Caption>{format.use}.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `AspectRatio`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `ratio` | `number \| string` | — | Width divided by height. A number (`16 / 9`) or a string such as `"16/9"`, `"16:9"` or `"1.85"`. |
| `maxHeight` | `number \| string` | — | Tallest the box may get, in px or any CSS length. Past it the box narrows instead of growing, so a portrait ratio never pushes the page down. |
| `fit` | `"cover" \| "contain"` | `"cover"` | How direct media children (img, video, canvas, iframe) fill the box. |
| `radius` | `"panel" \| "control" \| "none"` | `"panel"` | Corner style: `panel` uses the panel radius, `none` leaves the corners square. |
| `animated` | `boolean` | `true` | Set to false to switch ratios instantly. Reduced motion always switches instantly. |
| `onRatioSettled` | `(ratio: number) => void` | — | Runs when the box has settled on a new ratio. |
| `children` | `ReactNode` | — | Media or any content. Direct media children are stretched over the box; other children are laid out by you. |
| `className` | `string` | — | Extra class names for the root element. |
| `style` | `CSSProperties` | — | Inline styles for the root element, for sizes and CSS variables. |

### Outras exportações

- `parseRatio` (função)

## Acessibilidade

- É um `div` sem papel nem rótulo: a descrição vem da mídia que você coloca dentro, então informe `alt` na imagem ou `title` no `iframe`.

## Movimento

- Ao mudar `ratio`, a própria proporção anima com mola sem ultrapassagem e o navegador recalcula largura e altura a cada quadro, então a mídia nunca estica como esticaria num `scale`.
- A primeira renderização não anima; `animated={false}` troca na hora, e com “reduzir movimento” a troca é sempre instantânea.

## Comportamento responsivo

- A caixa ocupa 100% da largura do pai; com `maxHeight` a largura passa a ser o menor entre 100% e `maxHeight` vezes a proporção, e a caixa fica centralizada na linha.

## Desempenho

- A animação mexe em layout, não em `transform`: cada quadro recalcula a caixa e o que vem depois dela, o que é leve para uma prévia e pesado para uma grade inteira trocando de proporção ao mesmo tempo.

## Notas para IA

- `ratio` aceita número (`16 / 9`) ou texto (`"16/9"`, `"16:9"`, `"1.85"`); um valor ilegível cai em 16:9 sem aviso.
- Filhos diretos `img`, `video`, `canvas`, `iframe` e `picture` são esticados sobre a caixa e recortados (`fit="contain"` mostra a mídia inteira); outros filhos você mesmo posiciona, pois a caixa é `position: relative`.
- `onRatioSettled` avisa quando a caixa assenta numa proporção nova (não dispara na montagem); o pai precisa definir a largura.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/aspect-ratio · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
