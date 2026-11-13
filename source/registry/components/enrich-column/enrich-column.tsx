"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, CircleSlash, Hourglass, LoaderCircle, Pause, Pencil, RefreshCw, Sparkle } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./enrich-column.module.css";

export interface EnrichColumnRow {
  id: string;
  name: string;
  domain?: string;
  /** Rendered at 16px next to the name. */
  logo?: React.ReactNode;
}

export interface EnrichColumnSource {
  label: string;
  href: string;
}

export interface EnrichColumnDefinition {
  name: string;
  prompt: string;
}

export type EnrichColumnCellStatus = "idle" | "queued" | "running" | "done" | "failed";

export interface EnrichColumnCell {
  status: EnrichColumnCellStatus;
  value?: string;
  source?: EnrichColumnSource;
  error?: string;
  /** Texto vivo do shimmer enquanto a célula trabalha. */
  activity?: string;
  attempts: number;
}

interface EnrichContext {
  prompt: string;
  column: EnrichColumnDefinition;
  signal: AbortSignal;
  attempt: number;
  setActivity: (text: string) => void;
}

export type EnrichColumnEnrich = (
  row: EnrichColumnRow,
  context: EnrichContext,
) => Promise<{ value: string; source?: EnrichColumnSource }>;

export interface EnrichColumnProps {
  title?: string;
  rows?: EnrichColumnRow[];
  defaultColumn?: EnrichColumnDefinition;
  onColumnChange?: (column: EnrichColumnDefinition) => void;
  enrich?: EnrichColumnEnrich;
  initialCells?: Record<string, EnrichColumnCell>;
  concurrency?: number;
  autoRun?: boolean;
  model?: { name: string; detail?: string; mark?: React.ReactNode } | null;
  editable?: boolean;
  note?: string;
  onCellChange?: (row: EnrichColumnRow, cell: EnrichColumnCell) => void;
  onRunComplete?: (cells: Record<string, EnrichColumnCell>) => void;
  className?: string;
}

const SAMPLE_ROWS: EnrichColumnRow[] = [
  { id: "linear", name: "Linear", domain: "linear.app", logo: <LinearMark /> },
  { id: "vercel", name: "Vercel", domain: "vercel.com", logo: <VercelMark /> },
  { id: "notion", name: "Notion", domain: "notion.com", logo: <NotionMark /> },
  { id: "figma", name: "Figma", domain: "figma.com", logo: <FigmaMark /> },
  { id: "stripe", name: "Stripe", domain: "stripe.com", logo: <StripeMark /> },
  { id: "ramp", name: "Ramp", domain: "ramp.com", logo: <RampMark /> },
  { id: "retool", name: "Retool", domain: "retool.com", logo: <RetoolMark /> },
];

const DEFAULT_COLUMN: EnrichColumnDefinition = {
  name: "Headcount and funding",
  prompt: "Find the headcount and latest funding round",
};

/** Simulação local: cada linha tem passos com tempos próprios; a Retool falha de propósito. */
const SIM_SPECS: Record<string, { messages: string[]; ms: number[]; value?: string; source?: EnrichColumnSource; error?: string }> = {
  linear: { messages: ["Searching for Linear…", "Reading linear.app/now…"], ms: [700, 650], value: "180 people · Series C, $82M (Jun 2025)", source: { label: "linear.app/now", href: "https://linear.app/now" } },
  vercel: { messages: ["Searching for Vercel…", "Reading vercel.com/blog…"], ms: [800, 700], value: "820 people · Series F, $300M (Sep 2025)", source: { label: "vercel.com/blog", href: "https://vercel.com/blog" } },
  notion: { messages: ["Searching for Notion…", "Checking crunchbase.com…"], ms: [650, 600], value: "1,100 people · Series C, $275M (Oct 2025)", source: { label: "crunchbase.com", href: "https://crunchbase.com" } },
  figma: { messages: ["Searching for Figma…", "Reading sec.gov filings…"], ms: [900, 750], value: "1,700 people · IPO on the NYSE (Jul 2025)", source: { label: "sec.gov", href: "https://sec.gov" } },
  stripe: { messages: ["Searching for Stripe…", "Reading stripe.com/newsroom…"], ms: [750, 700], value: "8,500 people · Series I, $6.5B (Mar 2025)", source: { label: "stripe.com/newsroom", href: "https://stripe.com/newsroom" } },
  ramp: { messages: ["Searching for Ramp…", "Reading ramp.com/blog…"], ms: [700, 650], value: "1,200 people · Series E, $500M (Jul 2025)", source: { label: "ramp.com/blog", href: "https://ramp.com/blog" } },
  retool: { messages: ["Searching for Retool…", "No dated funding round found…"], ms: [900, 1000], error: "No dated source found" },
};

