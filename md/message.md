# Message

> Mensagem completa do assistente, com avatar, nome, texto formatado e ações de copiar, refazer e avaliar ao passar o mouse.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/message
- Descrição original (inglês): A full assistant message row with avatar, name and formatted content that staggers in, plus a copy, retry and rate bar that steps in on hover or focus.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/message.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/message.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/message.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/message.json`. Caminho do registro, relativo ao endereço do site: `r/message.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/message/message.tsx`
  - `components/ryan-ui/message/message.module.css`
  - `components/ryan-ui/lib/use-copy-feedback.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/message.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- A resposta do assistente numa conversa em que ele não usa bolha: avatar, nome, texto formatado e ações embaixo.
- Respostas com listas, títulos, código, negrito e links: `content` aceita um subconjunto pequeno de Markdown.
- Quando cada resposta precisa de copiar, tentar de novo e avaliar com polegar para cima ou para baixo.

## Quando não usar

- Use [`message-bubble`](message-bubble.md) para as mensagens da pessoa e para conversas em estilo de bolhas.
- Use [`streaming-response`](streaming-response.md) enquanto o texto ainda está chegando palavra por palavra.
- Use [`chat-thread`](chat-thread.md) ou [`comment-thread`](comment-thread.md) para conversas entre pessoas, com reações, respostas e confirmação de leitura.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import Message from "@/components/ryan-ui/message/message";
import type { MessageRating } from "@/components/ryan-ui/message/message";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

const answers = [
  `The deploy failed because the build ran out of memory while bundling the dashboard. Nothing is wrong with your code.

Here is what I would do:

1. Raise the limit with \`NODE_OPTIONS=--max-old-space-size=4096\` in the build settings.
2. Split the charts page with \`import()\` so it stops loading in the main bundle.
3. Run the build again and compare the **bundle report** with last week's.

The second step also cuts about 180 kB from the first load, so it is worth doing even if the first one fixes the build.`,
  `Short version: the bundler hit the 2 GB memory ceiling. Two changes fix it.

- Set \`NODE_OPTIONS=--max-old-space-size=4096\` for the build step.
- Load the charts page lazily with \`import()\`.

After that, the **bundle report** should show the dashboard chunk under 400 kB.`,
];
const feedback: Record<string, string> = { up: "Thanks, marked as a good answer.", down: "Noted, marked as a bad answer." };

export default function MessageDemo() {
  const [version, setVersion] = useState(0);
  const [rating, setRating] = useState<MessageRating>(null);
  const [note, setNote] = useState("Hover the message, or tab into it, to reach the actions.");
  return (
    <Stack width={560} gap={5}>
      <Message
        key={version}
        name="Atlas"
        meta={version === 0 ? "Answered in 4 s" : `Version ${version + 1}`}
        content={answers[version % answers.length]}
        rating={rating}
        onRatingChange={next => { setRating(next); setNote(next ? feedback[next]! : "Rating cleared."); }}
        onCopy={text => setNote(`Copied ${text.length} characters to the clipboard.`)}
        onRetry={() => { setVersion(current => current + 1); setRating(null); setNote("Wrote another version of the answer."); }}
      />
      <Caption>{note}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Message`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `name` | `string` | `"Assistant"` | Sender name shown next to the avatar. |
| `avatarSrc` | `string` | — | Image URL for the avatar. Without it (and without `avatar`) a spark mark on the accent is shown. |
| `avatar` | `ReactNode` | — | Custom avatar element, for a logo or initials. Wins over `avatarSrc`. |
| `meta` | `string` | — | Small note after the name, such as the model or the time. |
| `content` | `string` | `""` | Message text in the small Markdown subset described above. |
| `children` | `ReactNode` | — | Custom content. When given, `content` is only used as the text to copy. |
| `actions` | `"hover" \| "always" \| "none"` | `"hover"` | When the action bar shows: on hover or focus, always, or never. Touch screens always show it. |
| `onCopy` | `(text: string) => void` | — | Called after the message text was copied. |
| `onRetry` | `() => void` | — | Called when the person asks for another answer. The retry button is hidden without it. |
| `rating` | `"up" \| "down" \| null` | — | Controlled rating. |
| `defaultRating` | `"up" \| "down" \| null` | `null` | Rating the message starts with when uncontrolled. |
| `onRatingChange` | `(rating: MessageRating) => void` | — | Called when the person rates the answer or clears the rating. The rating buttons are hidden when neither this nor a rating prop is given. |
| `animateIn` | `boolean` | `true` | Staggers the content blocks in when the message mounts. Turn it off for history. |
| `className` | `string` | — | Extra class for the root element. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `MessageRating` | `"up" \| "down" \| null` |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Passa pelos links, pelos blocos de código (focáveis para rolar) e por cada botão de ação; o foco dentro da linha faz a barra aparecer. |
| `Enter` ou `Espaço` | Aciona a ação em foco: copiar, tentar de novo ou avaliar; repetir a mesma avaliação a limpa. |
| `←` ou `→` | Com o foco num bloco de código largo, rolam o código na horizontal (rolagem nativa). |

## Acessibilidade

- A raiz é um `<article>` com `aria-label` “Message from” mais o `name`; o avatar fica `aria-hidden`.
- A barra é um `role="toolbar"` em que cada botão tem `aria-label`; os de avaliação usam `aria-pressed`, e uma região `role="status"` anuncia “Message copied”.
- Em telas de toque a barra fica sempre visível; com mouse ela aparece no hover ou quando o foco entra na linha, e uma avaliação já dada continua à mostra.

## Movimento

- Ao montar, os blocos do conteúdo entram em sequência, subindo de um desfoque leve; `animateIn={false}` desliga isso.
- Os botões da barra entram um após o outro, o ícone de copiar vira um visto, o de tentar de novo dá uma volta com uma mola e o polegar escolhido dá um pequeno salto.
- Com “reduzir movimento” ligado, os blocos só esmaecem, sem atraso entre eles, os ícones trocam com esmaecer e não há giro nem salto.

## Comportamento responsivo

- A grade tem a coluna do avatar e uma coluna flexível; textos longos quebram em qualquer ponto e os blocos de código rolam na horizontal em vez de alargar a página.

## Notas para IA

- Passe o texto em `content` (parágrafos, listas, títulos com `#`, blocos entre crases triplas, código em linha, `**negrito**` e links `http`, `https`, `mailto`, `/` ou `#`); tabelas e itálico saem como texto comum.
- O botão de tentar de novo só existe com `onRetry`, e os de avaliação só com `onRatingChange`, `defaultRating` ou `rating={…}` (vale `rating={null}`); `actions="always"` ou `"none"` fixa ou esconde a barra.
- Com `children`, você renderiza o conteúdo e `content` vira só o texto a copiar; em históricos longos, passe `animateIn={false}`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/message · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
