import { useState } from "react";
import { MetricCard } from "@/registry/components/metric-card/metric-card";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Stack } from "./_kit";

const ranges = {
  "7D": { label: "Weekly active users", value: 2486, change: "+18.4%", context: "Compared with the last 7 days" },
  "30D": { label: "Monthly active users", value: 9312, change: "+6.2%", context: "Compared with the last 30 days" },
  "90D": { label: "Quarterly active users", value: 21870, change: "\u22122.1%", context: "Compared with the last 90 days" },
};

export default function MetricCardDemo() {
  const [range, setRange] = useState<"7D" | "30D" | "90D">("7D");
  const metric = ranges[range];
  return (
    <Stack gap={5} align="center">
      <div style={{ width: 300 }}>
        <MetricCard label={metric.label} value={metric.value} change={metric.change} context={metric.context} />
      </div>
      <SegmentedControl
        label="Metric range"
        value={range}
        onValueChange={(next) => setRange(next === "30D" || next === "90D" ? next : "7D")}
        options={[
          { value: "7D", label: "7D" },
          { value: "30D", label: "30D" },
          { value: "90D", label: "90D" },
        ]}
      />
    </Stack>
  );
}
