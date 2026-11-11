# Message bubble

> Balão de conversa para você e para o assistente, com cauda, agrupamento, horário e tiques de entrega animados.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/message-bubble
- Descrição original (inglês): A chat bubble for the person and the assistant that pops in from its tail corner, groups consecutive messages, and draws delivery ticks under a timestamp.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/message-bubble.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/message-bubble.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/message-bubble.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/message-bubble.json`. Caminho do registro, relativo ao endereço do site: `r/message-bubble.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/message-bubble/message-bubble.tsx`
  - `components/ryan-ui/message-bubble/message-bubble.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/message-bubble.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Conversas em estilo de mensageiro: as bolhas da pessoa ficam à direita na cor de destaque e as do assistente, à esquerda numa superfície neutra.
- Sequências de mensagens do mesmo remetente: `MessageBubbleGroup` aperta os cantos internos e deixa a cauda só na última bolha.
- Quando a mensagem enviada deve mostrar hora e estado de entrega (`sending`, `sent`, `delivered`, `read`, `failed`) ou a outra parte está digitando (`typing`).

## Quando não usar

- Use [`message`](message.md) para respostas longas do assistente, com Markdown e barra de copiar, tentar de novo e avaliar.
- Use [`chat-thread`](chat-thread.md) quando precisar da conversa pronta, com reações, confirmação de leitura, indicador de digitação e campo de escrita.
- Use [`chat-app`](chat-app.md) quando quiser a tela de chat inteira, com lista de conversas e caixa de prompt.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import { MessageBubble, MessageBubbleGroup } from "@/components/ryan-ui/message-bubble/message-bubble";
import type { MessageBubbleFrom, MessageBubbleStatus } from "@/components/ryan-ui/message-bubble/message-bubble";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./message-bubble.module.css";

export const stage: DemoStage = { height: 560 };

interface Line { id: number; from: MessageBubbleFrom; text: string; time: string; status?: MessageBubbleStatus; typing?: boolean; fresh?: boolean }

const history: Line[] = [
  { id: 1, from: "assistant", text: "Morning! Your flight to Lisbon is confirmed for Friday.", time: "9:38" },
  { id: 2, from: "assistant", text: "Want me to book the airport transfer too?", time: "9:38" },
  { id: 3, from: "user", text: "Yes please.", time: "9:41", status: "read" },
  { id: 4, from: "user", text: "Anything that gets me downtown before noon.", time: "9:41", status: "read" },
];
const replies = ["Done. A car will be waiting at arrivals at 10:15.", "Got it, I added that to the booking.", "Sure. I will confirm once the driver accepts."];
/** The demo keeps its own clock so new lines continue the sample conversation: one minute per exchange. */
const clock = (turn: number) => `9:${42 + (turn % 18)}`;

/** Consecutive lines from one sender become one group, so only the last bubble of a run keeps its tail. */
function runs(lines: Line[]) {
  return lines.reduce<Line[][]>((groups, line) => {
    const last = groups[groups.length - 1];
    if (last && last[0]!.from === line.from) last.push(line); else groups.push([line]);
    return groups;
  }, []);
}

