# Mines game

> Campo 5×5 de mentirinha: vire as peças para achar gemas e aumentar o multiplicador, mas uma mina encerra a rodada.

- Tipo: componente (categoria Jogos), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/mines-game
- Descrição original (inglês): A play-money mines game on a 5×5 grid: tiles flip to reveal gems that raise the multiplier, and a mine ends the round unless you cash out first.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/mines-game.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/mines-game.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/mines-game.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/mines-game.json`. Caminho do registro, relativo ao endereço do site: `r/mines-game.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/mines-game/mines-game.tsx`
  - `components/ryan-ui/mines-game/mines-game.module.css`
  - `components/ryan-ui/mines-game/play-money.tsx`
  - `components/ryan-ui/mines-game/play-money.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/mines-game.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Demos ou áreas de jogo com saldo fictício em que cada gema encontrada aumenta o multiplicador e a pessoa decide quando parar.
- Jogos jogáveis pelo teclado: o tabuleiro 5 × 5 tem foco itinerante e setas para andar entre as casas.
- Explicar risco e recompensa: mais minas dão saltos maiores no multiplicador, que é o pagamento justo menos `margin`.

## Quando não usar

- Não use com dinheiro real nem prêmios: o saldo é fictício e as minas são sorteadas no navegador com `random`.
- Use [`crash-game`](crash-game.md) quando a tensão deve vir do tempo, sacando antes do estouro de uma curva ao vivo.
- Use [`plinko-game`](plinko-game.md) ou [`slide-game`](slide-game.md) quando o resultado deve sair sozinho, sem decisões durante a rodada.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { MinesGame } from "@/components/ryan-ui/mines-game/mines-game";
import type { MinesRound } from "@/components/ryan-ui/mines-game/mines-game";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 620 };

const amount = (value: number) => `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(2)}`;

export default function MinesGameDemo() {
  const [mines, setMines] = useState(3);
  const [rounds, setRounds] = useState<MinesRound[]>([]);
  const last = rounds[rounds.length - 1];
  const net = rounds.reduce((sum, round) => sum + round.payout - round.bet, 0);
  return (
    <Stack width={640} gap={3}>
      <MinesGame mines={mines} onMinesChange={setMines} defaultBet={10} onRoundEnd={round => setRounds(list => [...list, round])} />
      <Caption>
        {last
          ? `Round ${last.id}: ${last.gems} ${last.gems === 1 ? "gem" : "gems"} with ${last.mines} ${last.mines === 1 ? "mine" : "mines"}, ${last.outcome === "mine" ? "ended by a mine" : `cashed out at ${last.multiplier.toFixed(2)}×`}. Session: ${amount(net)} over ${rounds.length} ${rounds.length === 1 ? "round" : "rounds"}.`
          : `${mines} of the 25 tiles hide a mine. Bet, flip tiles to collect gems and cash out whenever you like. Arrow keys move across the board.`}
      </Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `MinesGame`

A mines game with fake money: every gem uncovered in the 5×5 grid raises the multiplier, a mine ends the round, and tiles flip to show what they hid.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `balance` | `number` | — | Controlled play-money balance. |
| `defaultBalance` | `number` | `1000` | Starting balance when uncontrolled; the reset button returns to it. |
| `onBalanceChange` | `(balance: number) => void` | — | Called with the new balance after a bet, a payout or a reset. |
| `defaultBet` | `number` | `10` | Bet amount shown at first. |
| `minBet` | `number` | `1` | Smallest bet. |
| `mines` | `number` | — | Controlled number of mines hidden in the 25 tiles, from 1 to 24. |
| `defaultMines` | `number` | `3` | Number of mines at first when uncontrolled. |
| `onMinesChange` | `(mines: number) => void` | — | Called when the player changes the number of mines. |
| `margin` | `number` | `0.03` | Part of each payout the game keeps, from 0 to 0.5. |
| `onRoundEnd` | `(round: MinesRound) => void` | — | Called when a round ends, by a cash out or by a mine. |
| `random` | `() => number` | `Math.random` | Random source returning a number in [0, 1). Called only when a bet is placed, to hide the mines. |
| `title` | `string` | `"Mines"` | Name shown in the header. |
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

#### `MinesRound`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `number` | Round number, starting at 1. |
| `mines` (obrigatória) | `number` | Mines hidden in the grid this round. |
| `gems` (obrigatória) | `number` | Gems the player uncovered. |
| `multiplier` (obrigatória) | `number` | Multiplier reached with those gems. |
| `outcome` (obrigatória) | `"cashed-out" \| "mine"` | "cashed-out" when the player left with the payout, "mine" when a mine ended the round. |
| `bet` (obrigatória) | `number` | Amount bet. |
| `payout` (obrigatória) | `number` | Amount paid back (0 after a mine). |

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
| `↑` ou `↓` ou `←` ou `→` | No tabuleiro, movem o foco entre as casas e param na borda, sem dar a volta. |
| `Home` ou `End` | Levam o foco à primeira ou à última casa da linha atual. |
| `Enter` ou `Espaço` | Numa casa fechada durante a rodada, vira a casa. |
| `Tab` | Entra no tabuleiro pela última casa focada, a única na ordem de foco, e depois segue para os controles de aposta e de minas. |
| `Enter` ou `Espaço` | No botão principal, aposta, saca depois da primeira gema e aposta de novo; é o mesmo `<button>` o tempo todo. |
| `Enter` | No campo de aposta, confirma o valor e o ajusta entre `minBet` e o saldo. |

## Acessibilidade

- O tabuleiro é um `role="group"` com foco itinerante (só uma casa tem `tabIndex={0}`), e cada casa diz linha, coluna e estado (“hidden”, “gem” ou “mine”) no `aria-label`.
- Casas já viradas ou fora de rodada usam `aria-disabled` e continuam na navegação; cada jogada é anunciada numa região `role="status"`, e o número de minas, noutra região viva.
- Saldo, atalhos de aposta e botão principal seguem o padrão dos outros jogos, com `aria-disabled` para manter o foco; todos os textos estão em inglês.

## Movimento

- As casas viram em 3D com uma mola de leve quique; no fim da rodada, as que faltam viram numa onda que parte da casa em foco, e uma mina faz o tabuleiro tremer.
- O multiplicador dá um pequeno salto a cada gema, o número de minas rola na direção do ajuste e, numa nova aposta, as casas abertas fecham numa varredura diagonal.
- Com “reduzir movimento” ligado, as casas viram na hora, sem onda, tremor, entrada escalonada nem elevação no hover.

## Comportamento responsivo

- O cartão vai até 40rem e é um contêiner: estreito, o tabuleiro fica acima dos controles; a partir de 34rem os dois ficam lado a lado, com o painel em 15rem e o tabuleiro em até 24rem.

## Notas para IA

- `mines` (1 a 24) pode ser controlado com `onMinesChange`; a cada fim de rodada, `onRoundEnd` traz gemas, multiplicador, resultado (`cashed-out` ou `mine`), aposta e pagamento.
- `random` só é chamado na aposta, para esconder as minas, então um gerador com semente torna o tabuleiro repetível; achar todas as gemas encerra a rodada com saque automático.
- Como os outros jogos, é dinheiro de mentira com a própria cópia de `play-money.tsx`; o saldo pode ser controlado com `balance` e `onBalanceChange`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/mines-game · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
