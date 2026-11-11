var e=`import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import { MessageBubble, MessageBubbleGroup } from "@/registry/components/message-bubble/message-bubble";
import type { MessageBubbleFrom, MessageBubbleStatus } from "@/registry/components/message-bubble/message-bubble";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./message-bubble.module.css";

export const stage: DemoStage = { height: 560 };

interface Line { id: number; from: MessageBubbleFrom; text: string; time: string; status?: MessageBubbleStatus; typing?: boolean; fresh?: boolean }

const history: Line[] = [
  { id: 1, from: "assistant", text: "Morning! Your flight to Lisbon is confirmed for Friday.", time: "9:38" },
  { id: 2, from: "assistant", text: "Want me to book the airport transfer too?", time: "9:38" },
  { id: 3, from: "user", text: "Yes please.", time: "9:41", status: "read" },
  { id: 4, from: "user", text: "Anything that gets me downtown before noon.", time: "9:41", status: "read" },
];
const replies = ["Done. A car will be waiting at arrivals at 10:15.", "Got it, I added that to the booking.", "Sure. I will confirm once the driver accepts."];
/** The demo keeps its own clock so new lines continue the sample conversation: one minute per exchange. */
const clock = (turn: number) => \`9:\${42 + (turn % 18)}\`;

/** Consecutive lines from one sender become one group, so only the last bubble of a run keeps its tail. */
function runs(lines: Line[]) {
  return lines.reduce<Line[][]>((groups, line) => {
    const last = groups[groups.length - 1];
    if (last && last[0]!.from === line.from) last.push(line); else groups.push([line]);
    return groups;
  }, []);
}

export default function MessageBubbleDemo() {
  const [lines, setLines] = useState(history);
  const [draft, setDraft] = useState("");
  const nextId = useRef(history.length + 1);
  const sent = useRef(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(timer => window.clearTimeout(timer)), []);
  const later = (ms: number, run: () => void) => { timers.current.push(window.setTimeout(run, ms)); };
  const patch = (id: number, change: Partial<Line>) => setLines(current => current.map(line => line.id === id ? { ...line, ...change } : line));

  function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const id = nextId.current++;
    const replyId = nextId.current++;
    const turn = sent.current++;
    const reply = replies[turn % replies.length]!;
    setDraft("");
    setLines(current => [...current.filter(line => !line.typing), { id, from: "user", text, time: clock(turn), status: "sending", fresh: true }]);
    later(600, () => patch(id, { status: "sent" }));
    later(1300, () => patch(id, { status: "delivered" }));
    later(2100, () => { patch(id, { status: "read" }); setLines(current => [...current, { id: replyId, from: "assistant", text: "", time: clock(turn), typing: true, fresh: true }]); });
    later(3900, () => patch(replyId, { typing: false, text: reply }));
  }

  return (
    <Stack width={400} gap={4}>
      <div className={styles.thread}>
        {runs(lines).map(group => (
          <MessageBubbleGroup key={group[0]!.id} from={group[0]!.from} label={group[0]!.from === "user" ? "Your messages" : "Messages from the assistant"}>
            {group.map((line, index) => {
              const last = index === group.length - 1;
              return <MessageBubble key={\`\${line.id}\${line.typing ? "-typing" : ""}\`} typing={line.typing} animateIn={!!line.fresh} timestamp={last && !line.typing ? line.time : undefined} status={last ? line.status : undefined}>{line.text}</MessageBubble>;
            })}
          </MessageBubbleGroup>
        ))}
      </div>
      <form className={styles.composer} onSubmit={send}>
        <input className={styles.field} value={draft} onChange={event => setDraft(event.target.value)} placeholder="Write a message" aria-label="Message" />
        <button type="submit" className={styles.send} aria-label="Send message" disabled={!draft.trim()}><ArrowUp width={18} height={18} strokeWidth={2.25} aria-hidden="true" /></button>
      </form>
    </Stack>
  );
}
`;export{e as default};