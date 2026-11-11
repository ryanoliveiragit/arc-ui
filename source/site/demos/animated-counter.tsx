import { useState } from "react";
import { AnimatedCounter } from "@/registry/components/animated-counter/animated-counter";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack } from "./_kit";

const steps = [
  { users: 12480, revenue: 48210.5, uptime: 99.94 },
  { users: 13912, revenue: 52874.25, uptime: 99.98 },
  { users: 9275, revenue: 39130.75, uptime: 99.71 },
  { users: 18340, revenue: 71906.0, uptime: 100 },
];

const big = { fontSize: "var(--text-2xl, 2rem)", fontWeight: 600 } as const;

export default function AnimatedCounterDemo() {
  const [i, setI] = useState(0);
  const s = steps[i] ?? steps[0]!;
  return (
    <Stack gap={8} align="center">
      <Row gap={10} justify="center" align="start">
        <div style={big}><AnimatedCounter label="Active users" value={s.users} /></div>
        <div style={big}><AnimatedCounter label="Monthly revenue" value={s.revenue} prefix="$" decimals={2} /></div>
        <div style={big}><AnimatedCounter label="Uptime" value={s.uptime} suffix="%" decimals={2} /></div>
      </Row>
      <Button variant="secondary" onClick={() => setI((i + 1) % steps.length)}>Load next period</Button>
      <Caption>Each digit rolls to its new place. Period {i + 1} of {steps.length}.</Caption>
    </Stack>
  );
}
