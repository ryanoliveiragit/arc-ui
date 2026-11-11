import { useState } from "react";
import SlopeChart, { type SlopeItem } from "@/registry/components/slope-chart/slope-chart";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const channels = {
  h1: { start: "Q1", end: "Q2", data: [
    { key: "email", label: "Email", start: 4.8, end: 5.6 },
    { key: "search", label: "Organic search", start: 3.9, end: 4.2 },
    { key: "referral", label: "Referral", start: 3.1, end: 3.9 },
    { key: "social", label: "Social", start: 2.2, end: 1.8 },
    { key: "paid", label: "Paid ads", start: 2.6, end: 2.1 },
    { key: "direct", label: "Direct", start: 3.5, end: 3.4 },
  ] as SlopeItem[] },
  h2: { start: "Q3", end: "Q4", data: [
    { key: "email", label: "Email", start: 5.8, end: 6.4 },
    { key: "search", label: "Organic search", start: 4.3, end: 4.0 },
    { key: "referral", label: "Referral", start: 4.0, end: 4.9 },
    { key: "social", label: "Social", start: 1.9, end: 2.7 },
    { key: "paid", label: "Paid ads", start: 2.0, end: 3.2 },
    { key: "direct", label: "Direct", start: 3.3, end: 3.1 },
  ] as SlopeItem[] },
};

export default function SlopeChartDemo() {
  const [half, setHalf] = useState<"h1" | "h2">("h1");
  const c = channels[half];
  return (
    <Stack gap={4} width={560}>
      <SegmentedControl label="Period" value={half} onValueChange={(v) => setHalf(v as "h1" | "h2")} options={[{ value: "h1", label: "Q1 to Q2" }, { value: "h2", label: "Q3 to Q4" }]} />
      <Surface>
        <SlopeChart data={c.data} label="Conversion rate by channel" startLabel={c.start} endLabel={c.end} highlightKey="email" formatValue={(v) => `${v.toFixed(1)}%`} />
      </Surface>
      <Caption>Email is highlighted. Hover a line to focus it, or switch quarters to slide every line to its new slope.</Caption>
    </Stack>
  );
}
