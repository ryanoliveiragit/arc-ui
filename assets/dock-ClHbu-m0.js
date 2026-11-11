var e=`import { useState } from "react";
import { Calendar, Mail, Music, NotebookPen, Settings, Terminal } from "lucide-react";
import { Dock } from "@/registry/components/dock/dock";
import type { DockItem } from "@/registry/components/dock/dock";
import { Caption, Stack } from "./_kit";

const icon = { size: 20, strokeWidth: 1.75 };
const apps: DockItem[] = [
  { id: "mail", label: "Mail", icon: <Mail {...icon} />, open: true },
  { id: "calendar", label: "Calendar", icon: <Calendar {...icon} /> },
  { id: "notes", label: "Notes", icon: <NotebookPen {...icon} />, open: true },
  { id: "music", label: "Music", icon: <Music {...icon} /> },
  { id: "terminal", label: "Terminal", icon: <Terminal {...icon} />, open: true },
  { id: "settings", label: "Settings", icon: <Settings {...icon} />, separatorBefore: true },
];

export default function DockDemo() {
  const [active, setActive] = useState<string | null>("notes");
  const name = apps.find(app => app.id === active)?.label;
  return (
    <Stack gap={5} align="center" style={{ paddingTop: "var(--space-12)" }}>
      <Dock items={apps} size={40} value={active} onValueChange={setActive} label="Applications" />
      <Caption>{name ? \`\${name} is in front.\` : "Nothing is open."} Hover the dock or use the arrow keys.</Caption>
    </Stack>
  );
}
`;export{e as default};