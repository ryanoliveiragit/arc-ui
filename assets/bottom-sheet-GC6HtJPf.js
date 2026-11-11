var e=`import { useState } from "react";
import BottomSheet, { BottomSheetClose } from "@/registry/components/bottom-sheet/bottom-sheet";
import { Button } from "@/registry/components/button/button";
import { Caption, Stack } from "./_kit";

const lines = [
  ["Subtotal", "$128.00"], ["Shipping", "$6.50"], ["Tax", "$10.24"], ["Total", "$144.74"],
];

export default function BottomSheetDemo() {
  const [detent, setDetent] = useState(0);
  return (
    <Stack align="center" gap={4}>
      <BottomSheet
        trigger={<Button variant="secondary">Review order</Button>}
        title="Order summary"
        description="Two items, shipping to Portland, OR."
        detents={[0.4, 0.85]}
        onDetentChange={setDetent}
      >
        <Stack gap={3}>
          {lines.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}><span>{k}</span><span>{v}</span></div>
          ))}
          <Caption>Drag the sheet up for the full list, or down to dismiss.</Caption>
          <BottomSheetClose asChild><Button>Place order</Button></BottomSheetClose>
        </Stack>
      </BottomSheet>
      <Caption>Last resting height: {detent === 0 ? "peek" : "full"}</Caption>
    </Stack>
  );
}
`;export{e as default};