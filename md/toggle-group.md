# Toggle group

> Uma fileira de botões de alternância, única ou múltipla, como numa barra de formatação.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/toggle-group
- Descrição original (inglês): A row of icon or text toggles, single or multiple: one pressed fill glides between options, or each fades in on its own and neighbours join, as in a formatting toolbar.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toggle-group.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toggle-group.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toggle-group.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toggle-group.json`. Caminho do registro, relativo ao endereço do site: `r/toggle-group.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/toggle-group/toggle-group.tsx`
  - `components/ryan-ui/toggle-group/toggle-group.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/toggle-group.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Barras de formatação em que negrito, itálico e sublinhado ficam ligados ao mesmo tempo (`type="multiple"`).
- Alinhamento, ferramenta ativa ou modo de exibição, em que só um vale por vez (modo `single`, o padrão).
- Grupos compactos de ícones dentro de editores e painéis, com `size="sm"`.

## Quando não usar

- Use [`segmented-control`](segmented-control.md) para alternar entre visões de uma tela, com rótulos de texto e um destaque mais forte.
- Use [`button-group`](button-group.md) quando os botões disparam ações em vez de guardar um estado ligado ou desligado.
- Use [`chip-group`](chip-group.md) para filtros de uma lista, com muitos itens que quebram linha.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";
import ToggleGroup, { ToggleGroupItem } from "@/components/ryan-ui/toggle-group/toggle-group";
import { Caption, Row, Stack } from "./_kit";

export default function ToggleGroupDemo() {
  const [style, setStyle] = useState<string[]>(["bold"]);
  const [align, setAlign] = useState("left");
  return (
    <Stack gap={5} align="center">
      <Row justify="center">
        <ToggleGroup type="multiple" label="Text style" value={style} onValueChange={setStyle}>
          <ToggleGroupItem value="bold" label="Bold"><Bold size={16} aria-hidden="true" /></ToggleGroupItem>
          <ToggleGroupItem value="italic" label="Italic"><Italic size={16} aria-hidden="true" /></ToggleGroupItem>
          <ToggleGroupItem value="underline" label="Underline"><Underline size={16} aria-hidden="true" /></ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup label="Alignment" value={align} onValueChange={setAlign}>
          <ToggleGroupItem value="left" label="Align left"><AlignLeft size={16} aria-hidden="true" /></ToggleGroupItem>
          <ToggleGroupItem value="center" label="Align center"><AlignCenter size={16} aria-hidden="true" /></ToggleGroupItem>
          <ToggleGroupItem value="right" label="Align right"><AlignRight size={16} aria-hidden="true" /></ToggleGroupItem>
        </ToggleGroup>
      </Row>
      <Caption>Style: {style.join(", ") || "none"}. Alignment: {align}. Adjacent pressed items join.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ToggleGroup`

A row of toggle buttons. In single mode one pressed fill glides from option to option; in multiple mode each fill fades in on its own and neighbours that are both on join into one shape. Arrow keys move focus, Space and Enter toggle.

Props: `ToggleGroupSingleProps | ToggleGroupMultipleProps`

### `ToggleGroupItem`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` (obrigatória) | `string` | — | — |
| `label` | `string` | — | Accessible name, required when the item shows only an icon. Also used as the tooltip title unless title is set. |
| `children` (obrigatória) | `ReactNode` | — | — |
| `...props` | `ButtonHTMLAttributes<HTMLButtonElement>` | — | Também aceita as props deste tipo, menos `value` e `type`. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ToggleGroupSize` | `"sm" \| "md"` |

#### `ToggleGroupSingleProps`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `type` | `"single"` | One option at most is pressed. Choosing another moves the pressed state across; the pressed option stays pressed. |
| `value` | `string \| null` | — |
| `defaultValue` | `string \| null` | — |
| `onValueChange` | `(value: string) => void` | — |
| `...props` | `ToggleGroupBase` | Também aceita as props deste tipo. |

#### `ToggleGroupMultipleProps`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `type` (obrigatória) | `"multiple"` | Each option toggles on its own. |
| `value` | `readonly string[]` | — |
| `defaultValue` | `readonly string[]` | — |
| `onValueChange` | `(value: string[]) => void` | — |
| `...props` | `ToggleGroupBase` | Também aceita as props deste tipo. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `↓` | Levam o foco ao próximo item, em ciclo, sem mudar o que está pressionado. |
| `←` ou `↑` | Levam o foco ao item anterior. |
| `Home` ou `End` | Vão ao primeiro ou ao último item habilitado. |
| `Espaço` ou `Enter` | Pressionam o item em foco: no `multiple` alternam, e no `single` escolhem, sem desmarcar o que já está escolhido. |
| `Tab` | Entra no grupo pelo último item focado, ou pelo pressionado, e sai numa tecla só. |

## Acessibilidade

- No modo `single` o grupo é um `radiogroup` com itens `role="radio"` e `aria-checked`; no `multiple`, é um `group` de botões com `aria-pressed`.
- O `label` do grupo é obrigatório e vira `aria-label`; em itens só com ícone, passe `label` no item, que também vira a dica (`title`).

## Movimento

- No `single`, um único preenchimento desliza até a opção escolhida numa mola sem ultrapassagem.
- No `multiple`, cada preenchimento aparece no lugar e vizinhos ligados se juntam numa forma só por cima do espaço entre eles; o ícone afunda um pouco ao apertar.
- Com “reduzir movimento” ligado, o preenchimento muda de lugar na hora e só cor e opacidade trocam, sem escala.

## Notas para IA

- Importe `ToggleGroup` (export padrão) e `ToggleGroupItem` de `@/components/ryan-ui/toggle-group/toggle-group`; `type="multiple"` muda o valor para `string[]`, e sem `type` ele é uma `string`.
- No `single` não dá para desmarcar clicando de novo; se “nenhum” for uma opção válida, use `multiple` ou um item próprio para ela.
- As setas só movem o foco, mesmo no `single`, ao contrário de um rádio nativo; a escolha acontece com Espaço, Enter ou clique.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/toggle-group · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
