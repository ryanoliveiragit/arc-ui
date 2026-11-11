var e=`import { useState } from "react";
import DonutChart, { type DonutChartDatum } from "@/registry/components/donut-chart/donut-chart";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const datasets: Record<string, DonutChartDatum[]> = {
  august: [
    { key: "search", label: "Organic search", value: 48200 },
    { key: "direct", label: "Direct", value: 31400 },
    { key: "social", label: "Social", value: 14800 },
    { key: "email", label: "Email", value: 11900 },
    { key: "referral", label: "Referral", value: 8300 },
    { key: "ads", label: "Paid ads", value: 2100 },
  ],
  september: [
    { key: "search", label: "Organic search", value: 52600 },
    { key: "direct", label: "Direct", value: 29800 },
    { key: "social", label: "Social", value: 21700 },
    { key: "email", label: "Email", value: 9400 },
    { key: "referral", label: "Referral", value: 10200 },
    { key: "ads", label: "Paid ads", value: 6500 },
  ],
};

export default function DonutChartDemo() {
  const [month, setMonth] = useState("august");
  return (
    <Stack gap={4} width={520}>
      <SegmentedControl label="Month" value={month} onValueChange={setMonth} options={[{ value: "august", label: "August" }, { value: "september", label: "September" }]} />
      <Surface>
        <DonutChart data={datasets[month] ?? []} label="Visits by source" unit="visits" totalLabel="Total visits" />
      </Surface>
      <Caption>Hover a segment or legend row to read it in the center; click a legend row to hide it.</Caption>
    </Stack>
  );
}
`;export{e as default};