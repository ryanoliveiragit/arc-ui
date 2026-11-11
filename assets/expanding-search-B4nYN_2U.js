var e=`import { useState } from "react";
import { FileText, Folder, Users } from "lucide-react";
import ExpandingSearch, { type ExpandingSearchItem } from "@/registry/components/expanding-search/expanding-search";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 460 };

const icon = (n: typeof Folder) => { const I = n; return <I size={16} aria-hidden="true" />; };
const items: ExpandingSearchItem[] = [
  { id: "p1", title: "Q4 launch plan", meta: "Project, edited 2 hours ago", group: "Projects", icon: icon(Folder) },
  { id: "p2", title: "Website redesign", meta: "Project, edited yesterday", group: "Projects", icon: icon(Folder) },
  { id: "p3", title: "Mobile onboarding", meta: "Project, edited Monday", group: "Projects", icon: icon(Folder) },
  { id: "d1", title: "Brand guidelines", meta: "Document, Emma Collins", group: "Docs", icon: icon(FileText), keywords: ["logo", "colors"] },
  { id: "d2", title: "API reference", meta: "Document, Daniel Kim", group: "Docs", icon: icon(FileText) },
  { id: "d3", title: "Pricing FAQ", meta: "Document, Hannah Walsh", group: "Docs", icon: icon(FileText) },
  { id: "t1", title: "Design team", meta: "Team, 12 members", group: "Teams", icon: icon(Users) },
  { id: "t2", title: "Platform engineering", meta: "Team, 8 members", group: "Teams", icon: icon(Users) },
];

export default function ExpandingSearchDemo() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <Stack gap={4} width={420} align="stretch">
      <ExpandingSearch label="Search projects and docs" items={items} suggestions={items.slice(0, 3)} placeholder="Search projects, docs, teams…" onSelect={(i) => setPicked(i.title)} anchor="start" />
      <Caption>{picked ? \`Opened “\${picked}”.\` : "Click the icon, then type “brand” or “team”."}</Caption>
    </Stack>
  );
}
`;export{e as default};