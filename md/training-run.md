# Training run

> Cartão de job de fine-tuning: as curvas de loss de treino e validação desenham ao vivo sobre um eixo de passos fixo que também é a barra de progresso por epoch; mostra learning rate, tempo decorrido e ETA, os últimos evals e checkpoints, tem Pause e Cancel durante o run e termina em resultados com botão de Deploy.

- Tipo: componente (categoria Especial), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/training-run
- Descrição original (inglês): A fine-tuning job card where a live train and validation loss curve draws across a fixed step axis that doubles as the epoch progress bar. It shows the learning rate, elapsed time and ETA, the latest evals and checkpoints, has Pause and Cancel while it runs, and ends in results with a Deploy button.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/training-run.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/training-run.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/training-run.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/training-run.json`. Caminho do registro, relativo ao endereço do site: `r/training-run.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/training-run/training-run.tsx`
  - `components/ryan-ui/training-run/training-run.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/training-run.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Acompanhar um único job de fine-tuning ou destilação rodando na plataforma: loss, learning rate, tempo decorrido, ETA e eventos recentes sem sair da página.
- Onboarding de produto em que o modelo treina sobre os dados do cliente e termina o run num deploy.
- Monitoramento somente leitura: sem nenhum callback a vira um cartão sem botões, só dados.

## Quando não usar

- Gráfico multi-série genérico sem ciclo de vida de job: use line-chart.
- Tarefas de agente com passos em vez de curva de loss: use agent-status.
- Lista de muitos jobs: renderize uma linha compacta por job e abra este cartão apenas para o selecionado.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { TrainingRun } from "@/components/ryan-ui/training-run/training-run";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

