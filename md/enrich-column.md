# Enrich column

> Coluna de enriquecimento com IA para tabela: um prompt desce todas as linhas, cada célula shimmeriza enquanto trabalha e assenta num valor com fonte ou numa falha com retry, e o rodapé conta o que ficou pronto.

- Tipo: componente (categoria Especial), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/enrich-column
- Descrição original (inglês): An AI enrichment column for a data table where one prompt runs down every row, each cell shimmers while it works, then settles into a value with its source or a failure you can retry, with a footer tallying what's done.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/enrich-column.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/enrich-column.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/enrich-column.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/enrich-column.json`. Caminho do registro, relativo ao endereço do site: `r/enrich-column.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/enrich-column/enrich-column.tsx`
  - `components/ryan-ui/enrich-column/enrich-column.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/enrich-column.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Aumentar linhas de uma tabela com um campo gerado por IA (headcount, estágio de funding, classificação) mantendo a execução cancelável e auditável.
- Mostrar progresso real por linha — fila, executando, concluído, falhou — dentro de uma coluna, sem trocar de tela.
- Editar o nome do campo e o prompt direto no cabeçalho e reexecutar as linhas com o novo prompt.

## Quando não usar

- Pergunta livre sobre os dados com gráfico e insight como resposta: esse é o território do ask-your-data.
- Fluxos multi-etapa que navegam pelo documento ou chamam ferramentas em sequência: aí entre em cena o agent-cursor.
- Tabelas longas sem paginação: dezenas de rastros animados por célula cansam mais do que um spinner único na coluna.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { EnrichColumn } from "@/components/ryan-ui/enrich-column/enrich-column";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

export default function EnrichColumnDemo() {
  return (
    <Stack gap={3} width={720}>
      <EnrichColumn />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `EnrichColumn`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` | `string` | `"Target accounts"` | — |
| `rows` | `EnrichColumnRow[]` | `SAMPLE_ROWS` | — |
| `defaultColumn` | `EnrichColumnDefinition` | `DEFAULT_COLUMN` | — |
| `onColumnChange` | `(column: EnrichColumnDefinition) => void` | — | — |
| `enrich` | `( row: EnrichColumnRow, context: EnrichContext, ) => Promise<{ value: string; source?: EnrichColumnSource }>` | `simulatedEnrich` | — |
| `initialCells` | `Record<string, EnrichColumnCell>` | — | — |
| `concurrency` | `number` | `2` | — |
| `autoRun` | `boolean` | — | — |
| `model` | `{ name: string; detail?: string; mark?: React.ReactNode } \| null` | `{ name: "Claude Haiku 5.5", detail: "Web sear…` | — |
| `editable` | `boolean` | `true` | — |
| `note` | `string` | — | — |
| `onCellChange` | `(row: EnrichColumnRow, cell: EnrichColumnCell) => void` | — | — |
| `onRunComplete` | `(cells: Record<string, EnrichColumnCell>) => void` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `EnrichColumnCellStatus` | `"idle" \| "queued" \| "running" \| "done" \| "failed"` |
| `EnrichColumnEnrich` | `( row: EnrichColumnRow, context: EnrichContext, ) => Promise<{ value: string; source?: EnrichColumnSource }>` |

#### `EnrichColumnRow`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `name` (obrigatória) | `string` | — |
| `domain` | `string` | — |
| `logo` | `React.ReactNode` | Rendered at 16px next to the name. |

#### `EnrichColumnSource`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `href` (obrigatória) | `string` | — |

#### `EnrichColumnDefinition`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` (obrigatória) | `string` | — |
| `prompt` (obrigatória) | `string` | — |

#### `EnrichColumnCell`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `status` (obrigatória) | `"idle" \| "queued" \| "running" \| "done" \| "failed"` | — |
| `value` | `string` | — |
| `source` | `EnrichColumnSource` | — |
| `error` | `string` | — |
| `activity` | `string` | Texto vivo do shimmer enquanto a célula trabalha. |
| `attempts` (obrigatória) | `number` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Atinge o lápis do cabeçalho e os controles das linhas; o Retry da linha falha está sempre visível. |
| `Enter` ou `Space` | No lápis, abre o editor com o nome do campo já em foco. |
| `Cmd + Enter` ou `Ctrl + Enter` | No editor aberto, salva, aplica a mudança e reexecuta a coluna inteira. |
| `Esc` | Fecha o editor e devolve o foco ao botão lápis, sem alterar o prompt salvo. |

## Acessibilidade

- Cada linha usa th com scope="row" e o cabeçalho da coluna usa th com scope="col": o leitor de tela identifica a célula pelo par linha e coluna.
- Um region aria-live anuncia o início e o fim de cada execução, com contagem de falhas quando houver.
- Falha não é só cor: o motivo aparece como texto visível na célula e o Retry permanece acessível sem depender de hover.
- Com reduzir movimento ativo, as trocas de estado viram opacidade simples, sem deslize vertical nem desenho do check.

## Movimento

- O estado da célula troca num crossfade curto sobre uma camada posicionada de altura fixa, para a linha não dançar.
- O check verde é um path SVG desenhado em ~240 ms depois que o valor assenta.
- O editor da coluna abre com mola criticamente amortecida na altura, sem overshoot.
- No modo demo o loop segura ~4,2 s entre rodadas, pausa fora da viewport e para para sempre no primeiro toque ou tecla dentro do cartão.

## Comportamento responsivo

- Container queries: até 560 px saem do cabeçalho o rótulo do domínio-fonte e o detalhe do modelo; até 440 px o gutter cai para 16 px, o valor vira clamp de duas linhas em linha de 60 px e o motivo de falha some.
- Em hover:none (touch) os controles de execução da linha ficam sempre visíveis.

## Desempenho

- A execução roda duas linhas em paralelo com defasagem de 140 ms e um AbortController compartilhado para o cancelamento.
- IntersectionObserver pausa a demo quando o cartão sai da viewport; depois de qualquer interação ela não reinicia sozinha.
- Cada célula animada reutiliza uma única camada posicionada dentro do td de altura fixa, sem criar nós por estado.

## Notas para IA

- O modo `enrich` simulado é ilustrativo e monta já no fim; em produção ligue a função real que retorna valor, fonte e confiança por linha.
- Falha é dado, não exceção: a linha guarda o motivo (como "sem fonte com data") e oferece retry isolado.
- Cancelar uma execução em andamento restaura os valores concluídos antes do abort e devolve o resto ao estado inicial.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/enrich-column · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
