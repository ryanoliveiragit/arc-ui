import { useMemo, useState } from "react";
import Ridgeline, { type RidgelineSeries } from "@/registry/components/ridgeline/ridgeline";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// mean high in Zurich per month, and a shift for a warmer scenario
const base = [3, 5, 10, 14, 19, 23, 25, 24, 20, 14, 7, 4];

function make(shift: number): RidgelineSeries[] {
  let s = 17;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());
  return months.map((m, i) => ({
    id: m,
    label: m,
    values: Array.from({ length: 31 }, () => Math.round(((base[i] ?? 0) + shift + gauss() * (2.6 + (i % 3 === 0 ? 0.8 : 0))) * 10) / 10),
  }));
}

export default function RidgelineDemo() {
  const sets = useMemo(() => ({ y1995: make(0), y2025: make(1.8) }), []);
  const [key, setKey] = useState<"y1995" | "y2025">("y1995");
  return (
    <Stack gap={4} width={600}>
      <SegmentedControl label="Decade" value={key} onValueChange={(v) => setKey(v as "y1995" | "y2025")} options={[{ value: "y1995", label: "1990s" }, { value: "y2025", label: "2020s" }]} />
      <Surface>
        <Ridgeline series={sets[key]} label="Daily highs in Zurich" unit="°C" domain={[-6, 36]} rowHeight={26} />
      </Surface>
      <Caption>Hover a ridge to lift it and read its quartiles. Switch decades and every curve morphs.</Caption>
    </Stack>
  );
}
