import { useState } from "react";
import { ChartColumn, FolderKanban, Inbox, LayoutDashboard, LifeBuoy, Settings, Users } from "lucide-react";
import { BounceSidebar } from "@/registry/components/bounce-sidebar/bounce-sidebar";
import type { BounceSidebarItem } from "@/registry/components/bounce-sidebar/bounce-sidebar";
import type { DemoStage } from "./_kit";
import styles from "./bounce-sidebar.module.css";

export const stage: DemoStage = { layout: "fill", height: 480 };

const icon = { size: 18, strokeWidth: 1.75 };
const main: BounceSidebarItem[] = [
  { id: "home", label: "Home", icon: <LayoutDashboard {...icon} /> },
  { id: "inbox", label: "Inbox", icon: <Inbox {...icon} />, badge: 4 },
  { id: "projects", label: "Projects", icon: <FolderKanban {...icon} /> },
  { id: "reports", label: "Reports", icon: <ChartColumn {...icon} /> },
  { id: "team", label: "Team", icon: <Users {...icon} /> },
];
const secondary: BounceSidebarItem[] = [
  { id: "settings", label: "Settings", icon: <Settings {...icon} /> },
  { id: "help", label: "Help center", icon: <LifeBuoy {...icon} /> },
];
const pages: Record<string, { lead: string; rows: [string, string][] }> = {
  home: { lead: "Three things need you today, and the Q3 report is ready for review.", rows: [["Approve the Lisbon launch budget", "Due today"], ["Review Q3 revenue report", "Ready"], ["Reply to Hannah about onboarding", "2 days ago"]] },
  inbox: { lead: "Four unread conversations, newest first.", rows: [["Marcus: staging is green again", "9:42"], ["Sofia: vendor contract attached", "9:10"], ["Chloe: dashboard numbers look off", "Yesterday"]] },
  projects: { lead: "Active projects across the workspace.", rows: [["Mobile checkout redesign", "68%"], ["Billing migration", "41%"], ["Partner portal", "12%"]] },
  reports: { lead: "Saved reports refresh every morning at six.", rows: [["Weekly revenue", "Updated 6:00"], ["Churn by plan", "Updated 6:00"], ["Support response time", "Updated 6:01"]] },
  team: { lead: "Sixteen people in four time zones.", rows: [["Emma Collins", "Product designer"], ["Daniel Kim", "Backend engineer"], ["Jasmine Brooks", "Design lead"]] },
  settings: { lead: "Workspace preferences apply to every member.", rows: [["Workspace name", "Northwind"], ["Default time zone", "Lisbon"], ["Two-step sign-in", "Required"]] },
  help: { lead: "Guides and a direct line to support.", rows: [["Getting started in ten minutes", "Guide"], ["Importing from a spreadsheet", "Guide"], ["Talk to a person", "Chat"]] },
};

export default function BounceSidebarDemo() {
  const [active, setActive] = useState("inbox");
  // A phone starts on the rail, so the page keeps most of the width.
  const [expanded, setExpanded] = useState(() => typeof window === "undefined" || window.innerWidth >= 560);
  const all = [...main, ...secondary];
  const page = pages[active];
  return (
    <div className={styles.frame}>
      <BounceSidebar items={main} secondaryItems={secondary} value={active} onValueChange={setActive} expanded={expanded} onExpandedChange={setExpanded} logo="N" title="Northwind" label="Workspace" />
      <section className={styles.page} aria-live="polite">
        <h2 className={styles.heading}>{all.find(item => item.id === active)?.label}</h2>
        <p className={styles.lead}>{page?.lead}</p>
        <ul className={styles.rows}>
          {page?.rows.map(([name, detail]) => <li key={name} className={styles.row}><span>{name}</span><span>{detail}</span></li>)}
        </ul>
      </section>
    </div>
  );
}
