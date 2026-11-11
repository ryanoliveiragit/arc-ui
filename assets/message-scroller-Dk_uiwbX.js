var e=`import { useEffect, useState } from "react";
import MessageScroller from "@/registry/components/message-scroller/message-scroller";
import { MessageBubble } from "@/registry/components/message-bubble/message-bubble";
import type { MessageBubbleFrom, MessageBubblePosition } from "@/registry/components/message-bubble/message-bubble";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./message-scroller.module.css";

export const stage: DemoStage = { height: 560 };

const script: { from: MessageBubbleFrom; text: string }[] = [
  { from: "user", text: "How is the migration going?" },
  { from: "assistant", text: "Copying the orders table now. 38% done." },
  { from: "assistant", text: "No write errors so far." },
  { from: "user", text: "Great. Ping me when the indexes are rebuilt." },
  { from: "assistant", text: "Orders table copied: 2.4 million rows in 41 s." },
  { from: "assistant", text: "Rebuilding indexes on customers and invoices." },
  { from: "user", text: "Any slow queries showing up?" },
  { from: "assistant", text: "One: the weekly revenue report took 3.2 s. I added it to the follow-up list." },
  { from: "assistant", text: "Indexes rebuilt. Running the row count check." },
  { from: "user", text: "Perfect, thanks." },
  { from: "assistant", text: "Row counts match on all 14 tables. The migration is complete." },
];
const START = 7;
/** Keeps the demo light however long it runs. */
const LIMIT = 80;

export default function MessageScrollerDemo() {
  const [count, setCount] = useState(START);
  const [live, setLive] = useState(true);
  const [following, setFollowing] = useState(true);

  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => setCount(current => current + 1), 1700);
    return () => window.clearInterval(timer);
  }, [live]);

  const first = Math.max(0, count - LIMIT);
  const lines = Array.from({ length: count - first }, (_, offset) => ({ id: first + offset, ...script[(first + offset) % script.length]! }));

  return (
    <Stack width={420} gap={4}>
      <MessageScroller className={styles.panel} label="Migration thread" onAtBottomChange={setFollowing}>
        {lines.map((line, index) => {
          const before = lines[index - 1]?.from === line.from, after = lines[index + 1]?.from === line.from;
          const position: MessageBubblePosition = before && after ? "middle" : before ? "last" : after ? "first" : "single";
          return <div key={line.id} className={before ? undefined : styles.turn}><MessageBubble from={line.from} position={position} animateIn={false}>{line.text}</MessageBubble></div>;
        })}
      </MessageScroller>
      <Row justify="space-between">
        <Row gap={2}>
          <Button size="sm" variant="secondary" onClick={() => setLive(current => !current)}>{live ? "Pause messages" : "Resume messages"}</Button>
          <Button size="sm" variant="ghost" onClick={() => setCount(current => current + 1)}>Add one</Button>
        </Row>
        <Caption>{following ? "Following the latest" : "Released: reading history"}</Caption>
      </Row>
      <Caption>Scroll up inside the thread. It stops following, and the pill counts what arrives until you jump back.</Caption>
    </Stack>
  );
}
`;export{e as default};