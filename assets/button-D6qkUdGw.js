var e=`import { useState } from "react";
import { ArrowRight, Download, Trash2 } from "lucide-react";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack } from "./_kit";

export default function ButtonDemo() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaving(true);
    window.setTimeout(() => { setSaving(false); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }, 1400);
  };

  return (
    <Stack gap={8} align="center">
      <Row justify="center">
        <Button onClick={save} loading={saving}>{saved ? "Saved" : "Save changes"}</Button>
        <Button variant="secondary"><Download size={16} aria-hidden="true" />Export</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="danger"><Trash2 size={16} aria-hidden="true" />Delete</Button>
      </Row>
      <Row justify="center">
        <Button size="sm" variant="secondary">Small</Button>
        <Button size="md" variant="secondary">Medium</Button>
        <Button size="lg" variant="secondary">Large<ArrowRight size={16} aria-hidden="true" /></Button>
        <Button variant="secondary" disabled>Disabled</Button>
      </Row>
      <Caption>Press “Save changes” to see the loading state and the label morph.</Caption>
    </Stack>
  );
}
`;export{e as default};