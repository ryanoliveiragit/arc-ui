var e=`import { useState } from "react";
import BarChart, { type BarChartDatum } from "@/registry/components/bar-chart/bar-chart";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const day = (iso: string) => new Date(\`\${iso}T00:00:00Z\`);
const long = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const short = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function range(startIso: string, values: number[], weekly: boolean): BarChartDatum[] {
  return values.map((value, i) => {
    const d = new Date(day(startIso).getTime() + i * 86400000);
    return {
      key: d.toISOString().slice(0, 10),
      label: long.format(d),
      axisLabel: weekly ? "SMTWTFS"[d.getUTCDay()] : i % 5 === 0 ? short.format(d) : undefined,
      value,
    };
  });
}

const week = range("2026-09-15", [42, 67, 55, 81, 38, 24, 59], true);
const month = range("2026-08-23", [30, 44, 52, 61, 48, 22, 18, 39, 57, 63, 70, 51, 27, 20, 46, 58, 66, 49, 72, 33, 25, 41, 62, 68, 74, 55, 29, 21, 47, 64], false);

export default function BarChartDemo() {
  const [mode, setMode] = useState("week");
  return (
    <Stack gap={4} width={560}>
      <SegmentedControl label="Range" value={mode} onValueChange={setMode} options={[{ value: "week", label: "Week" }, { value: "month", label: "30 days" }]} />
      <Surface>
        <BarChart
          data={mode === "week" ? week : month}
          label="Active minutes"
          period={mode === "week" ? "Sep 15–21, 2026" : "Aug 23 – Sep 21, 2026"}
          unit="min"
        />
      </Surface>
      <Caption>Drag across the bars to scrub values. Switching the range morphs the bars and the average line.</Caption>
    </Stack>
  );
}
`;export{e as default};