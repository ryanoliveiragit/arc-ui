# Animated sidebar

> Barra lateral com grupos aninhados que abrem com animação de altura, destaque que desliza e modo recolhido com dicas.

- Tipo: componente (categoria Revelação), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/animated-sidebar
- Descrição original (inglês): A sidebar with nested groups that open on a height spring, one highlight that glides under the pointer, and a collapsed icon rail with tooltips.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/animated-sidebar.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/animated-sidebar.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/animated-sidebar.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/animated-sidebar.json`. Caminho do registro, relativo ao endereço do site: `r/animated-sidebar.json`.

- Pacotes npm: `motion`, `lucide-react`, `@radix-ui/react-tooltip`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Hover highlight](hover-highlight.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/animated-sidebar/animated-sidebar.tsx`
  - `components/ryan-ui/animated-sidebar/animated-sidebar.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react @radix-ui/react-tooltip`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/animated-sidebar.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Navegação de um app com seções e subpáginas, como Projetos com Ativos, Rascunhos e Arquivados, em que o grupo abre no próprio lugar.
- Painéis administrativos que precisam recolher a navegação num trilho de ícones de 64 px, com o nome de cada ícone numa dica.
- Navegação com contadores nas linhas (`badge`) e destinos que são links reais (`href`).

## Quando não usar

- Use [`bounce-sidebar`](bounce-sidebar.md) quando os destinos são uma lista plana, sem grupos aninhados.
- Use [`tree-view`](tree-view.md) ou [`file-tree`](file-tree.md) para hierarquias de conteúdo com vários níveis; aqui os grupos têm um nível só e filhos de um filho não são desenhados.
- Use [`site-header`](site-header.md) para a navegação principal de um site público, no topo da página.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { ChartColumn, CreditCard, FolderKanban, Inbox, LayoutDashboard, Settings, Users } from "lucide-react";
import { AnimatedSidebar } from "@/components/ryan-ui/animated-sidebar/animated-sidebar";
import type { AnimatedSidebarSection } from "@/components/ryan-ui/animated-sidebar/animated-sidebar";
import type { DemoStage } from "./_kit";
import styles from "./animated-sidebar.module.css";

export const stage: DemoStage = { layout: "fill", height: 540 };

const icon = { size: 18, strokeWidth: 1.75 };
const sections: AnimatedSidebarSection[] = [
  { id: "main", items: [
    { id: "overview", label: "Overview", icon: <LayoutDashboard {...icon} /> },
    { id: "inbox", label: "Inbox", icon: <Inbox {...icon} />, badge: 12 },
  ] },
  { id: "workspace", title: "Workspace", items: [
    { id: "projects", label: "Projects", icon: <FolderKanban {...icon} />, children: [
      { id: "projects-active", label: "Active", badge: 8 },
      { id: "projects-drafts", label: "Drafts" },
      { id: "projects-archived", label: "Archived" },
    ] },
    { id: "customers", label: "Customers", icon: <Users {...icon} />, children: [
      { id: "customers-accounts", label: "Accounts" },
      { id: "customers-segments", label: "Segments" },
      { id: "customers-imports", label: "Imports" },
    ] },
    { id: "analytics", label: "Analytics", icon: <ChartColumn {...icon} />, children: [
      { id: "analytics-traffic", label: "Traffic" },
      { id: "analytics-revenue", label: "Revenue" },
      { id: "analytics-retention", label: "Retention" },
    ] },
  ] },
  { id: "account", title: "Account", items: [
    { id: "billing", label: "Billing", icon: <CreditCard {...icon} /> },
    { id: "settings", label: "Settings", icon: <Settings {...icon} />, children: [
      { id: "settings-profile", label: "Profile" },
      { id: "settings-members", label: "Members" },
      { id: "settings-keys", label: "API keys" },
    ] },
  ] },
];

const notes: Record<string, string> = {
  overview: "Revenue is up 8% on last week and two projects ship on Friday.",
  inbox: "Twelve unread conversations, three of them waiting on you.",
  "projects-active": "Eight projects in progress. Mobile checkout is the closest to launch.",
  "projects-drafts": "Drafts stay private until you invite someone.",
  "projects-archived": "Archived projects are read-only and can be restored at any time.",
  "customers-accounts": "214 accounts, sorted by last activity.",
  "customers-segments": "Segments update as customers match or stop matching their rules.",
  "customers-imports": "Bring customers in from a CSV file or a connected CRM.",
  "analytics-traffic": "Visits by source for the last thirty days.",
  "analytics-revenue": "Recurring revenue, expansions and refunds by month.",
  "analytics-retention": "How many customers from each signup month are still active.",
  billing: "Team plan, 16 seats. The next invoice is due on December 1.",
  "settings-profile": "Your name, photo and notification preferences.",
  "settings-members": "Invite people and decide what each role can do.",
  "settings-keys": "Create and revoke keys for the public API.",
};

/** The trail of labels that leads to a leaf row. */
function trail(id: string) {
  for (const section of sections) for (const item of section.items) {
    if (item.id === id) return [item.label];
    const child = item.children?.find(entry => entry.id === id);
    if (child) return [item.label, child.label];
  }
  return [];
}

