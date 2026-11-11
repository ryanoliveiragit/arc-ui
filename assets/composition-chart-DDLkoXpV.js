var e=`import { useState } from "react";
import CompositionChart, { type CompositionPart } from "@/registry/components/composition-chart/composition-chart";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const services = (values: number[]): CompositionPart[] => [
  { key: "compute", label: "Compute", value: values[0] ?? 0 },
  { key: "database", label: "Databases", value: values[1] ?? 0 },
  { key: "storage", label: "Storage", value: values[2] ?? 0 },
  { key: "network", label: "Networking", value: values[3] ?? 0 },
  { key: "other", label: "Everything else", value: values[4] ?? 0 },
];

const months: Record<string, { name: string; parts: CompositionPart[] }> = {
  sep: { name: "September", parts: services([18400, 7600, 9200, 4100, 2300]) },
  oct: { name: "October", parts: services([21300, 8900, 9800, 3600, 2900]) },
  nov: { name: "November", parts: services([19800, 12400, 11200, 3900, 2600]) },
};

const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function CompositionChartDemo() {
  const [month, setMonth] = useState("nov");
  const current = months[month] ?? months.nov;
  return (
    <Stack gap={4} width={560}>
      <SegmentedControl label="Month" value={month} onValueChange={setMonth} options={[{ value: "sep", label: "Sep" }, { value: "oct", label: "Oct" }, { value: "nov", label: "Nov" }]} />
      <Surface>
        {current && <CompositionChart data={current.parts} label="Cloud spend by service" totalLabel={\`total in \${current.name}\`} formatValue={(value) => dollars.format(value)} />}
      </Surface>
      <Caption>Switch the month and the segments slide to their new shares. Select a legend row to leave that service out of the whole.</Caption>
    </Stack>
  );
}
`;export{e as default};