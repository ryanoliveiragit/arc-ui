import { useState } from "react";
import ChipGroup from "@/registry/components/chip-group/chip-group";
import { Caption, Stack } from "./_kit";

const topics = ["Design systems", "Accessibility", "Motion", "Typography", "Performance", "Testing", "Tooling", "Research"].map((label) => ({ value: label.toLowerCase().replace(/ /g, "-"), label }));
const sizes = [{ value: "s", label: "Small" }, { value: "m", label: "Medium" }, { value: "l", label: "Large" }];

export default function ChipGroupDemo() {
  const [value, setValue] = useState<string[]>(["motion"]);
  const [size, setSize] = useState<string[]>(["m"]);
  return (
    <Stack gap={6} width={420}>
      <Stack gap={2}>
        <ChipGroup label="Topics" options={topics} value={value} onValueChange={setValue} maxVisible={5} />
        <Caption>{value.length ? `${value.length} selected` : "Nothing selected"}. Extra chips fold behind “more”.</Caption>
      </Stack>
      <Stack gap={2}>
        <Caption>Single choice</Caption>
        <ChipGroup label="Size" options={sizes} value={size} onValueChange={setSize} multiple={false} />
      </Stack>
    </Stack>
  );
}
