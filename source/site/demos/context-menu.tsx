import { useState } from "react";
import { Copy, Download, FolderInput, Pencil, Pin, Trash2 } from "lucide-react";
import ContextMenu from "@/registry/components/context-menu/context-menu";
import { Caption, Room, Stack, Surface, demoStage } from "./_kit";

export default function ContextMenuDemo() {
  const [last, setLast] = useState("Nothing yet");
  const [pinned, setPinned] = useState(false);
  const act = (name: string) => () => setLast(name);
  return (
    <Stack gap={4} align="center" width={420}>
      <Room below={184} width={420}>
      <ContextMenu
        label="Q3 roadmap actions"
        defaultOpen
        container={demoStage()}
        items={[
          { id: "rename", label: "Rename", icon: <Pencil size={15} aria-hidden="true" />, onSelect: act("Rename") },
          { id: "copy", label: "Copy link", icon: <Copy size={15} aria-hidden="true" />, onSelect: act("Copy link") },
          { id: "pin", label: "Pin to top", icon: <Pin size={15} aria-hidden="true" />, checked: pinned, onSelect: () => { setPinned(value => !value); setLast(pinned ? "Unpinned" : "Pinned"); } },
          { id: "move", label: "Move to folder", icon: <FolderInput size={15} aria-hidden="true" />, onSelect: act("Move to folder") },
          { id: "download", label: "Download", icon: <Download size={15} aria-hidden="true" />, disabled: true },
          { id: "delete", label: "Delete", icon: <Trash2 size={15} aria-hidden="true" />, destructive: true, onSelect: act("Delete") },
        ]}
      >
        <Surface padding={8} style={{ textAlign: "center" }}>
          <strong style={{ display: "block", fontSize: "var(--text-xl)" }}>Q3 roadmap.pdf</strong>
          <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>Right-click, or long-press on touch</span>
        </Surface>
      </ContextMenu>
      </Room>
      <Caption>Last choice: {last}</Caption>
    </Stack>
  );
}
