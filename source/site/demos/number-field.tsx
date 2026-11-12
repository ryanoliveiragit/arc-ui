import { useState } from "react";
import { NumberField } from "@/registry/components/number-field/number-field";
import { Caption, Row, Stack } from "./_kit";

export default function NumberFieldDemo() {
  const [seats, setSeats] = useState(5);
  const [price, setPrice] = useState(19.5);
  return (
    <Stack gap={6} width={420} align="center" style={{ textAlign: "center" }}>
      <NumberField label="Team seats" description="Hold a button to speed up, or drag the label." value={seats} onValueChange={setSeats} min={1} max={50} scrub suffix={(v) => (v === 1 ? " seat" : " seats")} />
      <Row justify="center">
        <NumberField label="Price" value={price} onValueChange={setPrice} min={0} max={999} step={0.5} prefix="$" size="sm" />
      </Row>
      <Caption>Total: ${(seats * price).toFixed(2)} per month.</Caption>
    </Stack>
  );
}
