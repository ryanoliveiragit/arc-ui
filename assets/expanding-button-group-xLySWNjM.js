var e=`import { useState } from "react";
import { Archive, Flag, Reply, Trash2 } from "lucide-react";
import ExpandingButtonGroup from "@/registry/components/expanding-button-group/expanding-button-group";
import { Caption, Stack } from "./_kit";

export default function ExpandingButtonGroupDemo() {
  const [last, setLast] = useState("None yet");
  return (
    <Stack gap={6} align="center">
      <ExpandingButtonGroup
        label="Message actions"
        onAction={id => setLast(id)}
        items={[
          { id: "reply", label: "Reply", icon: <Reply size={16} aria-hidden="true" /> },
          { id: "archive", label: "Archive", doneLabel: "Archived", icon: <Archive size={16} aria-hidden="true" /> },
          { id: "flag", label: "Flag", doneLabel: "Flagged", icon: <Flag size={16} aria-hidden="true" /> },
          { id: "delete", label: "Delete", doneLabel: "Deleted", tone: "danger", icon: <Trash2 size={16} aria-hidden="true" /> },
        ]}
      />
      <ExpandingButtonGroup
        size="sm"
        label="Compact message actions"
        defaultExpanded="archive"
        items={[
          { id: "reply", label: "Reply", icon: <Reply size={14} aria-hidden="true" /> },
          { id: "archive", label: "Archive", doneLabel: "Archived", icon: <Archive size={14} aria-hidden="true" /> },
          { id: "flag", label: "Flag", doneLabel: "Flagged", icon: <Flag size={14} aria-hidden="true" /> },
        ]}
      />
      <Caption>Last action: {last}. Hover a button to expand it; press to confirm in place.</Caption>
    </Stack>
  );
}
`;export{e as default};