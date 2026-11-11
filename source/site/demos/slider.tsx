import { useState } from "react";
import { Volume1, Volume2 } from "lucide-react";
import Slider from "@/registry/components/slider/slider";
import { Stack } from "./_kit";

export default function SliderDemo() {
  const [volume, setVolume] = useState(60);
  return (
    <Stack width={420} gap={8}>
      <Slider label="Volume" value={volume} onValueChange={setVolume} start={<Volume1 size={16} aria-hidden="true" />} end={<Volume2 size={16} aria-hidden="true" />} format={(v) => `${Math.round(v)}%`} />
      <Slider label="Budget" defaultValue={[800, 2400]} min={0} max={5000} step={50} minStepsBetweenThumbs={2} format={(v) => `$${v.toLocaleString("en-US")}`} thumbLabels={["Minimum budget", "Maximum budget"]} />
      <Slider label="Quality" defaultValue={50} step={25} marks={[{ value: 0, label: "Draft" }, { value: 25 }, { value: 50, label: "Good" }, { value: 75 }, { value: 100, label: "Best" }]} showValue={false} />
    </Stack>
  );
}
