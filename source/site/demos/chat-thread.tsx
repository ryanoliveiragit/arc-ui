import { useEffect, useMemo, useState } from "react";
import { ChatThread, type ChatMessage, type ChatParticipant, type ChatDraft } from "@/registry/components/chat-thread/chat-thread";
import { avatar } from "@/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 620 };

const participants: ChatParticipant[] = [
  { id: "me", name: "You" },
  { id: "hannah", name: "Hannah Walsh", avatar: avatar("hannah-walsh") },
  { id: "jordan", name: "Jordan Reyes", avatar: avatar("jordan-reyes") },
];

export default function ChatThreadDemo() {
  const base = useMemo(() => Date.now(), []);
  const min = 60_000;
  const messages = useMemo<ChatMessage[]>(() => [
    { id: "m1", authorId: "hannah", createdAt: base - 26 * 60 * min, text: "Hi! Our invoice for October shows two charges for the Team plan." },
    { id: "m2", authorId: "me", createdAt: base - 25 * 60 * min, text: "Thanks for flagging it, Hannah. Let me look at the billing record.", status: "read" },
    { id: "m3", authorId: "hannah", createdAt: base - 40 * min, text: "Any luck? Finance closes the books on Friday." },
    { id: "m4", authorId: "hannah", createdAt: base - 39 * min, text: "Here is the invoice in case it helps.", reactions: [{ emoji: "🙏", count: 1 }] },
    { id: "m5", authorId: "me", createdAt: base - 30 * min, text: "Found it: a seat was added twice during the migration. I refunded the duplicate charge.", status: "read", reactions: [{ emoji: "🎉", count: 1 }] },
    { id: "m6", authorId: "me", createdAt: base - 29 * min, text: "The refund shows up in 3 to 5 business days.", status: "delivered" },
  ], [base]);
  const [typing, setTyping] = useState<string[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => setTyping(["hannah"]), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const onSend = (_draft: ChatDraft) => {
    setTyping(["hannah"]);
    window.setTimeout(() => setTyping([]), 2500);
  };

  return (
    <Stack width={460} gap={3}>
      <div style={{ height: 520, border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <ChatThread participants={participants} currentUserId="me" defaultMessages={messages} typing={typing} readBy={{ hannah: "m5" }} onSend={onSend} placeholder="Reply to Hannah" label="Billing support conversation" />
      </div>
      <Caption>Send a message, hover one to react, or attach a file.</Caption>
    </Stack>
  );
}
