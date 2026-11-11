var e=`import { useMemo, useState } from "react";
import BrushChart, { type BrushChartDatum, type BrushChartAnnotation } from "@/registry/components/brush-chart/brush-chart";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack, Surface } from "./_kit";

const DAY = 86400000;
const START = Date.UTC(2025, 9, 1);

function build(): BrushChartDatum[] {
  let s = 11;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  return Array.from({ length: 400 }, (_, i) => {
    const date = START + i * DAY;
    const dow = new Date(date).getUTCDay();
    const trend = 8200 + i * 18;
    const weekly = dow === 0 || dow === 6 ? -1400 : 600;
    const wave = Math.sin(i / 23) * 700;
    return { date, value: Math.round(trend + weekly + wave + (rand() - 0.5) * 900) };
  });
}

const annotations: BrushChartAnnotation[] = [
  { date: Date.UTC(2025, 11, 2), label: "v2 launch", description: "Redesigned onboarding shipped to everyone." },
  { date: Date.UTC(2026, 2, 10), label: "Pricing change", description: "Free tier limits lowered." },
  { date: Date.UTC(2026, 5, 18), label: "Mobile app", description: "iOS and Android apps released." },
];

export default function BrushChartDemo() {
  const data = useMemo(build, []);
  const [range, setRange] = useState<[number, number] | undefined>(undefined);
  const jump = (from: number, to: number) => setRange([from, to]);
  return (
    <Stack gap={4} width={820}>
      <Row>
        <Button size="sm" variant="secondary" onClick={() => jump(Date.UTC(2026, 2, 1), Date.UTC(2026, 3, 30))}>Spring 2026</Button>
        <Button size="sm" variant="secondary" onClick={() => jump(Date.UTC(2026, 4, 20), Date.UTC(2026, 6, 20))}>Around the app launch</Button>
        <Button size="sm" variant="ghost" onClick={() => jump(Number(data[0]?.date), Number(data[data.length - 1]?.date))}>Show all</Button>
      </Row>
      <Surface>
        <BrushChart
          data={data}
          label="Daily active users"
          unit="users"
          annotations={annotations}
          range={range}
          defaultRange={[Date.UTC(2026, 0, 1), Date.UTC(2026, 3, 15)]}
          onRangeChange={setRange}
        />
      </Surface>
      <Caption>Drag the window in the strip below to pan, pull its handles to zoom, or use the shortcuts to glide it.</Caption>
    </Stack>
  );
}
`;export{e as default};