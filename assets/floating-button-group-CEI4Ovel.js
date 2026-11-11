var e=`import { useState } from "react";
import { Copy, Presentation, Redo2, Share2, Trash2, Undo2 } from "lucide-react";
import FloatingButtonGroup from "@/registry/components/floating-button-group/floating-button-group";
import { Caption, Stack } from "./_kit";

export default function FloatingButtonGroupDemo() {
  const [present, setPresent] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share");
  const [last, setLast] = useState("None yet");
  return (
    <Stack gap={6} align="center">
      <FloatingButtonGroup
        label="Board actions"
        onAction={id => setLast(id)}
        items={[
          { id: "undo", label: "Undo", icon: <Undo2 size={15} aria-hidden="true" />, shortcut: "⌘Z" },
          { id: "redo", label: "Redo", icon: <Redo2 size={15} aria-hidden="true" />, shortcut: "⇧⌘Z" },
          { type: "separator" },
          { id: "present", label: "Present", icon: <Presentation size={15} aria-hidden="true" />, pressed: present, onSelect: () => setPresent(value => !value) },
          { id: "share", label: shareLabel, reserveLabels: ["Share", "Copied"], icon: <Share2 size={15} aria-hidden="true" />, onSelect: () => { setShareLabel("Copied"); window.setTimeout(() => setShareLabel("Share"), 1500); } },
        ]}
      />
      <FloatingButtonGroup
        label="Selection actions"
        variant="floating"
        iconOnly
        onAction={id => setLast(id)}
        items={[
          { id: "duplicate", label: "Duplicate", icon: <Copy size={15} aria-hidden="true" /> },
          { id: "share-selection", label: "Share", icon: <Share2 size={15} aria-hidden="true" /> },
          { id: "delete", label: "Delete", icon: <Trash2 size={15} aria-hidden="true" /> },
        ]}
      />
      <Caption>Present mode: {present ? "on" : "off"} · last action: {last}. Move across the tray to follow the highlight.</Caption>
    </Stack>
  );
}
`;export{e as default};