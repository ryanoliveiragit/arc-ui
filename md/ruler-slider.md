# Ruler slider

> Uma fita de marcas que desliza sob uma agulha fixa, com inércia, encaixe e valor rolante.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/ruler-slider
- Descrição original (inglês): A tape of ticks that slides under a fixed needle, with momentum, snapping, and a rolling readout.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ruler-slider.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ruler-slider.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ruler-slider.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ruler-slider.json`. Caminho do registro, relativo ao endereço do site: `r/ruler-slider.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/ruler-slider/ruler-slider.tsx`
  - `components/ryan-ui/ruler-slider/ruler-slider.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/ruler-slider.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Medidas como altura, peso ou temperatura, em que a metáfora da fita métrica ajuda e o valor exato importa.
- Telas de toque, onde arrastar e arremessar uma fita é mais confortável que acertar um polegar pequeno.
- Onboarding com uma medida por tela, com o número grande e a unidade em destaque.

## Quando não usar

- Use [`slider`](slider.md) quando a faixa é curta ou quando ver a posição no trilho importa mais que o número exato.
- Use [`number-field`](number-field.md) quando a pessoa já sabe o número e prefere digitar.
- Use [`range-histogram-slider`](range-histogram-slider.md) ou um [`slider`](slider.md) com dois valores para escolher um intervalo.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import RulerSlider from "@/components/ryan-ui/ruler-slider/ruler-slider";
import { Caption, Stack } from "./_kit";

export default function RulerSliderDemo() {
  const [height, setHeight] = useState(172);
  return (
    <Stack width={420} gap={5}>
      <RulerSlider label="Height" unit="cm" min={120} max={220} step={1} majorEvery={10} value={height} onValueChange={setHeight} />
      <Caption>Drag, flick or tap the tape. Arrow keys step one tick. {height} cm is about {(height / 30.48).toFixed(1)} ft.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `RulerSlider`

A precise value input shaped like a tape measure. A ruler of ticks slides under a fixed needle: drag it 1:1, flick it and it coasts with momentum onto a tick, pull it past either end and it rubber-bands back, or tap a spot to glide it there. The readout rolls each digit as the tape passes. Arrows step one tick, Shift+arrows and PageUp or PageDown move one labelled tick, Home and End go to the ends, and horizontal trackpad scrolling moves the tape.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | Visible label; it also names the control. |
| `value` | `number` | — | — |
| `defaultValue` | `number` | — | — |
| `onValueChange` | `(value: number) => void` | — | — |
| `onValueCommit` | `(value: number) => void` | — | Runs once the tape comes to rest after a drag, a flick, a tap, or a key. |
| `min` | `number` | `0` | — |
| `max` | `number` | `100` | — |
| `step` | `number` | `1` | The value of one small tick. The tape always rests on a tick. |
| `largeStep` | `number` | — | PageUp, PageDown, and Shift with an arrow move this far. Defaults to one labelled tick. |
| `majorEvery` | `number` | `10` | Small ticks between labelled ticks. |
| `spacing` | `number` | `10` | Pixels between small ticks. Wider spacing gives finer control. |
| `format` | `(value: number) => string` | — | Formats the readout, the tick labels, and the spoken value. |
| `unit` | `string` | — | Unit shown after the readout and spoken with the value, such as "cm". |
| `name` | `string` | — | Submits the value with a form. |
| `disabled` | `boolean` | — | — |
| `className` | `string` | — | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `↑` | Avançam uma marca pequena (`step`), e a fita desliza até ela numa mola. |
| `←` ou `↓` | Voltam uma marca pequena. |
| `Page Up` ou `Page Down` ou `Shift + →` ou `Shift + ←` | Andam uma marca rotulada (`largeStep`, por padrão `step` vezes `majorEvery`). |
| `Home` ou `End` | Vão ao mínimo ou ao máximo. |

## Acessibilidade

- A fita inteira é um único `role="slider"` focável, nomeado pelo rótulo, com `aria-valuetext` que junta o valor formatado e a `unit` (“172 cm”).
- O número grande e as marcas são `aria-hidden`, e o leitor de tela ouve só o valor do slider, então ponha em `format` e `unit` o texto que deve ser falado.

## Movimento

- A fita segue o dedo 1:1, continua deslizando com inércia depois de um arremesso e sempre para numa marca; puxada além das pontas, estica como elástico e volta.
- Um toque leva a marca tocada até a agulha numa mola, e os dígitos do número rolam cada um na sua coluna enquanto a fita passa.
- Com “reduzir movimento” ligado, a fita vai direto ao valor, sem inércia nem elástico, e os dígitos trocam sem rolar.

## Comportamento responsivo

- Ocupa a largura do contêiner com as pontas da fita esmaecidas; no toque, arrastar na vertical rola a página, e no trackpad a rolagem horizontal move a fita.

## Desempenho

- As marcas pequenas são um fundo em CSS, mas cada marca rotulada é um elemento e a fita tem a largura da faixa inteira; para faixas enormes com `step` pequeno, aumente `majorEvery` ou divida a faixa.

## Notas para IA

- Feito para valores físicos com `unit` (cm, kg, °C): `min`, `max` e `step` definem a fita, e `spacing` (px por marca) controla a precisão do arraste.
- `onValueChange` dispara a cada marca que passa pela agulha, inclusive durante a inércia; salve ou busque em `onValueCommit`, que vem quando a fita para.
- A altura vem de `--ruler-height` e a largura é 100%, então limite a largura no elemento pai.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/ruler-slider · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
