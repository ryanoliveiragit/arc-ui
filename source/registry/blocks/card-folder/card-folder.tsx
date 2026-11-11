"use client";

import { useId, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, FileSpreadsheet, FileText, Image as ImageIcon, LayoutDashboard, ListChecks, Paperclip, Users } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import { people } from "@/lib/media";
import styles from "./card-folder.module.css";

export interface FolderCard {
  /** Unique id, used as the value. */
  id: string;
  /** Text on the card's tab. */
  label: string;
  /** Small icon before the label. */
  icon?: ReactNode;
  /** What the card shows when it is in front. */
  content: ReactNode;
}

export interface CardFolderProps {
  /** The cards, in tab order. Defaults to a sample project folder. */
  cards?: FolderCard[];
  /** Id of the card in front. Pass it with `onValueChange` to control it. */
  value?: string;
  /** Id of the card that starts in front when uncontrolled. Defaults to the first card. */
  defaultValue?: string;
  /** Called with the id of the card whose tab was picked. */
  onValueChange?: (id: string) => void;
  /** Height of a card body in px. Every card shares it, so the folder never changes size. */
  height?: number;
  /** Accessible name of the tab list. */
  label?: string;
  /** Extra class for the folder. */
  className?: string;
}

/** How far each card behind the front one rises and shrinks. */
const STEP = 12;
const SHRINK = 0.035;
/** How far a picked card is pulled up before it drops in front. */
const LIFT = 58;

