import { useState } from "react";
import SignaturePad, { type InkStroke } from "@/registry/components/signature-pad/signature-pad";
import { Caption, Stack } from "./_kit";

export default function SignaturePadDemo() {
  const [strokes, setStrokes] = useState<InkStroke[]>([]);
  return (
    <Stack width={520} gap={3}>
      <SignaturePad signer="Maria Alvarez" hint="Sign here to accept the lease" fileName="lease-signature" onChange={setStrokes} />
      <Caption>{strokes.length ? `${strokes.length} stroke${strokes.length > 1 ? "s" : ""} captured. Undo, replay or export it.` : "Draw with a mouse, finger or pen."}</Caption>
    </Stack>
  );
}
export const stage = { height: 520 };
