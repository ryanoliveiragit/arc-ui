var e=`import { useMemo, useState } from "react";
import Streamgraph, { type StreamgraphDatum, type StreamgraphSeries } from "@/registry/components/streamgraph/streamgraph";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const series: StreamgraphSeries[] = [
  { key: "billing", label: "Billing" },
  { key: "login", label: "Login" },
  { key: "bugs", label: "Bugs" },
  { key: "howto", label: "How-to" },
  { key: "api", label: "API" },
];
const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function build(weeks: number, startMs: number, seed: number): StreamgraphDatum[] {
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const bases = [60, 38, 52, 44, 26];
  return Array.from({ length: weeks }, (_, i) => {
    const d = new Date(startMs + i * 7 * 86400000);
    const values: Record<string, number> = {};
    series.forEach((sr, k) => {
      values[sr.key] = Math.round((bases[k] ?? 40) * (1 + 0.45 * Math.sin(i / 2.5 + k * 1.3)) + rand() * 10);
    });
    return { key: d.toISOString().slice(0, 10), label: \`Week of \${fmt.format(d)}\`, axisLabel: i % 3 === 0 ? fmt.format(d) : undefined, values };
  });
}

export default function StreamgraphDemo() {
  const sets = useMemo(() => ({ q3: build(13, Date.UTC(2026, 6, 6), 4), q4: build(13, Date.UTC(2026, 9, 5), 12) }), []);
  const [q, setQ] = useState<"q3" | "q4">("q3");
  return (
    <Stack gap={4} width={760}>
      <SegmentedControl label="Quarter" value={q} onValueChange={(v) => setQ(v as "q3" | "q4")} options={[{ value: "q3", label: "Q3 2026" }, { value: "q4", label: "Q4 2026" }]} />
      <Surface>
        <Streamgraph data={sets[q]} series={series} label="Support tickets by topic" unit="tickets" />
      </Surface>
      <Caption>Hover a layer to isolate it and read it week by week; toggle topics in the legend; switch quarters to morph.</Caption>
    </Stack>
  );
}
`;export{e as default};