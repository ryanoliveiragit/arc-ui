"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, Check, ChevronDown, Copy, Database, GitBranch, LoaderCircle, Sparkles, Square, TriangleAlert } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./ask-your-data.module.css";

export type AskYourDataView = "bar" | "line" | "table";

export interface AskYourDataSeries {
  id: string;
  label: string;
  /** Um valor por categoria. */
  values: number[];
  /** Padrão: --series-1 a --series-4 na ordem da série. */
  color?: string;
}

export interface AskYourDataResult {
  title: string;
  subtitle?: string;
  categories: string[];
  series: AskYourDataSeries[];
  /** Padrão true: as séries somam (barras empilhadas, totais no legenda/tooltip). */
  stacked?: boolean;
  legendValue?: "sum" | "last" | "none";
  /** Visão aberta para este resultado. */
  chart?: AskYourDataView;
  categoryLabel?: string;
  formatValue?: (value: number) => string;
  /** Uma ou duas frases lendo o gráfico; entra em stream sob ele. */
  insight?: string;
  /** Linhas que a consulta devolveu ("48 rows"). */
  rowCount?: number;
  durationMs?: number;
}

export interface AskYourDataProps {
  question?: string;
  defaultQuestion?: string;
  onQuestionChange?: (question: string) => void;
  placeholder?: string;
  source?: { name: string; dialect?: string; mark?: React.ReactNode };
  suggestions?: string[];
  generateSql?: (question: string, details: { signal: AbortSignal; source: { name: string; dialect?: string } }) =>
    Promise<string | AsyncIterable<string>> | string | AsyncIterable<string>;
  runQuery?: (sql: string, details: { signal: AbortSignal; onProgress: (rowsScanned: number, totalRows?: number) => void; question: string }) =>
    Promise<AskYourDataResult>;
  onResult?: (result: AskYourDataResult, details: { question: string; sql: string }) => void;
  onError?: (error: unknown, details: { question: string; stage: "sql" | "query" }) => void;
  chart?: AskYourDataView;
  defaultChart?: AskYourDataView;
  onChartChange?: (chart: AskYourDataView) => void;
  autoRun?: boolean;
  keepSqlOpen?: boolean;
  className?: string;
}

const SAMPLE_SQL = `-- Weekly signups by plan since August
WITH weekly AS (
  SELECT date_trunc('week', created_at)::date AS week,
         plan,
         COUNT(*) AS signups
  FROM signups
  WHERE created_at >= DATE '2025-08-03'
    AND created_at < DATE '2025-10-26'
)
SELECT week, plan, signups
FROM weekly
ORDER BY week;`;

const WEEKS = ["Aug 3", "Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21", "Sep 28", "Oct 5", "Oct 12", "Oct 19"];
// Sums per series: Free 701 · Pro 378 · Team 165 · Enterprise 40 → 1,284 signups.
const SAMPLE_RESULT: AskYourDataResult = {
  title: "Weekly signups by plan",
  subtitle: "Aug 3 to Oct 25 · 1,284 signups",
  categories: WEEKS,
  series: [
    { id: "free", label: "Free", values: [61, 60, 59, 61, 48, 56, 62, 60, 60, 61, 58, 55] },
    { id: "pro", label: "Pro", values: [24, 23, 25, 27, 25, 31, 34, 35, 37, 37, 40, 40] },
    { id: "team", label: "Team", values: [9, 10, 11, 13, 8, 13, 14, 15, 16, 17, 19, 20] },
    { id: "enterprise", label: "Enterprise", values: [2, 2, 2, 3, 2, 4, 4, 4, 4, 4, 5, 4] },
  ],
  stacked: true,
  categoryLabel: "Week",
  insight: "Pro is up 67% since August, from 24 to 40 a week, and Team more than doubled. Free held flat near 58 a week, so most of the growth is coming from paid plans.",
  rowCount: 48,
  durationMs: 214,
};

const DEFAULT_SUGGESTIONS = [
  "Weekly signups by plan since August",
  "Top 5 countries by revenue this quarter",
  "MRR by plan for the last 12 weeks",
];

/** Modelo de exemplo: escreve o SQL e responde com dados simulados (doc: sem generateSql/runQuery). */
const simulatedGenerateSql = async (_question: string, { signal }: { signal: AbortSignal }) => {
  await sleepSimulated(420, signal);
  return SAMPLE_SQL;
};

/** Escaneia linhas em passos (~1,5 s) chamando onProgress e devolve a amostra agrupada. */
const simulatedRunQuery = async (_sql: string, { signal, onProgress }: { signal: AbortSignal; onProgress: (n: number, total?: number) => void }): Promise<AskYourDataResult> => {
  const total = 1284;
  let scanned = 0;
  while (scanned < total) {
    await sleepSimulated(90, signal);
    scanned = Math.min(total, scanned + 60 + Math.round(Math.random() * 80));
    onProgress(scanned, total);
  }
  await sleepSimulated(160, signal);
  return SAMPLE_RESULT;
};

