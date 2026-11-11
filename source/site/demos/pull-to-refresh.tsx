import { useRef, useState } from "react";
import { motion } from "motion/react";
import { PullToRefresh } from "@/registry/components/pull-to-refresh/pull-to-refresh";
import { avatar } from "@/lib/media";
import type { PersonId } from "@/lib/media";
import { motionTokens } from "@/lib/motion-tokens";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./pull-to-refresh.module.css";

export const stage: DemoStage = { height: 580 };

interface Mail { id: string; who: PersonId; from: string; subject: string; time: string; fresh?: boolean; }

const inbox: Mail[] = [
  { id: "m1", who: "jasmine-brooks", from: "Jasmine Brooks", subject: "Design review moved to Thursday", time: "9:41" },
  { id: "m2", who: "daniel-kim", from: "Daniel Kim", subject: "Staging is back up, sorry for the noise", time: "9:12" },
  { id: "m3", who: "sofia-ramirez", from: "Sofia Ramirez", subject: "Vendor contract: two small changes", time: "8:57" },
  { id: "m4", who: "marcus-johnson", from: "Marcus Johnson", subject: "Can you look at the checkout PR?", time: "8:30" },
  { id: "m5", who: "hannah-walsh", from: "Hannah Walsh", subject: "Onboarding call notes", time: "Yesterday" },
  { id: "m6", who: "andre-williams", from: "Andre Williams", subject: "October invoices are ready", time: "Yesterday" },
  { id: "m7", who: "chloe-nguyen", from: "Chloe Nguyen", subject: "Dashboard numbers for the board deck", time: "Monday" },
];
const incoming: Omit<Mail, "id" | "time">[] = [
  { who: "emma-collins", from: "Emma Collins", subject: "New icons are in the shared library" },
  { who: "nathan-cole", from: "Nathan Cole", subject: "Headcount plan needs your sign-off" },
  { who: "ava-mitchell", from: "Ava Mitchell", subject: "Launch post draft, comments welcome" },
  { who: "tyler-hayes", from: "Tyler Hayes", subject: "Northwind wants a second demo" },
];

export default function PullToRefreshDemo() {
  const [mail, setMail] = useState(inbox);
  const [refreshes, setRefreshes] = useState(0);
  const count = useRef(0);

  // Stands in for a network request: a moment later, one new message arrives.
  const refresh = () => new Promise<void>(resolve => {
    window.setTimeout(() => {
      const next = incoming[count.current % incoming.length]!;
      count.current += 1;
      setMail(current => [{ ...next, id: `new-${count.current}`, time: "Now", fresh: true }, ...current.map(item => ({ ...item, fresh: false }))]);
      setRefreshes(count.current);
      resolve();
    }, 1400);
  });

  return (
    <Stack gap={3} align="center" width={340}>
      <div className={styles.phone}>
        <header className={styles.bar}>
          <h2 className={styles.barTitle}>Inbox</h2>
          <span className={styles.barMeta}>{refreshes ? `${refreshes} new since you opened it` : "Up to date"}</span>
        </header>
        <PullToRefresh onRefresh={refresh} label="Inbox messages" refreshLabel="Check for new mail">
          <ul className={styles.list}>
            {mail.map(item => (
              <motion.li key={item.id} className={styles.item} layout="position" initial={item.fresh ? { opacity: 0, y: -16 } : false} animate={{ opacity: 1, y: 0 }} transition={motionTokens.spring.smooth}>
                <img className={styles.avatar} src={avatar(item.who)} alt="" />
                <span className={styles.copy}>
                  <span className={styles.from}>{item.from}{item.fresh ? <span className={styles.fresh} aria-label="New" /> : null}</span>
                  <span className={styles.subject}>{item.subject}</span>
                </span>
                <span className={styles.time}>{item.time}</span>
              </motion.li>
            ))}
          </ul>
        </PullToRefresh>
      </div>
      <Caption>Drag the list down with the mouse or a finger and let go. With the keyboard, Tab to “Check for new mail”.</Caption>
    </Stack>
  );
}