export default function MessageBubbleDemo() {
  const [lines, setLines] = useState(history);
  const [draft, setDraft] = useState("");
  const nextId = useRef(history.length + 1);
  const sent = useRef(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(timer => window.clearTimeout(timer)), []);
  const later = (ms: number, run: () => void) => { timers.current.push(window.setTimeout(run, ms)); };
  const patch = (id: number, change: Partial<Line>) => setLines(current => current.map(line => line.id === id ? { ...line, ...change } : line));

  function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const id = nextId.current++;
    const replyId = nextId.current++;
    const turn = sent.current++;
    const reply = replies[turn % replies.length]!;
    setDraft("");
    setLines(current => [...current.filter(line => !line.typing), { id, from: "user", text, time: clock(turn), status: "sending", fresh: true }]);
    later(600, () => patch(id, { status: "sent" }));
    later(1300, () => patch(id, { status: "delivered" }));
    later(2100, () => { patch(id, { status: "read" }); setLines(current => [...current, { id: replyId, from: "assistant", text: "", time: clock(turn), typing: true, fresh: true }]); });
    later(3900, () => patch(replyId, { typing: false, text: reply }));
  }

  return (
    <Stack width={400} gap={4}>
      <div className={styles.thread}>
        {runs(lines).map(group => (
          <MessageBubbleGroup key={group[0]!.id} from={group[0]!.from} label={group[0]!.from === "user" ? "Your messages" : "Messages from the assistant"}>
            {group.map((line, index) => {
              const last = index === group.length - 1;
              return <MessageBubble key={`${line.id}${line.typing ? "-typing" : ""}`} typing={line.typing} animateIn={!!line.fresh} timestamp={last && !line.typing ? line.time : undefined} status={last ? line.status : undefined}>{line.text}</MessageBubble>;
            })}
          </MessageBubbleGroup>
        ))}
      </div>
      <form className={styles.composer} onSubmit={send}>
        <input className={styles.field} value={draft} onChange={event => setDraft(event.target.value)} placeholder="Write a message" aria-label="Message" />
        <button type="submit" className={styles.send} aria-label="Send message" disabled={!draft.trim()}><ArrowUp width={18} height={18} strokeWidth={2.25} aria-hidden="true" /></button>
      </form>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `MessageBubble`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `from` | `"user" \| "assistant"` | `"assistant"` | Who wrote it. Decides the side, the color and where the tail points. |
| `children` | `ReactNode` | — | The message. Text wraps; links, emphasis and inline code are fine. |
| `position` | `"single" \| "first" \| "middle" \| "last"` | `"single"` | Place inside a run of bubbles from the same sender. `MessageBubbleGroup` sets it for you. |
| `timestamp` | `string` | — | Time shown under the bubble, already formatted (for example "9:41"). |
| `status` | `"sending" \| "sent" \| "delivered" \| "read" \| "failed"` | — | Delivery state shown as ticks after the timestamp. Each new tick draws itself in. |
| `typing` | `boolean` | `false` | Shows three bouncing dots instead of the content while the other side is writing. |
| `tail` | `boolean` | `true` | Draws the tail on a single or last bubble. |
| `animateIn` | `boolean` | `true` | Pops the bubble in from its tail corner when it mounts. Turn it off for history that is already there. |
| `author` | `string` | — | Name read by screen readers before the message. Defaults to "You" or "Assistant". |
| `className` | `string` | — | Extra class for the row element. |

### `MessageBubbleGroup`

A run of bubbles from one sender. It spaces them tightly and gives each its place, so only the last one carries the tail.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `from` | `"user" \| "assistant"` | `"assistant"` | Sender of every bubble in the group. |
| `children` (obrigatória) | `ReactNode` | — | `MessageBubble` elements, as direct children. Each one gets its `from` and `position` from the group. |
| `label` | `string` | — | Accessible name of the group, for example "Messages from Dana". |
| `className` | `string` | — | Extra class for the group element. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `MessageBubbleFrom` | `"user" \| "assistant"` |
| `MessageBubblePosition` | `"single" \| "first" \| "middle" \| "last"` |
| `MessageBubbleStatus` | `"sending" \| "sent" \| "delivered" \| "read" \| "failed"` |

## Acessibilidade

- Cada bolha começa com o autor só para leitor de tela (“You”, “Assistant” ou o `author` que você passar), e o estado de entrega tem um texto oculto equivalente aos tiques.
- Os pontos de digitação são um `role="status"` com `aria-label` “Typing”; `MessageBubbleGroup` é um `role="group"` que recebe o nome de `label`.
- A bolha não cria região viva para mensagens novas: ponha a lista num contêiner com esse papel, como o `message-scroller`, que usa `role="log"`.

## Movimento

- A bolha surge a partir do canto da cauda, crescendo e subindo com uma mola de leve quique; `animateIn={false}` desliga isso para o histórico.
- Cada tique novo se desenha quando o `status` muda (os que já existiam ao montar não repetem); `sending` mostra um pequeno giro e `typing`, três pontos em onda.
- Com “reduzir movimento” ligado, a bolha e os tiques só esmaecem, e o giro e os pontos ficam parados.

## Comportamento responsivo

- A bolha ocupa no máximo 82% da largura do contêiner, até 34rem; o texto preserva as quebras de linha e quebra palavras longas.

## Notas para IA

- Agrupe mensagens seguidas do mesmo remetente num `MessageBubbleGroup from="user"`: ele define `from` e `position` de cada filho, que precisam ser `MessageBubble` diretos (um wrapper no meio quebra isso).
- `timestamp` já chega formatado (por exemplo “9:41”) e `status` desenha os tiques; num grupo, passe os dois só na última bolha, como faz o demo.
- Para o indicador de digitação, renderize uma bolha com `typing` e troque-a pela mensagem quando o texto chegar; fora de grupos, `position` e `tail` controlam cantos e cauda.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/message-bubble · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
