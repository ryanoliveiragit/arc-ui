var e=`import { useState } from "react";
import { SlideGame } from "@/registry/components/slide-game/slide-game";
import type { SlideRound } from "@/registry/components/slide-game/slide-game";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

const amount = (value: number) => \`\${value < 0 ? "−" : "+"}\${Math.abs(value).toFixed(2)}\`;

export default function SlideGameDemo() {
  const [rounds, setRounds] = useState<SlideRound[]>([]);
  const best = rounds.reduce((top, round) => Math.max(top, round.multiplier), 0);
  const net = rounds.reduce((sum, round) => sum + round.payout - round.bet, 0);
  return (
    <Stack width={576} gap={3}>
      <SlideGame defaultBet={10} onRoundEnd={round => setRounds(list => [...list, round])} />
      <Caption>
        {rounds.length
          ? \`\${rounds.length} \${rounds.length === 1 ? "round" : "rounds"} played: best stop \${best}×, session \${amount(net)}.\`
          : "Bet and the strip shoots past the marker, slows down and stops on the multiplier that pays your bet."}
      </Caption>
    </Stack>
  );
}
`;export{e as default};