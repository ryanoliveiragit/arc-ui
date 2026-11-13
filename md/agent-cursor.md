# Agent cursor

> Documento ao vivo em que o Claude edita como colaborador: o cursor com nome sai do avatar dele, seleciona um parágrafo e digita a reescrita palavra por palavra, adiciona um heading e corrige um typo sublinhado de ziguezague, enquanto a cursor da colega lê junto; as mudanças ficam tingidas até alguém aceitar ou desfazer na barra de revisão flutuante.

- Tipo: componente (categoria Especial), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/agent-cursor
- Descrição original (inglês): A live document where Claude edits like a collaborator: its labeled cursor comes out of its avatar, selects a paragraph and streams in a rewrite, adds a heading and fixes a typo, while a teammate's cursor reads along. Changes stay tinted until someone accepts or undoes them from a floating review bar.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/agent-cursor.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/agent-cursor.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/agent-cursor.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/agent-cursor.json`. Caminho do registro, relativo ao endereço do site: `r/agent-cursor.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/agent-cursor/agent-cursor.tsx`
  - `components/ryan-ui/agent-cursor/agent-cursor.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/agent-cursor.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar um assistente de escrita de IA editando um documento junto com pessoas, com passo de revisão (aceitar/desfazer) antes de aplicar.
- Seções de landing ou onboarding que demonstram um editor colaborativo com IA em movimento.
- Superfícies de produto em que um agente devolve edits estruturados (reescrita, inserção de bloco, correção) e um humano precisa aprovar cada lote.

## Quando não usar

- Conversa ou Q&A livre: use um componente de transcript de chat; aqui o valor é a edição in place com cursor e revisão.
- Um editor rich text de verdade: ligue os cursores de colaboração do próprio editor; este cartão renderiza blocos somente leitura.
- Documentos longos com muitas seções: o cartão foi feito para um excerto curto, uns cinco a dez blocos.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { AgentCursor } from "@/components/ryan-ui/agent-cursor/agent-cursor";
import { person } from "@/components/ryan-ui/lib/media";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

export default function AgentCursorDemo() {
  return (
    <Stack gap={3} width={720}>
      <AgentCursor collaborator={{ name: "Emma Collins", avatar: person("emma-collins").src }} />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `AgentCursor`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `blocks` | `DocBlock[]` | `SAMPLE_BLOCKS` | O documento como blocos de título, heading e parágrafo com ids estáveis. |
| `meta` | `string` | — | Linha discreta sob o título, como dono e data-alvo. |
| `edits` | `AgentEdit[]` | — | Edits para reproduzir em ordem. Ignorado quando há run. |
| `run` | `(signal: AbortSignal) => Promise<AgentEdit[]>` | — | Busca edits no seu agente; o signal aborta no Stop. Rejeição vira erro com Retry. |
| `agent` | `{ name?: string; mark?: React.ReactNode; color?: string }` | — | — |
| `collaborator` | `{ name: string; avatar?: string; color?: string } \| null` | `{ name: "Emma Collins" }` | Humano dentro do doc, desenhado como segundo cursor. Null oculta. |
| `autoPlay` | `boolean` | `true` | — |
| `loop` | `boolean` | — | Rejoga o run: aceita depois de uma pausa (nunca com hover/focus no card) e reinicia. Padrão true no exemplo. |
| `speed` | `number` | `1` | — |
| `onAccept` | `(blocks: DocBlock[]) => void` | — | — |
| `onUndo` | `(blocks: DocBlock[]) => void` | — | — |
| `onPhaseChange` | `(phase: AgentCursorPhase) => void` | — | — |
| `simulated` | `boolean` | — | Acrescenta "Simulated, nothing was saved" ao status de leitor de tela. Padrão true no exemplo. |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `AgentCursorPhase` | `"idle" \| "thinking" \| "editing" \| "review" \| "accepted" \| "reverted" \| "stopped" \| "empty" \| "error"` |
| `AgentEdit` | `\| { type: "rewrite"; blockId: string; text: string; label?: string } \| { type: "insert"; afterId: string; block: DocBlock; label?: string } \| { type: "fix"; blockId: string; from: string; to: string; label?: string }` |

#### `DocBlock`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `kind` (obrigatória) | `"title" \| "h" \| "p"` | — |
| `text` (obrigatória) | `string` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Move o foco entre o botão do cabeçalho (Stop durante o run, Run again depois) e, na barra de revisão, entre Undo e Accept changes. |
| `Enter` ou `Space` | Ativa o botão com foco (para o run, rejoga, desfaz ou aceita as mudanças). |

## Acessibilidade

- Uma live region polida narra cada etapa (pensando, a edição em curso, edits prontos, aceito, desfeito, erro) e acrescenta “Simulated, nothing was saved” nos runs simulados.
- Cursores, seleção e a linha de status são decorativos e ficam fora da árvore; o documento mantém headings e parágrafos reais, marcados com aria-busy enquanto o agente edita.
- O status nunca é só cor: todo estado terminal combina ícone com rótulo, e as mudanças pendentes ficam tingidas e contadas na barra de revisão.
- Hover ou focus dentro do cartão segura o loop em review, para ninguém perder a barra de ação no meio do alcance.

## Movimento

- Os cursores deslizam num arco suave ease-in-out, 280 a 600 ms conforme a distância, dirigidos por motion values — nada re-renderiza por frame.
- A seleção preenche linha por linha em passo com o arraste; a reescrita faz fade do texto antigo em 110 ms e streama 4 palavras a cada 34 ms sobre um ghost invisível que reserva a altura exata, cada chunk esmaecendo em 140 ms sem blur nem slide.
- Blocos inseridos crescem do zero com mola sem bounce (motionTokens.spring.smooth); o rótulo de status faz crossfade (100 ms de saída, 160 ms de entrada) e a barra de revisão sobe 8 px e aparece em 200 ms.
- Com reduzir movimento ativo os cursores pulam direto para o alvo, o texto chega inteiro, o drift de repouso e o stagger param, e todos os estados finais permanecem visíveis.

## Comportamento responsivo

- O cartão é fluido dentro do container, limitado a 720 px e centralizado; abaixo de 480 px o padding do documento aperta e a barra de revisão dispensa o “by Claude” para caber em uma linha.
- As tags dos cursores viram para a esquerda perto da borda direita, e o cursor de repouso da colaboradora se reancora quando o cartão redimensiona (ResizeObserver).
- Alvos de seleção e de cursor vêm de Range.getClientRects nas caixas de linha vivas, então texto embrulhado continua mirado em qualquer largura, inclusive 360 px sem scroll horizontal.

## Desempenho

- Posições dos cursores são motion values, então o trajeto nunca re-renderiza React; o streaming re-renderiza um bloco por tick.
- Geometria de seleção e de alvo sai de getClientRects sob demanda, não a cada frame.
- Timer pausável por um IntersectionObserver (limiar 0,2): loops, drift e esperas param com o cartão fora da tela, e o AbortController cancela o run no Stop, no re-jogo e no unmount.

## Notas para IA

- Sem run o componente roda o modo amostra: um launch brief de exemplo com três edits (reescrita, heading e typo) em loop — autoPlay, loop e simulated são true por padrão nesse modo, e o primeiro hover/toque segura o ciclo.
- Ligue ao seu agente com run(signal): promessa async abortável; uma rejeição vira estado de erro com Retry no cabeçalho e na barra. Edits apontam blocos pelo id, e fix precisa da palavra exata como ela está no texto.
- Persista o resultado: salve o que onAccept devolve e repasse em blocks. agent aceita outro provedor com name/mark/color — cursor, seleção e tint seguem agent.color; collaborator null esconde o segundo cursor; autoPlay false troca o cabeçalho para Ask.
- Tudo dentro do cartão é medido em pixels vivos (getBoundingClientRect/getClientRects relativo ao card), então funciona embutido em qualquer layout, desde que o container não use transform enquanto roda.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/agent-cursor · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
