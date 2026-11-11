import { useState } from "react";
import { Volume1, Volume2 } from "lucide-react";
import ElasticSlider from "@/registry/components/elastic-slider/elastic-slider";
import { Caption, Stack } from "./_kit";

export default function ElasticSliderDemo() {
  const [volume, setVolume] = useState(40);
  const [budget, setBudget] = useState(2500);
  return (
    <Stack gap={8} width={400}>
      <Stack gap={2}>
        <ElasticSlider label="Volume" value={volume} onValueChange={setVolume} startIcon={<Volume1 size={18} aria-hidden="true" />} endIcon={<Volume2 size={18} aria-hidden="true" />} />
        <Caption>Drag past either end: the track stretches and springs back.</Caption>
      </Stack>
      <ElasticSlider
        label="Monthly budget"
        value={budget}
        onValueChange={setBudget}
        min={0}
        max={5000}
        step={50}
        marks={[{ value: 0, label: "$0" }, { value: 1000, label: "$1k" }, { value: 2500, label: "$2.5k" }, { value: 5000, label: "$5k" }]}
        format={(v) => `$${v.toLocaleString("en-US")}`}
      />
    </Stack>
  );
}