function sleepSimulated(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    const id = window.setTimeout(() => (signal.aborted ? reject(new DOMException("Aborted", "AbortError")) : resolve()), ms);
    signal.addEventListener("abort", () => { window.clearTimeout(id); reject(new DOMException("Aborted", "AbortError")); }, { once: true });
  });
}

/* ---------- tokenização de SQL: uma passada de regex, memoizada por consulta ---------- */

interface SqlToken { text: string; kind: "comment" | "keyword" | "type" | "string" | "number" | "function" | "ident" | "punct" }

const SQL_RE = /(--[^\n]*)|(\b(?:WITH|RECURSIVE|SELECT|FROM|WHERE|AND|OR|NOT|IN|IS|NULL|CASE|WHEN|THEN|ELSE|END|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|JOIN|LEFT|RIGHT|INNER|OUTER|ON|BY|AS|ASC|DESC|DISTINCT|UNION|ALL|BETWEEN|LIKE|EXISTS)\b)|(\bDATE\b)|('[^']*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()|([A-Za-z_][A-Za-z0-9_]*|\(\)|::|[(),;.<>*/+=])/gi;

function tokenizeSql(sql: string): SqlToken[] {
  const tokens: SqlToken[] = [];
  let last = 0;
  for (const match of sql.matchAll(SQL_RE)) {
    const index = match.index ?? 0;
    if (index > last) tokens.push({ text: sql.slice(last, index), kind: "ident" });
    const [, comment, keyword, type, str, num, fn, plain] = match;
    if (comment != null) tokens.push({ text: comment, kind: "comment" });
    else if (keyword != null) tokens.push({ text: keyword, kind: "keyword" });
    else if (type != null) tokens.push({ text: type, kind: "type" });
    else if (str != null) tokens.push({ text: str, kind: "string" });
    else if (num != null) tokens.push({ text: num, kind: "number" });
    else if (fn != null) tokens.push({ text: fn, kind: "function" });
    else if (plain != null) tokens.push({ text: plain, kind: /\d/.test(plain) ? "number" : /[(),;.<>*/+=]/.test(plain) ? "punct" : "ident" });
    last = index + (match[0]?.length ?? 0);
  }
  if (last < sql.length) tokens.push({ text: sql.slice(last), kind: "ident" });
  return tokens;
}

/** Divide o SQL em palavras mantendo os espaços (o stream revela 4 por tick). */
function wordsOf(sql: string): string[] {
  return sql.match(/\S+\s*|\s+/g) ?? [];
}

