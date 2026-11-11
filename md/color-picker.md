# Color picker

> Uma amostra que se expande em seletor, com formatos, conta-gotas, cores salvas e leitura de contraste.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/color-picker
- Descrição original (inglês): A swatch that grows into a picker with format morphing, eyedropper, saved swatches, and contrast readout.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/color-picker.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/color-picker.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/color-picker.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/color-picker.json`. Caminho do registro, relativo ao endereço do site: `r/color-picker.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Text morph](text-morph.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/color-picker/color-picker.tsx`
  - `components/ryan-ui/color-picker/color-picker.module.css`
  - `components/ryan-ui/text-morph/text-morph.tsx`
  - `components/ryan-ui/text-morph/text-morph.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/color-picker.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Escolha livre de cor num editor de tema, de marca ou de etiqueta, com opacidade e entrada por texto em hex, RGB, HSL ou OKLCH.
- Quando a legibilidade importa: `background` alimenta a leitura de contraste WCAG (razão e nível) da cor sobre o fundo em que ela vai ficar.
- Fluxos em que as pessoas guardam e reutilizam cores: as amostras salvas podem ser aplicadas, reordenadas e removidas.

## Quando não usar

- Use [`color-swatches`](color-swatches.md) quando a escolha é entre poucas cores fixas, como os acabamentos de um produto.
- Evite dentro de contêineres que cortam o conteúdo ou junto à borda direita ou inferior da tela: o painel não usa portal nem inverte, cresce para baixo e para a direita a partir da amostra.
- Quando a cor precisa ser confirmada ou cancelada: cada ajuste chama `onValueChange` na hora e o botão de concluir só fecha o painel.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import ColorPicker from "@/components/ryan-ui/color-picker/color-picker";
import { Caption, Stack } from "./_kit";

export default function ColorPickerDemo() {
  const [color, setColor] = useState("#2F6BFF");
  return (
    <Stack gap={4} align="center" style={{ minHeight: 360 }}>
      <ColorPicker
        label="Accent"
        value={color}
        onValueChange={setColor}
        defaultSwatches={[
          { id: "a", color: "#2F6BFF" },
          { id: "b", color: "#E5484D" },
          { id: "c", color: "#30A46C" },
          { id: "d", color: "#F5A524" },
        ]}
      />
      <Caption>Current value: {color}. Open the swatch to change format or save colors.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ColorPicker`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` | `string` | — | Any color the picker can read: hex, rgb(), hsl(), or oklch(). |
| `defaultValue` | `string` | `"#2F6BFF"` | — |
| `onValueChange` | `(hex: string) => void` | — | Receives the color as hex, with two alpha digits when it is not opaque. |
| `background` | `string` | `"#FFFFFF"` | The background the color will sit on, for the contrast readout. |
| `label` | `string` | `"Color"` | Name shown on the swatch, such as "Accent". |
| `swatches` | `ColorSwatch[]` | — | — |
| `defaultSwatches` | `ColorSwatch[]` | — | — |
| `onSwatchesChange` | `(swatches: ColorSwatch[]) => void` | — | — |
| `maxSwatches` | `number` | `7` | Most saved swatches. Saving past it drops the oldest. |
| `defaultFormat` | `"hex" \| "rgb" \| "hsl" \| "oklch"` | `"hex"` | — |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ColorFormat` | `"hex" \| "rgb" \| "hsl" \| "oklch"` |

#### `ColorSwatch`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `color` (obrigatória) | `string` | — |

#### `Hsva`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `h` (obrigatória) | `number` | — |
| `s` (obrigatória) | `number` | — |
| `v` (obrigatória) | `number` | — |
| `a` (obrigatória) | `number` | — |

### Outras exportações

- `toHex` (função)
- `parseColor` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Abrem e fecham o painel pela amostra e aplicam a cor salva em foco; no campo de texto, `Enter` aplica o valor digitado. |
| `←` ou `→` ou `↑` ou `↓` | Movem o controle em foco em 1: saturação e brilho na área, matiz e opacidade nas barras; entre as cores salvas, `←` e `→` trocam o foco. |
| `Shift + ←` ou `Shift + →` ou `Shift + ↑` ou `Shift + ↓` ou `Page Up` ou `Page Down` | Dão passos de 10 em vez de 1 nos controles de cor. |
| `Home` ou `End` | Nas barras de matiz e opacidade, vão ao mínimo ou ao máximo; nas cores salvas, à primeira ou à última. |
| `Alt + ←` ou `Alt + →` | Mudam de posição a cor salva em foco; `Delete` ou `Backspace` a removem. |
| `Esc` | Fecha o painel e devolve o foco à amostra; com um valor em edição no campo de texto, primeiro descarta o que foi digitado. |

## Acessibilidade

- A amostra é um botão com `aria-haspopup="dialog"` e `aria-expanded`; o painel é um `role="dialog"` não modal, sem prisão de foco, e não fecha se o foco sair dele com `Tab`.
- Ao abrir, o foco vai para o controle de saturação e brilho; `Esc` e o botão de concluir devolvem o foco à amostra.
- Os controles são `role="slider"` com `aria-valuetext` e o contraste tem uma versão em texto para leitor de tela, mas os rótulos internos (`Hue`, `Opacity`, `Done`…) são fixos em inglês.

## Movimento

- A amostra cresce até virar o painel por um recorte animado com mola, e o conteúdo aparece logo atrás da borda que avança.
- Os controles seguem o ponteiro com uma mola curta, o botão de formato transforma o texto de um formato no outro e um valor inválido faz o campo tremer.
- Com “reduzir movimento” ligado, o painel só esmaece, os controles saltam para a posição e o texto troca de formato sem transição.

## Comportamento responsivo

- O painel tem `min(19rem, 100vw - 32px)` de largura e abre sobre a amostra, crescendo para baixo e para a direita: reserve esse espaço no layout.

## Desempenho

- O painel só fica montado enquanto está aberto ou fechando, e o conta-gotas só aparece onde o navegador oferece a API `EyeDropper`.

## Notas para IA

- `value` aceita hex, `rgb()`, `hsl()` ou `oklch()`, mas `onValueChange` devolve sempre hex em maiúsculas, com dois dígitos de alfa quando a cor não é opaca.
- Cor e amostras funcionam controladas ou não: `value` ou `defaultValue`, e `swatches` ou `defaultSwatches` com `onSwatchesChange`; ao salvar além de `maxSwatches` (padrão 7), a última da lista sai.
- Depende de `text-morph`, e o arquivo também exporta `parseColor` e `toHex` para converter cores fora do componente.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/color-picker · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
