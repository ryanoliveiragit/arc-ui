"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Check, ClipboardList, Database, MessageSquare, Minus, ReceiptText, Split, UserSearch } from "lucide-react";
import { Button } from "@/registry/components/button/button";
import { motionTokens } from "@/lib/motion-tokens";
import { ActionLink } from "./hero-content";
import type { HeroAction } from "./hero-content";
import { HeroBackdrop, HeroMark, HeroNav } from "./hero-parts";
import { ease, heroGroup, heroRise, useHeroReducedMotion, useOnScreen } from "./hero-motion";
import shell from "./hero-section.module.css";
import styles from "./hero-relay.module.css";

type NodeId = "trigger" | "lookup" | "branch" | "notify" | "task" | "warehouse";
type Status = "idle" | "running" | "done" | "skipped";

/** Sample events from invented customers. Each one runs the same workflow; the branch decides which actions it reaches. */
const EVENTS = [
  { customer: "Brightlane", amount: "$4,800", plan: "Enterprise, 212 seats", routed: true, issue: "ONB-482", total: 412, ms: { lookup: 118, branch: 2, notify: 164, task: 231, warehouse: 58 } },
  { customer: "Kestrel Labs", amount: "$240", plan: "Team, 9 seats", routed: false, issue: "", total: 171, ms: { lookup: 96, branch: 1, notify: 0, task: 0, warehouse: 61 } },
  { customer: "Nordvik", amount: "$12,600", plan: "Enterprise, 540 seats", routed: true, issue: "ONB-483", total: 436, ms: { lookup: 131, branch: 2, notify: 149, task: 244, warehouse: 66 } },
] as const;
type RelayEvent = (typeof EVENTS)[number];

/**
 * One run in phases. Odd phases run a step, even phases carry the data along the edges out of it; the last phase holds the
 * finished run on screen before the next event arrives. Durations in milliseconds.
 */
const PHASES = [900, 420, 520, 640, 520, 360, 600, 760, 2800];
const DONE = PHASES.length - 1;
const STEPS: Record<NodeId, [start: number, end: number]> = { trigger: [1, 2], lookup: [3, 4], branch: [5, 6], notify: [7, 8], task: [7, 8], warehouse: [7, 8] };
const ACTIONS = ["notify", "task", "warehouse"] as const;

function statusOf(id: NodeId, phase: number, event: RelayEvent): Status {
  const [start, end] = STEPS[id];
  if ((id === "notify" || id === "task") && !event.routed && phase >= 6) return "skipped";
  return phase < start ? "idle" : phase < end ? "running" : "done";
}

/** The graph is drawn at a fixed size and scaled to its column, like a screenshot, so it never reflows mid run. */
type Box = { x: number; y: number; w: number; h: number };
const LAYOUTS = {
  wide: {
    width: 640, height: 440,
    nodes: { trigger: { x: 160, y: 0, w: 320, h: 62 }, lookup: { x: 160, y: 112, w: 320, h: 62 }, branch: { x: 160, y: 224, w: 320, h: 62 }, notify: { x: 0, y: 352, w: 200, h: 88 }, task: { x: 220, y: 352, w: 200, h: 88 }, warehouse: { x: 440, y: 352, w: 200, h: 88 } } as Record<NodeId, Box>,
  },
  narrow: {
    width: 344, height: 326,
    nodes: { trigger: { x: 0, y: 0, w: 344, h: 54 }, lookup: { x: 0, y: 80, w: 344, h: 54 }, branch: { x: 0, y: 160, w: 344, h: 54 }, notify: { x: 0, y: 248, w: 108, h: 78 }, task: { x: 118, y: 248, w: 108, h: 78 }, warehouse: { x: 236, y: 248, w: 108, h: 78 } } as Record<NodeId, Box>,
  },
};
type Layout = (typeof LAYOUTS)[keyof typeof LAYOUTS];

const EDGES: { from: NodeId; to: NodeId; phase: number }[] = [
  { from: "trigger", to: "lookup", phase: 2 },
  { from: "lookup", to: "branch", phase: 4 },
  { from: "branch", to: "notify", phase: 6 },
  { from: "branch", to: "task", phase: 6 },
  { from: "branch", to: "warehouse", phase: 6 },
];

function edgePath(layout: Layout, from: NodeId, to: NodeId) {
  const a = layout.nodes[from], b = layout.nodes[to];
  const x1 = a.x + a.w / 2, y1 = a.y + a.h, x2 = b.x + b.w / 2, y2 = b.y;
  const mid = (y2 - y1) / 2;
  return `M ${x1} ${y1} C ${x1} ${y1 + mid} ${x2} ${y2 - mid} ${x2} ${y2}`;
}

const RESULTS: Record<(typeof ACTIONS)[number], (event: RelayEvent) => string> = {
  notify: event => `Sent in ${event.ms.notify} ms`,
  task: event => `${event.issue} in ${event.ms.task} ms`,
  warehouse: event => `Saved in ${event.ms.warehouse} ms`,
};

