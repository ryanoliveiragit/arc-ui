var e=`import { AgentCursor } from "@/registry/components/agent-cursor/agent-cursor";
import { person } from "@/lib/media";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

export default function AgentCursorDemo() {
  return (
    <Stack gap={3} width={720}>
      <AgentCursor collaborator={{ name: "Emma Collins", avatar: person("emma-collins").src }} />
    </Stack>
  );
}
`;export{e as default};