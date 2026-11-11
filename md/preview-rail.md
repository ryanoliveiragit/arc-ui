# Preview rail

> Trilho de cartões em que o cartão sob o cursor ou em foco se alarga para mostrar a prévia enquanto os outros encolhem.

- Tipo: componente (categoria Dados), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/preview-rail
- Descrição original (inglês): A rail of image cards in which the hovered or focused one widens to reveal its preview while the others shrink to a slice.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/preview-rail.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/preview-rail.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/preview-rail.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/preview-rail.json`. Caminho do registro, relativo ao endereço do site: `r/preview-rail.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/preview-rail/preview-rail.tsx`
  - `components/ryan-ui/preview-rail/preview-rail.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/preview-rail.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Vitrine de poucos destaques com imagem (destinos, guias, projetos, categorias) em que passar o cursor mostra a prévia e pressionar o cartão aberto leva ao detalhe.
- Seções de página em que um item fica sempre em evidência e os outros aparecem como fatias com o título.

## Quando não usar

- Use [`carousel`](carousel.md) quando há muitos itens ou todos precisam do mesmo destaque; aqui, cada cartão a mais estreita as fatias fechadas.
- Use [`image-viewer`](image-viewer.md) para abrir e ampliar fotos.
- Use [`tabs`](tabs.md) quando cada opção revela conteúdo próprio (texto, formulários) em vez de uma prévia curta sobre uma imagem.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { PreviewRail } from "@/components/ryan-ui/preview-rail/preview-rail";
import type { PreviewRailItem } from "@/components/ryan-ui/preview-rail/preview-rail";
import { photo } from "@/components/ryan-ui/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 460 };

const guides: PreviewRailItem[] = [
  { id: "tram", eyebrow: "Lisbon", title: "Route 28 by tram", description: "From Graça down to Estrela, with the four stops worth getting off for.", meta: "Half a day · 9 km", image: photo("lisbon-tram").src },
  { id: "ridge", eyebrow: "Dolomites", title: "The ridge walk at dusk", description: "A gentle loop that keeps the valley on your left and the light in front of you.", meta: "3 h 20 min · moderate", image: photo("mountain-ridges").src },
  { id: "pool", eyebrow: "Alentejo", title: "A weekend at the pool house", description: "Whitewashed arches, a cold plunge and nothing on the schedule until dinner.", meta: "2 nights · sleeps four", image: photo("pool-house").src },
  { id: "hall", eyebrow: "Porto", title: "Tuesday at the concert hall", description: "Rush seats open at six. Arrive early and take the back stairs to the upper tier.", meta: "Evening · from 12 €", image: photo("concert-hall").src },
  { id: "sunroom", eyebrow: "Sintra", title: "Breakfast in the sunroom", description: "A glasshouse café behind the old nursery, best before the tour buses arrive.", meta: "Opens 8:00 · walk-in", image: photo("sunroom").src },
];

export default function PreviewRailDemo() {
  const [open, setOpen] = useState("ridge");
  const [saved, setSaved] = useState<string | null>(null);
  const current = guides.find(guide => guide.id === open);
  return (
    <Stack width={760} gap={4}>
      <PreviewRail items={guides} value={open} onValueChange={setOpen} onSelect={guide => setSaved(guide.title)} label="Weekend guides" />
      <Caption>{saved ? `Opened “${saved}”.` : `Previewing “${current?.title}”. Hover, tap or use the arrow keys; press the open card to pick it.`}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `PreviewRail`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` (obrigatória) | `PreviewRailItem[]` | — | The cards, in order. |
| `value` | `string` | — | Id of the open card (controlled). |
| `defaultValue` | `string` | — | Open card when uncontrolled. Defaults to the first one. |
| `onValueChange` | `(value: string) => void` | — | Called when another card opens. |
| `onSelect` | `(item: PreviewRailItem) => void` | — | Called when the open card is pressed (click, tap, Enter or Space). |
| `trigger` | `"hover" \| "press"` | `"hover"` | What opens a card with a mouse: hovering it, or only pressing it. Keyboard focus and taps always open. |
| `ratio` | `number` | `4` | How many times wider the open card is than a closed one. |
| `height` | `number` | `320` | Rail height in pixels. |
| `label` | `string` | `"Previews"` | Accessible name of the group. |
| `className` | `string` | — | Extra class for the outer element. |

### Tipos exportados

#### `PreviewRailItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique id, used as the rail's value. |
| `title` (obrigatória) | `string` | Card title, shown on the closed card's label and in the open preview. |
| `eyebrow` | `string` | Short line above the title: a category, a place, a date. |
| `description` | `string` | One or two sentences shown only while the card is open. |
| `meta` | `string` | Detail shown at the bottom of the preview, such as a duration or a count. |
| `image` (obrigatória) | `string` | Image URL for the card background. |
| `alt` | `string` | Alternative text for the image. Leave empty when the title already says it. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Movem o foco para o cartão anterior ou o próximo, que se abre ao receber o foco; `↑` e `↓` fazem o mesmo. |
| `Home` ou `End` | Vão ao primeiro e ao último cartão. |
| `Enter` ou `Espaço` | No cartão aberto, chamam `onSelect`. |
| `Tab` | Cada cartão é uma parada de `Tab`, e o foco abre o cartão. |

## Acessibilidade

- O trilho é um `role="group"` nomeado por `label`; cada cartão é um `<button>` com `aria-expanded` e o título num texto oculto, e os textos da prévia entram no nome do botão quando ele abre.
- O foco abre o cartão, então quem usa teclado vê a mesma prévia do cursor; no toque, o primeiro toque num cartão fechado só o abre, e o segundo o seleciona.
- O `alt` da imagem é vazio por padrão: preencha `alt` no item só quando a imagem disser algo que o título não diz.

## Movimento

- Só o `flex-grow` anima, numa mola sem ultrapassagem: o cartão aberto cresce até `ratio` vezes a largura de um fechado, e os demais viram fatias.
- A imagem do cartão aberto clareia, o rótulo vertical some e as linhas da prévia sobem 10 px em sequência.
- Com “reduzir movimento”, a largura troca na hora e a prévia só esmaece.

## Comportamento responsivo

- A raiz é um contêiner: com até 520 px o trilho vira coluna, fica 1,5 vez mais alto que `height`, e o cartão aberto cresce na vertical, com os rótulos dos fechados na horizontal.
- A largura de um cartão fechado é a do trilho, descontados os vãos, dividida por `ratio` + número de itens − 1; com muitos itens, as fatias ficam estreitas demais para o rótulo.

## Desempenho

- Animar `flex-grow` refaz o layout da fileira a cada quadro, por isso imagem e prévia já nascem no tamanho aberto e o cartão só as descobre; todas as imagens carregam de imediato, sem `loading="lazy"`.

## Notas para IA

- Cada item precisa de `id`, `title` e `image`; `eyebrow`, `description` (cortada em duas linhas) e `meta` são opcionais.
- Sempre há um cartão aberto (o primeiro, por padrão): `value` com `onValueChange` controla qual, e `onSelect` dispara ao pressionar o cartão já aberto; faça a navegação nele, pois o cartão é um botão, não um link.
- `trigger="press"` faz o mouse abrir cartões só no clique, não ao passar por cima (foco e toque continuam abrindo); `height` é em px, e a largura vem do pai.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/preview-rail · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
