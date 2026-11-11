var e=`import { useState } from "react";
import InlineEdit from "@/registry/components/inline-edit/inline-edit";
import { Caption, Stack, Surface } from "./_kit";

export default function InlineEditDemo() {
  const [name, setName] = useState("Q4 launch plan");
  const [desc, setDesc] = useState("Everything we need to ship the new pricing page before the holidays.");
  return (
    <Surface width={440} padding={6}>
      <Stack gap={3}>
        <InlineEdit as="h2" label="Project name" value={name} onSave={(v) => new Promise((r) => setTimeout(() => { setName(v); r(null); }, 700))} validate={(v) => (v.trim() ? null : "A project needs a name.")} />
        <InlineEdit as="p" variant="body" multiline label="Description" value={desc} onSave={setDesc} placeholder="Add a description" />
        <Caption>Click either text to edit. Enter saves, Escape cancels.</Caption>
      </Stack>
    </Surface>
  );
}
`;export{e as default};