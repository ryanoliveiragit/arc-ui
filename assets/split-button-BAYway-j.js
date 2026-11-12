var e=`import { useState } from "react";
import { Calendar, Clock, Save, Send, Trash2 } from "lucide-react";
import SplitButton from "@/registry/components/split-button/split-button";
import { Caption, Room, Row, Stack, demoStage, useQuietFirstOpen } from "./_kit";

export default function SplitButtonDemo() {
  const [mode, setMode] = useState<"Send" | "Schedule" | "Save draft">("Send");
  const [last, setLast] = useState("Nothing yet");
  // The main button's menu is already open, inside the stage (non-modal, so the page keeps scrolling).
  const stage = demoStage();
  const quiet = useQuietFirstOpen();
  const icons = { Send: <Send size={15} aria-hidden="true" />, Schedule: <Calendar size={15} aria-hidden="true" />, "Save draft": <Save size={15} aria-hidden="true" /> };
  return (
    <Stack gap={4} align="center">
      <Room below={172}>
      <Row justify="center">
        <SplitButton
          label={mode}
          defaultOpen
          modal={false}
          onOpenAutoFocus={quiet}
          container={stage}
          icon={icons[mode]}
          onClick={() => setLast(\`\${mode} pressed\`)}
          actions={[
            { label: "Send now", icon: <Send size={15} aria-hidden="true" />, onSelect: () => setMode("Send") },
            { label: "Schedule for later", icon: <Clock size={15} aria-hidden="true" />, onSelect: () => setMode("Schedule") },
            { label: "Save as draft", icon: <Save size={15} aria-hidden="true" />, onSelect: () => setMode("Save draft") },
            { label: "Discard", icon: <Trash2 size={15} aria-hidden="true" />, destructive: true, onSelect: () => setLast("Discarded") },
          ]}
        />
        <SplitButton
          variant="secondary"
          container={stage}
          label="Export"
          onClick={() => setLast("Exported as CSV")}
          actions={[
            { label: "Export as PDF", onSelect: () => setLast("Exported as PDF") },
            { label: "Export as JSON", onSelect: () => setLast("Exported as JSON") },
          ]}
        />
      </Row>
      </Room>
      <Caption>Pick an alternative from the menu and the main action morphs. Last: {last}</Caption>
    </Stack>
  );
}
`;export{e as default};