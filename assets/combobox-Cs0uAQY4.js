var e=`import { useState } from "react";
import { Combobox } from "@/registry/components/combobox/combobox";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

const countries = ["Argentina", "Australia", "Brazil", "Canada", "Chile", "Côte d’Ivoire", "Denmark", "France", "Germany", "India", "Ireland", "Japan", "México", "Netherlands", "Portugal", "Spain", "Sweden", "United Kingdom", "United States"].map((c) => ({ value: c, label: c }));

export default function ComboboxDemo() {
  // The preview opens the list on load, with the space below the field reserved for it. Typing ignores accents
  // ("mexico" finds México), and values with spaces are fine.
  const [value, setValue] = useState("");
  return (
    <Stack gap={3} width={360}>
      <div style={{ paddingBottom: 316 }}>
        <Combobox label="Country" options={countries} value={value} onValueChange={setValue} placeholder="Search countries…" defaultOpen />
      </div>
      <Caption>{value ? \`Shipping to \${value}.\` : "Type to filter (accents optional), then pick with the keyboard or mouse."}</Caption>
    </Stack>
  );
}
`;export{e as default};