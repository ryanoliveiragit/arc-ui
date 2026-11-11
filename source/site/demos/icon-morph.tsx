import { useState } from "react";
import IconMorph, { type IconMorphName } from "@/registry/components/icon-morph/icon-morph";
import { Caption, Row, Stack } from "./_kit";

const icons: { name: IconMorphName; label: string; on: string; off: string }[] = [
  { name: "menu", label: "Menu", off: "Open menu", on: "Close menu" },
  { name: "play", label: "Play", off: "Play", on: "Pause" },
  { name: "plus", label: "Plus", off: "Add to list", on: "Added" },
  { name: "copy", label: "Copy", off: "Copy", on: "Copied" },
  { name: "theme", label: "Theme", off: "Light", on: "Dark" },
  { name: "chevron", label: "Chevron", off: "Expand", on: "Collapse" },
  { name: "bell", label: "Bell", off: "Muted", on: "Notifications on" },
  { name: "heart", label: "Heart", off: "Like", on: "Liked" },
];

export default function IconMorphDemo() {
  const [state, setState] = useState<Record<string, boolean>>({});
  return (
    <Stack gap={5} align="center" width={560}>
      <Row justify="center" gap={4}>
        {icons.map(icon => {
          const active = !!state[icon.name];
          return (
            <button
              key={icon.name}
              type="button"
              aria-pressed={active}
              aria-label={`${icon.label}: ${active ? icon.on : icon.off}`}
              onClick={() => setState(current => ({ ...current, [icon.name]: !current[icon.name] }))}
              style={{ display: "grid", justifyItems: "center", gap: "var(--space-2)", width: 112, padding: "var(--space-4) var(--space-2)", color: "var(--foreground)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", font: "inherit", cursor: "pointer" }}
            >
              <IconMorph name={icon.name} state={active} size={28} />
              <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>{active ? icon.on : icon.off}</span>
            </button>
          );
        })}
      </Row>
      <Caption>Tap any tile to morph its icon to the second state and back.</Caption>
    </Stack>
  );
}
