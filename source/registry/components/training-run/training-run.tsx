"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, CircleAlert, Clock3, Copy, LoaderCircle, Pause, Play, Rocket, RotateCcw, Square, TriangleAlert } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./training-run.module.css";

export type TrainingStatus = "queued" | "running" | "paused" | "completed" | "failed" | "cancelled";

export type TrainingEventKind = "start" | "checkpoint" | "eval" | "epoch" | "info" | "warning" | "error" | "done";

export interface TrainingEvent {
  id: string;
  kind: TrainingEventKind;
  label: string;
  step?: number;
}

export interface LossSample {
  step: number;
  train?: number;
  val?: number;
}

export interface TrainingRunProps {
  /** Onde o job está. Rodando sem amostras de loss lê como "subindo". Sem ele, roda a simulação embutida. */
  status?: TrainingStatus;
  name?: string;
  model?: { name: string; mark?: ReactNode };
  details?: string[];
  dataset?: { name: string; examples?: number; mark?: ReactNode };
  step?: number;
  totalSteps?: number;
  epochs?: number;
  loss?: LossSample[];
  learningRate?: number;
  elapsed?: number;
  eta?: number;
  events?: TrainingEvent[];
  metrics?: { label: string; value: string; hint?: string }[];
  /** Linha sobre o gráfico vazio enquanto o job está na fila ou subindo. */
  activity?: string;
  /** Motivo da falha; aparece no rodapé no lugar do dataset. */
  error?: string;
  onPause?: () => void;
  onResume?: () => void;
  /** Chamado num segundo toque em "Confirm cancel" (janela de 3s). */
  onCancel?: () => void;
  onRetry?: () => void;
  onRestart?: () => void;
  onDeploy?: (signal: AbortSignal) => Promise<{ endpoint?: string } | void>;
  /** Mensagem de uso único para leitores de tela (resultado de uma ação). */
  notice?: string;
  /** Só o demo, quando status fica de fora: "oom" falha no passo 940 para mostrar o retry. */
  scenario?: "healthy" | "oom";
  className?: string;
}

/* ---------- simulação embutida ---------- */

const TOTAL_STEPS = 1860;
const EPOCHS = 3;
const STEPS_PER_EPOCH = Math.round(TOTAL_STEPS / EPOCHS); // 620
/** Velocidade "real" do job (passos/segundo) → ~18m40s por run inteiro. */
const JOB_STEPS_PER_SEC = TOTAL_STEPS / 1120;
const DEMO_TICK_MS = 90;
/** Passos simulados por tick: o run inteiro leva ~12s na tela. */
const DEMO_STEP_PER_TICK = 14;

const round3 = (value: number) => Math.round(value * 1000) / 1000;

function trainLossAt(t: number): number {
  return (
    0.965 +
    1.15 * Math.exp(-t / 105) +
    0.075 * Math.exp(-t / 42) +
    0.018 * Math.sin(t / 21) +
    0.012 * Math.sin(t / 6.7 + 1.7)
  );
}

function valLossAt(t: number): number {
  return trainLossAt(t) + 0.075 + 0.028 * Math.sin(t / 17 + 0.6);
}

function learningRateAt(t: number): number {
  const peak = 2e-4;
  const floor = 2e-5;
  const warmup = 60;
  if (t <= warmup) return peak * (t / warmup);
  return floor + (peak - floor) * 0.5 * (1 + Math.cos((Math.PI * (t - warmup)) / (TOTAL_STEPS - warmup)));
}

/** Amostras pré-computadas (determinísticas): train a cada 4 passos, eval a cada 20. */
const SIM_TRAIN: LossSample[] = [];
for (let t = 0; t <= TOTAL_STEPS; t += 4) SIM_TRAIN.push({ step: t, train: round3(trainLossAt(t)) });
const SIM_VAL: LossSample[] = [];
for (let t = 20; t <= TOTAL_STEPS; t += 20) SIM_VAL.push({ step: t, val: round3(valLossAt(t)) });
const BEST_VAL = round3(Math.min(...SIM_VAL.map(sample => sample.val ?? Infinity)));

