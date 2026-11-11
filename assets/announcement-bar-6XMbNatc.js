var e=`import { useState } from "react";
import { AnnouncementBar } from "@/registry/components/announcement-bar/announcement-bar";
import { Button } from "@/registry/components/button/button";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "fill", frame: true, height: 300 };

export default function AnnouncementBarDemo() {
  const [open, setOpen] = useState(true);
  const [sale] = useState(() => Date.now() + 2 * 86_400_000 + 5 * 3_600_000);
  return (
    <div>
      <AnnouncementBar
        controls
        interval={5000}
        open={open}
        onOpenChange={setOpen}
        messages={[
          { id: "sale", message: "Spring sale: 30% off annual plans.", countdown: { to: sale, label: "Ends in" }, action: { label: "Shop the sale", href: "#sale" } },
          { id: "release", message: "Version 4.2 is here with shared workspaces.", action: { label: "See what's new", href: "#release" } },
          { id: "event", message: "Join our live product tour on Thursday at 10 am PT.", action: { label: "Save your seat", href: "#event" } },
        ]}
      />
      <Stack gap={4} align="center" style={{ padding: "var(--space-8) var(--space-4)" }}>
        {!open && <Button variant="secondary" onClick={() => setOpen(true)}>Bring the bar back</Button>}
        <Caption>Messages rotate on their own; hover to pause, or use the arrows.</Caption>
      </Stack>
    </div>
  );
}
`;export{e as default};