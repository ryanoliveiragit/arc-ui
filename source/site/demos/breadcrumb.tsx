import { useState } from "react";
import { Breadcrumb } from "@/registry/components/breadcrumb/breadcrumb";
import { Button } from "@/registry/components/button/button";
import { Caption, Stack } from "./_kit";

const tree = ["Workspace", "Projects", "Mobile app", "Releases", "v2.4.0"];

export default function BreadcrumbDemo() {
  const [depth, setDepth] = useState(3);
  const items = tree.slice(0, depth).map((label, i) => ({ label, onClick: () => setDepth(i + 1) }));
  return (
    <Stack gap={5} align="center">
      <Breadcrumb items={items} />
      <Button variant="secondary" size="sm" disabled={depth >= tree.length} onClick={() => setDepth(d => d + 1)}>Go deeper</Button>
      <Caption>New crumbs slide in; choose an earlier crumb to go back up.</Caption>
    </Stack>
  );
}
