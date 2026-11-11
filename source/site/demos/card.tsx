import { useState } from "react";
import { Card } from "@/registry/components/card/card";
import { Avatar } from "@/registry/components/avatar/avatar";
import { Button } from "@/registry/components/button/button";
import { avatar, photo } from "@/lib/media";
import { Caption, Stack } from "./_kit";

const cover = photo("lisbon-bridge");

export default function CardDemo() {
  const [status, setStatus] = useState("Updated 2 hours ago");
  return (
    <Stack gap={4} width={360}>
      <Card
        title="Lisbon in three days"
        description="Trams, tiled facades and the best pastries in town. A relaxed itinerary for first-time visitors."
        media={<img src={cover.src} alt={cover.alt} style={{ display: "block", width: "100%", aspectRatio: "16 / 10", objectFit: "cover" }} />}
        avatar={<Avatar name="Emma Collins" src={avatar("emma-collins")} size="sm" />}
        meta="Emma Collins"
        status={status}
        action={<Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); setStatus("Updated just now"); }}>Refresh</Button>}
        details={
          <div style={{ display: "grid", gap: "var(--space-3)", color: "var(--text-secondary)" }}>
            <p style={{ margin: 0 }}>Day one: Alfama and the old tram 28 route. Day two: Belém, then sunset at the Miradouro da Senhora do Monte. Day three: day trip to Sintra.</p>
            <p style={{ margin: 0 }}>Best time to go is April to June, when the city is warm but not crowded.</p>
          </div>
        }
      />
      <Caption>Click the card to open its quick look.</Caption>
    </Stack>
  );
}
