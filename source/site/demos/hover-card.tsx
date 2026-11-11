import HoverCard, { HoverCardProfile } from "@/registry/components/hover-card/hover-card";
import { avatar } from "@/lib/media";
import { Stack } from "./_kit";

const link: React.CSSProperties = { font: "inherit", color: "var(--text-primary)", fontWeight: 600, background: "none", border: 0, padding: 0, cursor: "pointer", textDecoration: "underline", textDecorationColor: "var(--border-strong)", textUnderlineOffset: 3 };

export default function HoverCardDemo() {
  return (
    <Stack width={460}>
      <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}>
        The new onboarding flow was designed by{" "}
        <HoverCard content={<HoverCardProfile name="Emma Collins" role="Product designer, Growth" avatar={avatar("emma-collins")} bio="Designs onboarding and activation. Previously at a fintech start-up." stats={[{ label: "Projects", value: 24 }, { label: "Reviews", value: 138 }]} meta="Lisbon, 4:12 PM" />}>
          <button type="button" style={link}>Emma Collins</button>
        </HoverCard>{" "}
        and built with{" "}
        <HoverCard content={<HoverCardProfile name="Marcus Johnson" role="Frontend engineer, Platform" avatar={avatar("marcus-johnson")} bio="Maintains the component library and the build pipeline." stats={[{ label: "Commits", value: "1.2k" }, { label: "Reviews", value: 412 }]} meta="Austin, 10:12 AM" />}>
          <button type="button" style={link}>Marcus Johnson</button>
        </HoverCard>
        . Hover or focus a name to preview the profile.
      </p>
    </Stack>
  );
}
