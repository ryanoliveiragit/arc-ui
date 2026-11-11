# Hover highlight

> Grupo em que um único fundo desliza até o item sob o cursor ou em foco, ideal para menus, navegação e barras de ferramentas.

- Tipo: componente (categoria Ações), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/hover-highlight
- Descrição original (inglês): A group in which one shared background pill glides to the hovered or focused item and returns to the selected one.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hover-highlight.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hover-highlight.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hover-highlight.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hover-highlight.json`. Caminho do registro, relativo ao endereço do site: `r/hover-highlight.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/hover-highlight/hover-highlight.tsx`
  - `components/ryan-ui/hover-highlight/hover-highlight.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/hover-highlight.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Linhas de navegação, menus e barras de ícones em que um fundo compartilhado deve seguir o ponteiro e repousar na seção atual (`value`).
- Quando você quer o efeito em itens próprios: qualquer elemento com `data-highlight-item`, em qualquer profundidade, recebe a pílula.

## Quando não usar

- Use [`tabs`](tabs.md) ou [`segmented-control`](segmented-control.md) quando o item escolhido troca o conteúdo exibido: aqui não há `role="tablist"` nem painéis.
- Use [`dropdown-menu`](dropdown-menu.md) ou [`context-menu`](context-menu.md) quando as ações devem ficar num menu flutuante, com semântica de menu.
- Use [`floating-button-group`](floating-button-group.md) para uma barra de ações pronta, com tooltips e uma única parada de `Tab`.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Archive, Bold, Code, CreditCard, Italic, Link, List, LogOut, Quote, Settings, Strikethrough, Underline, Users } from "lucide-react";
import { HoverHighlight, HoverHighlightItem } from "@/components/ryan-ui/hover-highlight/hover-highlight";
import { Caption, Stack, Surface } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const pages = ["Overview", "Clients", "Invoices", "Reports"];
const menu = [
  { label: "Team members", hint: "G T", icon: Users },
  { label: "Billing and plans", hint: "G B", icon: CreditCard },
  { label: "Archived projects", hint: "G A", icon: Archive },
  { label: "Workspace settings", hint: "G S", icon: Settings },
];
const tools = [
  { label: "Bold", icon: Bold }, { label: "Italic", icon: Italic }, { label: "Underline", icon: Underline }, { label: "Strikethrough", icon: Strikethrough },
  { label: "Link", icon: Link }, { label: "Bulleted list", icon: List }, { label: "Quote", icon: Quote }, { label: "Inline code", icon: Code },
];
const hint = { marginLeft: "auto", paddingLeft: "var(--space-4)", color: "var(--text-muted)", fontSize: "var(--text-xs)", fontWeight: 400 } as const;