export default function TrainingRunDemo() {
  return (
    <Stack gap={3} width={640}>
      <TrainingRun />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `QwenColorMark`

Marca do Qwen (Qwen3.8 Max): losango hexagonal em facetas índigo. O fill é marca, não decoração.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### `HuggingFaceMark`

Marca do Hugging Face: silhueta de raposa no amarelo da marca.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### `TrainingRun`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `status` | `"queued" \| "running" \| "paused" \| "completed" \| "failed" \| "cancelled"` | — | Onde o job está. Rodando sem amostras de loss lê como "subindo". Sem ele, roda a simulação embutida. |
| `name` | `string` | `"Fine-tuning job"` | — |
| `model` | `{ name: string; mark?: ReactNode }` | — | — |
| `details` | `string[]` | `[]` | — |
| `dataset` | `{ name: string; examples?: number; mark?: ReactNode }` | — | — |
| `step` | `number` | — | — |
| `totalSteps` | `number` | — | — |
| `epochs` | `number` | — | — |
| `loss` | `LossSample[]` | — | — |
| `learningRate` | `number` | — | — |
| `elapsed` | `number` | — | — |
| `eta` | `number` | — | — |
| `events` | `TrainingEvent[]` | — | — |
| `metrics` | `{ label: string; value: string; hint?: string }[]` | — | — |
| `activity` | `string` | — | Linha sobre o gráfico vazio enquanto o job está na fila ou subindo. |
| `error` | `string` | — | Motivo da falha; aparece no rodapé no lugar do dataset. |
| `onPause` | `() => void` | — | — |
| `onResume` | `() => void` | — | — |
| `onCancel` | `() => void` | — | Chamado num segundo toque em "Confirm cancel" (janela de 3s). |
| `onRetry` | `() => void` | — | — |
| `onRestart` | `() => void` | — | — |
| `onDeploy` | `(signal: AbortSignal) => Promise<{ endpoint?: string } \| void>` | — | — |
| `notice` | `string` | — | Mensagem de uso único para leitores de tela (resultado de uma ação). |
| `scenario` | `"healthy" \| "oom"` | `"healthy"` | Só o demo, quando status fica de fora: "oom" falha no passo 940 para mostrar o retry. |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `TrainingStatus` | `"queued" \| "running" \| "paused" \| "completed" \| "failed" \| "cancelled"` |
| `TrainingEventKind` | `"start" \| "checkpoint" \| "eval" \| "epoch" \| "info" \| "warning" \| "error" \| "done"` |

#### `TrainingEvent`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `kind` (obrigatória) | `"start" \| "checkpoint" \| "eval" \| "epoch" \| "info" \| "warning" \| "error" \| "done"` | — |
| `label` (obrigatória) | `string` | — |
| `step` | `number` | — |

#### `LossSample`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `step` (obrigatória) | `number` | — |
| `train` | `number` | — |
| `val` | `number` | — |

#### `TrainingRunSimulation`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `error` | `string` | — |
| `notice` | `string` | — |
| `scenario` (obrigatória) | `"healthy" \| "oom"` | — |
| `...props` | `Required<Omit<TrainingRunProps, "className" \| "scenario" \| "error" \| "notice">>` | Também aceita as props deste tipo. |

### Outras exportações

- `useTrainingRunSimulation` (hook)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Percorre o gráfico de loss e as ações do rodapé. |
| `Esquerda` ou `Direita` | No gráfico focado, percorre as amostras; a legenda mostra a train e a validation loss do passo inspecionado. |
| `Shift + Esquerda` ou `Shift + Direita` | Avança dez amostras de cada vez. |
| `Home` ou `End` | Salta para a primeira ou para a última amostra. |
| `Esc` | Limpa o passo inspecionado. |
| `Enter` ou `Espaço` | Ativa a ação focada; o Cancel pede um segundo toque em Confirm cancel dentro de uma janela de 3s. |

## Acessibilidade

- Região aria-live polida anuncia mudanças de status (Queued, Training, Paused, Completed, Failed) e qualquer notice passado via notice; nunca anuncia passo a passo.
- O status é ícone mais rótulo, nunca só cor; o motivo da falha fica como texto no rodapé (no lugar do dataset) e no log de eventos.
- O gráfico é um grupo com rótulo cujo aria-label carrega o passo atual e as duas losses; as setas inspecionam amostras e uma nota flutuante mostra os valores do passo inspecionado.
- As métricas são uma lista de descrição (dl) e todos os números usam tabular numerals; o Cancel é ação em duas etapas, para um toque perdido nunca parar um run longo.

## Movimento

- As curvas de treino e validação crescem amostra a amostra conforme o run avança; o eixo Y se fixa a partir das primeiras amostras e o eixo X cobre o run inteiro, então nada reescala no meio do treino.
- O playhead e a trilha de progresso por epoch avançam junto com o passo atual; eventos novos deslizam para o log em 240 ms com o ease standard, e status, métricas e textos do rodapé trocam em crossfade com subida de 2 px.
- Com movimento reduzido o spinner para, as transições viram instantâneas e a curva salta direto entre amostras.
- Na simulação embutida o relógio congela quando o cartão sai da tela (IntersectionObserver) e, só no modo demo sem status externo, o run reinicia sozinho após a pausa do estado completado, a menos que alguém interaja.

## Comportamento responsivo

- Ocupa o container até 640 px de largura.
- Container queries: abaixo de 480 px o padding do cartão cai para 14/16 px, as quatro métricas viram duas colunas, a legenda encurta Validation para Val e o rodapé empilha contexto acima das ações.

## Desempenho

- O SVG é medido e redesenhado em pixels reais (ResizeObserver), nítido em qualquer largura; o filtro das amostras do demo roda a cada tick de 90 ms e aguenta alguns milhares de pontos — para runs maiores, subamostrai loss para uns 500 antes de passar.

## Notas para IA

- Passe totalSteps e epochs vindo da configuração do job para o eixo estar certo desde a primeira amostra; envie loss conforme ele chega, mais antigo primeiro.
- Cada controle só aparece quando seu callback é passado: um monitor somente leitura usa apenas props de dados. Sem status, o cartão toca a simulação LoRA embutida do Qwen3.8 Max.
- Importe QwenColorMark e HuggingFaceMark do próprio componente ou passe seus SVGs em model.mark / dataset.mark; ações primárias (Resume, Retry, Deploy) usam o accent e só o Confirm cancel usa danger.
- onDeploy recebe um AbortSignal; faça abort no unmount e o cartão já mostra o endpoint retornado com botão de copiar.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/training-run · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
