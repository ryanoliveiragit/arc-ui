var e=`import ThemeSwitch from "@/registry/components/theme-switch/theme-switch";
import { useTheme } from "@/site/lib/theme";
import { switchTheme } from "@/site/lib/theme-transition";
import { Caption, Row, Stack } from "./_kit";

export default function ThemeSwitchDemo() {
  const { theme } = useTheme();
  return (
    <Stack gap={8} align="center">
      <Row justify="center" gap={4}>
        <ThemeSwitch theme={theme} label="Change appearance" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "reveal")} />
        <ThemeSwitch theme={theme} iconOnly label="Change appearance" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "reveal")} />
      </Row>
      <Caption>Reveal — a circle grows out of the button and floods the page with the next theme. This is the default variant.</Caption>
    </Stack>
  );
}
`;export{e as default};