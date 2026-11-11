import { useState } from "react";
import { CardStack, type CardDecision } from "@/registry/components/card-stack/card-stack";
import { photo } from "@/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 480 };

const trips = [
  { id: "lisbon", name: "Lisbon", note: "Tiled streets and trams from €420", img: photo("lisbon-rooftops") },
  { id: "dolomites", name: "Dolomites", note: "Alpine lakes and hut-to-hut hikes from €690", img: photo("alpine-lake") },
  { id: "algarve", name: "Algarve", note: "Quiet coves and sea-view dinners from €380", img: photo("coastline") },
  { id: "tuscany", name: "Tuscany", note: "Slow farm stays from €540", img: photo("terracotta-waves") },
];

export default function CardStackDemo() {
  const [kept, setKept] = useState<string[]>([]);
  const decide = (trip: (typeof trips)[number], d: CardDecision) => setKept(k => (d === "right" ? [...k, trip.name] : k));
  return (
    <Stack gap={4} align="center">
      <CardStack
        label="Trip ideas"
        items={trips}
        getKey={t => t.id}
        getLabel={t => t.name}
        labels={{ left: "Skip", right: "Shortlist" }}
        outcomes={{ left: "skipped", right: "shortlisted" }}
        onDecide={decide}
        onReset={() => setKept([])}
        renderCard={t => (
          <div style={{ position: "relative", height: "100%" }}>
            <img src={t.img.src} alt="" draggable={false} style={{ display: "block", width: "100%", height: "60%", objectFit: "cover" }} />
            <div style={{ padding: "var(--space-4)", display: "grid", gap: "var(--space-1)" }}>
              <strong style={{ fontSize: "var(--text-lg)" }}>{t.name}</strong>
              <span style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{t.note}</span>
            </div>
          </div>
        )}
      />
      <Caption>Drag a card or use the buttons. Shortlisted: {kept.length ? kept.join(", ") : "none yet"}.</Caption>
    </Stack>
  );
}
