# Streaming response

> Texto que chega palavra por palavra, com cursor e desfoque suave, e controles para pausar, pular e repetir.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/streaming-response
- Descrição original (inglês): Text that streams in word by word behind a caret, each word rising out of a soft blur, with pause, skip and replay controls; reduced motion shows the full text.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/streaming-response.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/streaming-response.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/streaming-response.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/streaming-response.json`. Caminho do registro, relativo ao endereço do site: `r/streaming-response.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/streaming-response/streaming-response.tsx`
  - `components/ryan-ui/streaming-response/streaming-response.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/streaming-response.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar a resposta de um modelo chegando palavra por palavra, com pausas naturais em vírgulas, fins de frase e entre parágrafos.
- Streams reais: se `text` cresce com o novo pedaço anexado ao final, a revelação continua de onde estava em vez de recomeçar.
- Demos e onboarding em que a pessoa pode pausar, pular para o fim ou repetir a resposta pela linha de status.

## Quando não usar

- Use [`message`](message.md) para respostas já prontas, com Markdown e ações de copiar, repetir e avaliar; aqui o texto é simples, dividido só em parágrafos.
- Use [`text-reveal`](text-reveal.md) para revelar um trecho curto de interface com movimento contido, sem cursor nem controles.
- Use [`loading-states`](loading-states.md) enquanto ainda não chegou nenhuma palavra.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { StreamingResponse } from "@/components/ryan-ui/streaming-response/streaming-response";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./streaming-response.module.css";

export const stage: DemoStage = { height: 560 };

const answer = `Start by replacing fixed durations with springs. A spring has no set length: it reacts to where the element is and how fast it is already moving, so an interrupted animation carries on smoothly instead of snapping back to the start.

Next, give related elements a small stagger. Thirty to forty milliseconds between list rows is enough for the eye to read an order without the interface feeling slow.

Finally, keep exits shorter than entrances. People wait for what is arriving and rarely for what is leaving, so a quick fade out keeps the whole screen feeling responsive.`;

const speeds = { calm: 8, natural: 16, fast: 42 } as const;
type Pace = keyof typeof speeds;

export default function StreamingResponseDemo() {
  const [pace, setPace] = useState<Pace>("natural");
  return (
    <Stack width={560} gap={3}>
      <Surface padding={6} style={{ minHeight: 372, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>How do I make my animations feel less robotic?</p>
        <StreamingResponse className={styles.fill} text={answer} speed={speeds[pace]} />
      </Surface>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <SegmentedControl
          label="Pace"
          value={pace}
          onValueChange={value => setPace(value as Pace)}
          options={[{ value: "calm", label: "Calm" }, { value: "natural", label: "Natural" }, { value: "fast", label: "Fast" }]}
        />
        <Caption>{speeds[pace]} words per second. The pace changes mid-stream.</Caption>
      </div>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `StreamingResponse`

Text that arrives word by word, the way a model response does: each word fades up out of a soft blur behind a caret, the pace breathes at punctuation, and the caret leaves when the text settles. The status line can pause, skip to the end or replay. With reduced motion the whole text is shown at once.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `text` (obrigatória) | `string` | — | The text to stream. Blank lines split it into paragraphs. If the text grows (a real stream appending to it), the reveal carries on from where it is; any other change starts over. |
| `speed` | `number` | `16` | Words revealed per second. Sentence ends and commas add a short natural pause. |
| `playing` | `boolean` | — | Whether the stream is running (controlled). Set it to false to hold the text where it is. |
| `defaultPlaying` | `boolean` | `true` | Whether the stream starts running on mount (uncontrolled). |
| `onPlayingChange` | `(playing: boolean) => void` | — | Called when the built-in controls pause, resume or replay the stream. |
| `instant` | `boolean` | `false` | Shows the whole text at once with no stream, for a response that had already finished. |
| `controls` | `boolean` | `true` | Shows the status line with the progress, pause, skip and replay controls. |
| `caret` | `boolean` | `true` | Shows the caret while text is arriving. |
| `onProgress` | `(shown: number, total: number) => void` | — | Called as words appear, with the number of words shown and the total. |
| `onComplete` | `() => void` | — | Called once per run when the last word has appeared. |
| `className` | `string` | — | Class name added to the root element. |

### Outras exportações

- `takeWords` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Nos controles da linha de status, pausa ou retoma, pula para o fim ou repete; pausar e pular ficam desativados quando o texto termina. |

## Acessibilidade

- As palavras animadas ficam `aria-hidden`; uma cópia oculta tem o texto inteiro desde o início, então o leitor de tela lê a resposta completa, não uma palavra por vez.
- A linha de status é um `role="status"` com “Streaming”, “Paused” ou “Complete” e, no fim, o total de palavras; os botões só de ícone têm `aria-label` e `title` fixos em inglês.
- Com `controls={false}` não há linha de status: nada anuncia que a resposta terminou, então avise de outro jeito se isso importar.

## Movimento

- Cada palavra sobe de um desfoque suave atrás de um cursor; o ritmo desacelera em vírgulas, fins de frase e entre parágrafos.
- O cursor respira de leve enquanto as palavras chegam, pisca na pausa e some ao terminar; uma barra fina acima da linha de status mostra o progresso.
- Com “reduzir movimento” ligado, o texto inteiro aparece de uma vez e os botões de pausar, pular e repetir somem; a linha de status mostra “Complete”.

## Comportamento responsivo

- Num contêiner esticado em coluna, a linha de status fica no fundo enquanto o texto cresce acima dela, e quebra em duas linhas quando falta largura.

## Desempenho

- Cada palavra é um `<span>` e cada passo é um `setTimeout` seguido de nova renderização; para respostas longas que já terminaram, passe `instant`.

## Notas para IA

- Num stream real, passe o texto acumulado em `text`: anexar ao final continua a revelação, mas qualquer outra mudança recomeça do zero; quebras de linha simples viram espaço.
- `onComplete` dispara uma vez por execução, assim que todas as palavras já recebidas aparecem; se o stream demora entre pedaços, ele dispara antes do fim real, então use um sinal de fim seu.
- Ao parar um stream no meio, guarde só o que a pessoa viu com `takeWords(text, shown)`, usando o número que veio de `onProgress`; para histórico, use `instant`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/streaming-response · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
