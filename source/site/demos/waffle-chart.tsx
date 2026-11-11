import { useState } from "react";
import WaffleChart, { type WaffleCategory } from "@/registry/components/waffle-chart/waffle-chart";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const years: Record<string, WaffleCategory[]> = {
  "2015": [
    { key: "wind", label: "Wind", value: 64 },
    { key: "solar", label: "Solar", value: 18 },
    { key: "hydro", label: "Hydro", value: 120 },
    { key: "nuclear", label: "Nuclear", value: 210 },
    { key: "gas", label: "Gas", value: 380 },
    { key: "coal", label: "Coal", value: 408 },
  ],
  "2023": [
    { key: "wind", label: "Wind", value: 215 },
    { key: "solar", label: "Solar", value: 190 },
    { key: "hydro", label: "Hydro", value: 132 },
    { key: "nuclear", label: "Nuclear", value: 205 },
    { key: "gas", label: "Gas", value: 340 },
    { key: "coal", label: "Coal", value: 118 },
  ],
};

export default function WaffleChartDemo() {
  const [year, setYear] = useState("2015");
  return (
    <Stack gap={4} width={520}>
      <SegmentedControl label="Year" value={year} onValueChange={setYear} options={[{ value: "2015", label: "2015" }, { value: "2023", label: "2023" }]} />
      <Surface>
        <WaffleChart data={years[year] ?? []} label={`Electricity generation, ${year}`} unit="TWh" />
      </Surface>
      <Caption>One cell is one percent. Switch years and cells fly to their new group; hover a legend row to focus a source.</Caption>
    </Stack>
  );
}
