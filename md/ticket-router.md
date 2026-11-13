# Ticket router

> Roteador de tickets de suporte com IA: as mensagens chegam uma a uma, recebem intenção, sentimento e confiança e caem numa lane de time com responsável em round robin; as de baixa confiança esperam na lane de revisão até alguém confirmar.

- Tipo: componente (categoria Especial), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/ticket-router
- Descrição original (inglês): A support ticket router where messages from Gmail, Intercom, Slack and Zendesk come in one at a time. An AI classifier labels each one with intent, sentiment and confidence, and the ticket moves into a team lane with an assignee. Low confidence tickets wait in a review lane, and one click there routes them to the suggested team.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ticket-router.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ticket-router.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ticket-router.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ticket-router.json`. Caminho do registro, relativo ao endereço do site: `r/ticket-router.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/ticket-router/ticket-router.tsx`
  - `components/ryan-ui/ticket-router/ticket-router.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/ticket-router.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar como um classificador de IA faz a triagem de mensagens de suporte (Gmail, Intercom, Slack, Zendesk) em filas de time, uma a uma.
- Widget ao vivo num helpdesk ou dashboard de ops, com lane de revisão humana para os tickets de baixa confiança.
- Demo de marketing ou onboarding de produtos de suporte que fazem roteamento com IA.

## Quando não usar

- Caixa de entrada completa com busca e ações em lote: prefira um layout de tabela ou lista.
- Um passo de ferramenta numa transcrição de conversa com agente: esse é o território do tool-call.
- Progresso genérico multi-etapa de um agente: use agent-status ou agent-plan.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { TicketRouter } from "@/components/ryan-ui/ticket-router/ticket-router";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

export default function TicketRouterDemo() {
  return (
    <Stack gap={3} width={760}>
      <TicketRouter />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `TicketRouter`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `tickets` | `TicketMessage[]` | — | — |
| `lanes` | `TicketLaneDef[]` | `DEFAULT_LANES` | — |
| `initialRouted` | `Record<string, RoutedTicket[]>` | — | — |
| `classify` | `(ticket: TicketMessage, ctx: { signal: AbortSignal }) => Promise<TicketClassification>` | — | — |
| `route` | `(ticket: TicketMessage, classification: TicketClassification) => string` | `defaultRoute` | — |
| `reviewThreshold` | `number` | `0.7` | — |
| `loop` | `boolean` | — | Reinicia a fila quando esvazia; padrão true com a amostra embutida. |
| `paused` | `boolean` | — | — |
| `defaultPaused` | `boolean` | `false` | — |
| `onPausedChange` | `(paused: boolean) => void` | — | — |
| `onRoute` | `(ticket: RoutedTicket) => void` | — | — |
| `onReview` | `(ticket: RoutedTicket, lane: string) => void` | — | — |
| `onError` | `(ticket: TicketMessage, error: unknown) => void` | — | — |
| `maxVisible` | `number` | `3` | — |
| `speed` | `number` | `1` | — |
| `title` | `string` | `"Ticket routing"` | — |
| `model` | `string` | `"Claude Haiku 5.5"` | — |
| `modelMark` | `React.ReactNode` | `<ClaudeMark />` | — |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `TicketChannel` | `"email" \| "intercom" \| "slack" \| "zendesk"` |

#### `TicketMessage`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `channel` (obrigatória) | `"email" \| "intercom" \| "slack" \| "zendesk"` | — |
| `customer` (obrigatória) | `string` | — |
| `company` | `string` | — |
| `subject` (obrigatória) | `string` | — |
| `preview` (obrigatória) | `string` | — |
| `receivedAt` | `string` | — |

#### `TicketLaneDef`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `assignees` (obrigatória) | `string[]` | Nomes completos para round robin; apenas o primeiro nome é exibido nas linhas. |
| `review` | `boolean` | Lane que guarda tickets de baixa confiança. |

#### `TicketClassification`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `intent` (obrigatória) | `string` | — |
| `sentiment` (obrigatória) | `string` | — |
| `confidence` (obrigatória) | `number` | 0..1 |

#### `RoutedTicket`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `ticket` (obrigatória) | `TicketMessage` | — |
| `classification` (obrigatória) | `TicketClassification` | — |
| `laneId` (obrigatória) | `string` | — |
| `assignee` | `string` | — |
| `suggestedLaneId` | `string` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Move o foco entre Pause, as ações de erro (Retry e Send to review) e os tickets da lane Needs review. |
| `Enter` ou `Space` | Pausa ou retoma o fluxo, repete uma classificação falha e confirma a lane sugerida num ticket de revisão. |

## Acessibilidade

- O cartão é uma section nomeada pelo título; cada lane é uma lista nomeada com o nome da equipe e a contagem de tickets.
- Uma região aria-live polida anuncia cada roteamento (lane e responsável), falhas, pausas, confirmações de revisão e que a execução é simulada e nada foi enviado.
- Intenção, sentimento e status de revisão sempre pareiam ícone com texto; a confiança lê como porcentagem, nunca só cor.
- Tickets de revisão são botões reais cujo aria-label nomeia o assunto, a confiança e a lane de destino.

## Movimento

- Ritmo de ~2 s por ticket: chegada em 220 ms, etiquetas com fade em stagger de 50 ms, pulso desenhado no conector em 240 ms e aterrissagem da linha na lane.
- Linhas entram e saem animando a altura medida com mola sem bounce (visualDuration .24); contadores rodam em largura tabular reservada.
- A troca de ticket é um crossfade único: saída em 100 ms e entrada em 160 ms com pequena subida. Sem blur nem movimento letra a letra.
- Com reduzir movimento ativo, todos os estados finais e o destaque da lane ficam; saem o deslocamento, a subida e o desenho do conector. O fluxo pausa fora da tela.

## Comportamento responsivo

- Container queries: o cartão preenche o container até 840 px; acima de 600 px de largura útil as quatro lanes ficam em fileira com conector, abaixo viram grade 2×2 com duas linhas cada.
- Abaixo de 600 px as etiquetas do classificador empilham sobre o alvo da rota; abaixo de 400 px o medidor de confiança e o nome do modelo somem, mantendo a porcentagem.
- Toda linha de texto trunca com elipse: assuntos e nomes longos nunca mudam a altura do cartão.

## Desempenho

- Só um timer ou uma chamada de classificador roda por vez; ambos cancelam na pausa, fora da tela (IntersectionObserver) e no unmount.
- O histórico roteado tem teto de 80 tickets e cada lane renderiza apenas as linhas visíveis.
- As marcas dos canais são SVG inline sem rede; avatares são tiles de gradiente com a inicial, sem requisição.

## Notas para IA

- Ligue classify à chamada do seu modelo devolvendo { intent, sentiment, confidence }; jogue para exibir o estado de erro com Retry e Send to review. Sem ela, o classificador simulado lê a amostra embutida.
- Os ids devolvidos por route precisam casar com lanes; id desconhecido cai na primeira lane não-review. Passe loop={false} com seus próprios tickets para os estados vazio e All caught up.
- Mantenha o cartão dentro de uma coluna de conteúdo (360 a 880 px); abaixo de 600 px as lanes dobram em grade 2×2 e o conector some.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/ticket-router · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
