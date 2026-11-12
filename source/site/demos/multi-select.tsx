import { useState } from "react";
import { MultiSelect } from "@/registry/components/multi-select/multi-select";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

const options = ["Design", "Engineering", "Marketing", "Sales", "Support", "Finance", "Legal", "People"].map((l) => ({ value: l.toLowerCase(), label: l }));

export default function MultiSelectDemo() {
  // The preview opens the menu on load (focus stays on the page); the space below the field is reserved for it.
  const [value, setValue] = useState<string[]>(["design", "engineering", "support"]);
  return (
    <Stack gap={3} width={360}>
      <div style={{ paddingBottom: 324 }}>
        <MultiSelect label="Teams" options={options} value={value} onValueChange={setValue} placeholder="Select teams" defaultOpen />
      </div>
      <Caption>{value.length} of {options.length} teams can see this report. Arrow keys move, Enter or Space toggles.</Caption>
    </Stack>
  );
}
