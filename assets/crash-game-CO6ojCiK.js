var e=`import { useState } from "react";
import { CrashGame } from "@/registry/components/crash-game/crash-game";
import type { CrashRound } from "@/registry/components/crash-game/crash-game";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 700 };

const amount = (value: number) => \`\${value < 0 ? "−" : "+"}\${Math.abs(value).toFixed(2)}\`;

export default function CrashGameDemo() {
  const [rounds, setRounds] = useState<CrashRound[]>([]);
  const last = rounds[rounds.length - 1];
  const net = rounds.reduce((sum, round) => sum + round.payout - round.bet, 0);
  return (
    <Stack width={544} gap={3}>
      <CrashGame defaultBalance={1000} defaultBet={10} onRoundEnd={round => setRounds(list => [...list, round])} />
      <Caption>
        {last
          ? \`Round \${last.id} crashed at \${last.crashPoint.toFixed(2)}×: \${last.cashedOutAt === null ? "the bet was lost" : \`you were out at \${last.cashedOutAt.toFixed(2)}×\`}. Session: \${amount(net)} over \${rounds.length} \${rounds.length === 1 ? "round" : "rounds"}.\`
          : "Bet, watch the multiplier climb and cash out before the curve crashes. The balance is fake and resets from the header."}
      </Caption>
    </Stack>
  );
}
`;export{e as default};