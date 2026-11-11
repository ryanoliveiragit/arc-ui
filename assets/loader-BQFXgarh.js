var e=`import { useState } from "react";
import { Loader } from "@/registry/components/loader/loader";
import type { LoaderSize, LoaderVariant } from "@/registry/components/loader/loader";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Button } from "@/registry/components/button/button";
import { Row, Stack } from "./_kit";
import styles from "./loader.module.css";

const family: { variant: LoaderVariant; name: string; label: string }[] = [
  { variant: "spinner", name: "Spinner", label: "Loading invoice" },
  { variant: "dots", name: "Dots", label: "Maya is typing" },
  { variant: "bars", name: "Bars", label: "Buffering audio" },
  { variant: "ring", name: "Pulse ring", label: "Waiting for signal" },
  { variant: "orbit", name: "Orbit", label: "Building preview" },
];

const sizes = [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }];

export default function LoaderDemo() {
  const [size, setSize] = useState<LoaderSize>("lg");
  const [saving, setSaving] = useState(false);
  const save = () => { setSaving(true); window.setTimeout(() => setSaving(false), 2400); };

  return (
    <Stack gap={6} width={600} align="center">
      <SegmentedControl label="Loader size" options={sizes} value={size} onValueChange={value => setSize(value as LoaderSize)} />
      <ul className={styles.family}>
        {family.map(item => (
          <li key={item.variant} className={styles.tile}>
            <span className={styles.slot}><Loader variant={item.variant} size={size} label={item.label} /></span>
            <span className={styles.name}>{item.name}</span>
          </li>
        ))}
      </ul>
      <Row justify="center" gap={5}>
        <Button onClick={save} aria-busy={saving}>
          {saving ? <Loader size="sm" tone="current" label="Saving changes" /> : null}
          {saving ? "Saving" : "Save changes"}
        </Button>
        <Loader variant="dots" size="sm" showLabel label="Syncing 248 contacts" />
      </Row>
    </Stack>
  );
}
`;export{e as default};