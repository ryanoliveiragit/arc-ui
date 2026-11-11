# Image generation

> Cartão de pedido de imagem: um campo de células cintila com o progresso e a imagem surge do desfoque até ficar nítida.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/image-generation
- Descrição original (inglês): An image request card: a shimmering field of cells with progress and phase labels, then the image resolves from blurred to sharp and the footer becomes the actions row.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/image-generation.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/image-generation.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/image-generation.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/image-generation.json`. Caminho do registro, relativo ao endereço do site: `r/image-generation.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/image-generation/image-generation.tsx`
  - `components/ryan-ui/image-generation/image-generation.module.css`
  - `components/ryan-ui/lib/use-copy-feedback.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/image-generation.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um pedido de imagem numa conversa ou num editor, com prompt, progresso e resultado no mesmo cartão.
- Gerações que levam alguns segundos e têm progresso conhecido: o cartão mostra a fase e a porcentagem em vez de um spinner.
- Quando o resultado pede ações imediatas: gerar de novo, baixar a imagem e copiar o prompt.

## Quando não usar

- Use [`skeleton`](skeleton.md) para reservar o lugar de uma imagem comum que só está carregando.
- Use [`image-viewer`](image-viewer.md) para uma galeria de imagens prontas, com zoom e navegação.
- Use [`progress`](progress.md) ou [`toast-progress`](toast-progress.md) para tarefas longas que não terminam numa imagem.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { ImageGeneration } from "@/components/ryan-ui/image-generation/image-generation";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { photo } from "@/components/ryan-ui/lib/media";
import type { PhotoId } from "@/components/ryan-ui/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

const requests = {
  lake: { label: "Lake", prompt: "A quiet alpine lake at dawn, layered ridges fading into mist, flat paper-cut style", results: ["alpine-lake", "mountain-ridges", "coastline"] },
  city: { label: "City", prompt: "Lisbon rooftops in late afternoon light, terracotta and cream, minimal shapes", results: ["lisbon-rooftops", "lisbon-bridge", "lisbon-tram"] },
  arches: { label: "Arches", prompt: "A row of arches beside a pool, soft shadows, sea blue and sand palette", results: ["pool-house", "curved-facade", "sunroom"] },
} as const satisfies Record<string, { label: string; prompt: string; results: readonly PhotoId[] }>;

type RequestKey = keyof typeof requests;

export default function ImageGenerationDemo() {
  const [request, setRequest] = useState<RequestKey>("lake");
  const [variant, setVariant] = useState(0);
  const { prompt, results } = requests[request];
  const result = photo(results[variant % results.length]!);
  return (
    <Stack width={440} gap={3}>
      <ImageGeneration
        key={request}
        prompt={prompt}
        model="Studio v3 · 3:2"
        aspectRatio="3 / 2"
        src={result.src}
        alt={result.alt}
        duration={3600}
        onRegenerate={() => setVariant(current => current + 1)}
      />
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <SegmentedControl
          label="Prompt"
          value={request}
          onValueChange={value => { setRequest(value as RequestKey); setVariant(0); }}
          options={(Object.keys(requests) as RequestKey[]).map(key => ({ value: key, label: requests[key].label }))}
        />
        <Caption>Pick a prompt, or regenerate for another take.</Caption>
      </div>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ImageGeneration`

A card for one image request. While the image is being made, a field of cells shimmers behind a progress line and a phase label; when it is ready the image resolves from blurred to sharp and the footer turns into the actions: regenerate, download, copy prompt.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `prompt` (obrigatória) | `string` | — | The prompt the image was requested with. |
| `src` | `string` | — | Address of the finished image. It is shown when the status is "done". |
| `alt` | `string` | — | Alternative text of the finished image. Defaults to the prompt. |
| `status` | `"idle" \| "generating" \| "done" \| "error"` | — | Where the request is (controlled). Leave it out and the card runs a timed preview: `duration` of progress on mount and on every regenerate. |
| `progress` | `number` | — | Progress from 0 to 1 while generating (controlled, used together with `status`). |
| `duration` | `number` | `4200` | Length of the built-in timed preview in milliseconds, when `status` is not controlled. |
| `model` | `string` | — | Name of the model or style, shown next to the prompt. |
| `aspectRatio` | `string` | `"4 / 3"` | Aspect ratio of the image frame, as a CSS `aspect-ratio` value. |
| `error` | `string` | `"The image could not be generated."` | Message shown when the status is "error". |
| `onRegenerate` | `() => void` | — | Called by Generate, Regenerate and Try again. Swap `src` here to show a new result. |
| `onComplete` | `() => void` | — | Called when the built-in timed preview reaches the end. |
| `className` | `string` | — | Class name added to the root element. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ImageGenerationStatus` | `"idle" \| "generating" \| "done" \| "error"` |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Aciona o botão em foco: “Regenerate”, “Copy prompt”, “Generate” ou “Try again”. |
| `Enter` | Ativa o link “Download”, que aponta para `src` com o atributo `download`. |

## Acessibilidade

- Enquanto gera, a moldura é um `role="progressbar"` com `aria-valuenow` e `aria-valuetext` (fase e porcentagem); no fim, uma região `role="status"` anuncia “Image ready”.
- O erro aparece num `role="alert"`; a imagem usa `alt`, que por padrão repete o `prompt`, então passe um `alt` que descreva o resultado.
- Fases, botões e anúncios estão fixos em inglês; só `prompt`, `model`, `alt` e `error` são seus.

## Movimento

- Durante a geração, uma onda diagonal de opacidade percorre uma grade de 8 × 6 células, a linha de progresso enche e o rótulo da fase troca saindo de um desfoque.
- Quando a imagem termina de carregar, ela passa de desfocada e levemente ampliada para nítida em menos de um segundo, e as ações entram em sequência no rodapé.
- Com “reduzir movimento” ligado, a onda para e as células ficam fixas, a imagem aparece sem desfoque nem zoom e as trocas são imediatas.

## Comportamento responsivo

- Ocupa 100% do pai e a moldura mantém `aspectRatio` (padrão `4 / 3`); o prompt corta em duas linhas e as ações quebram para a linha de baixo.

## Desempenho

- Sem `status`, um `setInterval` de 70 ms move o progresso; cada cartão em geração anima 48 células, e o desfoque de 28 px na revelação é caro: evite vários gerando ao mesmo tempo.

## Notas para IA

- Sem `status`, o cartão não gera nada: roda uma prévia cronometrada de `duration` ms ao montar e a cada “Regenerate”; em uso real, controle `status` (`idle`, `generating`, `done`, `error`) e `progress` de 0 a 1.
- `onRegenerate` é chamado por “Generate”, “Regenerate” e “Try again”: dispare a nova geração ali e troque `src` quando ela terminar.
- A imagem só aparece com `status` em `done` e `src` carregado; “Download” é um link com `download` para o mesmo `src`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/image-generation · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
