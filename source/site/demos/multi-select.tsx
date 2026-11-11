import { useState } from "react";
import { MultiSelect } from "@/registry/components/multi-select/multi-select";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const options = ["Design", "Engineering", "Marketing", "Sales", "Support", "Finance", "Legal", "People"].map((l) => ({ value: l.toLowerCase(), label: l }));

export default function MultiSelectDemo() {
  const [value, setValue] = useState<string[]>(["design", "engineering", "support"]);
  return (
    <Stack gap={3} width={360}>
      <MultiSelect label="Teams" description="Who can see this report?" options={options} value={value} onValueChange={setValue} placeholder="Select teams" />
      <Caption>{value.length} of {options.length} teams selected.</Caption>
    </Stack>
  );
}
