# Signature pad

> Quadro de assinatura com traço suave que afina com a velocidade, desfazer, replay e exportação em PNG ou SVG.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/signature-pad
- Descrição original (inglês): Smooth ink that thins with speed, with undo, replay, and PNG or SVG export.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/signature-pad.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/signature-pad.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/signature-pad.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/signature-pad.json`. Caminho do registro, relativo ao endereço do site: `r/signature-pad.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/signature-pad/signature-pad.tsx`
  - `components/ryan-ui/signature-pad/signature-pad.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/signature-pad.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Aceite de contrato, termo ou entrega em que a pessoa assina com o dedo, uma caneta ou o mouse.
- Fluxos que guardam a assinatura como PNG ou SVG recortados na tinta.
- Tablets e celulares em balcão, recepção ou entrega.

## Quando não usar

- Quando basta confirmar, use [`checkbox`](checkbox.md) de aceite ou [`hold-to-confirm`](hold-to-confirm.md); desenhar é lento e não tem alternativa por teclado.
- Assinatura com validade jurídica forte pede certificado e verificação de identidade, e o quadro só captura um desenho.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import SignaturePad, { type InkStroke } from "@/components/ryan-ui/signature-pad/signature-pad";
import { Caption, Stack } from "./_kit";

export default function SignaturePadDemo() {
  const [strokes, setStrokes] = useState<InkStroke[]>([]);
  return (
    <Stack width={520} gap={3}>
      <SignaturePad signer="Maria Alvarez" hint="Sign here to accept the lease" fileName="lease-signature" onChange={setStrokes} />
      <Caption>{strokes.length ? `${strokes.length} stroke${strokes.length > 1 ? "s" : ""} captured. Undo, replay or export it.` : "Draw with a mouse, finger or pen."}</Caption>
    </Stack>
  );
}
export const stage = { height: 520 };
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SignaturePad`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `signer` | `string` | — | Printed under the baseline, such as the signer's name. |
| `hint` | `string` | `"Sign here"` | Resting hint on the baseline before the first stroke. |
| `defaultColor` | `"black" \| "blue" \| "violet"` | `"black"` | — |
| `defaultWidth` | `"fine" \| "medium" \| "bold"` | `"medium"` | — |
| `onChange` | `(strokes: InkStroke[]) => void` | — | Receives the strokes after every change. |
| `fileName` | `string` | `"signature"` | File name for exports, without extension. |
| `label` | `string` | `"Signature pad"` | Accessible name of the drawing surface. |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `InkColor` | `"black" \| "blue" \| "violet"` |
| `InkWidth` | `"fine" \| "medium" \| "bold"` |

#### `InkPoint`

A sampled point: position in pad units, pen pressure between 0 and 1 (or -1 when the device has none), and ms since the stroke began.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `x` (obrigatória) | `number` | — |
| `y` (obrigatória) | `number` | — |
| `p` (obrigatória) | `number` | — |
| `t` (obrigatória) | `number` | — |

#### `InkStroke`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `points` (obrigatória) | `InkPoint[]` | — |
| `color` (obrigatória) | `"black" \| "blue" \| "violet"` | — |
| `width` (obrigatória) | `"fine" \| "medium" \| "bold"` | — |
| `at` (obrigatória) | `number` | When the stroke began, in ms. Replay keeps the real rhythm between strokes. |

#### `OutlineOptions`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `size` (obrigatória) | `number` | Diameter of the stroke at half pressure, in pad units. |
| `thinning` | `number` | How much pressure changes the width, from 0 to 1. |
| `streamline` | `number` | How far each point trails the pointer, from 0 to 1. Higher is smoother but lags more. |
| `simulatePressure` | `boolean` | Derive pressure from speed when the device reports none: fast is thin, slow is full. |
| `taperStart` | `number` | Length over which the start and the end taper, in pad units. |
| `taperEnd` | `number` | — |
| `last` | `boolean` | False while the stroke is still being drawn, so the end does not taper yet. |

### Outras exportações

- `PAD_WIDTH` (valor)
- `PAD_HEIGHT` (valor)
- `getStrokeOutline` (função)
- `outlineToPath` (função)
- `strokePath` (função)
- `signatureToSvg` (função)
- `signatureToPng` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Ctrl + Z` | Com o quadro em foco, desfaz o último traço (⌘ no Mac). |
| `Ctrl + Shift + Z` ou `Ctrl + Y` | Com o quadro em foco, refazem. |
| `Delete` ou `Backspace` | Com o próprio quadro em foco, limpam a assinatura, que desfazer traz de volta. |
| `Esc` | Com o quadro em foco, para a reprodução. |
| `←` ou `→` ou `↑` ou `↓` | Nos grupos de cor e de espessura, trocam a opção e levam o foco junto, em ciclo. |

## Acessibilidade

- O quadro é focável, com `role="img"` e `aria-roledescription="signature pad"`; o nome diz quantos traços há, e uma descrição oculta ensina os atalhos.
- Uma região `role="status"` anuncia traço adicionado, desfazer, limpeza, reprodução e exportação, e os botões só de ícone têm `aria-label` e `title`.
- Desenhar não tem alternativa por teclado: em fluxos com valor legal, ofereça também outro meio de assinar, como digitar o nome.

## Movimento

- O traço afina com a velocidade, ou segue a pressão da caneta, e as pontas afinam como um bico que se levanta; limpar passa um rodo pelo quadro, cortando a tinta da esquerda para a direita.
- A reprodução redesenha os traços no ritmo original, com pausas limitadas e assinaturas longas aceleradas para uns três segundos, e um ponto de tinta acompanha a ponta.
- Com “reduzir movimento” ligado, limpar é imediato e a dica “Sign here” e os botões só esmaecem.

## Comportamento responsivo

- O quadro mantém a proporção 600 × 260 e os traços escalam com a largura; a barra de ferramentas quebra em linhas quando falta espaço.
- No toque, o quadro bloqueia a rolagem (`touch-action: none`) para o dedo desenhar, então deixe área fora dele para a página rolar.

## Desempenho

- O traço ao vivo é escrito direto no SVG a cada movimento, sem re-render do React, e usa os eventos agrupados do ponteiro para uma linha lisa.

## Notas para IA

- Não há `value` e o quadro sempre começa vazio: guarde os traços de `onChange` e gere o arquivo com `signatureToPng(traços)` ou `signatureToSvg(traços)` para enviar ao servidor, em vez do download.
- As exportações são recortadas na tinta, com fundo transparente e cores de impressão fixas, então saem legíveis em papel branco mesmo no tema escuro.
- `signer` imprime o nome sob a linha, `hint` troca o “Sign here” e `label` dá o nome acessível; os demais textos internos são em inglês.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/signature-pad · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
