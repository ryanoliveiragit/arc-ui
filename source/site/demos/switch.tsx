import { useState } from "react";
import Switch from "@/registry/components/switch/switch";

export default function SwitchDemo() {
  const [enabled, setEnabled] = useState(true);
  return <Switch label="Weekly digest" checked={enabled} onCheckedChange={setEnabled} />;
}
