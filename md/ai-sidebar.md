# AI sidebar

> Painel de assistente que desliza ao lado da página, com cabeçalho, mensagens, sugestões e caixa de prompt.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/ai-sidebar
- Descrição original (inglês): A docked assistant panel that springs in beside the page and pushes it aside (or slides over it when narrow), with a header, a message list that follows new messages, suggestion chips and a growing prompt box.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ai-sidebar.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ai-sidebar.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ai-sidebar.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ai-sidebar.json`. Caminho do registro, relativo ao endereço do site: `r/ai-sidebar.json`.

- Pacotes npm: `motion`, `lucide-react`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Loading states](loading-states.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/ai-sidebar/ai-sidebar.tsx`
  - `components/ryan-ui/ai-sidebar/ai-sidebar.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/ai-sidebar.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um assistente que fica ao lado do conteúdo que comenta (documento, painel, editor) e empurra a página em vez de cobri-la.
- Conversas curtas e contextuais sobre a tela atual, com sugestões prontas que enviam o prompt num toque.
- Layouts divididos: o painel escolhe entre encaixar e sobrepor pela largura do próprio contêiner, não da janela.

## Quando não usar

- Use [`chat-app`](chat-app.md) quando a conversa é a tela inteira, com lista de conversas e respostas que podem ser paradas ou refeitas.
- Use [`drawer`](drawer.md) para um painel lateral temporário que não é uma conversa.
- Use [`prompt-input`](prompt-input.md) com [`message-scroller`](message-scroller.md) quando precisar de anexos, menu de modelo ou botão de parar: a caixa de prompt embutida aqui só envia texto.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { AiSidebar } from "@/components/ryan-ui/ai-sidebar/ai-sidebar";
import type { AiSidebarMessage } from "@/components/ryan-ui/ai-sidebar/ai-sidebar";
import { StreamingResponse } from "@/components/ryan-ui/streaming-response/streaming-response";
import { Button } from "@/components/ryan-ui/button/button";
import type { DemoStage } from "./_kit";
import styles from "./ai-sidebar.module.css";

export const stage: DemoStage = { layout: "fill", height: 600 };

const suggestions = ["Summarize this plan", "What are the risks?", "Draft the kickoff email"];

const replies: Record<string, string> = {
  "Summarize this plan": "The plan ships usage-based billing in three phases over eight weeks: metering in weeks 1 to 3, the new invoices in weeks 4 to 6, and a gradual rollout in weeks 7 and 8.\n\nSuccess means fewer than 2% of invoices needing a manual correction in the first month.",
  "What are the risks?": "Two stand out. Metering depends on the events pipeline, which dropped data twice last quarter, so the plan needs a reconciliation job before invoices go out.\n\nThe second is support load: customers moving from seats to usage will ask about their first bill, and the help articles are not scheduled until week 7.",
  "Draft the kickoff email": "Subject: Usage-based billing kicks off Monday\n\nHi team, we start the eight week build on Monday. Daniel owns metering, Olivia owns invoices and Sofia runs the rollout. The first checkpoint is the metering demo on Friday of week 3. Reply here with anything that could block your part.",
};
const fallback = "I can only see this page. From what is written here, the closest answer is in the timeline section: the rollout starts in week 7 with ten percent of accounts and widens once the invoice error rate stays under the target.";

export default function AiSidebarDemo() {
  const [open, setOpen] = useState(() => (typeof window === "undefined" ? true : window.matchMedia("(min-width: 900px)").matches));
  const [messages, setMessages] = useState<AiSidebarMessage[]>([]);
  const [pending, setPending] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const count = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = (text: string) => {
    const id = ++count.current;
    setMessages(current => [...current, { id: `user-${id}`, role: "user", content: text }]);
    setPending(true);
    timer.current = window.setTimeout(() => {
      setPending(false);
      setMessages(current => [...current, { id: `assistant-${id}`, role: "assistant", content: <StreamingResponse className={styles.reply} text={replies[text] ?? fallback} speed={22} controls={false} /> }]);
    }, 1100);
  };

  return (
    <div className={styles.frame}>
      <AiSidebar open={open} onOpenChange={setOpen} messages={messages} pending={pending} suggestions={suggestions} onSend={send} title="Assistant" subtitle="Reading: Usage-based billing plan" launcher={false}>
        <article className={styles.page}>
          <div className={styles.bar}>
            <span className={styles.crumb}>Projects / Billing</span>
            <Button size="sm" variant={open ? "secondary" : "primary"} onClick={() => setOpen(current => !current)} aria-expanded={open}>
              <Sparkles size={14} aria-hidden="true" />
              {open ? "Hide assistant" : "Ask assistant"}
            </Button>
          </div>
          <h1 className={styles.title}>Usage-based billing plan</h1>
          <p className={styles.lead}>Move every paid workspace from seat pricing to metered usage in eight weeks, without a surprise on anyone's first invoice.</p>
          <h2 className={styles.section}>Timeline</h2>
          <ul className={styles.timeline}>
            <li><span>Weeks 1 to 3</span>Metering: count events per workspace and store daily totals.</li>
            <li><span>Weeks 4 to 6</span>Invoices: new line items, proration and a preview page.</li>
            <li><span>Weeks 7 to 8</span>Rollout: ten percent of accounts first, then everyone.</li>
          </ul>
          <h2 className={styles.section}>Success measure</h2>
          <p className={styles.body}>Fewer than 2% of invoices need a manual correction during the first month after rollout.</p>
        </article>
      </AiSidebar>
    </div>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `AiSidebar`

An assistant panel docked beside the page. It slides in on a spring and pushes the page aside; in a narrow container it slides over the page behind a scrim instead. Inside: a header, a message list that follows new messages, suggestion chips and a prompt box that grows with the text. Enter sends, Shift+Enter adds a line, Escape closes.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactNode` | — | The page the assistant docks beside. |
| `messages` (obrigatória) | `AiSidebarMessage[]` | — | The conversation, oldest first. |
| `open` | `boolean` | — | Whether the panel is open (controlled). |
| `defaultOpen` | `boolean` | `false` | Whether the panel starts open (uncontrolled). |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the launcher, the close button or Escape opens or closes the panel. |
| `onSend` | `(text: string) => void` | — | Called with the trimmed text when the person sends a prompt or picks a suggestion. |
| `pending` | `boolean` | `false` | Shows the thinking indicator after the last message and holds the send button. |
| `suggestions` | `string[]` | — | Prompt ideas shown as chips above the prompt box. Picking one sends it. |
| `title` | `string` | `"Assistant"` | Heading of the panel. |
| `subtitle` | `string` | — | Short line under the heading, such as what the assistant can see. |
| `placeholder` | `string` | `"Ask anything"` | Placeholder of the prompt box. |
| `emptyText` | `string` | `"Ask about this page, or start from a suggest…` | Text shown while the conversation is empty. |
| `side` | `"left" \| "right"` | `"right"` | Side the panel docks on. |
| `width` | `number` | `360` | Width of the docked panel in pixels. |
| `overlayBelow` | `number` | `640` | Below this container width in pixels the panel slides over the page instead of pushing it aside. |
| `launcher` | `boolean` | `true` | Shows a floating button that opens the panel while it is closed. Turn it off when the page has its own trigger. |
| `className` | `string` | — | Class name added to the root element. |

