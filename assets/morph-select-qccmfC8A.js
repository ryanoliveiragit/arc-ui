var e=`import { useState } from "react";
import MorphSelect from "@/registry/components/morph-select/morph-select";
import { avatar } from "@/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const img = (id: Parameters<typeof avatar>[0]) => <img src={avatar(id)} alt="" width={20} height={20} style={{ borderRadius: "50%" }} />;

const items = [
  { label: "Design", options: [
    { value: "emma", label: "Emma Collins", meta: "Designer", icon: img("emma-collins") },
    { value: "jasmine", label: "Jasmine Brooks", meta: "Lead", icon: img("jasmine-brooks") },
  ] },
  { label: "Engineering", options: [
    { value: "marcus", label: "Marcus Johnson", meta: "Frontend", icon: img("marcus-johnson") },
    { value: "olivia", label: "Olivia Bennett", meta: "Platform", icon: img("olivia-bennett") },
    { value: "daniel", label: "Daniel Kim", meta: "Backend", icon: img("daniel-kim") },
  ] },
];

export default function MorphSelectDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Stack gap={3} width={300}>
      <MorphSelect label="Assignee" items={items} value={value} onValueChange={(v) => setValue(v)} placeholder="Choose a teammate" />
      <Caption>Open it, glide with the arrows, or type a name to jump.</Caption>
    </Stack>
  );
}
`;export{e as default};