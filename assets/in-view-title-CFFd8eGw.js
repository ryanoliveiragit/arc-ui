var e=`import { useState } from "react";
import InViewTitle from "@/registry/components/in-view-title/in-view-title";
import type { InViewTitleVariant } from "@/registry/components/in-view-title/in-view-title";
import { Button } from "@/registry/components/button/button";
import { Row, Stack } from "./_kit";

const variants: InViewTitleVariant[] = ["blur", "word", "line", "tracking", "wipe"];

export default function InViewTitleDemo() {
  const [variant, setVariant] = useState<InViewTitleVariant>("blur");
  return (
    <Stack gap={6} align="center" width={560}>
      <div style={{ minHeight: 96, display: "grid", placeItems: "center", textAlign: "center" }}>
        <InViewTitle key={variant} variant={variant} text="Ship interfaces people remember" lines={["Ship interfaces", "people remember"]} />
      </div>
      <Row justify="center" gap={2}>
        {variants.map(v => <Button key={v} size="sm" variant={v === variant ? "primary" : "secondary"} onClick={() => setVariant(v)}>{v}</Button>)}
      </Row>
    </Stack>
  );
}
`;export{e as default};