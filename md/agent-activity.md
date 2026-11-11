# Agent activity

> Linha do tempo ao vivo do que o agente está fazendo: a etapa atual pulsa e as concluídas se recolhem num resumo.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/agent-activity
- Descrição original (inglês): A live timeline of an agent at work: the current step pulses and collects what it finds as chips, and finished steps fold into one summary row that opens again.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/agent-activity.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/agent-activity.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/agent-activity.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/agent-activity.json`. Caminho do registro, relativo ao endereço do site: `r/agent-activity.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/agent-activity/agent-activity.tsx`
  - `components/ryan-ui/agent-activity/agent-activity.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/agent-activity.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar ao vivo o que um agente faz numa tarefa longa: cada passo tem um tipo (`search`, `read`, `write`, `think`, `run`) que escolhe o ícone.
- Passos que coletam achados curtos, como arquivos, sites ou resultados: eles aparecem como chips, um a um, enquanto a lista `items` cresce.
- Execuções com muitos passos, em que os concluídos devem dobrar numa linha só, com contagem e tempo total, e abrir de novo sob demanda.

## Quando não usar

- Use [`todo-list`](todo-list.md) quando o plano inteiro é conhecido desde o início e basta marcar cada passo como pendente, em andamento ou concluído.
- Use [`tool-result`](tool-result.md) quando é preciso mostrar a entrada e a saída completas de cada chamada de ferramenta.
- Use [`loading-states`](loading-states.md) para uma espera curta, sem passos para listar.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { AgentActivity } from "@/components/ryan-ui/agent-activity/agent-activity";
import type { AgentStep } from "@/components/ryan-ui/agent-activity/agent-activity";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 600 };

/** Milliseconds between two things happening in the simulated run. */
const BEAT = 620;

const script: Omit<AgentStep, "status" | "duration">[] = [
  { id: "search", kind: "search", title: "Searching the codebase", detail: 'grep "rate limit" src/server', items: ["middleware.ts", "redis.ts", "billing.ts"] },
  { id: "read", kind: "read", title: "Reading 3 files", detail: "src/server", items: ["middleware.ts · 84 lines", "redis.ts · 31 lines", "billing.ts · 127 lines"] },
  { id: "plan", kind: "think", title: "Planning the change", detail: "Limits per plan, stored next to billing" },
  { id: "write", kind: "write", title: "Editing rate-limit.ts", detail: "+10 −6", items: ["rate-limit.ts", "rate-limit.test.ts"] },
  { id: "test", kind: "run", title: "Running the tests", detail: "vitest run src/server", items: ["14 passed"] },
];

/** Every step takes one beat to start, one per item it collects, and one to finish. */
const beatsOf = (step: (typeof script)[number]) => (step.items?.length ?? 0) + 2;
const totalBeats = script.reduce((sum, step) => sum + beatsOf(step), 0);

function stepsAt(beat: number): AgentStep[] {
  let start = 0;
  return script.map(step => {
    const length = beatsOf(step);
    const local = beat - start;
    start += length;
    if (local <= 0) return { ...step, status: "pending", items: undefined };
    if (local >= length) return { ...step, status: "done", duration: length * BEAT };
    return { ...step, status: "running", items: step.items?.slice(0, local - 1) };
  });
}

export default function AgentActivityDemo() {
  const [beat, setBeat] = useState(1);
  const [run, setRun] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setBeat(current => (current >= totalBeats ? current : current + 1)), BEAT);
    return () => window.clearInterval(timer);
  }, [run]);
  const steps = useMemo(() => stepsAt(beat), [beat]);
  const finished = beat >= totalBeats;

  return (
    <Stack width={460} gap={3} style={{ minHeight: 520 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <Caption>{finished ? "Open the summary row to read the finished steps." : "Finished steps fold into the summary row."}</Caption>
        <Button size="sm" variant="secondary" style={{ flex: "none" }} onClick={() => { setBeat(1); setRun(current => current + 1); }}>
          <RotateCcw size={14} aria-hidden="true" />
          Run again
        </Button>
      </div>
      <AgentActivity key={run} title="Add rate limits per plan" steps={steps} />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `AgentActivity`

A live timeline of what an agent is doing. The step in progress pulses and collects what it finds as chips; a step that finishes leaves the live list and folds into one summary row that counts steps and time, which opens to show them again.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `steps` (obrigatória) | `AgentStep[]` | — | The steps in order. Update their status as the agent works. |
| `title` | `string` | `"Agent activity"` | Heading of the timeline: usually the task the agent was given. |
| `expanded` | `boolean` | — | Whether the finished steps are shown in full (controlled). |
| `defaultExpanded` | `boolean` | `false` | Whether the finished steps start shown in full (uncontrolled). By default they fold into one summary row. |
| `onExpandedChange` | `(expanded: boolean) => void` | — | Called when the summary row opens or closes the finished steps. |
| `className` | `string` | — | Class name added to the root element. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `AgentStepKind` | `"search" \| "read" \| "write" \| "think" \| "run"` |
| `AgentStepStatus` | `"pending" \| "running" \| "done" \| "error"` |

#### `AgentStep`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable id of the step. |
| `kind` (obrigatória) | `"search" \| "read" \| "write" \| "think" \| "run"` | What kind of work the step is; it picks the icon. |
| `title` (obrigatória) | `string` | What the agent is doing, in a few words: "Searching the codebase". |
| `detail` | `string` | One line of detail: the query, the file, the command. |
| `items` | `string[]` | Short things the step found or touched (file names, sites, results). They appear as chips, one by one as the list grows. |
| `status` (obrigatória) | `"pending" \| "running" \| "done" \| "error"` | Where the step is. |
| `duration` | `number` | How long the step took, in milliseconds. Shown once it has finished. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Com o foco na linha de resumo, abre ou fecha a lista de passos concluídos. |
| `Tab` | Leva o foco à linha de resumo, o único controle do componente; ela só existe depois que o primeiro passo termina. |

## Acessibilidade

- A raiz é uma `<section>` com `aria-label` igual a `title`; o resumo é um `<button>` com `aria-expanded` e `aria-controls`, e a lista recolhida fica `inert`.
- Uma região `role="status"` invisível anuncia o título do passo em andamento e, no fim, quantos passos terminaram; passos pendentes e com erro levam um sufixo só para leitor de tela.
- Os textos fixos (“steps finished”, “Done”, “(waiting)”, “(failed)”) estão em inglês no código e não têm prop de tradução.

## Movimento

- No passo em andamento, um anel pulsa em volta do ícone e um brilho corre pelo título; os chips entram um a um com uma mola curta, sem ultrapassagem.
- Ao terminar, o passo sai da lista ao vivo e dobra para a linha de resumo com uma mola de altura, enquanto o número de concluídos rola para o novo valor.
- Com “reduzir movimento” ligado, pulso, brilho e giro param, as alturas trocam na hora e os chips aparecem sem animação.

## Comportamento responsivo

- Ocupa 100% da largura do pai: o cabeçalho e o `detail` de cada passo cortam com reticências numa linha, enquanto o título do passo e os chips quebram linha.

## Notas para IA

- É controlado pelos dados: passe `steps` com `id` estável e atualize `status` (`pending`, `running`, `done`, `error`), `items` e `duration` enquanto o agente trabalha; o componente não mede o tempo sozinho.
- Cada texto de `items` serve de `key` do chip: não repita o mesmo texto dentro de um passo.
- Os concluídos começam recolhidos; use `defaultExpanded` ou o par `expanded` e `onExpandedChange` para abri-los, por exemplo quando um passo termina com `error`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/agent-activity · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
