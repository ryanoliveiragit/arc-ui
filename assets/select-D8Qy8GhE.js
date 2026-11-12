var e=`import { useState } from "react";
import { Select } from "@/registry/components/select/select";
import { Caption, Stack, demoStage } from "./_kit";
import type { DemoStage } from "./_kit";

// Room for the open list below the trigger, so it never has to squeeze against the stage edge.
export const stage: DemoStage = { height: 540 };

export default function SelectDemo() {
  const [zone, setZone] = useState("");
  return (
    <Stack width={320} gap={4}>
      <Select
        label="Time zone"
        description="Used for scheduling and reminders."
        placeholder="Choose a time zone"
        value={zone}
        onValueChange={setZone}
        container={demoStage()}
        options={[
          { value: "pst", label: "Pacific Time (UTC-8)" },
          { value: "mst", label: "Mountain Time (UTC-7)" },
          { value: "est", label: "Eastern Time (UTC-5)" },
          { value: "gmt", label: "London (UTC+0)" },
          { value: "cet", label: "Central Europe (UTC+1)" },
          { value: "jst", label: "Tokyo (UTC+9)", disabled: true },
        ]}
      />
      <Caption>{zone ? \`Selected: \${zone.toUpperCase()}\` : "Open the menu and use the arrow keys."}</Caption>
    </Stack>
  );
}
`;export{e as default};