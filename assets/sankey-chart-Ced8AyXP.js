var e=`import { useState } from "react";
import SankeyChart, { type SankeyLink, type SankeyNode } from "@/registry/components/sankey-chart/sankey-chart";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface, type DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const nodes: SankeyNode[] = [
  { id: "search", label: "Organic search" },
  { id: "ads", label: "Paid ads" },
  { id: "social", label: "Social" },
  { id: "email", label: "Email" },
  { id: "home", label: "Home" },
  { id: "pricing", label: "Pricing" },
  { id: "blog", label: "Blog" },
  { id: "signup", label: "Signed up" },
  { id: "browse", label: "Browsed" },
  { id: "bounce", label: "Bounced" },
];

const flow = (source: string, target: string, value: number): SankeyLink => ({ source, target, value });
const weeks: Record<string, SankeyLink[]> = {
  current: [
    flow("search", "home", 2100), flow("search", "pricing", 800), flow("search", "blog", 2300),
    flow("ads", "home", 1200), flow("ads", "pricing", 1900),
    flow("social", "home", 900), flow("social", "blog", 1500),
    flow("email", "pricing", 1100), flow("email", "blog", 600),
    flow("home", "signup", 900), flow("home", "browse", 1800), flow("home", "bounce", 1500),
    flow("pricing", "signup", 1700), flow("pricing", "browse", 1300), flow("pricing", "bounce", 800),
    flow("blog", "signup", 500), flow("blog", "browse", 1600), flow("blog", "bounce", 2300),
  ],
  previous: [
    flow("search", "home", 1800), flow("search", "pricing", 700), flow("search", "blog", 2900),
    flow("ads", "home", 800), flow("ads", "pricing", 1400),
    flow("social", "home", 1300), flow("social", "blog", 2200),
    flow("email", "pricing", 900), flow("email", "blog", 400),
    flow("home", "signup", 700), flow("home", "browse", 1700), flow("home", "bounce", 1500),
    flow("pricing", "signup", 1300), flow("pricing", "browse", 1100), flow("pricing", "bounce", 600),
    flow("blog", "signup", 600), flow("blog", "browse", 2100), flow("blog", "bounce", 2800),
  ],
};

export default function SankeyChartDemo() {
  const [week, setWeek] = useState("current");
  return (
    <Stack gap={4} width={600}>
      <SegmentedControl label="Week" value={week} onValueChange={setWeek} options={[{ value: "current", label: "This week" }, { value: "previous", label: "Last week" }]} />
      <Surface>
        <SankeyChart nodes={nodes} links={weeks[week] ?? []} label="Visits by source, landing page and outcome" columns={["Source", "Landing page", "Outcome"]} unit="visits" />
      </Surface>
      <Caption>Hover a node or a ribbon to trace its flows. Focus the chart and use the arrow keys to walk the nodes.</Caption>
    </Stack>
  );
}
`;export{e as default};