var e=`import { useState } from "react";
import Switch from "@/registry/components/switch/switch";
import { Caption, Stack } from "./_kit";

export default function SwitchDemo() {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  return (
    <Stack width={320} gap={4}>
      <Switch label="Push notifications" checked={push} onCheckedChange={setPush} />
      <Switch label="Weekly email digest" checked={email} onCheckedChange={setEmail} />
      <Switch label="Beta features (managed by admin)" defaultChecked disabled />
      <Caption>Push {push ? "on" : "off"}, digest {email ? "on" : "off"}. Changes apply immediately.</Caption>
    </Stack>
  );
}
`;export{e as default};