# Tool result

> Registro recolhível de uma chamada de ferramenta, com status, duração e a entrada e a saída formatadas.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/tool-result
- Descrição original (inglês): A collapsible record of a tool call that shows its status, a live or final duration, and formatted input and output that expand with a height spring.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tool-result.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tool-result.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tool-result.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tool-result.json`. Caminho do registro, relativo ao endereço do site: `r/tool-result.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/tool-result/tool-result.tsx`
  - `components/ryan-ui/tool-result/tool-result.module.css`
  - `components/ryan-ui/lib/use-copy-feedback.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/tool-result.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- A transcrição de um agente: cada chamada de ferramenta vira uma linha com estado, nome, resumo e duração, que abre para mostrar entrada e saída.
- Chamadas ainda em execução: um cronômetro conta ao vivo e a saída mostra linhas de espera até o resultado chegar.
- Depuração: objetos aparecem como JSON indentado e colorido, com um botão de copiar em cada bloco.

## Quando não usar

- Use [`tool-approval`](tool-approval.md) antes da chamada, quando a pessoa precisa permitir ou negar a execução.
- Use [`json-viewer`](json-viewer.md) para JSON grande ou aninhado, com árvore recolhível, busca e paginação.
- Use [`agent-activity`](agent-activity.md) para uma linha do tempo dos passos do agente, sem a entrada e a saída de cada chamada.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useEffect, useState } from "react";
import ToolResult from "@/components/ryan-ui/tool-result/tool-result";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

const docs = { matches: 2, results: [{ title: "Rate limits", path: "/docs/api/rate-limits", score: 0.94 }, { title: "Response headers", path: "/docs/api/headers", score: 0.81 }].map(item => `${item.title} (${item.path})`), cached: true };
const tests = { passed: 48, failed: 0, skipped: 2, durationMs: 3180, slowest: "checkout.spec.ts" };

export default function ToolResultDemo() {
  /** Bumped to run the test call again. */
  const [run, setRun] = useState(0);
  const [testing, setTesting] = useState(true);
  /** One record open at a time keeps the transcript compact, the way a long agent log would. */
  const [open, setOpen] = useState<string | null>("search");
  const bind = (id: string) => ({ open: open === id, onOpenChange: (next: boolean) => setOpen(next ? id : null) });

  useEffect(() => {
    setTesting(true);
    const timer = window.setTimeout(() => setTesting(false), 3200);
    return () => window.clearTimeout(timer);
  }, [run]);

  return (
    <Stack width={500} gap={3}>
      <ToolResult tool="search_docs" summary="rate limit headers" durationMs={420} input={{ query: "rate limit headers", limit: 2, includeDrafts: false }} output={docs} {...bind("search")} />
      <ToolResult key={run} tool="run_tests" summary="tests/checkout" status={testing ? "running" : "success"} durationMs={testing ? undefined : tests.durationMs} input={{ path: "tests/checkout", retries: 0 }} output={testing ? undefined : tests} {...bind("tests")} />
      <ToolResult tool="fetch_invoice" summary="inv_8841" status="error" durationMs={1840} input={{ id: "inv_8841" }} error="404 Not Found: no invoice with id inv_8841 in workspace acme." {...bind("invoice")} />
      <Row justify="space-between">
        <Button size="sm" variant="secondary" onClick={() => setRun(current => current + 1)}>Run tests again</Button>
        <Caption>{testing ? "run_tests is still running." : "Open a record to see its input and output."}</Caption>
      </Row>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ToolResult`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `tool` (obrigatória) | `string` | — | Name of the tool that was called. |
| `status` | `"running" \| "success" \| "error"` | `"success"` | Where the call stands. |
| `summary` | `string` | — | Short text after the name, usually the main argument. |
| `durationMs` | `number` | — | How long the call took, in milliseconds. While `status` is "running" and this is not set, a live timer counts from mount. |
| `input` | `unknown` | — | What the tool was called with. Objects are printed as highlighted JSON; strings are shown as they are. |
| `output` | `unknown` | — | What the tool returned. Same formatting as `input`. |
| `error` | `string` | — | Error message, shown in place of the output when `status` is "error". |
| `open` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Whether the record starts open when uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the header is pressed. |
| `className` | `string` | — | Extra class for the root element. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ToolResultStatus` | `"running" \| "success" \| "error"` |

### Outras exportações

- `formatDuration` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No cabeçalho, abre ou recolhe o registro. |
| `Tab` | Com o registro aberto, passa pelos botões de copiar e pelos blocos de código, que são focáveis; recolhido, nada do corpo recebe foco. |
| `↑` ou `↓` | Com o foco num bloco de código, rolam o conteúdo que passa de 15rem de altura (rolagem nativa). |

## Acessibilidade

- O cabeçalho é um `<button>` com `aria-expanded` e `aria-controls`; o nome dele inclui o estado (“Running”, “Succeeded”, “Failed”), a ferramenta, o resumo e a duração com “running for” ou “took”.
- Recolhido, o corpo continua montado, mas `inert`; cada botão de copiar tem `aria-label` próprio (“Copy input”, “Copy output”, “Copy error”).
- Enquanto roda, a saída é um esqueleto `role="status"` com o nome “Waiting for the result”; todos esses textos estão fixos em inglês.

## Movimento

- O estado troca de spinner para um selo que entra com um pequeno quique e um visto ou xis que se desenha; ao abrir, entrada e saída sobem em sequência.
- O corpo abre e fecha com uma mola na altura medida e cresce do mesmo jeito quando o resultado chega com o registro aberto.
- Com “reduzir movimento” ligado, spinner e esqueleto param, os ícones só esmaecem, as alturas trocam na hora e o cronômetro conta de segundo em segundo.

## Comportamento responsivo

- O nome da ferramenta ocupa no máximo 55% da linha e o resumo corta com reticências; nos blocos de código as linhas longas quebram, e acima de 15rem o bloco rola por dentro.

## Desempenho

- Cada registro tem um `ResizeObserver`; sem `durationMs`, o estado `running` liga também um `setInterval` de 100 ms (1 s com “reduzir movimento”), que renderiza o registro a cada tique.

## Notas para IA

- Ao terminar, mude `status` para `success` ou `error` e passe `durationMs` com `output` ou `error`: sem `durationMs`, a duração some quando o estado deixa de ser `running`.
- Objetos passados na entrada e na saída viram JSON indentado e colorido; strings aparecem como estão, então mande o objeto, não o texto já serializado.
- Começa recolhido; numa lista, controle `open` e `onOpenChange` para manter um registro aberto por vez, como faz o demo.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/tool-result · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
