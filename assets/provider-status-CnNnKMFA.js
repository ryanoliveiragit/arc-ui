var e=`import { ProviderStatus } from "@/registry/components/provider-status/provider-status";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 680 };

export default function ProviderStatusDemo() {
  return (
    <Stack gap={3} width={720}>
      <ProviderStatus
        defaultExpandedId="openai"
        footnote="Sample data on simulated checks — no requests were sent. Latency is the median over the last 5 minutes."
      />
    </Stack>
  );
}
`;export{e as default};