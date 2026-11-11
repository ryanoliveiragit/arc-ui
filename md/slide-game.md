# Slide game

> Uma faixa de multiplicadores dispara, desacelera e para sob o marcador central: o valor sorteado multiplica a aposta de mentirinha.

- Tipo: componente (categoria Jogos), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/slide-game
- Descrição original (inglês): A play-money slide game: a strip of multiplier tiles shoots past a center marker, decelerates and stops on the multiplier that pays the bet.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slide-game.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slide-game.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slide-game.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slide-game.json`. Caminho do registro, relativo ao endereço do site: `r/slide-game.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/slide-game/slide-game.tsx`
  - `components/ryan-ui/slide-game/slide-game.module.css`
  - `components/ryan-ui/slide-game/play-money.tsx`
  - `components/ryan-ui/slide-game/play-money.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/slide-game.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Demos ou áreas de jogo com saldo fictício em que uma aposta faz uma faixa de multiplicadores correr e parar sozinha.
- Quando as chances devem ficar à mostra: a lista abaixo da faixa traz a porcentagem de cada multiplicador, calculada dos pesos.
- Sorteios configuráveis: `tiles` define os multiplicadores e o peso de cada um.

## Quando não usar

- Não use com dinheiro real nem prêmios: o saldo é fictício e o resultado é sorteado no navegador com `random`.
- Use [`crash-game`](crash-game.md) ou [`mines-game`](mines-game.md) quando a pessoa deve decidir durante a rodada.
- Use [`plinko-game`](plinko-game.md) quando várias apostas devem rodar ao mesmo tempo, com um risco que a pessoa escolhe.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { SlideGame } from "@/components/ryan-ui/slide-game/slide-game";
import type { SlideRound } from "@/components/ryan-ui/slide-game/slide-game";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

const amount = (value: number) => `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(2)}`;

