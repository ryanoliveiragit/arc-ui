# Dynamic island

> Pílula no topo da tela que se transforma com mola entre repouso, atividade compacta e visões expandidas de chamada, timer e música.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/dynamic-island
- Descrição original (inglês): A pill at the top of the screen that morphs on one spring between a resting dot, a compact live activity and expanded call, timer and music views.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dynamic-island.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dynamic-island.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dynamic-island.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dynamic-island.json`. Caminho do registro, relativo ao endereço do site: `r/dynamic-island.json`.

- Pacotes npm: `motion`, `lucide-react`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Segmented control](segmented-control.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/dynamic-island/dynamic-island.tsx`
  - `components/ryan-ui/blocks/dynamic-island/dynamic-island.module.css`
  - `components/ryan-ui/lib/media.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/dynamic-island.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar uma atividade em andamento no topo de uma interface móvel, ou de um app que imita um celular: chamada, cronômetro ou música, compacta e expansível.
- Demonstrações e protótipos em que a mudança de forma da pílula entre os estados é o destaque.

## Quando não usar

- Use [`toast`](toast.md) ou [`toast-progress`](toast-progress.md) para avisar o andamento ou o resultado de uma tarefa sem ocupar um lugar fixo na tela.
- Use [`announcement-bar`](announcement-bar.md) para uma mensagem de largura total no topo da página.
- Evite para outras atividades: as visões de chamada, cronômetro e música são fixas no código, e o tempo, a faixa e o mudo vivem dentro do componente.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import DynamicIslandPreview from "@/components/ryan-ui/blocks/dynamic-island/dynamic-island";

export default function DynamicIslandDemo() {
  return <DynamicIslandPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `DynamicIsland`

A pill that grows from a resting dot into a compact live activity and on into a full view (call, timer or music), with one spring for every change of shape.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `activity` | `"idle" \| "call" \| "timer" \| "music"` | — | What the island is showing. Pass it with `onActivityChange` to control it. |
| `defaultActivity` | `"idle" \| "call" \| "timer" \| "music"` | `"idle"` | Activity at the start when uncontrolled. |
| `onActivityChange` | `(activity: IslandActivity) => void` | — | Called when the island changes activity by itself: a call is declined or ended, or a timer is cancelled. |
| `expanded` | `boolean` | — | Whether the island shows the large view of its activity. Pass it with `onExpandedChange` to control it. |
| `defaultExpanded` | `boolean` | `false` | Whether the island starts expanded when uncontrolled. |
| `onExpandedChange` | `(expanded: boolean) => void` | — | Called when a tap, Escape or a click outside expands or collapses the island. |
| `caller` | `IslandCaller` | `sampleCaller` | Who is calling in the call activity. |
| `tracks` | `IslandTrack[]` | `sampleTracks` | Queue for the music activity. |
| `timerSeconds` | `number` | `300` | Length of the timer activity in seconds. |
| `className` | `string` | — | Extra class for the pill. |

### `DynamicIslandPreview`

Ready preview: the island at the top of a phone screen, with a switch for the activity it shows.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `IslandActivity` | `"idle" \| "call" \| "timer" \| "music"` |

#### `IslandCaller`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` (obrigatória) | `string` | Caller's name. |
| `avatar` (obrigatória) | `string` | Avatar image. |

#### `IslandTrack`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `title` (obrigatória) | `string` | Track title. |
| `artist` (obrigatória) | `string` | Who plays it. |
| `cover` (obrigatória) | `string` | Cover image. |
| `duration` (obrigatória) | `number` | Length in seconds. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Na pílula compacta, expandem a atividade; nos botões redondos, atendem, recusam, silenciam, pausam, reiniciam ou trocam de faixa. |
| `Esc` | Com a ilha expandida, recolhe e, se o foco estava dentro dela, devolve-o à pílula compacta. |

## Acessibilidade

- A ilha é um `role="group"` chamado “Live activity”; compacta, é um botão cujo nome descreve a atividade, como “Jasmine Brooks is calling. Expand” ou “Timer, 4:12 left. Expand”.
- Os botões só com ícone têm nome (“Accept”, “Decline”, “Mute” com `aria-pressed`), o cronômetro usa `role="timer"` e a música tem um `progressbar` com texto como “0:48 of 3:34”.
- Não há botão de recolher na visão expandida: Esc e o clique fora da ilha são os únicos jeitos de voltar à forma compacta.

## Movimento

- A pílula muda de largura, altura e raio numa única mola com um leve quique, e o conteúdo de cada visão entra de um desfoque e de uma escala um pouco menor, já no tamanho final.
- As barras de som pulsam em ritmos diferentes enquanto há áudio, o telefone da forma compacta balança enquanto a chamada toca e as barras de progresso andam em ritmo constante a cada segundo.
- Com “reduzir movimento” ligado, a pílula troca de tamanho na hora, o conteúdo só esmaece, as barras de som ficam paradas em alturas fixas e o telefone não balança.

## Comportamento responsivo

- A pílula expandida tem largura fixa de 344px, limitada a `100vw - 1.5rem`; o conteúdo é desenhado nesse tamanho e não se reorganiza, então em telas mais estreitas as bordas ficam cortadas.

## Desempenho

- Fora do repouso, um único intervalo de 1 segundo atualiza a chamada, o cronômetro ou a música, mesmo na forma compacta; as barras de som e o toque são animações CSS.

## Notas para IA

- Importe `DynamicIsland` pelo nome (a exportação padrão é a prévia com celular e seletor); o componente não se posiciona, então centralize-o no topo pelo pai.
- Controle `activity` e `expanded` com `onActivityChange` e `onExpandedChange`: recusar ou encerrar a chamada e cancelar o cronômetro voltam a ilha para `"idle"` por conta própria.
- `caller`, `tracks` e `timerSeconds` trocam os dados de exemplo; a ilha fica quase preta nos dois temas porque usa a escala neutra fixa, e não as superfícies do tema.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/dynamic-island · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
