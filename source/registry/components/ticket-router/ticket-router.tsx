"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Bug,
  CreditCard,
  Frown,
  HelpCircle,
  Lightbulb,
  LoaderCircle,
  Meh,
  Pause,
  Play,
  ReceiptText,
  RefreshCw,
  Smile,
} from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./ticket-router.module.css";

/* ---------- tipos ---------- */

export type TicketChannel = "email" | "intercom" | "slack" | "zendesk";

export interface TicketMessage {
  id: string;
  channel: TicketChannel;
  customer: string;
  company?: string;
  subject: string;
  preview: string;
  receivedAt?: string;
}

export interface TicketLaneDef {
  id: string;
  label: string;
  /** Nomes completos para round robin; apenas o primeiro nome é exibido nas linhas. */
  assignees: string[];
  /** Lane que guarda tickets de baixa confiança. */
  review?: boolean;
}

export interface TicketClassification {
  intent: string;
  sentiment: string;
  /** 0..1 */
  confidence: number;
}

export interface RoutedTicket {
  ticket: TicketMessage;
  classification: TicketClassification;
  laneId: string;
  assignee?: string;
  suggestedLaneId?: string;
}

interface SimResult extends TicketClassification {
  lane: string;
}

/* ---------- dados de amostra (mesma ordem do fluxo simulado) ---------- */

const SAMPLE_TICKETS: TicketMessage[] = [
  {
    id: "t1",
    channel: "zendesk",
    customer: "Lukas Meyer",
    company: "Fernhill",
    subject: "CSV export fails above 10,000 rows",
    preview: "Exporting the Q3 deals view returns a 504 after about 30 seconds. Smaller views export fine. It started after Tuesday's release.",
    receivedAt: "9:42",
  },
  {
    id: "t2",
    channel: "zendesk",
    customer: "Tomás Oliveira",
    company: "Brightline",
    subject: "Question about our seats and invoicing",
    preview: "We renewed for six seats but the invoice lists seven. Can someone confirm what we were charged for?",
    receivedAt: "9:51",
  },
  {
    id: "t3",
    channel: "intercom",
    customer: "Amélie Farkas",
    company: "Northwind Labs",
    subject: "Webhooks retry in a tight loop",
    preview: "Every failed webhook fires again within seconds. Our endpoint got hit 400 times in ten minutes yesterday.",
    receivedAt: "9:58",
  },
  {
    id: "t4",
    channel: "email",
    customer: "Sofia Marques",
    company: "Kite & Co",
    subject: "Prorated credit missing after downgrade",
    preview: "We downgraded on the 3rd and the credit never showed up. The next invoice still charges the full plan.",
    receivedAt: "10:04",
  },
  {
    id: "t5",
    channel: "slack",
    customer: "Jonas Weber",
    company: "Helix Health",
    subject: "Audit log export to S3 would be great",
    preview: "Our compliance team pulls audit logs by hand every month. A scheduled S3 export would remove that chore.",
    receivedAt: "10:12",
  },
];

const SIM_RESULTS: Record<string, SimResult> = {
  t1: { intent: "Bug", sentiment: "Frustrated", confidence: 0.94, lane: "engineering" },
  t2: { intent: "Question", sentiment: "Neutral", confidence: 0.48, lane: "success" },
  t3: { intent: "Bug", sentiment: "Frustrated", confidence: 0.91, lane: "engineering" },
  t4: { intent: "Billing", sentiment: "Neutral", confidence: 0.97, lane: "billing" },
  t5: { intent: "Feature", sentiment: "Happy", confidence: 0.9, lane: "success" },
};

const DEFAULT_LANES: TicketLaneDef[] = [
  { id: "billing", label: "Billing", assignees: ["Andre Williams", "Sofia Duarte"] },
  { id: "engineering", label: "Engineering", assignees: ["Daniel Kim", "Olivia Chen"] },
  { id: "success", label: "Success", assignees: ["Jordan Reyes"] },
  { id: "review", label: "Needs review", assignees: [], review: true },
];