function simulatedEvents(upToStep: number, failed: boolean): TrainingEvent[] {
  const events: TrainingEvent[] = [{ id: "start", kind: "start", label: "Training started on 8× H200", step: 0 }];
  if (failed && upToStep >= 940) events.push({ id: "oom", kind: "error", label: "CUDA out of memory on GPU 3", step: 940 });
  for (const s of [310, 620, 930, 1240, 1550]) {
    if (upToStep >= s) events.push({ id: `ckpt-${s}`, kind: "checkpoint", label: `Checkpoint saved · step ${s.toLocaleString("en-US")}`, step: s });
  }
  for (const s of [400, 800, 1200, 1600]) {
    if (upToStep >= s) events.push({ id: `eval-${s}`, kind: "eval", label: `Eval · validation ${round3(valLossAt(s)).toFixed(3)}`, step: s });
  }
  if (upToStep >= STEPS_PER_EPOCH) events.push({ id: "epoch-1", kind: "epoch", label: "Epoch 1 complete", step: STEPS_PER_EPOCH });
  if (upToStep >= STEPS_PER_EPOCH * 2) events.push({ id: "epoch-2", kind: "epoch", label: "Epoch 2 complete", step: STEPS_PER_EPOCH * 2 });
  if (!failed && upToStep >= TOTAL_STEPS) events.push({ id: "done", kind: "done", label: `Training complete · best validation ${BEST_VAL.toFixed(3)}`, step: TOTAL_STEPS });
  return events.sort((a, b) => (a.step ?? 0) - (b.step ?? 0));
}

export interface TrainingRunSimulation extends Required<Omit<TrainingRunProps, "className" | "scenario" | "error" | "notice">> {
  error?: string;
  notice?: string;
  scenario: "healthy" | "oom";
}

/** O hook por trás do demo: devolve todas as props do TrainingRun para um run simulado. */
export function useTrainingRunSimulation(options?: { scenario?: "healthy" | "oom"; active?: boolean }): TrainingRunSimulation & { status: TrainingStatus } {
  const scenario = options?.scenario ?? "healthy";
  const active = options?.active ?? true;
  const [step, setStep] = useState(0);
  const [failed, setFailed] = useState(false);
  const scenarioRef = useRef(scenario);
  scenarioRef.current = scenario;

  useEffect(() => {
    if (!active || scenario !== "healthy") void active;
    if (!active) return;
    const id = window.setInterval(() => {
      setStep(current => {
        const next = Math.min(TOTAL_STEPS, current + DEMO_STEP_PER_TICK);
        if (scenarioRef.current === "oom" && !failedRef.current && next >= 940) setFailed(true);
        return next;
      });
    }, DEMO_TICK_MS);
    return () => window.clearInterval(id);
  }, [active]);

  const failedRef = useRef(false);
  failedRef.current = failed;

  const status: TrainingStatus = failed ? "failed" : step >= TOTAL_STEPS ? "completed" : "running";
  const events = useMemo(() => simulatedEvents(step, failed), [step, failed]);
  const loss = useMemo(
    () => [
      ...SIM_TRAIN.filter(sample => sample.step <= step),
      ...SIM_VAL.filter(sample => sample.step <= step),
    ].sort((a, b) => a.step - b.step),
    [step],
  );
  return {
    status,
    name: "support-triage-v3",
    model: { name: "Qwen3.8 Max", mark: <QwenColorMark /> },
    details: ["LoRA r16", "8× H200"],
    dataset: { name: "arcwork/support-tickets-oct", examples: 48210, mark: <HuggingFaceMark /> },
    step,
    totalSteps: TOTAL_STEPS,
    epochs: EPOCHS,
    loss,
    learningRate: learningRateAt(step),
    elapsed: step / JOB_STEPS_PER_SEC,
    eta: Math.max(0, (TOTAL_STEPS - step) / JOB_STEPS_PER_SEC),
    events,
    error: failed ? "CUDA out of memory on GPU 3" : undefined,
    activity: "Compiling CUDA kernels",
    metrics: [],
    onPause: () => undefined,
    onResume: () => undefined,
    onCancel: () => undefined,
    onRetry: () => setFailed(false),
    onRestart: () => { setFailed(false); setStep(0); },
    onDeploy: signal => new Promise<{ endpoint?: string }>((resolve, reject) => {
      window.setTimeout(() => (signal.aborted ? reject(new DOMException("Aborted", "AbortError")) : resolve({ endpoint: "https://api.acme.dev/models/support-triage-v3" })), 1400);
    }),
    notice: undefined,
    scenario,
  };
}

/* ---------- formatação ---------- */

function fmtClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}m ${rest.toString().padStart(2, "0")}s`;
}

function fmtSci(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / 10 ** exponent;
  return `${mantissa.toFixed(2)}e${exponent}`;
}

const fmtInt = (value: number) => value.toLocaleString("en-US");

/* ---------- marcas ---------- */

/** Marca do Qwen (Qwen3.8 Max): losango hexagonal em facetas índigo. O fill é marca, não decoração. */
export function QwenColorMark() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false">
      <path d="M12 1.7 20.7 6.85v10.3L12 22.3l-8.7-5.15V6.85Z" fill="#4c4fd8" />
      <path d="M12 1.7 20.7 6.85 12 12 3.3 6.85Z" fill="#7b7ef0" />
      <path d="M12 12v10.3l-8.7-5.15V6.85Z" fill="#6164e6" opacity=".82" />
      <circle cx="12" cy="12" r="2.1" fill="#f4f4ff" />
    </svg>
  );
}

/** Marca do Hugging Face: silhueta de raposa no amarelo da marca. */
export function HuggingFaceMark() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false">
      <path
        d="M4.9 2.6 9.3 8.1c.8-.4 1.8-.7 2.7-.7s1.9.3 2.7.7l4.4-5.5c.4-.5 1.2-.3 1.3.4l.1 5.6c.1 2.9-1 5.7-3.1 7.7-1.5 1.4-3.3 2.2-5.4 2.2s-3.9-.8-5.4-2.2C4.5 14.3 3.4 11.5 3.5 8.6l.1-5.6c.1-.7.9-.9 1.3-.4Z"
        fill="#ffc700"
      />
      <path d="M12 9.2c1 0 1.9.3 2.6.9-.3 2.2-1.3 4-2.6 5.4-1.3-1.4-2.3-3.2-2.6-5.4.7-.6 1.6-.9 2.6-.9Z" fill="#fff" opacity=".85" />
    </svg>
  );
}

/* ---------- ícones por tipo de evento ---------- */

function eventIcon(kind: TrainingEventKind) {
  switch (kind) {
    case "checkpoint": return <Square size={11} aria-hidden="true" />;
    case "eval": return <CircleAlert size={12} aria-hidden="true" />;
    case "epoch": return <RotateCcw size={12} aria-hidden="true" />;
    case "warning": return <TriangleAlert size={12} aria-hidden="true" />;
    case "error": return <CircleAlert size={12} aria-hidden="true" />;
    case "done": return <Check size={13} aria-hidden="true" />;
    case "start":
    default:
      return <Play size={11} fill="currentColor" strokeWidth={0} aria-hidden="true" />;
  }
}

const STATUS_LABEL: Record<TrainingStatus, string> = {
  queued: "Queued",
  running: "Training",
  paused: "Paused",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

/* ---------- componente ---------- */

interface RunState {
  status: TrainingStatus;
  step: number;
  elapsed: number;
  failedAt: number | null;
  events: TrainingEvent[];
  deploy: { state: "idle" | "busy" | "ok" | "error"; endpoint?: string; message?: string } | null;
}

const freshRun = (): RunState => ({ status: "running", step: 0, elapsed: 0, failedAt: null, events: simulatedEvents(0, false), deploy: null });

export function TrainingRun({
  status,
  name = "Fine-tuning job",
  model,
  details = [],
  dataset,
  step,
  totalSteps,
  epochs,
  loss,
  learningRate,
  elapsed,
  eta,
  events,
  metrics,
  activity,
  error,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onRestart,
  onDeploy,
  notice,
  scenario = "healthy",
  className,
}: TrainingRunProps) {
  const reduce = useReducedMotion();
  const external = status != null;
  const scenarioRef = useRef(scenario);
  scenarioRef.current = scenario;
  const retriedRef = useRef(false);
  const interactedRef = useRef(false);

  const [run, setRun] = useState<RunState>(freshRun);
  const [announce, setAnnounce] = useState("");
  const [cancelArmed, setCancelArmed] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const cancelTimer = useRef<number | null>(null);
  const announcedOnce = useRef(false);
  const lastStatus = useRef<TrainingStatus>("running");
  const deployController = useRef<AbortController | null>(null);

  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => setOnScreen(entry.isIntersecting)), { threshold: .25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const onScreenRef = useRef(onScreen);
  onScreenRef.current = onScreen;

  /* relógio da simulação: congela fora da tela e quando não é modo demo */
  useEffect(() => {
    if (external) return;
    const id = window.setInterval(() => {
      if (!onScreenRef.current) return;
      setRun(prev => {
        if (prev.status !== "running") return prev;
        const next = Math.min(TOTAL_STEPS, prev.step + DEMO_STEP_PER_TICK);
        const oomHit = scenarioRef.current === "oom" && !retriedRef.current && next >= 940;
        const completed = next >= TOTAL_STEPS;
        return {
          ...prev,
          step: next,
          elapsed: prev.elapsed + DEMO_STEP_PER_TICK / JOB_STEPS_PER_SEC,
          failedAt: oomHit ? next : prev.failedAt,
          status: oomHit ? "failed" : completed ? "completed" : "running",
          events: simulatedEvents(next, oomHit),
        };
      });
    }, DEMO_TICK_MS);
    return () => window.clearInterval(id);
  }, [external]);

  /* anúncio de mudança de status (nunca de cada passo) */
  useEffect(() => {
    if (lastStatus.current !== run.status) {
      const changed = run.status;
      lastStatus.current = changed;
      if (announcedOnce.current) setAnnounce(STATUS_LABEL[changed]);
      announcedOnce.current = true;
    }
  }, [run.status]);

  /* loop do demo: completa → segura → roda de novo, até o primeiro toque */
  useEffect(() => {
    if (external || run.status !== "completed" || interactedRef.current) return;
    const id = window.setTimeout(() => {
      if (!interactedRef.current) { deployController.current?.abort(); setRun(freshRun()); }
    }, 3600);
    return () => window.clearTimeout(id);
  }, [external, run.status]);

  useEffect(() => () => { deployController.current?.abort(); if (cancelTimer.current != null) window.clearTimeout(cancelTimer.current); }, []);

  /* ---------- dados efetivos ---------- */

  const total = totalSteps ?? TOTAL_STEPS;
  const epochCount = epochs ?? EPOCHS;

  const samples = useMemo<LossSample[]>(() => {
    if (external) return loss ?? [];
    return [...SIM_TRAIN.filter(sample => sample.step <= run.step), ...SIM_VAL.filter(sample => sample.step <= run.step)].sort((a, b) => a.step - b.step);
  }, [external, loss, run.step]);

  const trainSamples = useMemo(() => samples.filter(sample => sample.train != null), [samples]);
  const valSamples = useMemo(() => samples.filter(sample => sample.val != null), [samples]);
  const lastTrain = trainSamples.length ? trainSamples[trainSamples.length - 1]?.train ?? null : null;
  const lastVal = valSamples.length ? valSamples[valSamples.length - 1]?.val ?? null : null;

  const currentStep = external ? step ?? 0 : run.step;
  const currentStatus: TrainingStatus = external ? status! : run.status;
  const currentLearningRate = external ? learningRate : learningRateAt(Math.max(0, Math.min(currentStep, TOTAL_STEPS)));
  const currentElapsed = external ? (elapsed ?? 0) : run.elapsed;
  const currentEta = external ? eta ?? Math.max(0, (total - currentStep) / JOB_STEPS_PER_SEC) : Math.max(0, (TOTAL_STEPS - currentStep) / JOB_STEPS_PER_SEC);
  const currentError = external ? error : run.status === "failed" ? "CUDA out of memory on GPU 3" : undefined;

  const shownEvents = useMemo(() => {
    const source = external ? events ?? [] : run.events;
    const lastThree = source.slice(-3);
    return lastThree.reverse();
  }, [external, events, run.events]);

  /* leitura do gráfico por teclado */
  const [inspectIndex, setInspectIndex] = useState<number | null>(null);
  useEffect(() => {
    if (inspectIndex != null && inspectIndex >= trainSamples.length) setInspectIndex(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainSamples.length]);

  const onChartKey = useCallback((event: ReactKeyboardEvent) => {
    const count = trainSamples.length;
    if (!count) return;
    const delta = event.shiftKey ? 10 : 1;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setInspectIndex(prev => {
        if (event.key === "Home") return 0;
        if (event.key === "End") return count - 1;
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const base = prev == null ? (direction > 0 ? 0 : count - 1) : prev;
        return Math.min(count - 1, Math.max(0, base + direction * delta));
      });
    } else if (event.key === "Escape") {
      setInspectIndex(null);
    }
  }, [trainSamples.length]);

  const inspected = inspectIndex != null ? trainSamples[inspectIndex] : undefined;
  const readoutTrain = inspected?.train ?? lastTrain;
  const readoutVal = inspected != null
    ? [...valSamples].reverse().find(sample => sample.step <= (inspected?.step ?? 0))?.val ?? lastVal
    : lastVal;

  /* ---------- ações ---------- */

  const touch = useCallback(() => { interactedRef.current = true; }, []);

  const handlePause = useCallback(() => {
    touch();
    setCancelArmed(false);
    if (!external) setRun(prev => (prev.status === "running" ? { ...prev, status: "paused" } : prev));
    onPause?.();
  }, [external, onPause, touch]);

  const handleResume = useCallback(() => {
    touch();
    setCancelArmed(false);
    if (!external) setRun(prev => (prev.status === "paused" ? { ...prev, status: "running" } : prev));
    onResume?.();
  }, [external, onResume, touch]);

  const handleCancel = useCallback(() => {
    touch();
    if (!cancelArmed) {
      setCancelArmed(true);
      if (cancelTimer.current != null) window.clearTimeout(cancelTimer.current);
      cancelTimer.current = window.setTimeout(() => setCancelArmed(false), 3000);
      return;
    }
    if (cancelTimer.current != null) window.clearTimeout(cancelTimer.current);
    setCancelArmed(false);
    if (!external) setRun(prev => ({ ...prev, status: "cancelled", events: [...prev.events, { id: `cancel-${Date.now()}`, kind: "info", label: "Run cancelled by you", step: prev.step }] }));
    onCancel?.();
  }, [cancelArmed, external, onCancel, touch]);

  const handleRetry = useCallback(() => {
    touch();
    retriedRef.current = true;
    if (!external) setRun(prev => {
      const resumeAt = Math.max(0, (prev.failedAt ?? prev.step) - 10);
      return { ...prev, status: "running", step: resumeAt, failedAt: null, events: [...prev.events, { id: `retry-${resumeAt}`, kind: "info", label: `Resumed from checkpoint · step ${resumeAt.toLocaleString("en-US")}`, step: resumeAt }] };
    });
    onRetry?.();
  }, [external, onRetry, touch]);

  const handleRestart = useCallback(() => {
    touch();
    deployController.current?.abort();
    retriedRef.current = false;
    if (!external) setRun(freshRun());
    onRestart?.();
  }, [external, onRestart, touch]);

  const handleDeploy = useCallback(async () => {
    touch();
    if (external) { onDeploy?.(new AbortController().signal); return; }
    const controller = new AbortController();
    deployController.current = controller;
    setRun(prev => ({ ...prev, deploy: { state: "busy" } }));
    const deployFn = onDeploy ?? ((signal: AbortSignal) => new Promise<{ endpoint?: string }>((resolve, reject) => {
      window.setTimeout(() => (signal.aborted ? reject(new DOMException("Aborted", "AbortError")) : resolve({ endpoint: "https://api.acme.dev/models/support-triage-v3" })), 1400);
    }));
    try {
      const result = await deployFn(controller.signal);
      setRun(prev => (prev.deploy?.state === "busy" ? { ...prev, deploy: { state: "ok", endpoint: result?.endpoint ?? "support-triage-v3" } } : prev));
      setAnnounce("Deployed.");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : String(err);
      setRun(prev => (prev.deploy?.state === "busy" ? { ...prev, deploy: { state: "error", message } } : prev));
      setAnnounce(`Deploy failed. ${message}`);
    } finally {
      if (deployController.current === controller) deployController.current = null;
    }
  }, [external, onDeploy, touch]);

  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const copyEndpoint = useCallback(() => {
    const endpoint = run.deploy?.endpoint;
    if (!endpoint || typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(endpoint).then(() => {
      setCopiedEndpoint(true);
      window.setTimeout(() => setCopiedEndpoint(false), 1600);
    }).catch(() => undefined);
  }, [run.deploy?.endpoint]);

  /* ---------- métricas ao vivo x resultado final ---------- */

  const finished = currentStatus === "completed";
  const metricItems = useMemo(() => {
    if (finished && metrics?.length) return metrics.slice(0, 4);
    if (finished) {
      return [
        { label: "Train loss", value: lastTrain != null ? lastTrain.toFixed(3) : "—" },
        { label: "Validation loss", value: lastVal != null ? lastVal.toFixed(3) : "—" },
        { label: "Steps", value: fmtInt(total) },
        { label: "Duration", value: fmtClock(currentElapsed) },
      ];
    }
    const epochNow = Math.min(epochCount, Math.floor(currentStep / Math.max(1, Math.floor(total / epochCount))) + 1);
    return [
      { label: "Epoch", value: `${epochNow} of ${epochCount}` },
      { label: "Learning rate", value: currentLearningRate != null && Number.isFinite(currentLearningRate) ? fmtSci(currentLearningRate) : "—" },
      { label: "Elapsed", value: fmtClock(currentElapsed) },
      { label: "ETA", value: currentStatus === "queued" ? `About ${fmtClock(currentEta)}` : fmtClock(currentEta) },
    ];
  }, [finished, metrics, lastTrain, lastVal, total, epochCount, currentStep, currentLearningRate, currentElapsed, currentEta, currentStatus]);

  /* ---------- gráfico ---------- */

  const [plotWidth, setPlotWidth] = useState(0);
  const chartBoxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = chartBoxRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width;
      if (width != null) setPlotWidth(width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const domainMax = useMemo(() => {
    const values = samples.flatMap(sample => [sample.train, sample.val].filter((v): v is number => v != null));
    const top = values.length ? Math.max(...values) : 0;
    return Math.max(2.2, Math.ceil(top * 1.15 * 2) / 2);
  }, [samples]);

  const chartName = `Loss chart. Step ${fmtInt(currentStep)} of ${fmtInt(total)}. Train loss ${readoutTrain != null ? readoutTrain.toFixed(3) : "—"}, validation ${readoutVal != null ? readoutVal.toFixed(3) : "—"}. Use arrow keys to inspect samples.`;

  const hasControls = Boolean(onPause || onResume || onCancel || onRetry || onRestart || onDeploy) || !external;

  const actionKey = `${currentStatus}:${run.deploy?.state ?? "none"}:${cancelArmed}`;

  return (
    <div ref={cardRef} className={[styles.card, className].filter(Boolean).join(" ")} role="region" aria-label={`Training run: ${name}`}>
      {/* cabeçalho */}
      <header className={styles.head}>
        <div className={styles.headLeft}>
          <span className={styles.mark}>{model?.mark ?? <QwenColorMark />}</span>
          <div className={styles.headText}>
            <h3 className={styles.title}>{name}</h3>
            <p className={styles.sub}>
              {model?.name ?? "Qwen3.8 Max"}
              {details.map(detail => <span key={detail} className={styles.subDot}>· {detail}</span>)}
            </p>
          </div>
        </div>
        <div className={styles.headRight}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={currentStatus}
              className={[styles.pill, styles[`pill_${currentStatus}`]].filter(Boolean).join(" ")}
              initial={reduce ? false : { opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -2 }}
              transition={{ duration: reduce ? 0 : motionTokens.duration.standard }}
            >
              {currentStatus === "running" && <LoaderCircle size={13} className={reduce ? undefined : styles.spin} aria-hidden="true" />}
              {currentStatus === "queued" && <Clock3 size={12} aria-hidden="true" />}
              {currentStatus === "paused" && <Pause size={12} aria-hidden="true" />}
              {currentStatus === "completed" && <Check size={13} aria-hidden="true" />}
              {currentStatus === "failed" && <CircleAlert size={13} aria-hidden="true" />}
              {currentStatus === "cancelled" && <RotateCcw size={12} aria-hidden="true" />}
              {STATUS_LABEL[currentStatus]}
            </motion.span>
          </AnimatePresence>
        </div>
      </header>

      {/* legenda + contador de passos */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.swatch} style={{ background: "var(--series-1)" }} aria-hidden="true" />
          <span className={styles.legendLabel}>Train</span>
          <strong className={styles.legendValue}>{readoutTrain != null ? readoutTrain.toFixed(3) : "—"}</strong>
        </span>
        <span className={styles.legendItem}>
          <span className={styles.swatch} style={{ background: "var(--series-2)" }} aria-hidden="true" />
          <span className={styles.legendLabel}><span className={styles.legendLong}>Validation</span><span className={styles.legendShort}>Val</span></span>
          <strong className={styles.legendValue}>{readoutVal != null ? readoutVal.toFixed(3) : "—"}</strong>
        </span>
        <span className={styles.stepCount}>{`Step ${fmtInt(currentStep)} / ${fmtInt(total)}`}</span>
      </div>

      {/* gráfico */}
      <div
        ref={chartBoxRef}
        className={styles.chartWrap}
        role="group"
        tabIndex={0}
        aria-label={chartName}
        onKeyDown={onChartKey}
      >
        {plotWidth > 0 ? (
          <LossChart
            width={plotWidth}
            trainSamples={trainSamples}
            valSamples={valSamples}
            total={total}
            epochs={epochCount}
            currentStep={currentStep}
            domainMax={domainMax}
            inspectIndex={inspectIndex}
          />
        ) : (
          <div className={styles.chartPlaceholder} aria-hidden="true" />
        )}
        {activity && (trainSamples.length < 4) ? (
          <p className={styles.activity}>{activity}</p>
        ) : null}
        {inspectIndex != null && inspected ? (
          <span className={styles.inspectNote}>Step {(inspected.step ?? 0).toLocaleString("en-US")} · train {inspected.train?.toFixed(3) ?? "—"} · val {readoutVal != null ? readoutVal.toFixed(3) : "—"}</span>
        ) : null}
      </div>

      {/* métricas */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.dl
          key={finished ? "results" : "live"}
          className={styles.metrics}
          initial={reduce ? false : { opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -2 }}
          transition={{ duration: reduce ? 0 : motionTokens.duration.standard }}
        >
          {metricItems.map(item => (
            <div key={item.label} className={styles.metric}>
              <dt className={styles.metricLabel}>{item.label}</dt>
              <dd className={styles.metricValue}>{item.value}</dd>
              {item.hint ? <dd className={styles.metricHint}>{item.hint}</dd> : null}
            </div>
          ))}
        </motion.dl>
      </AnimatePresence>

      {/* log de eventos */}
      {shownEvents.length > 0 ? (
        <ul className={styles.events} aria-label="Recent events">
          <AnimatePresence initial={false}>
            {shownEvents.map(event => (
              <motion.li
                key={event.id}
                className={styles.eventRow}
                initial={reduce ? false : { opacity: 0, y: -7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : .24, ease: [...motionTokens.ease.standard] }}
              >
                <span className={[styles.eventIcon, event.kind === "error" ? styles.eventError : "", event.kind === "warning" ? styles.eventWarn : "", event.kind === "done" ? styles.eventDone : ""].filter(Boolean).join(" ")}>
                  {eventIcon(event.kind)}
                </span>
                <span className={styles.eventLabel}>{event.label}</span>
                {event.step != null ? <span className={styles.eventStep}>{"Step " + event.step.toLocaleString("en-US")}</span> : null}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : null}

      {/* rodapé: contexto + ações */}
      {(dataset || currentError || hasControls) ? (
        <footer className={styles.footer}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`${actionKey}:ctx`}
              className={styles.footCtx}
              initial={reduce ? false : { opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -2 }}
              transition={{ duration: reduce ? 0 : motionTokens.duration.standard }}
            >
              {currentError ? (
                <span className={styles.footError}>
                  <CircleAlert size={13} aria-hidden="true" />
                  {currentError}
                </span>
              ) : dataset ? (
                <span className={styles.footDataset}>
                  <span className={styles.footMark}>{dataset.mark ?? <HuggingFaceMark />}</span>
                  <span className={styles.footName}>{dataset.name}</span>
                  {dataset.examples != null ? <span className={styles.footMeta}>· {fmtInt(dataset.examples)} examples</span> : null}
                </span>
              ) : null}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={actionKey}
              className={styles.actions}
              initial={reduce ? false : { opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -2 }}
              transition={{ duration: reduce ? 0 : motionTokens.duration.standard }}
            >
              {run.deploy?.state === "ok" && run.deploy.endpoint ? (
                <span className={styles.endpoint}>
                  <span className={styles.endpointUrl}>{run.deploy.endpoint}</span>
                  <button type="button" className={styles.copyBtn} onClick={copyEndpoint} aria-label="Copy endpoint">
                    {copiedEndpoint ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                    {copiedEndpoint ? "Copied" : "Copy"}
                  </button>
                </span>
              ) : null}
              {run.deploy?.state === "error" ? (
                <span className={styles.deployError}>{run.deploy.message}</span>
              ) : null}
              {currentStatus === "running" && onPause ? (
                <button type="button" className={styles.btn} onClick={handlePause}>
                  <Pause size={12} aria-hidden="true" /> Pause
                </button>
              ) : null}
              {currentStatus === "paused" && onResume ? (
                <button type="button" className={[styles.btn, styles.btnAccent].join(" ")} onClick={handleResume}>
                  <Play size={12} aria-hidden="true" /> Resume
                </button>
              ) : null}
              {currentStatus === "failed" && onRetry ? (
                <button type="button" className={[styles.btn, styles.btnAccent].join(" ")} onClick={handleRetry}>
                  <RotateCcw size={12} aria-hidden="true" /> Retry from checkpoint
                </button>
              ) : null}
              {currentStatus === "completed" && onDeploy ? (
                <button type="button" className={[styles.btn, styles.btnAccent].join(" ")} onClick={() => void handleDeploy()} disabled={run.deploy?.state === "busy"}>
                  {run.deploy?.state === "busy"
                    ? <LoaderCircle size={12} className={reduce ? undefined : styles.spin} aria-hidden="true" />
                    : <Rocket size={12} aria-hidden="true" />}
                  {run.deploy?.state === "busy" ? "Deploying…" : "Deploy"}
                </button>
              ) : null}
              {(currentStatus === "completed" || currentStatus === "failed" || currentStatus === "cancelled") && onRestart ? (
                <button type="button" className={styles.btn} onClick={handleRestart}>
                  <RotateCcw size={12} aria-hidden="true" /> Run again
                </button>
              ) : null}
              {(currentStatus === "queued" || currentStatus === "running" || currentStatus === "paused") && onCancel ? (
                <button
                  type="button"
                  className={[styles.btn, cancelArmed ? styles.btnDanger : styles.btnGhost].join(" ")}
                  onClick={handleCancel}
                  aria-live="polite"
                >
                  {cancelArmed ? "Confirm cancel" : "Cancel"}
                </button>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </footer>
      ) : null}

      <span className={styles.srOnly} role="status" aria-live="polite">{announce}{notice ? ` ${notice}` : ""}</span>
    </div>
  );
}

/* ---------- curva (SVG puro, sem lib de gráfico) ---------- */

const MARGIN_LEFT = 34;
const MARGIN_RIGHT = 10;
const MARGIN_TOP = 10;
const PLOT_HEIGHT = 164;
const TRACK_GAP = 12;
const AXIS_LABEL_H = 22;
const CHART_HEIGHT = MARGIN_TOP + PLOT_HEIGHT + TRACK_GAP + 4 + 8 + AXIS_LABEL_H;

interface LossChartProps {
  width: number;
  trainSamples: LossSample[];
  valSamples: LossSample[];
  total: number;
  epochs: number;
  currentStep: number;
  domainMax: number;
  inspectIndex: number | null;
}

function LossChart({ width, trainSamples, valSamples, total, epochs, currentStep, domainMax, inspectIndex }: LossChartProps) {
  const plotW = Math.max(60, width - MARGIN_LEFT - MARGIN_RIGHT);
  const x = (value: number) => MARGIN_LEFT + plotW * Math.min(1, Math.max(0, value / total));
  const y = (value: number) => MARGIN_TOP + PLOT_HEIGHT * (1 - Math.min(domainMax, Math.max(0, value)) / domainMax);

  const toPath = (samples: LossSample[], field: "train" | "val") => {
    if (samples.length === 0) return "";
    return samples
      .map((sample, index) => `${index === 0 ? "M" : "L"} ${x(sample.step).toFixed(1)} ${y(sample[field] ?? 0).toFixed(1)}`)
      .join(" ");
  };

  const trainPath = toPath(trainSamples, "train");
  const valPath = toPath(valSamples, "val");
  const lastTrainPoint = trainSamples.length ? { px: x(trainSamples[trainSamples.length - 1]?.step ?? 0), py: y(trainSamples[trainSamples.length - 1]?.train ?? 0) } : null;
  const lastValPoint = valSamples.length ? { px: x(valSamples[valSamples.length - 1]?.step ?? 0), py: y(valSamples[valSamples.length - 1]?.val ?? 0) } : null;
  const playheadX = x(currentStep);
  const inspectPoint = inspectIndex != null && trainSamples[inspectIndex] ? { px: x(trainSamples[inspectIndex]?.step ?? 0), py: y(trainSamples[inspectIndex]?.train ?? 0) } : null;

  const ticks = [0, domainMax / 2, domainMax];
  const trackY = MARGIN_TOP + PLOT_HEIGHT + TRACK_GAP;

  return (
    <svg className={styles.chartSvg} width={Math.round(width)} height={CHART_HEIGHT} aria-hidden="true">
      {/* grade horizontal */}
      {ticks.map(tick => (
        <g key={tick}>
          <text x={MARGIN_LEFT - 8} y={y(tick) + 3.5} textAnchor="end" className={styles.axisText}>
            {tick.toFixed(1)}
          </text>
          <line x1={MARGIN_LEFT} x2={width - MARGIN_RIGHT} y1={y(tick)} y2={y(tick)} className={tick === 0 ? styles.baseline : styles.gridline} vectorEffect="non-scaling-stroke" />
        </g>
      ))}

      {/* divisórias de epoch (tracejadas, atravessam o plot) */}
      {Array.from({ length: epochs - 1 }, (_, index) => index + 1).map(boundary => (
        <line
          key={boundary}
          x1={x((total / epochs) * boundary)}
          x2={x((total / epochs) * boundary)}
          y1={MARGIN_TOP}
          y2={MARGIN_TOP + PLOT_HEIGHT}
          className={styles.epochSep}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* playhead no passo atual */}
      <line x1={playheadX} x2={playheadX} y1={MARGIN_TOP} y2={MARGIN_TOP + PLOT_HEIGHT} className={styles.playhead} vectorEffect="non-scaling-stroke" />

      {/* curvas: train (grossa, série 1) e validation (fina, série 2) */}
      {valPath ? <path d={valPath} className={styles.valLine} vectorEffect="non-scaling-stroke" /> : null}
      {trainPath ? <path d={trainPath} className={styles.trainLine} vectorEffect="non-scaling-stroke" /> : null}
      {lastValPoint ? <circle cx={lastValPoint.px} cy={lastValPoint.py} r={3} className={styles.valDot} /> : null}
      {lastTrainPoint ? (
        <g>
          <circle cx={lastTrainPoint.px} cy={lastTrainPoint.py} r={6} className={styles.trainHalo} />
          <circle cx={lastTrainPoint.px} cy={lastTrainPoint.py} r={3.4} className={styles.trainDot} />
        </g>
      ) : null}
      {inspectPoint ? (
        <g>
          <circle cx={inspectPoint.px} cy={inspectPoint.py} r={4} className={styles.inspectDot} />
          <line x1={inspectPoint.px} x2={inspectPoint.px} y1={MARGIN_TOP} y2={MARGIN_TOP + PLOT_HEIGHT} className={styles.inspectLine} vectorEffect="non-scaling-stroke" />
        </g>
      ) : null}

      {/* trilho de progresso por epoch */}
      <rect x={MARGIN_LEFT} y={trackY} width={plotW} height={4} rx={2} className={styles.track} />
      <rect x={MARGIN_LEFT} y={trackY} width={Math.max(0, playheadX - MARGIN_LEFT)} height={4} rx={2} className={styles.trackFill} />

      {/* rótulos de epoch, um por banda */}
      {Array.from({ length: epochs }, (_, index) => index).map(index => (
        <text key={index} x={MARGIN_LEFT + (plotW / epochs) * index + 1} y={trackY + 4 + 15} className={styles.axisText}>
          {`Epoch ${index + 1}`}
        </text>
      ))}
    </svg>
  );
}

export default TrainingRun;
