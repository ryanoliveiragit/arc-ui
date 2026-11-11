import { useMemo, useState } from "react";
import Treemap, { type TreemapNode } from "@/registry/components/treemap/treemap";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

type Leaf = [string, string, number, number, number, number]; // id, label, value 2025, value 2026, growth 2025, growth 2026
const groups: { id: string; label: string; items: Leaf[] }[] = [
  { id: "software", label: "Software", items: [
    ["saas", "Subscriptions", 420, 510, 0.18, 0.21],
    ["licenses", "Licenses", 180, 150, -0.06, -0.17],
    ["marketplace", "Marketplace", 90, 130, 0.32, 0.44],
  ] },
  { id: "services", label: "Services", items: [
    ["consulting", "Consulting", 210, 225, 0.05, 0.07],
    ["training", "Training", 70, 95, 0.12, 0.36],
    ["support", "Premium support", 140, 160, 0.09, 0.14],
  ] },
  { id: "hardware", label: "Hardware", items: [
    ["devices", "Devices", 230, 190, -0.08, -0.17],
    ["accessories", "Accessories", 85, 80, 0.02, -0.06],
  ] },
  { id: "partners", label: "Partners", items: [
    ["resellers", "Resellers", 160, 185, 0.1, 0.16],
    ["affiliates", "Affiliates", 55, 75, 0.2, 0.36],
  ] },
];

function tree(year: 0 | 1): TreemapNode {
  return {
    id: "root",
    label: "Revenue",
    children: groups.map((g) => ({
      id: g.id,
      label: g.label,
      children: g.items.map((i) => ({ id: i[0], label: i[1], value: year ? i[3] : i[2], color: year ? i[5] : i[4] })),
    })),
  };
}

export default function TreemapDemo() {
  const [year, setYear] = useState<"2025" | "2026">("2025");
  const data = useMemo(() => tree(year === "2025" ? 0 : 1), [year]);
  return (
    <Stack gap={4} width={760}>
      <SegmentedControl label="Year" value={year} onValueChange={(v) => setYear(v as "2025" | "2026")} options={[{ value: "2025", label: "2025" }, { value: "2026", label: "2026" }]} />
      <Surface>
        <Treemap
          data={data}
          label="Revenue by line of business"
          formatValue={(v) => `$${v}K`}
          colorLabel="Growth"
          formatColor={(v) => `${v > 0 ? "+" : ""}${Math.round(v * 100)}%`}
          height={340}
        />
      </Surface>
      <Caption>Click a block to drill in and use the breadcrumb to climb back. Shading shows growth; switch years to morph the tiles.</Caption>
    </Stack>
  );
}
