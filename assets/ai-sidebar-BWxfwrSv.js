var e=`import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { AiSidebar } from "@/registry/components/ai-sidebar/ai-sidebar";
import type { AiSidebarMessage } from "@/registry/components/ai-sidebar/ai-sidebar";
import { StreamingResponse } from "@/registry/components/streaming-response/streaming-response";
import { Button } from "@/registry/components/button/button";
import type { DemoStage } from "./_kit";
import styles from "./ai-sidebar.module.css";

export const stage: DemoStage = { layout: "fill", height: 600 };

const suggestions = ["Summarize this plan", "What are the risks?", "Draft the kickoff email"];

const replies: Record<string, string> = {
  "Summarize this plan": "The plan ships usage-based billing in three phases over eight weeks: metering in weeks 1 to 3, the new invoices in weeks 4 to 6, and a gradual rollout in weeks 7 and 8.\\n\\nSuccess means fewer than 2% of invoices needing a manual correction in the first month.",
  "What are the risks?": "Two stand out. Metering depends on the events pipeline, which dropped data twice last quarter, so the plan needs a reconciliation job before invoices go out.\\n\\nThe second is support load: customers moving from seats to usage will ask about their first bill, and the help articles are not scheduled until week 7.",
  "Draft the kickoff email": "Subject: Usage-based billing kicks off Monday\\n\\nHi team, we start the eight week build on Monday. Daniel owns metering, Olivia owns invoices and Sofia runs the rollout. The first checkpoint is the metering demo on Friday of week 3. Reply here with anything that could block your part.",
};
const fallback = "I can only see this page. From what is written here, the closest answer is in the timeline section: the rollout starts in week 7 with ten percent of accounts and widens once the invoice error rate stays under the target.";

export default function AiSidebarDemo() {
  const [open, setOpen] = useState(() => (typeof window === "undefined" ? true : window.matchMedia("(min-width: 900px)").matches));
  const [messages, setMessages] = useState<AiSidebarMessage[]>([]);
  const [pending, setPending] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const count = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = (text: string) => {
    const id = ++count.current;
    setMessages(current => [...current, { id: \`user-\${id}\`, role: "user", content: text }]);
    setPending(true);
    timer.current = window.setTimeout(() => {
      setPending(false);
      setMessages(current => [...current, { id: \`assistant-\${id}\`, role: "assistant", content: <StreamingResponse className={styles.reply} text={replies[text] ?? fallback} speed={22} controls={false} /> }]);
    }, 1100);
  };

  return (
    <div className={styles.frame}>
      <AiSidebar open={open} onOpenChange={setOpen} messages={messages} pending={pending} suggestions={suggestions} onSend={send} title="Assistant" subtitle="Reading: Usage-based billing plan" launcher={false}>
        <article className={styles.page}>
          <div className={styles.bar}>
            <span className={styles.crumb}>Projects / Billing</span>
            <Button size="sm" variant={open ? "secondary" : "primary"} onClick={() => setOpen(current => !current)} aria-expanded={open}>
              <Sparkles size={14} aria-hidden="true" />
              {open ? "Hide assistant" : "Ask assistant"}
            </Button>
          </div>
          <h1 className={styles.title}>Usage-based billing plan</h1>
          <p className={styles.lead}>Move every paid workspace from seat pricing to metered usage in eight weeks, without a surprise on anyone's first invoice.</p>
          <h2 className={styles.section}>Timeline</h2>
          <ul className={styles.timeline}>
            <li><span>Weeks 1 to 3</span>Metering: count events per workspace and store daily totals.</li>
            <li><span>Weeks 4 to 6</span>Invoices: new line items, proration and a preview page.</li>
            <li><span>Weeks 7 to 8</span>Rollout: ten percent of accounts first, then everyone.</li>
          </ul>
          <h2 className={styles.section}>Success measure</h2>
          <p className={styles.body}>Fewer than 2% of invoices need a manual correction during the first month after rollout.</p>
        </article>
      </AiSidebar>
    </div>
  );
}
`;export{e as default};