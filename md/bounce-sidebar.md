# Bounce sidebar

> Barra lateral que alterna entre trilho de ícones e painel completo com uma mola elástica; o marcador ativo desliza.

- Tipo: componente (categoria Revelação), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/bounce-sidebar
- Descrição original (inglês): An app sidebar that switches between an icon rail and a full panel on a slightly bouncy width spring, with staggered labels and a gliding active marker.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bounce-sidebar.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bounce-sidebar.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bounce-sidebar.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bounce-sidebar.json`. Caminho do registro, relativo ao endereço do site: `r/bounce-sidebar.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/bounce-sidebar/bounce-sidebar.tsx`
  - `components/ryan-ui/bounce-sidebar/bounce-sidebar.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/bounce-sidebar.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- A navegação principal de um app com quatro a oito destinos planos, em que um trilho de ícones libera largura para o conteúdo.
- Shells de painel com destinos fixos no pé da barra, como Configurações e Ajuda, passados em `secondaryItems`.
- Contadores que precisam continuar visíveis no trilho: o `badge` vira um ponto sobre o ícone.

## Quando não usar

- Use [`animated-sidebar`](animated-sidebar.md) quando houver grupos aninhados, destinos com `href` ou necessidade de dica com o nome de cada ícone no trilho.
- Evite com muitos destinos ou pouca altura: a barra não rola, e as últimas linhas e o botão de recolher ficam cortados.
- Use [`site-header`](site-header.md) para a navegação de um site público.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { ChartColumn, FolderKanban, Inbox, LayoutDashboard, LifeBuoy, Settings, Users } from "lucide-react";
import { BounceSidebar } from "@/components/ryan-ui/bounce-sidebar/bounce-sidebar";
import type { BounceSidebarItem } from "@/components/ryan-ui/bounce-sidebar/bounce-sidebar";
import type { DemoStage } from "./_kit";
import styles from "./bounce-sidebar.module.css";

export const stage: DemoStage = { layout: "fill", height: 480 };

const icon = { size: 18, strokeWidth: 1.75 };
const main: BounceSidebarItem[] = [
  { id: "home", label: "Home", icon: <LayoutDashboard {...icon} /> },
  { id: "inbox", label: "Inbox", icon: <Inbox {...icon} />, badge: 4 },
  { id: "projects", label: "Projects", icon: <FolderKanban {...icon} /> },
  { id: "reports", label: "Reports", icon: <ChartColumn {...icon} /> },
  { id: "team", label: "Team", icon: <Users {...icon} /> },
];
const secondary: BounceSidebarItem[] = [
  { id: "settings", label: "Settings", icon: <Settings {...icon} /> },
  { id: "help", label: "Help center", icon: <LifeBuoy {...icon} /> },
];
const pages: Record<string, { lead: string; rows: [string, string][] }> = {
  home: { lead: "Three things need you today, and the Q3 report is ready for review.", rows: [["Approve the Lisbon launch budget", "Due today"], ["Review Q3 revenue report", "Ready"], ["Reply to Hannah about onboarding", "2 days ago"]] },
  inbox: { lead: "Four unread conversations, newest first.", rows: [["Marcus: staging is green again", "9:42"], ["Sofia: vendor contract attached", "9:10"], ["Chloe: dashboard numbers look off", "Yesterday"]] },
  projects: { lead: "Active projects across the workspace.", rows: [["Mobile checkout redesign", "68%"], ["Billing migration", "41%"], ["Partner portal", "12%"]] },
  reports: { lead: "Saved reports refresh every morning at six.", rows: [["Weekly revenue", "Updated 6:00"], ["Churn by plan", "Updated 6:00"], ["Support response time", "Updated 6:01"]] },
  team: { lead: "Sixteen people in four time zones.", rows: [["Emma Collins", "Product designer"], ["Daniel Kim", "Backend engineer"], ["Jasmine Brooks", "Design lead"]] },
  settings: { lead: "Workspace preferences apply to every member.", rows: [["Workspace name", "Northwind"], ["Default time zone", "Lisbon"], ["Two-step sign-in", "Required"]] },
  help: { lead: "Guides and a direct line to support.", rows: [["Getting started in ten minutes", "Guide"], ["Importing from a spreadsheet", "Guide"], ["Talk to a person", "Chat"]] },
};

