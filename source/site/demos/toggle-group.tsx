import { useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";
import ToggleGroup, { ToggleGroupItem } from "@/registry/components/toggle-group/toggle-group";
import { Caption, Row, Stack } from "./_kit";

export default function ToggleGroupDemo() {
  const [style, setStyle] = useState<string[]>(["bold"]);
  const [align, setAlign] = useState("left");
  return (
    <Stack gap={5} align="center">
      <Row justify="center">
        <ToggleGroup type="multiple" label="Text style" value={style} onValueChange={setStyle}>
          <ToggleGroupItem value="bold" label="Bold"><Bold size={16} aria-hidden="true" /></ToggleGroupItem>
          <ToggleGroupItem value="italic" label="Italic"><Italic size={16} aria-hidden="true" /></ToggleGroupItem>
          <ToggleGroupItem value="underline" label="Underline"><Underline size={16} aria-hidden="true" /></ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup label="Alignment" value={align} onValueChange={setAlign}>
          <ToggleGroupItem value="left" label="Align left"><AlignLeft size={16} aria-hidden="true" /></ToggleGroupItem>
          <ToggleGroupItem value="center" label="Align center"><AlignCenter size={16} aria-hidden="true" /></ToggleGroupItem>
          <ToggleGroupItem value="right" label="Align right"><AlignRight size={16} aria-hidden="true" /></ToggleGroupItem>
        </ToggleGroup>
      </Row>
      <Caption>Style: {style.join(", ") || "none"}. Alignment: {align}. Adjacent pressed items join.</Caption>
    </Stack>
  );
}
