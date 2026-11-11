# Card stack

> Pilha de cartões para arrastar e decidir, com botões, desfazer e acessibilidade por teclado.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/card-stack
- Descrição original (inglês): Review a deck one card at a time, with a throw and an undo.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card-stack.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card-stack.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card-stack.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card-stack.json`. Caminho do registro, relativo ao endereço do site: `r/card-stack.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/card-stack/card-stack.tsx`
  - `components/ryan-ui/card-stack/card-stack.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/card-stack.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Triagem rápida, um item por vez, em que cada um merece um momento de atenção: selecionar destinos, candidatos ou opções de design.
- Decisões de dois lados (ficar ou passar) com desfazer, por arrasto, pelos botões ou pelas setas do teclado.
- Baralhos longos: só quatro cartões ficam montados de cada vez.

## Quando não usar

- Use [`sortable-data-table`](sortable-data-table.md) quando as pessoas precisam comparar os itens lado a lado.
- Use [`carousel`](carousel.md) para navegar por um conjunto sem decidir nada sobre cada item.
- Use [`swipe-actions`](swipe-actions.md) para ações por deslize nas linhas de uma lista; aqui só existem dois desfechos por cartão.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { CardStack, type CardDecision } from "@/components/ryan-ui/card-stack/card-stack";
import { photo } from "@/components/ryan-ui/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 480 };

const trips = [
  { id: "lisbon", name: "Lisbon", note: "Tiled streets and trams from €420", img: photo("lisbon-rooftops") },
  { id: "dolomites", name: "Dolomites", note: "Alpine lakes and hut-to-hut hikes from €690", img: photo("alpine-lake") },
  { id: "algarve", name: "Algarve", note: "Quiet coves and sea-view dinners from €380", img: photo("coastline") },
  { id: "tuscany", name: "Tuscany", note: "Slow farm stays from €540", img: photo("terracotta-waves") },
];

export default function CardStackDemo() {
  const [kept, setKept] = useState<string[]>([]);
  const decide = (trip: (typeof trips)[number], d: CardDecision) => setKept(k => (d === "right" ? [...k, trip.name] : k));
  return (
    <Stack gap={4} align="center">
      <CardStack
        label="Trip ideas"
        items={trips}
        getKey={t => t.id}
        getLabel={t => t.name}
        labels={{ left: "Skip", right: "Shortlist" }}
        outcomes={{ left: "skipped", right: "shortlisted" }}
        onDecide={decide}
        onReset={() => setKept([])}
        renderCard={t => (
          <div style={{ position: "relative", height: "100%" }}>
            <img src={t.img.src} alt="" draggable={false} style={{ display: "block", width: "100%", height: "60%", objectFit: "cover" }} />
            <div style={{ padding: "var(--space-4)", display: "grid", gap: "var(--space-1)" }}>
              <strong style={{ fontSize: "var(--text-lg)" }}>{t.name}</strong>
              <span style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{t.note}</span>
            </div>
          </div>
        )}
      />
      <Caption>Drag a card or use the buttons. Shortlisted: {kept.length ? kept.join(", ") : "none yet"}.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CardStack`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` (obrigatória) | `T[]` | — | — |
| `getKey` (obrigatória) | `(item: T) => string` | — | — |
| `getLabel` (obrigatória) | `(item: T) => string` | — | A short name for the card, used in its accessible label and announcements, such as "Lisbon". |
| `renderCard` (obrigatória) | `(item: T) => ReactNode` | — | — |
| `onDecide` | `(item: T, decision: CardDecision) => void` | — | — |
| `onUndo` | `(item: T, decision: CardDecision) => void` | — | — |
| `onReset` | `() => void` | — | — |
| `labels` | `{ left: string; right: string }` | `{ left: "Pass", right: "Keep" }` | Action names for each side, used on the buttons and the stamps that appear while dragging. |
| `outcomes` | `{ left: string; right: string }` | — | Past tense of each action for announcements, such as "skipped" and "shortlisted". |
| `label` | `string` | `"Cards"` | Accessible name for the stack. |
| `renderEmpty` | `(reset: () => void) => ReactNode` | — | Shown once every card has been decided. Receives a function that brings all cards back. |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `CardDecision` | `"left" \| "right"` |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Leva o foco à pilha (o contorno aparece no cartão do topo) e depois aos três botões. |
| `←` ou `→` | Com o foco na pilha, decidem o cartão do topo para a esquerda ou para a direita. |
| `Backspace` ou `Ctrl + Z` ou `Cmd + Z` | Com o foco na pilha, desfazem a última decisão e trazem o cartão de volta. |
| `Enter` ou `Espaço` | Acionam o botão em foco: recusar, desfazer ou aceitar. |

## Acessibilidade

- A pilha é um grupo focável com `aria-roledescription="card stack"` e uma dica oculta com as teclas; o cartão do topo anuncia nome e posição (via `getLabel`) e os de trás ficam `inert`.
- Cada decisão, desfazer e recomeço é anunciado numa região `role="status"`; `outcomes` dá o verbo da frase, mas o resto dela (“3 left.”, “restored”) é inglês fixo.
- Os botões usam `aria-disabled` para manter o foco quando a pilha acaba; a dica de teclas, “Undo” e o estado vazio padrão também estão em inglês (`renderEmpty` troca o estado vazio).

## Movimento

- O cartão do topo segue o dedo, gira conforme o deslocamento e mostra o carimbo do lado escolhido; os de trás sobem aos poucos enquanto ele se afasta.
- Solto além de 35% da largura (no máximo 140 px) ou num deslize rápido, ele sai voando com mola na direção do gesto; antes disso, volta ao lugar com mola.
- Desfazer traz o cartão de onde ele saiu; com “reduzir movimento”, sair e voltar são só um esmaecer e os de trás trocam de lugar na hora.

## Comportamento responsivo

- A pilha tem até 20rem de largura e altura fixa de 19rem (17,5rem em telas de até 26rem); o conteúdo de `renderCard` deve preencher 100% da altura.
- Em telas de até 22,5rem o botão de desfazer fica só com o ícone, mantendo o nome acessível; o cartão usa `touch-action: pan-y`, então arrastar na vertical rola a página.

## Desempenho

- Só os quatro cartões seguintes (e os que ainda estão voando) ficam no DOM, então o tamanho de `items` não pesa na renderização.

## Notas para IA

- `items`, `getKey`, `getLabel` e `renderCard` são obrigatórios; a posição é estado interno e o pai recebe `onDecide(item, "left" | "right")`, `onUndo` e `onReset`.
- Mantenha `items` estável: a posição é guardada por índice, então remover o item decidido da lista dentro de `onDecide` faz pular o cartão seguinte.
- Trate `onUndo` e `onReset` junto com `onDecide`, senão a sua lista de escolhidos fica diferente da pilha; `labels` dá nome aos botões e aos carimbos.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/card-stack · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
