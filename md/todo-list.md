# Todo list

> Lista do plano de um agente: cada etapa passa de pendente para em andamento e concluída, com contagem de progresso.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/todo-list
- Descrição original (inglês): An agent plan checklist whose steps move from pending to running with a shimmer to done with a drawn check and strike-through, under a live progress count.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/todo-list.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/todo-list.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/todo-list.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/todo-list.json`. Caminho do registro, relativo ao endereço do site: `r/todo-list.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/todo-list/todo-list.tsx`
  - `components/ryan-ui/todo-list/todo-list.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/todo-list.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar o plano de um agente como uma lista em que cada passo avança de pendente para em andamento e depois para concluído.
- Planos de tamanho conhecido, em que vale mostrar “2 of 5” e uma barra de progresso no cabeçalho.
- Transcrições compactas: recolhida, a lista vira uma linha que ainda mostra o passo em andamento.

## Quando não usar

- Use [`agent-activity`](agent-activity.md) quando os passos surgem durante o trabalho, coletam achados em chips ou precisam de duração e de estado de erro.
- Use [`stepper`](stepper.md) para mostrar em que etapa de um fluxo a própria pessoa está.
- Use [`onboarding-checklist`](onboarding-checklist.md) quando é a pessoa quem marca as tarefas; aqui os passos não são clicáveis.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useEffect, useState } from "react";
import TodoList from "@/components/ryan-ui/todo-list/todo-list";
import type { TodoItem } from "@/components/ryan-ui/todo-list/todo-list";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const plan = [
  { id: "repro", label: "Reproduce the failing checkout test", detail: "Ran checkout.spec.ts 20 times: 3 failures", time: 1500 },
  { id: "read", label: "Read the payment mock and its timers", detail: "Reading tests/mocks/payment.ts", time: 1900 },
  { id: "fix", label: "Replace the fixed delay with an awaited event", detail: "Editing 2 files", time: 2200 },
  { id: "verify", label: "Run the checkout suite 50 times", detail: "Run 31 of 50, no failures so far", time: 2600 },
  { id: "pr", label: "Open a pull request with the fix", detail: "Writing the description", time: 1600 },
];

export default function TodoListDemo() {
  /** Index of the step in progress; `plan.length` means every step is done. */
  const [step, setStep] = useState(1);
  const [paused, setPaused] = useState(false);
  const finished = step >= plan.length;

  useEffect(() => {
    if (paused || finished) return;
    const timer = window.setTimeout(() => setStep(current => current + 1), plan[step]!.time);
    return () => window.clearTimeout(timer);
  }, [finished, paused, step]);

  const items: TodoItem[] = plan.map((item, index) => ({ id: item.id, label: item.label, detail: item.detail, status: index < step ? "done" : index === step ? "running" : "pending" }));

  return (
    <Stack width={440} gap={4}>
      <TodoList title="Fix the flaky checkout test" items={items} />
      <Row justify="space-between">
        <Row gap={2}>
          <Button size="sm" variant="secondary" onClick={() => { setStep(0); setPaused(false); }}>Run again</Button>
          <Button size="sm" variant="ghost" disabled={finished} onClick={() => setPaused(current => !current)}>{paused ? "Resume" : "Pause"}</Button>
        </Row>
        <Caption>{finished ? "Plan complete." : paused ? "Paused." : "The agent is working…"}</Caption>
      </Row>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `TodoList`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` (obrigatória) | `TodoItem[]` | — | The steps, in order. Change an item's `status` to move it along. |
| `title` | `string` | `"Plan"` | Heading of the list. |
| `showProgress` | `boolean` | `true` | Shows the "2 of 5" count and the progress bar. |
| `open` | `boolean` | — | Controlled open state of the list. |
| `defaultOpen` | `boolean` | `true` | Whether the list starts open when uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the header is pressed. |
| `className` | `string` | — | Extra class for the root element. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `TodoStatus` | `"pending" \| "running" \| "done"` |

#### `TodoItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable id, used as the key. |
| `label` (obrigatória) | `string` | What the step does. |
| `status` (obrigatória) | `"pending" \| "running" \| "done"` | Where the step stands. |
| `detail` | `string` | A line shown under the label while the step runs, such as the file being read. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No cabeçalho, recolhe ou abre a lista; é o único controle do componente. |

## Acessibilidade

- O cabeçalho é um `<button>` com `aria-expanded` e `aria-controls`; recolhido, ele mostra o passo em andamento, então o nome do botão continua dizendo o que está acontecendo.
- A contagem é uma região `aria-live="polite"` que lê “N of M steps done”, e a barra é um `role="progressbar"` com `aria-valuenow` igual aos concluídos e `aria-valuemax` igual ao total.
- Cada passo começa com o estado só para leitor de tela (“To do:”, “In progress:”, “Done:”); esses textos, “All steps done” e a palavra “progress” no rótulo da barra estão fixos em inglês.

## Movimento

- O passo em andamento ganha um spinner e um brilho que corre pelo rótulo; ao concluir, o visto pousa com um pequeno quique e se desenha, e um risco atravessa o rótulo da esquerda para a direita.
- Na montagem os passos sobem em sequência; passos acrescentados depois abrem a própria altura, a barra avança com uma mola e o número de concluídos rola.
- Com “reduzir movimento” ligado, tudo só esmaece: o spinner fica parado, não há brilho nem desenho do visto, e o risco aparece de uma vez.

## Comportamento responsivo

- Ocupa 100% do pai; recolhido, o passo atual no cabeçalho corta com reticências numa linha, e aberto os rótulos dos passos quebram linha.

## Notas para IA

- É controlado pelos dados: passe `items` com `id` estável e mude o `status` de cada um (`pending`, `running`, `done`); não há estado de erro nem duração.
- `detail` só aparece enquanto o passo está `running`: use-o para o arquivo ou o comando daquele momento.
- Começa aberta; use `defaultOpen={false}` ou o par `open` e `onOpenChange` para recolher, e `showProgress={false}` para tirar a contagem e a barra.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/todo-list · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
