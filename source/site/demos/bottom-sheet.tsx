import { useState } from "react";
import BottomSheet, { BottomSheetClose } from "@/registry/components/bottom-sheet/bottom-sheet";
import { Button } from "@/registry/components/button/button";
import { Caption, Stack, demoStage, useQuietFirstOpen } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const lines = [
  ["Subtotal", "$128.00"], ["Shipping", "$6.50"], ["Tax", "$10.24"], ["Total", "$144.74"],
];

export default function BottomSheetDemo() {
  // On the docs page the sheet rises inside the preview, already at its peek height; its detents are fractions of the preview.
  const [container] = useState(demoStage);
  const quiet = useQuietFirstOpen();
  const [detent, setDetent] = useState(0);
  return (
    <Stack align="center" gap={4} style={{ alignSelf: "flex-start", marginTop: container ? "var(--space-10)" : undefined }}>
      <BottomSheet
        trigger={<Button variant="secondary">Review order</Button>}
        title="Order summary"
        description="Two items, shipping to Portland, OR."
        detents={container ? [0.6, 0.92] : [0.4, 0.85]}
        onDetentChange={setDetent}
        defaultOpen={container !== null}
        container={container}
        onOpenAutoFocus={quiet}
      >
        <Stack gap={3}>
          {lines.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", color: k === "Total" ? "var(--foreground)" : "var(--text-secondary)", fontWeight: k === "Total" ? 500 : undefined, fontSize: "var(--text-sm)" }}><span>{k}</span><span>{v}</span></div>
          ))}
          <Caption>Drag the sheet up for the full list, or down to dismiss.</Caption>
          <BottomSheetClose asChild><Button>Place order</Button></BottomSheetClose>
        </Stack>
      </BottomSheet>
      <Caption>Last resting height: {detent === 0 ? "peek" : "full"}</Caption>
    </Stack>
  );
}
