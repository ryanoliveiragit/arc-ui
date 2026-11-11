# Resizable panels

> Painéis que trocam espaço entre si ao arrastar o divisor.

- Tipo: componente (categoria Revelação)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/resizable-panels
- Descrição original (inglês): Trade space between panes by dragging the divider between them.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/resizable-panels.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/resizable-panels.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/resizable-panels.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/resizable-panels.json`. Caminho do registro, relativo ao endereço do site: `r/resizable-panels.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/resizable-panels/resizable-panels.tsx`
  - `components/ryan-ui/resizable-panels/resizable-panels.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/resizable-panels.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Layouts de e-mail ou de editor, como pastas, lista e leitura lado a lado, em que cada pessoa ajusta o espaço para a tarefa.
- Um painel lateral que pode ser escondido arrastando até a borda (`collapsible`) e volta pela aba que aparece no divisor.
- Comparar dois conteúdos lado a lado, como código e prévia, com limites em px (`minSize`, `maxSize`).

## Quando não usar

- Use [`image-compare`](image-compare.md) para comparar duas imagens sobrepostas com um divisor.
- Use [`drawer`](drawer.md) ou [`tabs`](tabs.md) em telas de celular, onde painéis lado a lado ficam estreitos demais.
- Evite quando precisar de divisão vertical, com um painel em cima do outro: o grupo só divide na horizontal.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { ResizablePanel, ResizablePanels } from "@/components/ryan-ui/resizable-panels/resizable-panels";
import { Caption, Stack } from "./_kit";

const pane = (title: string, rows: string[]) => (
  <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)", width: "100%" }}>
    <strong style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)" }}>{title}</strong>
    {rows.map(r => <span key={r} style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", whiteSpace: "nowrap" }}>{r}</span>)}
  </div>
);

export default function ResizablePanelsDemo() {
  return (
    <Stack gap={4} width={640}>
      <div style={{ height: 260, border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", overflow: "hidden", background: "var(--surface)" }}>
        <ResizablePanels label="Mail layout">
          <ResizablePanel id="folders" label="Folders" defaultSize={22} minSize={110} collapsible>{pane("Folders", ["Inbox", "Starred", "Drafts", "Sent"])}</ResizablePanel>
          <ResizablePanel id="list" label="Messages" defaultSize={38} minSize={160}>{pane("Messages", ["Design review notes", "Invoice 2041", "Team offsite plan"])}</ResizablePanel>
          <ResizablePanel id="reader" label="Reader" defaultSize={40} minSize={160}>{pane("Design review notes", ["From Jasmine Brooks", "Thursday, 9:14 AM"])}</ResizablePanel>
        </ResizablePanels>
      </div>
      <Caption>Drag a divider, use arrow keys, or drag the folders pane closed.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ResizablePanel`

Carries a pane's configuration into `ResizablePanels`. Rendered on its own it shows its children unchanged.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `id` (obrigatória) | `string` | — | Stable id, also used by the dividers' `aria-controls`. |
| `label` (obrigatória) | `string` | — | Names the pane for its divider, for example "Folders". |
| `defaultSize` (obrigatória) | `number` | — | Starting share of the group. Shares are relative, so they need not add up to 100. |
| `minSize` | `number` | — | Width in px where the pane starts to resist. Its content never reflows below it; it clips and fades instead. |
| `maxSize` | `number` | — | — |
| `collapsible` | `boolean` | — | Dragging well past the minimum, or flicking toward the edge, snaps the pane closed. Its divider then shows a restore tab. |
| `defaultCollapsed` | `boolean` | — | — |
| `className` | `string` | — | — |
| `children` | `ReactNode` | — | — |

### `ResizablePanels`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | — | Names the group for assistive technology. |
| `children` (obrigatória) | `ReactNode` | — | `ResizablePanel` elements, in order. The set of panes should stay the same for the life of the group. |
| `onLayoutChange` | `(sizes: number[]) => void` | — | Called with each pane's share in percent after a resize settles. |
| `className` | `string` | — | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | No divisor em foco, movem a borda 16 px; no limite de um painel recolhível, a seta seguinte o esconde e a oposta o traz de volta no mínimo. |
| `Shift + ←` ou `Shift + →` | Movem a borda 64 px. |
| `Home` ou `End` | Levam o painel da esquerda ao menor ou ao maior tamanho permitido. |
| `Enter` | Esconde o painel recolhível vizinho ou mostra de novo o que estava escondido. |
| `Esc` | Durante um arraste, devolve o divisor à posição de onde saiu. |

## Acessibilidade

- Cada divisor é um `separator` focável com `aria-valuenow`, `aria-valuemin` e `aria-valuemax` em porcentagem, nomeado pelo `label` do painel à esquerda e ligado a ele por `aria-controls`.
- Com um painel escondido, o divisor anuncia “<nome> hidden, press Enter to show”, texto fixo em inglês, e o conteúdo escondido fica `inert`.
- O grupo é um `group` nomeado por `label`; o `aria-valuenow` já mostra o destino assim que a mola começa, sem esperar ela assentar.

## Movimento

- O divisor segue o ponteiro 1:1 e resiste como elástico além dos limites; puxar bem abaixo do mínimo de um painel `collapsible`, ou dar um gesto rápido para a borda, o fecha.
- Mudanças de estado e o teclado usam molas sem ultrapassagem; o conteúdo esmaece conforme o painel é espremido abaixo do mínimo e fica preso à borda que se move, como uma gaveta.
- Com “reduzir movimento” ligado, os painéis vão direto ao tamanho final e a aba de restaurar só esmaece.

## Comportamento responsivo

- O grupo é um contêiner de tamanho: quando fica mais estreito que a soma dos mínimos, cada mínimo encolhe na proporção, e os painéis mantêm as proporções quando a janela muda.
- O grupo ocupa `height: 100%`, então o pai precisa de altura definida; o demo usa uma caixa de 260 px.

## Notas para IA

- Monte `ResizablePanels` com filhos `ResizablePanel`, cada um com `id` único, `label` e `defaultSize` (proporções relativas, não precisam somar 100); `minSize` é em px e vale 80 por padrão.
- O conjunto de painéis deve ser o mesmo durante toda a vida do grupo; para trocar os painéis, remonte o grupo com outra `key`.
- Para lembrar o layout, salve as porcentagens de `onLayoutChange` e passe-as como `defaultSize` na próxima montagem; um duplo clique no divisor volta ao padrão.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/resizable-panels · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
