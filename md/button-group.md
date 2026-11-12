# Button group

> Ações relacionadas numa só superfície, com realce que desliza entre os segmentos e menu acoplado.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/button-group
- Descrição original (inglês): Related actions joined into one surface with hairline dividers: a hover highlight glides between segments, the pressed one answers in place, and an attached menu can close the row.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/button-group.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/button-group.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/button-group.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/button-group.json`. Caminho do registro, relativo ao endereço do site: `r/button-group.json`.

- Pacotes npm: `@radix-ui/react-dropdown-menu`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/button-group/button-group.tsx`
  - `components/ryan-ui/button-group/button-group.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-dropdown-menu lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/button-group.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Ações relacionadas sobre o mesmo objeto que devem ler como um controle só: Compartilhar, Baixar, Arquivar.
- Quando as ações menos usadas cabem num menu anexo ao fim da fileira (prop `menu`).
- Barras em que os rótulos podem encolher para ícones quando falta largura (`collapseLabels`).

## Quando não usar

- Use [`toggle-group`](toggle-group.md) ou [`segmented-control`](segmented-control.md) quando os botões representam um estado ou uma escolha: aqui nenhum segmento fica marcado como pressionado.
- Use [`split-button`](split-button.md) quando existe uma ação principal e as demais são alternativas dela.
- Use [`overflow-actions`](overflow-actions.md) quando a barra deve mandar para um menu as ações que não cabem na largura.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Archive, Copy, Link2, Share2, Trash2, Download, Bold, Italic, Underline } from "lucide-react";
import ButtonGroup from "@/components/ryan-ui/button-group/button-group";
import { Caption, Field, Row, Stack, demoStage } from "./_kit";

export default function ButtonGroupDemo() {
  const [shareLabel, setShareLabel] = useState("Share");
  const [last, setLast] = useState("None yet");
  const share = () => { setShareLabel("Copied"); setLast("Link copied"); window.setTimeout(() => setShareLabel("Share"), 1600); };
  return (
    // Três usos lado a lado, cada um com o seu rótulo: assim o grupo vertical não parece um menu solto ao lado dos outros.
    <Stack gap={8} align="center" width={560}>
      <Field label="Actions with an attached menu">
      <ButtonGroup
        label="Document actions"
        container={demoStage()}
        items={[
          { id: "share", label: shareLabel, reserve: ["Share", "Copied"], icon: <Share2 size={15} aria-hidden="true" />, onSelect: share },
          { id: "download", label: "Download", icon: <Download size={15} aria-hidden="true" />, onSelect: () => setLast("Download started") },
          { id: "archive", label: "Archive", icon: <Archive size={15} aria-hidden="true" />, onSelect: () => setLast("Archived") },
        ]}
        menu={{
          label: "More actions",
          items: [
            { id: "copy", label: "Duplicate", icon: <Copy size={15} aria-hidden="true" />, onSelect: () => setLast("Duplicated") },
            { id: "link", label: "Copy link", icon: <Link2 size={15} aria-hidden="true" />, onSelect: () => setLast("Link copied") },
            { id: "delete", label: "Delete", icon: <Trash2 size={15} aria-hidden="true" />, destructive: true, onSelect: () => setLast("Deleted") },
          ],
        }}
      />
      </Field>
      <Row justify="center" align="start" gap={10}>
        <Field label="Solid, icon only">
        <ButtonGroup
          label="Text formatting"
          variant="solid"
          size="sm"
          items={[
            { id: "bold", label: "Bold", icon: <Bold size={15} aria-hidden="true" />, iconOnly: true, onSelect: () => setLast("Bold") },
            { id: "italic", label: "Italic", icon: <Italic size={15} aria-hidden="true" />, iconOnly: true, onSelect: () => setLast("Italic") },
            { id: "underline", label: "Underline", icon: <Underline size={15} aria-hidden="true" />, iconOnly: true, onSelect: () => setLast("Underline") },
          ]}
        />
        </Field>
        <Field label="Vertical">
        <ButtonGroup
          label="View mode"
          orientation="vertical"
          size="sm"
          items={[
            { id: "day", label: "Day", onSelect: () => setLast("Day view") },
            { id: "week", label: "Week", onSelect: () => setLast("Week view") },
            { id: "month", label: "Month", onSelect: () => setLast("Month view") },
          ]}
        />
        </Field>
      </Row>
      <Caption>Last action: {last}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ButtonGroup`

