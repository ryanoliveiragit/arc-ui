import type { CSSProperties } from "react";
import ThemeSwitch from "@/registry/components/theme-switch/theme-switch";
import { useTheme } from "@/site/lib/theme";
import { switchTheme } from "@/site/lib/theme-transition";
import { Caption, Stack } from "./_kit";

/** A content frame with the switch floating where a real app would keep it. */
const frame: CSSProperties = { position: "relative", border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", background: "var(--surface)", padding: "var(--space-5)" };
const line = (width: string): CSSProperties => ({ display: "block", height: 10, borderRadius: 999, background: "var(--surface-muted)", width });

export default function ThemeSwitchRiseDemo() {
  const { theme } = useTheme();
  return (
    <Stack gap={5} width={440}>
      <div style={frame}>
        <span style={{ ...line("38%"), background: "var(--surface-raised)", boxShadow: "inset 0 0 0 1px var(--border-subtle)" }} aria-hidden="true" />
        <span style={{ ...line("84%"), marginTop: "var(--space-3)" }} aria-hidden="true" />
        <span style={{ ...line("70%"), marginTop: "var(--space-3)" }} aria-hidden="true" />
        <span style={{ ...line("52%"), marginTop: "var(--space-3)" }} aria-hidden="true" />
        <span style={{ position: "absolute", right: "var(--space-4)", bottom: "var(--space-4)" }}>
          <ThemeSwitch theme={theme} variant="rise" iconOnly label="Change appearance" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "rise")} />
        </span>
      </div>
      <Caption>Rise — the new theme sweeps up from the bottom edge of the screen.</Caption>
    </Stack>
  );
}
