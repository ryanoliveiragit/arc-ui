# Slider

> Escolha um valor ou um intervalo numa trilha que acompanha o dedo, com balão de dígitos rolantes.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/slider
- Descrição original (inglês): Pick a value or a range on a track that follows your finger.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slider.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slider.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slider.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slider.json`. Caminho do registro, relativo ao endereço do site: `r/slider.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/slider/slider.tsx`
  - `components/ryan-ui/slider/slider.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/slider.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Ajustes contínuos em que a posição relativa importa: volume, brilho, zoom, opacidade.
- Faixas de filtro com dois limites, como orçamento ou preço, com distância mínima entre os polegares.
- Escalas com poucos pontos nomeados, como Rascunho, Bom e Ótimo, usando `marks` com rótulo e `step`.

## Quando não usar

- Use [`number-field`](number-field.md) quando o valor exato importa e a pessoa prefere digitar.
- Use [`range-histogram-slider`](range-histogram-slider.md) quando ver a distribuição dos dados ajuda a escolher a faixa.
- Use [`ruler-slider`](ruler-slider.md) para medidas precisas com unidade, como altura ou peso, em telas de toque.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Volume1, Volume2 } from "lucide-react";
import Slider from "@/components/ryan-ui/slider/slider";
import { Stack } from "./_kit";

export default function SliderDemo() {
  const [volume, setVolume] = useState(60);
  return (
    <Stack width={420} gap={8}>
      <Slider label="Volume" value={volume} onValueChange={setVolume} start={<Volume1 size={16} aria-hidden="true" />} end={<Volume2 size={16} aria-hidden="true" />} format={(v) => `${Math.round(v)}%`} />
      <Slider label="Budget" defaultValue={[800, 2400]} min={0} max={5000} step={50} minStepsBetweenThumbs={2} format={(v) => `$${v.toLocaleString("en-US")}`} thumbLabels={["Minimum budget", "Maximum budget"]} />
      <Slider label="Quality" defaultValue={50} step={25} marks={[{ value: 0, label: "Draft" }, { value: 25 }, { value: 50, label: "Good" }, { value: 75 }, { value: 100, label: "Best" }]} showValue={false} />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Slider`

A value or a range on a track. The thumb follows the pointer 1:1, rubber-bands past its limits, and settles on the step grid with the velocity of the release; pressing the track springs the nearest thumb there. A bubble with rolling digits rides the thumb while it is dragged or keyboard focused. Arrows, Shift+arrows, PageUp, PageDown, Home, and End work as in a native range input.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | Visible label. Range thumbs are named from it unless `thumbLabels` says otherwise. |
| `value` | `T` | — | A number for one thumb, a pair for a range. |
| `defaultValue` | `T` | — | — |
| `onValueChange` | `(value: T) => void` | — | — |
| `onValueCommit` | `(value: T) => void` | — | Runs once a drag is released or a key changes the value, for work too heavy for every step. |
| `min` | `number` | `0` | — |
| `max` | `number` | `100` | — |
| `step` | `number` | `1` | — |
| `largeStep` | `number` | — | PageUp, PageDown, and Shift with an arrow move this far. Defaults to a tenth of the range. |
| `marks` | `(number \| SliderMark)[]` | — | Ticks on the track. A number draws a tick; a mark with a label also prints it under the track, and clicking it moves there. |
| `minStepsBetweenThumbs` | `number` | `0` | The closest two range thumbs may sit, in steps. |
| `format` | `(value: number) => string` | — | Formats the readout, the bubble, and the spoken value. |
| `showValue` | `boolean` | `true` | Show the value beside the label. The bubble over the thumb still appears while dragging or focused. |
| `thumbLabels` | `[string, string]` | — | Accessible names for the two range thumbs. |
| `start` | `ReactNode` | — | Content beside the track, such as an icon or a mute button. |
| `end` | `ReactNode` | — | — |
| `name` | `string` | — | Submits the value with a form, one hidden input per thumb. |
| `disabled` | `boolean` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `SliderValue` | `number \| [number, number]` |

#### `SliderMark`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `number` | — |
| `label` | `string` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `↑` | Aumentam um `step`. |
| `←` ou `↓` | Diminuem um `step`; num limite, o polegar força contra a borda e volta. |
| `Page Up` ou `Page Down` ou `Shift + →` ou `Shift + ←` | Movem `largeStep`, por padrão um décimo da faixa. |
| `Home` ou `End` | Vão ao limite do polegar: a ponta da faixa ou, num intervalo, o outro polegar. |
| `Tab` | Num intervalo, passa de um polegar para o outro. |

## Acessibilidade

- Cada polegar é um `role="slider"` com `aria-valuetext` vindo de `format`; um valor único é nomeado pelo rótulo, e num intervalo cada polegar ganha nome próprio (`thumbLabels` ou “…, minimum” e “…, maximum”).
- O número ao lado do rótulo e o balão são `aria-hidden`, porque o slider já fala o valor; ícones em `start` e `end` devem ser `aria-hidden` ou botões com nome.

## Movimento

- O polegar segue o ponteiro 1:1, estica como elástico além dos limites e assenta na grade de `step` levando a velocidade do gesto; tocar no trilho leva o polegar mais próximo até lá numa mola.
- Um balão com dígitos de hodômetro acompanha o polegar ao arrastar e no foco por teclado, mas não no foco vindo do ponteiro, e colunas novas de dígitos abrem a largura numa mola.
- Com “reduzir movimento” ligado, o polegar vai direto ao valor, sem elástico nem tranco, e os dígitos trocam sem rolar.

## Comportamento responsivo

- Em telas de toque o balão fica mais alto, para o dedo não cobri-lo, e nunca passa das bordas do componente; arrastar na vertical continua rolando a página.

## Notas para IA

- O tipo do valor define o modo: `defaultValue={60}` dá um polegar, `defaultValue={[800, 2400]}` dá um intervalo, e `onValueChange` devolve o mesmo formato.
- `onValueChange` dispara a cada passo do arraste; trabalho pesado, como filtrar ou salvar, vai em `onValueCommit`, que vem ao soltar ou a cada tecla.
- `marks` aceita números (só o tique) ou `{ value, label }` (rótulo clicável), e `start` e `end` recebem ícones, como volume baixo e alto.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/slider · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
