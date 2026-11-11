var e=`import { useState } from "react";
import { StreamingResponse } from "@/registry/components/streaming-response/streaming-response";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./streaming-response.module.css";

export const stage: DemoStage = { height: 560 };

const answer = \`Start by replacing fixed durations with springs. A spring has no set length: it reacts to where the element is and how fast it is already moving, so an interrupted animation carries on smoothly instead of snapping back to the start.

Next, give related elements a small stagger. Thirty to forty milliseconds between list rows is enough for the eye to read an order without the interface feeling slow.

Finally, keep exits shorter than entrances. People wait for what is arriving and rarely for what is leaving, so a quick fade out keeps the whole screen feeling responsive.\`;

const speeds = { calm: 8, natural: 16, fast: 42 } as const;
type Pace = keyof typeof speeds;

export default function StreamingResponseDemo() {
  const [pace, setPace] = useState<Pace>("natural");
  return (
    <Stack width={560} gap={3}>
      <Surface padding={6} style={{ minHeight: 372, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>How do I make my animations feel less robotic?</p>
        <StreamingResponse className={styles.fill} text={answer} speed={speeds[pace]} />
      </Surface>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <SegmentedControl
          label="Pace"
          value={pace}
          onValueChange={value => setPace(value as Pace)}
          options={[{ value: "calm", label: "Calm" }, { value: "natural", label: "Natural" }, { value: "fast", label: "Fast" }]}
        />
        <Caption>{speeds[pace]} words per second. The pace changes mid-stream.</Caption>
      </div>
    </Stack>
  );
}
`;export{e as default};