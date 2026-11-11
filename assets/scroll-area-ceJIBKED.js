var e=`import ScrollArea from "@/registry/components/scroll-area/scroll-area";
import { Caption, Stack } from "./_kit";

const changes = ["Added dark mode to the settings page", "Fixed a crash when exporting empty reports", "Faster search across large workspaces", "New keyboard shortcuts for navigation", "Improved accessibility of dialogs", "Billing page now shows annual savings", "Reduced bundle size by 18 percent", "Support for CSV import with custom headers", "Notifications can be snoozed for a day", "Updated onboarding checklist"];
const tags = ["Design", "Engineering", "Marketing", "Sales", "Support", "Finance", "Operations", "Research", "Legal", "People"];

export default function ScrollAreaDemo() {
  return (
    <Stack gap={5} width={440}>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", background: "var(--surface)" }}>
        <ScrollArea label="Release notes" maxHeight={200}>
          <ul style={{ margin: 0, padding: "var(--space-3) var(--space-4)", listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-3)", color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
            {changes.map(c => <li key={c}>{c}</li>)}
          </ul>
        </ScrollArea>
      </div>
      <ScrollArea orientation="horizontal" label="Teams">
        <div style={{ display: "flex", gap: "var(--space-2)", padding: "var(--space-2)" }}>
          {tags.map(t => <span key={t} style={{ flex: "none", padding: "var(--space-1) var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-pill)", color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{t}</span>)}
        </div>
      </ScrollArea>
      <Caption>Fades and thin scrollbars appear only where content overflows.</Caption>
    </Stack>
  );
}
`;export{e as default};