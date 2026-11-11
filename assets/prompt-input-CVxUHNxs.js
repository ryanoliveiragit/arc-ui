var e=`import { useEffect, useRef, useState } from "react";
import PromptInput from "@/registry/components/prompt-input/prompt-input";
import type { PromptAttachment, PromptModel, PromptSubmission } from "@/registry/components/prompt-input/prompt-input";
import { Caption, Stack } from "./_kit";

const models: PromptModel[] = [
  { id: "atlas-pro", label: "Atlas Pro", description: "Slower, best for hard problems" },
  { id: "atlas-fast", label: "Atlas Fast", description: "Quick answers for everyday work" },
  { id: "atlas-mini", label: "Atlas Mini", description: "Lightest, for short tasks" },
];
const shelf: PromptAttachment[] = [
  { id: "report", name: "q3-revenue.csv", detail: "84 KB" },
  { id: "brief", name: "launch-brief.pdf", detail: "1.2 MB" },
  { id: "notes", name: "interview-notes.md", detail: "6 KB" },
  { id: "chart", name: "churn-by-plan.png", detail: "310 KB" },
];

export default function PromptInputDemo() {
  const [attachments, setAttachments] = useState<PromptAttachment[]>(shelf.slice(0, 2));
  const [model, setModel] = useState("atlas-pro");
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState("Enter sends, Shift+Enter adds a line. The plus button attaches a sample file.");
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function send({ value, attachments: files, model: used }: PromptSubmission) {
    const name = models.find(item => item.id === used)?.label ?? "the model";
    const extras = files.length ? \` with \${files.length} \${files.length === 1 ? "file" : "files"}\` : "";
    setNote(\`\${name} is answering “\${value || "your files"}”\${extras}. Press stop to interrupt.\`);
    setRunning(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setRunning(false); setNote(\`\${name} finished the answer.\`); }, 3600);
  }

  function attach() {
    const next = shelf.find(file => !attachments.some(item => item.id === file.id));
    if (next) setAttachments([...attachments, next]); else setNote("All four sample files are attached.");
  }

  return (
    <Stack width={560} gap={4}>
      <PromptInput
        placeholder="Ask about your data"
        models={models}
        model={model}
        onModelChange={setModel}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        onAttach={attach}
        running={running}
        onSubmit={send}
        onStop={() => { window.clearTimeout(timer.current); setRunning(false); setNote("Stopped. The partial answer was kept."); }}
      />
      <Caption>{note}</Caption>
    </Stack>
  );
}
`;export{e as default};