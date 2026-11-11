# Stepper

> Indicador de etapas de um fluxo, com estados de concluída, atual, pendente e com erro.

- Tipo: componente (categoria Feedback)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/stepper
- Descrição original (inglês): Show where a person is in a multi-step flow and what is done.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/stepper.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/stepper.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/stepper.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/stepper.json`. Caminho do registro, relativo ao endereço do site: `r/stepper.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/stepper/stepper.tsx`
  - `components/ryan-ui/stepper/stepper.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/stepper.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar em que etapa de um checkout, cadastro ou configuração a pessoa está, acima do conteúdo (`horizontal`) ou ao lado dele (`vertical`).
- Fluxos em que dá para voltar a uma etapa já feita: com `onStepSelect`, os passos concluídos viram botões.
- Sinalizar uma etapa que falhou, como um cartão recusado: `error` troca o número por um alerta e a mensagem toma o lugar da descrição.

## Quando não usar

- Use [`onboarding-checklist`](onboarding-checklist.md) quando os passos podem ser feitos em qualquer ordem e marcados à mão.
- Use [`tabs`](tabs.md) quando as seções são independentes e a pessoa pode ir e voltar entre elas livremente.
- Use [`adaptive-stepper`](adaptive-stepper.md) para escolher um número com botões de menos e mais; apesar do nome parecido, este item indica etapas.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Stepper } from "@/components/ryan-ui/stepper/stepper";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack } from "./_kit";

const steps = [
  { id: "cart", label: "Cart", description: "3 items" },
  { id: "shipping", label: "Shipping", description: "Lisbon, PT" },
  { id: "payment", label: "Payment", description: "Visa 4242" },
  { id: "review", label: "Review", description: "Confirm order" },
];

export default function StepperDemo() {
  const [current, setCurrent] = useState(1);
  const [failed, setFailed] = useState(false);
  const shown = failed ? steps.map(s => (s.id === "payment" ? { ...s, error: "Card declined" } : s)) : steps;
  return (
    <Stack gap={6} width={560}>
      <Stepper steps={shown} current={current} onStepSelect={setCurrent} label="Checkout" completeLabel="Order placed" />
      <Row>
        <Button size="sm" variant="secondary" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>Back</Button>
        <Button size="sm" disabled={current >= steps.length} onClick={() => setCurrent(c => c + 1)}>{current === steps.length - 1 ? "Place order" : "Continue"}</Button>
        <Button size="sm" variant="ghost" onClick={() => setFailed(f => !f)}>{failed ? "Clear error" : "Fail payment"}</Button>
      </Row>
      <Caption>Click a finished step to go back to it.</Caption>
      <Stack gap={2} width={260}>
        <Stepper steps={steps.slice(0, 3)} current={1} orientation="vertical" label="Vertical example" />
      </Stack>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Stepper`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `steps` (obrigatória) | `StepperStep[]` | — | — |
| `current` (obrigatória) | `number` | — | Index of the step in progress. `steps.length` marks the whole flow complete. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | — |
| `onStepSelect` | `(index: number) => void` | — | Called with the index of a completed step when it is chosen. Without it the stepper is a read-only indicator. |
| `details` | `"all" \| "current"` | `"all"` | `current` shows only the active step's description, for tight spaces. Errors always show. |
| `compact` | `boolean` | `false` | Markers only; labels stay available to assistive tech. Horizontal steppers switch to this below 30rem on their own and show the current step's label underneath. |
| `label` | `string` | `"Progress"` | Accessible name for the stepper. |
| `completeLabel` | `string` | `"All steps complete"` | Announced, and shown in the compact caption, once every step is complete. |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `StepperOrientation` | `"horizontal" \| "vertical"` |
| `StepperStatus` | `"complete" \| "current" \| "upcoming" \| "error"` |

#### `StepperStep`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable key, so each step keeps its own motion when the list changes. |
| `label` (obrigatória) | `string` | — |
| `description` | `string` | A short hint under the label. |
| `error` | `string` | Marks the step as failed: the marker morphs into an alert and this message replaces the description. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` ou `↑` ou `↓` | Com `onStepSelect`, movem o foco entre os passos concluídos e o atual, sem dar a volta; em texto da direita para a esquerda, ← e → se invertem. |
| `Home` ou `End` | Vai para o primeiro passo ou para o passo atual. |
| `Enter` ou `Espaço` | Num passo concluído, chama `onStepSelect` com o índice dele. |

## Acessibilidade

- Sem `onStepSelect` é um `role="group"` só de leitura; com ele vira `<nav>` de botões. O passo atual tem `aria-current="step"` e cada passo tem o estado em texto oculto (“Completed”, “Error”).
- Uma região `aria-live="polite"` anuncia “Step N of M: rótulo” a cada mudança de `current`, e `completeLabel` no fim; esses textos fixos estão em inglês.
- Só os passos concluídos entram na ordem do `Tab`; o atual e os futuros têm `aria-disabled`, e as setas também chegam ao atual.

## Movimento

- Ao avançar, a linha entre os passos se preenche com uma mola a partir do passo que terminou; pular vários passos preenche uma linha depois da outra, e o anel do passo atual aparece por último.
- O número de um passo concluído encolhe e dá lugar a um visto desenhado (num erro, a um ponto de exclamação); descrições novas sobem com leve desfoque e a altura acompanha.
- Com “reduzir movimento”, linhas, marcadores e textos mudam na hora.

## Comportamento responsivo

- O horizontal mede a própria largura (container query): abaixo de 30 rem esconde os rótulos, mantém os marcadores e mostra embaixo o rótulo e a descrição do passo atual; `compact` força esse modo.
- Com `details="current"`, só o passo atual mostra a descrição, o que economiza altura; erros aparecem sempre.

## Notas para IA

- Importe de `@/components/ryan-ui/stepper/stepper`. É controlado por `current`, o índice da etapa em andamento; use `current={steps.length}` para marcar o fluxo inteiro como concluído.
- O stepper só indica: o conteúdo de cada etapa e os botões de voltar e continuar ficam com você, mudando `current`.
- Para voltar a etapas feitas, passe `onStepSelect={setCurrent}`; só índices menores que `current` disparam. O erro vai no próprio passo, em `steps[i].error`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/stepper · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
