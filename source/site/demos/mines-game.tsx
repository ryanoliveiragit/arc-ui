import { useState } from "react";
import { MinesGame } from "@/registry/components/mines-game/mines-game";
import type { MinesRound } from "@/registry/components/mines-game/mines-game";
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
