import { useState } from "react";
import { Textarea } from "@/registry/components/textarea/textarea";
import { Caption, Stack } from "./_kit";

export default function TextareaDemo() {
  const [text, setText] = useState("");
  const max = 280;
  const over = text.length > max;
  return (
    <Stack width={420} gap={3}>
      <Textarea label="Feedback" description="Tell us what we could do better." placeholder="The export button was hard to find because…" rows={4} value={text} onChange={(e) => setText(e.target.value)} error={over ? `${text.length - max} characters over the limit.` : undefined} />
      <Caption>{text.length} / {max}</Caption>
    </Stack>
  );
}
