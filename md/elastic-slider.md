# Elastic slider

> Controle deslizante que estica como borracha nos limites, com etiqueta que balança e marcas magnéticas.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/elastic-slider
- Descrição original (inglês): A slider that stretches like rubber past its ends, with a swaying value tag and detents the thumb clicks into.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/elastic-slider.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/elastic-slider.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/elastic-slider.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/elastic-slider.json`. Caminho do registro, relativo ao endereço do site: `r/elastic-slider.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/elastic-slider/elastic-slider.tsx`
  - `components/ryan-ui/elastic-slider/elastic-slider.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/elastic-slider.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Ajustes contínuos em que a sensação do controle conta, como volume, brilho ou intensidade.
- Valores com pontos de referência: `marks` cria paradas em que o polegar encaixa ao passar a até 7 px delas, com rótulos clicáveis sob a trilha.
- Quando o trabalho pesado só deve rodar no fim do gesto: `onValueChange` acompanha o arrasto e `onValueCommit` dispara ao soltar ou a cada tecla.

## Quando não usar

- Use [`slider`](slider.md) para um intervalo com dois polegares; este tem um só.
- Use [`number-field`](number-field.md) quando o valor exato importa e precisa ser digitado.
- Use [`ruler-slider`](ruler-slider.md) para escolher com precisão numa escala longa, com régua e inércia.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Volume1, Volume2 } from "lucide-react";
import ElasticSlider from "@/components/ryan-ui/elastic-slider/elastic-slider";
import { Caption, Stack } from "./_kit";

export default function ElasticSliderDemo() {
  const [volume, setVolume] = useState(40);
  const [budget, setBudget] = useState(2500);
  return (
    <Stack gap={8} width={400}>
      <Stack gap={2}>
        <ElasticSlider label="Volume" value={volume} onValueChange={setVolume} startIcon={<Volume1 size={18} aria-hidden="true" />} endIcon={<Volume2 size={18} aria-hidden="true" />} />
        <Caption>Drag past either end: the track stretches and springs back.</Caption>
      </Stack>
      <ElasticSlider
        label="Monthly budget"
        value={budget}
        onValueChange={setBudget}
        min={0}
        max={5000}
        step={50}
        marks={[{ value: 0, label: "$0" }, { value: 1000, label: "$1k" }, { value: 2500, label: "$2.5k" }, { value: 5000, label: "$5k" }]}
        format={(v) => `$${v.toLocaleString("en-US")}`}
      />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ElasticSlider`

A single value slider made of something that gives. The thumb swells under the finger, the track stretches like rubber past either end and springs back with the release velocity, a value tag hangs off the thumb and sways with its speed, and marks act as detents the thumb clicks into. Arrows, Shift+arrows, PageUp, PageDown, Home, and End work as in a native range input.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | Visible label; it also names the thumb. |
| `value` | `number` | — | — |
| `defaultValue` | `number` | — | — |
| `onValueChange` | `(value: number) => void` | — | — |
| `onValueCommit` | `(value: number) => void` | — | Runs once a drag is released or a key changes the value. |
| `min` | `number` | `0` | — |
| `max` | `number` | `100` | — |
| `step` | `number` | `1` | — |
| `largeStep` | `number` | — | PageUp, PageDown, and Shift with an arrow move this far. Defaults to a tenth of the range. |
| `marks` | `(number \| ElasticSliderMark)[]` | — | Detents. A dragged thumb clicks into each one and holds for a few pixels before letting go. Labels print under the track. |
| `format` | `(value: number) => string` | — | Formats the readout, the bubble, and the spoken value. |
| `showValue` | `boolean` | `true` | Show the value beside the label. The bubble over the thumb still appears while dragging or using keys. |
| `startIcon` | `ReactNode` | — | Icons at either end. The one on the side being pulled past its limit is pushed outward with the track. |
| `endIcon` | `ReactNode` | — | — |
| `name` | `string` | — | Submits the value with a form. |
| `disabled` | `boolean` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

#### `ElasticSliderMark`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `number` | — |
| `label` | `string` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `↑` | Soma um `step`. |
| `←` ou `↓` | Subtrai um `step`. |
| `Page Up` ou `Page Down` | Soma ou subtrai `largeStep` (por padrão, um décimo da faixa). |
| `Shift + →` ou `Shift + ↑` ou `Shift + ←` ou `Shift + ↓` | Movem `largeStep` em vez de `step`. |
| `Home` ou `End` | Vai para `min` ou para `max`. |

## Acessibilidade

- O polegar é um `role="slider"` focável, nomeado pelo `label` visível, com `aria-valuenow`, `aria-valuemin`, `aria-valuemax` e um `aria-valuetext` que vem de `format`.
- O valor ao lado do rótulo e a etiqueta sobre o polegar são decorativos (`aria-hidden`): o que o leitor de tela anuncia é o `aria-valuetext`.
- Clicar ou tocar em qualquer ponto da trilha leva o foco ao polegar, e a área de toque dele se estende 12 px além do círculo.

## Movimento

- Além das pontas a trilha estica como elástico (até 26 px), afina e, ao soltar, volta com uma mola que ultrapassa e assenta; no teclado, insistir num limite dá o mesmo tranco.
- A etiqueta de valor segue o polegar com um pequeno atraso e balança conforme a velocidade; ao encaixar numa marca, o ponto dela pulsa e, no toque, o aparelho vibra quando há suporte.
- Com “reduzir movimento” ligado, não há esticamento nem balanço: o polegar salta para o valor e a etiqueta só esmaece.

## Comportamento responsivo

- Ocupa 100% da largura do contêiner e só existe na horizontal; `--elastic-thumb` e `--elastic-track` ajustam os tamanhos (padrão 24 px e 8 px).
- No toque, arrastar na vertical continua rolando a página (`touch-action: pan-y`) e, em ponteiros grossos, a etiqueta sobe mais para não ficar sob o dedo.

## Notas para IA

- `label` é obrigatório e visível; use `value` + `onValueChange` ou `defaultValue` (que cai em `min`), com padrões `min={0}`, `max={100}` e `step={1}`.
- O formato padrão do número é `en-US`: passe `format` para moeda, unidade ou separadores em português; ele vale para o texto ao lado do rótulo, a etiqueta e o leitor de tela.
- `marks` aceita números ou `{ value, label }`, `startIcon` e `endIcon` põem ícones nas pontas e `name` envia o valor num campo oculto.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/elastic-slider · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
