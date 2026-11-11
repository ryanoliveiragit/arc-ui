# Action swap

> Troca o rótulo de uma ação sem ela sair do lugar nem mudar de intenção.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/action-swap
- Descrição original (inglês): Swap an action label while preserving its place and intent.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/action-swap.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/action-swap.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/action-swap.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/action-swap.json`. Caminho do registro, relativo ao endereço do site: `r/action-swap.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/action-swap/action-swap.tsx`
  - `components/ryan-ui/action-swap/action-swap.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/action-swap.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Uma ação que percorre poucos estados relacionados no mesmo lugar, como Seguir, Seguindo e Deixar de seguir.
- Envios curtos com confirmação passageira: “Enviar fatura” vira “Enviando”, depois “Enviada”, e volta sozinho ao início com `holdFor`.
- Quando cada estado precisa de ícone e tom próprios (`neutral`, `accent`, `success`, `warning` ou `quiet`).

## Quando não usar

- Use [`action-button`](action-button.md) quando há uma única ação com pendente e concluído e você não quer descrever estados.
- Use [`split-button`](split-button.md) quando a pessoa escolhe entre alternativas: aqui cada clique só avança para o próximo estado da lista.
- Use [`switch`](switch.md) quando o controle representa uma configuração ligada ou desligada, e não uma ação.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Check, Mail, Send, Star, StarOff } from "lucide-react";
import ActionSwap from "@/components/ryan-ui/action-swap/action-swap";
import type { ActionSwapState } from "@/components/ryan-ui/action-swap/action-swap";
import { Caption, Row, Stack } from "./_kit";

const wait = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));

const sendStates: ActionSwapState[] = [
  { id: "idle", label: "Send invoice", icon: <Send size={15} aria-hidden="true" />, tone: "accent", pendingLabel: "Sending" },
  { id: "sent", label: "Sent", icon: <Check size={15} aria-hidden="true" />, tone: "success", holdFor: 2000 },
];
const followStates: ActionSwapState[] = [
  { id: "follow", label: "Follow", icon: <Star size={15} aria-hidden="true" />, tone: "neutral" },
  { id: "following", label: "Following", icon: <Star size={15} fill="currentColor" aria-hidden="true" />, tone: "quiet" },
  { id: "unfollow", label: "Unfollow", icon: <StarOff size={15} aria-hidden="true" />, tone: "warning" },
];

export default function ActionSwapDemo() {
  const [attempt, setAttempt] = useState(0);
  const [log, setLog] = useState("Nothing sent yet.");
  return (
    <Stack gap={6} align="center">
      <Row justify="center">
        <ActionSwap
          size="lg"
          states={sendStates}
          onAction={async () => { await wait(1300); setLog("Invoice #2041 sent to Acme Corp."); }}
        />
        <ActionSwap
          states={[
            { id: "idle", label: "Email report", icon: <Mail size={15} aria-hidden="true" />, pendingLabel: "Emailing" },
            { id: "sent", label: "Emailed", icon: <Check size={15} aria-hidden="true" />, tone: "success", holdFor: 1800 },
          ]}
          failureLabel="Try again"
          onAction={async () => { await wait(900); const next = attempt + 1; setAttempt(next); if (next % 2 === 1) throw new Error("fail"); }}
        />
      </Row>
      <Row justify="center">
        <ActionSwap size="sm" states={followStates} />
      </Row>
      <Caption>{log} The second button fails on its first try, then succeeds.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ActionSwap`

A compact action that morphs through a small set of related states: idle, working, done, and back. Width, padding, tone, icon, and letters move together on one spring, and every change can be interrupted mid-flight.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `states` (obrigatória) | `ActionSwapState[]` | — | — |
| `value` | `string` | — | — |
| `defaultValue` | `string` | — | — |
| `onValueChange` | `(value: string, state: ActionSwapState) => void` | — | — |
| `onAction` | `(next: ActionSwapState, current: ActionSwapState) => void \| PromiseLike<unknown>` | — | Runs on press before the control moves on. Return a promise to show the working phase; a rejection shows `failureLabel`, then returns to the current state. |
| `failureLabel` | `string` | `"Try again"` | — |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | — |
| `...props` | `ButtonHTMLAttributes<HTMLButtonElement>` | — | Também aceita as props deste tipo, menos `children`, `onChange`, `onClick`, `value`, `onDrag`, `onDragEnd`, `onDragStart` e `onAnimationStart`. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ActionSwapTone` | `"neutral" \| "accent" \| "success" \| "warning" \| "quiet"` |

#### `ActionSwapState`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `icon` | `ReactNode` | — |
| `tone` | `"neutral" \| "accent" \| "success" \| "warning" \| "quiet"` | — |
| `pendingLabel` | `string` | Shown while `onAction` runs on the way into this state, such as "Sending" before "Sent". Without it the pill folds into a round spinner. |
| `holdFor` | `number` | Milliseconds to hold this state before moving on by itself, for brief confirmations such as "Sent". |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Avançam para o próximo estado de `states` (depois do último, volta ao primeiro), chamando `onAction` antes. |

## Acessibilidade

- É um `<button>` cujo `aria-label` acompanha o rótulo visível; enquanto `onAction` roda, recebe `aria-busy` e `aria-disabled` e continua focável.
- Cada mudança é anunciada por um `role="status"` ao lado do botão: o novo `label`, o `pendingLabel` ou o `failureLabel`.
- Sem `pendingLabel` no estado de destino, o anúncio de espera é o texto fixo “Working”; defina `pendingLabel` e `failureLabel` (padrão “Try again”) no idioma da interface.

## Movimento

- As letras em comum no início e no fim do rótulo ficam paradas e as novas sobem de um leve desfoque, em sequência, enquanto a largura segue uma mola sem ultrapassagem.
- Sem `pendingLabel`, a pílula se dobra num círculo com indicador giratório enquanto a Promise roda (no mínimo 450 ms); uma falha mostra `failureLabel` por 1,8 s e volta ao estado atual.
- Com “reduzir movimento”, letras e ícones trocam com um esmaecer de 0,12 s, a largura salta e o indicador não gira.

## Comportamento responsivo

- Os rótulos não quebram linha e a pílula muda de largura a cada estado; mantenha cada `label` curto.

## Desempenho

- Cada letra do rótulo é um elemento animado e há um `ResizeObserver` por botão: serve a rótulos curtos, não a frases.

## Notas para IA

- Descreva os estados em `states` (`id`, `label`, `icon`, `tone`) na ordem do ciclo; com menos de dois estados o botão fica desabilitado.
- `onAction(next, current)` roda antes da troca: devolva uma Promise para mostrar a fase de espera e rejeite-a para exibir `failureLabel`.
- Controle o estado com `value` e `onValueChange` ou deixe-o interno com `defaultValue`; `holdFor` num estado faz o botão avançar sozinho depois desse tempo.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/action-swap · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
