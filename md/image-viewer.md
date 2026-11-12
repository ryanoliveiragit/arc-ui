# Image viewer

> Galeria de miniaturas que se ampliam num visualizador com setas, gesto de deslizar, zoom e arraste; Esc devolve a imagem ao lugar.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/image-viewer
- Descrição original (inglês): A thumbnail gallery whose pictures grow into a lightbox with a shared-element zoom, with arrows, swipe, zoom and pan, a focus trap, and Escape closing back into the thumbnail.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/image-viewer.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/image-viewer.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/image-viewer.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/image-viewer.json`. Caminho do registro, relativo ao endereço do site: `r/image-viewer.json`.

- Pacotes npm: `motion`, `lucide-react`, `@radix-ui/react-dialog`
- Arquivos, depois de instalados:
  - `components/ryan-ui/image-viewer/image-viewer.tsx`
  - `components/ryan-ui/image-viewer/image-viewer.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react @radix-ui/react-dialog`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/image-viewer.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Galeria de fotos (produto, viagem, portfólio, anexos) em que a pessoa abre uma imagem, amplia e passa para as vizinhas.
- Quando abrir a imagem deve manter a noção de lugar: a miniatura cresce até virar a imagem e volta para o mesmo ponto ao fechar.
- Imagens com legenda curta que pedem zoom por roda do mouse, pinça, duplo clique ou teclado.

## Quando não usar

- Use [`carousel`](carousel.md) para passar por slides dentro da própria página, sem abrir uma camada em tela cheia.
- Use [`image-compare`](image-compare.md) para comparar duas versões da mesma imagem.
- Use [`infinite-masonry`](infinite-masonry.md) para um feed longo de alturas variadas que carrega mais ao rolar; aqui a grade tem colunas fixas e monta todas as miniaturas.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { ImageViewer } from "@/components/ryan-ui/image-viewer/image-viewer";
import type { ImageViewerItem } from "@/components/ryan-ui/image-viewer/image-viewer";
import { photo } from "@/components/ryan-ui/lib/media";
import type { PhotoId } from "@/components/ryan-ui/lib/media";
import { Caption, Stack, demoStage } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const shots: [PhotoId, string, string][] = [
  ["lisbon-tram", "Tram 28 climbing toward Graça", "Tram 28 climbing toward Graça, a little after seven."],
  ["mountain-ridges", "Mountain ridges fading into the dusk", "Ridges fading into the dusk on the walk back down."],
  ["alpine-lake", "A still alpine lake", "The lake before the wind picked up."],
  ["pool-house", "The pool house arches", "The pool house, empty until noon."],
  ["lisbon-rooftops", "Terracotta rooftops in Lisbon", "Rooftops from the Senhora do Monte lookout."],
  ["sunroom", "Arched windows of a sunroom", "Breakfast in the sunroom."],
];
const images: ImageViewerItem[] = shots.map(([id, alt, caption]) => { const { src, width, height } = photo(id); return { src, alt, caption, width, height }; });

export default function ImageViewerDemo() {
  // On the docs page the lightbox opens inside the preview: the photo grows out of its thumbnail and fits the preview, and the page keeps scrolling.
  const [container] = useState(demoStage);
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Stack width={460} gap={3}>
      <ImageViewer images={images} value={open} onValueChange={setOpen} label="Trip photos" container={container} />
      <Caption>{open === null ? "Open a photo. Inside: arrows or swipe to move, wheel, pinch or double-click to zoom, drag to pan, Escape to close." : `Viewing photo ${open + 1} of ${images.length}.`}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ImageViewer`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `images` (obrigatória) | `ImageViewerItem[]` | — | The images, in order. |
