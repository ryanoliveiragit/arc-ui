import { useState } from "react";
import { Archive, Bold, Code, CreditCard, Italic, Link, List, LogOut, Quote, Settings, Strikethrough, Underline, Users } from "lucide-react";
import { HoverHighlight, HoverHighlightItem } from "@/registry/components/hover-highlight/hover-highlight";
import { Caption, Stack, Surface } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const pages = ["Overview", "Clients", "Invoices", "Reports"];
const menu = [
  { label: "Team members", hint: "G T", icon: Users },
  { label: "Billing and plans", hint: "G B", icon: CreditCard },
  { label: "Archived projects", hint: "G A", icon: Archive },
  { label: "Workspace settings", hint: "G S", icon: Settings },
];
const tools = [
  { label: "Bold", icon: Bold }, { label: "Italic", icon: Italic }, { label: "Underline", icon: Underline }, { label: "Strikethrough", icon: Strikethrough },
  { label: "Link", icon: Link }, { label: "Bulleted list", icon: List }, { label: "Quote", icon: Quote }, { label: "Inline code", icon: Code },
];
const hint = { marginLeft: "auto", paddingLeft: "var(--space-4)", color: "var(--text-muted)", fontSize: "var(--text-xs)", fontWeight: 400 } as const;

export default function HoverHighlightDemo() {
  const [page, setPage] = useState("Overview");
  return (
    <Stack width={400} gap={5} align="center">
      <Stack gap={2} align="center">
        <Surface padding={1} style={{ borderRadius: "var(--radius-pill)" }}>
          <HoverHighlight orientation="horizontal" tone="accent" value={page} onValueChange={setPage} aria-label="Sections" role="group" style={{ flexWrap: "nowrap" }}>
            {pages.map(name => <HoverHighlightItem key={name} value={name}>{name}</HoverHighlightItem>)}
          </HoverHighlight>
        </Surface>
        <Caption>The pill follows the pointer and returns to {page}.</Caption>
      </Stack>

      <Surface padding={2} width={320}>
        <HoverHighlight aria-label="Workspace menu" role="group">
          {menu.map(({ label, hint: keys, icon: Icon }) => (
            <HoverHighlightItem key={label}>
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              {label}
              <span style={hint}>{keys}</span>
            </HoverHighlightItem>
          ))}
          <HoverHighlightItem disabled>
            <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
            Leave workspace
            <span style={hint}>Owner</span>
          </HoverHighlightItem>
        </HoverHighlight>
      </Surface>

      <Surface padding={1}>
        <HoverHighlight orientation="horizontal" aria-label="Text formatting" role="toolbar" style={{ flexWrap: "nowrap" }}>
          {tools.map(({ label, icon: Icon }) => (
            <HoverHighlightItem key={label} aria-label={label} style={{ width: "var(--control-height-sm)", justifyContent: "center", padding: 0 }}>
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
            </HoverHighlightItem>
          ))}
        </HoverHighlight>
      </Surface>
    </Stack>
  );
}
