var e=`import { useState } from "react";
import { FileTree } from "@/registry/components/file-tree/file-tree";
import type { FileTreeNode } from "@/registry/components/file-tree/file-tree";
import { Caption, Stack, Surface } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

const project: FileTreeNode[] = [
  { name: "src", children: [
    { name: "components", children: [
      { name: "checkout", children: [
        { name: "checkout-form.tsx", status: "modified" },
        { name: "checkout-form.module.css" },
        { name: "order-summary.tsx", status: "added" },
      ] },
      { name: "header", children: [
        { name: "header.tsx" },
        { name: "header.module.css" },
        { name: "logo.svg" },
      ] },
    ] },
    { name: "hooks", children: [
      { name: "use-cart.ts", status: "modified" },
      { name: "use-media-query.ts" },
    ] },
    { name: "app.tsx" },
    { name: "main.tsx" },
  ] },
  { name: "public", children: [
    { name: "favicon.svg" },
    { name: "og-image.png" },
  ] },
  { name: "scripts", children: [] },
  { name: ".env.local" },
  { name: "package.json", status: "modified" },
  { name: "README.md" },
  { name: "tsconfig.json" },
  { name: "vite.config.ts" },
];

export default function FileTreeDemo() {
  const [selected, setSelected] = useState<string | null>("src/components/checkout/checkout-form.tsx");
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <Stack width={340} gap={3}>
      <Surface padding={2}>
        <FileTree nodes={project} value={selected} onValueChange={id => { setSelected(id); setOpened(null); }} onOpen={id => setOpened(id)} defaultExpandedIds={["src", "src/components", "src/components/checkout"]} label="Storefront project files" />
      </Surface>
      <Caption>{opened ? \`Opened \${opened}.\` : selected ? \`Selected \${selected}.\` : "Nothing selected."} Enter opens a file, arrows move, typing a name jumps to it.</Caption>
    </Stack>
  );
}
`;export{e as default};