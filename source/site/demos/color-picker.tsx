import { useState } from "react";
import ColorPicker from "@/registry/components/color-picker/color-picker";
import { Caption, Stack } from "./_kit";

export default function ColorPickerDemo() {
  const [color, setColor] = useState("#2F6BFF");
  return (
    <Stack gap={4} align="center" style={{ minHeight: 360 }}>
      <ColorPicker
        label="Accent"
        value={color}
        onValueChange={setColor}
        defaultSwatches={[
          { id: "a", color: "#2F6BFF" },
          { id: "b", color: "#E5484D" },
          { id: "c", color: "#30A46C" },
          { id: "d", color: "#F5A524" },
        ]}
      />
      <Caption>Current value: {color}. Open the swatch to change format or save colors.</Caption>
    </Stack>
  );
}
