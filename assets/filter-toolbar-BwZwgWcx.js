var e=`import { useState } from "react";
import { FilterToolbar, type FilterChip, type FilterField } from "@/registry/components/filter-toolbar/filter-toolbar";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 460 };

const fields: FilterField[] = [
  { id: "status", label: "Status", options: ["Open", "In review", "Merged", "Closed"] },
  { id: "assignee", label: "Assignee", options: ["Emma Collins", "Marcus Johnson", "Jasmine Brooks", "Olivia Bennett"] },
  { id: "label", label: "Label", options: [{ value: "bug", label: "Bug", hint: 12 }, { value: "feature", label: "Feature", hint: 8 }, { value: "docs", label: "Docs", hint: 3 }] },
  { id: "priority", label: "Priority", options: ["Urgent", "High", "Medium", "Low"] },
];

export default function FilterToolbarDemo() {
  const [filters, setFilters] = useState<FilterChip[]>([
    { id: "status", label: "Status", value: "Open" },
    { id: "assignee", label: "Assignee", value: "Marcus Johnson" },
  ]);
  const add = (chip: FilterChip) => setFilters(current => [...current.filter(f => f.id !== chip.id), chip]);

  return (
    <Stack width={640} gap={4}>
      <FilterToolbar
        filters={filters}
        onRemove={id => setFilters(current => current.filter(f => f.id !== id))}
        onClearAll={() => setFilters([])}
        addFilter={{ fields, onAdd: add, align: "start" }}
      />
      <Caption>{filters.length ? \`\${filters.length} active filter\${filters.length === 1 ? "" : "s"}\` : "No filters applied"}. Use Add filter to pick a field, then a value.</Caption>
    </Stack>
  );
}
`;export{e as default};