const LINKS = [{ label: "Workflows" }, { label: "Integrations" }, { label: "Pricing" }, { label: "Docs" }];
const glyph = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const;

export interface HeroRelayProps {
  /** The main call to action. With `doneLabel` and no `href`, the button confirms in place. */
  primaryAction?: HeroAction;
  /** The second call to action. */
  secondaryAction?: HeroAction;
  /** Plays the entrance once on mount. Defaults to true. */
  animateIn?: boolean;
  className?: string;
}

/**
 * Workflow hero, one full screen: the copy beside a live automation graph on a dotted canvas. Sample events arrive on their own
 * and run the workflow node by node: a pulse in the accent travels along each line as the data moves, the branch decides which
 * actions run, and every step reports its time. "Send test event" runs the next sample at once. The run pauses off screen, and
 * under reduced motion each event shows its finished run without playing.
 */
export function HeroRelay({ primaryAction = { label: "Start building", doneLabel: "Workspace created" }, secondaryAction = { label: "Read the docs", doneLabel: "Opening docs" }, animateIn = true, className }: HeroRelayProps) {
  const item = heroRise;
  const reduced = useHeroReducedMotion();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<keyof typeof LAYOUTS>("wide");
  const [scale, setScale] = useState(1);
  const [run, setRun] = useState({ index: 0, count: 2418, phase: 0 });
  // The run only plays while the hero is on screen and the tab is visible.
  const visible = useOnScreen(root);

  useLayoutEffect(() => {
    const node = stage.current;
    if (!node) return;
    const measure = () => {
      const width = node.clientWidth;
      const next = width < 520 ? "narrow" : "wide";
      setMode(next);
      setScale(Math.min(1, width / LAYOUTS[next].width));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    const timer = window.setTimeout(() => setRun(current => current.phase < DONE
      ? { ...current, phase: current.phase + 1 }
      : { index: (current.index + 1) % EVENTS.length, count: current.count + 1, phase: 0 }), PHASES[run.phase]);
    return () => window.clearTimeout(timer);
  }, [run.phase, run.index, reduced, visible]);

  const sendTest = () => setRun(current => ({ index: (current.index + 1) % EVENTS.length, count: current.count + 1, phase: 1 }));

  const layout = LAYOUTS[mode];
  const event = EVENTS[run.index]!;
  // Reduced motion: every event is shown as its finished run; the button moves to the next one at once.
  const phase = reduced ? DONE : run.phase;
  const status = (id: NodeId) => statusOf(id, phase, event);
  const narrow = mode === "narrow";

  // Reduced motion: Motion skips every transform (rise, slide); opacity still fades briefly.
  return <MotionConfig reducedMotion="user"><section ref={root} className={[shell.hero, shell.screen, styles.hero, className].filter(Boolean).join(" ")}>
    <HeroNav brand="Relay" mark={<RelayMark />} links={LINKS} animateIn={animateIn} />
    <div className={styles.inner}>
      <motion.div className={styles.copy} variants={heroGroup} initial={animateIn ? "hidden" : false} animate="shown">
        <motion.p variants={item} className={styles.eyebrow}><i className={styles.live} data-on="" aria-hidden="true" />2.4 billion events handled last month</motion.p>
        <motion.h1 variants={item} className={[shell.title, styles.title].join(" ")}>From event to action <br className={styles.break} /><HeroMark animateIn={animateIn}>in milliseconds</HeroMark></motion.h1>
        <motion.p variants={item} className={[shell.description, styles.description].join(" ")}>Relay turns webhooks from your billing, CRM and database into typed workflows with retries, branches and a trace of every run. Write steps in TypeScript, or wire them on the canvas.</motion.p>
        <motion.div variants={item} className={styles.actions}>
          <ActionLink action={primaryAction} kind="primary" />
          <ActionLink action={secondaryAction} kind="secondary" />
        </motion.div>
        <motion.p variants={item} className={styles.fine}>Free for 10,000 runs a month. No card needed.</motion.p>
      </motion.div>

      <motion.div
        className={styles.panel}
        initial={animateIn ? { opacity: 0, y: 24 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .8, ease: ease.enter, delay: .18 }}
      >
        <div className={styles.toolbar}>
          <span className={styles.file}><i className={styles.live} data-on={visible || reduced || undefined} aria-hidden="true" />on-invoice-paid.ts</span>
          <Button variant="secondary" size="sm" onClick={sendTest}>Send test event</Button>
        </div>
        <div className={styles.board}>
          <HeroBackdrop className={styles.boardDots} />
          <div ref={stage} className={styles.stage} style={{ height: layout.height * scale }}>
            <div className={styles.graph} role="group" aria-label={`Relay workflow, sample run for ${event.customer}`} style={{ width: layout.width, height: layout.height, transform: `scale(${scale})` }}>
              <svg className={styles.edges} width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
                {EDGES.map(edge => {
                  const d = edgePath(layout, edge.from, edge.to);
                  const skipped = status(edge.to) === "skipped";
                  const lit = phase >= edge.phase && !skipped;
                  const travel = PHASES[edge.phase]! / 1000;
                  return <g key={`${edge.from}-${edge.to}`}>
                    <path d={d} className={styles.wire} data-skipped={skipped || undefined} />
                    <motion.path
                      d={d}
                      className={styles.flow}
                      initial={false}
                      animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
                      transition={lit && !reduced ? { pathLength: { duration: travel, ease: ease.inOut }, opacity: { duration: .08 } } : { duration: 0 }}
                    />
                    {/* The pulse: a short bright stroke that rides the line while the data moves, then runs into the next node. */}
                    {phase === edge.phase && !skipped && !reduced && <motion.path
                      key={run.count}
                      d={d}
                      className={styles.pulse}
                      initial={{ pathLength: .2, pathOffset: -.2, opacity: 1 }}
                      animate={{ pathOffset: 1 }}
                      transition={{ duration: travel, ease: ease.inOut }}
                    />}
                  </g>;
                })}
              </svg>

              <RelayNode box={layout.nodes.trigger} status={status("trigger")} tone="accent" icon={<ReceiptText {...glyph} />} title="Invoice paid" sub={`${event.customer}, ${event.amount}`} />
              <RelayNode box={layout.nodes.lookup} status={status("lookup")} icon={<UserSearch {...glyph} />} title="Find account in CRM" sub={status("lookup") === "done" ? event.plan : "Plan, seats and owner"} meta={`${event.ms.lookup} ms`} />
              <RelayNode box={layout.nodes.branch} status={status("branch")} icon={<Split {...glyph} />} title="Amount over $1,000" sub={status("branch") === "done" ? event.routed ? "Yes, alert the team" : "No, record only" : "Condition"} meta={`${event.ms.branch} ms`} />
              {ACTIONS.map(id => {
                const s = status(id);
                const copy = {
                  notify: { icon: <MessageSquare {...glyph} />, title: narrow ? "Chat" : "Post to #revenue", waiting: "Team chat" },
                  task: { icon: <ClipboardList {...glyph} />, title: narrow ? "Task" : "Open onboarding task", waiting: "Onboarding team" },
                  warehouse: { icon: <Database {...glyph} />, title: narrow ? "Warehouse" : "Save to warehouse", waiting: "Analytics database" },
                }[id];
                const sub = s === "skipped" ? "Skipped" : s === "done" ? narrow ? `${event.ms[id]} ms` : RESULTS[id](event) : s === "running" ? "Running" : narrow ? "Waiting" : copy.waiting;
                return <RelayNode key={id} box={layout.nodes[id]} compact status={s} icon={copy.icon} title={copy.title} sub={sub} />;
              })}
            </div>
          </div>
        </div>
        <div className={styles.summary}>
          <span className={styles.event}><code>invoice.paid</code><span>Run <span className={styles.num}>{run.count.toLocaleString("en-US")}</span></span></span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={phase === DONE ? `done-${run.count}` : phase === 0 ? "waiting" : "running"}
              className={styles.result}
              data-done={phase === DONE || undefined}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: motionTokens.duration.fast, ease: ease.standard }}
            >
              {phase === DONE ? <><Check size={14} strokeWidth={2} aria-hidden="true" /><span>Completed in <span className={styles.num}>{event.total} ms</span></span></> : phase === 0 ? "Waiting for the next event" : <><i className={styles.spinner} aria-hidden="true" />Running</>}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  </section></MotionConfig>;
}

