# Command palette

> Paleta de comandos controlada pelo teclado, com busca, resultados agrupados e atalhos.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/command-palette
- Descrição original (inglês): A complete keyboard driven action surface with search, grouped results, and shortcuts.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/command-palette.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/command-palette.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/command-palette.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/command-palette.json`. Caminho do registro, relativo ao endereço do site: `r/command-palette.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/command-palette/command-palette.tsx`
  - `components/ryan-ui/command-palette/command-palette.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/command-palette.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Paleta de comandos de um app: buscar e executar ações, ir para outras páginas ou trocar configurações sem tirar as mãos do teclado.
- Até algumas centenas de ações com grupos, ícones e atalhos visíveis, em que a busca aceita abreviações (“dup pr” acha “Duplicate project”).
- Busca rápida embutida numa página ou num painel, já que o componente é um painel comum, não um modal.

## Quando não usar

- Use [`combobox`](combobox.md) quando a pessoa escolhe um valor para um campo de formulário, e não uma ação.
- Use [`search-field`](search-field.md) ou [`expanding-search`](expanding-search.md) para buscar conteúdo com resultados próprios da página.
- Evite com milhares de itens ou busca no servidor: a filtragem roda no cliente a cada tecla sobre a lista inteira e todos os resultados são renderizados.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Bell, FilePlus, FolderOpen, GitBranch, Moon, Palette, Search, Settings, UserPlus } from "lucide-react";
import { CommandPalette, type CommandItem } from "@/components/ryan-ui/command-palette/command-palette";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "center", height: 520 };

const items: CommandItem[] = [
  { id: "new-file", label: "New file", description: "Create a file in the current folder", group: "Create", icon: <FilePlus size={16} />, shortcut: "N", keywords: ["add"] },
  { id: "invite", label: "Invite teammate", description: "Send an invitation by email", group: "Create", icon: <UserPlus size={16} />, shortcut: "I", keywords: ["member", "people"] },
  { id: "branch", label: "New branch", description: "Branch from main", group: "Create", icon: <GitBranch size={16} />, keywords: ["git"] },
  { id: "open", label: "Open project", description: "Jump to a recent project", group: "Go to", icon: <FolderOpen size={16} />, shortcut: "O" },
  { id: "search", label: "Search everything", description: "Files, issues and people", group: "Go to", icon: <Search size={16} />, shortcut: "/" },
  { id: "notifications", label: "Notifications", description: "Review unread updates", group: "Go to", icon: <Bell size={16} /> },
  { id: "theme", label: "Switch theme", description: "Toggle light and dark mode", group: "Settings", icon: <Moon size={16} />, shortcut: "T", keywords: ["dark", "light"] },
  { id: "accent", label: "Change accent color", group: "Settings", icon: <Palette size={16} /> },
  { id: "preferences", label: "Preferences", description: "Account and workspace settings", group: "Settings", icon: <Settings size={16} />, shortcut: ",", keywords: ["account"] },
];

export default function CommandPaletteDemo() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <Stack width={560} gap={3}>
      <CommandPalette items={items} onSelect={item => setLast(item.label)} />
      <Caption>{last ? `Ran: ${last}` : "Type to filter, use the arrow keys, press Enter to run."}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CommandPalette`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` (obrigatória) | `CommandItem[]` | — | — |
| `placeholder` | `string` | `"Search commands"` | — |
| `onSelect` | `(item: CommandItem) => void` | — | — |
| `onClose` | `() => void` | — | — |
| `label` | `string` | `"Command palette"` | — |
| `autoFocus` | `boolean` | `false` | — |

### Tipos exportados

#### `CommandItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `description` | `string` | — |
| `group` | `string` | — |
| `keywords` | `string[]` | — |
| `icon` | `ReactNode` | — |
| `shortcut` | `string` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Movem o destaque entre os resultados, na ordem em que aparecem, e param no primeiro e no último. |
| `Home` ou `End` | Levam o destaque ao primeiro ou ao último resultado (no campo, não movem o cursor do texto). |
| `Enter` | Executa o resultado destacado (depois de digitar, o primeiro); a busca é limpa e o foco continua no campo. |
| `Esc` | Limpa a busca; com o campo já vazio, chama `onClose`. |
| `Ctrl + K` ou `⌘ + K` | Em qualquer ponto da página, levam o foco ao campo enquanto a paleta estiver montada. |

## Acessibilidade

- O campo é um `combobox` ligado à lista (`role="listbox"`) por `aria-controls`, e o resultado ativo vai em `aria-activedescendant`: o foco nunca sai do campo.
- Os grupos são `role="group"` com o nome do grupo, cada resultado é um `option` com `aria-selected`, e uma região `aria-live` anuncia o total de resultados ou “No results”.
- `label` vira o rótulo oculto do campo; o componente não prende o foco nem cobre a página, então, para usá-lo como modal, coloque-o num `dialog` que devolva o foco ao fechar.

## Movimento

- Um único destaque desliza com uma mola rápida até o resultado ativo, pelo ponteiro ou pelas setas, e a moldura dos resultados acompanha a altura da lista ao filtrar.
- Ao digitar, as linhas que saem esmaecem e as restantes deslizam para o novo lugar; se a nova ordem mover alguma linha mais de seis posições, a lista troca de uma vez.
- Com “reduzir movimento” ligado, a entrada, o destaque, a altura e as linhas mudam na hora, sem deslize nem esmaecer.

## Comportamento responsivo

- A lista tem altura máxima de 342px e rola por dentro, trazendo o resultado ativo para a área visível; em janelas de até 480px, as teclas de atalho e a dica “⌘ K” somem.

## Desempenho

- A busca pontua todos os itens a cada tecla e cada resultado é um botão com animação de layout; um `ResizeObserver` mede a lista para a moldura acompanhar a altura.

## Notas para IA

- Apesar de estar entre os blocos, instala em `@/components/ryan-ui/command-palette/command-palette`; passe `items` com `id` e `label` e, opcionais, `group`, `keywords`, `description`, `icon` e `shortcut`.
- Ela não abre nem fecha sozinha: para um modal, monte-a num `dialog` quando o atalho for pressionado, com `autoFocus`, e feche em `onClose`, chamado pelo Esc com o campo vazio e pelo botão “Esc”.
- `shortcut` só desenha as teclas na linha, sem registrar atalho; o único atalho real é o Ctrl+K/⌘+K global, que foca o campo e pode colidir com um atalho seu.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/command-palette · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
