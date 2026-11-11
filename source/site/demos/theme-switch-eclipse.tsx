import type { CSSProperties } from "react";
import ThemeSwitch from "@/registry/components/theme-switch/theme-switch";
import { useTheme } from "@/site/lib/theme";
import { switchTheme } from "@/site/lib/theme-transition";
import { Caption, Stack } from "./_kit";

/** Fake app chrome so the switch sits where it really lives: a product header. */
const bar: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", background: "var(--surface)", padding: "var(--space-3) var(--space-3) var(--space-3) var(--space-4)" };
const brand: CSSProperties = { display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontWeight: 600 };

export default function ThemeSwitchEclipseDemo() {
  const { theme } = useTheme();
  return (
    <Stack gap={5} width={440}>
      <div style={bar}>
        <span style={brand}>
          <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 6, background: "var(--accent)" }} aria-hidden="true" />
          Ledger
        </span>
        <ThemeSwitch theme={theme} variant="eclipse" iconOnly label="Change appearance" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "eclipse")} />
      </div>
      <Caption>Eclipse — the new appearance crosses the page like a disc entering from the edge and covering the screen.</Caption>
    </Stack>
  );
}
