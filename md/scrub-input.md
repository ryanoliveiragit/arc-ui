# Scrub input

> Campo numérico estilo Figma: arraste o rótulo para ajustar ou digite valores, unidades e contas.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/scrub-input
- Descrição original (inglês): A Figma-style number field: drag the label to scrub, or type values, units, and arithmetic.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/scrub-input.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/scrub-input.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/scrub-input.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/scrub-input.json`. Caminho do registro, relativo ao endereço do site: `r/scrub-input.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/scrub-input/scrub-input.tsx`
  - `components/ryan-ui/scrub-input/scrub-input.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/scrub-input.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Painéis de propriedades e inspetores (largura, posição, rotação, opacidade), em que arrastar é mais rápido que digitar.
- Campos numéricos que ganham com contas e unidades digitadas, como `320/2 + 8` ou `50%`.
- Valores circulares, como rotação de 0 a 360, com `wrap`.

## Quando não usar

- Use [`number-field`](number-field.md) em formulários comuns, onde as pessoas esperam botões de mais e menos à vista.
- Use [`slider`](slider.md) quando a posição dentro da faixa importa mais que o número.
- Use [`money-input`](money-input.md) para valores em dinheiro.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { RotateCw } from "lucide-react";
import ScrubInput from "@/components/ryan-ui/scrub-input/scrub-input";
import { Caption, Row, Stack } from "./_kit";

export default function ScrubInputDemo() {
  const [w, setW] = useState(320);
  return (
    <Stack width={360} gap={4}>
      <Row gap={3} wrap={false}>
        <ScrubInput label="W" value={w} onValueChange={setW} min={0} max={1200} unit="px" units={["px", "%"]} />
        <ScrubInput label="H" defaultValue={180} min={0} max={1200} unit="px" units={["px", "%"]} />
      </Row>
      <Row gap={3} wrap={false}>
        <ScrubInput label={<RotateCw size={16} aria-hidden="true" />} aria-label="Rotation" defaultValue={45} min={0} max={360} wrap unit="°" />
        <ScrubInput label="Opacity" defaultValue={80} min={0} max={100} unit="%" />
      </Row>
      <Caption>Drag a label to scrub, double click to reset, or type math such as 320/2 + 8. Width: {w}.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ScrubInput`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `ReactNode` | — | Text or a 16px icon. Icon labels need `aria-label` so the field keeps an accessible name. |
| `value` | `number` | — | — |
| `defaultValue` | `number` | `0` | — |
| `onValueChange` | `(value: number, details: ScrubInputChangeDetails) => void` | — | Fires for every change, including each step of a scrub. |
| `onValueCommit` | `(value: number, details: ScrubInputChangeDetails) => void` | — | Fires once when a change settles: a scrub ends, Enter or blur commits typing, or a key step lands. |
| `min` | `number` | `-Infinity` | — |
| `max` | `number` | `Infinity` | — |
| `step` | `number` | `1` | One step for arrows and scrubbing. Defaults to 1. |
| `fineStep` | `number` | — | Step with Alt held. Defaults to a tenth of `step`. |
| `coarseStep` | `number` | — | Step with Shift held. Defaults to ten times `step`. |
| `precision` | `number` | — | Decimal places kept. Defaults to the precision of `fineStep`. |
| `pixelsPerStep` | `number` | `2` | Pointer travel in px for one step while scrubbing. Defaults to 2. |
| `wrap` | `boolean` | `false` | Values wrap around from `max` to `min` instead of stopping, as rotation does. Needs both limits. |
| `unit` | `string` | — | The unit shown after the number. With more than one entry in `units`, it becomes a button that cycles them. |
| `defaultUnit` | `string` | — | — |
| `units` | `readonly string[]` | — | Units a typed value may carry, such as ["px", "%"]. Defaults to the current unit. |
| `onUnitChange` | `(unit: string) => void` | — | — |
| `resetValue` | `number` | — | Double click the label to return here. |
| `track` | `boolean` | — | Shows how far the value sits between `min` and `max` as a quiet fill. On by default when both limits are set. |
| `size` | `"sm" \| "md"` | `"md"` | — |
| `pointerLock` | `boolean` | `true` | Locks the pointer while scrubbing when the browser allows it. On by default. |
| `className` | `string` | — | — |
| `...props` | `InputHTMLAttributes<HTMLInputElement>` | — | Também aceita as props deste tipo, menos `value`, `defaultValue`, `onChange`, `type`, `size`, `min`, `max`, `step` e `prefix`. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ScrubInputSource` | `"scrub" \| "type" \| "key" \| "reset"` |

#### `ScrubInputChangeDetails`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `source` (obrigatória) | `"scrub" \| "type" \| "key" \| "reset"` | What produced the value: a label drag, a typed entry, an arrow key, or a double click reset. |
| `unit` (obrigatória) | `string` | The unit in effect after the change. |

### Outras exportações

- `evaluateScrubExpression` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Somam ou subtraem um `step`; com Shift usam `coarseStep` (10× por padrão) e caem na grade grossa, como 13 indo a 20, e com Alt usam `fineStep` (um décimo). |
| `Enter` | Confirma o texto digitado, inclusive contas como `(100-24)/2` e unidades de `units`. |
| `Esc` | Descarta o texto digitado e volta ao último valor; durante um arraste do rótulo, cancela o arraste. |
| `Tab` | Sair do campo confirma o texto digitado, como o Enter. |

## Acessibilidade

- O campo é um `role="spinbutton"` com `aria-valuetext` que fala a unidade por extenso (“50 percent”, “45 degrees”) e `aria-invalid` por um instante quando uma conta é recusada.
- Com texto no `label`, o `<label>` nomeia o campo; com um ícone, passe `aria-label`, e o botão de unidade se anuncia como “Unit: px. Change unit”.
- Arrastar o rótulo é só para ponteiro; pelo teclado, o mesmo ajuste é feito com as setas e os modificadores.

## Movimento

- Nos limites, o campo estica como elástico na direção do arraste e volta numa mola ao soltar, e uma conta inválida faz o campo tremer uma vez.
- A faixa de preenchimento acompanha o arraste 1:1 e desliza até valores digitados; segurar Shift ou Alt mostra uma etiqueta “×10” ou “×0.1”.
- Com “reduzir movimento” ligado, não há elástico nem tremor, a faixa salta para o valor e etiquetas e unidade só esmaecem.

## Comportamento responsivo

- Ocupa a coluna inteira (fixe com `--scrub-input-width`); no toque, o rótulo arrasta na horizontal e a rolagem vertical segue para a página, e o travamento do ponteiro vale só para mouse.

## Notas para IA

- Pensado para linhas densas: `label` curto (“W”, “X” ou um ícone de 16px com `aria-label`), `min`, `max`, `unit` e `size="sm"`.
- `unit` deixa a unidade controlada, então trate `onUnitChange`; para o botão de unidades e o `50%` digitado trocarem a unidade sozinhos, use `defaultUnit`.
- `onValueChange` dispara a cada passo do arraste, com `details.source`; salve em `onValueCommit`, que vem ao soltar, no Enter, ao sair do campo e a cada seta.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/scrub-input · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
