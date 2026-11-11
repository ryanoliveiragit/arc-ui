import { useState } from "react";
import SlotText from "@/registry/components/slot-text/slot-text";
import { Button } from "@/registry/components/button/button";
import { Row, Stack } from "./_kit";

export default function SlotTextDemo() {
  const [visits, setVisits] = useState(12480);
  const [city, setCity] = useState(0);
  const cities = ["LISBON", "TOKYO", "AUSTIN", "BERLIN"];
  return (
    <Stack align="center" gap={6}>
      <div style={{ fontSize: "var(--text-4xl, 48px)", fontWeight: 600, color: "var(--text-primary)" }}><SlotText value={visits} /></div>
      <Row justify="center">
        <Button variant="secondary" onClick={() => setVisits(Math.floor(Math.random() * 90000) + 1000)}>Randomize visits</Button>
        <Button variant="ghost" onClick={() => setVisits(v => v + 999)}>Add 999</Button>
      </Row>
      <div style={{ fontSize: "var(--text-xl)", letterSpacing: "0.1em", color: "var(--text-secondary)" }}><SlotText value={cities[city]!} /></div>
      <Button size="sm" variant="secondary" onClick={() => setCity((city + 1) % cities.length)}>Next city</Button>
    </Stack>
  );
}
