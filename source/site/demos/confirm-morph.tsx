import { useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmMorph from "@/registry/components/confirm-morph/confirm-morph";
import { Caption, Field, Stack } from "./_kit";

const wait = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));

export default function ConfirmMorphDemo() {
  const [deleted, setDeleted] = useState(0);
  return (
    <Stack gap={6} align="center">
      <Field label="Press to confirm, with undo">
        <ConfirmMorph
          label="Delete project"
          icon={<Trash2 size={15} aria-hidden="true" />}
          prompt="Delete Northwind redesign?"
          onConfirm={async () => { await wait(1100); setDeleted(count => count + 1); }}
          onUndo={async () => { await wait(800); setDeleted(count => Math.max(0, count - 1)); }}
        />
      </Field>
      <Field label="Countdown you can still stop">
        <ConfirmMorph
          label="Remove 3 files"
          prompt="Remove 3 files?"
          confirmMode="countdown"
          countdown={3}
          countdownLabel="Removing in"
          confirmLabel="Remove"
          pendingLabel="Removing"
          doneLabel="Removed"
          onConfirm={() => wait(900)}
        />
      </Field>
      <Caption>Projects deleted this session: {deleted}</Caption>
    </Stack>
  );
}
