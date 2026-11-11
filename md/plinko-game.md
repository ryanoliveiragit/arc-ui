# Plinko game

> Tabuleiro de plinko de mentirinha: a bolinha quica nos pinos, para a esquerda ou a direita, e acende a casa do multiplicador.

- Tipo: componente (categoria Jogos), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/plinko-game
- Descrição original (inglês): A play-money plinko board: each ball bounces left or right off every row of pegs and lights up the multiplier slot it lands in.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/plinko-game.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/plinko-game.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/plinko-game.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/plinko-game.json`. Caminho do registro, relativo ao endereço do site: `r/plinko-game.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/plinko-game/plinko-game.tsx`
  - `components/ryan-ui/plinko-game/plinko-game.module.css`
  - `components/ryan-ui/plinko-game/play-money.tsx`
  - `components/ryan-ui/plinko-game/play-money.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/plinko-game.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Demos ou áreas de jogo com saldo fictício em que várias bolas caem ao mesmo tempo, cada uma com a própria aposta.
- Mostrar uma distribuição binomial em ação: as casas do meio saem mais e pagam menos, as das pontas são raras e pagam mais.
- Quando a pessoa escolhe o risco (`low`, `medium`, `high`) e vê a tabela de multiplicadores mudar na hora.

## Quando não usar

- Não use com dinheiro real nem prêmios: o saldo é fictício e o caminho de cada bola é sorteado no navegador com `random`.
- Use [`crash-game`](crash-game.md) ou [`mines-game`](mines-game.md) quando a pessoa deve decidir durante a rodada, sacando antes de perder.
- Use [`slide-game`](slide-game.md) para um resultado por aposta com as chances de cada multiplicador à mostra.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { PlinkoGame } from "@/components/ryan-ui/plinko-game/plinko-game";
import type { PlinkoDrop, PlinkoRisk } from "@/components/ryan-ui/plinko-game/plinko-game";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 620 };

const amount = (value: number) => `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(2)}`;

export default function PlinkoGameDemo() {
  const [risk, setRisk] = useState<PlinkoRisk>("medium");
  const [drops, setDrops] = useState<PlinkoDrop[]>([]);
  const best = drops.reduce((top, drop) => Math.max(top, drop.multiplier), 0);
  const net = drops.reduce((sum, drop) => sum + drop.payout - drop.bet, 0);
  return (
    <Stack width={672} gap={3}>
      <PlinkoGame rows={8} risk={risk} onRiskChange={setRisk} defaultBet={10} onDrop={drop => setDrops(list => [...list, drop])} />
      <Caption>
        {drops.length
          ? `${drops.length} ${drops.length === 1 ? "ball" : "balls"} at ${risk} risk: best slot ${best}×, session ${amount(net)}.`
          : "Drop a ball and it bounces left or right off each of the 8 rows. Press the button several times to send a few balls at once."}
      </Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `PlinkoGame`

A plinko board with fake money: each ball bounces left or right off every row of pegs and lights up the multiplier slot it lands in.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `balance` | `number` | — | Controlled play-money balance. |
| `defaultBalance` | `number` | `1000` | Starting balance when uncontrolled; the reset button returns to it. |
| `onBalanceChange` | `(balance: number) => void` | — | Called with the new balance after a bet, a payout or a reset. |
| `defaultBet` | `number` | `10` | Bet amount shown at first. |
| `minBet` | `number` | `1` | Smallest bet. |
| `rows` | `number` | `8` | Rows of pegs, from 6 to 12. The board ends in rows + 1 slots. |
| `risk` | `"low" \| "medium" \| "high"` | — | Controlled risk. Higher risk pays more at the edges and less in the middle. |
| `defaultRisk` | `"low" \| "medium" \| "high"` | `"medium"` | Risk at first when uncontrolled. |
| `onRiskChange` | `(risk: PlinkoRisk) => void` | — | Called when the player picks another risk. |
| `multipliers` | `number[]` | — | Your own multipliers, one per slot from left to right (rows + 1 values). Replaces the table computed from `risk`. |
| `margin` | `number` | `0.03` | Part of each bet the computed table keeps on average, from 0 to 0.5. |
| `maxBalls` | `number` | `8` | How many balls may fall at the same time. |
| `onDrop` | `(drop: PlinkoDrop) => void` | — | Called when a ball lands in a slot. |
| `random` | `() => number` | `Math.random` | Random source returning a number in [0, 1). Called only while a ball is dropped, to choose its path. |
| `title` | `string` | `"Plinko"` | Name shown in the header. |
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

| Tipo | Definição |
| --- | --- |
| `PlinkoRisk` | `"low" \| "medium" \| "high"` |

#### `PlinkoDrop`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `number` | Ball number, starting at 1. |
| `slot` (obrigatória) | `number` | Slot the ball landed in, counted from the left starting at 0. |
| `multiplier` (obrigatória) | `number` | Multiplier of that slot. |
| `bet` (obrigatória) | `number` | Amount bet on the ball. |
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
| `Enter` ou `Espaço` | No botão “Drop a ball”, solta uma bola; repetir solta outras, até `maxBalls` caindo juntas. |
| `↑` ou `↓` ou `←` ou `→` | No grupo de risco, troca entre “Low”, “Medium” e “High” (rádios nativos); fica bloqueado enquanto há bolas caindo. |
| `Enter` | No campo de aposta, confirma o valor e o ajusta entre `minBet` e o saldo. |
| `Tab` | Passa por zerar o saldo, aposta, ½, 2×, Max, o risco marcado e o botão de soltar. |

## Acessibilidade

- O tabuleiro é `aria-hidden`; o leitor de tela encontra a lista de multiplicadores das casas, da esquerda para a direita, e ouve cada pouso (“Ball N landed on…”) numa região `role="status"`.
- O risco é um grupo de rádios nativos rotulado “Risk”, cada um dentro de um `<label>`; o contorno de foco do teclado aparece no segmento.
- Com várias bolas, cada pouso gera um anúncio novo; textos e anúncios estão fixos em inglês.

## Movimento

- Cada bola cai e, em cada fileira, quica para a esquerda ou para a direita com um pequeno impulso para cima antes da gravidade; o pino tocado acende e cresce.
- A casa onde a bola cai afunda e acende, fica com um anel até a próxima queda, e os valores trocam com um leve deslize quando o risco muda.
- Com “reduzir movimento” ligado, nenhuma bola é desenhada: o resultado sai após uma pausa curta e a casa só acende, sem afundar.

## Comportamento responsivo

- O cartão vai até 42rem e é um contêiner: o tabuleiro fica acima dos controles e passa para o lado a partir de 36rem, com no máximo 27rem de largura.
- O tabuleiro é um SVG que escala inteiro, e as casas acompanham a largura dele; abaixo de 22rem o “×” some dos rótulos.

## Desempenho

- Um callback por quadro move todas as bolas direto no DOM, sem renderizar o React a cada passo; `maxBalls` (8) limita quantas caem juntas e `rows` vai de 6 a 12.

## Notas para IA

- `risk` recalcula a tabela pela chance binomial de cada casa; para uma tabela sua, passe `multipliers` com exatamente `rows + 1` valores, senão ela é ignorada.
- A aposta sai do saldo quando a bola é solta e o pagamento entra no pouso, quando `onDrop` chega com casa, multiplicador, aposta e pagamento.
- O campo de aposta continua editável com bolas caindo e cada bola guarda a aposta do momento em que saiu; é dinheiro de mentira, com a própria cópia de `play-money.tsx`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/plinko-game · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
