var e=`import { useState } from "react";
import Toast from "@/registry/components/toast/toast";
import { Button } from "@/registry/components/button/button";
import { Caption, Stack } from "./_kit";

export default function ToastDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Stack gap={5} align="center" width={420} style={{ minHeight: 220 }}>
      <Button onClick={() => setOpen(true)}>Save draft</Button>
      <div style={{ minHeight: 84, width: "100%", display: "grid", justifyItems: "center", alignContent: "start" }}>
      <Toast open={open} onOpenChange={setOpen} title="Draft saved" description="Your changes to “Spring lookbook” are safe." duration={4000} />
      </div>
      <Caption>It closes by itself, or swipe it sideways.</Caption>
    </Stack>
  );
}
`;export{e as default};