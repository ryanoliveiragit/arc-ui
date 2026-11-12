var e=`import { useState } from "react";
import { Copy, Pencil, Share2, Trash2, Archive } from "lucide-react";
import DropdownMenu from "@/registry/components/dropdown-menu/dropdown-menu";
import { Caption, Room, Row, Stack, demoStage, useQuietFirstOpen } from "./_kit";

export default function DropdownMenuDemo() {
  const [last, setLast] = useState("Nothing yet");
  const act = (name: string) => () => setLast(name);
  // The first menu is already open, inside the stage. Non-modal, so the docs page keeps scrolling while it shows.
  const stage = demoStage();
  const quiet = useQuietFirstOpen();
  return (
    <Stack gap={4} align="center">
      <Room below={206}>
      <Row justify="center">
        <DropdownMenu
          label="Project actions"
          defaultOpen
          modal={false}
          onOpenAutoFocus={quiet}
          container={stage}
          items={[
            { label: "Rename", icon: <Pencil size={15} aria-hidden="true" />, onSelect: act("Rename") },
            { label: "Duplicate", icon: <Copy size={15} aria-hidden="true" />, onSelect: act("Duplicate") },
            { label: "Share", icon: <Share2 size={15} aria-hidden="true" />, onSelect: act("Share") },
            { label: "Archive", icon: <Archive size={15} aria-hidden="true" />, disabled: true },
            { label: "Delete project", icon: <Trash2 size={15} aria-hidden="true" />, destructive: true, separatorBefore: true, onSelect: act("Delete project") },
          ]}
        />
        <DropdownMenu
          label="Sort by"
          container={stage}
          items={[
            { label: "Most recent", onSelect: act("Most recent") },
            { label: "Name", onSelect: act("Name") },
            { label: "Size", onSelect: act("Size") },
          ]}
        />
      </Row>
      </Room>
      <Caption>Last choice: {last}. Arrow keys move, Escape closes.</Caption>
    </Stack>
  );
}
`;export{e as default};