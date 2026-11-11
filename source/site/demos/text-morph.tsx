import { useState } from "react";
import TextMorph from "@/registry/components/text-morph/text-morph";
import { Button } from "@/registry/components/button/button";
import { Caption, Stack } from "./_kit";

const states = ["Draft", "In review", "Approved", "Published"];

export default function TextMorphDemo() {
  const [i, setI] = useState(0);
  return (
    <Stack align="center" gap={5}>
      <TextMorph as="h2">{states[i]!}</TextMorph>
      <Button variant="secondary" onClick={() => setI((i + 1) % states.length)}>Advance status</Button>
      <Caption>Shared letters stay put while the rest morph.</Caption>
    </Stack>
  );
}
