import { useState } from "react";
import MorphSelect from "@/registry/components/morph-select/morph-select";
import { avatar } from "@/lib/media";
import { Caption } from "./_kit";
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

/** Width of the open list: the trigger sits at the left of a box this wide, so the list it grows into is centered. */
const PANEL = 272;

export default function MorphSelectDemo() {
  // The preview opens the list on load (focus stays on the page); the space it grows into is reserved below.
  const [value, setValue] = useState<string | null>("marcus");
  return (
    <div style={{ display: "flex", width: `min(${PANEL}px, 100%)`, flexDirection: "column", alignItems: "flex-start", gap: "var(--space-3)" }}>
      <div style={{ paddingBottom: 268 }}>
        <MorphSelect label="Assignee" items={items} value={value} onValueChange={(v) => setValue(v)} placeholder="Choose a teammate" defaultOpen />
      </div>
      <Caption>Glide with the arrows, or type a name to jump.</Caption>
    </div>
  );
}
