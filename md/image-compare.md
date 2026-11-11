# Image compare

> Arraste um divisor sobre duas imagens para ver o antes e o depois, também pelo teclado.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/image-compare
- Descrição original (inglês): Drag a divider across two images to see what changed.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/image-compare.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/image-compare.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/image-compare.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/image-compare.json`. Caminho do registro, relativo ao endereço do site: `r/image-compare.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/image-compare/image-compare.tsx`
  - `components/ryan-ui/image-compare/image-compare.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/image-compare.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Antes e depois de uma edição: retoque de foto, redesign de uma tela, resultado de um filtro ou de uma ampliação.
- Duas versões da mesma cena com o mesmo enquadramento (mapas, renders, capturas de tela), em que a diferença aparece ao deslizar o divisor.

## Quando não usar

- Evite quando as imagens têm proporções ou enquadramentos diferentes: as duas são cortadas para cobrir a mesma moldura, e a comparação ponto a ponto se perde.
- Use [`image-viewer`](image-viewer.md) para ampliar e percorrer várias imagens.
- Use [`file-diff`](file-diff.md) para comparar versões de texto ou código.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { ImageCompare } from "@/components/ryan-ui/image-compare/image-compare";
import { photo } from "@/components/ryan-ui/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 480 };

const cover = { width: "100%", height: "100%", objectFit: "cover", display: "block" } as const;

export default function ImageCompareDemo() {
  const [position, setPosition] = useState(50);
  const before = photo("terracotta-waves");
  const after = photo("sea-at-dusk");
  return (
    <Stack width={560} gap={3}>
      <ImageCompare
        defaultPosition={50}
        onPositionChange={p => setPosition(Math.round(p))}
        labels={["Original", "Retouched"]}
        label="Original and retouched photo"
        aspectRatio="4 / 3"
        before={<img src={before.src} alt={before.alt} style={cover} />}
        after={<img src={after.src} alt={after.alt} style={cover} />}
      />
      <Caption>Drag the divider, or focus it and use the arrow keys. Retouched shows {100 - position}%.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ImageCompare`

Before and after, split by a divider. Drag anywhere to move it: the handle follows 1:1, rubber-bands past the edges, and stays where it is released. A press on the image springs the divider there; on touch the press waits to see a sideways drag so the page still scrolls. Arrow keys step 1% (Shift for 10%), Home and End reveal one side fully, and a double-click on the handle springs it back to the middle.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `before` (obrigatória) | `ReactNode` | — | The original, shown on the left (or top). Pass an image with its own alt text; it is sized to cover the frame. |
| `after` (obrigatória) | `ReactNode` | — | The result, shown on the right (or bottom). |
| `position` | `number` | — | Where the divider sits, in percent from the left (or top). |
| `defaultPosition` | `number` | `50` | — |
| `onPositionChange` | `(position: number) => void` | — | — |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Vertical stacks the images top and bottom. Changing it swings the divider a quarter turn instead of swapping layouts. |
| `labels` | `[string, string] \| false` | `["Before", "After"]` | Captions over each side. They fade as the divider reaches them. Pass false to hide them. |
| `label` | `string` | `"Before and after"` | Accessible name of the divider. |
| `aspectRatio` | `string` | `"3 / 2"` | Frame proportions, as a CSS aspect-ratio. |
| `className` | `string` | — | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Movem o divisor 1% para a esquerda ou a direita; na orientação vertical, use `↑` e `↓`. |
| `Shift + ←` ou `Shift + →` | Movem o divisor em passos de 10%. |
| `Page Up` ou `Page Down` | Também movem 10% de cada vez. |
| `Home` ou `End` | `Home` mostra só a imagem de antes; `End`, só a de depois. |
| `Tab` | Leva o foco à alça do divisor. |

## Acessibilidade

- A alça é um `role="slider"` nomeado por `label`, com `aria-orientation` e valor de 0 a 100 que diz quanto da imagem de depois está visível (o `aria-valuetext` “N% after” é fixo em inglês).
- As legendas sobre as imagens ficam em `aria-hidden`: passe em `before` e `after` imagens com `alt` próprio.
- Clicar ou arrastar na foto leva o foco para a alça, então as setas funcionam logo em seguida.

## Movimento

- A alça acompanha o arraste ponto a ponto, cede como elástico ao passar das bordas e fica onde foi solta; um clique na foto leva o divisor até lá numa mola.
- Durante o arraste a alça redonda vira uma cápsula e as setas dela se afastam; trocar `orientation` gira o divisor um quarto de volta em vez de trocar o layout de uma vez.
- Com “reduzir movimento”, o divisor salta para a posição, sem mola nem elástico, e a troca de orientação é imediata.

## Comportamento responsivo

- A moldura ocupa 100% da largura do pai e a altura vem de `aspectRatio` (padrão `3 / 2`); imagens, `picture` e vídeos passados são ajustados para cobri-la.
- No toque, um dedo sobre a foto espera um arraste no eixo do divisor antes de assumir o gesto, para a página continuar rolando; a alça responde na hora e tem área de toque maior que o círculo visível.

## Desempenho

- Durante o arraste a posição corre em valores de movimento, e `onPositionChange` dispara no máximo uma vez por ponto percentual inteiro.

## Notas para IA

- `before` e `after` são nós: passe `<img>` (ou `picture`, vídeo) com o mesmo enquadramento; o componente já aplica largura, altura e `object-fit: cover`.
- `position` é a porcentagem a partir da esquerda (ou do topo): controle com `onPositionChange` ou deixe livre com `defaultPosition`; um duplo clique na alça volta a 50.
- `labels={false}` esconde as legendas, `labels` com dois textos as troca (o padrão é “Before” e “After”), e `aspectRatio` aceita qualquer valor CSS, como `"4 / 3"`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/image-compare · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
