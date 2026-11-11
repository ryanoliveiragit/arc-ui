var e=`import { useState } from "react";
import ActionButton from "@/registry/components/action-button/action-button";
import { Caption, Row, Stack } from "./_kit";

const wait = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));

export default function ActionButtonDemo() {
  const [saves, setSaves] = useState(0);
  const [failures, setFailures] = useState(0);
  return (
    <Stack gap={6} align="center">
      <Row justify="center">
        <ActionButton label="Save draft" onAction={async () => { await wait(1200); setSaves(count => count + 1); }} />
        <ActionButton label="Publish" pendingLabel="Publishing" successLabel="Published" onAction={() => wait(1800)} />
      </Row>
      <Row justify="center">
        <ActionButton
          label="Sync calendar"
          pendingLabel="Syncing"
          successLabel="Synced"
          onAction={async () => { await wait(900); throw new Error("offline"); }}
          onActionError={() => setFailures(count => count + 1)}
        />
      </Row>
      <Caption>{saves} drafts saved · {failures} sync failures. Each button shows pending, then confirms in place.</Caption>
    </Stack>
  );
}
`;export{e as default};