# Message scroller

> Área de conversa que acompanha as mensagens novas, solta quando você rola para cima e mostra um atalho com as não lidas.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/message-scroller
- Descrição original (inglês): A conversation scroll area that follows new messages while the reader is at the bottom, lets go when they scroll up, and offers a jump to latest pill with an unread count.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/message-scroller.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/message-scroller.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/message-scroller.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/message-scroller.json`. Caminho do registro, relativo ao endereço do site: `r/message-scroller.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/message-scroller/message-scroller.tsx`
  - `components/ryan-ui/message-scroller/message-scroller.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/message-scroller.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- A área de rolagem de uma conversa que recebe mensagens novas ou texto em streaming e deve acompanhar o fim enquanto o leitor está lá.
- Quando rolar para cima deve soltar o acompanhamento, sem puxar o leitor de volta, e oferecer um atalho para a mensagem mais recente.
- Registros ao vivo em geral (logs de execução, feeds de eventos) em que o conteúdo novo entra por baixo.

## Quando não usar

- Use [`scroll-area`](scroll-area.md) para conteúdo estático que só precisa de barras finas e esmaecer nas bordas.
- Use [`chat-thread`](chat-thread.md) ou [`chat-app`](chat-app.md) quando quiser a conversa pronta, com mensagens e campo de escrita, e não só o contêiner.
- Use [`infinite-masonry`](infinite-masonry.md) para feeds que carregam mais itens ao chegar ao fim, em vez de acompanhar o que chega.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useEffect, useState } from "react";
import MessageScroller from "@/components/ryan-ui/message-scroller/message-scroller";
import { MessageBubble } from "@/components/ryan-ui/message-bubble/message-bubble";
import type { MessageBubbleFrom, MessageBubblePosition } from "@/components/ryan-ui/message-bubble/message-bubble";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./message-scroller.module.css";

export const stage: DemoStage = { height: 560 };

const script: { from: MessageBubbleFrom; text: string }[] = [
  { from: "user", text: "How is the migration going?" },
  { from: "assistant", text: "Copying the orders table now. 38% done." },
  { from: "assistant", text: "No write errors so far." },
  { from: "user", text: "Great. Ping me when the indexes are rebuilt." },
  { from: "assistant", text: "Orders table copied: 2.4 million rows in 41 s." },
  { from: "assistant", text: "Rebuilding indexes on customers and invoices." },
  { from: "user", text: "Any slow queries showing up?" },
  { from: "assistant", text: "One: the weekly revenue report took 3.2 s. I added it to the follow-up list." },
  { from: "assistant", text: "Indexes rebuilt. Running the row count check." },
  { from: "user", text: "Perfect, thanks." },
  { from: "assistant", text: "Row counts match on all 14 tables. The migration is complete." },
];
const START = 7;
/** Keeps the demo light however long it runs. */
const LIMIT = 80;

export default function MessageScrollerDemo() {
  const [count, setCount] = useState(START);
  const [live, setLive] = useState(true);
  const [following, setFollowing] = useState(true);

  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => setCount(current => current + 1), 1700);
    return () => window.clearInterval(timer);
  }, [live]);

  const first = Math.max(0, count - LIMIT);
  const lines = Array.from({ length: count - first }, (_, offset) => ({ id: first + offset, ...script[(first + offset) % script.length]! }));

  return (
    <Stack width={420} gap={4}>
      <MessageScroller className={styles.panel} label="Migration thread" onAtBottomChange={setFollowing}>
        {lines.map((line, index) => {
          const before = lines[index - 1]?.from === line.from, after = lines[index + 1]?.from === line.from;
          const position: MessageBubblePosition = before && after ? "middle" : before ? "last" : after ? "first" : "single";
          return <div key={line.id} className={before ? undefined : styles.turn}><MessageBubble from={line.from} position={position} animateIn={false}>{line.text}</MessageBubble></div>;
        })}
      </MessageScroller>
      <Row justify="space-between">
        <Row gap={2}>
          <Button size="sm" variant="secondary" onClick={() => setLive(current => !current)}>{live ? "Pause messages" : "Resume messages"}</Button>
          <Button size="sm" variant="ghost" onClick={() => setCount(current => current + 1)}>Add one</Button>
        </Row>
        <Caption>{following ? "Following the latest" : "Released: reading history"}</Caption>
      </Row>
      <Caption>Scroll up inside the thread. It stops following, and the pill counts what arrives until you jump back.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `MessageScroller`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactNode` | — | The messages. Each direct child counts as one message for the unread count; give them stable keys. |
| `label` | `string` | `"Conversation"` | Accessible name of the scroll area. |
| `threshold` | `number` | `32` | How close to the bottom, in pixels, still counts as being at the bottom. |
| `jumpLabel` | `string` | `"Jump to latest"` | Text of the pill that returns to the newest message. |
| `animateItems` | `boolean` | `true` | New messages rise in as they are added. Messages present on the first render never animate. |
| `fadeEdges` | `boolean` | `true` | Fades the top and bottom edges while there is more content in that direction. |
| `onAtBottomChange` | `(atBottom: boolean) => void` | — | Called when the reader leaves or returns to the bottom. |
| `className` | `string` | — | Extra class for the root element. |
| `style` | `CSSProperties` | — | Inline style for the root element, for example a height. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` ou `Page Up` ou `Page Down` ou `Home` ou `End` ou `Espaço` | Com o foco na área, rolam a conversa (rolagem nativa) e interrompem na hora o deslize automático até o fim. |
| `Tab` | Leva o foco à área de rolagem, que é focável, depois ao que houver de interativo nas mensagens e ao botão de pular. |
| `Enter` ou `Espaço` | No botão “Jump to latest”, volta ao fim; o foco passa para a área de rolagem, porque o botão some. |

## Acessibilidade

- A área visível é um `role="region"` focável com o nome de `label`; o conteúdo é um `role="log"` com `aria-live="polite"`, então mensagens novas são anunciadas.
- O botão de pular mostra o texto de `jumpLabel`, e o contador tem `aria-label` com o número de mensagens novas (em inglês, sem prop de tradução).
- Ao acionar o botão pelo teclado, o foco vai para a área de rolagem em vez de se perder quando o botão sai.

## Movimento

- Mensagens novas sobem com uma mola e um leve ganho de escala; as que já estavam na primeira renderização não animam.
- A volta ao fim é um deslize com mola na posição de rolagem; o botão de pular surge de baixo e o número de não lidas rola a cada novo total.
- Com “reduzir movimento” ligado, a rolagem vai direto ao fim, e mensagens e botão só esmaecem.

## Comportamento responsivo

- A altura vem de `--message-scroller-height` (padrão 22rem) ou de `className` e `style`; a rolagem é interna, e as bordas de cima e de baixo esmaecem quando há mais conteúdo naquela direção.

## Desempenho

- Dois `ResizeObserver` acompanham o conteúdo e a moldura; não há virtualização e cada filho ganha um wrapper animado, então limite o histórico em conversas muito longas.

## Notas para IA

- Cada filho direto conta como uma mensagem: dê `key` estável a cada um; o contador de não lidas compara a quantidade de filhos, então aparar mensagens antigas enquanto chegam novas faz ele parar de subir.
- Defina a altura (variável `--message-scroller-height`, `className` ou `style`); `onAtBottomChange` avisa quando o leitor sai do fim ou volta, e `threshold` (32 px) diz o que ainda conta como fim.
- Combina com `message-bubble` ou `message` como filhos; passe `animateIn={false}` a eles, porque a entrada animada já é feita aqui (`animateItems`).

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/message-scroller · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
