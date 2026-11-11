# Scroll area

> Área de rolagem nativa com barras finas e esmaecimento só quando há overflow.

- Tipo: componente (categoria Revelação)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/scroll-area
- Descrição original (inglês): A native scroll container with thin overlay scrollbars and edge fades that appear only when content overflows.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/scroll-area.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/scroll-area.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/scroll-area.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/scroll-area.json`. Caminho do registro, relativo ao endereço do site: `r/scroll-area.json`.

- Pacotes npm: nenhum além do React
- Arquivos, depois de instalados:
  - `components/ryan-ui/scroll-area/scroll-area.tsx`
  - `components/ryan-ui/scroll-area/scroll-area.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: não há pacotes para instalar.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/scroll-area.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Listas com altura limitada dentro de cartões, menus ou painéis, com `maxHeight`, onde barras nativas grossas pesariam.
- Faixas horizontais de chips ou filtros (`orientation="horizontal"`), em que a roda vertical do mouse rola de lado enquanto há espaço.
- Faixas com encaixe nativo via `snap`, sem trocar a rolagem do sistema por uma simulada.

## Quando não usar

- Use [`message-scroller`](message-scroller.md) para conversas que precisam acompanhar mensagens novas.
- Use [`carousel`](carousel.md) quando a faixa precisa de setas, indicadores e um slide ativo.
- Para a rolagem da página inteira, deixe o navegador rolar; a área serve para regiões internas.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import ScrollArea from "@/components/ryan-ui/scroll-area/scroll-area";
import { Caption, Stack } from "./_kit";

const changes = ["Added dark mode to the settings page", "Fixed a crash when exporting empty reports", "Faster search across large workspaces", "New keyboard shortcuts for navigation", "Improved accessibility of dialogs", "Billing page now shows annual savings", "Reduced bundle size by 18 percent", "Support for CSV import with custom headers", "Notifications can be snoozed for a day", "Updated onboarding checklist"];
const tags = ["Design", "Engineering", "Marketing", "Sales", "Support", "Finance", "Operations", "Research", "Legal", "People"];

export default function ScrollAreaDemo() {
  return (
    <Stack gap={5} width={440}>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", background: "var(--surface)" }}>
        <ScrollArea label="Release notes" maxHeight={200}>
          <ul style={{ margin: 0, padding: "var(--space-3) var(--space-4)", listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-3)", color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
            {changes.map(c => <li key={c}>{c}</li>)}
          </ul>
        </ScrollArea>
      </div>
      <ScrollArea orientation="horizontal" label="Teams">
        <div style={{ display: "flex", gap: "var(--space-2)", padding: "var(--space-2)" }}>
          {tags.map(t => <span key={t} style={{ flex: "none", padding: "var(--space-1) var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-pill)", color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{t}</span>)}
        </div>
      </ScrollArea>
      <Caption>Fades and thin scrollbars appear only where content overflows.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ScrollArea`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | — |
| `orientation` | `"vertical" \| "horizontal" \| "both"` | `"vertical"` | Axes that scroll. Defaults to vertical. |
| `fade` | `number` | `28` | Length of the edge fade in px. 0 turns the fades off. |
| `scrollbars` | `"auto" \| "always"` | `"auto"` | "auto" shows scrollbars while scrolling or hovering; "always" keeps them visible when content overflows. |
| `hideDelay` | `number` | `900` | How long scrollbars linger after scrolling stops, in ms. |
| `maxHeight` | `CSSProperties["maxHeight"]` | — | Maximum height of the viewport, for vertical areas that should grow with their content. |
| `snap` | `CSSProperties["scrollSnapType"]` | — | Passed to the viewport's `scroll-snap-type`, for example "x mandatory". Children set their own `scroll-snap-align`. |
| `label` | `string` | — | Accessible name. The viewport becomes a labelled, focusable region that arrow and page keys scroll. |
| `wheelToHorizontal` | `boolean` | `true` | Turns vertical wheel movement into horizontal scrolling for horizontal areas. Defaults to true. |
| `viewportClassName` | `string` | — | — |
| `viewportStyle` | `CSSProperties` | — | — |
| `viewportRef` | `Ref<HTMLDivElement>` | — | — |
| `onScroll` | `(event: UIEvent<HTMLDivElement>) => void` | — | — |
| `onEdgeChange` | `(edges: ScrollAreaEdges) => void` | — | Called when content starts or stops extending past an edge. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | — | Também aceita as props deste tipo, menos `onScroll`. |

### Tipos exportados

#### `ScrollAreaEdges`

Which edges still have content beyond them.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `top` (obrigatória) | `boolean` | — |
| `bottom` (obrigatória) | `boolean` | — |
| `left` (obrigatória) | `boolean` | — |
| `right` (obrigatória) | `boolean` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` ou `←` ou `→` | Rolam o conteúdo nos eixos que rolam, quando a área está em foco; a rolagem é a nativa do navegador. |
| `Page Up` ou `Page Down` | Rolam uma página por vez. |

## Acessibilidade

- A janela de rolagem sempre entra na ordem de Tab; com `label`, ela vira uma `region` nomeada, então passe sempre um `label` para ela não ser um foco sem nome.
- As barras desenhadas ficam ocultas para o leitor de tela; a rolagem continua nativa, então teclado, toque e tecnologias assistivas funcionam como na plataforma.

## Movimento

- As barras aparecem ao rolar ou ao passar o ponteiro e somem depois de `hideDelay` (900 ms); o polegar engrossa sob o cursor.
- Cada borda esmaece só quando há conteúdo além dela, crescendo com os primeiros pixels de rolagem até `fade` px (padrão 28; 0 desliga).
- Clicar na trilha rola 90% da área visível com animação suave, que vira salto com “reduzir movimento” ligado; as transições das barras também são desligadas.

## Comportamento responsivo

- Em telas de toque, sem ponteiro que paire, as barras só aparecem durante a rolagem; `scrollbars="always"` as mantém visíveis quando há transbordo.
- A área só rola com altura limitada: passe `maxHeight` ou dê altura ao pai.

## Desempenho

- Rolar não re-renderiza o React: barras e esmaecimentos são escritos direto no DOM, e um `ResizeObserver` com um `MutationObserver` acompanha mudanças no conteúdo.

## Notas para IA

- Importe `ScrollArea` de `@/components/ryan-ui/scroll-area/scroll-area`; `orientation` aceita `vertical` (padrão), `horizontal` e `both`.
- Use `onEdgeChange` para saber quando o fim chegou, por exemplo para carregar mais, e `viewportRef` para rolar por código.
- Com `snap`, defina `scroll-snap-align` nos filhos; o componente só repassa o valor para o `scroll-snap-type` da janela.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/scroll-area · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
