import { useState } from "react";
import { Checkbox } from "@/registry/components/checkbox/checkbox";
import { Caption, Stack } from "./_kit";

export default function CheckboxDemo() {
  const [items, setItems] = useState({ updates: true, digest: false, security: true });
  const all = Object.values(items).every(Boolean);
  const some = Object.values(items).some(Boolean);
  const set = (k: keyof typeof items) => (c: boolean | "indeterminate") => setItems((s) => ({ ...s, [k]: c === true }));
  return (
    <Stack gap={4} width={380}>
      <Checkbox
        label="All notifications"
        checked={all ? true : some ? "indeterminate" : false}
        onCheckedChange={(c) => setItems({ updates: c === true, digest: c === true, security: c === true })}
      />
      <Stack gap={3} style={{ paddingLeft: "var(--space-6)" }}>
        <Checkbox label="Product updates" description="New features and improvements." checked={items.updates} onCheckedChange={set("updates")} />
        <Checkbox label="Weekly digest" description="A Monday summary of your workspace." checked={items.digest} onCheckedChange={set("digest")} />
        <Checkbox label="Security alerts" description="Sign-ins from new devices." checked={items.security} onCheckedChange={set("security")} />
        <Checkbox label="Billing emails" description="Managed by your admin." checked disabled />
      </Stack>
      <Caption>The top box turns indeterminate when only some are on.</Caption>
    </Stack>
  );
}
