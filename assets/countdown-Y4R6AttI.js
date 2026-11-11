var e=`import { useState } from "react";
import { Countdown } from "@/registry/components/countdown/countdown";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack } from "./_kit";

export default function CountdownDemo() {
  const [launch, setLaunch] = useState(() => Date.now() + 3 * 86_400_000 + 4 * 3_600_000 + 27 * 60_000 + 12_000);
  const [soon, setSoon] = useState(() => Date.now() + 8_000);
  return (
    <Stack gap={8} align="center">
      <Stack gap={3} align="center">
        <Countdown target={launch} label="Aurora 2.0 launches in" />
        <Caption>Aurora 2.0 launch</Caption>
      </Stack>
      <Row gap={4} justify="center">
        <Countdown target={soon} variant="compact" units={["minutes", "seconds"]} completeLabel="Doors are open" label="Doors open in" />
        <Button size="sm" variant="secondary" onClick={() => setSoon(Date.now() + 6_000)}>Restart 6 s timer</Button>
        <Button size="sm" variant="ghost" onClick={() => setLaunch(Date.now() + 5 * 86_400_000)}>Move launch</Button>
      </Row>
      <Caption>Wait for the small timer to hit zero to see the digits morph into the live state.</Caption>
    </Stack>
  );
}
`;export{e as default};