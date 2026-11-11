var e=`import { useState } from "react";
import { ColorSwatches } from "@/registry/components/color-swatches/color-swatches";
import type { ColorSwatch } from "@/registry/components/color-swatches/color-swatches";
import { Caption, Field, Stack, Surface } from "./_kit";

// Product finishes are data, not theme: these are the colors of the item being sold, so they are literal values rather than tokens.
const finishes: ColorSwatch[] = [
  { value: "graphite", color: "#3a3d42", label: "Graphite" },
  { value: "bone", color: "#e9e4d8", label: "Bone" },
  { value: "moss", color: "#6f7f4f", label: "Moss" },
  { value: "clay", color: "#c2714f", label: "Clay" },
  { value: "harbor", color: "#3f6c8f", label: "Harbor blue" },
  { value: "plum", color: "#6d3b5e", label: "Plum", disabled: true },
];

const labels: ColorSwatch[] = [
  { value: "teal", color: "var(--tone-teal)", label: "Teal" },
  { value: "sky", color: "var(--tone-sky)", label: "Sky" },
  { value: "violet", color: "var(--tone-violet)", label: "Violet" },
  { value: "orchid", color: "var(--tone-orchid)", label: "Orchid" },
  { value: "rose", color: "var(--tone-rose)", label: "Rose" },
  { value: "amber", color: "var(--tone-amber)", label: "Amber" },
  { value: "green", color: "var(--tone-green)", label: "Green" },
];

export default function ColorSwatchesDemo() {
  const [finish, setFinish] = useState("moss");
  const [tag, setTag] = useState("sky");
  const chosen = finishes.find(option => option.value === finish);

  return (
    <Surface width={380} padding={6}>
      <Stack gap={6}>
        <Field label={<>Finish: <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>{chosen?.label}</strong></>}>
          <ColorSwatches label="Finish" options={finishes} value={finish} onValueChange={setFinish} />
          <Caption>Plum is out of stock until March.</Caption>
        </Field>
        <Field label="Label color">
          <ColorSwatches label="Label color" options={labels} value={tag} onValueChange={setTag} size="sm" shape="rounded" />
        </Field>
      </Stack>
    </Surface>
  );
}
`;export{e as default};