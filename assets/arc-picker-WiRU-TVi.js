var e=`import { useState } from "react";
import { ArcPicker } from "@/registry/components/arc-picker/arc-picker";
import type { ArcOption, ArcPickerProps } from "@/registry/components/arc-picker/arc-picker";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack } from "./_kit";

type Side = NonNullable<ArcPickerProps["side"]>;

const lenses: (ArcOption & { spec: string })[] = [
  { value: "13", label: "Ultra wide", spec: "13 mm, f/2.4" },
  { value: "24", label: "Wide", spec: "24 mm, f/1.8" },
  { value: "35", label: "Street", spec: "35 mm, f/1.8" },
  { value: "50", label: "Portrait", spec: "50 mm, f/1.4" },
  { value: "85", label: "Telephoto", spec: "85 mm, f/2.8" },
  { value: "macro", label: "Macro", spec: "100 mm macro, f/2.8" },
  { value: "200", label: "Wildlife", spec: "200 mm, f/4" },
];

const sides: { value: Side; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

export default function ArcPickerDemo() {
  const [lens, setLens] = useState("35");
  const [side, setSide] = useState<Side>("top");
  const chosen = lenses.find(option => option.value === lens);

  return (
    <Stack gap={4} align="center" width={480}>
      {/* A fixed slot, so the controls below hold still while the arc changes side. */}
      <div style={{ display: "flex", width: "100%", height: 280, alignItems: "center", justifyContent: "center" }}>
        <ArcPicker label="Lens" side={side} options={lenses} value={lens} onValueChange={setLens} />
      </div>
      <SegmentedControl label="Arc side" options={sides} value={side} onValueChange={next => setSide(next as Side)} />
      <Caption>{chosen?.label}: {chosen?.spec}. Scroll, drag along the arc, click a label or use the arrow keys.</Caption>
    </Stack>
  );
}
`;export{e as default};