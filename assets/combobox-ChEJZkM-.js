var e=`import { useState } from "react";
import { Combobox } from "@/registry/components/combobox/combobox";
import { Caption, Stack } from "./_kit";

const countries = ["Argentina", "Australia", "Brazil", "Canada", "Chile", "Denmark", "France", "Germany", "India", "Ireland", "Japan", "Mexico", "Netherlands", "Portugal", "Spain", "Sweden", "United Kingdom", "United States"].map((c) => ({ value: c.toLowerCase().replace(/ /g, "-"), label: c }));

export default function ComboboxDemo() {
  const [value, setValue] = useState("");
  const label = countries.find((c) => c.value === value)?.label;
  return (
    <Stack gap={3} width={360}>
      <Combobox label="Country" description="Where should we ship your order?" options={countries} value={value} onValueChange={setValue} placeholder="Search countries…" />
      <Caption>{label ? \`Shipping to \${label}.\` : "Type to filter, then pick with the keyboard or mouse."}</Caption>
    </Stack>
  );
}
`;export{e as default};