# Crash game

> Jogo de brincadeira em que o multiplicador sobe numa curva até quebrar; saia antes para ficar com a aposta multiplicada.

- Tipo: componente (categoria Jogos), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/crash-game
- Descrição original (inglês): A play-money crash game: the multiplier climbs along a live curve until it crashes at a random point, and you cash out first to keep your bet times the multiplier.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/crash-game.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/crash-game.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/crash-game.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/crash-game.json`. Caminho do registro, relativo ao endereço do site: `r/crash-game.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/crash-game/crash-game.tsx`
  - `components/ryan-ui/crash-game/crash-game.module.css`
  - `components/ryan-ui/crash-game/play-money.tsx`
  - `components/ryan-ui/crash-game/play-money.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/crash-game.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Demos ou áreas de jogo com saldo fictício em que a graça é sacar antes de a curva estourar.
- Mostrar movimento ao vivo: uma curva exponencial desenhada a cada quadro, o histórico de estouros em chips e o saldo contando até o novo valor.
- Simulações e testes de probabilidade, com um `random` próprio para repetir rodadas e `onRoundEnd` para registrar cada resultado.

## Quando não usar

- Não use com dinheiro real nem prêmios: o saldo é fictício, o sorteio roda no navegador com `random` e nada prova que a rodada foi justa.
- Use [`slide-game`](slide-game.md) quando o resultado deve sair de uma vez, sem decisão durante a rodada.
- Use [`mines-game`](mines-game.md) quando a pessoa decide passo a passo, no próprio ritmo, sem um relógio correndo.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { CrashGame } from "@/components/ryan-ui/crash-game/crash-game";
import type { CrashRound } from "@/components/ryan-ui/crash-game/crash-game";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 700 };

const amount = (value: number) => `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(2)}`;

export default function CrashGameDemo() {
  const [rounds, setRounds] = useState<CrashRound[]>([]);
  const last = rounds[rounds.length - 1];
  const net = rounds.reduce((sum, round) => sum + round.payout - round.bet, 0);
  return (
    <Stack width={544} gap={3}>
      <CrashGame defaultBalance={1000} defaultBet={10} onRoundEnd={round => setRounds(list => [...list, round])} />
      <Caption>
        {last
          ? `Round ${last.id} crashed at ${last.crashPoint.toFixed(2)}×: ${last.cashedOutAt === null ? "the bet was lost" : `you were out at ${last.cashedOutAt.toFixed(2)}×`}. Session: ${amount(net)} over ${rounds.length} ${rounds.length === 1 ? "round" : "rounds"}.`
          : "Bet, watch the multiplier climb and cash out before the curve crashes. The balance is fake and resets from the header."}
      </Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CrashGame`

A crash game with fake money: the multiplier climbs along a curve until it crashes at a random point; cash out first to keep the bet times the multiplier.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `balance` | `number` | — | Controlled play-money balance. |
| `defaultBalance` | `number` | `1000` | Starting balance when uncontrolled; the reset button returns to it. |
| `onBalanceChange` | `(balance: number) => void` | — | Called with the new balance after a bet, a payout or a reset. |
| `defaultBet` | `number` | `10` | Bet amount shown at first. |
| `minBet` | `number` | `1` | Smallest bet. |
| `maxMultiplier` | `number` | `50` | A round never goes past this multiplier. |
| `margin` | `number` | `0.03` | Part of each bet the game keeps on average, from 0 to 0.5. It makes early crashes a little more likely. |
| `speed` | `number` | `0.26` | Growth of the curve: the multiplier is e^(speed × seconds). |
| `defaultHistory` | `number[]` | `sampleHistory` | Crash points of earlier rounds for the history chips, newest first. |
| `historySize` | `number` | `8` | How many history chips to keep. |
| `onRoundEnd` | `(round: CrashRound) => void` | — | Called when a round crashes, with what the player got out of it. |
| `random` | `() => number` | `Math.random` | Random source returning a number in [0, 1). Called once per round, when the bet is placed. |
| `title` | `string` | `"Crash"` | Name shown in the header. |
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

#### `CrashRound`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `number` | Round number, starting at 1. |
| `crashPoint` (obrigatória) | `number` | Multiplier at which the round crashed. |
| `cashedOutAt` (obrigatória) | `number \| null` | Multiplier the player cashed out at, or null when the bet was lost. |
| `bet` (obrigatória) | `number` | Amount bet. |
| `payout` (obrigatória) | `number` | Amount paid back (0 when the bet was lost). |

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
| `Enter` ou `Espaço` | No botão principal, aposta, saca durante a rodada e aposta de novo; é o mesmo `<button>` a rodada inteira, então o foco não sai dele. |
| `Enter` | No campo de aposta, confirma o valor e o ajusta entre `minBet` e o saldo. |
| `Tab` | Passa por zerar o saldo, aposta, ½, 2×, Max, saque automático e o botão principal; os campos ficam desativados durante a rodada. |

## Acessibilidade

- O cartão é uma `<section>` com o nome de `title`, e uma região `role="status"` anuncia início, saque e estouro de cada rodada (“Round started…”, “Cashed out at…”, “Crashed at…”).
- O gráfico é `aria-hidden`; o saldo tem um texto oculto “Play-money balance” com o valor, e os atalhos ½, 2× e Max têm `aria-label` próprio.
- Quando a ação não está disponível, o botão principal usa `aria-disabled` em vez de `disabled`, para continuar focável; todos os textos estão em inglês.

## Movimento

- O multiplicador sobe numa curva exponencial redesenhada a cada quadro, com escalas que se esticam junto, como uma câmera se afastando; o ponto da frente pulsa.
- No estouro, curva e número passam para a cor de perigo, um anel se expande do ponto e o número treme; o saque deixa uma marca na curva e o saldo conta até o novo valor com um “+” que sobe.
- Com “reduzir movimento” ligado, a rodada continua, mas a curva avança em poucos passos por segundo, sem pulso, anel nem tremor.

## Comportamento responsivo

- O cartão vai até 34rem e é um contêiner: o gráfico tem de 13rem a 16.5rem de altura conforme a largura, e aposta e saque automático ficam lado a lado a partir de 26rem.

## Desempenho

- Durante a rodada, um callback por quadro reescreve os caminhos do SVG direto no DOM, sem renderizar o React; um `ResizeObserver` redesenha o gráfico quando ele muda de tamanho.

## Notas para IA

- O saldo é fictício e pode viver no componente (`defaultBalance`) ou fora dele (`balance` com `onBalanceChange`); `onRoundEnd` informa aposta, ponto de estouro, saque e pagamento.
- Passe `random` com semente para testes ou replays: ele é chamado uma vez por rodada, na aposta; `margin` (0 a 0.5) deixa estouros cedo um pouco mais prováveis e `maxMultiplier` (50) limita o estouro.
- A pasta traz a própria cópia de `play-money.tsx` (saldo, campo de aposta, botão e histórico); `speed` controla a subida, com o multiplicador igual a e^(`speed` × segundos).

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/crash-game · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
