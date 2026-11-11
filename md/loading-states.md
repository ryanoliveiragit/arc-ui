# Loading states

> Indicadores de que a IA está pensando: texto cintilante, pontinhos que saltam, frases que se alternam e contador de etapas.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/loading-states
- Descrição original (inglês): Thinking indicators for AI interfaces: shimmering text, bouncing dots, a rotating status phrase beside an orbiting mark, and a step counter with rolling digits and pips.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/loading-states.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/loading-states.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/loading-states.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/loading-states.json`. Caminho do registro, relativo ao endereço do site: `r/loading-states.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/loading-states/loading-states.tsx`
  - `components/ryan-ui/loading-states/loading-states.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/loading-states.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- O intervalo em que a IA já recebeu o pedido e ainda não tem nada para mostrar.
- `ThinkingDots` dentro de uma bolha de chat e `ThinkingShimmer` em linha, no ponto em que a resposta vai começar.
- Esperas mais longas: `ThinkingPhrases` alterna frases de status e `ThinkingSteps` mostra “Step 2 of 5” quando o número de passos é conhecido.

## Quando não usar

- Use [`loader`](loader.md) para carregamento genérico fora de conversas de IA: spinner, pontos, barras, anel e órbita em três tamanhos.
- Use [`skeleton`](skeleton.md) quando dá para reservar o formato do conteúdo que vai chegar.
- Use [`todo-list`](todo-list.md) ou [`agent-activity`](agent-activity.md) quando cada passo do agente precisa aparecer com nome e estado.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ThinkingDots, ThinkingPhrases, ThinkingShimmer, ThinkingSteps } from "@/components/ryan-ui/loading-states/loading-states";
import { Caption } from "./_kit";
import styles from "./loading-states.module.css";

const plan = ["Reading the brief", "Searching 12 sources", "Comparing prices", "Drafting the summary", "Checking the numbers"];

function Panel({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className={styles.panel}>
      <div className={styles.stage}>{children}</div>
      <Caption>{name}</Caption>
    </div>
  );
}

export default function LoadingStatesDemo() {
  const [step, setStep] = useState(1);
  useEffect(() => {
    const timer = window.setInterval(() => setStep(current => (current % plan.length) + 1), 1900);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className={styles.grid}>
      <Panel name="Shimmer: a reply is about to start">
        <ThinkingShimmer />
      </Panel>
      <Panel name="Dots: someone is typing">
        <span className={styles.bubble}><ThinkingDots /></span>
      </Panel>
      <Panel name="Phrases: a longer wait">
        <ThinkingPhrases phrases={["Thinking", "Reading your files", "Comparing three approaches", "Writing the answer"]} interval={2000} />
      </Panel>
      <Panel name="Steps: a plan with a known length">
        <ThinkingSteps className={styles.fill} current={step} total={plan.length} label={plan[step - 1]} />
      </Panel>
    </div>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ThinkingShimmer`

"Thinking…" with a sheen that sweeps across the letters. The quietest indicator: use it inline, where a reply is about to start.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | `"Thinking…"` | The text the sheen runs across. |
| `duration` | `number` | `1.7` | Seconds one pass of the sheen takes. |
| `className` | `string` | — | Class name added to the root element. |

### `ThinkingDots`

Three dots that bounce in a wave, the classic "someone is typing" signal.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | `"Thinking"` | Accessible name of the indicator; also shown next to the dots when `showLabel` is set. |
| `showLabel` | `boolean` | `false` | Shows the label as text after the dots. |
| `className` | `string` | — | Class name added to the root element. |

### `ThinkingPhrases`

A status phrase that changes every few seconds beside a small orbiting mark, for waits long enough that one word would feel stuck.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `phrases` | `string[]` | `defaultPhrases` | Status phrases to rotate through, in order. |
| `interval` | `number` | `2200` | Milliseconds each phrase stays. |
| `className` | `string` | — | Class name added to the root element. |

### `ThinkingSteps`

"Step 2 of 5" with one pip per step: finished pips fill, the current one breathes, and the number rolls when the step changes.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `current` (obrigatória) | `number` | — | The step in progress, counted from 1. |
| `total` (obrigatória) | `number` | — | How many steps there are. |
| `label` | `string` | — | What the current step is doing. |
| `className` | `string` | — | Class name added to the root element. |

### `LoadingStates`

Indicators for the moments an AI is working and has nothing to show yet. One component with four variants; each variant is also exported on its own (`ThinkingShimmer`, `ThinkingDots`, `ThinkingPhrases`, `ThinkingSteps`).

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `"shimmer" \| "dots" \| "phrases" \| "steps"` | `"shimmer"` | Which indicator to show. |
| `label` | `string` | — | Text of the shimmer, name of the dots, or description of the current step. |
| `phrases` | `string[]` | — | Phrases for the "phrases" variant. |
| `interval` | `number` | — | Milliseconds each phrase stays, for the "phrases" variant. |
| `current` | `number` | `1` | Current step, counted from 1, for the "steps" variant. |
| `total` | `number` | `4` | Number of steps, for the "steps" variant. |
| `className` | `string` | — | Class name added to the root element. |

## Acessibilidade

- Cada indicador é um `role="status"`; nos pontos e nos passos o desenho fica `aria-hidden`, e o nome acessível é o `label` ou “Step N of M” seguido do `label`.
- Em `ThinkingPhrases` a frase fica dentro do `role="status"`, então cada troca é uma atualização da região viva: prefira frases curtas e um `interval` folgado.
- Os textos padrão (“Thinking…”, as quatro frases, “Step … of …”) estão em inglês: `label` e `phrases` são traduzíveis, o “Step N of M” não.

## Movimento

- Um brilho varre as letras (`ThinkingShimmer`), três pontos sobem em onda (`ThinkingDots`), um ponto orbita um anel ao lado da frase (`ThinkingPhrases`) e o pip do passo atual pulsa (`ThinkingSteps`).
- Frases, número do passo e rótulo trocam subindo de um desfoque leve e saindo para cima; os pips enchem com uma mola sem ultrapassagem.
- Com “reduzir movimento” ligado, cada indicador vira um estado parado e legível: texto sem brilho, pontos e órbita imóveis, e trocas de texto imediatas.

## Comportamento responsivo

- As frases e o rótulo do passo ficam numa linha e cortam com reticências; `ThinkingSteps` mostra um pip por passo até 8 passos e, acima disso, uma barra única.

## Desempenho

- Só `ThinkingPhrases` usa timer (um `setInterval`, com mínimo de 600 ms); os outros indicadores são animações CSS.

## Notas para IA

- Importe a variante direto (`ThinkingShimmer`, `ThinkingDots`, `ThinkingPhrases`, `ThinkingSteps`) ou use `LoadingStates` com `variant`; `showLabel` e `duration` só existem nos componentes individuais.
- `ThinkingSteps` é controlado: passe `current` (a partir de 1) e `total`, e troque `label` a cada passo; valores fora da faixa são ajustados para o intervalo válido.
- Monte o indicador só enquanto espera e troque-o pelo conteúdo quando a resposta começar; `ai-sidebar` e `chat-app` já dependem deste item.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/loading-states · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
