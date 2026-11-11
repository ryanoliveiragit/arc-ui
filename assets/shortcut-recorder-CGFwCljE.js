var e=`import { useState } from "react";
import ShortcutRecorder, { ShortcutList } from "@/registry/components/shortcut-recorder/shortcut-recorder";
import { Caption, Stack } from "./_kit";

export default function ShortcutRecorderDemo() {
  const [value, setValue] = useState<string | null>("Mod+K");
  return (
    <Stack width={480} gap={6}>
      <Stack gap={2}>
        <ShortcutRecorder
          label="Open command palette"
          description="Press the field, then the new combination."
          value={value}
          onValueChange={(v) => setValue(v)}
          resetValue="Mod+K"
          bindings={[{ shortcut: "Mod+P", label: "Quick open" }, { shortcut: "Mod+Shift+F", label: "Search in files" }]}
        />
        <Caption>Stored as: {value ?? "unset"}. Try Mod+P to see a conflict warning.</Caption>
      </Stack>
      <ShortcutList
        groups={[
          { label: "Navigation", items: [{ label: "Command palette", shortcut: "Mod+K" }, { label: "Quick open", shortcut: "Mod+P" }, { label: "Go to line", shortcut: "Ctrl+G" }] },
          { label: "Editing", items: [{ label: "Duplicate line", shortcut: "Mod+Shift+D" }, { label: "Toggle comment", shortcut: "Mod+/" }] },
        ]}
      />
    </Stack>
  );
}
export const stage = { height: 560 };
`;export{e as default};