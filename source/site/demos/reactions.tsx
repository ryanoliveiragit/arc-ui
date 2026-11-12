import { Flame, Heart, PartyPopper, Rocket, ThumbsUp, Laugh } from "lucide-react";
import Reactions from "@/registry/components/reactions/reactions";
import { Caption, Room, Surface, demoStage, useQuietFirstOpen } from "./_kit";

const options = [
  { id: "like", label: "Like", icon: ThumbsUp },
  { id: "love", label: "Love", icon: Heart },
  { id: "celebrate", label: "Celebrate", icon: PartyPopper },
  { id: "funny", label: "Funny", icon: Laugh },
  { id: "fire", label: "Fire", icon: Flame },
  { id: "launch", label: "Launch", icon: Rocket },
];

export default function ReactionsDemo() {
  // The picker is already open over the bar, inside the stage, so the full set of reactions shows.
  const quiet = useQuietFirstOpen();
  return (
    <Room above={64} width={440}>
      <Surface padding={5} style={{ display: "grid", gap: "var(--space-4)" }}>
        <div>
          <strong style={{ display: "block" }}>v2.0 is live</strong>
          <span style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>Dark mode, faster builds, and 40 new components. Thanks to everyone who tested the beta.</span>
        </div>
        <Reactions
          label="Reactions to the v2.0 announcement"
          defaultOpen
          onOpenAutoFocus={quiet}
          container={demoStage()}
          options={options}
          defaultValue={[
            { id: "celebrate", count: 24, reacted: false },
            { id: "love", count: 11, reacted: true },
            { id: "launch", count: 7, reacted: false },
          ]}
        />
      </Surface>
      <Caption>Tap a pill to add or remove your reaction, or open the picker for more.</Caption>
    </Room>
  );
}
