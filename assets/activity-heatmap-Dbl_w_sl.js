var e=`import { useMemo, useState } from "react";
import ActivityHeatmap, { type ActivityDay } from "@/registry/components/activity-heatmap/activity-heatmap";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function year(y: number, seed: number): ActivityDay[] {
  const rand = seeded(seed);
  const days: ActivityDay[] = [];
  const start = Date.UTC(y, 0, 1);
  const end = Date.UTC(y, 11, 31);
  for (let t = start, i = 0; t <= end; t += 86400000, i++) {
    const d = new Date(t);
    const dow = d.getUTCDay();
    const weekend = dow === 0 || dow === 6;
    const season = 0.6 + 0.4 * Math.sin((i / 365) * Math.PI * 3);
    const burst = rand() > 0.93 ? 2.2 : 1;
    const base = weekend ? 1.2 : 6;
    const count = rand() < (weekend ? 0.55 : 0.12) ? 0 : Math.round(base * season * burst * (0.3 + rand() * 1.4));
    days.push({ date: d.toISOString().slice(0, 10), count });
  }
  return days;
}

export default function ActivityHeatmapDemo() {
  const [period, setPeriod] = useState("2025");
  const [selected, setSelected] = useState<string | null>(null);
  const data = useMemo(() => ({ "2025": year(2025, 7), "2024": year(2024, 21) }), []);
  const days = data[period as "2025" | "2024"];
  const total = days.reduce((n, d) => n + d.count, 0).toLocaleString("en-US");

  return (
    <Stack gap={4} width={820}>
      <Surface>
        <ActivityHeatmap
          days={days}
          label={\`Contributions in \${period}\`}
          period={period}
          selectedDate={selected}
          onSelectDate={(d) => setSelected((cur) => (cur === d ? null : d))}
          actions={<SegmentedControl label="Year" value={period} onValueChange={setPeriod} options={[{ value: "2025", label: "2025" }, { value: "2024", label: "2024" }]} />}
        />
      </Surface>
      <Caption>{total} contributions in {period}. Hover a square for its day, click one to select it, or switch the year.</Caption>
    </Stack>
  );
}
`;export{e as default};