import { useState } from "react";
import { AspectRatio } from "@/registry/components/aspect-ratio/aspect-ratio";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { photo } from "@/lib/media";
import { Caption, Stack } from "./_kit";
import styles from "./aspect-ratio.module.css";

const formats = [
  { value: "16/9", label: "16:9", use: "Widescreen video and hero banners" },
  { value: "4/3", label: "4:3", use: "Product shots and presentation slides" },
  { value: "1/1", label: "1:1", use: "Feed posts and catalog thumbnails" },
  { value: "9/16", label: "9:16", use: "Stories and vertical video" },
];

export default function AspectRatioDemo() {
  const [ratio, setRatio] = useState("16/9");
  const picture = photo("mountain-ridges");
  const format = formats.find(entry => entry.value === ratio) ?? formats[0]!;

  return (
    <Stack width={480} gap={4} align="center">
      <div className={styles.frame}>
        <AspectRatio ratio={ratio} maxHeight={264}>
          <img src={picture.src} alt={picture.alt} draggable={false} />
          <span className={styles.badge}>{format.label}</span>
        </AspectRatio>
      </div>
      <SegmentedControl label="Crop format" options={formats.map(({ value, label }) => ({ value, label }))} value={ratio} onValueChange={setRatio} />
      <Caption>{format.use}.</Caption>
    </Stack>
  );
}
