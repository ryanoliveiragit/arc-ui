# Arc picker

> Seletor radial: as opções ficam em um arco, giram com a rolagem, o arraste ou as setas, e uma moldura abraça a opção ativa.

- Tipo: componente (categoria Entradas), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/arc-picker
- Descrição original (inglês): A radial text picker: options sit on an arc, the wheel, a drag or the arrow keys turn the dial, and one bracket frame resizes around the active label.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/arc-picker.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/arc-picker.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/arc-picker.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/arc-picker.json`. Caminho do registro, relativo ao endereço do site: `r/arc-picker.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/arc-picker/arc-picker.tsx`
  - `components/ryan-ui/arc-picker/arc-picker.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/arc-picker.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Escolha única entre opções de texto em que o gesto de girar faz parte da experiência: lente da câmera, modo, período.
- Telas de toque ou com roda do mouse, em que arrastar ao longo do arco ou rolar é mais direto que abrir um menu.
- Conjuntos ordenados em que basta ver a opção atual e as vizinhas: os rótulos esmaecem com a distância e somem a pouco mais de três posições do ápice.

## Quando não usar

- Use [`segmented-control`](segmented-control.md) quando são poucas opções e todas precisam ficar visíveis ao mesmo tempo.
- Use [`wheel-picker`](wheel-picker.md) para rolos verticais de hora ou data, com várias colunas.
- Use [`select`](select.md) em formulários densos: o arco horizontal ocupa por padrão 30rem por 8rem.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { ArcPicker } from "@/components/ryan-ui/arc-picker/arc-picker";
import type { ArcOption, ArcPickerProps } from "@/components/ryan-ui/arc-picker/arc-picker";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack } from "./_kit";

type Side = NonNullable<ArcPickerProps["side"]>;

const lenses: (ArcOption & { spec: string })[] = [
  { value: "13", label: "Ultra wide", spec: "13 mm, f/2.4" },
  { value: "24", label: "Wide", spec: "24 mm, f/1.8" },
  { value: "35", label: "Street", spec: "35 mm, f/1.8" },
  { value: "50", label: "Portrait", spec: "50 mm, f/1.4" },
  { value: "85", label: "Telephoto", spec: "85 mm, f/2.8" },
  { value: "macro", label: "Macro", spec: "100 mm macro, f/2.8" },
  { value: "200", label: "Wildlife", spec: "200 mm, f/4" },
];

const sides: { value: Side; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

export default function ArcPickerDemo() {
  const [lens, setLens] = useState("35");
  const [side, setSide] = useState<Side>("top");
  const chosen = lenses.find(option => option.value === lens);

  return (
    <Stack gap={4} align="center" width={480}>
      {/* A fixed slot, so the controls below hold still while the arc changes side. */}
      <div style={{ display: "flex", width: "100%", height: 280, alignItems: "center", justifyContent: "center" }}>
        <ArcPicker label="Lens" side={side} options={lenses} value={lens} onValueChange={setLens} />
      </div>
      <SegmentedControl label="Arc side" options={sides} value={side} onValueChange={next => setSide(next as Side)} />
      <Caption>{chosen?.label}: {chosen?.spec}. Scroll, drag along the arc, click a label or use the arrow keys.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ArcPicker`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `options` (obrigatória) | `ArcOption[]` | — | The options in order along the arc. |
| `value` | `string` | — | The chosen value (controlled). |
| `defaultValue` | `string` | — | The value chosen at first (uncontrolled). Defaults to the first enabled option. |
| `onValueChange` | `(value: string) => void` | — | Runs when the dial settles on a new option. |
| `label` (obrigatória) | `string` | — | Accessible name, for example "Billing period". |
| `side` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Which part of the dial shows: `top` arches up, `bottom` hangs down, `left` and `right` bow sideways with the labels stacked. |
| `radius` | `number` | — | Radius of the dial in px. Larger is flatter. Defaults to 320 for the top and bottom arcs and 240 for the side arcs. |
| `gap` | `number` | — | Distance between the centers of neighboring options along the arc, in px. By default each pair is spaced by its own label widths. |
| `ticks` | `boolean` | `true` | Draws the tick marks that turn with the dial and the pointer at the apex. |
| `disabled` | `boolean` | `false` | Turns the control off: it is dimmed and ignores pointer and keyboard input. |
| `className` | `string` | — | Extra class names for the root element. |
| `style` | `CSSProperties` | — | Inline styles for the root element, for sizes and CSS variables. |

### Tipos exportados

#### `ArcOption`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | The value reported when this option is chosen. |
| `label` | `string` | The text on the arc. Falls back to the value. |
| `disabled` | `boolean` | Shown dimmed; the dial never comes to rest on it. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `↓` | Gira até a próxima opção habilitada. |
| `←` ou `↑` | Gira até a opção habilitada anterior. |
| `Home` ou `End` | Vai para a primeira ou para a última opção habilitada. |

## Acessibilidade

- A raiz é um `role="listbox"` focável com `aria-activedescendant` apontando para a opção escolhida; cada rótulo é um `role="option"` com `aria-selected`.
- `label` é obrigatório e vira o `aria-label`; `aria-orientation` passa a `vertical` nos arcos `left` e `right`.
- Opções com `disabled` aparecem riscadas, recebem `aria-disabled` e o disco nunca para nelas, seja por tecla, roda, clique ou arrasto.

## Movimento

- O disco gira até a opção com uma mola suave e, ao soltar um arrasto, herda a velocidade do gesto antes de assentar na opção habilitada mais próxima.
- Os colchetes do ápice se ajustam com uma mola à largura do rótulo mais próximo, e os rótulos encolhem e esmaecem conforme se afastam.
- Além das pontas o arrasto oferece resistência elástica; com “reduzir movimento” ligado, disco e colchetes saltam direto para a posição final.

## Comportamento responsivo

- O arco `top` ou `bottom` mede 30rem por 8rem (variáveis `--span` e `--depth`, ajustáveis por `style`) e respeita `max-width: 100%`; as pontas somem por uma máscara.
- No toque, o arco horizontal deixa a página rolar na vertical (`touch-action: pan-y`) e os arcos laterais, na horizontal.

## Desempenho

- As larguras dos rótulos são medidas no layout e de novo quando as fontes carregam, e cada opção acompanha a posição do disco a cada quadro: mantenha a lista curta.

## Notas para IA

- `options` é `{ value, label?, disabled? }[]` com `value` único e `label` do componente é obrigatório; use `value` + `onValueChange` ou `defaultValue` (sem ele, vale a primeira opção habilitada).
- `side` escolhe a face do disco (`top`, `bottom`, `left`, `right`), `radius` maior deixa o arco mais plano e `gap` fixa a distância entre opções, que por padrão segue a largura de cada rótulo.
- Sobre o componente, a roda do mouse gira o disco em vez de rolar a página (só nas pontas a rolagem volta): não o ponha no caminho de uma rolagem longa.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/arc-picker · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