| `value` | `number \| null` | — | Index of the open image, or null when the lightbox is closed (controlled). |
| `defaultValue` | `number \| null` | `null` | Open image when uncontrolled. Defaults to closed. |
| `onValueChange` | `(index: number \| null) => void` | — | Called when an image opens, when the open image changes, and with null on close. |
| `columns` | `number` | `3` | Number of columns in the thumbnail grid. |
| `thumbnailRatio` | `number` | `1` | Width divided by height of each thumbnail: 1 is a square, 4 / 3 a landscape tile. |
| `loop` | `boolean` | `true` | Moving past the last image returns to the first, and back. |
| `maxZoom` | `number` | `4` | Largest zoom factor. |
| `label` | `string` | `"Image gallery"` | Accessible name of the gallery and of the lightbox. |
| `className` | `string` | — | Extra class for the thumbnail grid. |
| `container` | `HTMLElement \| null` | — | Opens the lightbox inside this element instead of over the whole page: the backdrop covers only the element and the image fits in it. The element needs position: relative and overflow: hidden. The page around it stays usable while the lightbox is open: nothing is scroll-locked or hidden from assistive technology, and Escape, the close button and a tap beside the image still close it. |

### Tipos exportados

#### `ImageViewerItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `src` (obrigatória) | `string` | URL of the full image shown in the lightbox. |
| `alt` (obrigatória) | `string` | Alternative text. It also names the thumbnail button. |
| `thumbnail` | `string` | Smaller image for the grid. Defaults to `src`. |
| `width` | `number` | Intrinsic width in pixels. With `height`, it lets the lightbox know the shape before the image loads. |
| `height` | `number` | Intrinsic height in pixels. |
| `caption` | `string` | Line of text shown under the open image. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Numa miniatura, abrem o visualizador naquela imagem. |
| `←` ou `→` | Vão à imagem anterior ou à próxima; com `loop`, dão a volta nas pontas. |
| `Home` ou `End` | Vão à primeira e à última imagem. |
| `+` ou `-` | Aproximam e afastam em passos de 1,6×, até `maxZoom`; `=` também aproxima e `0` volta ao tamanho ajustado. |
| `Esc` | Fecha o visualizador: a imagem volta para a miniatura e o foco também. |
| `Tab` ou `Shift + Tab` | Circulam pelos controles do visualizador (zoom, fechar, setas, tira de miniaturas) sem sair dele. |

## Acessibilidade

- O visualizador é um diálogo do Radix: prende o foco, fecha com `Esc` e, ao fechar, devolve o foco à miniatura da última imagem vista.
- Cada miniatura é um botão com `aria-label` “Open image N of M: alt”, e o contador `aria-live` anuncia a imagem atual a cada troca.
- Forneça `alt` em todas as imagens (ele nomeia os botões e é lido no contador) e `label` para a galeria; os rótulos dos controles estão fixos em inglês.

## Movimento

- A miniatura pressionada cresce numa mola até o tamanho ajustado à tela e volta mais rápido ao fechar; se ela estiver fora da tela, a imagem só esmaece.
- Entre imagens, a nova entra pelo lado do movimento; o arraste acompanha o dedo, resiste quando não há para onde ir e troca de imagem ao passar do limite ou num arremesso.
- Com “reduzir movimento”, abrir, fechar e trocar viram um esmaecer, e o zoom por botão ou tecla salta direto para o nível.

## Comportamento responsivo

- A grade mantém sempre `columns` colunas (3 por padrão), sem pontos de quebra: ajuste a prop conforme a largura disponível.
- Abaixo de 640 px as setas laterais somem e a navegação fica por deslize e pela tira de miniaturas, que rola na horizontal; as margens laterais da imagem caem de 84 px para 12 px.

## Desempenho

- As miniaturas da grade usam `loading="lazy"`; passe `thumbnail` com um arquivo menor, que também serve de prévia enquanto a imagem cheia carrega.
- Informe `width` e `height` para o visualizador saber o formato antes do carregamento; a tira de miniaturas monta todas as imagens de uma vez, então galerias muito grandes pesam.

## Notas para IA

- O componente renderiza a grade e o visualizador: passe `images` com `src` e `alt`, e de preferência `thumbnail`, `width`, `height` e `caption`.
- `value` é o índice da imagem aberta ou `null` (fechado): controle com `onValueChange`, que recebe o índice ao abrir ou trocar e `null` ao fechar, ou use `defaultValue`.
- O visualizador abre num portal em tela cheia (`position: fixed`, `z-index` 80 e 81); `className` se aplica só à grade de miniaturas.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/image-viewer · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
