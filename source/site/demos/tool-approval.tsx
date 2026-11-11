import { useState } from "react";
import { FilePen, Terminal } from "lucide-react";
import ToolApproval from "@/registry/components/tool-approval/tool-approval";
import type { ToolDecision } from "@/registry/components/tool-approval/tool-approval";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./tool-approval.module.css";

export const stage: DemoStage = { height: 520 };

const outcome: Record<ToolDecision, string> = {
  pending: "The agent is paused until you answer.",
  once: "The command ran. The agent will ask again next time.",
  always: "The command ran. The agent can run it again without asking.",
  denied: "The command did not run. The agent will look for another way.",
};

export default function ToolApprovalDemo() {
  const [command, setCommand] = useState<ToolDecision>("pending");
  return (
    <Stack width={460} gap={3}>
      <p className={styles.line}>Port 3000 is taken, so the dev server cannot start. I will find the process that holds it.</p>
      <ToolApproval tool="write_file" icon={<FilePen width={15} height={15} strokeWidth={1.9} />} args={{ path: "notes/port-conflict.md", bytes: 412 }} defaultDecision="always" />
      <ToolApproval
        tool="run_command"
        icon={<Terminal width={15} height={15} strokeWidth={1.9} />}
        description="It lists what is listening on the port."
        args={{ command: "lsof -nP -iTCP:3000 -sTCP:LISTEN", cwd: "~/projects/storefront", timeout: "10 s" }}
        decision={command}
        onDecisionChange={setCommand}
      />
      <Caption>{outcome[command]}</Caption>
    </Stack>
  );
}
