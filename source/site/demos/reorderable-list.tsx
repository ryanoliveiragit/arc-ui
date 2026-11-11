import { useState } from "react";
import { ReorderableList, type ReorderableItem } from "@/registry/components/reorderable-list/reorderable-list";
import { Caption, Stack } from "./_kit";

const initial: ReorderableItem[] = [
  { id: "design", title: "Finish checkout redesign", detail: "Due Monday" },
  { id: "review", title: "Review pull request #482", detail: "Marcus is waiting" },
  { id: "research", title: "Summarize interview notes", detail: "8 interviews" },
  { id: "release", title: "Publish release notes", detail: "Version 2.4" },
  { id: "backlog", title: "Groom the backlog", detail: "Friday" },
];

export default function ReorderableListDemo() {
  const [items, setItems] = useState(initial);
  return (
    <Stack width={420} gap={3}>
      <ReorderableList items={items} onReorder={setItems} label="Today's priorities" />
      <Caption>Drag by the handle, or focus it and use the arrow keys. Top priority: {items[0]?.title}.</Caption>
    </Stack>
  );
}
