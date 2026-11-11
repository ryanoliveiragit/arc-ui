import { useMemo, useState } from "react";
import RangeHistogramSlider from "@/registry/components/range-histogram-slider/range-histogram-slider";
import { Caption, Stack } from "./_kit";

function prices() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const out: number[] = [];
  for (let i = 0; i < 260; i++) {
    const n = (rnd() + rnd() + rnd()) / 3;
    out.push(Math.round(40 + n * n * 560));
  }
  return out;
}

export default function RangeHistogramSliderDemo() {
  const data = useMemo(prices, []);
  const [range, setRange] = useState<[number, number]>([120, 320]);
  const count = data.filter((p) => p >= range[0] && p <= range[1]).length;
  return (
    <Stack width={460} gap={4}>
      <RangeHistogramSlider label="Nightly price" data={data} value={range} onValueChange={setRange} min={40} max={600} format={(v) => `$${Math.round(v)}`} />
      <Caption>{count} of {data.length} stays between ${Math.round(range[0])} and ${Math.round(range[1])}.</Caption>
    </Stack>
  );
}
