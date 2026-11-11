var e=`import { useState } from "react";
import TextReveal from "@/registry/components/text-reveal/text-reveal";
import { Button } from "@/registry/components/button/button";
import { Stack } from "./_kit";

export default function TextRevealDemo() {
  const [run, setRun] = useState(0);
  return (
    <Stack align="center" gap={5} width={520}>
      <div key={run} style={{ textAlign: "center" }}>
        <TextReveal text="Everything your team needs, in one calm place." />
      </div>
      <Button variant="secondary" size="sm" onClick={() => setRun(r => r + 1)}>Replay</Button>
    </Stack>
  );
}
`;export{e as default};