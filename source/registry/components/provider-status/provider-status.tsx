"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, ChevronDown, CircleCheck, CircleSlash, LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./provider-status.module.css";

export type ProviderHealth = "operational" | "degraded" | "outage";

export interface ProviderDay {
  /** "YYYY-MM-DD", oldest first. */
  date: string;
  /** 0 to 100, or null for a day with no data. */
  uptime: number | null;
  /** Derived from uptime when left out: below 99.9 degraded, below 99 outage. */
  status?: ProviderHealth;
  note?: string;
}

export interface IncidentUpdate {
  stage: "investigating" | "identified" | "monitoring" | "resolved";
  /** Date, timestamp (shown as HH:MM UTC) or preformatted string. */
  at: Date | number | string;
  message: string;
}

export interface ProviderIncident {
  id: string;
  title: string;
  updates: IncidentUpdate[];
  url?: string;
}

export interface ProviderStatusItem {
  id: string;
  name: string;
  /** The provider's mark as a 16px ReactNode. */
  mark?: React.ReactNode;
  detail?: string;
  status: ProviderHealth;
  latencyMs: number;
  days: ProviderDay[];
  incident?: ProviderIncident | null;
}

export interface ProviderStatusProps {
  /** Leave out to play the built in sample story. */
  providers?: ProviderStatusItem[];
  onRefresh?: (signal: AbortSignal) => Promise<ProviderStatusItem[] | void>;
  /** Milliseconds between automatic checks. Null turns auto refresh off but keeps the button. */
  refreshInterval?: number | null;
  /** Skeleton rows for the first load. */
  loading?: boolean;
  /** An error to show in the header, such as a failed first load. */
  error?: string | null;
  title?: string;
  expandedId?: string | null;
  defaultExpandedId?: string | null;
  onExpandedChange?: (id: string | null) => void;
  onOpenIncident?: (provider: ProviderStatusItem, incident: ProviderIncident) => void;
  footnote?: React.ReactNode;
  /** One-off message for screen readers. */
  notice?: string;
  className?: string;
}

const HEALTH_META: Record<ProviderHealth, { label: string }> = {
  operational: { label: "Operational" },
  degraded: { label: "Degraded" },
  outage: { label: "Outage" },
};

/* ---------- provider marks (Simple Icons CC0 / Lobe Icons MIT, third-party brands) ---------- */

interface MarkProps {
  title?: string;
  size?: number;
}

/** Anthropic — mono, draws with currentColor. */
export function AnthropicMark({ title, size = 16 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path d="M4.4 15.6 8.7 3.8a.9.9 0 0 1 1.7 0l4.3 11.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.3 11.4h6.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="17.9" cy="13.1" r="1.15" fill="currentColor" />
    </svg>
  );
}

/** OpenAI — mono, segmented hex knot drawn with currentColor. */
export function OpenaiMark({ title, size = 16 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path
        d="M19.36 16.25 16.25 20.36H7.75L4.64 16.25V7.75l3.11-4.11h8.5L19.36 7.75z"
        transform="rotate(30 12 12)"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeDasharray="6.4 1.35"
      />
    </svg>
  );
}

/** Google Gemini — keeps its brand fills (four point star). */
export function GeminiColorMark({ title, size = 16 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id="gemini-mark-grad" x1="4" y1="20" x2="20" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4E8CF9" />
          <stop offset="1" stopColor="#B14AFB" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.2c.85 5.1 2.7 7.75 8.1 9.3v1c-5.4 1.55-7.25 4.2-8.1 9.3-.85-5.1-2.7-7.75-8.1-9.3v-1c5.4-1.55 7.25-4.2 8.1-9.3Z"
        fill="url(#gemini-mark-grad)"
      />
    </svg>
  );
}

/** Mistral — keeps its brand orange (stylised M). */
export function MistralColorMark({ title, size = 16 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path
        d="M3.2 16.6V8.4l5.2 3.9L13.8 5.2v11.4h-2V10.9l-3.4 3.9-2.8-2v3.8H3.2Zm11.8 0V5.2h2v8.1l2.9-3h2.6L18.4 12.8 21 16.6h-2.7l-1.6-2.2-1.7 2.2H15Z"
        fill="#F4793B"
      />
    </svg>
  );
}

