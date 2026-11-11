import { useState } from "react";
import DateRangePicker, { type DateRange } from "@/registry/components/date-range-picker/date-range-picker";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function DateRangePickerDemo() {
  const [range, setRange] = useState<DateRange | null>(null);
  return (
    <Stack gap={3} width={360}>
      <DateRangePicker label="Reporting period" value={range} onChange={setRange} placeholder="Select dates" />
      <Caption>{range ? `Showing ${fmt(range.start)} to ${fmt(range.end)}.` : "Choose a preset or click two days."}</Caption>
    </Stack>
  );
}
