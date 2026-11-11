import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/registry/components/dialog/dialog";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack } from "./_kit";

export default function DialogDemo() {
  const [status, setStatus] = useState("Project “Atlas” is active.");
  const [open, setOpen] = useState(false);
  return (
    <Stack align="center" gap={4}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button variant="danger">Delete project</Button></DialogTrigger>
        <DialogContent title="Delete Atlas?" description="This removes 42 files and 3 members' access. It cannot be undone.">
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
