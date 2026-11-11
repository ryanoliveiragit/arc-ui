# Expanding button group

> Grupo de botões de ícone em que o apontado cresce para mostrar o rótulo e os vizinhos abrem espaço.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/expanding-button-group
- Descrição original (inglês): Icon buttons in a compact group: the one you point at or focus grows to reveal its label while its neighbours slide aside, and an action confirms in place.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expanding-button-group.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expanding-button-group.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expanding-button-group.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expanding-button-group.json`. Caminho do registro, relativo ao endereço do site: `r/expanding-button-group.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/expanding-button-group/expanding-button-group.tsx`
  - `components/ryan-ui/expanding-button-group/expanding-button-group.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/expanding-button-group.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Ações de uma mensagem ou de um item de lista em que só uma precisa de nome visível por vez: Responder, Arquivar, Sinalizar, Excluir.
- Ações rápidas que se confirmam no próprio botão com uma palavra no passado, como Arquivar virando Arquivado, sem toast.

## Quando não usar

- Use [`floating-button-group`](floating-button-group.md) ou [`button-group`](button-group.md) quando todos os rótulos devem ficar visíveis ao mesmo tempo.
- Use [`confirm-morph`](confirm-morph.md) ou [`hold-to-confirm`](hold-to-confirm.md) para exclusões que pedem confirmação: aqui `tone="danger"` só muda a cor, e a ação roda no clique.
- Evite em telas só de toque para ações urgentes: sem hover, o primeiro toque só revela o rótulo e é preciso um segundo para executar.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Archive, Flag, Reply, Trash2 } from "lucide-react";
import ExpandingButtonGroup from "@/components/ryan-ui/expanding-button-group/expanding-button-group";
import { Caption, Stack } from "./_kit";

export default function ExpandingButtonGroupDemo() {
  const [last, setLast] = useState("None yet");
  return (
    <Stack gap={6} align="center">
      <ExpandingButtonGroup
        label="Message actions"
        onAction={id => setLast(id)}
        items={[
          { id: "reply", label: "Reply", icon: <Reply size={16} aria-hidden="true" /> },
          { id: "archive", label: "Archive", doneLabel: "Archived", icon: <Archive size={16} aria-hidden="true" /> },
          { id: "flag", label: "Flag", doneLabel: "Flagged", icon: <Flag size={16} aria-hidden="true" /> },
          { id: "delete", label: "Delete", doneLabel: "Deleted", tone: "danger", icon: <Trash2 size={16} aria-hidden="true" /> },
        ]}
      />
      <ExpandingButtonGroup
        size="sm"
        label="Compact message actions"
        defaultExpanded="archive"
        items={[
          { id: "reply", label: "Reply", icon: <Reply size={14} aria-hidden="true" /> },
          { id: "archive", label: "Archive", doneLabel: "Archived", icon: <Archive size={14} aria-hidden="true" /> },
          { id: "flag", label: "Flag", doneLabel: "Flagged", icon: <Flag size={14} aria-hidden="true" /> },
        ]}
      />
      <Caption>Last action: {last}. Hover a button to expand it; press to confirm in place.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ExpandingButtonGroup`

A compact pill of icon buttons for actions. One action always shows its label; the one you point at or focus takes over the label while its neighbours slide aside, and an action can confirm in place: the icon draws a check and the label becomes a past tense word. On touch, the first tap reveals the label and a second tap runs the action.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` (obrigatória) | `readonly ExpandingButtonGroupItem[]` | — | — |
| `label` (obrigatória) | `string` | — | Accessible name of the toolbar, such as "Message actions". |
| `size` | `"sm" \| "md"` | `"md"` | — |
| `defaultExpanded` | `string \| null` | `null` | Id of the action whose label shows at rest, usually the primary one. Defaults to the first enabled action: one action is always expanded. Pointing at or focusing another moves the expansion there, and it returns here when the pointer and focus leave. |
| `onAction` | `(id: string) => void` | — | Called with the item id whenever an action runs, before its own onSelect. |
| `confirmDuration` | `number` | `1400` | How long the confirmation stays, in milliseconds. |
| `className` | `string` | — | — |
| `style` | `CSSProperties` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ExpandingButtonGroupSize` | `"sm" \| "md"` |
| `ExpandingButtonGroupTone` | `"neutral" \| "danger"` |

#### `ExpandingButtonGroupItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable key for the action. Also the value passed to onAction. |
| `label` (obrigatória) | `string` | Visible label once the button expands, and its accessible name at all times. Use a short verb, such as "Archive". |
| `icon` (obrigatória) | `ReactNode` | Icon shown while collapsed. A 16px lucide icon fits; it is sized by the group. |
| `onSelect` | `() => void \| boolean \| Promise<void \| boolean>` | Runs the action. Return false, or reject, to skip the confirmation. A promise keeps the button busy until it settles. |
| `doneLabel` | `string` | Past tense word shown in place after the action, such as "Archived". The icon becomes a check for confirmDuration. Omit for actions that open something. |
| `tone` | `"neutral" \| "danger"` | "danger" colors the expanded state with the danger token, for destructive actions such as Delete. |
| `disabled` | `boolean` | Dimmed and inert. Stays focusable and still reveals its label, so people can learn what it would do. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Entra e sai do grupo numa parada só; o foco volta à última ação focada. |
| `→` ou `←` | Movem o foco entre as ações e dão a volta nas pontas; a ação em foco se expande e mostra o rótulo. |
| `Home` ou `End` | Vão para a primeira e a última ação. |
| `Enter` ou `Espaço` | Executam a ação em foco; com `doneLabel`, ela confirma no lugar. |

## Acessibilidade

- O grupo é `role="toolbar"` com o `label` obrigatório e tabindex móvel; cada botão tem `aria-label` igual ao `label` do item, mesmo recolhido.
- Itens `disabled` usam `aria-disabled`, continuam focáveis e mostram o rótulo, para a pessoa descobrir o que fariam; enquanto a Promise de `onSelect` roda, o botão recebe `aria-busy`.
- A confirmação (`doneLabel`) é anunciada por um `role="status"`, inclusive quando a mesma ação se repete.

## Movimento

- A ação sob o mouse ou em foco abre a largura numa mola sem ultrapassagem e o rótulo desliza de trás do ícone; as vizinhas se recolhem, e o grupo inteiro acompanha a largura.
- Ao confirmar, o ícone vira um visto que se desenha e a palavra troca para `doneLabel` sem mudar a largura, que já reserva a maior das duas; com uma Promise pendente, o ícone pulsa.
- Com “reduzir movimento”, a largura muda de uma vez, o rótulo só esmaece, o ícone não encolhe na pressão e o pulso de espera vira uma opacidade fixa.

## Notas para IA

- Cada item precisa de `id`, `label` curto (um verbo) e `icon`; `onSelect` pode devolver uma Promise, e devolver `false` ou rejeitar pula a confirmação.
- `doneLabel` (“Arquivado”) liga a confirmação no lugar por `confirmDuration` ms (1400); omita-o em ações que abrem algo, como Responder.
- Uma ação está sempre expandida: `defaultExpanded` escolhe qual (por padrão, a primeira habilitada), e `onAction(id)` roda antes do `onSelect` do item.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/expanding-button-group · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