function seedRows(): Record<string, RoutedTicket[]> {
  return {
    billing: [
      { ticket: { id: "b1", channel: "email", customer: "Nora Haddad", company: "Meridian", subject: "Charged twice on the March invoice", preview: "" }, classification: { intent: "Billing", sentiment: "Frustrated", confidence: 0.97 }, laneId: "billing", assignee: "Andre Williams" },
      { ticket: { id: "b2", channel: "email", customer: "Piotr Nowak", company: "Stellar Works", subject: "Receipt is missing our VAT number", preview: "" }, classification: { intent: "Billing", sentiment: "Neutral", confidence: 0.92 }, laneId: "billing", assignee: "Andre Williams" },
      { ticket: { id: "b3", channel: "zendesk", customer: "Leila Farouk", company: "Orbit Freight", subject: "Update the card on file before renewal", preview: "" }, classification: { intent: "Account", sentiment: "Neutral", confidence: 0.96 }, laneId: "billing", assignee: "Sofia Duarte" },
    ],
    engineering: [
      { ticket: { id: "e1", channel: "intercom", customer: "Marco Bellini", company: "Copperline", subject: "API returns 429 above five requests per minute", preview: "" }, classification: { intent: "Bug", sentiment: "Frustrated", confidence: 0.93 }, laneId: "engineering", assignee: "Daniel Kim" },
      { ticket: { id: "e2", channel: "slack", customer: "Hana Suzuki", company: "Bright Loop", subject: "SAML login loop since Monday", preview: "" }, classification: { intent: "Bug", sentiment: "Frustrated", confidence: 0.95 }, laneId: "engineering", assignee: "Olivia Chen" },
    ],
    success: [
      { ticket: { id: "s1", channel: "zendesk", customer: "Maya Lindqvist", company: "Harborlight", subject: "Dark mode for the admin dashboard", preview: "" }, classification: { intent: "Feature", sentiment: "Happy", confidence: 0.9 }, laneId: "success", assignee: "Jordan Reyes" },
    ],
    review: [
      { ticket: { id: "r1", channel: "email", customer: "Iris Kaplan", company: "Fieldnote", subject: "Question about our seats and invoicing", preview: "" }, classification: { intent: "Question", sentiment: "Neutral", confidence: 0.48 }, laneId: "review", suggestedLaneId: "success" },
    ],
  };
}

const SEED_COUNTS: Record<string, number> = { billing: 15, engineering: 9, success: 6, review: 1 };

/* ---------- marcas e ícones ---------- */

function ClaudeMark({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g fill="#D97757">
        {[0, 45, 90, 135].map(angle => (
          <rect key={`long-${angle}`} x="10.9" y="1.5" width="2.2" height="10" rx="1.1" transform={`rotate(${angle} 12 12)`} />
        ))}
        {[45, 135, 225, 315].map(angle => (
          <rect key={`short-${angle}`} x="11" y="4.4" width="2" height="7.2" rx="1" transform={`rotate(${angle} 12 12)`} />
        ))}
      </g>
    </svg>
  );
}

function GmailTile({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="0.5" y="2.5" width="23" height="19" rx="4.5" fill="#fff" stroke="rgba(0,0,0,.14)" strokeWidth="1" />
      <path d="M5.2 17.5v-8l4.4 4 3.4-3.4 3.4 3.4 4.4-4v8z" fill="#EA4335" />
    </svg>
  );
}

function GmailGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.8 18.5V6.8h4.6l4.6 4.2 4.6-4.2h4.6v11.7h-4.2v-6.2L12 16.4 6.9 12.3v6.2z" fill="#EA4335" />
    </svg>
  );
}

function IntercomMark({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
        <path d="M6 5.6 17.6 18.4" />
        <path d="M17.6 5.6 6 18.4" />
      </g>
    </svg>
  );
}

