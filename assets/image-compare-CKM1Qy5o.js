var e=`import { useState } from "react";
import { ImageCompare } from "@/registry/components/image-compare/image-compare";
import { photo } from "@/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 480 };

const cover = { width: "100%", height: "100%", objectFit: "cover", display: "block" } as const;

export default function ImageCompareDemo() {
  const [position, setPosition] = useState(50);
  const before = photo("terracotta-waves");
  const after = photo("sea-at-dusk");
  return (
    <Stack width={560} gap={3}>
      <ImageCompare
        defaultPosition={50}
        onPositionChange={p => setPosition(Math.round(p))}
        labels={["Original", "Retouched"]}
        label="Original and retouched photo"
        aspectRatio="4 / 3"
        before={<img src={before.src} alt={before.alt} style={cover} />}
        after={<img src={after.src} alt={after.alt} style={cover} />}
      />
      <Caption>Drag the divider, or focus it and use the arrow keys. Retouched shows {100 - position}%.</Caption>
    </Stack>
  );
}
`;export{e as default};