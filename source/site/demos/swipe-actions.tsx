import { useState } from "react";
import { Archive, MailOpen, Pin, Trash2 } from "lucide-react";
import SwipeActions, { SwipeActionsRow } from "@/registry/components/swipe-actions/swipe-actions";
import { avatar } from "@/lib/media";
import { Caption, Stack, demoStage } from "./_kit";

const initial = [
  { id: 1, from: "Emma Collins", subject: "Updated mockups for the onboarding flow", time: "9:41", face: "emma-collins" as const },
  { id: 2, from: "Marcus Johnson", subject: "Re: API rate limits for the new plan", time: "9:12", face: "marcus-johnson" as const },
  { id: 3, from: "Olivia Bennett", subject: "Deploy window moved to Thursday", time: "Yesterday", face: "olivia-bennett" as const },
  { id: 4, from: "Hannah Walsh", subject: "Customer feedback roundup, week 45", time: "Yesterday", face: "hannah-walsh" as const },
];

export default function SwipeActionsDemo() {
  const [messages, setMessages] = useState(initial);
  const [last, setLast] = useState("None yet");
  const stage = demoStage();
  const remove = (id: number, what: string) => { setMessages(list => list.filter(message => message.id !== id)); setLast(what); };
  return (
    <Stack gap={4} width={440}>
      <SwipeActions label="Inbox">
        {messages.map(message => (
          <SwipeActionsRow
            key={message.id}
            label={message.subject}
            container={stage}
            leading={[{ label: "Unread", icon: <MailOpen size={18} aria-hidden="true" />, tone: "accent", keepRow: true, onSelect: () => setLast(`Marked "${message.subject}" unread`) }]}
            trailing={[
              { label: "Delete", icon: <Trash2 size={18} aria-hidden="true" />, tone: "danger", onSelect: () => remove(message.id, "Deleted") },
              { label: "Archive", icon: <Archive size={18} aria-hidden="true" />, tone: "neutral", onSelect: () => remove(message.id, "Archived") },
              { label: "Pin", icon: <Pin size={18} aria-hidden="true" />, tone: "accent", keepRow: true, onSelect: () => setLast("Pinned") },
            ]}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)" }}>
              <img src={avatar(message.face)} alt="" width={36} height={36} style={{ borderRadius: "50%", flex: "none" }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)" }}>
                  <strong style={{ fontSize: "var(--text-sm)" }}>{message.from}</strong>
                  <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>{message.time}</span>
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{message.subject}</div>
              </div>
            </div>
          </SwipeActionsRow>
        ))}
      </SwipeActions>
      <Caption>{messages.length === 0 ? "Inbox zero." : `Last action: ${last}. Drag a row sideways, or use its menu.`}</Caption>
    </Stack>
  );
}
