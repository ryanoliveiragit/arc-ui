import { useState } from "react";
import DonutChart, { type DonutChartDatum } from "@/registry/components/donut-chart/donut-chart";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Row, Stack, Surface } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

type Period = "week" | "month" | "year";

const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

interface Dataset {
  range: string;
  formatValue: (value: number) => string;
  data: DonutChartDatum[];
}

const datasets: Record<Period, Dataset> = {
  week: {
    range: "Sep 15–21, 2026",
    formatValue: value => grouped.format(value),
    data: [
      { key: "search", label: "Search", value: 4210 },
      { key: "direct", label: "Direct", value: 2380 },
      { key: "newsletter", label: "Newsletter", value: 1940 },
      { key: "referrals", label: "Referrals", value: 1120 },
      { key: "social", label: "Social", value: 385 },
      { key: "podcasts", label: "Podcasts", value: 130 },
      { key: "partners", label: "Partners", value: 70 },
    ],
  },
  month: {
    range: "Aug 23 – Sep 21, 2026",
    formatValue: value => grouped.format(value),
    data: [
      { key: "search", label: "Search", value: 16840 },
      { key: "direct", label: "Direct", value: 8120 },
      { key: "newsletter", label: "Newsletter", value: 5260 },
      { key: "referrals", label: "Referrals", value: 6430 },
      { key: "social", label: "Social", value: 2910 },
      { key: "podcasts", label: "Podcasts", value: 640 },
      { key: "partners", label: "Partners", value: 410 },
    ],
  },
  year: {
    range: "Oct 2025 – Sep 2026",
    formatValue: value => (value >= 100000 ? compact.format(value) : grouped.format(value)),
    data: [
      { key: "search", label: "Search", value: 168300 },
      { key: "direct", label: "Direct", value: 71900 },
      { key: "newsletter", label: "Newsletter", value: 38400 },
      { key: "referrals", label: "Referrals", value: 52700 },
      { key: "social", label: "Social", value: 41200 },
      { key: "podcasts", label: "Podcasts", value: 16400 },
      { key: "partners", label: "Partners", value: 10100 },
    ],
  },
};

export default function DonutChartDemo() {
  const [period, setPeriod] = useState<Period>("month");
  const dataset = datasets[period];
  return (
    <Surface width={570} padding={5}>
      <Stack gap={5}>
        <Row justify="space-between" wrap={false}>
          <div>
            <h3 style={{ margin: 0, color: "var(--foreground)", fontSize: 15, fontWeight: 600 }}>Visits by source</h3>
            <Caption>{dataset.range}</Caption>
          </div>
          <SegmentedControl label="Visits period" options={[{ value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "year", label: "Year" }]} value={period} onValueChange={value => setPeriod(value as Period)} />
        </Row>
        <DonutChart key={period} data={dataset.data} label={`Visits by source, ${dataset.range}`} totalLabel="Visits" formatValue={dataset.formatValue} />
      </Stack>
    </Surface>
  );
}
