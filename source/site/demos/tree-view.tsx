import { useState } from "react";
import { TreeView, type TreeNode } from "@/registry/components/tree-view/tree-view";
import { Caption, Stack } from "./_kit";

const nodes: TreeNode[] = [
  { id: "src", label: "src", children: [
    { id: "components", label: "components", children: [
      { id: "button", label: "button.tsx" },
      { id: "dialog", label: "dialog.tsx" },
      { id: "tabs", label: "tabs.tsx" },
    ] },
    { id: "hooks", label: "hooks", children: [{ id: "debounce", label: "use-debounced-value.ts" }, { id: "media", label: "use-media-query.ts" }] },
    { id: "app", label: "App.tsx" },
    { id: "main", label: "main.tsx" },
  ] },
  { id: "public", label: "public", children: [{ id: "favicon", label: "favicon.svg" }, { id: "robots", label: "robots.txt" }] },
  { id: "pkg", label: "package.json" },
  { id: "readme", label: "README.md" },
];

export default function TreeViewDemo() {
  const [selected, setSelected] = useState("button.tsx");
  return (
    <Stack width={320} gap={3}>
      <TreeView nodes={nodes} defaultExpandedIds={["src", "components"]} onSelect={n => setSelected(n.label)} aria-label="Project files" />
      <Caption>Selected: {selected}. Arrow keys move, Right and Left open and close.</Caption>
    </Stack>
  );
}
