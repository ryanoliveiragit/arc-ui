var e=`import { TrainingRun } from "@/registry/components/training-run/training-run";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

export default function TrainingRunDemo() {
  return (
    <Stack gap={3} width={640}>
      <TrainingRun />
    </Stack>
  );
}
`;export{e as default};