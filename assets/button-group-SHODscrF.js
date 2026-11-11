var e=`import { useState } from "react";
import { Archive, Copy, Link2, Share2, Trash2, Download, Bold, Italic, Underline } from "lucide-react";
import ButtonGroup from "@/registry/components/button-group/button-group";
import { Caption, Row, Stack } from "./_kit";

export default function ButtonGroupDemo() {
  const [shareLabel, setShareLabel] = useState("Share");
  const [last, setLast] = useState("None yet");
  const share = () => { setShareLabel("Copied"); setLast("Link copied"); window.setTimeout(() => setShareLabel("Share"), 1600); };
  return (
    <Stack gap={6} align="center" width={560}>
      <ButtonGroup
        label="Document actions"
        items={[
          { id: "share", label: shareLabel, reserve: ["Share", "Copied"], icon: <Share2 size={15} aria-hidden="true" />, onSelect: share },
          { id: "download", label: "Download", icon: <Download size={15} aria-hidden="true" />, onSelect: () => setLast("Download started") },
          { id: "archive", label: "Archive", icon: <Archive size={15} aria-hidden="true" />, onSelect: () => setLast("Archived") },
        ]}
        menu={{
          label: "More actions",
          items: [
            { id: "copy", label: "Duplicate", icon: <Copy size={15} aria-hidden="true" />, onSelect: () => setLast("Duplicated") },
            { id: "link", label: "Copy link", icon: <Link2 size={15} aria-hidden="true" />, onSelect: () => setLast("Link copied") },
            { id: "delete", label: "Delete", icon: <Trash2 size={15} aria-hidden="true" />, destructive: true, onSelect: () => setLast("Deleted") },
          ],
        }}
      />
      <Row justify="center" gap={5}>
        <ButtonGroup
          label="Text formatting"
          variant="solid"
          size="sm"
          items={[
            { id: "bold", label: "Bold", icon: <Bold size={15} aria-hidden="true" />, iconOnly: true, onSelect: () => setLast("Bold") },
            { id: "italic", label: "Italic", icon: <Italic size={15} aria-hidden="true" />, iconOnly: true, onSelect: () => setLast("Italic") },
            { id: "underline", label: "Underline", icon: <Underline size={15} aria-hidden="true" />, iconOnly: true, onSelect: () => setLast("Underline") },
          ]}
        />
        <ButtonGroup
          label="View mode"
          orientation="vertical"
          size="sm"
          items={[
            { id: "day", label: "Day" },
            { id: "week", label: "Week" },
            { id: "month", label: "Month" },
          ]}
        />
      </Row>
      <Caption>Last action: {last}</Caption>
    </Stack>
  );
}
`;export{e as default};