export default function HoverHighlightDemo() {
  const [page, setPage] = useState("Overview");
  return (
    <Stack width={400} gap={5} align="center">
      <Stack gap={2} align="center">
        <Surface padding={1} style={{ borderRadius: "var(--radius-pill)" }}>
          <HoverHighlight orientation="horizontal" tone="accent" value={page} onValueChange={setPage} aria-label="Sections" role="group" style={{ flexWrap: "nowrap" }}>
            {pages.map(name => <HoverHighlightItem key={name} value={name}>{name}</HoverHighlightItem>)}
          </HoverHighlight>
        </Surface>
        <Caption>The pill follows the pointer and returns to {page}.</Caption>
      </Stack>

      <Surface padding={2} width={320}>
        <HoverHighlight aria-label="Workspace menu" role="group">
          {menu.map(({ label, hint: keys, icon: Icon }) => (
            <HoverHighlightItem key={label}>
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              {label}
              <span style={hint}>{keys}</span>
            </HoverHighlightItem>
          ))}
          <HoverHighlightItem disabled>
            <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
            Leave workspace
            <span style={hint}>Owner</span>
          </HoverHighlightItem>
        </HoverHighlight>
      </Surface>

      <Surface padding={1}>
        <HoverHighlight orientation="horizontal" aria-label="Text formatting" role="toolbar" style={{ flexWrap: "nowrap" }}>
          {tools.map(({ label, icon: Icon }) => (
            <HoverHighlightItem key={label} aria-label={label} style={{ width: "var(--control-height-sm)", justifyContent: "center", padding: 0 }}>
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
            </HoverHighlightItem>
          ))}
        </HoverHighlight>
      </Surface>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `HoverHighlight`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Direction the items flow in. It also decides which arrow keys move focus. |
| `tone` | `"muted" \| "accent"` | `"muted"` | Pill color: a quiet neutral wash, or the solid accent with dark text on top. |
| `value` | `string \| null` | — | Value of the item the pill rests on while nothing is hovered (controlled). Pass null for none. |
| `defaultValue` | `string \| null` | `null` | Resting item when uncontrolled. |
| `onValueChange` | `(value: string) => void` | — | Called when someone picks an item that has a `value`. |
| `arrowNavigation` | `boolean` | `true` | Arrow keys, Home and End move focus between items. |
| `className` | `string` | — | Extra class for the group element. |
| `children` (obrigatória) | `ReactNode` | — | `HoverHighlightItem`s, or any elements carrying `data-highlight-item`, at any depth. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | — | Também aceita as props deste tipo, menos `defaultValue` e `onChange`. |

### `HoverHighlightItem`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` | `string` | — | Identifies the item for `value` and `onValueChange`. Items without a value only take the hover pill. |
| `href` | `string` | — | Renders a link instead of a button. |
| `disabled` | `boolean` | `false` | Leaves the item out of hover, focus and selection. |
| `className` | `string` | — | Extra class for the item. |
| `children` (obrigatória) | `ReactNode` | — | Item content: text, icons, shortcuts. |
| `...props` | `HTMLAttributes<HTMLElement>` | — | Também aceita as props deste tipo, menos `children`. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↓` ou `↑` | Na orientação `vertical` (padrão), movem o foco entre os itens habilitados e dão a volta nas pontas; em `horizontal`, use `→` e `←`. |
| `Home` ou `End` | Vão para o primeiro e o último item habilitado; setas, `Home` e `End` são desligados com `arrowNavigation={false}`. |
| `Enter` ou `Espaço` | Acionam o item em foco, e um item com `value` passa a ser o selecionado; itens com `href` são links e respondem só a `Enter`. |

## Acessibilidade

- O grupo é um `<div>` sem papel: passe `role` e `aria-label`, como `role="toolbar"` ou `role="group"`, como faz o demo.
- Itens são `<button>` ou, com `href`, links; o selecionado recebe `aria-current="true"`, e `disabled` desabilita o botão ou tira o `href` do link e marca `aria-disabled`.
- A pílula é decorativa (`aria-hidden`), e cada item continua sendo uma parada de `Tab`, além das setas.

## Movimento

- Um único fundo em pílula desliza e muda de tamanho até o item sob o ponteiro ou com foco do teclado, numa mola sem ultrapassagem, e volta ao selecionado quando o ponteiro sai; entre dois itens ele fica no último, sem piscar.
- Enquanto um item está pressionado, a pílula encolhe para 0,97 e solta numa curva de mola.
- Com “reduzir movimento”, a pílula salta direto para o item e não encolhe na pressão.

## Comportamento responsivo

- Na orientação `horizontal`, os itens quebram linha por padrão (`flex-flow: row wrap`) e a pílula segue para a linha nova; passe `style={{ flexWrap: "nowrap" }}` para manter uma fileira só.
- Quando o tamanho do grupo muda (fonte que carrega, seção que abre, janela redimensionada), a pílula se reposiciona sem animar.

## Notas para IA

- Monte com `<HoverHighlight>` e filhos `<HoverHighlightItem>`; dê `value` aos itens e controle a seleção com `value` e `onValueChange` no grupo, ou use `defaultValue`.
- Itens sem `value` só recebem o realce de hover; `tone="accent"` usa a cor de destaque com texto escuro, e `--hover-highlight-radius` muda o raio da pílula.
- `HoverHighlightItem` repassa props ao `<button>` ou `<a>` (como `aria-label` e `style`); o seu `onClick` roda antes da seleção, e `event.preventDefault()` nele impede que o item seja selecionado.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/hover-highlight · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