/** The brand glyph: two points joined by a line. */
function RelayMark() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <circle cx="3.6" cy="11.6" r="2.4" /><circle cx="12.4" cy="4.4" r="2.4" />
    <path d="M5 10.4 11 5.6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>;
}

function RelayNode({ box, status, icon, title, sub, meta, tone, compact = false }: { box: Box; status: Status; icon: ReactNode; title: string; sub: string; meta?: string; tone?: "accent"; compact?: boolean }) {
  return <div className={styles.node} data-status={status} data-compact={compact || undefined} style={{ left: box.x, top: box.y, width: box.w, height: box.h }}>
    <span className={styles.icon} data-tone={tone}>{icon}</span>
    <span className={styles.text}>
      <strong>{title}</strong>
      <small>{sub}</small>
    </span>
    <span className={styles.state}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          className={styles.stateInner}
          initial={{ opacity: 0, scale: .6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: .6 }}
          transition={motionTokens.spring.snappy}
        >
          {status === "running" ? <i className={styles.spinner} role="img" aria-label="Running" />
            : status === "done" ? <>{meta && <span className={styles.meta}>{meta}</span>}<Check size={14} strokeWidth={2} className={styles.check} role="img" aria-label="Done" /></>
            : status === "skipped" ? <Minus size={14} strokeWidth={2} className={styles.skip} role="img" aria-label="Skipped" />
            : <i className={styles.pending} role="img" aria-label="Waiting" />}
        </motion.span>
      </AnimatePresence>
    </span>
  </div>;
}

export { HeroRelay as HeroWorkflow };
export type { HeroRelayProps as HeroWorkflowProps };
export default HeroRelay;
