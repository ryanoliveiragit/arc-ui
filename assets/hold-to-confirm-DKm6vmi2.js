var e=`import { useState } from "react";
import HoldToConfirm from "@/registry/components/hold-to-confirm/hold-to-confirm";
import { Caption, Row, Stack } from "./_kit";

export default function HoldToConfirmDemo() {
  const [holding, setHolding] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  return (
    <Stack gap={6} align="center">
      <HoldToConfirm
        key={resetKey}
        label="Hold to delete project"
        confirmedLabel="Project deleted"
        tone="danger"
        onHoldChange={setHolding}
        onConfirm={() => setDeleted(true)}
      />
      <Row justify="center">
        <HoldToConfirm label="Hold to publish" confirmedLabel="Published" duration={800} onConfirm={() => {}} />
        <HoldToConfirm label="Hold to archive" confirmedLabel="Archived" tone="neutral" onConfirm={() => {}} />
      </Row>
      <Caption>
        {deleted ? (
          <>Deleted. <button type="button" onClick={() => { setDeleted(false); setResetKey(key => key + 1); }} style={{ all: "unset", cursor: "pointer", textDecoration: "underline" }}>Reset the demo</button></>
        ) : holding ? "Keep holding…" : "Press and hold; releasing early cancels."}
      </Caption>
    </Stack>
  );
}
`;export{e as default};