var e=`import { useState } from "react";
import { RotateCw } from "lucide-react";
import ScrubInput from "@/registry/components/scrub-input/scrub-input";
import { Caption, Row, Stack } from "./_kit";

export default function ScrubInputDemo() {
  const [w, setW] = useState(320);
  return (
    <Stack width={360} gap={4}>
      <Row gap={3} wrap={false}>
        <ScrubInput label="W" value={w} onValueChange={setW} min={0} max={1200} unit="px" units={["px", "%"]} />
        <ScrubInput label="H" defaultValue={180} min={0} max={1200} unit="px" units={["px", "%"]} />
      </Row>
      <Row gap={3} wrap={false}>
        <ScrubInput label={<RotateCw size={16} aria-hidden="true" />} aria-label="Rotation" defaultValue={45} min={0} max={360} wrap unit="°" />
        <ScrubInput label="Opacity" defaultValue={80} min={0} max={100} unit="%" />
      </Row>
      <Caption>Drag a label to scrub, double click to reset, or type math such as 320/2 + 8. Width: {w}.</Caption>
    </Stack>
  );
}
`;export{e as default};