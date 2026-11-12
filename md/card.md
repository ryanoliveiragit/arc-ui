# Card

> Cartão com imagem, autor e ação que cresce em uma visão rápida ao ser aberto.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/card
- Descrição original (inglês): A contained group of related content and actions.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card.json`. Caminho do registro, relativo ao endereço do site: `r/card.json`.

- Pacotes npm: `@radix-ui/react-dialog`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/card/card.tsx`
  - `components/ryan-ui/card/card.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-dialog lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/card.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Agrupar título, descrição curta, mídia e uma ou duas ações sobre um mesmo objeto (um projeto, um roteiro, um artigo) numa grade ou lista.
- Resumo que abre uma visão rápida maior sem sair da página: com `details`, o cartão inteiro vira gatilho e cresce até um painel central.
- Rodapé com o dono e um estado que muda no lugar, como “Atualizado agora”, anunciado ao leitor de tela.

## Quando não usar

- Use [`expandable-card`](expandable-card.md) quando o conteúdo extra deve abrir no próprio lugar, dentro do fluxo da página, e não num diálogo.
- Use [`metric-card`](metric-card.md) para um número com contexto e variação.
- Use [`dialog`](dialog.md) para decisões e formulários que não partem de um cartão: a visão rápida daqui serve para ler mais sobre o mesmo item.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Card } from "@/components/ryan-ui/card/card";
import { Avatar } from "@/components/ryan-ui/avatar/avatar";
import { Button } from "@/components/ryan-ui/button/button";
import { avatar, photo } from "@/components/ryan-ui/lib/media";
import { Caption, Stack, demoStage } from "./_kit";
import type { DemoStage } from "./_kit";

const cover = photo("lisbon-bridge");

export const stage: DemoStage = { height: 680 };

export default function CardDemo() {
  // On the docs page the quick look grows inside the preview, so it opens whole and the page around it keeps scrolling.
  const [container] = useState(demoStage);
  const [status, setStatus] = useState("Updated 2 hours ago");
  return (
    <Stack gap={4} width={360}>
      <Card
        title="Lisbon in three days"
        description="Trams, tiled facades and the best pastries in town. A relaxed itinerary for first-time visitors."
        media={<img src={cover.src} alt={cover.alt} style={{ display: "block", width: "100%", aspectRatio: "16 / 10", objectFit: "cover" }} />}
        avatar={<Avatar name="Emma Collins" src={avatar("emma-collins")} size="sm" />}
        meta="Emma Collins"
        status={status}
        container={container}
        action={<Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); setStatus("Updated just now"); }}>Refresh</Button>}
        details={
          <div style={{ display: "grid", gap: "var(--space-3)", color: "var(--text-secondary)" }}>
            <p style={{ margin: 0 }}>Day one: Alfama and the old tram 28 route. Day two: Belém, then sunset at the Miradouro da Senhora do Monte. Day three: day trip to Sintra.</p>
            <p style={{ margin: 0 }}>Best time to go is April to June, when the city is warm but not crowded.</p>
          </div>
        }
      />
      <Caption>Click the card to open its quick look.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Card`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` (obrigatória) | `string` | — | — |
| `description` | `string` | — | — |
| `media` | `ReactNode` | — | — |
| `action` | `ReactNode` | — | — |
| `avatar` | `ReactNode` | — | A small leading visual for the footer, such as the owner's avatar. |
| `meta` | `ReactNode` | — | Who the card belongs to, such as the owner's name. |
| `status` | `string` | — | A short status under the meta, such as "Updated 2 hours ago". Changed words rise in and are announced politely. |
| `details` | `ReactNode` | — | Content for a quick look. When set, the whole card opens and grows into a larger view; Escape or the close control morphs it back. |
| `open` | `boolean` | — | — |
| `defaultOpen` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `container` | `HTMLElement \| null` | — | Opens the quick look inside this element instead of over the whole page: the dim covers only the element and the quick look centers in it. The element needs position: relative and overflow: hidden. The page around it stays usable while the quick look is open: nothing is scroll-locked or hidden from assistive technology, and Escape, the dim and the close control still close it. |
| `...props` | `HTMLAttributes<HTMLElement>` | — | Também aceita as props deste tipo. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Com `details`, para no título, que vira um botão; o foco aparece como a borda do cartão mais forte. |
| `Enter` ou `Espaço` | Abrem a visão rápida a partir do título. |
| `Esc` | Fecha a visão rápida: o painel volta para o lugar do cartão e o foco retorna ao título. |
| `Tab` ou `Shift + Tab` | Com a visão rápida aberta, circulam só entre os controles do painel. |

## Acessibilidade

- O cartão é um `article` com título `h3`; a visão rápida é um diálogo modal do Radix (prende o foco, fecha com `Esc` ou clique fora e devolve o foco) com o título em `h2` e a descrição ligada por `aria-describedby`.
- Com `details`, a área de clique do título cobre o cartão todo e `action` fica por cima; o botão do título não tem contorno próprio, só a borda do cartão muda no foco.
- `status` é uma região `role="status"`, então cada texto novo é anunciado; o botão de fechar tem rótulo em inglês (“Close quick look”), e o `alt` da mídia é por sua conta.

## Movimento

- Sob o ponteiro do mouse o cartão sobe 2 px com sombra e a mídia aproxima devagar até 4%.
- Na visão rápida, a superfície, a foto, o título, a descrição e o rodapé viajam numa mola sem ultrapassagem do cartão até o painel central e voltam pelo mesmo caminho ao fechar; `details` entra depois que o painel cresceu.
- Com “reduzir movimento”, o cartão não sobe nem aproxima a foto, a visão rápida só esmaece e `status` troca sem animar.

## Comportamento responsivo

- O painel da visão rápida tem `min(100vw - var(--space-8), 30rem)` de largura e, no máximo, a altura da tela menos a mesma margem, com rolagem interna.
- O cartão ocupa a largura do pai; num rodapé estreito, `meta` e `status` cortam com reticências em vez de passar por baixo de `action`.

## Desempenho

- Cada cartão com `details` monta um diálogo próprio e um observador de tamanho, e o fundo da visão rápida usa `backdrop-filter`; em grades longas, passe `details` só onde ela faz falta.

## Notas para IA

- `title` é obrigatório e é texto; `media`, `avatar`, `meta`, `action`, `children` e `details` são espaços livres, e `status` precisa ser string porque anima palavra por palavra.
- `open`, `defaultOpen` e `onOpenChange` só valem com `details`; sem ele o cartão é estático e o título não vira botão.
- Com a visão rápida aberta, `media`, `children`, `avatar` e `action` existem duas vezes (no cartão e no painel): não ponha `id` fixo nem estado local dentro deles.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/card · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
