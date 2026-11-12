var e=`import type { CSSProperties } from "react";
import ThemeSwitch from "@/registry/components/theme-switch/theme-switch";
import { useTheme } from "@/site/lib/theme";
import { switchTheme } from "@/site/lib/theme-transition";
import { Caption, Stack } from "./_kit";

/** A real content card (not placeholder bars) with the switch floating where a reading view keeps it. */
const frame: CSSProperties = { position: "relative", border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", background: "var(--surface)", padding: "var(--space-5) 4rem var(--space-6) var(--space-5)" }; // right padding keeps the text clear of the switch at narrow widths

export default function ThemeSwitchRiseDemo() {
  const { theme } = useTheme();
  return (
    <Stack gap={5} width={440}>
      <article style={frame}>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>Weekly report · Nov 9</p>
        <h3 style={{ margin: "var(--space-2) 0 0", color: "var(--foreground)", fontFamily: "var(--font-body)", fontSize: "var(--text-lg)", fontWeight: 500, letterSpacing: "var(--tracking-body)" }}>Signups are up 18% this week</h3>
        <p style={{ margin: "var(--space-2) 0 0", maxWidth: "32ch", color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" }}>Most came from the new pricing page, and retention held steady across every plan.</p>
        <span style={{ position: "absolute", right: "var(--space-4)", bottom: "var(--space-4)" }}>
          <ThemeSwitch theme={theme} variant="rise" iconOnly label="Change appearance" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "rise")} />
        </span>
      </article>
      <Caption>Rise — the new theme sweeps up from the bottom edge of the screen.</Caption>
    </Stack>
  );
}
`;export{e as default};