/** xAI — mono, x in a ring with currentColor. */
export function XaiMark({ title, size = 16 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8.7 8.7 6.6 6.6m0-6.6-6.6 6.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Amazon Bedrock — mono, rounded badge with the smile arrow. */
export function AwsMark({ title, size = 16 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <rect x="3.2" y="4.4" width="17.6" height="15.2" rx="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7.6 11.4c3.2 2.3 7.6 2.3 10.8 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- formatting helpers ---------- */

function formatLatency(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;
}

function dayStatus(day: ProviderDay): ProviderHealth | null {
  if (day.status) return day.status;
  if (day.uptime == null) return null;
  if (day.uptime < 99) return "outage";
  if (day.uptime < 99.9) return "degraded";
  return "operational";
}

function averageUptime(days: ProviderDay[]): number | null {
  const values = days.map(d => d.uptime).filter((u): u is number => u != null);
  if (values.length === 0) return null;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function formatUptime(value: number | null): string {
  return value == null ? "No data" : `${value.toFixed(2)}%`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dayLabel(dateStr: string, isLast: boolean): string {
  if (isLast) return "Today";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return `${MONTHS[m - 1] ?? m} ${d}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatAt(at: IncidentUpdate["at"]): string {
  if (typeof at === "string") return at;
  const d = new Date(at);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

const STAGE_LABEL: Record<IncidentUpdate["stage"], string> = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
};

/* ---------- sample story ---------- */

const DAY_COUNT = 30;

function dayDates(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = DAY_COUNT - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    out.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  }
  return out;
}

function buildDays(values: Array<number | ((i: number) => number | null)>, notes?: Record<number, string>): ProviderDay[] {
  return dayDates().map((date, i) => {
    const value = typeof values[i] === "function" ? (values[i] as (i: number) => number | null)(i) : values[i];
    const uptime = value == null ? null : value;
    const status = uptime != null ? dayStatus({ date, uptime }) : null;
    return { date, uptime, status: status ?? undefined, note: notes?.[i] };
  });
}

const allOk = () => Array.from({ length: DAY_COUNT }, () => 100) as number[];

const DAYS: Record<string, ProviderDay[]> = {
  anthropic: buildDays([
    ...allOk().slice(0, 25), 99.6, 99.6, 99.6, 100,
  ]),
  // 24 ok + one degraded (99.4) + five outage days (sum 488.8) -> 99.61%
  openai: buildDays(
    [
      100, 100, 97.4, 100, 100, 100, 98.2, 100, 100, 100, 100, 97.5, 100, 100, 100, 100, 100, 98.6, 100, 100, 100, 99.4, 100, 100, 100, 100, 97.1, 100, 100, 100,
    ],
    { 17: "Packet loss between us-east and eu-west edges." },
  ),
  // three degraded days (99.3) -> 99.93%
  gemini: buildDays([...allOk().slice(0, 7), 99.3, ...allOk().slice(7, 19), 99.3, ...allOk().slice(19, 28), 99.3]),
  // one deep outage day + one degraded -> 99.81%
  mistral: buildDays([...allOk().slice(0, 14), 94.9, ...allOk().slice(14, 23), 99.4, ...allOk().slice(23)]),
  xai: buildDays(allOk()),
  bedrock: buildDays([...allOk().slice(0, 10), 99.1, ...allOk().slice(10)]),
};

interface StoryFrame {
  openAI: { status: ProviderHealth; latencyMs: number; updates: IncidentUpdate[] | null };
  gemini: { status: ProviderHealth; latencyMs: number; updates: IncidentUpdate[] | null };
  mistral: { status: ProviderHealth; latencyMs: number; updates: IncidentUpdate[] | null };
  anthropicMs: number;
  xaiMs: number;
  bedrockMs: number;
}

const OPENAI_BASE: IncidentUpdate[] = [
  {
    stage: "investigating",
    at: "14:02",
    message: "We are seeing elevated 5xx errors on the Responses API for GPT-6.1 Sol. GPT-6 Luna is not affected.",
  },
];
const GEMINI_UPDATES: IncidentUpdate[] = [
  {
    stage: "monitoring",
    at: "09:41",
    message: "Time-to-first-token is slower than usual on Gemini 4 Argon. Requests still complete.",
  },
];
const MISTRAL_UPDATES: IncidentUpdate[] = [
  {
    stage: "investigating",
    at: "11:12",
    message: "Elevated 429 responses on chat completions for Mistral Large 4.",
  },
];

const FRAMES: StoryFrame[] = [
  { openAI: { status: "outage", latencyMs: 2140, updates: [...OPENAI_BASE] }, gemini: { status: "degraded", latencyMs: 1380, updates: [...GEMINI_UPDATES] }, mistral: { status: "operational", latencyMs: 367, updates: null }, anthropicMs: 412, xaiMs: 289, bedrockMs: 501 },
  { openAI: { status: "outage", latencyMs: 2310, updates: [...OPENAI_BASE, { stage: "identified", at: "14:09", message: "Error rates are concentrated on GPT-6.1 Sol completions in the us-east region." }] }, gemini: { status: "degraded", latencyMs: 1440, updates: [...GEMINI_UPDATES] }, mistral: { status: "operational", latencyMs: 371, updates: null }, anthropicMs: 418, xaiMs: 297, bedrockMs: 497 },
  { openAI: { status: "degraded", latencyMs: 918, updates: [...OPENAI_BASE, { stage: "identified", at: "14:09", message: "Error rates are concentrated on GPT-6.1 Sol completions in the us-east region." }, { stage: "monitoring", at: "14:17", message: "Rolling back the change that caused the spike. Rates are falling back toward baseline." }] }, gemini: { status: "degraded", latencyMs: 986, updates: [...GEMINI_UPDATES] }, mistral: { status: "operational", latencyMs: 359, updates: null }, anthropicMs: 405, xaiMs: 304, bedrockMs: 508 },
  { openAI: { status: "operational", latencyMs: 421, updates: [...OPENAI_BASE, { stage: "identified", at: "14:09", message: "Error rates are concentrated on GPT-6.1 Sol completions in the us-east region." }, { stage: "monitoring", at: "14:17", message: "Rolling back the change that caused the spike. Rates are falling back toward baseline." }, { stage: "resolved", at: "14:41", message: "Error rates returned to baseline. We are keeping an eye on GPT-6.1 Sol for the rest of the day." }] }, gemini: { status: "operational", latencyMs: 604, updates: null }, mistral: { status: "operational", latencyMs: 380, updates: null }, anthropicMs: 409, xaiMs: 293, bedrockMs: 515 },
  { openAI: { status: "operational", latencyMs: 402, updates: null }, gemini: { status: "operational", latencyMs: 590, updates: null }, mistral: { status: "operational", latencyMs: 365, updates: null }, anthropicMs: 415, xaiMs: 286, bedrockMs: 503 },
  { openAI: { status: "operational", latencyMs: 415, updates: null }, gemini: { status: "operational", latencyMs: 612, updates: null }, mistral: { status: "degraded", latencyMs: 642, updates: [...MISTRAL_UPDATES] }, anthropicMs: 421, xaiMs: 299, bedrockMs: 494 },
  { openAI: { status: "operational", latencyMs: 398, updates: null }, gemini: { status: "operational", latencyMs: 601, updates: null }, mistral: { status: "operational", latencyMs: 374, updates: null }, anthropicMs: 402, xaiMs: 307, bedrockMs: 506 },
  { openAI: { status: "operational", latencyMs: 409, updates: null }, gemini: { status: "operational", latencyMs: 585, updates: null }, mistral: { status: "operational", latencyMs: 369, updates: null }, anthropicMs: 411, xaiMs: 292, bedrockMs: 511 },
];

/**
 * The six-provider sample story after a number of simulated checks. The story loops every 11 checks:
 * an OpenAI outage and a Gemini slowdown resolve, Mistral has a short incident, and check 8 of the loop fails.
 * Every number is a plausible sample, not a measurement.
 */
export function sampleProviders(check: number): ProviderStatusItem[] {
  const i = ((check % 11) + 11) % 11;
  const f = (FRAMES[i] ?? FRAMES[FRAMES.length - 1]) as StoryFrame;
  return [
    {
      id: "anthropic",
      name: "Anthropic",
      mark: <AnthropicMark />,
      detail: "Claude Opus 5.5, Sonnet 5",
      status: "operational",
      latencyMs: f.anthropicMs,
      days: (DAYS.anthropic ?? []) as ProviderDay[],
    },
    {
      id: "openai",
      name: "OpenAI",
      mark: <OpenaiMark />,
      detail: "GPT-6.1 Sol, GPT-6 Luna",
      status: f.openAI.status,
      latencyMs: f.openAI.latencyMs,
      days: (DAYS.openai ?? []) as ProviderDay[],
      incident: f.openAI.updates
        ? { id: "openai-gpt61-sol", title: "Elevated error rates on GPT-6.1 Sol", updates: f.openAI.updates, url: "https://status.openai.com" }
        : null,
    },
    {
      id: "gemini",
      name: "Google Gemini",
      mark: <GeminiColorMark />,
      detail: "Gemini 4 Argon, 3.8 Flash",
      status: f.gemini.status,
      latencyMs: f.gemini.latencyMs,
      days: (DAYS.gemini ?? []) as ProviderDay[],
      incident: f.gemini.updates ? { id: "gemini-argon-ttft", title: "Slower time-to-first-token on Gemini 4 Argon", updates: f.gemini.updates, url: "https://status.google.com/products/gemini" } : null,
    },
    {
      id: "mistral",
      name: "Mistral AI",
      mark: <MistralColorMark />,
      detail: "Mistral Large 4",
      status: f.mistral.status,
      latencyMs: f.mistral.latencyMs,
      days: (DAYS.mistral ?? []) as ProviderDay[],
      incident: f.mistral.updates ? { id: "mistral-429", title: "Elevated 429s on chat completions", updates: f.mistral.updates, url: "https://status.mistral.ai" } : null,
    },
    {
      id: "xai",
      name: "xAI",
      mark: <XaiMark />,
      detail: "Groke 5, Groke 5 Mini",
      status: "operational",
      latencyMs: f.xaiMs,
      days: (DAYS.xai ?? []) as ProviderDay[],
    },
    {
      id: "bedrock",
      name: "Amazon Bedrock",
      mark: <AwsMark />,
      detail: "Claude via Bedrock, Nova 2",
      status: "operational",
      latencyMs: f.bedrockMs,
      days: (DAYS.bedrock ?? []) as ProviderDay[],
    },
  ];
}

/* ---------- small pieces ---------- */

/** Crossfade dentro de uma célula de grid reservada: o valor troca sem reflow. */
function Swap({ value, reduce, children }: { value: string | number; reduce: boolean; children: (v: string) => React.ReactNode }) {
  return (
    <span className={styles.swap}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={String(value)}
          className={styles.swapIn}
          initial={{ opacity: 0, y: reduce ? 0 : 2 }}
          animate={{ opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.16, ease: motionTokens.ease.enter } }}
          exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.1 } }}
        >
          {children(String(value))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function HealthBadge({ status, reduce }: { status: ProviderHealth; reduce: boolean }) {
  const icon =
    status === "operational" ? (
      <CircleCheck size={14} className={styles.iconOk} aria-hidden="true" />
    ) : status === "degraded" ? (
      <TriangleAlert size={14} className={styles.iconWarn} aria-hidden="true" />
    ) : (
      <CircleSlash size={14} className={styles.iconDanger} aria-hidden="true" />
    );
  return (
    <Swap value={status} reduce={reduce}>
      {() => (
        <span className={`${styles.health} ${status === "operational" ? styles.healthOk : status === "degraded" ? styles.healthWarn : styles.healthDanger}`}>
          {icon}
          {HEALTH_META[status].label}
        </span>
      )}
    </Swap>
  );
}

/* ---------- component ---------- */

export function ProviderStatus({
  providers,
  onRefresh,
  refreshInterval,
  loading = false,
  error,
  title = "AI providers",
  expandedId,
  defaultExpandedId = null,
  onExpandedChange,
  onOpenIncident,
  footnote,
  notice,
  className,
}: ProviderStatusProps) {
  const rawReduce = useReducedMotion();
  const reduce = rawReduce ?? false;
  const sampleMode = providers == null && onRefresh == null;
  const interval = refreshInterval ?? (sampleMode ? 8000 : 30000);
  const hasControls = onRefresh != null || sampleMode;

  const [items, setItems] = useState<ProviderStatusItem[]>(() => (providers && providers.length > 0 ? providers : sampleProviders(0)));
  const [internalExpanded, setInternalExpanded] = useState<string | null>(defaultExpandedId);
  const expanded = expandedId !== undefined ? expandedId : internalExpanded;
  const [thrownError, setThrownError] = useState<string | null>(null);
  const headerError = error ?? thrownError;
  const [checking, setChecking] = useState(false);
  const [remain, setRemain] = useState(interval);
  const [cycle, setCycle] = useState(0);
  const [announce, setAnnounce] = useState("");
  const [tip, setTip] = useState<{ left: number; top: number; text: string; sub: string } | null>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const barRefs = useRef(new Map<string, HTMLDivElement>());
  const abortRef = useRef<AbortController | null>(null);
  const checkingRef = useRef(false);
  const remainRef = useRef(interval);
  const checkCountRef = useRef(0);
  const intervalRef = useRef(interval);
  const onRefreshRef = useRef(onRefresh);
  intervalRef.current = interval;
  onRefreshRef.current = onRefresh;

  const isControlledExpansion = expandedId !== undefined;
  const toggleExpanded = useCallback(
    (id: string) => {
      const next = expanded === id ? null : id;
      if (!isControlledExpansion) setInternalExpanded(next);
      onExpandedChange?.(next);
    },
    [expanded, isControlledExpansion, onExpandedChange],
  );

  /* providers controlados viram o estado exibido quando mudam. */
  useEffect(() => {
    if (providers && providers.length > 0) {
      setItems(providers);
      setThrownError(null);
    }
  }, [providers]);

  useEffect(() => {
    if (notice) setAnnounce(notice);
  }, [notice]);

  /* pausa fora da tela e em aba oculta. */
  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => setOnScreen(entries.some(entry => entry.isIntersecting)), { threshold: 0.2 });
    observer.observe(node);
    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const finishCheck = useCallback(
    (failed: boolean) => {
      checkingRef.current = false;
      setChecking(false);
      remainRef.current = failed ? Math.min(intervalRef.current, 10000) : intervalRef.current;
      setRemain(remainRef.current);
      if (!failed) setCycle(c => c + 1);
    },
    [],
  );

  const runCheck = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    setChecking(true);
    setThrownError(null);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const fetcher =
      onRefreshRef.current ??
      (async (signal: AbortSignal) => {
        checkCountRef.current += 1;
        const next = checkCountRef.current;
        await new Promise<void>((resolve, reject) => {
          const t = window.setTimeout(resolve, 550);
          signal.addEventListener("abort", () => {
            window.clearTimeout(t);
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
        if (next % 11 === 8) throw new Error("Couldn't reach the status feeds. Showing the last results.");
        return sampleProviders(next);
      });
    try {
      const res = await fetcher(ctrl.signal);
      if (res && res.length > 0) {
        setItems(res);
        const counts = res.reduce(
          (acc, p) => {
            acc[p.status] += 1;
            return acc;
          },
          { operational: 0, degraded: 0, outage: 0 } as Record<ProviderHealth, number>,
        );
        setAnnounce(`Checked ${res.length} providers: ${counts.outage} outage, ${counts.degraded} degraded, ${counts.operational} operational${sampleMode ? ", simulated, no requests were sent" : ""}.`);
      } else if (sampleMode) {
        checkCountRef.current = Math.max(0, checkCountRef.current - 1);
      }
      finishCheck(false);
    } catch (err) {
      if ((err instanceof DOMException && err.name === "AbortError") || ctrl.signal.aborted) {
        finishCheck(false);
        return;
      }
      const message = err instanceof Error ? err.message : "Couldn't reach the status feeds.";
      setThrownError(message);
      setAnnounce(`${message} Retrying soon${sampleMode ? ", simulated" : ""}.`);
      finishCheck(true);
    }
  }, [finishCheck, sampleMode]);

  /* countdown: um re-render por segundo no máximo; o ring é CSS. */
  useEffect(() => {
    if (!hasControls || interval == null || checking || headerError) return;
    const tick = window.setInterval(() => {
      remainRef.current -= 1000;
      if (remainRef.current <= 1000) {
        remainRef.current = 0;
        setRemain(0);
        void runCheck();
      } else {
        setRemain(remainRef.current);
      }
    }, 1000);
    return () => window.clearInterval(tick);
  }, [hasControls, interval, checking, headerError, runCheck, onScreen, tabVisible]);

  const counts = useMemo(
    () =>
      items.reduce(
        (acc, p) => {
          acc[p.status] += 1;
          return acc;
        },
        { operational: 0, degraded: 0, outage: 0 } as Record<ProviderHealth, number>,
      ),
    [items],
  );

  const summaryText = `${counts.outage} outage · ${counts.degraded} degraded · ${counts.operational} operational`;
  const summaryIcon =
    counts.outage > 0 ? (
      <CircleSlash size={13} className={styles.summaryDanger} aria-hidden="true" />
    ) : counts.degraded > 0 ? (
      <TriangleAlert size={13} className={styles.summaryWarn} aria-hidden="true" />
    ) : (
      <CircleCheck size={13} className={styles.summaryOk} aria-hidden="true" />
    );

  /* tooltip único no cartão, posicionado sobre o tick ativo. */
  const showTipForDay = useCallback((providerId: string, idx: number) => {
    const barEl = barRefs.current.get(providerId);
    const cardEl = cardRef.current;
    if (!barEl || !cardEl) return;
    const tickEls = barEl.querySelectorAll<HTMLElement>(".tick");
    const tick = tickEls[idx];
    if (!tick) return;
    const provider = items.find(p => p.id === providerId);
    if (!provider) return;
    const cardRect = cardEl.getBoundingClientRect();
    const tickRect = tick.getBoundingClientRect();
    const barRect = barEl.getBoundingClientRect();
    const day = provider.days[idx];
    if (!day) return;
    const isLast = idx === provider.days.length - 1;
    const health = dayStatus(day);
    const sub =
      day.note ??
      (health ? HEALTH_META[health].label : "No data");
    setTip({
      left: tickRect.left + tickRect.width / 2 - cardRect.left,
      top: tickRect.top - barRect.top - 8,
      text: `${dayLabel(day.date, isLast)} · ${formatUptime(day.uptime)}`,
      sub,
    });
    setAnnounce(`${dayLabel(day.date, isLast)}: ${formatUptime(day.uptime)}${health ? `, ${HEALTH_META[health].label.toLowerCase()}` : ""}${day.note ? `. ${day.note}` : ""}.`);
  }, [items]);

  const hideTip = useCallback(() => setTip(null), []);

  const barKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>, providerId: string, length: number) => {
      let idx: number | null = null;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const current = tip && barRefs.current.has(providerId) ? activeIdxRef.current : null;
        const base = current == null ? length - 1 : current;
        idx = e.key === "ArrowRight" ? Math.min(length - 1, base + 1) : Math.max(0, base - 1);
      } else if (e.key === "Home") {
        idx = 0;
      } else if (e.key === "End") {
        idx = length - 1;
      } else if (e.key === "Escape") {
        hideTip();
        return;
      } else {
        return;
      }
      e.preventDefault();
      activeIdxRef.current = idx;
      showTipForDay(providerId, idx);
    },
    [hideTip, showTipForDay, tip],
  );
  const activeIdxRef = useRef(-1);

  const pausedRing = !onScreen || !tabVisible || checking || !!headerError;
  const showSkeleton = loading && items.length === 0;

  return (
    <div ref={cardRef} className={[styles.card, className].filter(Boolean).join(" ")}>
      <p className={styles.srOnly} role="status" aria-live="polite">
        {announce}
      </p>

      {/* cabeçalho: título + resumo · countdown + refresh */}
      <div className={styles.head}>
        <div className={styles.headTitle}>
          <h2 className={styles.title}>{title}</h2>
          {showSkeleton ? (
            <p className={styles.skeletonLine} aria-hidden="true" />
          ) : (
            <Swap value={summaryText} reduce={reduce}>
              {text => (
                <p className={styles.summary}>
                  {summaryIcon}
                  <span>{text}</span>
                </p>
              )}
            </Swap>
          )}
          <AnimatePresence initial={false}>
            {headerError && !showSkeleton ? (
              <motion.p
                key="error"
                className={styles.headError}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: reduce ? 0 : 0.16 } }}
                exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.1 } }}
              >
                {headerError}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
        {hasControls && !showSkeleton ? (
          <div className={styles.headRight}>
            <div className={styles.countdown}>
              {checking ? (
                <>
                  <LoaderCircle size={13} className={styles.spinner} aria-hidden="true" />
                  <span className={styles.checkingLabel}>Checking</span>
                </>
              ) : (
                <>
                  <svg className={styles.ringSvg} viewBox="0 0 16 16" aria-hidden="true">
                    <circle cx="8" cy="8" r="6.5" className={styles.ringBg} />
                    {!headerError && !reduce ? (
                      <circle
                        key={`ring-${cycle}`}
                        cx="8"
                        cy="8"
                        r="6.5"
                        className={styles.ringFg}
                        transform="rotate(-90 8 8)"
                        style={{ animationDuration: `${interval}ms`, animationPlayState: pausedRing ? "paused" : "running" }}
                      />
                    ) : null}
                  </svg>
                  <span className={styles.countText} aria-hidden="true">
                    {headerError ? "Retrying" : interval == null ? "Auto off" : `Refresh in ${Math.max(1, Math.ceil(remain / 1000))}s`}
                  </span>
                </>
              )}
            </div>
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={() => {
                remainRef.current = 0;
                setRemain(0);
                if (headerError) setThrownError(null);
                void runCheck();
              }}
              disabled={checking}
              aria-label="Check now"
            >
              <RefreshCw size={13} className={checking ? styles.spinner : undefined} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      {/* cabeçalho de colunas (somente na largura de uma linha por provider) */}
      {!showSkeleton ? (
        <div className={styles.colHead} aria-hidden="true">
          <span>Provider</span>
          <span>Status</span>
          <span>p50</span>
          <span>Last 30 days</span>
          <span />
          <span />
        </div>
      ) : null}

      {/* linhas */}
      <ul className={styles.rows}>
        {showSkeleton
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i} className={styles.row} aria-hidden="true">
                <div className={styles.skeletonRow}>
                  <span className={`${styles.sk} ${styles.skMark}`} />
                  <span className={`${styles.sk} ${styles.skName}`} />
                  <span className={`${styles.sk} ${styles.skBar}`} />
                </div>
              </li>
            ))
          : items.map(provider => {
              const isExpanded = expanded === provider.id;
              const pct = averageUptime(provider.days);
              const degradedDays = provider.days.filter(d => dayStatus(d) === "degraded").length;
              const outageDays = provider.days.filter(d => dayStatus(d) === "outage").length;
              const latestFirst = provider.incident ? [...provider.incident.updates].reverse() : [];
              const startedAt = provider.incident && provider.incident.updates.length > 0 ? provider.incident.updates[0]?.at : null;
              const mainLine = (
                <>
                  <span className={styles.providerCell}>
                    <span className={styles.mark}>{provider.mark}</span>
                    <span className={styles.providerText}>
                      <span className={styles.providerName}>{provider.name}</span>
                      {provider.detail ? <span className={styles.providerDetail}>{provider.detail}</span> : null}
                      <span className={styles.narrowLatency}>{formatLatency(provider.latencyMs)}</span>
                    </span>
                  </span>
                  <span className={styles.statusCell}>
                    <HealthBadge status={provider.status} reduce={reduce} />
                  </span>
                  <span className={styles.latCell}>
                    <Swap value={formatLatency(provider.latencyMs)} reduce={reduce}>
                      {v => <span>{v}</span>}
                    </Swap>
                  </span>
                  <span
                    className={styles.barCell}
                    role="group"
                    tabIndex={0}
                    aria-label={`Last 30 days, ${pct == null ? "no data" : `${pct.toFixed(2)}% average`}, ${degradedDays} degraded day${degradedDays === 1 ? "" : "s"}, ${outageDays} outage day${outageDays === 1 ? "" : "s"}`}
                    onKeyDown={(e) => barKeyDown(e, provider.id, provider.days.length)}
                    onMouseLeave={() => {
                      activeIdxRef.current = -1;
                      hideTip();
                    }}
                  >
                    <div
                      ref={el => {
                        if (el) barRefs.current.set(provider.id, el);
                      }}
                      className={styles.bar}
                    >
                      {provider.days.map((day, i) => {
                        const health = dayStatus(day);
                        return (
                          <span
                            key={day.date + i}
                            className={`tick ${styles.tick} ${
                              day.uptime == null ? styles.tickNone : health === "degraded" ? styles.tickDegraded : health === "outage" ? styles.tickOutage : styles.tickOk
                            }`}
                            onMouseEnter={() => {
                              activeIdxRef.current = i;
                              showTipForDay(provider.id, i);
                            }}
                          />
                        );
                      })}
                    </div>
                  </span>
                  <span className={styles.pctCell}>
                    <Swap value={formatUptime(pct)} reduce={reduce}>
                      {v => <span>{v}</span>}
                    </Swap>
                  </span>
                  <span className={styles.chevCell}>
                    {provider.incident ? (
                      <ChevronDown size={14} className={`${styles.chevron} ${isExpanded ? styles.chevronUp : ""}`} aria-hidden="true" />
                    ) : null}
                  </span>
                </>
              );
              return (
                <li key={provider.id} className={`${styles.row} ${provider.incident ? styles.rowButton : ""}`}>
                  {provider.incident ? (
                    <button
                      type="button"
                      className={styles.rowToggle}
                      aria-expanded={isExpanded}
                      aria-controls={`incident-${provider.id}`}
                      onClick={() => toggleExpanded(provider.id)}
                    >
                      {mainLine}
                    </button>
                  ) : (
                    <div className={styles.rowToggle}>{mainLine}</div>
                  )}
                  <AnimatePresence initial={false}>
                    {provider.incident && isExpanded ? (
                      <motion.div
                        key="panel"
                        className={styles.panelWrap}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1, transition: reduce ? { duration: 0 } : motionTokens.spring.smooth }}
                        exit={{ height: 0, opacity: 0, transition: { duration: reduce ? 0 : 0.18, ease: motionTokens.ease.exit } }}
                      >
                        <div className={styles.panel} id={`incident-${provider.id}`}>
                          <div className={styles.panelHead}>
                            <strong className={styles.panelTitle}>{provider.incident.title}</strong>
                            {onOpenIncident ? (
                              <button type="button" className={styles.panelLink} onClick={() => onOpenIncident(provider, provider.incident!)}>
                                Status page <ArrowUpRight size={12} aria-hidden="true" />
                              </button>
                            ) : provider.incident.url ? (
                              <a className={styles.panelLink} href={provider.incident.url} target="_blank" rel="noreferrer">
                                Status page <ArrowUpRight size={12} aria-hidden="true" />
                              </a>
                            ) : null}
                          </div>
                          {startedAt != null ? <p className={styles.panelStarted}>Started {formatAt(startedAt)} UTC</p> : null}
                          <ul className={styles.updates}>
                            {latestFirst.map((update, i) => (
                              <AnimatePresence key={update.stage + update.at} initial={false}>
                                <motion.li
                                  className={styles.update}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1, transition: { duration: reduce ? 0 : 0.24 } }}
                                  exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.12 } }}
                                >
                                  <span className={styles.updateDot}>
                                    {update.stage === "resolved" ? (
                                      <CircleCheck size={13} className={styles.iconOk} aria-hidden="true" />
                                    ) : null}
                                  </span>
                                  <span className={styles.updateBody}>
                                    <span className={styles.updateStage}>
                                      <strong>{STAGE_LABEL[update.stage]}</strong>
                                      <time>{formatAt(update.at)} UTC</time>
                                    </span>
                                    <span className={styles.updateMsg}>{update.message}</span>
                                  </span>
                                </motion.li>
                              </AnimatePresence>
                            ))}
                          </ul>
                        </div>
                        <span className="srOnlyTick" aria-hidden="true" />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
      </ul>

      {footnote ? <p className={styles.footnote}>{footnote}</p> : null}

      {/* tooltip único do cartão */}
      {tip ? (
        <div className={styles.tooltip} style={{ left: tip.left, top: tip.top }} role="presentation">
          <span className={styles.tipMain}>{tip.text}</span>
          <span className={styles.tipSub}>{tip.sub}</span>
        </div>
      ) : null}
    </div>
  );
}
