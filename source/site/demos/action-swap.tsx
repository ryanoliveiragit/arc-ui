import { useState } from "react";
import { Check, Mail, Send, Star, StarOff } from "lucide-react";
import ActionSwap from "@/registry/components/action-swap/action-swap";
import type { ActionSwapState } from "@/registry/components/action-swap/action-swap";
import { Caption, Row, Stack } from "./_kit";

const wait = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));

const sendStates: ActionSwapState[] = [
  { id: "idle", label: "Send invoice", icon: <Send size={15} aria-hidden="true" />, tone: "accent", pendingLabel: "Sending" },
  { id: "sent", label: "Sent", icon: <Check size={15} aria-hidden="true" />, tone: "success", holdFor: 2000 },
];
const followStates: ActionSwapState[] = [
  { id: "follow", label: "Follow", icon: <Star size={15} aria-hidden="true" />, tone: "neutral" },
  { id: "following", label: "Following", icon: <Star size={15} fill="currentColor" aria-hidden="true" />, tone: "quiet" },
  { id: "unfollow", label: "Unfollow", icon: <StarOff size={15} aria-hidden="true" />, tone: "warning" },
];

export default function ActionSwapDemo() {
  const [attempt, setAttempt] = useState(0);
  const [log, setLog] = useState("Nothing sent yet.");
  return (
    <Stack gap={6} align="center">
      <Row justify="center">
        <ActionSwap
          size="lg"
          states={sendStates}
          onAction={async () => { await wait(1300); setLog("Invoice #2041 sent to Acme Corp."); }}
        />
        <ActionSwap
          states={[
            { id: "idle", label: "Email report", icon: <Mail size={15} aria-hidden="true" />, pendingLabel: "Emailing" },
            { id: "sent", label: "Emailed", icon: <Check size={15} aria-hidden="true" />, tone: "success", holdFor: 1800 },
          ]}
          failureLabel="Try again"
          onAction={async () => { await wait(900); const next = attempt + 1; setAttempt(next); if (next % 2 === 1) throw new Error("fail"); }}
        />
      </Row>
      <Row justify="center">
        <ActionSwap size="sm" states={followStates} />
      </Row>
      <Caption>{log} The second button fails on its first try, then succeeds.</Caption>
    </Stack>
  );
}
