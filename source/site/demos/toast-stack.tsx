import ToastStack, { ToastStackProvider, useToastStack } from "@/registry/components/toast-stack/toast-stack";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "fill", height: 440 };

function Controls() {
  const { toast, update, dismiss } = useToastStack();
  const upload = () => {
    const id = toast({ type: "loading", title: "Uploading brand-kit.zip", description: "42 MB, almost there" });
    window.setTimeout(() => update(id, { type: "success", title: "Upload complete", description: "brand-kit.zip is ready to share." }), 2000);
  };
  const remove = () => {
    toast({ type: "info", title: "Invoice deleted", description: "INV-2041 was moved to the trash.", action: { label: "Undo", onClick: id => update(id, { type: "success", title: "Invoice restored", description: "INV-2041 is back.", action: undefined }) } });
  };
  return (
    <Stack gap={4} align="center" style={{ padding: "var(--space-6)" }}>
      <Row justify="center">
        <Button onClick={upload}>Upload file</Button>
        <Button variant="secondary" onClick={remove}>Delete invoice</Button>
        <Button variant="secondary" onClick={() => toast({ type: "error", title: "Sync failed", description: "We lost the connection to the server." })}>Trigger error</Button>
        <Button variant="ghost" onClick={() => dismiss()}>Clear all</Button>
      </Row>
      <Caption>Fire several to see them stack; hover the stack to fan it out.</Caption>
    </Stack>
  );
}

export default function ToastStackDemo() {
  return (
    <ToastStackProvider>
      <div style={{ position: "relative", minHeight: 440, overflow: "hidden" }}>
        <Controls />
        <ToastStack contained />
      </div>
    </ToastStackProvider>
  );
}
