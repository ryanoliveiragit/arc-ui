var e=`import { useState } from "react";
import { ArrowRight, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/registry/components/button/button";
import { CopyButton } from "@/registry/components/copy-button/copy-button";
import { Caption, Row, Stack } from "./_kit";

export default function ButtonDemo() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaving(true);
    window.setTimeout(() => { setSaving(false); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }, 1400);
  };

  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Caption>Styles</Caption>
        <Row gap={2} justify="center">
          <Button onClick={save} loading={saving}>{saved ? "Saved" : "Save changes"}</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Delete</Button>
        </Row>
      </Stack>
      <Stack gap={2}>
        <Caption>Icons and sizes</Caption>
        <Row gap={2} justify="center">
          <Button variant="secondary"><Plus size={16} aria-hidden="true" />Add item</Button>
          <Button>Continue<ArrowRight size={16} aria-hidden="true" /></Button>
          <Button variant="ghost" aria-label="More options"><MoreHorizontal size={18} aria-hidden="true" /></Button>
          <Button size="lg" variant="secondary">Large</Button>
        </Row>
      </Stack>
      <Stack gap={2}>
        <Caption>Feedback and states</Caption>
        <Row gap={2} justify="center">
          <CopyButton value="https://ryanoliveiragit.github.io/arc-ui/#/c/button" label="Copy link" />
          <CopyButton value="https://ryanoliveiragit.github.io/arc-ui/#/c/button" iconOnly label="Copy link" />
          <Button variant="secondary">Upload file</Button>
          <Button variant="secondary" disabled>Disabled</Button>
        </Row>
      </Stack>
    </Stack>
  );
}
`;export{e as default};