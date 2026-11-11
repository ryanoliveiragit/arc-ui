import { useState } from "react";
import MentionInput, { type MentionValue } from "@/registry/components/mention-input/mention-input";
import { avatar } from "@/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 460 };

const people = [
  { id: "emma-collins", name: "Emma Collins", role: "Product designer", avatar: avatar("emma-collins") },
  { id: "marcus-johnson", name: "Marcus Johnson", role: "Frontend engineer", avatar: avatar("marcus-johnson") },
  { id: "jasmine-brooks", name: "Jasmine Brooks", role: "Design lead", avatar: avatar("jasmine-brooks") },
  { id: "olivia-bennett", name: "Olivia Bennett", role: "Platform engineer", avatar: avatar("olivia-bennett") },
];
const channels = [
  { id: "design", name: "design", description: "Design critique and reviews", members: 24 },
  { id: "launch", name: "launch", description: "Q4 launch coordination", members: 18 },
  { id: "frontend", name: "frontend", description: "Web engineering", members: 31 },
];

export default function MentionInputDemo() {
  const [value, setValue] = useState<MentionValue>({ text: "", mentions: [] });
  return (
    <Stack gap={3} width={440}>
      <MentionInput aria-label="Comment" value={value} onChange={setValue} people={people} channels={channels} placeholder="Write a comment. Type @ for people or # for channels." minRows={3} placement="bottom" />
      <Caption>{value.mentions.length ? `${value.mentions.length} mention${value.mentions.length > 1 ? "s" : ""}: ${value.mentions.map((m) => m.label).join(", ")}` : "Try “@em” or “#la”."}</Caption>
    </Stack>
  );
}
