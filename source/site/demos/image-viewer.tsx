import { useState } from "react";
import { ImageViewer } from "@/registry/components/image-viewer/image-viewer";
import type { ImageViewerItem } from "@/registry/components/image-viewer/image-viewer";
import { photo } from "@/lib/media";
import type { PhotoId } from "@/lib/media";
import { Caption, Stack, demoStage } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const shots: [PhotoId, string, string][] = [
  ["lisbon-tram", "Tram 28 climbing toward Graça", "Tram 28 climbing toward Graça, a little after seven."],
  ["mountain-ridges", "Mountain ridges fading into the dusk", "Ridges fading into the dusk on the walk back down."],
  ["alpine-lake", "A still alpine lake", "The lake before the wind picked up."],
  ["pool-house", "The pool house arches", "The pool house, empty until noon."],
  ["lisbon-rooftops", "Terracotta rooftops in Lisbon", "Rooftops from the Senhora do Monte lookout."],
  ["sunroom", "Arched windows of a sunroom", "Breakfast in the sunroom."],
];
const images: ImageViewerItem[] = shots.map(([id, alt, caption]) => { const { src, width, height } = photo(id); return { src, alt, caption, width, height }; });

export default function ImageViewerDemo() {
  // On the docs page the lightbox opens inside the preview: the photo grows out of its thumbnail and fits the preview, and the page keeps scrolling.
  const [container] = useState(demoStage);
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Stack width={460} gap={3}>
      <ImageViewer images={images} value={open} onValueChange={setOpen} label="Trip photos" container={container} />
      <Caption>{open === null ? "Open a photo. Inside: arrows or swipe to move, wheel, pinch or double-click to zoom, drag to pan, Escape to close." : `Viewing photo ${open + 1} of ${images.length}.`}</Caption>
    </Stack>
  );
}