const fmtInt = (value: number) => value.toLocaleString("en-US");
const fmtMs = (ms: number) => (ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })}s`);

type Phase = "idle" | "writing" | "running" | "done" | "error";

const SERIES_VARS = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)"];
const seriesVar = (index: number): string => SERIES_VARS[index % 4] ?? "var(--series-1)";

export function AskYourData({
  question: controlledQuestion,
  defaultQuestion = "Weekly signups by plan since August",
  onQuestionChange,
  placeholder = "Ask a question about your data",
  source = { name: "analytics", dialect: "PostgreSQL" },
  suggestions = DEFAULT_SUGGESTIONS,
  generateSql,
  runQuery,
  onResult,
  onError,
  chart: controlledChart,
  defaultChart = "bar",
  onChartChange,
  autoRun,
  keepSqlOpen = false,
  className,
}: AskYourDataProps) {
  const reduce = useReducedMotion();
  const wired = Boolean(generateSql || runQuery);
  const wantsAuto = autoRun ?? !wired;
  const genSql = generateSql ?? simulatedGenerateSql;
  const doRun = runQuery ?? simulatedRunQuery;

  // O demo monta já no estado final legível (convenção do lote): resultado pronto, SQL completo, painel fechado.
  const [questionText, setQuestionText] = useState(controlledQuestion ?? (wantsAuto ? defaultQuestion : ""));
  const [phase, setPhase] = useState<Phase>(wantsAuto ? "done" : "idle");
  const [result, setResult] = useState<AskYourDataResult | null>(wantsAuto ? SAMPLE_RESULT : null);
  const [sqlText, setSqlText] = useState(wantsAuto ? SAMPLE_SQL : "");
  const [shownWords, setShownWords] = useState<number>(() => wordsOf(SAMPLE_SQL).length);
  const [sqlOpen, setSqlOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState<number | null>(null);
  const [view, setView] = useState<AskYourDataView>("bar");
  const [insightWords, setInsightWords] = useState(() => (SAMPLE_RESULT.insight ?? "").split(/(?<=\s)/).filter(Boolean).length);
  const [copied, setCopied] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [chartKey, setChartKey] = useState(0);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timers = useRef<Set<number>>(new Set());
  const interacted = useRef(false);
  const userStarted = useRef(false);
  const sqlTouched = useRef(false);
  const lastQuestion = useRef(defaultQuestion);
  const questionRef = useRef(questionText);
  questionRef.current = questionText;

  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => setOnScreen(entry.isIntersecting)), { threshold: .35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const onScreenRef = useRef(onScreen);
  onScreenRef.current = onScreen;
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => { timers.current.delete(id); fn(); }, ms);
    timers.current.add(id);
    return id;
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(id => window.clearTimeout(id));
    timers.current.clear();
  }, []);

  /** Pausa automaticamente fora da tela: só conta o tempo enquanto o cartão está visível. */
  const pauseableSleep = useCallback((ms: number, signal: AbortSignal) => new Promise<void>((resolve, reject) => {
    if (reduceRef.current) { void ms; resolve(); return; }
    let waited = 0;
    const id = window.setInterval(() => {
      if (signal.aborted) { window.clearInterval(id); timers.current.delete(id); reject(new DOMException("Aborted", "AbortError")); return; }
      if (onScreenRef.current) waited += 40;
      if (waited >= ms) { window.clearInterval(id); timers.current.delete(id); resolve(); }
    }, 40);
    timers.current.add(id);
  }), []);

  useEffect(() => () => { clearTimers(); abortRef.current?.abort(); }, [clearTimers]);

  const sqlWords = useMemo(() => wordsOf(sqlText), [sqlText]);
  const revealedSql = sqlText && sqlWords.length && shownWords >= sqlWords.length ? sqlText : sqlWords.slice(0, Math.max(0, shownWords)).join("");
  const tokens = useMemo(() => tokenizeSql(revealedSql), [revealedSql]);
  const fullTokens = useMemo(() => tokenizeSql(sqlText), [sqlText]);
  const insightFull = result?.insight ?? "";
  const insightTokensList = useMemo(() => insightFull.split(/(?<=\s)/).filter(Boolean), [insightFull]);
  const insightShown = phase === "done" && (reduce ? insightTokensList.length : insightWords >= insightTokensList.length) ? insightFull : insightTokensList.slice(0, insightWords).join("");

  const busy = phase === "writing" || phase === "running";
  const effectiveView = controlledChart ?? view;
  const stacked = result?.stacked !== false;
  const formatValue = result?.formatValue ?? fmtInt;

  const stopRun = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearTimers();
    setPhase(prev => (prev === "writing" || prev === "running" ? "idle" : prev));
    setScanned(null);
    setAnnounce("Stopped.");
  }, [clearTimers]);

  const startRun = useCallback(async (q: string) => {
    userStarted.current = true;
    interacted.current = true;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;
    lastQuestion.current = q;
    clearTimers();
    let stage: "sql" | "query" = "sql";
    setError(null);
    setScanned(null);
    setResult(null);
    setInsightWords(0);
    setChartKey(key => key + 1);
    setSqlText("");
    setShownWords(0);
    setSqlOpen(true);
    setPhase("writing");
    setAnnounce(`Writing SQL for “${q}”…`);

    try {
      const produced = await genSql(q, { signal, source });
      let full = "";
      if (typeof produced === "string") full = produced;
      else if (produced && typeof (produced as AsyncIterable<string>)[Symbol.asyncIterator] === "function") {
        for await (const chunk of produced as AsyncIterable<string>) { if (signal.aborted) break; full += chunk; }
      }
      if (signal.aborted) return;
      setSqlText(full);
      const allWords = wordsOf(full);
      if (reduceRef.current) {
        setShownWords(allWords.length);
      } else {
        setShownWords(0);
        for (let i = 4; i <= allWords.length; i += 4) {
          await pauseableSleep(34, signal);
          setShownWords(i);
        }
      }
      await pauseableSleep(300, signal);
      stage = "query";
      setPhase("running");
      if (!keepSqlOpen && !sqlTouched.current) setSqlOpen(false);
      setAnnounce("Running query…");
      const onProgress = (rows: number, _total?: number) => setScanned(rows);
      const done = await doRun(full, { signal, onProgress, question: q });
      if (signal.aborted) return;
      setResult(done);
      setView(done.chart ?? defaultChart);
      setPhase("done");
      setInsightWords(reduceRef.current ? Infinity : 0);
      setAnnounce(`${done.title}. ${fmtInt(done.categories.length * done.series.length)} rows${wired ? "" : ", simulated with sample data, nothing was queried."}`);
      onResult?.(done, { question: q, sql: full });
      // Stream do insight: quatro palavras por tick, altura final já reservada.
      const words = (done.insight ?? "").split(/(?<=\s)/).filter(Boolean);
      if (!reduceRef.current) {
        for (let i = 4; i <= words.length; i += 4) {
          await pauseableSleep(70, signal);
          if (abortRef.current !== controller) break;
          setInsightWords(i);
        }
      }
    } catch (err) {
      if (signal.aborted || abortRef.current !== controller) return;
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setPhase("error");
      setAnnounce(`Query failed. ${message}`);
      onError?.(err, { question: q, stage });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimers, defaultChart, doRun, genSql, keepSqlOpen, onError, onResult, pauseableSleep, source, wired]);

  /** Autoplay do modo demo: segura no resultado e roda a sequência de novo. Para para sempre no primeiro toque. */
  const playAuto = wantsAuto && !reduce;
  useEffect(() => {
    if (!playAuto || !onScreen || phase !== "done" || userStarted.current || interacted.current) return;
    const id = later(() => {
      if (userStarted.current || interacted.current || reduceRef.current) return;
      setPhase("idle");
      startRun(defaultQuestion);
    }, 4200);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playAuto, onScreen, phase, later, startRun, defaultQuestion]);

  const setQuestion = useCallback((value: string) => {
    setQuestionText(value);
    onQuestionChange?.(value);
  }, [onQuestionChange]);

  const onFieldKey = useCallback((event: React.KeyboardEvent) => {
    interacted.current = true;
    if (event.key === "Enter") {
      event.preventDefault();
      if (busy) stopRun();
      else if (questionRef.current.trim()) void startRun(questionRef.current.trim());
    } else if (event.key === "Escape" && busy) {
      stopRun();
    }
  }, [busy, startRun, stopRun]);

  const toggleSql = useCallback(() => {
    sqlTouched.current = true;
    setSqlOpen(open => !open);
  }, []);

  const copySql = useCallback(() => {
    if (!sqlText || typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(sqlText).then(() => {
      setCopied(true);
      later(() => setCopied(false), 1600);
    }).catch(() => undefined);
  }, [sqlText, later]);

  const metaText = (() => {
    if (!sqlText && phase !== "done") return "";
    const lines = revealedSql ? revealedSql.split("\n").length : 0;
    if ((phase === "writing" || phase === "running") && !result) return `${source.dialect ?? "SQL"} · ${lines} lines`;
    const parts = [source.dialect ?? "SQL"];
    if (result?.rowCount != null) parts.push(`${result.rowCount} rows`);
    if (result?.durationMs != null) parts.push(fmtMs(result.durationMs));
    return parts.join(" · ");
  })();

  const sqlStatusLabel = phase === "writing" ? "Writing SQL…" : phase === "running" ? "Running" : phase === "error" ? "Failed" : sqlText ? "Ready" : "";

  /* ---------- leitura do gráfico (hover/touch/teclado) ---------- */
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [plotWidth, setPlotWidth] = useState(0);
  useEffect(() => {
    const node = chartRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width;
      if (width != null) setPlotWidth(width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [chartKey, effectiveView, phase]);

  const onChartKey = useCallback((event: React.KeyboardEvent) => {
    if (!result) return;
    const count = result.categories.length;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(prev => {
        if (event.key === "Home") return 0;
        if (event.key === "End") return count - 1;
        const delta = event.key === "ArrowRight" ? 1 : -1;
        return prev == null ? (delta > 0 ? 0 : count - 1) : Math.min(count - 1, Math.max(0, prev + delta));
      });
    } else if (event.key === "Escape") {
      setActiveIndex(null);
    }
  }, [result]);

  /** Traduz a posição do ponteiro sobre o gráfico em índice de categoria (mouse, tap ou arraste de toque). */
  const onChartPointer = useCallback((event: React.PointerEvent) => {
    const node = chartRef.current;
    if (!node || !result) return;
    const rect = node.getBoundingClientRect();
    const slot = (rect.width - MARGIN_LEFT - MARGIN_RIGHT) / result.categories.length;
    if (slot <= 0) return;
    const rel = event.clientX - rect.left - MARGIN_LEFT;
    if (rel < -6 || rel > rect.width - MARGIN_LEFT - MARGIN_RIGHT + 6) { setActiveIndex(null); return; }
    setActiveIndex(Math.min(result.categories.length - 1, Math.max(0, Math.floor(rel / slot))));
  }, [result]);

  const readoutIndex = activeIndex;
  let readout: { left: number; top: number } | null = null;
  let readoutData: { category: string; rows: { color: string; label: string; value: string }[]; total?: string } | null = null;
  if (result && readoutIndex != null && plotWidth > 0) {
    const category = result.categories[readoutIndex];
    const rows = result.series.map((series, index) => ({
      color: series.color ?? seriesVar(index),
      label: series.label,
      value: formatValue(series.values[readoutIndex] ?? 0),
    }));
    const total = stacked ? formatValue(result.series.reduce((acc, series) => acc + (series.values[readoutIndex] ?? 0), 0)) : undefined;
    const slot = (plotWidth - MARGIN_LEFT - MARGIN_RIGHT) / result.categories.length;
    const centerX = MARGIN_LEFT + slot * readoutIndex + slot / 2;
    readout = { left: Math.min(plotWidth - 118, Math.max(118, centerX)), top: 34 };
    readoutData = { category: category ?? "", rows, total };
  }

  const announceReadout = readoutData ? `${readoutData.category}: ${readoutData.rows.map(row => `${row.label} ${row.value}`).join(", ")}${readoutData.total ? `, total ${readoutData.total}` : ""}` : "";

  return (
    <div
      ref={cardRef}
      className={[styles.card, className].filter(Boolean).join(" ")}
      role="region"
      aria-label="Ask your data"
      onPointerDown={() => { interacted.current = true; }}
    >
      {/* campo de pergunta */}
      <form
        className={styles.question}
        onSubmit={event => { event.preventDefault(); if (busy) stopRun(); else if (questionText.trim()) void startRun(questionText.trim()); }}
      >
        <span className={styles.source}>
          {source.mark ?? <Database size={15} aria-hidden="true" />}
          <span className={styles.sourceName}>{source.name}</span>
        </span>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          inputMode="search"
          aria-label="Question"
          placeholder={placeholder}
          value={controlledQuestion ?? questionText}
          onChange={event => setQuestion(event.target.value)}
          onKeyDown={onFieldKey}
        />
        <button
          type="submit"
          className={styles.askBtn}
          aria-label={busy ? "Stop query" : "Ask"}
        >
          {busy ? <Square size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" /> : <ArrowUp size={16} aria-hidden="true" />}
        </button>
      </form>

      {/* linha do SQL gerado */}
      {(sqlText || phase === "writing" || phase === "error") && (
        <div className={styles.sqlRow}>
          <button
            type="button"
            className={styles.sqlToggle}
            onClick={toggleSql}
            aria-expanded={sqlOpen}
            aria-controls="ask-your-data-sql-panel"
            aria-label={`Generated SQL, ${metaText}`}
          >
            <span className={styles.sqlMark}><GitBranch size={12} aria-hidden="true" /></span>
            <span className={styles.sqlTitle}>Generated SQL</span>
            <span className={styles.sqlMeta}>{metaText}</span>
            <span className={styles.sqlStatus} aria-hidden="true">
              {phase === "writing" || phase === "running"
                ? <LoaderCircle size={14} className={reduce ? undefined : styles.spin} />
                : phase === "error"
                  ? <TriangleAlert size={14} className={styles.sqlFail} />
                  : sqlText
                    ? <Check size={14} className={styles.sqlOk} />
                    : null}
            </span>
            <span className={styles.sqlActions} onClick={event => event.stopPropagation()}>
              <span
                className={styles.iconBtn}
                role="button"
                tabIndex={0}
                aria-label="Copy SQL"
                onClick={copySql}
                onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); copySql(); } }}
              >
                {copied ? <Check size={13} className={styles.sqlOk} /> : <Copy size={13} />}
              </span>
              <ChevronDown size={15} className={[styles.chevron, sqlOpen ? styles.chevronOpen : ""].filter(Boolean).join(" ")} />
            </span>
          </button>
          <AnimatePresence initial={false}>
            {sqlOpen && (
              <motion.div
                key="panel"
                id="ask-your-data-sql-panel"
                className={styles.sqlPanelWrap}
                initial={{ gridTemplateRows: "0fr" }}
                animate={{ gridTemplateRows: "1fr" }}
                exit={{ gridTemplateRows: "0fr" }}
                transition={reduce ? { duration: 0 } : { ...motionTokens.spring.smooth, duration: .3 }}
              >
                <div className={styles.sqlPanelClip}>
                  <pre className={styles.sqlWell} tabIndex={0} aria-label="Generated SQL">
                    <span className={styles.sqlGhost} aria-hidden="true">{fullTokens.map((token, index) => <span key={index} className={styles[`tok_${token.kind}`]}>{token.text}</span>)}</span>
                    <span className={styles.sqlLive}>
                      {tokens.map((token, index) => <span key={index} className={styles[`tok_${token.kind}`]}>{token.text}</span>)}
                      {(phase === "writing") && !reduce ? <span className={styles.caret} aria-hidden="true" /> : null}
                    </span>
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* estágio: sugestões, execução ou resultado */}
      <div className={styles.stage} aria-busy={busy || undefined}>
        {phase === "idle" && !result ? (
          suggestions.length ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyHint}>Ask anything about <strong>{source.name}</strong>, or try one of these:</p>
              <div className={styles.suggestions}>
                {suggestions.map(suggestion => (
                  <button key={suggestion} type="button" className={styles.chip} onClick={() => { setQuestion(suggestion); void startRun(suggestion); }}>
                    <Sparkles size={13} aria-hidden="true" />{suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className={styles.emptyHint}>Ask a question about <strong>{source.name}</strong> to see it here.</p>
          )
        ) : null}

        {busy ? (
          <div className={styles.running}>
            <div className={styles.runningTop}>
              <LoaderCircle size={15} className={reduce ? undefined : styles.spin} aria-hidden="true" />
              <span className={styles.runningTitle}>Running query</span>
              <span className={styles.runningCount} aria-hidden="true">· {scanned != null ? `${fmtInt(scanned)} rows` : "…"}</span>
            </div>
            <p className={styles.runningSub}>Read only on {source.name}</p>
            <SkeletonBars result={result ?? SAMPLE_RESULT} />
          </div>
        ) : null}

        {phase === "error" ? (
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}><TriangleAlert size={16} /></span>
            <div className={styles.errorBody}>
              <p className={styles.errorMsg}>{error}</p>
              <button type="button" className={styles.tryAgain} onClick={() => void startRun(lastQuestion.current)}>Try again</button>
            </div>
          </div>
        ) : null}

        {phase === "done" && result ? (
          <>
            <div className={styles.resultHead}>
              <div className={styles.resultTitles}>
                <h3 className={styles.resultTitle}>{result.title}</h3>
                {result.subtitle ? <p className={styles.resultSub}>{result.subtitle}</p> : null}
              </div>
              <div className={styles.seg} role="group" aria-label="Chart view">
                {(["bar", "line", "table"] as const).map(option => (
                  <button
                    key={option}
                    type="button"
                    className={styles.segBtn}
                    aria-pressed={effectiveView === option}
                    onClick={() => { const next = controlledChart ?? option; setView(next); onChartChange?.(next); }}
                  >
                    {option === "bar" ? "Bar" : option === "line" ? "Line" : "Table"}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.legend} aria-hidden="true">
              {result.series.map((series, index) => {
                const legendMode = result.legendValue ?? (stacked ? "sum" : "none");
                const value = legendMode === "none" ? null : legendMode === "sum"
                  ? formatValue(series.values.reduce((acc, value) => acc + value, 0))
                  : formatValue(series.values[series.values.length - 1] ?? 0);
                return (
                  <span key={series.id} className={styles.legendItem}>
                    <span className={styles.legendSwatch} style={{ background: series.color ?? seriesVar(index) }} />
                    <span>{series.label}</span>
                    {value != null ? <strong>{value}</strong> : null}
                  </span>
                );
              })}
            </div>

            <div
              ref={chartRef}
              className={styles.viewBox}
              role="group"
              tabIndex={0}
              aria-label={`${result.title} — use arrow keys to read values`}
              onKeyDown={onChartKey}
              onPointerMove={onChartPointer}
              onPointerLeave={() => setActiveIndex(null)}
            >
              {effectiveView === "table" ? (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th scope="col">{result.categoryLabel ?? "Category"}</th>
                        {result.series.map(series => <th key={series.id} scope="col">{series.label}</th>)}
                        {stacked ? <th scope="col">Total</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {result.categories.map((category, index) => {
                        const rowTotal = result.series.reduce((acc, series) => acc + (series.values[index] ?? 0), 0);
                        return (
                          <tr key={category}>
                            <th scope="row">{category}</th>
                            {result.series.map(series => <td key={series.id}>{formatValue(series.values[index] ?? 0)}</td>)}
                            {stacked ? <td>{formatValue(rowTotal)}</td> : null}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  <motion.div
                    key={effectiveView}
                    className={styles.viewLayer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: reduce ? 0 : motionTokens.duration.fast } }}
                    exit={{ opacity: 0, transition: { duration: reduce ? 0 : motionTokens.duration.instant } }}
                  >
                    {effectiveView === "line"
                      ? <LineChartView result={result} width={plotWidth} formatValue={formatValue} reduce={reduce ?? false} />
                      : <BarChartView result={result} width={plotWidth} formatValue={formatValue} reduce={reduce ?? false} activeIndex={readoutIndex} stacked={stacked} />}
                  </motion.div>
                </AnimatePresence>
              )}
              {readout && readoutData ? (
                <div className={styles.readout} style={{ left: readout.left, top: readout.top }} role="presentation">
                  <p className={styles.readoutCat}>{readoutData.category}</p>
                  {readoutData.rows.map(row => (
                    <p key={row.label} className={styles.readoutRow}>
                      <span className={styles.legendSwatch} style={{ background: row.color }} />
                      <span>{row.label}</span>
                      <strong>{row.value}</strong>
                    </p>
                  ))}
                  {readoutData.total != null ? <p className={[styles.readoutRow, styles.readoutTotal].join(" ")}><span>Total</span><strong>{readoutData.total}</strong></p> : null}
                </div>
              ) : null}
              <span className={styles.srOnly} aria-live="polite">{announceReadout}</span>
            </div>

            {insightFull ? (
              <p className={styles.insight}>
                <Sparkles size={13} aria-hidden="true" className={styles.insightIcon} />
                <span className={styles.insightText}>
                  <span className={styles.insightGhost} aria-hidden="true">{insightFull}</span>
                  <span className={styles.insightLive}>{insightShown}{insightShown.length < insightFull.length && !reduce ? <span className={styles.caret} aria-hidden="true" /> : null}</span>
                </span>
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      <span className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</span>
    </div>
  );
}

/* ---------- barras empilhadas (SVG puro, sem lib de gráfico) ---------- */

interface ChartGeometryProps {
  result: AskYourDataResult;
  width: number;
  formatValue: (value: number) => string;
  reduce?: boolean;
  activeIndex?: number | null;
  stacked?: boolean;
}

const PLOT_HEIGHT = 216;
const MARGIN_LEFT = 42;
const MARGIN_RIGHT = 8;
const MARGIN_TOP = 10;
const AXIS_HEIGHT = 22;

/** Passo do eixo Y em divisões redondas: o topo fica em 3 passos (ex.: 0/50/100/150 para máx 122). */
function axisStep(values: number[]): number {
  const max = Math.max(1, ...values);
  const magnitude = 10 ** Math.floor(Math.log10(max / 3));
  for (const m of [1, 2, 2.5, 5, 10]) {
    const step = m * magnitude;
    if (step * 3 >= max) return step;
  }
  return 10 * magnitude;
}

function geometry(result: AskYourDataResult, width: number) {
  const n = result.categories.length;
  const plotW = Math.max(60, width - MARGIN_LEFT - MARGIN_RIGHT);
  const stacked = result.stacked !== false;
  const perCategory = result.categories.map((_, index) => result.series.reduce((acc, series) => acc + (series.values[index] ?? 0), 0));
  const maxValues = stacked ? perCategory : result.series.flatMap(series => series.values);
  const step = axisStep(maxValues.length ? maxValues : [1]);
  const yMax = step * 3;
  const ticks = [0, step, 2 * step, yMax];
  const slot = plotW / n;
  const barW = Math.min(slot * .62, 34);
  const x = (index: number) => MARGIN_LEFT + slot * index;
  const y = (value: number) => MARGIN_TOP + PLOT_HEIGHT * (1 - value / yMax);
  return { n, plotW, stacked, perCategory, yMax, ticks, slot, barW, x, y };
}

function XAxis({ result, width }: { result: AskYourDataResult; width: number }) {
  const { slot, x } = geometry(result, width);
  const every = Math.max(1, Math.ceil(46 / slot));
  return (
    <g>
      {result.categories.map((label, index) => (
        <text
          key={label}
          x={x(index) + slot / 2}
          y={MARGIN_TOP + PLOT_HEIGHT + 16}
          textAnchor="middle"
          className={styles.axisText}
          opacity={index % every === 0 ? 1 : 0}
        >
          {label}
        </text>
      ))}
    </g>
  );
}

function YAxis({ result, width, formatValue }: { result: AskYourDataResult; width: number; formatValue: (value: number) => string }) {
  const { ticks, y } = geometry(result, width);
  return (
    <g>
      {ticks.map(tick => (
        <g key={tick}>
          <text x={MARGIN_LEFT - 8} y={y(tick) + 4} textAnchor="end" className={styles.axisText}>{formatValue(Math.round(tick * 100) / 100)}</text>
          <line x1={MARGIN_LEFT} x2={width - MARGIN_RIGHT} y1={y(tick)} y2={y(tick)} className={tick === 0 ? styles.baseline : styles.gridline} vectorEffect="non-scaling-stroke" />
        </g>
      ))}
    </g>
  );
}

function BarChartView({ result, width, formatValue, reduce, activeIndex, stacked }: ChartGeometryProps) {
  if (!width) return <svg className={styles.chartSvg} width={1} height={1} aria-hidden="true" />;
  const geo = geometry(result, width);
  const staggerStep = Math.min(.015, .18 / geo.n);
  return (
    <svg className={styles.chartSvg} viewBox={`0 0 ${Math.round(width)} ${PLOT_HEIGHT + MARGIN_TOP + AXIS_HEIGHT}`} width={width} height={PLOT_HEIGHT + MARGIN_TOP + AXIS_HEIGHT} role="img" aria-label="Stacked bar chart">
      <YAxis result={result} width={width} formatValue={formatValue} />
      {activeIndex != null ? (
        <rect x={geo.x(activeIndex)} y={MARGIN_TOP} width={geo.slot} height={PLOT_HEIGHT} className={styles.activeBand} />
      ) : null}
      {result.categories.map((_, index) => {
        let cursor = 0;
        const segments = result.series.map((series, seriesIndex) => {
          const value = series.values[index] ?? 0;
          const base = stacked ? cursor : 0;
          cursor += value;
          const top = geo.y(base + value);
          const bottom = geo.y(base);
          return { seriesIndex, value, top, bottom, height: bottom - top, topSegment: stacked ? seriesIndex === result.series.length - 1 : seriesIndex === 0 };
        }).filter(segment => segment.height > 0);
        const cx = geo.x(index) + (geo.slot - geo.barW) / 2;
        return (
          <g
            key={index}
            className={styles.barGroup}
            style={{ transformOrigin: `50% 100%` }}
            {...(!reduce ? { initial: { scaleY: 0 }, animate: { scaleY: 1 }, transition: { duration: .32, ease: [...motionTokens.ease.enter], delay: index * staggerStep } } : {})}
          >
            {segments.map(segment => {
              const color = result.series[segment.seriesIndex]?.color ?? SERIES_VARS[segment.seriesIndex % 4];
              const r = Math.min(2.5, geo.barW / 2, segment.height / 2);
              return segment.topSegment && segment.height > r * 1.5 ? (
                <path
                  key={segment.seriesIndex}
                  d={`M ${cx} ${segment.bottom} L ${cx} ${segment.top + r} Q ${cx} ${segment.top} ${cx + r} ${segment.top} L ${cx + geo.barW - r} ${segment.top} Q ${cx + geo.barW} ${segment.top} ${cx + geo.barW} ${segment.top + r} L ${cx + geo.barW} ${segment.bottom} Z`}
                  fill={color}
                />
              ) : (
                <rect key={segment.seriesIndex} x={cx} y={segment.top} width={geo.barW} height={segment.height} fill={color} />
              );
            })}
            {stacked ? <title>{`${result.categories[index]}: total ${formatValue(geo.perCategory[index] ?? 0)}`}</title> : null}
          </g>
        );
      })}
      <XAxis result={result} width={width} />
    </svg>
  );
}

function LineChartView({ result, width, reduce }: Omit<ChartGeometryProps, "activeIndex" | "stacked">) {
  if (!width) return <svg className={styles.chartSvg} width={1} height={1} aria-hidden="true" />;
  const geo = geometry(result, width);
  return (
    <svg className={styles.chartSvg} viewBox={`0 0 ${Math.round(width)} ${PLOT_HEIGHT + MARGIN_TOP + AXIS_HEIGHT}`} width={width} height={PLOT_HEIGHT + MARGIN_TOP + AXIS_HEIGHT} role="img" aria-label="Line chart">
      <YAxis result={result} width={width} formatValue={value => value.toLocaleString("en-US")} />
      {result.series.map((series, index) => {
        const color = series.color ?? seriesVar(index);
        const points = series.values.map((value, categoryIndex) => `${geo.x(categoryIndex) + geo.slot / 2},${geo.y(value)}`).join(" ");
        return (
          <motion.polyline
            key={series.id}
            points={points}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: .46, ease: [...motionTokens.ease.inOut] }}
          />
        );
      })}
      <XAxis result={result} width={width} />
    </svg>
  );
}

/** Silhueta cinza das barras reais, respirando, enquanto a consulta roda (altura fixa, nada abaixo se move). */
function SkeletonBars({ result }: { result: AskYourDataResult }) {
  const totals = result.categories.map((_, index) => result.series.reduce((acc, series) => acc + (series.values[index] ?? 0), 0));
  const max = Math.max(1, ...totals);
  return (
    <div className={styles.skeletonBars} aria-hidden="true">
      {totals.map((total, index) => (
        <span key={index} className={styles.skeletonBar} style={{ height: `${Math.max(8, (total / max) * 100)}%`, animationDelay: `${index * 90}ms` }} />
      ))}
    </div>
  );
}

export default AskYourData;