Related actions joined into one surface: a shared border and radius, hairline dividers, no gaps. One soft highlight glides between segments under the pointer or keyboard focus, the pressed segment answers in place, and an optional chevron segment opens more actions in a menu aligned to the group's edge.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` (obrigatória) | `ButtonGroupItem[]` | — | — |
| `menu` | `ButtonGroupMenu` | — | Adds a trailing chevron segment that opens these actions in a menu aligned to the group's edge. |
| `label` (obrigatória) | `string` | — | Accessible name of the group, such as "Document actions". |
| `variant` | `"outline" \| "solid"` | `"outline"` | — |
| `size` | `"sm" \| "md"` | `"md"` | — |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | — |
| `collapseLabels` | `boolean` | `true` | When the row does not fit its container, segments with an icon drop their label and keep the icon. Horizontal only. |
| `disabled` | `boolean` | `false` | Disables every segment and the menu. |
| `container` | `HTMLElement \| null` | — | Render the menu inside this element and limit collisions to it (used by the demo stages). |
| `className` | `string` | — | — |
| `style` | `CSSProperties` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ButtonGroupVariant` | `"outline" \| "solid"` |
| `ButtonGroupSize` | `"sm" \| "md"` |
| `ButtonGroupOrientation` | `"horizontal" \| "vertical"` |

#### `ButtonGroupItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable key for the segment. |
| `label` (obrigatória) | `string` | Visible text and the accessible name. Changing it crossfades in place, so "Share" can answer "Copied". |
| `reserve` | `string[]` | Every other label this segment can show, such as ["Copied"]. The segment sizes to the widest, so a label change never resizes it. |
| `icon` | `ReactNode` | — |
| `iconOnly` | `boolean` | Shows only the icon; the label becomes the accessible name and the tooltip. |
| `content` | `ReactNode` | Visible content in place of the label, such as a live value. The label stays the accessible name. |
| `onSelect` | `() => void` | — |
| `href` | `string` | Renders the segment as a link. |
| `disabled` | `boolean` | — |

#### `ButtonGroupMenuItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `icon` | `ReactNode` | — |
| `onSelect` | `() => void` | — |
| `href` | `string` | — |
| `disabled` | `boolean` | — |
| `destructive` | `boolean` | Colors the item as a destructive action. |

#### `ButtonGroupMenu`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | Accessible name and tooltip of the chevron segment, such as "More actions". |
| `items` (obrigatória) | `ButtonGroupMenuItem[]` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` ou `Shift + Tab` | Passam por cada segmento em ordem; todos são paradas de tabulação. |
| `→` ou `←` | Movem o foco entre os segmentos e dão a volta nas pontas; na orientação `vertical` valem `↓` e `↑`, e em RTL as setas se invertem. |
| `Home` ou `End` | Levam o foco ao primeiro e ao último segmento. |
| `Enter` ou `Espaço` | Acionam o segmento em foco (um segmento com `href` é link e responde só a `Enter`); na seta, abrem o menu. |
| `↓` | Na seta, abre o menu; dentro dele, `↓` e `↑` percorrem os itens em laço e `Enter` escolhe. |
| `Esc` | Fecha o menu e devolve o foco à seta. |

## Acessibilidade

- O contêiner é `role="group"` com o `label` obrigatório como nome; cada segmento é um `<button>` ou, com `href`, um link.
- Segmentos `iconOnly`, com `content` ou recolhidos usam o `label` como `aria-label` (e, sem texto visível, também como `title`); um item `disabled` vira `aria-disabled` e continua focável.
- Um rótulo que muda logo depois do acionamento do próprio segmento, como “Copiado”, é anunciado uma vez por uma região `aria-live="polite"`.

## Movimento

- Um único realce desliza entre os segmentos sob o ponteiro ou o foco do teclado, numa mola sem ultrapassagem, e as divisórias vizinhas somem para ele ler como uma forma só.
- A pressão encolhe só o conteúdo do segmento (0,97; 0,9 nos de ícone); um rótulo novo sobe de um leve desfoque dentro de uma caixa de largura fixa quando `reserve` lista os textos.
- Com “reduzir movimento”, o realce salta para o segmento, não há escala na pressão e o menu apenas esmaece.

## Comportamento responsivo

- Com `collapseLabels` (padrão), quando a fileira não cabe no contêiner os segmentos com ícone escondem o rótulo, que passa para `aria-label` e `title`, e o recuperam quando volta a haver espaço.
- O grupo nunca passa de 100% do contêiner: o que ainda sobra rola na horizontal sem barra visível; na orientação `vertical` os segmentos ocupam a largura toda e não recolhem.

## Desempenho

- Cada grupo usa `ResizeObserver` no contêiner pai, em si mesmo e em cada segmento, e testa a posição dos segmentos a cada movimento do ponteiro: adequado a barras, não a dezenas de grupos numa lista.

## Notas para IA

- `label` nomeia o grupo e é obrigatório; cada item precisa de `id` e `label`, e a ação vai em `onSelect` (ou `href`, para o segmento virar link).
- Se um rótulo muda (Compartilhar → Copiado), liste todos os textos em `reserve` para o segmento manter a largura do maior.
- É um grupo de ações sem estado selecionado; `menu` (`label` e `items`) acrescenta a seta com o menu, e `variant="solid"` é a versão preenchida, de mais destaque.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/button-group · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