export default function BounceSidebarDemo() {
  const [active, setActive] = useState("inbox");
  // A phone starts on the rail, so the page keeps most of the width.
  const [expanded, setExpanded] = useState(() => typeof window === "undefined" || window.innerWidth >= 560);
  const all = [...main, ...secondary];
  const page = pages[active];
  return (
    <div className={styles.frame}>
      <BounceSidebar items={main} secondaryItems={secondary} value={active} onValueChange={setActive} expanded={expanded} onExpandedChange={setExpanded} logo="N" title="Northwind" label="Workspace" />
      <section className={styles.page} aria-live="polite">
        <h2 className={styles.heading}>{all.find(item => item.id === active)?.label}</h2>
        <p className={styles.lead}>{page?.lead}</p>
        <ul className={styles.rows}>
          {page?.rows.map(([name, detail]) => <li key={name} className={styles.row}><span>{name}</span><span>{detail}</span></li>)}
        </ul>
      </section>
    </div>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `BounceSidebar`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` (obrigatória) | `BounceSidebarItem[]` | — | Main destinations, top to bottom. |
| `secondaryItems` | `BounceSidebarItem[]` | `[]` | Destinations pinned to the bottom, such as settings and help. |
| `value` | `string` | — | Id of the active row (controlled). |
| `defaultValue` | `string` | — | Active row when uncontrolled. Defaults to the first item. |
| `onValueChange` | `(value: string) => void` | — | Called with the id of the pressed row. |
| `expanded` | `boolean` | — | Whether the full panel shows (controlled). False is the icon rail. |
| `defaultExpanded` | `boolean` | `true` | Starting state when uncontrolled. |
| `onExpandedChange` | `(expanded: boolean) => void` | — | Called when the toggle is pressed. |
| `logo` | `ReactNode` | — | Brand mark for the header tile: a glyph or a letter. |
| `title` | `string` | — | Product or workspace name beside the brand mark. |
| `railWidth` | `number` | `64` | Width of the icon rail in pixels. |
| `panelWidth` | `number` | `232` | Width of the full panel in pixels. |
| `label` | `string` | `"Main"` | Accessible name of the navigation landmark. |
| `className` | `string` | — | Extra class for the sidebar. |

### Tipos exportados

#### `BounceSidebarItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique id, used as the sidebar's value. |
| `label` (obrigatória) | `string` | Text next to the icon. It stays in the accessibility tree while the sidebar is a rail. |
| `icon` (obrigatória) | `ReactNode` | Icon, about 18 px. |
| `badge` | `string \| number` | A count or short word at the end of the row; the rail shows it as a dot on the icon. |
| `disabled` | `boolean` | Keeps the row visible but not pressable. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↓` ou `↑` | Move o foco entre as linhas e o botão de recolher, voltando ao início depois do último. |
| `Home` ou `End` | Leva o foco à primeira linha ou ao botão de recolher, que é o último. |
| `Enter` ou `Espaço` | Seleciona a linha em foco ou alterna entre trilho e painel. |

## Acessibilidade

- É um `<nav>` com `aria-label` vindo de `label` (padrão “Main”); a linha ativa recebe `aria-current="page"`.
- No trilho, rótulos e contadores continuam no DOM com opacidade zero, então o leitor de tela segue lendo cada destino; não há dica visual com o nome do ícone.
- O botão de recolher tem `aria-expanded`, `aria-controls` apontando para a barra e um nome oculto “Collapse sidebar” ou “Expand sidebar”, fixo em inglês no código.

## Movimento

- A largura troca entre `railWidth` e `panelWidth` numa mola com um pequeno quique; o marcador do item ativo ocupa a largura toda e estica junto.
- Ao abrir, os rótulos chegam um depois do outro deslizando 6 px; ao fechar, saem juntos num esmaecer de 120 ms. O marcador desliza até a linha ativa com um leve quique.
- Com “reduzir movimento” ligado, largura, rótulos e marcador mudam na hora, e o encolher do ícone ao pressionar é desligado.

## Comportamento responsivo

- A barra tem `height: 100%` e não rola por dentro; com pouca altura, as últimas linhas e o botão de recolher ficam cortados, então o pai precisa de altura suficiente.
- Ela não recolhe sozinha em telas estreitas; o demo começa no trilho abaixo de 560 px passando `expanded` controlado.

## Notas para IA

- As linhas são `<button>` sem `href`: faça a navegação no `onValueChange`, por exemplo chamando o roteador.
- Todo item precisa de `id` único e `icon` (cerca de 18 px); `defaultValue` cai no primeiro item e `defaultExpanded` começa como `true`.
- Importe `BounceSidebar` de `@/components/ryan-ui/bounce-sidebar/bounce-sidebar` e coloque-a numa linha flex ao lado da página, com altura definida.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/bounce-sidebar · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
