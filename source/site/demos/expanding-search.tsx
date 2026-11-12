import { useState } from "react";
import { FileText, Folder, Users } from "lucide-react";
import ExpandingSearch, { type ExpandingSearchItem } from "@/registry/components/expanding-search/expanding-search";
import { Caption, Room, Surface } from "./_kit";
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
  // Where it lives in a product: the end of a toolbar. The icon sits on the right and the field grows left over the
  // free space; the room below the toolbar is for the results panel.
  return (
    <Room below={232} width={520} align="stretch">
      <Surface padding={3} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", paddingLeft: "var(--space-5)" }}>
        <strong style={{ flex: "none", color: "var(--foreground)", fontSize: "var(--text-sm)", fontWeight: 500 }}>Atlas workspace</strong>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ExpandingSearch label="Search projects and docs" items={items} suggestions={items.slice(0, 3)} placeholder="Search projects, docs, teams…" onSelect={(i) => setPicked(i.title)} anchor="end" />
        </div>
      </Surface>
      <div style={{ marginTop: "var(--space-3)", textAlign: "center" }}>
        <Caption>{picked ? `Opened “${picked}”.` : "Click the search icon, then type “brand” or “team”."}</Caption>
      </div>
    </Room>
  );
}
