var e=`import { useState } from "react";
import TextShimmer from "@/registry/components/text-shimmer/text-shimmer";
import { Button } from "@/registry/components/button/button";
import { Caption, Stack } from "./_kit";

export default function TextShimmerDemo() {
  const [working, setWorking] = useState(true);
  return (
    <Stack align="center" gap={5}>
      <TextShimmer as="p" active={working}>{working ? "Analyzing 1,284 transactions…" : "Analysis complete"}</TextShimmer>
      <Button variant="secondary" onClick={() => setWorking(w => !w)}>{working ? "Finish" : "Start again"}</Button>
      <Caption>The light sweeps only while work is ongoing.</Caption>
    </Stack>
  );
}
`;export{e as default};