/** A folder of index cards: picking a tab pulls that card up out of the pile and drops it in front, while the others settle behind it. */
export function CardFolder({ cards = sampleCards, value, defaultValue, onValueChange, height = 296, label = "Project folder", className }: CardFolderProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const [internal, setInternal] = useState(defaultValue ?? cards[0]?.id ?? "");
  const front = value ?? internal;
  // Pile order, front first. The front card comes from `value`; the rest keep the order in which they were last used.
  const [history, setHistory] = useState<string[]>(() => cards.map(card => card.id));
  const [lifting, setLifting] = useState<string | null>(null);
  const tabs = useRef(new Map<string, HTMLButtonElement>());
  // While a card is being pulled up, the pile still shows the old order; it changes when the card lands.
  const landed = lifting ? history : [front, ...history.filter(id => id !== front)];
  const order = [...landed.filter(id => cards.some(card => card.id === id)), ...cards.map(card => card.id).filter(id => !landed.includes(id))];

  const select = (id: string) => {
    if (id === front) return;
    setHistory(order);
    if (!reduceMotion) setLifting(id);
    if (value === undefined) setInternal(id);
    onValueChange?.(id);
  };
  const land = (id: string) => { if (lifting === id) setLifting(null); };

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const last = cards.length - 1;
    const next = event.key === "ArrowRight" ? (index === last ? 0 : index + 1) : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1) : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
    const target = cards[next];
    if (!target) return;
    event.preventDefault();
    tabs.current.get(target.id)?.focus();
    select(target.id);
  };

  return (
    <div className={[styles.folder, className].filter(Boolean).join(" ")} style={{ "--count": cards.length, "--body": `${height}px`, "--rise": `${(cards.length - 1) * STEP}px` } as CSSProperties}>
      <div role="tablist" aria-label={label} aria-owns={cards.map(card => `${uid}-tab-${card.id}`).join(" ")} />
      <div className={styles.pile}>
        {cards.map((card, index) => {
          const depth = Math.max(0, order.indexOf(card.id));
          const isFront = card.id === front;
          const rising = lifting === card.id;
          const rest = { y: -depth * STEP, scale: 1 - depth * SHRINK };
          // The card leaving the front keeps its content until the picked one has landed on top of it.
          const shown = lifting ? depth === 0 || rising : isFront;
          return (
            <motion.div
              key={card.id}
              className={styles.card}
              data-front={isFront}
              data-shown={shown}
              data-depth={depth}
              style={{ zIndex: cards.length - depth, "--index": index, "--depth": depth } as CSSProperties}
              initial={reduceMotion ? false : { opacity: 0, y: 36, scale: rest.scale }}
              animate={rising ? { opacity: 1, y: rest.y - LIFT, scale: rest.scale + 0.02 } : { opacity: 1, ...rest }}
              transition={reduceMotion ? { duration: 0 } : rising ? { duration: 0.17, ease: motionTokens.ease.standard } : { type: "spring", visualDuration: 0.4, bounce: isFront ? 0.22 : 0, delay: lifting ? 0 : undefined }}
              onAnimationComplete={() => land(card.id)}
            >
              <button
                ref={node => { if (node) tabs.current.set(card.id, node); else tabs.current.delete(card.id); }}
                type="button"
                role="tab"
                id={`${uid}-tab-${card.id}`}
                className={styles.tab}
                aria-selected={isFront}
                aria-controls={`${uid}-panel-${card.id}`}
                tabIndex={isFront ? 0 : -1}
                onClick={() => select(card.id)}
                onKeyDown={event => onKeyDown(event, index)}
              >
                <span className={styles.marker} aria-hidden="true" />
                {card.icon ? <span className={styles.tabIcon} aria-hidden="true">{card.icon}</span> : null}
                <span className={styles.tabLabel}>{card.label}</span>
              </button>
              <div role="tabpanel" id={`${uid}-panel-${card.id}`} aria-labelledby={`${uid}-tab-${card.id}`} className={styles.body} inert={!isFront} aria-hidden={!isFront}>
                <div className={styles.content}>{card.content}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const TASKS = [
  { text: "Lock the launch date with marketing", done: true },
  { text: "Record the product walkthrough", done: true },
  { text: "Write the migration guide", done: false },
  { text: "Send the beta invite to 40 teams", done: false },
];
const FILES = [
  { icon: <FileText size={15} />, name: "Launch brief.md", size: "18 KB" },
  { icon: <FileSpreadsheet size={15} />, name: "Pricing model.xlsx", size: "240 KB" },
  { icon: <ImageIcon size={15} />, name: "Hero shots.zip", size: "36 MB" },
  { icon: <Paperclip size={15} />, name: "Press kit.pdf", size: "4.2 MB" },
];

const sampleCards: FolderCard[] = [
  {
    id: "overview", label: "Overview", icon: <LayoutDashboard size={14} />,
    content: (
      <>
        <p className={styles.kicker}>Atlas 2.0 launch</p>
        <p className={styles.lead}>Two of four milestones are done and the beta opens on March 12.</p>
        <div className={styles.meter} role="img" aria-label="Progress: 62 percent"><span style={{ width: "62%" }} /></div>
        <dl className={styles.stats}>
          <div><dt>Progress</dt><dd>62%</dd></div>
          <div><dt>Open tasks</dt><dd>9</dd></div>
          <div><dt>Days left</dt><dd>21</dd></div>
        </dl>
      </>
    ),
  },
  {
    id: "tasks", label: "Tasks", icon: <ListChecks size={14} />,
    content: (
      <>
        <p className={styles.kicker}>This week</p>
        <ul className={styles.rows}>
          {TASKS.map(task => (
            <li key={task.text} data-done={task.done}><span className={styles.box} aria-hidden="true">{task.done ? <Check size={12} strokeWidth={3} /> : null}</span><span>{task.text}</span><span className={styles.srOnly}>{task.done ? "(done)" : "(open)"}</span></li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "files", label: "Files", icon: <Paperclip size={14} />,
    content: (
      <>
        <p className={styles.kicker}>Recently added</p>
        <ul className={styles.rows}>
          {FILES.map(file => <li key={file.name}><span className={styles.fileIcon} aria-hidden="true">{file.icon}</span><span>{file.name}</span><span className={styles.aside}>{file.size}</span></li>)}
        </ul>
      </>
    ),
  },
  {
    id: "team", label: "Team", icon: <Users size={14} />,
    content: (
      <>
        <p className={styles.kicker}>Working on it</p>
        <ul className={styles.rows}>
          {people.slice(0, 4).map(member => <li key={member.id}><img className={styles.face} src={member.src} alt="" /><span>{member.name}</span><span className={styles.aside}>{member.role}</span></li>)}
        </ul>
      </>
    ),
  },
];

/** Ready preview: the sample project folder on a quiet stage. */
export function CardFolderPreview() {
  return (
    <section className={styles.preview} aria-label="Card folder">
      <CardFolder />
    </section>
  );
}

export default CardFolderPreview;