export default function AnimatedSidebarDemo() {
  const [active, setActive] = useState("projects-active");
  // A phone starts on the rail, so the page keeps most of the width.
  const [collapsed, setCollapsed] = useState(() => typeof window !== "undefined" && window.innerWidth < 560);
  const path = trail(active);
  return (
    <div className={styles.frame}>
      <AnimatedSidebar sections={sections} value={active} onValueChange={setActive} collapsed={collapsed} onCollapsedChange={setCollapsed} logo="A" title="Atlas" label="Workspace" />
      <section className={styles.page} aria-live="polite">
        <p className={styles.crumbs}>{path.join(" / ")}</p>
        <h2 className={styles.heading}>{path.at(-1)}</h2>
        <p className={styles.lead}>{notes[active]}</p>
      </section>
    </div>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `AnimatedSidebar`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `sections` (obrigatória) | `AnimatedSidebarSection[]` | — | Sections of rows, top to bottom. |
| `value` | `string` | — | Id of the active leaf row (controlled). |
| `defaultValue` | `string` | — | Active row when uncontrolled. |
| `onValueChange` | `(value: string) => void` | — | Called with the id of the pressed leaf row. |
| `openIds` | `string[]` | — | Ids of the open groups (controlled). |
| `defaultOpenIds` | `string[]` | — | Open groups when uncontrolled. Defaults to the group that holds the active row. |
| `onOpenIdsChange` | `(openIds: string[]) => void` | — | Called with the next list of open group ids. |
| `collapsed` | `boolean` | — | Whether the sidebar is the icon rail (controlled). |
| `defaultCollapsed` | `boolean` | `false` | Starting state when uncontrolled. |
| `onCollapsedChange` | `(collapsed: boolean) => void` | — | Called when the collapse button is pressed, or when a group is opened from the rail. |
| `logo` | `ReactNode` | — | Brand mark shown in the header. |
| `title` | `string` | — | Product or workspace name shown beside the brand mark. |
| `width` | `number` | `264` | Panel width in pixels. |
| `collapsedWidth` | `number` | `64` | Rail width in pixels. |
| `label` | `string` | `"Sidebar"` | Accessible name of the navigation landmark. |
| `className` | `string` | — | Extra class for the sidebar. |

### Tipos exportados

#### `AnimatedSidebarItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique id across the whole sidebar. Leaf ids are the sidebar's value. |
| `label` (obrigatória) | `string` | Row text. In the collapsed rail it moves to a tooltip. |
| `icon` | `ReactNode` | Icon for a top-level row, about 18 px. Nested rows do not show one. |
| `badge` | `string \| number` | A count or short word at the end of the row. |
| `href` | `string` | Renders the row as a link. |
| `disabled` | `boolean` | Keeps the row visible but not pressable. |
| `children` | `AnimatedSidebarItem[]` | Nested rows. A row with children opens and closes its group instead of navigating. |

#### `AnimatedSidebarSection`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique id of the section. |
| `title` | `string` | Small heading above the rows. In the rail it becomes a divider. |
| `items` (obrigatória) | `AnimatedSidebarItem[]` | The rows of the section. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↓` ou `↑` | Move o foco para a linha seguinte ou anterior, incluindo as de grupos abertos, voltando à primeira depois da última. |
| `Home` ou `End` | Leva o foco à primeira ou à última linha. |
| `→` | Numa linha de grupo fechada, abre o grupo; no trilho, abre o painel e o grupo juntos. |
| `←` | Numa linha de grupo aberta, fecha o grupo; numa linha aninhada, leva o foco à linha do grupo. |
| `Enter` ou `Espaço` | Aciona a linha ou abre e fecha o grupo; linhas com `href` são links e respondem ao `Enter`. |

## Acessibilidade

- É um `<nav>` com `aria-label` vindo de `label` (padrão “Sidebar”); cada seção é um `group` nomeado pelo título, e o título visual fica oculto para o leitor de tela.
- Linhas de grupo são botões com `aria-expanded` e `aria-controls`; a folha ativa recebe `aria-current="page"`, e linhas desativadas usam `disabled` ou, nos links, `aria-disabled` sem `href`.
- No trilho, o rótulo continua no DOM com opacidade zero e uma dica do Radix aparece ao passar o mouse ou focar; os nomes “Expand sidebar” e “Collapse sidebar” do botão são fixos em inglês.

## Movimento

- A largura alterna entre `width` e `collapsedWidth` numa mola sem ultrapassagem; os ícones ficam parados numa célula de 40 px enquanto o painel estreita em volta deles.
- Um grupo abre com mola de altura e suas linhas chegam uma depois da outra, deslizando 8 px da esquerda; um único destaque desliza sob o cursor ou o foco do teclado.
- Com “reduzir movimento” ligado, largura, grupos e destaque mudam na hora e as transições de CSS são desligadas.

## Comportamento responsivo

- A barra ocupa `height: 100%` e rola por dentro quando as linhas não cabem; o pai precisa ter altura definida.
- Ela não recolhe sozinha em telas estreitas: decida `collapsed` pela largura da janela, como o demo faz abaixo de 560 px.

## Notas para IA

- Precisa do item `hover-highlight` instalado; importe `AnimatedSidebar` de `@/components/ryan-ui/animated-sidebar/animated-sidebar`.
- Os `id` precisam ser únicos na barra inteira e `value` é sempre o `id` de uma folha: uma linha com `children` só abre o grupo, nunca navega.
- Ao controlar `collapsed`, trate `onCollapsedChange` também quando um grupo é aberto pelo trilho: o componente pede para expandir o painel antes de mostrar os filhos.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/animated-sidebar · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