### Tipos exportados

#### `AiSidebarMessage`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable id of the message. |
| `role` (obrigatória) | `"user" \| "assistant"` | Who wrote it. |
| `content` (obrigatória) | `ReactNode` | The message. Text, or any node (a streaming response, a card). |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` | Na caixa de prompt, envia o texto; durante a composição de um IME não envia. |
| `Shift + Enter` | Quebra a linha sem enviar. |
| `Esc` | Com o foco dentro do painel, fecha o painel. |
| `Enter` ou `Espaço` | Numa sugestão, envia o texto dela como prompt. |
| `Tab` | Percorre fechar, sugestões, caixa de prompt e enviar; com o painel fechado, nada dentro dele recebe foco. |

## Acessibilidade

- O painel é um `<aside>` rotulado pelo título; ao abrir, o foco vai para a caixa de prompt e, ao fechar, volta ao elemento que o tinha antes, se ele ainda existir (o `launcher` embutido sai do DOM ao abrir, então não o recebe de volta).
- A lista de mensagens é `aria-live="polite"` e cada mensagem leva um prefixo só para leitor de tela; fechado, o painel fica `inert`, e aberto no modo sobreposto é a página atrás que fica `inert`.
- Rótulos como “Close”, “Send message”, “Conversation” e “Suggestions” estão fixos em inglês; `title`, `subtitle`, `placeholder` e `emptyText` são seus.

## Movimento

- Encaixado, o painel abre com uma mola na largura e empurra a página; sobreposto, desliza por cima dela com um véu que esmaece.
- Mensagens novas sobem com um leve ganho de escala, as sugestões entram em sequência quando o painel abre e a lista rola suave até o fim a cada mensagem.
- Com “reduzir movimento” ligado, painel, mensagens e sugestões trocam de estado na hora e a rolagem até o fim deixa de ser suave.

## Comportamento responsivo

- Um `ResizeObserver` mede o contêiner: abaixo de `overlayBelow` (640 px por padrão) o painel desliza sobre a página, com largura `min(100%, max(width, 320px))`.
- A caixa de prompt cresce com o texto até 132 px e depois rola por dentro; as sugestões ficam numa linha só, com rolagem horizontal.

## Desempenho

- São dois `ResizeObserver` por instância (contêiner e lista) e a lista não é virtualizada: conversas muito longas pesam no DOM.

## Notas para IA

- Envolva a página: `children` é o conteúdo ao lado do painel, e a raiz usa `height: 100%`, então o pai precisa ter altura definida.
- A conversa é sua: passe `messages` (`id`, `role`, `content`), acrescente a mensagem em `onSend` e ligue `pending` enquanto a resposta não chega; `content` aceita nós, como um `StreamingResponse`.
- Use `open` com `onOpenChange` e `launcher={false}` quando a página já tem o próprio botão; o item depende de `loading-states` para o indicador de `pending`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/ai-sidebar · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
