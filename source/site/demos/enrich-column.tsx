import { EnrichColumn } from "@/registry/components/enrich-column/enrich-column";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

export default function EnrichColumnDemo() {
  return (
    <Stack gap={3} width={720}>
      <EnrichColumn />
    </Stack>
  );
}
