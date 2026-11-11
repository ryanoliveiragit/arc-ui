# File diff

> Diff unificado de um arquivo, com números de linha, contagem de mudanças e trechos iguais que se abrem com um clique.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/file-diff
- Descrição original (inglês): A unified diff of one file with line numbers, tinted added and removed lines, header stats, and unchanged ranges that fold into a row and spring open.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-diff.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-diff.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-diff.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-diff.json`. Caminho do registro, relativo ao endereço do site: `r/file-diff.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/file-diff/file-diff.tsx`
  - `components/ryan-ui/file-diff/file-diff.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/file-diff.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar a alteração que um agente fez ou propõe num arquivo, a partir do texto de antes e de depois.
- Revisões em que importa ver o trecho exato que mudou dentro da linha e quantas linhas entraram e saíram.
- Arquivos novos, apagados ou renomeados: o cabeçalho ganha a etiqueta “New file”, “Deleted” ou “Renamed” e, no último caso, o caminho anterior.

## Quando não usar

- Use [`code-block`](code-block.md) para mostrar código sem comparação, com botão de copiar.
- Use [`image-compare`](image-compare.md) quando a diferença é visual, entre duas imagens.
- Para diff lado a lado, com cores de sintaxe ou de arquivos enormes, procure outra solução: aqui o diff é unificado, sem realce de sintaxe e calculado no navegador.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { FileDiff } from "@/components/ryan-ui/file-diff/file-diff";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 600 };

const rateLimitBefore = `import { redis } from "./redis";
import { logger } from "./logger";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 100;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

function keyFor(userId: string) {
  return \`rate:\${userId}\`;
}

/** Usage is tracked per user, in fixed one minute windows. */
export async function currentUsage(userId: string) {
  const raw = await redis.get(keyFor(userId));
  return raw ? Number(raw) : 0;
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const key = keyFor(userId);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  if (count > MAX_REQUESTS) {
    logger.warn("rate limit hit", { userId });
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: MAX_REQUESTS - count };
}

export async function resetRateLimit(userId: string) {
  await redis.del(keyFor(userId));
}

export async function resetMany(userIds: string[]) {
  if (userIds.length === 0) return;
  await redis.del(...userIds.map(keyFor));
  logger.info("rate limits cleared", { count: userIds.length });
}
`;

const rateLimitAfter = `import { redis } from "./redis";
import { logger } from "./logger";
import type { Plan } from "./billing";

const WINDOW_SECONDS = 60;
const LIMITS: Record<Plan, number> = { free: 60, pro: 600, team: 3000 };

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

function keyFor(userId: string) {
  return \`rate:\${userId}\`;
}

/** Usage is tracked per user, in fixed one minute windows. */
export async function currentUsage(userId: string) {
  const raw = await redis.get(keyFor(userId));
  return raw ? Number(raw) : 0;
}

export async function checkRateLimit(userId: string, plan: Plan = "free"): Promise<RateLimitResult> {
  const key = keyFor(userId);
  const limit = LIMITS[plan];
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  if (count > limit) {
    const retryAfter = await redis.ttl(key);
    logger.warn("rate limit hit", { userId, plan });
    return { allowed: false, remaining: 0, retryAfter };
  }
  return { allowed: true, remaining: limit - count };
}

export async function resetRateLimit(userId: string) {
  await redis.del(keyFor(userId));
}

export async function resetMany(userIds: string[]) {
  if (userIds.length === 0) return;
  await redis.del(...userIds.map(keyFor));
  logger.info("rate limits cleared", { count: userIds.length });
}
`;

const testAfter = `import { describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("uses the limit of the plan", async () => {
    await resetRateLimit("user_1");
    const result = await checkRateLimit("user_1", "pro");
    expect(result.remaining).toBe(599);
  });
});
`;

const files = {
  modified: { filename: "src/server/rate-limit.ts", before: rateLimitBefore, after: rateLimitAfter },
  added: { filename: "src/server/rate-limit.test.ts", before: "", after: testAfter },
} as const;

type FileKey = keyof typeof files;

