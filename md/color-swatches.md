# Color swatches

> Amostras de cor em grupo de opções: um anel desliza com mola até a cor escolhida e cada amostra reage ao toque.

- Tipo: componente (categoria Entradas), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/color-swatches
- Descrição original (inglês): A radio group of color swatches whose selection ring glides between swatches on a spring, with press feedback.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/color-swatches.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/color-swatches.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/color-swatches.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/color-swatches.json`. Caminho do registro, relativo ao endereço do site: `r/color-swatches.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/color-swatches/color-swatches.tsx`
  - `components/ryan-ui/color-swatches/color-swatches.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/color-swatches.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Escolher uma entre poucas cores fixas: acabamento de um produto, cor de uma etiqueta ou de um projeto.
- Quando alguma cor pode estar indisponível: `disabled` na opção a mostra riscada, e o teclado passa por cima dela.
- Em formulários: `name` acrescenta um campo oculto com o valor escolhido.

## Quando não usar

- Use [`color-picker`](color-picker.md) quando a pessoa precisa de qualquer cor, com matiz, opacidade ou valor digitado.
- Use [`radio-cards`](radio-cards.md) quando cada opção precisa de texto, preço ou descrição visíveis; aqui o nome da cor só aparece na dica do mouse e para o leitor de tela.
- Para marcar várias cores ao mesmo tempo: é um grupo de rádio, então só uma fica escolhida.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { ColorSwatches } from "@/components/ryan-ui/color-swatches/color-swatches";
import type { ColorSwatch } from "@/components/ryan-ui/color-swatches/color-swatches";
import { Caption, Field, Stack, Surface } from "./_kit";

// Product finishes are data, not theme: these are the colors of the item being sold, so they are literal values rather than tokens.
const finishes: ColorSwatch[] = [
  { value: "graphite", color: "#3a3d42", label: "Graphite" },
  { value: "bone", color: "#e9e4d8", label: "Bone" },
  { value: "moss", color: "#6f7f4f", label: "Moss" },
  { value: "clay", color: "#c2714f", label: "Clay" },
  { value: "harbor", color: "#3f6c8f", label: "Harbor blue" },
  { value: "plum", color: "#6d3b5e", label: "Plum", disabled: true },
];

const labels: ColorSwatch[] = [
  { value: "teal", color: "var(--tone-teal)", label: "Teal" },
  { value: "sky", color: "var(--tone-sky)", label: "Sky" },
  { value: "violet", color: "var(--tone-violet)", label: "Violet" },
  { value: "orchid", color: "var(--tone-orchid)", label: "Orchid" },
  { value: "rose", color: "var(--tone-rose)", label: "Rose" },
  { value: "amber", color: "var(--tone-amber)", label: "Amber" },
  { value: "green", color: "var(--tone-green)", label: "Green" },
];

export default function ColorSwatchesDemo() {
  const [finish, setFinish] = useState("moss");
  const [tag, setTag] = useState("sky");
  const chosen = finishes.find(option => option.value === finish);

  return (
    <Surface width={380} padding={6}>
      <Stack gap={6}>
        <Field label={<>Finish: <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>{chosen?.label}</strong></>}>
          <ColorSwatches label="Finish" options={finishes} value={finish} onValueChange={setFinish} />
          <Caption>Plum is out of stock until March.</Caption>
        </Field>
        <Field label="Label color">
          <ColorSwatches label="Label color" options={labels} value={tag} onValueChange={setTag} size="sm" shape="rounded" />
        </Field>
      </Stack>
    </Surface>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ColorSwatches`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `options` (obrigatória) | `ColorSwatch[]` | — | The colors to choose from. |
| `value` | `string` | — | The chosen value (controlled). |
| `defaultValue` | `string` | — | The value chosen at first (uncontrolled). |
| `onValueChange` | `(value: string) => void` | — | Runs when a swatch is chosen. |
| `label` (obrigatória) | `string` | — | Accessible name of the group, for example "Color". |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Swatch diameter: `sm` 24 px, `md` 32 px, `lg` 40 px. |
| `shape` | `"circle" \| "rounded"` | `"circle"` | Swatch shape. |
| `name` | `string` | — | Field name: adds a hidden input so the value submits with a form. |
| `disabled` | `boolean` | `false` | Turns the whole group off. |
| `className` | `string` | — | Extra class names for the root element. |

### Tipos exportados

#### `ColorSwatch`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | The value reported when this swatch is chosen. |
| `color` (obrigatória) | `string` | Any CSS color: a hex code, `oklch(...)`, or a token such as `var(--tone-teal)`. |
| `label` | `string` | Spoken name and tooltip, for example "Forest green". Falls back to the value. |
| `disabled` | `boolean` | Shown struck through and skipped by the keyboard, for a color that is unavailable. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `↓` | Escolhe a próxima cor habilitada; da última volta à primeira. |
| `←` ou `↑` | Escolhe a cor habilitada anterior; da primeira vai à última. |
| `Home` ou `End` | Escolhe a primeira ou a última cor habilitada. |
| `Enter` ou `Espaço` | Escolhe a cor em foco, quando ainda não é a escolhida. |
| `Tab` | Entra no grupo pela cor escolhida, ou pela primeira habilitada quando nada foi escolhido. |

## Acessibilidade

- O grupo é um `role="radiogroup"` nomeado por `label` (obrigatório) e cada cor é um botão `role="radio"` com `aria-checked` e tabindex móvel.
- Dê um `label` a cada opção: ele é o nome lido pelo leitor de tela e a dica do mouse; sem ele, o que se ouve é o `value`.
- A escolha é marcada por um anel externo e a cor indisponível por um risco, então nenhum dos dois estados depende só da cor.

## Movimento

- Um único anel desliza de uma cor à outra com uma mola suave, em vez de sumir de uma e aparecer na outra.
- A amostra cresce de leve sob o cursor e afunda ao ser pressionada.
- Com “reduzir movimento” ligado, o anel troca de lugar na hora e as amostras não mudam de escala.

## Comportamento responsivo

- As amostras quebram linha (`flex-wrap`) e medem 24, 32 ou 40 px conforme `size` (`sm`, `md`, `lg`).

## Notas para IA

- `options` é `{ value, color, label?, disabled? }[]`, e `color` aceita qualquer cor CSS, inclusive tokens como `var(--tone-teal)`.
- Controlado com `value` + `onValueChange` ou não controlado com `defaultValue`; o `label` do grupo é obrigatório e não aparece na tela.
- Como o nome da cor não fica visível, mostre a escolha em texto ao lado, como a demo faz com “Finish: Moss”; `shape` alterna entre `circle` e `rounded`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/color-swatches · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