const simulatedEnrich: EnrichColumnEnrich = async (row, { signal, setActivity }) => {
  const spec = SIM_SPECS[row.id];
  if (!spec) throw new Error("No simulation for this row");
  for (let i = 0; i < spec.messages.length; i++) {
    const message = spec.messages[i];
    if (message) setActivity(message);
    await sleep(spec.ms[i] ?? 600, signal);
  }
  if (spec.error) throw new Error(spec.error);
  return { value: spec.value ?? "—", source: spec.source };
};

/** Estado final da simulação: o demo abre preenchido, como o preview do site. */
const SIM_SETTLED: Record<string, EnrichColumnCell> = Object.fromEntries(
  Object.entries(SIM_SPECS).map(([id, spec]) => [
    id,
    spec.error
      ? { status: "failed", error: spec.error, attempts: 1 }
      : { status: "done", value: spec.value, source: spec.source, attempts: 1 },
  ]),
);

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    const t = window.setTimeout(() => { cleanup(); resolve(); }, ms);
    const onAbort = () => { window.clearTimeout(t); cleanup(); reject(new DOMException("Aborted", "AbortError")); };
    const cleanup = () => signal?.removeEventListener("abort", onAbort);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/* ---------- marcas (SVG de fora do token é do próprio logotipo) ---------- */

/** Marca da Anthropic usada no rodapé: raio de oito raios arredondados. */
function ClaudeMark({ size = 14 }: { size?: number }) {
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

function LinearMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#5E6AD2" />
      <g stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <line x1="7.5" y1="16.5" x2="10.8" y2="7.8" />
        <line x1="11.2" y1="17" x2="14.8" y2="7.4" />
        <line x1="15" y1="17.3" x2="18.5" y2="7" opacity=".55" />
      </g>
    </svg>
  );
}

function VercelMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4 21 20H3Z" fill="currentColor" />
    </svg>
  );
}

function NotionMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="5" style={{ fill: "var(--background)", stroke: "var(--text-secondary)", strokeWidth: 1 }} />
      <path d="M7.5 16.5V8l9 8.5V8" fill="none" style={{ stroke: "var(--foreground)" }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FigmaMark() {
  return (
    <svg width={14} height={18} viewBox="0 0 38 57" aria-hidden="true">
      <path fill="#FF7262" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0Z" />
      <path fill="#1ABCFE" d="M19 0h9.5A9.5 9.5 0 0 1 38 9.5V19H19Z" />
      <path fill="#FF7262" d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5Z" />
      <path fill="#F24E1E" d="M0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5Z" />
      <path fill="#A259FF" d="M19 47.5A9.5 9.5 0 1 1 9.5 38H19Z" />
    </svg>
  );
}

function StripeMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <text x="12" y="18.5" textAnchor="middle" fontSize="20" fontWeight="800" fill="#635BFF">S</text>
    </svg>
  );
}

function RampMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <g transform="rotate(-30 12 12)">
        <path d="M16.5 2.8A10.2 10.2 0 1 0 16.5 21.2 8 8 0 0 1 16.5 2.8Z" fill="currentColor" />
      </g>
    </svg>
  );
}

function RetoolMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="3.5" width="11" height="11" rx="3" fill="currentColor" opacity=".4" />
      <rect x="9.5" y="9.5" width="11" height="11" rx="3" fill="currentColor" opacity=".95" />
    </svg>
  );
}

/** Fallback para linhas sem logo: inicial numa pastilha neutra. */
function InitialsLogo({ name }: { name: string }) {
  return (
    <span className={styles.logoTile} aria-hidden="true">
      {(name.trim().charAt(0) || "?").toUpperCase()}
    </span>
  );
}

/* ---------- componente ---------- */

const crossfadeOut = { opacity: 0, transition: { duration: motionTokens.duration.instant } } as const;
const crossfadeIn = { opacity: 1, y: 0, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } } as const;

export function EnrichColumn({
  title = "Target accounts",
  rows = SAMPLE_ROWS,
  defaultColumn = DEFAULT_COLUMN,
  onColumnChange,
  enrich = simulatedEnrich,
  initialCells,
  concurrency = 2,
  autoRun,
  model = { name: "Claude Haiku 5.5", detail: "Web search", mark: <ClaudeMark /> },
  editable = true,
  note,
  onCellChange,
  onRunComplete,
  className,
}: EnrichColumnProps) {
  const reduce = useReducedMotion();
  const isSimulated = enrich === simulatedEnrich;
  /** Sem `enrich` próprio o componente roda o loop de demonstração (doc: autoRun só na simulação). */
  const wantsAuto = autoRun ?? isSimulated;
  const resolvedNote = note ?? (isSimulated ? "sample data" : undefined);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const [column, setColumn] = useState<EnrichColumnDefinition>(defaultColumn);
  const columnRef = useRef(column);
  columnRef.current = column;

  const [cells, setCells] = useState<Record<string, EnrichColumnCell>>(() => {
    const out: Record<string, EnrichColumnCell> = {};
    rows.forEach(row => {
      out[row.id] = initialCells?.[row.id] ?? (isSimulated ? SIM_SETTLED[row.id] : undefined) ?? { status: "idle", attempts: 0 };
    });
    return out;
  });
  const cellsRef = useRef(cells);
  cellsRef.current = cells;

  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", prompt: "" });
  const [announce, setAnnounce] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const interacted = useRef(false);
  const pencilRef = useRef<HTMLButtonElement | null>(null);
  const editNameRef = useRef<HTMLInputElement | null>(null);
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());

  const playAuto = wantsAuto && !interacted.current && !reduce;

  const { ref: screenRef, onScreen } = useOnScreen<HTMLDivElement>();

  const commitCell = useCallback((id: string, next: EnrichColumnCell) => {
    setCells(prev => ({ ...prev, [id]: next }));
    const row = rowsRef.current.find(r => r.id === id);
    if (row) onCellChange?.(row, next);
  }, [onCellChange]);

  /** Roda uma única célula (retry ou run de linha), respeitando o mesmo protocolo. */
  const runRow = useCallback((row: EnrichColumnRow) => {
    if (runningRef.current) return;
    const ctrl = new AbortController();
    const attempt = (cellsRef.current[row.id]?.attempts ?? 0) + 1;
    commitCell(row.id, { status: "running", activity: "Looking it up…", attempts: attempt });
    void (async () => {
      try {
        const out = await enrich(row, {
          prompt: columnRef.current.prompt,
          column: columnRef.current,
          signal: ctrl.signal,
          attempt,
          setActivity: text => {
            const cur = cellsRef.current[row.id];
            if (cur?.status === "running") commitCell(row.id, { ...cur, activity: text });
          },
        });
        if (!ctrl.signal.aborted) commitCell(row.id, { status: "done", value: out.value, source: out.source, attempts: attempt });
      } catch (error) {
        if (ctrl.signal.aborted) return;
        commitCell(row.id, { status: "failed", error: error instanceof Error ? error.message : "Something went wrong", attempts: attempt });
      }
    })();
  }, [commitCell, enrich]);

  /** Um prompt desce todas as linhas: trabalhadores com defasagem de 140 ms e limite de concorrência. */
  const startRun = useCallback(async () => {
    if (runningRef.current) return;
    const rowsNow = rowsRef.current;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    runningRef.current = true;
    setRunning(true);
    const snapshot = { ...cellsRef.current };
    rowsNow.forEach(row => {
      const prev = snapshot[row.id];
      commitCell(row.id, { status: "queued", attempts: prev?.attempts ?? 0 });
    });
    setAnnounce(`${columnRef.current.name} running on ${rowsNow.length} rows${isSimulated ? ", simulated values" : ""}.`);
    let cursor = 0;
    const worker = async (index: number) => {
      if (index > 0) await sleep(140 * index, ctrl.signal).catch(() => undefined);
      for (;;) {
        if (ctrl.signal.aborted) return;
        const row = rowsNow[cursor];
        cursor += 1;
        if (!row) return;
        const attempt = (snapshot[row.id]?.attempts ?? 0) + 1;
        commitCell(row.id, { status: "running", activity: "Looking it up…", attempts: attempt });
        try {
          const out = await enrich(row, {
            prompt: columnRef.current.prompt,
            column: columnRef.current,
            signal: ctrl.signal,
            attempt,
            setActivity: text => {
              const cur = cellsRef.current[row.id];
              if (cur?.status === "running") commitCell(row.id, { ...cur, activity: text });
            },
          });
          if (ctrl.signal.aborted) return;
          commitCell(row.id, { status: "done", value: out.value, source: out.source, attempts: attempt });
        } catch (error) {
          if (ctrl.signal.aborted) return;
          commitCell(row.id, { status: "failed", error: error instanceof Error ? error.message : "Something went wrong", attempts: attempt });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.max(1, concurrency) }, (_, w) => worker(w)));
    if (ctrl.signal.aborted) {
      // Parou no meio: células que ainda não terminam voltam ao valor anterior quando houver.
      rowsNow.forEach(row => {
        const current = cellsRef.current[row.id];
        const prev = snapshot[row.id];
        if (current && (current.status === "queued" || current.status === "running")) {
          commitCell(row.id, prev && (prev.status === "done" || prev.status === "failed") ? prev : { status: "idle", attempts: current.attempts });
        }
      });
      setAnnounce("Run stopped.");
    } else {
      const finalCells = cellsRef.current;
      const done = rowsNow.filter(r => finalCells[r.id]?.status === "done").length;
      const failed = rowsNow.filter(r => finalCells[r.id]?.status === "failed").length;
      setAnnounce(`${done} of ${rowsNow.length} done${failed ? `, ${failed} failed` : ""}${isSimulated ? ". Values are simulated; nothing was sent." : "."}`);
      onRunComplete?.(finalCells);
    }
    runningRef.current = false;
    setRunning(false);
    abortRef.current = null;
  }, [commitCell, concurrency, enrich, isSimulated, onRunComplete]);

  const stopRun = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const openEditor = useCallback(() => {
    setDraft({ name: columnRef.current.name, prompt: columnRef.current.prompt });
    setEditing(true);
  }, []);

  const closeEditor = useCallback((focusPencil: boolean) => {
    setEditing(false);
    if (focusPencil) pencilRef.current?.focus();
  }, []);

  const saveColumn = useCallback(() => {
    const name = draft.name.trim() || columnRef.current.name;
    const prompt = draft.prompt.trim() || columnRef.current.prompt;
    const next = { name, prompt };
    columnRef.current = next;
    setColumn(next);
    closeEditor(true);
    onColumnChange?.(next);
    void startRun();
  }, [closeEditor, draft.name, draft.prompt, onColumnChange, startRun]);

  // Abrir o editor coloca o cursor no nome do campo, pronto para digitar.
  useEffect(() => {
    if (!editing) return;
    const id = requestAnimationFrame(() => editNameRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [editing]);

  // Auto-run uma vez ao entrar na tela se nenhuma célula tem valor; depois, só a simulação repete em loop.
  useEffect(() => {
    if (!wantsAuto || !onScreen || running) return;
    const hasValue = rowsRef.current.some(row => {
      const cell = cellsRef.current[row.id];
      return cell && (cell.status === "done" || cell.status === "failed");
    });
    if (!hasValue) { void startRun(); return; }
    if (!isSimulated) return;
    const t = window.setTimeout(() => { if (!interacted.current && !runningRef.current) void startRun(); }, 4200);
    return () => window.clearTimeout(t);
  }, [wantsAuto, onScreen, running, isSimulated, startRun]);

  const onCardPointer = useCallback(() => { if (!interacted.current) interacted.current = true; }, []);
  const onCardKey = useCallback((event: React.KeyboardEvent) => { onCardPointer(); }, [onCardPointer]);

  const doneCount = useMemo(() => rows.filter(row => cells[row.id]?.status === "done").length, [rows, cells]);
  const failedCount = useMemo(() => rows.filter(row => cells[row.id]?.status === "failed").length, [rows, cells]);
  const anyValue = useMemo(() => rows.some(row => {
    const cell = cells[row.id];
    return cell && (cell.status === "done" || cell.status === "failed");
  }), [rows, cells]);

  const buttonLabel = running ? "Stop" : anyValue ? "Re-run column" : "Run column";

  return (
    <div
      {...{ ref: screenRef }}
      className={[styles.card, className].filter(Boolean).join(" ")}
      onPointerDown={onCardPointer}
      onKeyDown={onCardKey}
    >
      <div className={styles.topbar}>
        <div className={styles.topLeft}>
          <h2 className={styles.topTitle}>{title}</h2>
          <span className={styles.topMeta}>{rows.length} rows{resolvedNote ? ` · ${resolvedNote}` : ""}</span>
        </div>
        <button type="button" className={styles.pill} onClick={() => { if (running) stopRun(); else void startRun(); }}>
          {running ? <Pause size={14} aria-hidden="true" /> : <RefreshCw size={14} aria-hidden="true" />}
          {buttonLabel}
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className={styles.companyHead}>Company</th>
            <th scope="col" className={styles.aiHead}>
              <div className={styles.aiHeadRow}>
                <Sparkle size={14} aria-hidden="true" className={styles.aiSpark} />
                <span className={styles.aiHeadText}>
                  <span className={styles.aiHeadName}>{column.name}</span>
                  <span className={styles.aiHeadPrompt}>{column.prompt}</span>
                </span>
                {editable ? (
                  <button ref={pencilRef} type="button" className={styles.iconGhost} aria-label={`Edit ${column.name} column`} onClick={openEditor}>
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              <AnimatePresence initial={false}>
                {editing ? (
                  <motion.div
                    key="editor"
                    className={styles.editorClip}
                    initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={reduce ? { duration: 0 } : { height: { type: "spring", stiffness: 420, damping: 40 }, opacity: { duration: motionTokens.duration.fast } }}
                  >
                    <div className={styles.editor}>
                      <label className={styles.editorField}>
                        <span className={styles.srOnly}>Column name</span>
                        <input
                          ref={editNameRef}
                          className={styles.editorInput}
                          defaultValue={draft.name}
                          onChange={event => setDraft(d => ({ ...d, name: event.target.value }))}
                          onKeyDown={event => {
                            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") saveColumn();
                            if (event.key === "Escape") closeEditor(true);
                          }}
                        />
                      </label>
                      <label className={styles.editorField}>
                        <span className={styles.srOnly}>Column prompt</span>
                        <textarea
                          className={styles.editorArea}
                          defaultValue={draft.prompt}
                          onChange={event => setDraft(d => ({ ...d, prompt: event.target.value }))}
                          onKeyDown={event => {
                            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") saveColumn();
                            if (event.key === "Escape") closeEditor(true);
                          }}
                        />
                      </label>
                      <div className={styles.editorActions}>
                        <button type="button" className={styles.ghostBtn} onClick={() => closeEditor(true)}>Cancel</button>
                        <button type="button" className={styles.smallPrimary} onClick={saveColumn}>Save &amp; run</button>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const cell = cells[row.id] ?? { status: "idle" as const, attempts: 0 };
            const cellKey = `${cell.status}:${cell.attempts}`;
            return (
              <tr key={row.id} ref={node => { if (node) rowRefs.current.set(row.id, node); else rowRefs.current.delete(row.id); }}>
                <th scope="row" className={styles.companyCell}>
                  <span className={styles.logoWrap}>{row.logo ?? <InitialsLogo name={row.name} />}</span>
                  <span className={styles.companyName}>{row.name}</span>
                  {row.domain ? <span className={styles.domain}>{row.domain}</span> : null}
                </th>
                <td className={styles.aiCell}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={cellKey}
                      className={styles.cellLayer}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 2 }}
                      animate={crossfadeIn}
                      exit={crossfadeOut}
                    >
                      {cell.status === "idle" ? (
                        <><Hourglass size={13} aria-hidden="true" className={styles.dimIcon} /><span className={styles.cellMuted}>Idle</span></>
                      ) : null}
                      {cell.status === "queued" ? (
                        <><Hourglass size={13} aria-hidden="true" className={styles.dimIcon} /><span className={styles.cellMuted}>Queued</span></>
                      ) : null}
                      {cell.status === "running" ? (
                        <><LoaderCircle size={13} aria-hidden="true" className={styles.spin} /><span className={styles.shimmer}>{cell.activity ?? "Looking it up…"}</span></>
                      ) : null}
                      {cell.status === "done" ? (
                        <>
                          <svg className={styles.tick} viewBox="0 0 16 16" aria-hidden="true">
                            <motion.path
                              d="M3 8.6l3.2 3.2L13 4.6"
                              fill="none"
                              stroke="var(--success)"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={reduce ? false : { pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={reduce ? { duration: 0 } : { duration: 0.24, ease: [...motionTokens.ease.enter] }}
                            />
                          </svg>
                          <span className={styles.value} title={cell.value}>{cell.value}</span>
                          {cell.source ? (
                            <a
                              className={styles.sourceLink}
                              href={cell.source.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${cell.source.label} (opens a new tab)`}
                            >
                              <span className={styles.sourceLabel}>{cell.source.label}</span>
                              <ArrowUpRight size={11} aria-hidden="true" />
                            </a>
                          ) : null}
                        </>
                      ) : null}
                      {cell.status === "failed" ? (
                        <>
                          <CircleSlash size={14} aria-hidden="true" className={styles.failIcon} />
                          <span className={styles.failLabel}>Failed</span>
                          {cell.error ? <span className={styles.failReason}>{cell.error}</span> : null}
                        </>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                  {cell.status === "failed" ? (
                    <button type="button" className={`${styles.rowControl} ${styles.rowRetry}`} aria-label={`Retry ${row.name}`} onClick={() => runRow(row)}>
                      <RefreshCw size={12} aria-hidden="true" /> Retry
                    </button>
                  ) : null}
                  {cell.status !== "failed" && cell.status !== "idle" ? (
                    <button type="button" className={styles.rowControl} aria-label={`Run ${row.name}`} onClick={() => runRow(row)}>
                      <RefreshCw size={12} aria-hidden="true" />
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {model ? (
        <div className={styles.footer}>
          <span className={styles.modelCredit}>
            {model.mark}<span>{model.name}{model.detail ? <span className={styles.modelDetail}> · {model.detail}</span> : null}</span>
          </span>
          <span className={styles.tally}>
            <span>{doneCount} of {rows.length} done</span>
            {failedCount > 0 ? (
              <span className={styles.failedTally}><CircleSlash size={12} aria-hidden="true" /> {failedCount} failed</span>
            ) : null}
          </span>
        </div>
      ) : null}

      <span className={styles.srOnly} role="status" aria-live="polite">{announce}</span>
    </div>
  );
}

export default EnrichColumn;

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
