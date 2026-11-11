import { useState } from "react";
import { ImageGeneration } from "@/registry/components/image-generation/image-generation";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { photo } from "@/lib/media";
import type { PhotoId } from "@/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

const requests = {
  lake: { label: "Lake", prompt: "A quiet alpine lake at dawn, layered ridges fading into mist, flat paper-cut style", results: ["alpine-lake", "mountain-ridges", "coastline"] },
  city: { label: "City", prompt: "Lisbon rooftops in late afternoon light, terracotta and cream, minimal shapes", results: ["lisbon-rooftops", "lisbon-bridge", "lisbon-tram"] },
  arches: { label: "Arches", prompt: "A row of arches beside a pool, soft shadows, sea blue and sand palette", results: ["pool-house", "curved-facade", "sunroom"] },
} as const satisfies Record<string, { label: string; prompt: string; results: readonly PhotoId[] }>;

type RequestKey = keyof typeof requests;

export default function ImageGenerationDemo() {
  const [request, setRequest] = useState<RequestKey>("lake");
  const [variant, setVariant] = useState(0);
  const { prompt, results } = requests[request];
  const result = photo(results[variant % results.length]!);
  return (
    <Stack width={440} gap={3}>
      <ImageGeneration
        key={request}
        prompt={prompt}
        model="Studio v3 · 3:2"
        aspectRatio="3 / 2"
        src={result.src}
        alt={result.alt}
        duration={3600}
        onRegenerate={() => setVariant(current => current + 1)}
      />
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <SegmentedControl
          label="Prompt"
          value={request}
          onValueChange={value => { setRequest(value as RequestKey); setVariant(0); }}
          options={(Object.keys(requests) as RequestKey[]).map(key => ({ value: key, label: requests[key].label }))}
        />
        <Caption>Pick a prompt, or regenerate for another take.</Caption>
      </div>
    </Stack>
  );
}
