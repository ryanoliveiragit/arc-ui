var e=`import ThemeSwitch from "@/registry/components/theme-switch/theme-switch";
import { useTheme } from "@/site/lib/theme";
import { switchTheme } from "@/site/lib/theme-transition";
import { Caption, Row, Stack } from "./_kit";

export default function ThemeSwitchSplitDemo() {
  const { theme } = useTheme();
  return (
    <Stack gap={8} align="center">
      <Row justify="center" gap={4}>
        <ThemeSwitch theme={theme} variant="split" label="Change appearance" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "split")} />
        <ThemeSwitch theme={theme} variant="split" iconOnly label="Change appearance" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "split")} />
      </Row>
      <Caption>Split — two halves open from the center line of the page until the new theme is fully visible.</Caption>
    </Stack>
  );
}
`;export{e as default};