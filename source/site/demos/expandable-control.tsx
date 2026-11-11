import { useState } from "react";
import { Bell, Bookmark, Check, Copy, Filter, Radio, Share2, X } from "lucide-react";
import { ExpandableControl } from "@/registry/components/expandable-control/expandable-control";
import { Caption, Row, Stack } from "./_kit";

type Tool = "share" | "save" | "alerts";

export default function ExpandableControlDemo() {
  const [open, setOpen] = useState<Tool | null>("share");
  const [copied, setCopied] = useState(false);
  const [live, setLive] = useState(false);
  const [filter, setFilter] = useState(true);

  const toggle = (tool: Tool) => (next: boolean) => setOpen(next ? tool : null);
  const copy = () => { setCopied(true); window.setTimeout(() => setCopied(false), 1600); };

  return (
    <Stack gap={8} align="center">
      <Stack gap={3} align="center">
        <Row gap={2} justify="center">
          <ExpandableControl
            tone="accent"
            icon={<Share2 size={18} />}
            label={copied ? "Link copied" : "Share article"}
            expanded={open === "share"}
            onExpandedChange={toggle("share")}
            action={{ icon: copied ? <Check size={16} /> : <Copy size={16} />, label: "Copy link", onClick: copy }}
          />
          <ExpandableControl tone="accent" icon={<Bookmark size={18} />} label="Saved to Reading list" expanded={open === "save"} onExpandedChange={toggle("save")} />
          <ExpandableControl tone="accent" icon={<Bell size={18} />} label="Notify me" detail="weekly" expanded={open === "alerts"} onExpandedChange={toggle("alerts")} />
        </Row>
        <Caption>Press an icon: it opens in place and the others make room.</Caption>
      </Stack>

      <Row gap={2} justify="center">
        <ExpandableControl variant="chip" icon={<Radio size={15} />} label="Live now" detail="128 watching" expanded={live} onExpandedChange={setLive} />
        <ExpandableControl
          variant="chip"
          icon={<Filter size={15} />}
          label="Status: Open"
          expanded={filter}
          onExpandedChange={setFilter}
          action={{ icon: <X size={14} />, label: "Clear filter", onClick: () => setFilter(false) }}
        />
      </Row>
    </Stack>
  );
}
