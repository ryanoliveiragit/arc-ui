import { useState } from "react";
import { Calendar, Clock, Save, Send, Trash2 } from "lucide-react";
import SplitButton from "@/registry/components/split-button/split-button";
import { Caption, Row, Stack } from "./_kit";

export default function SplitButtonDemo() {
  const [mode, setMode] = useState<"Send" | "Schedule" | "Save draft">("Send");
  const [last, setLast] = useState("Nothing yet");
  const icons = { Send: <Send size={15} aria-hidden="true" />, Schedule: <Calendar size={15} aria-hidden="true" />, "Save draft": <Save size={15} aria-hidden="true" /> };
  return (
    <Stack gap={6} align="center">
      <Row justify="center">
        <SplitButton
          label={mode}
          icon={icons[mode]}
          onClick={() => setLast(`${mode} pressed`)}
          actions={[
            { label: "Send now", icon: <Send size={15} aria-hidden="true" />, onSelect: () => setMode("Send") },
            { label: "Schedule for later", icon: <Clock size={15} aria-hidden="true" />, onSelect: () => setMode("Schedule") },
            { label: "Save as draft", icon: <Save size={15} aria-hidden="true" />, onSelect: () => setMode("Save draft") },
            { label: "Discard", icon: <Trash2 size={15} aria-hidden="true" />, destructive: true, onSelect: () => setLast("Discarded") },
          ]}
        />
        <SplitButton
          variant="secondary"
          label="Export"
          onClick={() => setLast("Exported as CSV")}
          actions={[
            { label: "Export as PDF", onSelect: () => setLast("Exported as PDF") },
            { label: "Export as JSON", onSelect: () => setLast("Exported as JSON") },
          ]}
        />
      </Row>
      <Caption>Pick an alternative from the menu and the main action morphs. Last: {last}</Caption>
    </Stack>
  );
}
