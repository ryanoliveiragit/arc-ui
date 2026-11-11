# Floating button group

> Botões soltos numa bandeja discreta, com um realce único que passa de um para o outro.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/floating-button-group
- Descrição original (inglês): Separate soft buttons in a quiet tray, with one shared highlight that morphs from button to button as you move, and a pressed state that settles in place.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/floating-button-group.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/floating-button-group.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/floating-button-group.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/floating-button-group.json`. Caminho do registro, relativo ao endereço do site: `r/floating-button-group.json`.

- Pacotes npm: `@radix-ui/react-tooltip`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Tooltip](tooltip.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/floating-button-group/floating-button-group.tsx`
  - `components/ryan-ui/floating-button-group/floating-button-group.module.css`
  - `components/ryan-ui/tooltip/tooltip.tsx`
  - `components/ryan-ui/tooltip/tooltip.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-tooltip motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/floating-button-group.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Barras de ações sobre um quadro ou documento, como Desfazer, Refazer, Apresentar e Compartilhar, com dicas de atalho no tooltip.
- Barras flutuantes sobre uma seleção ou sobre o conteúdo (`variant="floating"`), só com ícones e o nome em tooltip.

## Quando não usar

- Use [`button-group`](button-group.md) quando as ações devem formar uma superfície única com divisórias ou precisam de um menu anexo.
- Use [`toggle-group`](toggle-group.md) quando os botões são opções que ligam e desligam em conjunto, como negrito e itálico.
- Use [`overflow-actions`](overflow-actions.md) quando a barra precisa caber em larguras variáveis: esta bandeja não recolhe nem quebra linha.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Copy, Presentation, Redo2, Share2, Trash2, Undo2 } from "lucide-react";
import FloatingButtonGroup from "@/components/ryan-ui/floating-button-group/floating-button-group";
import { Caption, Stack } from "./_kit";

export default function FloatingButtonGroupDemo() {
  const [present, setPresent] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share");
  const [last, setLast] = useState("None yet");
  return (
    <Stack gap={6} align="center">
      <FloatingButtonGroup
        label="Board actions"
        onAction={id => setLast(id)}
        items={[
          { id: "undo", label: "Undo", icon: <Undo2 size={15} aria-hidden="true" />, shortcut: "⌘Z" },
          { id: "redo", label: "Redo", icon: <Redo2 size={15} aria-hidden="true" />, shortcut: "⇧⌘Z" },
          { type: "separator" },
          { id: "present", label: "Present", icon: <Presentation size={15} aria-hidden="true" />, pressed: present, onSelect: () => setPresent(value => !value) },
          { id: "share", label: shareLabel, reserveLabels: ["Share", "Copied"], icon: <Share2 size={15} aria-hidden="true" />, onSelect: () => { setShareLabel("Copied"); window.setTimeout(() => setShareLabel("Share"), 1500); } },
        ]}
      />
      <FloatingButtonGroup
        label="Selection actions"
        variant="floating"
        iconOnly
        onAction={id => setLast(id)}
        items={[
          { id: "duplicate", label: "Duplicate", icon: <Copy size={15} aria-hidden="true" /> },
          { id: "share-selection", label: "Share", icon: <Share2 size={15} aria-hidden="true" /> },
          { id: "delete", label: "Delete", icon: <Trash2 size={15} aria-hidden="true" /> },
        ]}
      />
      <Caption>Present mode: {present ? "on" : "off"} · last action: {last}. Move across the tray to follow the highlight.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `FloatingButtonGroup`

Separate soft buttons in a quiet tray. One shared highlight morphs, in position and size, to whichever button the pointer or keyboard focus is on, fades when the pointer leaves the tray, and settles darker in place while a button is pressed. It is the toolbar's only hover and focus indicator. Arrow keys move focus, Home and End jump to the ends, Enter and Space act.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` (obrigatória) | `readonly FloatingButtonGroupItem[]` | — | — |
| `label` (obrigatória) | `string` | — | Accessible name of the toolbar, such as "Board actions". |
| `variant` | `"muted" \| "floating"` | `"muted"` | muted sits quietly on a page; floating raises the tray with the floating shadow for overlays such as a selection toolbar. |
| `size` | `"sm" \| "md"` | `"md"` | — |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | — |
| `iconOnly` | `boolean` | `false` | Shows every item as an icon only, with its label in a tooltip. Items with their own iconOnly win. |
| `tooltipSide` | `"top" \| "bottom" \| "left" \| "right"` | — | Side of the item tooltips. Defaults to top for a row and right for a column. |
| `onAction` | `(id: string) => void` | — | Called with the item id after the item's own onSelect. |
| `className` | `string` | — | — |
| `style` | `CSSProperties` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `FloatingButtonGroupVariant` | `"muted" \| "floating"` |
| `FloatingButtonGroupSize` | `"sm" \| "md"` |
| `FloatingButtonGroupOrientation` | `"horizontal" \| "vertical"` |
| `FloatingButtonGroupItem` | `FloatingButtonGroupAction \| FloatingButtonGroupSeparator` |

