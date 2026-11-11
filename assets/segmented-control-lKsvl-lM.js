var e=`import { useState } from "react";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack } from "./_kit";

export default function SegmentedControlDemo() {
  const [range, setRange] = useState("week");
  const [view, setView] = useState("chart");
  const revenue: Record<string, string> = { day: "$1,240", week: "$8,915", month: "$37,402", year: "$441,870" };
  return (
    <Stack width={380} gap={6} align="center">
      <Stack gap={2} align="center">
        <SegmentedControl label="Time range" value={range} onValueChange={setRange} options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "year", label: "Year" }]} />
        <Caption>Revenue this {range}: {revenue[range]}</Caption>
      </Stack>
      <SegmentedControl label="View" value={view} onValueChange={setView} options={[{ value: "chart", label: "Chart" }, { value: "table", label: "Table" }]} />
    </Stack>
  );
}
`;export{e as default};