function SlackMark({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="10.9" y="1.5" width="4.2" height="8.4" rx="2.1" fill="#36C5F0" />
      <circle cx="16.6" cy="16.6" r="2.1" fill="#36C5F0" />
      <rect x="14.1" y="10.9" width="8.4" height="4.2" rx="2.1" fill="#2EB67D" />
      <circle cx="7.4" cy="7.4" r="2.1" fill="#2EB67D" />
      <rect x="10.9" y="14.1" width="4.2" height="8.4" rx="2.1" fill="#ECB22E" />
      <circle cx="16.6" cy="7.4" r="2.1" fill="#ECB22E" />
      <rect x="1.5" y="10.9" width="8.4" height="4.2" rx="2.1" fill="#E01E5A" />
      <circle cx="7.4" cy="16.6" r="2.1" fill="#E01E5A" />
    </svg>
  );
}

function ZendeskMark({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#fff" stroke="rgba(0,0,0,.14)" strokeWidth="1" />
      <g fill="#17181c">
        <rect x="5.2" y="8.6" width="2.1" height="6.8" rx="1" />
        <rect x="8.4" y="6.8" width="2.1" height="10.4" rx="1" />
        <rect x="11.6" y="5.6" width="2.1" height="12.8" rx="1" />
        <rect x="14.8" y="6.8" width="2.1" height="10.4" rx="1" />
        <rect x="18" y="8.6" width="2.1" height="6.8" rx="1" />
      </g>
    </svg>
  );
}

function ChannelIcon({ channel, boxed = false, size = 15 }: { channel: TicketChannel; boxed?: boolean; size?: number }) {
  if (channel === "email") return boxed ? <GmailTile size={size + 3} /> : <GmailGlyph size={size} />;
  if (channel === "intercom") return <span className={styles.monoIco} style={{ width: size, height: size }}><IntercomMark size={size} /></span>;
  if (channel === "slack") return <SlackMark size={size} />;
  return <ZendeskMark size={size} />;
}

const AVATAR_GRADIENTS: Record<string, string> = {
  "Andre Williams": "linear-gradient(135deg, #f59e0b, #0d9488)",
  "Sofia Duarte": "linear-gradient(135deg, #fbbf24, #0ea5e9)",
  "Daniel Kim": "linear-gradient(135deg, #2dd4bf, #ec4899)",
  "Olivia Chen": "linear-gradient(135deg, #a78bfa, #6366f1)",
  "Jordan Reyes": "linear-gradient(135deg, #f472b6, #a21caf)",
};

function firstName(name: string) {
  return name.split(" ")[0] ?? name;
}

function Avatar({ name, size = 16 }: { name: string; size?: number }) {
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.52), background: AVATAR_GRADIENTS[name] ?? "var(--surface-muted)" }}
      aria-hidden="true"
    >
      {(name.charAt(0) || "?").toUpperCase()}
    </span>
  );
}

function IntentIcon({ intent }: { intent: string }) {
  switch (intent.toLowerCase()) {
    case "bug": return <Bug size={14} aria-hidden="true" />;
    case "billing": return <ReceiptText size={14} aria-hidden="true" />;
    case "account": return <CreditCard size={14} aria-hidden="true" />;
    case "feature": return <Lightbulb size={14} aria-hidden="true" />;
    default: return <HelpCircle size={14} aria-hidden="true" />;
  }
}

function SentimentIcon({ sentiment }: { sentiment: string }) {
  switch (sentiment.toLowerCase()) {
    case "frustrated": return <Frown size={14} aria-hidden="true" className={styles.sentWarn} />;
    case "happy": return <Smile size={14} aria-hidden="true" className={styles.sentOk} />;
    default: return <Meh size={14} aria-hidden="true" className={styles.sentMuted} />;
  }
}

/* ---------- hooks locais ---------- */

function useOnScreen<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => setOnScreen(entry.isIntersecting)), { threshold: .25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, onScreen };
}

/* ---------- componente ---------- */

type Stage = "classify" | "revealed" | "land";

