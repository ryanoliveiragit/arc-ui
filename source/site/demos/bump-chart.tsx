import { useState } from "react";
import BumpChart, { type BumpSeries } from "@/registry/components/bump-chart/bump-chart";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

const region = (key: string, label: string, values: number[]): BumpSeries => ({ key, label, values });
const metrics: Record<string, { label: string; format: (value: number) => string; series: BumpSeries[] }> = {
  revenue: {
    label: "Sales regions ranked by monthly revenue",
    format: (value) => `$${value}k`,
    series: [
      region("online", "Online", [240, 286, 338, 381, 426, 472]),
      region("west", "West", [430, 419, 436, 450, 438, 447]),
      region("northeast", "Northeast", [412, 428, 405, 398, 441, 456]),
      region("southeast", "Southeast", [388, 395, 418, 432, 420, 415]),
      region("midwest", "Midwest", [301, 322, 340, 365, 402, 430]),
      region("southwest", "Southwest", [355, 340, 332, 318, 305, 298]),
    ],
  },
  customers: {
    label: "Sales regions ranked by new customers",
    format: (value) => `${value} new`,
    series: [
      region("online", "Online", [58, 79, 100, 112, 121, 138]),
      region("west", "West", [110, 104, 98, 95, 102, 94]),
      region("northeast", "Northeast", [96, 88, 91, 84, 80, 86]),
      region("southeast", "Southeast", [72, 85, 93, 101, 97, 92]),
      region("midwest", "Midwest", [64, 70, 66, 78, 88, 99]),
      region("southwest", "Southwest", [81, 76, 70, 73, 69, 62]),
    ],
  },
};

export default function BumpChartDemo() {
  const [metric, setMetric] = useState("revenue");
  const current = metrics[metric] ?? metrics.revenue;
  return (
    <Stack gap={4} width={600}>
      <SegmentedControl label="Rank by" value={metric} onValueChange={setMetric} options={[{ value: "revenue", label: "Revenue" }, { value: "customers", label: "New customers" }]} />
      <Surface>
        {current && <BumpChart series={current.series} periods={months} label={current.label} formatValue={current.format} />}
      </Surface>
      <Caption>Hover a line to bring that region forward with its rank in every month. Switching the measure slides each line to its new places.</Caption>
    </Stack>
  );
}
