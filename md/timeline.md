# Timeline

> Linha do tempo com os eventos mais recentes primeiro, agrupados por dia e com detalhes que se expandem.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/timeline
- Descrição original (inglês): Follow what happened, newest first, grouped by day.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/timeline.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/timeline.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/timeline.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/timeline.json`. Caminho do registro, relativo ao endereço do site: `r/timeline.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/timeline/timeline.tsx`
  - `components/ryan-ui/timeline/timeline.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/timeline.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Histórico de um projeto, log de auditoria ou sequência de deploys, em que a ordem e a recência importam mais que comparar campos.
- Feeds que recebem novidades com a tela aberta: o evento novo entra no topo, os demais descem e o título dele é anunciado ao leitor de tela.
- Quando só parte dos eventos tem detalhes que valem abrir: com `detail`, a linha vira um botão que expande no lugar.

## Quando não usar

- Use [`sortable-data-table`](sortable-data-table.md) quando as pessoas precisam ordenar ou comparar registros por coluna.
- Use [`stepper`](stepper.md) para mostrar as etapas de um fluxo e o que já foi concluído, e não eventos datados.
- Use [`notification-center`](notification-center.md) para avisos com estado de lido e não lido.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useMemo } from "react";
import { GitMerge, Rocket, TriangleAlert } from "lucide-react";
import { Timeline, type TimelineEvent } from "@/components/ryan-ui/timeline/timeline";
import { avatar } from "@/components/ryan-ui/lib/media";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

export default function TimelineDemo() {
  const now = useMemo(() => Date.now(), []);
  const m = 60_000, h = 60 * m;
  const events: TimelineEvent[] = [
    { id: "e1", at: now - 8 * m, actor: "Marcus Johnson", title: "merged Checkout redesign into main", meta: "Pull request #482", avatar: avatar("marcus-johnson"), detail: "Squashed 7 commits. 24 files changed, 3 reviewers approved." },
    { id: "e2", at: now - 20 * m, title: "Production deploy succeeded", meta: "Build 2041", icon: <Rocket size={14} aria-hidden="true" />, tone: "success", detail: "Deployed to 3 regions in 2m 41s." },
    { id: "e3", at: now - 3 * h, actor: "Emma Collins", title: "commented on Hero headline", avatar: avatar("emma-collins") },
    { id: "e4", at: now - 5 * h, title: "Staging deploy failed", meta: "Build 2039", icon: <TriangleAlert size={14} aria-hidden="true" />, tone: "danger", detail: "Type check failed in billing/invoice.ts on line 88." },
    { id: "e5", at: now - 26 * h, actor: "Olivia Bennett", title: "approved Billing migration", meta: "Pull request #471", icon: <GitMerge size={14} aria-hidden="true" />, avatar: avatar("olivia-bennett") },
    { id: "e6", at: now - 30 * h, actor: "Jasmine Brooks", title: "opened Pricing page experiment", meta: "Pull request #476", avatar: avatar("jasmine-brooks") },
  ];
  return (
    <Stack width={480}>
      <Timeline events={events} now={now} label="Project activity" maxHeight={460} />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Timeline`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `events` (obrigatória) | `TimelineEvent[]` | — | Updates in any order; the newest shows first. |
| `now` (obrigatória) | `number` | — | Reference time for relative labels and day groups, in epoch milliseconds. Pass a ticking clock to keep labels fresh. |
| `label` (obrigatória) | `string` | — | Accessible name for the feed. |
| `timeZone` | `string` | `"UTC"` | Time zone for day groups and clock times. Fixed by default so server and client agree. |
| `locale` | `string` | `"en-US"` | — |
| `maxHeight` | `number \| string` | — | Height of the scrolling area. Without it the feed grows with the page and reveals on page scroll. |
| `scrollToNew` | `boolean` | `true` | Scroll back to the top when a new update arrives while the feed is scrolled down. |
| `defaultExpanded` | `string[]` | `[]` | — |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | Heading level for the day labels. |
| `className` | `string` | — | — |

### Tipos exportados

#### `TimelineEvent`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `at` (obrigatória) | `string \| number` | When it happened, as an ISO string or epoch milliseconds. |
| `actor` | `string` | Who did it, shown first in the foreground color. |
| `title` (obrigatória) | `string` | What happened, completing the actor: "merged Checkout redesign into main". |
| `meta` | `string` | Short context under the title, such as a pull request or a build. |
| `detail` | `ReactNode` | Revealed in place when the row is expanded. Rows without detail are not interactive. |
| `avatar` | `string` | Portrait for an event by a person. |
| `icon` | `ReactNode` | Icon for a system event, used when there is no avatar. |
| `tone` | `"neutral" \| "success" \| "danger"` | Status of a system event. Always say the outcome in the title too, so it never rests on color. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Move o foco para a linha anterior ou seguinte que tem `detail`; linhas sem detalhe não recebem foco. |
| `Home` ou `End` | Vai à primeira ou à última linha com detalhe. |
| `Enter` ou `Espaço` | Abre ou fecha o detalhe da linha em foco. |

## Acessibilidade

- O feed é uma `region` nomeada por `label`; cada dia é uma `<section>` ligada ao seu título (`role="heading"` no nível `headingLevel`, 3 por padrão), e os eventos formam uma lista ordenada.
- Linhas com `detail` são `<button>` com `aria-expanded` e `aria-controls`; o horário é um `<time>` com a data completa em texto oculto, e eventos novos são anunciados numa região `role="status"`.
- `tone` só muda a cor do marcador: escreva o resultado no `title` (“Deploy falhou”); o avatar tem `alt` vazio porque o nome já vem em `actor`.

## Movimento

- Cada linha se revela uma vez, ao entrar na tela: o marcador surge crescendo e o traço vertical se desenha até o próximo; linhas que aparecem juntas entram com 90 ms de intervalo.
- Eventos novos entram no topo abrindo espaço enquanto os outros descem; o detalhe abre com mola na altura, a seta gira, e o horário relativo e a contagem do dia trocam rolando.
- Com “reduzir movimento” ligado, não há intervalo nem deslocamento: marcadores, traços e detalhes aparecem na hora ou com um esmaecer curto, e a volta ao topo é instantânea.

## Comportamento responsivo

- Com `maxHeight`, o feed rola por dentro, os títulos de dia ficam presos no topo e a borda de baixo esmaece enquanto há mais eventos; sem ele, o feed cresce com a página.
- Se um evento novo chega com o feed rolado para baixo, ele volta sozinho ao topo; desligue com `scrollToNew={false}`.

## Desempenho

- Não há virtualização: todos os eventos ficam no DOM e cada linha detecta uma única vez sua entrada na tela; em históricos longos, limite o que passa em `events`.

## Notas para IA

- Passe `events`, `label` e `now` (epoch ms); o componente não tem relógio próprio, então atualize `now` de tempos em tempos (a cada minuto, por exemplo) para os tempos relativos não envelhecerem.
- Dias e horas usam `timeZone="UTC"` por padrão: passe o fuso local (`"America/Sao_Paulo"`) e `locale`; “Today”, “Yesterday”, “updates” e os tempos `8m` e `Now` ficam em inglês.
- Use `id` estável: é por ele que um evento é reconhecido como novo, anima a entrada e é anunciado; sobre outra superfície, defina `--timeline-surface` para o fundo dos títulos de dia.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/timeline · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
