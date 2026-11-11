import { useState } from "react";
import { CopyButton } from "@/registry/components/copy-button/copy-button";
import { Caption, Row, Stack, Surface } from "./_kit";

export default function CopyButtonDemo() {
  const [copies, setCopies] = useState(0);
  return (
    <Stack gap={6} align="center" width={440}>
      <Surface padding={4} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <code style={{ fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>npm install ryan-ui</code>
        <CopyButton value="npm install ryan-ui" onCopied={() => setCopies(count => count + 1)} />
      </Surface>
      <Row justify="center" gap={5}>
        <CopyButton value="sk_live_51Nq8x2Kd" label="Copy key" variant="plain" onCopied={() => setCopies(count => count + 1)} />
        <CopyButton value="https://ryan-ui.dev/docs" iconOnly label="Copy link" onCopied={() => setCopies(count => count + 1)} />
        <CopyButton value="unavailable" disabled label="Copy" />
      </Row>
      <Caption>Copied {copies} time{copies === 1 ? "" : "s"}. Press a button: the icon swaps and the label confirms.</Caption>
    </Stack>
  );
}
