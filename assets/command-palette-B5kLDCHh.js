var e=`import { useState } from "react";
import { Bell, FilePlus, FolderOpen, GitBranch, Moon, Palette, Search, Settings, UserPlus } from "lucide-react";
import { CommandPalette, type CommandItem } from "@/registry/components/command-palette/command-palette";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "center", height: 520 };

const items: CommandItem[] = [
  { id: "new-file", label: "New file", description: "Create a file in the current folder", group: "Create", icon: <FilePlus size={16} />, shortcut: "N", keywords: ["add"] },
  { id: "invite", label: "Invite teammate", description: "Send an invitation by email", group: "Create", icon: <UserPlus size={16} />, shortcut: "I", keywords: ["member", "people"] },
  { id: "branch", label: "New branch", description: "Branch from main", group: "Create", icon: <GitBranch size={16} />, keywords: ["git"] },
  { id: "open", label: "Open project", description: "Jump to a recent project", group: "Go to", icon: <FolderOpen size={16} />, shortcut: "O" },
  { id: "search", label: "Search everything", description: "Files, issues and people", group: "Go to", icon: <Search size={16} />, shortcut: "/" },
  { id: "notifications", label: "Notifications", description: "Review unread updates", group: "Go to", icon: <Bell size={16} /> },
  { id: "theme", label: "Switch theme", description: "Toggle light and dark mode", group: "Settings", icon: <Moon size={16} />, shortcut: "T", keywords: ["dark", "light"] },
  { id: "accent", label: "Change accent color", group: "Settings", icon: <Palette size={16} /> },
  { id: "preferences", label: "Preferences", description: "Account and workspace settings", group: "Settings", icon: <Settings size={16} />, shortcut: ",", keywords: ["account"] },
];

export default function CommandPaletteDemo() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <Stack width={560} gap={3}>
      <CommandPalette items={items} onSelect={item => setLast(item.label)} />
      <Caption>{last ? \`Ran: \${last}\` : "Type to filter, use the arrow keys, press Enter to run."}</Caption>
    </Stack>
  );
}
`;export{e as default};