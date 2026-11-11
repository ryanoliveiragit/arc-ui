var e=`import { useState } from "react";
import RulerSlider from "@/registry/components/ruler-slider/ruler-slider";
import { Caption, Stack } from "./_kit";

export default function RulerSliderDemo() {
  const [height, setHeight] = useState(172);
  return (
    <Stack width={420} gap={5}>
      <RulerSlider label="Height" unit="cm" min={120} max={220} step={1} majorEvery={10} value={height} onValueChange={setHeight} />
      <Caption>Drag, flick or tap the tape. Arrow keys step one tick. {height} cm is about {(height / 30.48).toFixed(1)} ft.</Caption>
    </Stack>
  );
}
`;export{e as default};