export default function FileDiffDemo() {
  const [file, setFile] = useState<FileKey>("modified");
  return (
    <Stack width={680} gap={3}>
      <div style={{ alignSelf: "flex-start" }}>
        <SegmentedControl
          label="File"
          value={file}
          onValueChange={value => setFile(value as FileKey)}
          options={[{ value: "modified", label: "Modified file" }, { value: "added", label: "New file" }]}
        />
      </div>
      <FileDiff key={file} {...files[file]} maxHeight={428} />
      <Caption>Open a folded range to read the unchanged lines around a change. The header button shows or folds them all.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `FileDiff`

A unified diff of one file, computed from the text before and after. Changed lines carry line numbers, a sign and a tint; the part of a line that actually changed is marked. Long unchanged runs fold into one row that springs open, and the header counts additions and removals.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `filename` (obrigatória) | `string` | — | Path of the file, shown in the header. The last segment is emphasized. |
| `previousFilename` | `string` | — | Earlier path, when the change also renamed the file. |
| `before` (obrigatória) | `string` | — | Text of the file before the change. Empty for a new file. |
| `after` (obrigatória) | `string` | — | Text of the file after the change. Empty for a deleted file. |
| `context` | `number` | `3` | Unchanged lines kept visible around every change. Longer unchanged runs fold into one expandable row. |
| `maxHeight` | `number \| string` | — | Tallest the diff body grows before it scrolls, as a CSS length or a number of pixels. |
| `open` | `boolean` | — | Whether the diff body is open (controlled). |
| `defaultOpen` | `boolean` | `true` | Whether the diff body starts open (uncontrolled). |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the header toggle opens or closes the diff body. |
| `className` | `string` | — | Class name added to the root element. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Percorre os botões do cabeçalho, a área do diff (que é focável) e as faixas dobradas. |
| `Enter` ou `Espaço` | Aciona o botão em foco: recolher o arquivo, mostrar ou dobrar todas as linhas inalteradas, ou abrir uma faixa dobrada. |
| `↑` ou `↓` ou `←` ou `→` | Com o foco na área do diff, rolam o conteúdo; é a rolagem nativa de uma região com `tabIndex={0}`. |

## Acessibilidade

- A área do diff é um `role="group"` focável, rotulado com o nome do arquivo e as contagens; números e sinais ficam `aria-hidden`, e cada linha alterada começa com “Added:” ou “Removed:” só para leitor de tela.
- Os botões do cabeçalho têm `aria-label`, `aria-expanded` ou `aria-pressed`; ao abrir uma faixa dobrada, o foco passa para as linhas reveladas, porque o botão deixa de existir.
- Com o arquivo recolhido, o corpo fica `inert`; todos os rótulos estão fixos em inglês.

## Movimento

- As linhas entram em sequência, com um atraso curto entre elas (igual a partir da 25ª), e os cinco blocos do cabeçalho aparecem um após o outro.
- O corpo abre e fecha com uma mola de altura; uma faixa dobrada cresce a partir dos 32 px da própria linha, sem pulo.
- Com “reduzir movimento” ligado, as linhas aparecem de uma vez e as alturas trocam na hora.

## Comportamento responsivo

- Linhas longas não quebram: o corpo rola na horizontal com a coluna de números presa à esquerda, e `maxHeight` limita a altura e liga a rolagem vertical.
- Abaixo de 26rem de largura do próprio componente (container query), os cinco blocos somem; no caminho, o diretório corta com reticências antes do nome do arquivo.

## Desempenho

- O diff é calculado no navegador por LCS: depois de aparar o início e o fim iguais, a tabela tem o tamanho de (linhas do meio antes) × (linhas do meio depois); o resultado é memorizado por `before` e `after`.
- Não há virtualização: cada linha visível é um nó no DOM; as faixas inalteradas dobradas não são renderizadas, então mantenha `context` baixo em arquivos grandes.

## Notas para IA

- Passe `filename`, `before` e `after` com o texto completo: `before` vazio indica arquivo novo e `after` vazio, arquivo apagado; o componente não lê um patch pronto.
- `context` (padrão 3) define quantas linhas iguais ficam em volta de cada mudança; trechos maiores dobram numa linha clicável, e um diff novo volta a começar dobrado.
- Para vários arquivos, renderize um `FileDiff` por arquivo e use `defaultOpen={false}` ou o par `open` e `onOpenChange` para deixar só alguns abertos.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/file-diff · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
