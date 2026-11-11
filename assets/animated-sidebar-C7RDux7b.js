var e=`import { useState } from "react";
import { ChartColumn, CreditCard, FolderKanban, Inbox, LayoutDashboard, Settings, Users } from "lucide-react";
import { AnimatedSidebar } from "@/registry/components/animated-sidebar/animated-sidebar";
import type { AnimatedSidebarSection } from "@/registry/components/animated-sidebar/animated-sidebar";
import type { DemoStage } from "./_kit";
import styles from "./animated-sidebar.module.css";

export const stage: DemoStage = { layout: "fill", height: 540 };

const icon = { size: 18, strokeWidth: 1.75 };
const sections: AnimatedSidebarSection[] = [
  { id: "main", items: [
    { id: "overview", label: "Overview", icon: <LayoutDashboard {...icon} /> },
    { id: "inbox", label: "Inbox", icon: <Inbox {...icon} />, badge: 12 },
  ] },
  { id: "workspace", title: "Workspace", items: [
    { id: "projects", label: "Projects", icon: <FolderKanban {...icon} />, children: [
      { id: "projects-active", label: "Active", badge: 8 },
      { id: "projects-drafts", label: "Drafts" },
      { id: "projects-archived", label: "Archived" },
    ] },
    { id: "customers", label: "Customers", icon: <Users {...icon} />, children: [
      { id: "customers-accounts", label: "Accounts" },
      { id: "customers-segments", label: "Segments" },
      { id: "customers-imports", label: "Imports" },
    ] },
    { id: "analytics", label: "Analytics", icon: <ChartColumn {...icon} />, children: [
      { id: "analytics-traffic", label: "Traffic" },
      { id: "analytics-revenue", label: "Revenue" },
      { id: "analytics-retention", label: "Retention" },
    ] },
  ] },
  { id: "account", title: "Account", items: [
    { id: "billing", label: "Billing", icon: <CreditCard {...icon} /> },
    { id: "settings", label: "Settings", icon: <Settings {...icon} />, children: [
      { id: "settings-profile", label: "Profile" },
      { id: "settings-members", label: "Members" },
      { id: "settings-keys", label: "API keys" },
    ] },
  ] },
];

const notes: Record<string, string> = {
  overview: "Revenue is up 8% on last week and two projects ship on Friday.",
  inbox: "Twelve unread conversations, three of them waiting on you.",
  "projects-active": "Eight projects in progress. Mobile checkout is the closest to launch.",
  "projects-drafts": "Drafts stay private until you invite someone.",
  "projects-archived": "Archived projects are read-only and can be restored at any time.",
  "customers-accounts": "214 accounts, sorted by last activity.",
  "customers-segments": "Segments update as customers match or stop matching their rules.",
  "customers-imports": "Bring customers in from a CSV file or a connected CRM.",
  "analytics-traffic": "Visits by source for the last thirty days.",
  "analytics-revenue": "Recurring revenue, expansions and refunds by month.",
  "analytics-retention": "How many customers from each signup month are still active.",
  billing: "Team plan, 16 seats. The next invoice is due on December 1.",
  "settings-profile": "Your name, photo and notification preferences.",
  "settings-members": "Invite people and decide what each role can do.",
  "settings-keys": "Create and revoke keys for the public API.",
};

/** The trail of labels that leads to a leaf row. */
function trail(id: string) {
  for (const section of sections) for (const item of section.items) {
    if (item.id === id) return [item.label];
    const child = item.children?.find(entry => entry.id === id);
    if (child) return [item.label, child.label];
  }
  return [];
}

export default function AnimatedSidebarDemo() {
  const [active, setActive] = useState("projects-active");
  // A phone starts on the rail, so the page keeps most of the width.
  const [collapsed, setCollapsed] = useState(() => typeof window !== "undefined" && window.innerWidth < 560);
  const path = trail(active);
  return (
    <div className={styles.frame}>
      <AnimatedSidebar sections={sections} value={active} onValueChange={setActive} collapsed={collapsed} onCollapsedChange={setCollapsed} logo="A" title="Atlas" label="Workspace" />
      <section className={styles.page} aria-live="polite">
        <p className={styles.crumbs}>{path.join(" / ")}</p>
        <h2 className={styles.heading}>{path.at(-1)}</h2>
        <p className={styles.lead}>{notes[active]}</p>
      </section>
    </div>
  );
}
`;export{e as default};