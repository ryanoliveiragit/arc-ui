var e=`import { useState } from "react";
import { MetricCard } from "@/registry/components/metric-card/metric-card";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack } from "./_kit";

const weeks = [
  { revenue: 48210, orders: 1284, sat: 94, rc: "+12.4%", oc: "+8.1%", cc: "+3 pts" },
  { revenue: 41930, orders: 1176, sat: 91, rc: "-13.0%", oc: "-8.4%", cc: "-3 pts" },
  { revenue: 55780, orders: 1391, sat: 97, rc: "+33.0%", oc: "+18.3%", cc: "+6 pts" },
];

export default function MetricCardDemo() {
  const [i, setI] = useState(0);
  const w = weeks[i] ?? weeks[0]!;
  return (
    <Stack gap={6} align="center" width={820}>
      <Row gap={4} justify="center" align="stretch">
        <div style={{ width: 240 }}><MetricCard label="Revenue (USD)" value={w.revenue} context="vs. previous week" change={w.rc} /></div>
        <div style={{ width: 240 }}><MetricCard label="Orders" value={w.orders} context="vs. previous week" change={w.oc} /></div>
        <div style={{ width: 240 }}><MetricCard label="Satisfaction" value={w.sat} suffix="%" context="vs. previous week" change={w.cc} /></div>
      </Row>
      <Button variant="secondary" onClick={() => setI((i + 1) % weeks.length)}>Show next week</Button>
      <Caption>Numbers roll and the change text slides in the direction the value moved.</Caption>
    </Stack>
  );
}
`;export{e as default};