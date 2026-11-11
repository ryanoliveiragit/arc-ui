var e=`import { useState } from "react";
import { Alert } from "@/registry/components/alert/alert";
import { Button } from "@/registry/components/button/button";
import { Row, Stack } from "./_kit";

export default function AlertDemo() {
  const [open, setOpen] = useState(true);
  return (
    <Stack gap={4} width={480}>
      <Alert tone="danger" title="Payment failed" open={open} onDismiss={() => setOpen(false)}>
        Your card ending in 4242 was declined. Update your billing details to keep your Pro plan active.
      </Alert>
      {!open && <Row><Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Show the alert again</Button></Row>}
      <Alert tone="warning" title="Storage almost full">You have used 92% of your 50 GB. Archive old projects or upgrade.</Alert>
      <Alert tone="success" title="Domain verified">acme-studio.com now points to your workspace.</Alert>
    </Stack>
  );
}
`;export{e as default};