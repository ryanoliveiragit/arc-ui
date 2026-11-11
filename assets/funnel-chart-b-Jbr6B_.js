var e=`import { useState } from "react";
import FunnelChart, { type FunnelStage } from "@/registry/components/funnel-chart/funnel-chart";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface, type DemoStage } from "./_kit";

export const stage: DemoStage = { height: 660 };

const stages = (values: number[]): FunnelStage[] => [
  { key: "views", label: "Product views", value: values[0] ?? 0 },
  { key: "cart", label: "Added to cart", value: values[1] ?? 0 },
  { key: "checkout", label: "Checkout", value: values[2] ?? 0 },
  { key: "payment", label: "Payment", value: values[3] ?? 0 },
  { key: "purchase", label: "Purchased", value: values[4] ?? 0 },
];

const devices: Record<string, FunnelStage[]> = {
  desktop: stages([18400, 11960, 8130, 5690, 4380]),
  mobile: stages([26900, 13180, 7250, 4060, 2640]),
};

export default function FunnelChartDemo() {
  const [device, setDevice] = useState("desktop");
  return (
    <Stack gap={4} width={560}>
      <SegmentedControl label="Device" value={device} onValueChange={setDevice} options={[{ value: "desktop", label: "Desktop" }, { value: "mobile", label: "Mobile" }]} />
      <Surface>
        <FunnelChart data={devices[device] ?? []} label="Checkout funnel, last 30 days" unit="shoppers" />
      </Surface>
      <Caption>Stages grow in from the top. Hover a stage, or focus the chart and use the arrow keys, to see how many continued and how many dropped.</Caption>
    </Stack>
  );
}
`;export{e as default};