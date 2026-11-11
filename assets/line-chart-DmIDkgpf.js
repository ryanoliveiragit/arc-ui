var e=`import { useState } from "react";
import LineChart, { type LineChartDatum, type LineChartSeries } from "@/registry/components/line-chart/line-chart";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const fmtLong = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

function build(days: number, seed: number): LineChartDatum[] {
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const start = Date.UTC(2026, 8, 21) - (days - 1) * 86400000;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start + i * 86400000);
    const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
    const trend = 1 + (i / days) * 0.5;
    const signups = Math.round((weekend ? 70 : 120) * trend + Math.sin(i / 3) * 12 + rand() * 18);
    const trials = Math.round(signups * 0.62 + rand() * 10);
    const previous = Math.round((weekend ? 60 : 100) + Math.sin(i / 4) * 10 + rand() * 14);
    return {
      key: d.toISOString().slice(0, 10),
      label: fmtLong.format(d),
      axisLabel: i % (days > 10 ? 7 : 2) === 0 ? fmt.format(d) : undefined,
      values: { signups, trials, previous },
    };
  });
}

const sets = { "7": build(7, 3), "14": build(14, 5), "30": build(30, 9) };
const series: LineChartSeries[] = [
  { key: "signups", label: "Signups" },
  { key: "trials", label: "Trials started", color: "var(--series-2)", area: false },
  { key: "previous", label: "Previous period", dashed: true, area: false },
];

export default function LineChartDemo() {
  const [range, setRange] = useState<keyof typeof sets>("14");
  return (
    <Stack gap={4} width={680}>
      <SegmentedControl label="Range" value={range} onValueChange={(v) => setRange(v as keyof typeof sets)} options={[{ value: "7", label: "7 days" }, { value: "14", label: "14 days" }, { value: "30", label: "30 days" }]} />
      <Surface>
        <LineChart data={sets[range]} series={series} label="Signups" unit="" />
      </Surface>
      <Caption>Move across the plot for the crosshair, click a legend entry to hide a line, or change the range to morph the paths.</Caption>
    </Stack>
  );
}
`;export{e as default};