export interface TicketRouterProps {
  tickets?: TicketMessage[];
  lanes?: TicketLaneDef[];
  initialRouted?: Record<string, RoutedTicket[]>;
  classify?: (ticket: TicketMessage, ctx: { signal: AbortSignal }) => Promise<TicketClassification>;
  route?: (ticket: TicketMessage, classification: TicketClassification) => string;
  reviewThreshold?: number;
  /** Reinicia a fila quando esvazia; padrão true com a amostra embutida. */
  loop?: boolean;
  paused?: boolean;
  defaultPaused?: boolean;
  onPausedChange?: (paused: boolean) => void;
  onRoute?: (ticket: RoutedTicket) => void;
  onReview?: (ticket: RoutedTicket, lane: string) => void;
  onError?: (ticket: TicketMessage, error: unknown) => void;
  maxVisible?: number;
  speed?: number;
  title?: string;
  model?: string;
  modelMark?: React.ReactNode;
  className?: string;
}

function defaultRoute(ticket: TicketMessage, c: TicketClassification) {
  const i = c.intent.toLowerCase();
  if (i.includes("billing") || i.includes("refund")) return "billing";
  if (i.includes("bug")) return "engineering";
  if (i.includes("feature")) return "success";
  void ticket;
  return "success";
}

export function TicketRouter({
  tickets,
  lanes = DEFAULT_LANES,
  initialRouted,
  classify,
  route = defaultRoute,
  reviewThreshold = 0.7,
  loop,
  paused: pausedProp,
  defaultPaused = false,
  onPausedChange,
  onRoute,
  onReview,
  onError,
  maxVisible = 3,
  speed = 1,
  title = "Ticket routing",
  model = "Claude Haiku 5.5",
  modelMark = <ClaudeMark />,
  className,
}: TicketRouterProps) {
  const isSample = tickets === undefined;
  const queue = useMemo(() => tickets ?? SAMPLE_TICKETS, [tickets]);
  const reviewLaneId = useMemo(() => lanes.find(l => l.review)?.id ?? lanes[lanes.length - 1]?.id ?? "review", [lanes]);
  const firstNonReview = useMemo(() => lanes.find(l => !l.review)?.id ?? lanes[0]?.id ?? "billing", [lanes]);
  const resolveReviewLaneId = useCallback((id: string | undefined) => (id && lanes.some(l => l.id === id && !l.review) ? id : firstNonReview), [lanes, firstNonReview]);

  const reduce = useReducedMotion() ?? false;
  const wantsAuto = isSample;
  const [internalPaused, setInternalPaused] = useState(defaultPaused);
  const paused = pausedProp ?? internalPaused;
  const [interacted, setInteracted] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  // Com "reduzir movimento" não há classificação animada: o estado inicial já é o classificado.
  const [stage, setStage] = useState<Stage>(reduce ? "revealed" : "classify");
  const [cls, setCls] = useState<TicketClassification | null>(isSample ? SIM_RESULTS.t1 ?? null : null);
  const [error, setError] = useState<{ message: string; attempt: number } | null>(null);
  const [laneRows, setLaneRows] = useState<Record<string, RoutedTicket[]>>(() => initialRouted ?? seedRows());
  const [counts, setCounts] = useState<Record<string, number>>(() => ({ ...SEED_COUNTS }));
  const [routedToday, setRoutedToday] = useState(31);
  const [flashLane, setFlashLane] = useState<string | null>(null);
  const [caughtUp, setCaughtUp] = useState(false);
  const [announce, setAnnounce] = useState("");

  const rr = useRef<Record<string, number>>({});
  const abortRef = useRef<AbortController | null>(null);
  const clsRef = useRef(cls);
  clsRef.current = cls;

  const { ref: screenRef, onScreen } = useOnScreen<HTMLDivElement>();

  const laneLabel = useCallback((id: string) => lanes.find(l => l.id === id)?.label ?? id, [lanes]);

  const markInteracted = useCallback(() => {
    setInteracted(prev => {
      if (prev) return prev;
      return true;
    });
  }, []);

  const onCardPointer = useCallback((event: React.PointerEvent) => {
    // O botão Pause não conta como interação: pausar e retomar mantém o loop vivo.
    if ((event.target as HTMLElement).closest(`.${styles.ghostPill}`)) return;
    event.stopPropagation();
    markInteracted();
  }, [markInteracted]);
  const onCardKey = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Tab") return;
    // Ativação de botão pelo teclado não interrompe o loop; o clique faz.
    if ((event.target as HTMLElement).closest("button")) return;
    markInteracted();
  }, [markInteracted]);

  /* --- classificação --- */

  const runClassify = useCallback(async () => {
    const ticket = queue[activeIdx];
    if (!ticket) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setError(null);
    try {
      let result: TicketClassification;
      if (classify) {
        result = await classify(ticket, { signal: ctrl.signal });
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        const sim = SIM_RESULTS[ticket.id];
        if (ctrl.signal.aborted) return;
        result = sim ? { intent: sim.intent, sentiment: sim.sentiment, confidence: sim.confidence } : { intent: "Question", sentiment: "Neutral", confidence: 0.6 };
      }
      if (ctrl.signal.aborted) return;
      setCls(result);
      setStage("revealed");
    } catch (err) {
      if (ctrl.signal.aborted) return;
      const message = err instanceof Error ? err.message : "Classifier unavailable";
      setError({ message, attempt: (error?.attempt ?? 0) + 1 });
      onError?.(ticket, err);
    }
  }, [activeIdx, classify, error?.attempt, onError, queue]);

  /* --- aterrissagem --- */

  const land = useCallback(() => {
    const ticket = queue[activeIdx];
    const c = clsRef.current;
    if (!ticket || !c) return;
    const picked = resolveReviewLaneId(route(ticket, c));
    const toReview = c.confidence < reviewThreshold;
    const laneId = toReview ? reviewLaneId : picked;
    const laneDef = lanes.find(l => l.id === laneId);
    const pool = laneDef?.assignees ?? [];
    let assignee: string | undefined;
    if (pool.length > 0) {
      const idx = (rr.current[laneId] ?? 0) % pool.length;
      rr.current[laneId] = (rr.current[laneId] ?? 0) + 1;
      assignee = pool[idx];
    }
    const row: RoutedTicket = { ticket, classification: c, laneId, assignee, suggestedLaneId: toReview ? picked : undefined };
    setLaneRows(prev => ({ ...prev, [laneId]: [row, ...(prev[laneId] ?? [])].slice(0, 40) }));
    setCounts(prev => ({ ...prev, [laneId]: (prev[laneId] ?? 0) + 1 }));
    setRoutedToday(n => n + 1);
    setFlashLane(laneId);
    setAnnounce(toReview
      ? `${c.intent}, ${c.sentiment}, ${Math.round(c.confidence * 100)}% confident. Sent to Needs review; suggested lane ${laneLabel(picked)}.`
      : `${c.intent}, ${c.sentiment}, ${Math.round(c.confidence * 100)}% confident. Routed to ${laneLabel(laneId)}, assigned to ${assignee ?? "team"}.`);
    onRoute?.(row);
    setStage("land");
  }, [activeIdx, lanes, laneLabel, onRoute, queue, resolveReviewLaneId, reviewLaneId, reviewThreshold, route]);

  /* --- avanço de fila --- */

  const nextTicket = useCallback(() => {
    const next = activeIdx + 1;
    if (next >= queue.length) {
      if (loop !== false && !interacted && isSample) {
        // Loop volta direto para o estado estável "classificado" do primeiro ticket,
        // em vez de piscar um novo classify.
        setLaneRows(seedRows());
        setCounts({ ...SEED_COUNTS });
        setRoutedToday(31);
        rr.current = {};
        setActiveIdx(0);
        setCaughtUp(false);
        setError(null);
        setFlashLane(null);
        setCls(SIM_RESULTS.t1 ?? null);
        setStage("revealed");
        return;
      }
      setCaughtUp(true);
      setAnnounce("All caught up.");
      return;
    }
    setFlashLane(null);
    setActiveIdx(next);
    setCaughtUp(false);
    setCls(null);
    setError(null);
    setStage("classify");
  }, [activeIdx, interacted, isSample, loop, queue.length]);

  const sendToReview = useCallback(() => {
    const ticket = queue[activeIdx];
    if (!ticket) return;
    setCls({ intent: "Question", sentiment: "Neutral", confidence: 0.5 });
    setStage("revealed");
    void ticket;
  }, [activeIdx, queue]);

  /* --- orquestração de tempo --- */

  useEffect(() => {
    if (reduce || error || caughtUp || paused || interacted || !onScreen || !wantsAuto) return;
    const firstHold = activeIdx === 0 && stage === "revealed" && !interacted ? 2900 : 0;
    const ms = stage === "classify" ? 950 : stage === "revealed" ? (firstHold || 380) : 780;
    const id = window.setTimeout(() => {
      if (stage === "classify") void runClassify();
      else if (stage === "revealed") land();
      else nextTicket();
    }, ms / Math.max(.25, speed));
    return () => window.clearTimeout(id);
  }, [reduce, error, caughtUp, paused, onScreen, wantsAuto, stage, activeIdx, interacted, speed, runClassify, land, nextTicket]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (wantsAuto && isSample && onScreen && !paused) {
      setAnnounce(prev => (prev ? prev : "Run is simulated; nothing was sent."));
    }
  }, [wantsAuto, isSample, onScreen, paused]);

  const setPausedBoth = useCallback((value: boolean) => {
    setInternalPaused(value);
    onPausedChange?.(value);
  }, [onPausedChange]);

  const togglePause = useCallback(() => {
    const nextValue = !paused;
    setPausedBoth(nextValue);
    setAnnounce(nextValue ? "Paused." : "Resumed.");
  }, [paused, setPausedBoth]);

  /* --- confirmação de review --- */

  const confirmReview = useCallback((row: RoutedTicket) => {
    const laneId = resolveReviewLaneId(row.suggestedLaneId);
    const laneDef = lanes.find(l => l.id === laneId);
    const pool = laneDef?.assignees ?? [];
    if (pool.length === 0) return;
    const idx = (rr.current[laneId] ?? 0) % pool.length;
    rr.current[laneId] = (rr.current[laneId] ?? 0) + 1;
    const assignee = pool[idx];
    const moved: RoutedTicket = { ...row, laneId, assignee, suggestedLaneId: undefined };
    setLaneRows(prev => ({
      ...prev,
      review: (prev.review ?? []).filter(r => r.ticket.id !== row.ticket.id),
      [laneId]: [moved, ...(prev[laneId] ?? [])].slice(0, 40),
    }));
    setCounts(prev => ({ ...prev, review: Math.max(0, (prev.review ?? 0) - 1), [laneId]: (prev[laneId] ?? 0) + 1 }));
    setRoutedToday(n => n + 1);
    setFlashLane(laneId);
    setAnnounce(`${row.ticket.subject} confirmed to ${laneLabel(laneId)}, assigned to ${assignee}.`);
    onReview?.(row, laneId);
  }, [lanes, laneLabel, onReview, resolveReviewLaneId]);

  /* --- derivados para render --- */

  const activeTicket = queue[activeIdx];
  const showCls = stage === "revealed" || stage === "land";
  /** Lane sugerida pelo roteador (sempre uma lane real, nunca a de review). */
  const suggestedLaneId = showCls && cls && activeTicket ? resolveReviewLaneId(route(activeTicket, cls)) : null;
  const targetLaneId = showCls && cls ? (cls.confidence < reviewThreshold ? reviewLaneId : suggestedLaneId) : null;
  const targetIsReview = targetLaneId === reviewLaneId;
  const targetIndex = targetLaneId ? lanes.findIndex(l => l.id === targetLaneId) : -1;
  const targetAssignee = useMemo(() => {
    if (!targetLaneId || targetIsReview || !cls || !suggestedLaneId) return undefined;
    const pool = lanes.find(l => l.id === suggestedLaneId)?.assignees ?? [];
    const idx = (rr.current[suggestedLaneId] ?? 0) % Math.max(1, pool.length);
    return pool[idx];
  }, [targetLaneId, targetIsReview, cls, lanes, suggestedLaneId]);

  const percent = cls ? Math.round(cls.confidence * 100) : 0;
  const titleId = "ticket-router-title";

  if (!activeTicket) {
    return <section id={titleId} className={[styles.card, className].filter(Boolean).join(" ") || undefined}>{title}</section>;
  }

  return (
    <div {...{ ref: screenRef }}>
      <section
        id={titleId}
        className={[styles.card, className].filter(Boolean).join(" ") || undefined}
        aria-labelledby={titleId}
        onPointerDown={onCardPointer}
        onKeyDown={onCardKey}
      >
        <p className={styles.srOnly} aria-live="polite">{announce}</p>

        {/* cabeçalho */}
        <div className={styles.topbar}>
          <div className={styles.topLeft}>
            {modelMark}
            <h2 id={titleId} className={styles.topTitle}>{title}</h2>
            <span className={styles.modelTag}>{model}</span>
          </div>
          <div className={styles.topRight}>
            <span className={styles.todayStat}>{routedToday} routed today</span>
            <button type="button" className={styles.ghostPill} onClick={togglePause} aria-pressed={paused}>
              {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
              {paused ? "Resume" : "Pause"}
            </button>
          </div>
        </div>

        {/* ticket em classificação */}
        <div className={styles.ticketBox}>
          <div className={styles.tHead}>
            <span className={styles.chanWrap}><ChannelIcon channel={activeTicket.channel} boxed size={18} /></span>
            <span className={styles.custName}>{activeTicket.customer}</span>
            {activeTicket.company ? <span className={styles.custCo}>{activeTicket.company}</span> : null}
            {activeTicket.receivedAt ? <span className={styles.tTime}>{activeTicket.receivedAt}</span> : null}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTicket.id}
              className={styles.tSwap}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant } }}
              transition={{ duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] }}
            >
              <p className={styles.tSubject}>{activeTicket.subject}</p>
              <p className={styles.tBody}>{activeTicket.preview}</p>
            </motion.div>
          </AnimatePresence>

          <div className={styles.cRow}>
            {error ? (
              <div className={styles.errRow}>
                <AlertTriangle size={14} aria-hidden="true" className={styles.errIcon} />
                <span className={styles.errMsg}>{error.message}</span>
                <button type="button" className={styles.miniGhost} onClick={() => void runClassify()}>
                  <RefreshCw size={12} aria-hidden="true" /> Retry
                </button>
                <button type="button" className={styles.miniGhost} onClick={sendToReview}>Send to review</button>
              </div>
            ) : caughtUp ? (
              <span className={styles.caughtUp}>All caught up.</span>
            ) : !showCls ? (
              <span className={styles.classifying}>
                <LoaderCircle size={13} aria-hidden="true" className={styles.spin} />
                Classifying with {model}
                <span className={styles.srOnly}>…</span>
              </span>
            ) : cls ? (
              <div className={styles.cRowInner}>
                <span className={`${styles.chip} ${styles.chipIn}`} style={{ animationDelay: reduce ? undefined : "0ms" }}>
                  <IntentIcon intent={cls.intent} />{cls.intent}
                </span>
                <span className={`${styles.chip} ${styles.chipIn}`} style={{ animationDelay: reduce ? undefined : "50ms" }}>
                  <SentimentIcon sentiment={cls.sentiment} />{cls.sentiment}
                </span>
                <span className={`${styles.chip} ${styles.chipIn}`} style={{ animationDelay: reduce ? undefined : "100ms" }}>
                  <span className={styles.meter} aria-hidden="true"><span className={styles.meterFill} style={{ width: `${percent}%` }} /></span>
                  {percent}%
                </span>
                <span className={`${styles.target} ${styles.chipIn}`} style={{ animationDelay: reduce ? undefined : "150ms" }}>
                  {targetIsReview ? (
                    <>
                      <HelpCircle size={15} aria-hidden="true" className={styles.sentWarn} />
                      <span className={styles.targetName}>{suggestedLaneId ? laneLabel(suggestedLaneId) : ""}?&nbsp;{percent}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight size={14} aria-hidden="true" className={styles.dimIcon} />
                      <span className={styles.targetName}>{targetLaneId ? laneLabel(targetLaneId) : ""}</span>
                      {targetAssignee ? (<><Avatar name={targetAssignee} /><span className={styles.assigneeName}>{targetAssignee}</span></>) : null}
                    </>
                  )}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* trilho de conexão */}
        <div className={styles.railStrip} aria-hidden="true">
          <div className={styles.railBase} />
          {lanes.map((lane, i) => (
            <span key={lane.id} className={styles.railTick} style={{ left: `${((i + 0.5) / lanes.length) * 100}%` }} />
          ))}
          {targetLaneId && targetIndex >= 0 ? (
            <span
              className={`${styles.conSeg} ${showCls ? styles.conOn : ""}`}
              style={{ left: `${Math.min(((targetIndex + 0.5) / lanes.length) * 100 - 10.5, 89.5)}%` }}
              data-dir={(targetIndex + 0.5) / lanes.length <= 0.5 ? "right" : "left"}
            />
          ) : null}
        </div>

        {/* lanes */}
        <div className={styles.lanes}>
          {lanes.map(lane => {
            const rows = (laneRows[lane.id] ?? []).slice(0, maxVisible);
            const count = counts[lane.id] ?? 0;
            const isActive = targetLaneId === lane.id && showCls;
            const flashing = flashLane === lane.id;
            return (
              <div key={lane.id} className={[styles.lane, isActive ? styles.laneActive : "", flashing ? styles.laneFlash : ""].join(" ")}>
                <div className={styles.laneHead}>
                  <span className={styles.laneLabel}>{lane.label}</span>
                  <span key={count} className={styles.laneCount}>{count}</span>
                </div>
                <div className={styles.laneRows} role="list" aria-label={`${lane.label}, ${count} tickets`}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {rows.map(row => (
                      <motion.div
                        key={row.ticket.id}
                        role="listitem"
                        className={styles.rowItem}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        transition={reduce ? { duration: 0 } : { height: { type: "spring", stiffness: 420, damping: 40 }, opacity: { duration: motionTokens.duration.fast } }}
                      >
                        {lane.review ? (
                          <button
                            type="button"
                            className={styles.reviewBtn}
                            aria-label={`${row.ticket.subject}: confirm routing to ${row.suggestedLaneId ? laneLabel(row.suggestedLaneId) : "team"}, ${Math.round(row.classification.confidence * 100)}% confident`}
                            onClick={() => confirmReview(row)}
                          >
                            <span className={styles.rowLine1}><ChannelIcon channel={row.ticket.channel} /><span className={styles.rowSubj}>{row.ticket.subject}</span></span>
                            <span className={styles.rowLine2}>
                              <HelpCircle size={13} aria-hidden="true" className={styles.sentWarn} />
                              <span className={styles.rowSuggest}>{row.suggestedLaneId ? laneLabel(row.suggestedLaneId) : "Team"}?</span>
                              <span className={styles.rowPct}>{Math.round(row.classification.confidence * 100)}%</span>
                            </span>
                          </button>
                        ) : (
                          <div>
                            <span className={styles.rowLine1}><ChannelIcon channel={row.ticket.channel} /><span className={styles.rowSubj}>{row.ticket.subject}</span></span>
                            <span className={styles.rowLine2}>
                              {row.assignee ? (<><Avatar name={row.assignee} size={15} /><span className={styles.rowName}>{firstName(row.assignee)}</span></>) : null}
                              <span className={styles.rowPct}>{Math.round(row.classification.confidence * 100)}%</span>
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