#### `FloatingButtonGroupAction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `type` | `"action"` | — |
| `id` (obrigatória) | `string` | Stable key, also passed to onAction. |
| `label` (obrigatória) | `string` | Visible label, and the accessible name when the item shows only its icon. |
| `icon` | `ReactNode` | — |
| `iconOnly` | `boolean` | Shows only the icon. The label moves into a tooltip and the accessible name. Overrides the group's iconOnly. |
| `onSelect` | `() => void` | — |
| `disabled` | `boolean` | — |
| `pressed` | `boolean` | Marks an action that switches a mode on, such as Present. Sets aria-pressed and keeps a quiet tint while on. |
| `shortcut` | `string` | A shortcut hint shown in the tooltip, such as "⌘Z". The component does not bind the key. |
| `reserveLabels` | `readonly string[]` | Other labels this item can switch to, such as ["Copied"] for Share. The button keeps the width of the widest, so a label change never moves anything. |

#### `FloatingButtonGroupSeparator`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `type` (obrigatória) | `"separator"` | — |
| `id` | `string` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Entra e sai da barra numa parada só; o foco volta à última ação focada. |
| `→` ou `←` | Movem o foco entre as ações habilitadas e dão a volta nas pontas; na orientação `vertical`, use `↓` e `↑`. |
| `Home` ou `End` | Vão para a primeira e a última ação habilitada. |
| `Enter` ou `Espaço` | Executam a ação em foco; o realce escurece enquanto a tecla está pressionada. |
| `Esc` | Fecha o tooltip aberto (comportamento do Radix). |

## Acessibilidade

- A bandeja é `role="toolbar"` com `aria-orientation` e tabindex móvel; cada botão tem `aria-label` igual ao `label`, e `pressed` vira `aria-pressed` para ações de modo, como Apresentar.
- Itens só com ícone ou com `shortcut` ganham um tooltip com o nome e o atalho, ao passar o mouse ou focar pelo teclado; `shortcut` é só uma dica, o componente não registra a tecla.
- Itens `disabled` recebem `aria-disabled` e são pulados pelas setas, por `Home` e por `End`.

## Movimento

- Um único realce se move e muda de tamanho até o botão sob o ponteiro ou em foco, numa mola sem ultrapassagem; vindo do nada, ele surge no lugar crescendo de 0,94, e esmaece quando o ponteiro sai.
- Na pressão, o realce escurece e encolhe para 0,965 no lugar; um rótulo novo, como Compartilhar → Copiado, sobe de um leve desfoque sem mudar a largura se estiver em `reserveLabels`.
- Com “reduzir movimento”, o realce salta para o botão sem escala e as cores mudam quase na hora.

## Comportamento responsivo

- A bandeja mantém sempre o tamanho natural: não quebra linha nem corta botões, então numa tela estreita ela transborda; use `iconOnly` ou menos itens.
- Na orientação `vertical`, os tooltips abrem à direita por padrão (`tooltipSide`), para não cobrir o botão vizinho.

## Notas para IA

- Depende de `tooltip`, instalado junto; cada ação precisa de `id` e `label`, e um item `{ type: "separator" }` desenha uma divisória.
- Para ações de modo, passe `pressed` controlado pelo pai e alterne no `onSelect`; `onAction(id)` roda depois do `onSelect` do item, bom para registrar uso.
- Se um rótulo muda depois do clique, liste todos os textos em `reserveLabels`; `iconOnly` no grupo vale para todos os itens, e o `iconOnly` de cada item tem prioridade.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/floating-button-group · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