export default function SlideGameDemo() {
  const [rounds, setRounds] = useState<SlideRound[]>([]);
  const best = rounds.reduce((top, round) => Math.max(top, round.multiplier), 0);
  const net = rounds.reduce((sum, round) => sum + round.payout - round.bet, 0);
  return (
    <Stack width={576} gap={3}>
      <SlideGame defaultBet={10} onRoundEnd={round => setRounds(list => [...list, round])} />
      <Caption>
        {rounds.length
          ? `${rounds.length} ${rounds.length === 1 ? "round" : "rounds"} played: best stop ${best}×, session ${amount(net)}.`
          : "Bet and the strip shoots past the marker, slows down and stops on the multiplier that pays your bet."}
      </Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SlideGame`

A slide game with fake money: a strip of multiplier tiles shoots past a center marker, slows down and stops on the multiplier that pays the bet.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `balance` | `number` | — | Controlled play-money balance. |
| `defaultBalance` | `number` | `1000` | Starting balance when uncontrolled; the reset button returns to it. |
| `onBalanceChange` | `(balance: number) => void` | — | Called with the new balance after a bet, a payout or a reset. |
| `defaultBet` | `number` | `10` | Bet amount shown at first. |
| `minBet` | `number` | `1` | Smallest bet. |
| `tiles` | `SlideTile[]` | `defaultTiles` | The kinds of tile on the strip and how often each comes up. |
| `duration` | `number` | `3.8` | Seconds the strip takes to slide and slow down to its result. |
| `onRoundEnd` | `(round: SlideRound) => void` | — | Called when the strip has stopped, with the result. |
| `random` | `() => number` | `Math.random` | Random source returning a number in [0, 1). Called only after a bet, to pick the result and fill the strip. |
| `title` | `string` | `"Slide"` | Name shown in the header. |
| `className` | `string` | — | Extra class for the card. |

### `GameFrame`

The card around a game: title, a "Play money" tag, the balance and its reset.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` (obrigatória) | `string` | — | Name of the game, shown in the header and used as the region label. |
| `money` (obrigatória) | `PlayMoney` | — | The balance from `usePlayMoney`. |
| `busy` | `boolean` | `false` | True while a round is running: the reset button waits for it to end. |
| `announcement` | `string` | `""` | Result text for screen readers, announced politely. |
| `className` | `string` | — | Extra class for the card. |
| `children` (obrigatória) | `ReactNode` | — | The stage and controls of the game. |

### `BetField`

Bet amount with half, double and max shortcuts. Typing is free; the amount is clamped when the field loses focus.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` (obrigatória) | `number` | — | Bet amount. |
| `onValueChange` (obrigatória) | `(value: number) => void` | — | Called with the new amount, already clamped between `min` and `max`. |
| `min` | `number` | `1` | Smallest bet. |
| `max` (obrigatória) | `number` | — | Largest bet, usually the balance. |
| `disabled` | `boolean` | `false` | Locks the field, for example while a round runs. |
| `label` | `string` | `"Bet"` | Field label. |

### `AmountField`

A small optional number, such as a target multiplier.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | Field label. |
| `value` (obrigatória) | `string` | — | Text in the field (digits and one dot). Empty means "not set". |
| `onValueChange` (obrigatória) | `(value: string) => void` | — | Called with the cleaned text on every edit. |
| `placeholder` | `string` | — | Shown while the field is empty. |
| `suffix` | `string` | — | Short unit after the number, for example "×". |
| `disabled` | `boolean` | `false` | Locks the field. |

### `FieldGroup`

A labelled slot for a custom control, aligned with the bet field.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | Label above the control. |
| `children` (obrigatória) | `ReactNode` | — | The control: a stepper, a segmented choice… |

### `PlayButton`

The main action of a game. One button keeps focus while its label changes (Bet, Cash out, …).

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `labelKey` (obrigatória) | `string` | — | Identifies the label: when it changes, the old label slides out and the new one slides in. |
| `tone` | `"accent" \| "neutral"` | `"accent"` | "accent" for the main action, "neutral" for a waiting state. |
| `disabled` | `boolean` | `false` | Turns the action off. The button stays focusable (aria-disabled), so keyboard focus is never lost while a round runs. |
| `onClick` (obrigatória) | `() => void` | — | Runs the action. |
| `children` (obrigatória) | `ReactNode` | — | Label content. |

### `HistoryChips`

A row of past results. A new chip springs in at the start and pushes the others along.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `entries` (obrigatória) | `HistoryEntry[]` | — | Past results, newest first. |
| `label` (obrigatória) | `string` | — | Label of the list for screen readers. |

### Tipos exportados

#### `SlideTile`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `multiplier` (obrigatória) | `number` | Multiplier paid when the strip stops on this tile. |
| `weight` (obrigatória) | `number` | Relative chance of this tile: a weight of 2 comes up twice as often as a weight of 1. |

#### `SlideRound`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `number` | Round number, starting at 1. |
| `multiplier` (obrigatória) | `number` | Multiplier the strip stopped on. |
| `bet` (obrigatória) | `number` | Amount bet. |
| `payout` (obrigatória) | `number` | Amount paid back. |

#### `PlayMoneyOptions`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `balance` | `number` | Controlled balance. |
| `defaultBalance` (obrigatória) | `number` | Starting balance when uncontrolled; a reset returns to it. |
| `onBalanceChange` | `(balance: number) => void` | Called with the new balance after a bet, a payout or a reset. |

#### `PlayMoneyGain`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `number` | Changes on every payout, so the same amount twice still animates. |
| `amount` (obrigatória) | `number` | Amount paid. |

#### `PlayMoney`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `balance` (obrigatória) | `number` | Current fake balance. |
| `gain` (obrigatória) | `PlayMoneyGain \| null` | The latest payout, for the "+12.40" flyer next to the balance. |
| `spend` (obrigatória) | `(amount: number) => boolean` | Takes a bet out of the balance. Returns false (and takes nothing) when the balance is too low. |
| `pay` (obrigatória) | `(amount: number) => void` | Adds a payout to the balance. |
| `reset` (obrigatória) | `() => void` | Returns the balance to its starting amount. |

#### `HistoryEntry`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `number \| string` | Stable key of the round. |
| `label` (obrigatória) | `string` | Text of the chip, for example "2.31×". |
| `tone` (obrigatória) | `"low" \| "mid" \| "high"` | "low" is muted, "mid" is tinted, "high" takes the accent fill. |

### Outras exportações

- `formatAmount` (função)
- `formatMultiplier` (função)
- `roundAmount` (função)
- `usePlayMoney` (hook)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No botão principal, aposta e solta a faixa; durante o deslize ele fica `aria-disabled`, mas mantém o foco. |
| `Enter` | No campo de aposta, confirma o valor e o ajusta entre `minBet` e o saldo. |

## Acessibilidade

- A faixa é `aria-hidden`; o resultado chega ao leitor de tela pela região `role="status"` do cartão (“Sliding with a bet of…”, “Landed on…”), e as chances ficam numa lista rotulada.
- Saldo com texto oculto, atalhos de aposta com `aria-label` e botão principal com `aria-disabled` seguem o padrão dos outros jogos; todos os textos estão em inglês.

## Movimento

- A faixa dispara, passa a maior parte do percurso desacelerando e para um pouco fora do centro, assentando no ladrilho com uma mola; o ponteiro do marcador dá toques conforme os ladrilhos passam por ele.
- Ao parar, o ladrilho vencedor cresce com sombra, os outros esmaecem e o marcador cresce junto; na montagem, os ladrilhos entram do centro para fora.
- Com “reduzir movimento” ligado, a faixa não corre: ela reaparece na posição final com um esmaecer curto, sem o toque do ponteiro, sem crescimento e sem entrada escalonada.

## Comportamento responsivo

- O cartão vai até 36rem e é um contêiner: aposta e botão ficam lado a lado a partir de 28rem; a faixa ocupa a largura toda e esmaece nas bordas, com ladrilhos fixos de 76 px.

## Notas para IA

- `tiles` recebe `multiplier` e `weight` (peso 2 sai duas vezes mais que peso 1); entradas com peso zero ou multiplicador negativo são descartadas, e sem nenhuma válida volta a tabela padrão.
- `duration` (3.8 s) é o tempo da corrida até parar; `onRoundEnd` chega quando a faixa para, e `random` só é chamado na aposta, para sortear o resultado e preencher a faixa.
- A tabela padrão tem pesos que somam 100 e paga em média 0.97 da aposta; é dinheiro de mentira, com a própria cópia de `play-money.tsx`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/slide-game · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
