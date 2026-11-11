import { useState } from "react";
import { PlinkoGame } from "@/registry/components/plinko-game/plinko-game";
import type { PlinkoDrop, PlinkoRisk } from "@/registry/components/plinko-game/plinko-game";
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
