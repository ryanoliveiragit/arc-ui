# Range histogram slider

> Faixa de preço sobre um histograma dos dados, acendendo as barras dentro do intervalo escolhido.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/range-histogram-slider
- Descrição original (inglês): A price range over a live histogram of the data, lighting the bars inside the range and settling on bar edges.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/range-histogram-slider.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/range-histogram-slider.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/range-histogram-slider.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/range-histogram-slider.json`. Caminho do registro, relativo ao endereço do site: `r/range-histogram-slider.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/range-histogram-slider/range-histogram-slider.tsx`
  - `components/ryan-ui/range-histogram-slider/range-histogram-slider.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/range-histogram-slider.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Filtro de faixa de preço ou de outra medida em que ver a distribuição ajuda a escolher, como diárias, salários ou tamanhos.
- Buscas com filtro ao vivo, em que as barras acesas mostram quanto do conjunto fica dentro do intervalo.

## Quando não usar

- Use [`slider`](slider.md) quando não há dados para mostrar a distribuição ou quando basta um valor só.
- Use [`number-field`](number-field.md) quando a pessoa já sabe os limites exatos e prefere digitar.
- Use [`chip-group`](chip-group.md) para filtrar por categorias em vez de números.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useMemo, useState } from "react";
import RangeHistogramSlider from "@/components/ryan-ui/range-histogram-slider/range-histogram-slider";
import { Caption, Stack } from "./_kit";

function prices() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const out: number[] = [];
  for (let i = 0; i < 260; i++) {
    const n = (rnd() + rnd() + rnd()) / 3;
    out.push(Math.round(40 + n * n * 560));
  }
  return out;
}

export default function RangeHistogramSliderDemo() {
  const data = useMemo(prices, []);
  const [range, setRange] = useState<[number, number]>([120, 320]);
  const count = data.filter((p) => p >= range[0] && p <= range[1]).length;
  return (
    <Stack width={460} gap={4}>
      <RangeHistogramSlider label="Nightly price" data={data} value={range} onValueChange={setRange} min={40} max={600} format={(v) => `$${Math.round(v)}`} />
      <Caption>{count} of {data.length} stays between ${Math.round(range[0])} and ${Math.round(range[1])}.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `RangeHistogramSlider`

A two thumb range over a histogram of the data it filters. Bars inside the range light up, cut exactly at each thumb on the frame it moves; the thumbs follow the pointer 1:1, never cross, rubber-band at the ends, and settle on bar edges with the release velocity. A press anywhere on the histogram or track springs the nearest thumb there. Arrows step, Shift+arrows and PageUp or PageDown move one bar, and Home or End go to a thumb's limit.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | Visible label. The thumbs are named from it unless `thumbLabels` says otherwise. |
| `data` (obrigatória) | `number[]` | — | The raw values the histogram counts, such as every listing's price. |
| `value` | `[number, number]` | — | — |
| `defaultValue` | `[number, number]` | — | — |
| `onValueChange` | `(value: [number, number]) => void` | — | — |
| `onValueCommit` | `(value: [number, number]) => void` | — | Runs once a drag is released or a key changes the value. |
| `min` | `number` | — | Defaults to the smallest and largest data values. |
| `max` | `number` | — | — |
| `step` | `number` | `1` | — |
| `bins` | `number` | `32` | How many bars the histogram draws. |
| `snapToBins` | `boolean` | `true` | A released thumb that lands near the edge of a bar settles on that edge, so a range never cuts a bar in half. |
| `minStepsBetweenThumbs` | `number` | `1` | The closest the two thumbs may sit, in steps. |
| `format` | `(value: number) => string` | — | Formats the readout and the spoken values. |
| `thumbLabels` | `[string, string]` | — | — |
| `name` | `string` | — | Submits the range with a form, one hidden input per thumb. |
| `disabled` | `boolean` | — | — |
| `className` | `string` | — | — |

### Outras exportações

- `histogram` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `↑` | Aumentam o polegar em foco em um `step`. |
| `←` ou `↓` | Diminuem o polegar em foco; num limite, ele força contra a borda e volta numa mola. |
| `Shift + →` ou `Shift + ←` ou `Page Up` ou `Page Down` | Levam o polegar até a próxima borda de barra naquela direção, percorrendo o histograma barra a barra. |
| `Home` ou `End` | Levam o polegar ao seu limite: a ponta da escala ou o outro polegar, respeitando a distância mínima. |
| `Tab` | Passa do polegar do mínimo para o do máximo. |

## Acessibilidade

- Cada polegar é um `role="slider"` próprio, chamado “{label}, minimum” e “{label}, maximum” (troque com `thumbLabels`), com `aria-valuetext` vindo de `format`.
- `aria-valuemin` e `aria-valuemax` de cada polegar acompanham o outro, então o leitor de tela ouve só o trecho que ainda está livre.
- O histograma e o texto do intervalo são `aria-hidden`; se a quantidade de itens no intervalo importa, mostre-a em texto fora do componente, como faz a demo.

## Movimento

- Os polegares seguem o ponteiro 1:1, nunca se cruzam, esticam como elástico além das pontas e, ao soltar, assentam numa borda de barra próxima levando a velocidade do gesto.
- As barras dentro do intervalo acendem por um recorte que corta exatamente no polegar, no mesmo quadro, e tocar no gráfico ou no trilho leva o polegar mais próximo até lá numa mola.
- Com “reduzir movimento” ligado, os polegares vão direto ao valor, sem elástico nem tranco nos limites.

## Comportamento responsivo

- Ocupa a largura do contêiner, e no toque arrastar na vertical continua rolando a página (`touch-action: pan-y`).

## Desempenho

- As barras são recontadas quando muda a identidade de `data`, `min`, `max` ou `bins`; memorize o array com `useMemo` para não recontar a cada render.
- Sem `min` e `max`, os limites saem de `Math.min(...data)` e `Math.max(...data)` a cada render; com muitos valores, passe os dois.

## Notas para IA

- `data` são os valores brutos (o preço de cada anúncio), não as contagens; o componente distribui os valores em `bins` barras, 32 por padrão.
- Passe `min` e `max` explícitos, como a demo faz: o mínimo padrão inclui o zero, então preços de 40 a 600 abririam a escala em 0.
- Use `onValueChange` para o texto ao vivo e `onValueCommit` para filtrar ou buscar, porque ele dispara ao soltar ou a cada tecla; `snapToBins={false}` desliga o encaixe nas bordas.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/range-histogram-slider · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
