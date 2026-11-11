import { useState } from "react";
import { ArrowButton, MagneticButton, SlideToConfirm } from "@/registry/components/cta-buttons/cta-buttons";
import { Caption, Row, Stack } from "./_kit";

export default function CtaButtonsDemo() {
  const [trials, setTrials] = useState(0);
  const [paid, setPaid] = useState(false);

  return (
    <Stack gap={8} align="center" width={520}>
      <Stack gap={3} align="center">
        <Row gap={3} justify="center">
          <ArrowButton onClick={() => setTrials(count => count + 1)}>Start free trial</ArrowButton>
          <ArrowButton size="md">See pricing</ArrowButton>
        </Row>
        <Caption>{trials === 0 ? "Hover or focus: the arrow disc grows to fill the button." : `Trial started ${trials} ${trials === 1 ? "time" : "times"}. No card needed.`}</Caption>
      </Stack>

      <Stack gap={3} align="center">
        <Row gap={4} justify="center">
          <MagneticButton>Book a demo</MagneticButton>
          <MagneticButton variant="outline" strength={0.22}>Talk to sales</MagneticButton>
        </Row>
        <Caption>Bring the cursor close: the buttons lean toward it.</Caption>
      </Stack>

      <Stack gap={3} align="center" style={{ width: "100%" }}>
        <SlideToConfirm label="Slide to pay $48.00" confirmedLabel="Payment sent" confirmed={paid} onConfirmedChange={setPaid} resetAfter={2600} />
        <Caption>{paid ? "Paid to Fernway Studio. Resetting for the demo." : "Drag the thumb to the end, or focus it and press Enter."}</Caption>
      </Stack>
    </Stack>
  );
}
