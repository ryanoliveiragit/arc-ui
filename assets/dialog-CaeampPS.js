var e=`import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/registry/components/dialog/dialog";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack, demoStage, useQuietFirstOpen } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 440 };

export default function DialogDemo() {
  // On the docs page the dialog opens already, inside the preview: its scrim covers only the preview and the page keeps scrolling.
  const [container] = useState(demoStage);
  const quiet = useQuietFirstOpen();
  const [status, setStatus] = useState("Project “Atlas” is active.");
  const [open, setOpen] = useState(container !== null);
  return (
    <Stack align="center" gap={4}>
      <Dialog open={open} onOpenChange={setOpen} modal={!container}>
        <DialogTrigger asChild><Button variant="danger">Delete project</Button></DialogTrigger>
        <DialogContent container={container} onOpenAutoFocus={quiet} title="Delete Atlas?" description="This removes 42 files and 3 members' access. It cannot be undone.">
          <Row justify="flex-end">
            <DialogClose asChild><Button variant="ghost">Keep project</Button></DialogClose>
            <Button variant="danger" onClick={() => { setStatus("Project “Atlas” was deleted."); setOpen(false); }}>Delete</Button>
          </Row>
        </DialogContent>
      </Dialog>
      <Caption>{status}</Caption>
    </Stack>
  );
}
`;export{e as default};