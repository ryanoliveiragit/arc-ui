import { useState } from "react";
import { Stepper } from "@/registry/components/stepper/stepper";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack } from "./_kit";

const steps = [
  { id: "cart", label: "Cart", description: "3 items" },
  { id: "shipping", label: "Shipping", description: "Lisbon, PT" },
  { id: "payment", label: "Payment", description: "Visa 4242" },
  { id: "review", label: "Review", description: "Confirm order" },
];

export default function StepperDemo() {
  const [current, setCurrent] = useState(1);
  const [failed, setFailed] = useState(false);
  const shown = failed ? steps.map(s => (s.id === "payment" ? { ...s, error: "Card declined" } : s)) : steps;
  return (
    <Stack gap={6} width={560}>
      <Stepper steps={shown} current={current} onStepSelect={setCurrent} label="Checkout" completeLabel="Order placed" />
      <Row>
        <Button size="sm" variant="secondary" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>Back</Button>
        <Button size="sm" disabled={current >= steps.length} onClick={() => setCurrent(c => c + 1)}>{current === steps.length - 1 ? "Place order" : "Continue"}</Button>
        <Button size="sm" variant="ghost" onClick={() => setFailed(f => !f)}>{failed ? "Clear error" : "Fail payment"}</Button>
      </Row>
      <Caption>Click a finished step to go back to it.</Caption>
      <Stack gap={2} width={260}>
        <Stepper steps={steps.slice(0, 3)} current={1} orientation="vertical" label="Vertical example" />
      </Stack>
    </Stack>
  );
}
