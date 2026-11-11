import { useState } from "react";
import { PreviewRail } from "@/registry/components/preview-rail/preview-rail";
import type { PreviewRailItem } from "@/registry/components/preview-rail/preview-rail";
import { photo } from "@/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 460 };

const guides: PreviewRailItem[] = [
  { id: "tram", eyebrow: "Lisbon", title: "Route 28 by tram", description: "From Graça down to Estrela, with the four stops worth getting off for.", meta: "Half a day · 9 km", image: photo("lisbon-tram").src },
  { id: "ridge", eyebrow: "Dolomites", title: "The ridge walk at dusk", description: "A gentle loop that keeps the valley on your left and the light in front of you.", meta: "3 h 20 min · moderate", image: photo("mountain-ridges").src },
  { id: "pool", eyebrow: "Alentejo", title: "A weekend at the pool house", description: "Whitewashed arches, a cold plunge and nothing on the schedule until dinner.", meta: "2 nights · sleeps four", image: photo("pool-house").src },
  { id: "hall", eyebrow: "Porto", title: "Tuesday at the concert hall", description: "Rush seats open at six. Arrive early and take the back stairs to the upper tier.", meta: "Evening · from 12 €", image: photo("concert-hall").src },
  { id: "sunroom", eyebrow: "Sintra", title: "Breakfast in the sunroom", description: "A glasshouse café behind the old nursery, best before the tour buses arrive.", meta: "Opens 8:00 · walk-in", image: photo("sunroom").src },
];

export default function PreviewRailDemo() {
  const [open, setOpen] = useState("ridge");
  const [saved, setSaved] = useState<string | null>(null);
  const current = guides.find(guide => guide.id === open);
  return (
    <Stack width={760} gap={4}>
      <PreviewRail items={guides} value={open} onValueChange={setOpen} onSelect={guide => setSaved(guide.title)} label="Weekend guides" />
      <Caption>{saved ? `Opened “${saved}”.` : `Previewing “${current?.title}”. Hover, tap or use the arrow keys; press the open card to pick it.`}</Caption>
    </Stack>
  );
}
