import { ResizablePanel, ResizablePanels } from "@/registry/components/resizable-panels/resizable-panels";
import { Caption, Stack } from "./_kit";

const pane = (title: string, rows: string[]) => (
  <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)", width: "100%" }}>
    <strong style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)" }}>{title}</strong>
    {rows.map(r => <span key={r} style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", whiteSpace: "nowrap" }}>{r}</span>)}
  </div>
);

export default function ResizablePanelsDemo() {
  return (
    <Stack gap={4} width={640}>
      <div style={{ height: 260, border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", overflow: "hidden", background: "var(--surface)" }}>
        <ResizablePanels label="Mail layout">
          <ResizablePanel id="folders" label="Folders" defaultSize={22} minSize={110} collapsible>{pane("Folders", ["Inbox", "Starred", "Drafts", "Sent"])}</ResizablePanel>
          <ResizablePanel id="list" label="Messages" defaultSize={38} minSize={160}>{pane("Messages", ["Design review notes", "Invoice 2041", "Team offsite plan"])}</ResizablePanel>
          <ResizablePanel id="reader" label="Reader" defaultSize={40} minSize={160}>{pane("Design review notes", ["From Jasmine Brooks", "Thursday, 9:14 AM"])}</ResizablePanel>
        </ResizablePanels>
      </div>
      <Caption>Drag a divider, use arrow keys, or drag the folders pane closed.</Caption>
    </Stack>
  );
}
