import { SmartFormFill } from "@/registry/components/smart-form-fill/smart-form-fill";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 700 };

export default function SmartFormFillDemo() {
  return (
    <Stack gap={3} width={680}>
      <SmartFormFill />
    </Stack>
  );
}
