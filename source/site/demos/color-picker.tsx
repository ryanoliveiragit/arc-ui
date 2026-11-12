import { useState } from "react";
import ColorPicker from "@/registry/components/color-picker/color-picker";
import { Caption } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 580 };

/** The swatch is the panel's top-left corner: it sits at the left of a box as wide as the panel, so the open panel is centered. */
const PANEL = 304;

export default function ColorPickerDemo() {
  // The preview opens the picker on load (focus stays on the page); the space it grows into is reserved below the swatch.
  const [color, setColor] = useState("#2F6BFF");
  return (
    <div style={{ display: "flex", width: `min(${PANEL}px, 100%)`, flexDirection: "column", alignItems: "flex-start", gap: "var(--space-3)" }}>
      <div style={{ paddingBottom: 400 }}>
        <ColorPicker
          label="Accent"
          value={color}
          onValueChange={setColor}
          defaultOpen
          defaultSwatches={[
            { id: "a", color: "#2F6BFF" },
            { id: "b", color: "#E5484D" },
            { id: "c", color: "#30A46C" },
            { id: "d", color: "#F5A524" },
          ]}
        />
      </div>
      <Caption>Current value: {color}. Drag the area, switch the format or save a swatch.</Caption>
    </div>
  );
}
