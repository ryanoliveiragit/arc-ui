"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Building2, Check, LoaderCircle, Pencil, Undo2 } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./smart-form-fill.module.css";

export interface SmartFormFillField {
  id: string;
  label: string;
  /** "company" ativa o slot de logotipo; o resto vira o tipo nativo do input. */
  kind?: "text" | "email" | "tel" | "phone" | "url" | "company";
  placeholder?: string;
  /** Ocupa a linha inteira na grade de dois campos. */
  span?: boolean;
  autoComplete?: string;
}

export interface SmartFormFillExtracted {
  value: string;
  /** 0 a 1. */
  confidence: number;
  /** Substringa exata do texto colado que originou o valor (liga causa e efeito). */
  source?: string;
  /** Explica uma confiança baixa. */
  note?: string;
}

export type SmartFormFillResult = Record<string, SmartFormFillExtracted>;

export interface SmartFormFillProps {
  fields?: SmartFormFillField[];
  defaultValues?: Record<string, string>;
  onValuesChange?: (values: Record<string, string>) => void;
  extract?: (text: string, signal: AbortSignal) => Promise<SmartFormFillResult>;
  /** Campos abaixo disso pedem revisão e seguram o salvar até serem checados ou editados. */
  reviewThreshold?: number;
  samples?: { label: string; text: string }[];
  autoPlay?: boolean;
  onFill?: (result: SmartFormFillResult) => void;
  onUndo?: (restored: Record<string, string>) => void;
  onSubmit?: (values: Record<string, string>) => void | Promise<void>;
  resolveLogo?: (company: string) => React.ReactNode | undefined;
  model?: { name: string; mark?: React.ReactNode };
  title?: string;
  description?: string;
  submitLabel?: string;
  className?: string;
}

export const defaultContactFields: SmartFormFillField[] = [
  { id: "name", label: "Full name", autoComplete: "name" },
  { id: "title", label: "Job title", autoComplete: "organization-title" },
  { id: "company", label: "Company", kind: "company", span: true, autoComplete: "organization" },
  { id: "email", label: "Work email", kind: "email", autoComplete: "email" },
  { id: "phone", label: "Phone", kind: "tel", autoComplete: "tel" },
  { id: "address", label: "Address", span: true },
];

const SIGNATURE_SAMPLE = `Thanks again for the walkthrough on Tuesday. Redlines coming by Friday.

Maya Okafor
Head of Partnerships, Stripe
m +1 (415) 555-0142 · o +1 (415) 555-0100
maya.okafor@stripe.com
354 Oyster Pt Blvd, S, San Francisco 94080`;

const NOTES_SAMPLE = `quick notes from the call — jordan blake (jordan.blake@hopperhq.com),
VP Eng at Hopper HQ, line 212-555-0187. Wants the pilot running in Q1.`;

const signatureSources: Record<string, string> = {
  name: "Maya Okafor",
  title: "Head of Partnerships",
  company: "Stripe",
  email: "maya.okafor@stripe.com",
  phone: "+1 (415) 555-0142",
  address: "354 Oyster Pt Blvd, S, San Francisco 94080",
};
const notesSources: Record<string, string> = {
  name: "jordan blake",
  title: "VP Eng",
  company: "Hopper HQ",
  email: "jordan.blake@hopperhq.com",
  phone: "212-555-0187",
};

function simulateContactText(text: string): SmartFormFillResult {
  const normalized = text.replace(/\s+/g, " ").toLowerCase();
  if (normalized.includes("maya okafor")) {
    return {
      name: { value: "Maya Okafor", confidence: .99, source: signatureSources.name },
      // Sem source: no exemplo de assinatura o cargo aparece junto do nome e
      // destacar o trecho duplicaria o destaque do próprio nome.
      title: { value: "Head of Partnerships", confidence: .97 },
      company: { value: "Stripe", confidence: .98, source: signatureSources.company },
      email: { value: "maya.okafor@stripe.com", confidence: 1, source: signatureSources.email },
      phone: { value: "+1 (415) 555-0142", confidence: .84, source: signatureSources.phone, note: "Two numbers in the text — using the mobile line." },
      address: { value: "354 Oyster Pt Blvd, S, San Francisco 94080", confidence: .93, source: signatureSources.address },
    };
  }
  if (normalized.includes("jordan blake")) {
    return {
      name: { value: "Jordan Blake", confidence: .96, source: notesSources.name },
      title: { value: "VP Engineering", confidence: .78, source: notesSources.title, note: "“VP Eng” was paraphrased to a full title." },
      company: { value: "Hopper HQ", confidence: .95, source: notesSources.company },
      email: { value: "jordan.blake@hopperhq.com", confidence: 1, source: notesSources.email },
      phone: { value: "+1 212-555-0187", confidence: .88, source: notesSources.phone, note: "Country code inferred from the area code." },
    };
  }
  // Fallback local: pega os padrões comuns quando o texto não é um dos exemplos.
  const email = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/)?.[0];
  const phone = text.match(/\+?\d[\d\s().-]{7,}\d/)?.[0];
  const nameLine = text.split("\n").map(line => line.trim()).find(line => /^[A-Z][a-záéíóúâêôç]+( [A-Z][a-záéíóúâêôç]+){1,3}$/.test(line));
  const result: SmartFormFillResult = {};
  if (email) result.email = { value: email, confidence: 1, source: email };
  if (phone) result.phone = { value: phone.trim(), confidence: .9, source: phone.trim() };
  if (nameLine) result.name = { value: nameLine, confidence: .92, source: nameLine };
  return result;
}

/** Extrator padrão (doc): leitura simulada para os exemplos e parser local para o resto. */
const simulatedExtract = async (text: string): Promise<SmartFormFillResult> => simulateContactText(text);

/** Marca da Anthropic: um raio de oito raios arredondados. Preenchimento de marca (hex de fora do token é do próprio logotipo). */
function ClaudeMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={styles.mark}>
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

/** Marca do Stripe: quadrado arredondado azul com o S branco. Cor do próprio logotipo. */
function StripeMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#635BFF" />
      <path d="M17.6 13.7c-.3.9-1.2 1.3-2.3 1.3-1.4 0-2.6-.5-3.8-1v-2c1.2.6 2.4 1.1 3.6 1.1.7 0 1.2-.3 1.2-.8 0-.4-.4-.6-1.3-1l-.9-.2c-1.4-.4-2.5-.8-2.5-2.4 0-1.3 1.1-2.2 2.7-2.2 1.2 0 2.3.3 3.3.8v1.9c-1-.5-2-.9-3.1-.9-.7 0-1.1.3-1.1.7 0 .5.5.7 1.3.9l.9.2c1.5.4 2.5.9 2.5 2.4 0 .3 0 .7-.2 1.2Z" fill="#fff" />
    </svg>
  );
}

/** Logotipos embutidos: só quando a marca é conhecida; o resto usa o chip genérico. */
const builtInLogos: Record<string, React.ReactNode> = {
  stripe: <StripeMark />,
};

/** Fallback neutro para empresas sem marca embutida (ex.: "Hopper HQ"). */
function CompanyChip() {
  return (
    <span className={styles.companyChip} aria-hidden="true">
      <Building2 size={13} />
    </span>
  );
}

type Phase = "empty" | "editing" | "reading" | "filling" | "done" | "saved";
interface FieldState { confidence?: number; source?: string; note?: string; reviewed: "none" | "checked" | "edited" }

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

const crossfadeOut = { opacity: 0, transition: { duration: motionTokens.duration.instant } } as const;
const crossfadeIn = { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } } as const;

export function SmartFormFill({
  fields = defaultContactFields,
  defaultValues = {},
  onValuesChange,
  extract = simulatedExtract,
  reviewThreshold = .8,
  samples = [{ label: "Signature", text: SIGNATURE_SAMPLE }, { label: "Messy note", text: NOTES_SAMPLE }],
  autoPlay,
  onFill,
  onUndo,
  onSubmit,
  resolveLogo,
  model = { name: "Claude Haiku 5.5", mark: <ClaudeMark /> },
  title = "New contact",
  description = "Paste a signature, an email or rough notes. AI fills the fields and flags anything to check.",
  submitLabel = "Save contact",
  className,
}: SmartFormFillProps) {
  const reduce = useReducedMotion();
  /** Sem `extract` próprio o componente roda o loop de demonstração (doc: true sem extract). */
  const wantsAuto = autoPlay ?? extract === simulatedExtract;
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [state, setState] = useState<Record<string, FieldState>>({});
  const [phase, setPhase] = useState<Phase>("done");
  const [wellText, setWellText] = useState(SIGNATURE_SAMPLE);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveDone, setSaveDone] = useState(false);
  const { ref: screenRef, onScreen } = useOnScreen<HTMLDivElement>();
  const snapshot = useRef<Record<string, string>>({});
  const timers = useRef<number[]>([]);
  const interrupted = useRef(false);
  const interacted = useRef(false);
  const sampleIndex = useRef(0);
  const cardRef = useRef<HTMLTextAreaElement | null>(null);
  const inputRefs = useRef(new Map<string, HTMLInputElement>());
  const abortRef = useRef<AbortController | null>(null);

  const playAuto = wantsAuto && !interacted.current && !reduce;
  const filledIds = fields.filter(field => state[field.id]?.confidence != null).map(field => field.id);
  const reviewIds = fields.filter(field => {
    const entry = state[field.id];
    return entry?.confidence != null && entry.confidence < reviewThreshold && entry.reviewed === "none";
  }).map(field => field.id);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);
  const clearTimers = useCallback(() => { timers.current.forEach(id => window.clearTimeout(id)); timers.current = []; }, []);

  const setValue = useCallback((id: string, value: string, marked?: "edited") => {
    setValues(prev => {
      const next = { ...prev, [id]: value };
      onValuesChange?.(next);
      return next;
    });
    if (marked) setState(prev => ({ ...prev, [id]: { ...prev[id], reviewed: "edited" } }));
  }, [onValuesChange]);

  const stopReading = useCallback(() => {
    clearTimers();
    interrupt.current = true;
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase(p => (p === "reading" ? "done" : p));
  }, []);
  const interrupt = useRef(false);

  /** Roda a leitura e preenche os campos em ordem, um de cada vez. */
  const runRead = useCallback((text: string) => {
    clearTimers();
    interrupt.current = false;
    setPhase("reading");
    setAnnounce(`Reading ${model.name}…`);
    const controller = new AbortController();
    abortRef.current = controller;
    const delay = reduce ? 60 : 750;
    later(async () => {
      let result: SmartFormFillResult;
      try { result = await extract(text, controller.signal); } catch { result = {}; }
      if (controller.signal.aborted || interrupt.current) return;
      snapshot.current = { ...valuesRef.current };
      setPhase("filling");
      const targets = fields.flatMap(field => {
        const entry = result[field.id];
        return entry?.value ? [[field, entry] as const] : [];
      });
      if (reduce) {
        const patch: Record<string, FieldState> = {};
        setValues(prev => {
          const next = { ...prev };
          targets.forEach(([field, entry]) => { next[field.id] = entry.value; });
          onValuesChange?.(next);
          return next;
        });
        targets.forEach(([field, entry]) => { patch[field.id] = { ...entry, reviewed: "none" }; });
        setState(prev => ({ ...prev, ...patch }));
        finishFill(targets.length);
        return;
      }
      targets.forEach(([field, entry], index) => {
        later(() => {
          setActiveId(field.id);
        }, index * 140);
        later(() => {
          setValues(prev => { const next = { ...prev, [field.id]: entry.value }; onValuesChange?.(next); return next; });
          setState(prev => ({ ...prev, [field.id]: { ...entry, reviewed: "none" } }));
          setAnnounce(`${fields.findIndex(f => f.id === field.id) + 1} of ${targets.length}: ${field.label}.`);
        }, index * 140 + 200);
        later(() => { if (activeIdRef.current === field.id) setActiveId(null); }, index * 140 + 200 + 900);
      });
      later(() => finishFill(targets.length), targets.length * 140 + 300);
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimers, extract, fields, later, model.name, onValuesChange, reduce]);

  const valuesRef = useRef(values);
  valuesRef.current = values;
  const activeIdRef = useState(() => ({ current: null as string | null }))[0];
  activeIdRef.current = activeId;

  /** Paste no editor agenda a leitura ~700ms depois (dando tempo de o texto chegar). */
  const scheduleReadOnPaste = useCallback(() => {
    later(() => {
      const node = cardRef.current;
      if (!node) return;
      setWellText(node.value);
      runRead(node.value);
    }, 700);
  }, [later, runRead]);

  /** Estado vazio: o botão cicla pelos exemplos sem depender de colagem. */
  const trySample = useCallback(() => {
    if (!samples.length) return;
    sampleIndex.current = (sampleIndex.current + 1) % samples.length;
    const next = samples[sampleIndex.current];
    if (!next) return;
    setWellText(next.text);
    runRead(next.text);
  }, [samples, runRead]);

  const finishFill = useCallback((count: number) => {
    setActiveId(null);
    setPhase("done");
    const still = fields.filter(field => {
      const entry = stateRef.current[field.id];
      return entry?.confidence != null && entry.confidence < reviewThreshold && entry.reviewed === "none";
    });
    setAnnounce(`Filled ${count} fields${still.length ? `, ${still.length} need review` : ""}${extract === simulatedExtract ? ", simulated run" : ""}.`);
  }, [fields, reviewThreshold]);

  const stateRef = useRef(state);
  stateRef.current = state;

  const doUndo = useCallback(() => {
    clearTimers();
    const restored = { ...snapshot.current };
    setValues(restored);
    setState({});
    setActiveId(null);
    setPhase("done");
    setAnnounce("Values restored.");
    onUndo?.(restored);
  }, [clearTimers, onUndo]);

  const checkField = useCallback((id: string) => {
    setState(prev => ({ ...prev, [id]: { ...prev[id], reviewed: "checked" } }));
    const field = fields.find(entry => entry.id === id);
    setAnnounce(field ? `${field.label} checked.` : "Checked.");
  }, [fields]);

  const startSave = useCallback(async () => {
    if (saving) return;
    const pending = reviewIds.length;
    if (pending) {
      const firstId = reviewIds[0];
      if (firstId) inputRefs.current.get(firstId)?.focus();
      setAnnounce(`${pending} field${pending > 1 ? "s" : ""} need review.`);
      return;
    }
    setSaving(true);
    try {
      await onSubmit?.(valuesRef.current);
      setPhase("saved");
      setSaveDone(true);
      setAnnounce("Contact saved.");
      later(() => { setSaveDone(false); setPhase("done"); }, 1900);
    } finally { setSaving(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewIds.join(","), saving, onSubmit]);

  /** Autoplay: colar → ler → preencher → segurar → desfazer → próximo exemplo. Para para sempre no primeiro toque. */
  useEffect(() => {
    if (!playAuto || !onScreen || phase !== "done") return;
    const hold = 4200;
    const t1 = later(() => { if (interrupt.current) return; doUndo(); }, hold);
    const t2 = later(() => {
      if (!samples.length) return;
      sampleIndex.current = (sampleIndex.current + 1) % samples.length;
      const next = samples[sampleIndex.current];
      if (!next) return;
      setWellText(next.text);
      runRead(next.text);
    }, hold + 1500);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playAuto, onScreen, phase]);

  // O demo já abre preenchido (estado final legível); o loop começa daí.
  useEffect(() => {
    const patch: Record<string, FieldState> = {};
    const valuesNext: Record<string, string> = { ...values };
    Object.entries(simulateContactText(SIGNATURE_SAMPLE)).forEach(([id, entry]) => {
      if (!fields.some(f => f.id === id)) return;
      patch[id] = { ...entry, reviewed: "none" };
      valuesNext[id] = entry.value;
    });
    setValues(valuesNext);
    setState(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { clearTimers(); abortRef.current?.abort(); }, [clearTimers]);

  const onCardPointer = useCallback(() => { if (!interacted.current) { interacted.current = true; } }, []);
  const onCardKey = useCallback((event: React.KeyboardEvent) => {
    onCardPointer();
    if (event.key === "Escape") stopReading();
  }, [stopReading]);

  const segments = useMemo(() => {
    const parts: { text: string; fieldId?: string }[] = [];
    const sources = Object.entries(state).filter(([, entry]) => entry.source).map(([id, entry]) => ({ id, text: entry.source as string })).sort((a, b) => b.text.length - a.text.length);
    let rest = wellText;
    let guard = 0;
    while (rest && guard++ < 24) {
      let best: { start: number; entry: { id: string; text: string } } | null = null;
      for (const entry of sources) {
        const at = rest.indexOf(entry.text);
        if (at >= 0 && (!best || at < best.start)) best = { start: at, entry };
      }
      if (!best) { parts.push({ text: rest }); break; }
      if (best.start > 0) parts.push({ text: rest.slice(0, best.start) });
      parts.push({ text: best.entry.text, fieldId: best.entry.id });
      rest = rest.slice(best.start + best.entry.text.length);
    }
    return parts;
  }, [wellText, state]);

  const hoverId = useState<string | null>(null);
  /** Três níveis (doc): ≥98 neutro, ≥92 suave, <92 forte; campo ativo/em hover fica forte. */
  const highlightFor = (fieldId?: string) => {
    if (!fieldId) return undefined;
    if (fieldId === activeId || fieldId === hoverId[0]) return styles.srcStrong;
    const conf = state[fieldId]?.confidence ?? 0;
    if (conf >= .98) return styles.src;
    if (conf >= .92) return styles.srcSoft;
    return styles.srcStrong;
  };

  const logoFor = (company: string) => {
    if (!company.trim()) return null;
    return resolveLogo?.(company) ?? builtInLogos[company.toLowerCase()] ?? <CompanyChip />;
  };
  const statusText = phase === "saved" ? "Contact saved" : reviewIds.length ? `${filledIds.length} filled · ${reviewIds.length} need review` : filledIds.length ? `${filledIds.length} of ${fields.length} fields filled` : "";

  return (
    <div
      {...{ ref: screenRef }}
      className={[styles.card, className].filter(Boolean).join(" ")}
      onPointerDown={onCardPointer}
      onKeyDown={onCardKey}
      role="group"
      aria-label={title}
    >
      <div className={styles.left}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {description ? <p className={styles.desc}>{description}</p> : null}
      </div>

      {phase === "editing" ? (
        <div className={styles.well}>
          <textarea
            className={styles.editArea}
            defaultValue={wellText}
            aria-label="Pasted text"
            onKeyDown={event => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { (event.target as HTMLTextAreaElement).select(); setWellText((event.target as HTMLTextAreaElement).value); setPhase("reading"); runRead((event.target as HTMLTextAreaElement).value); } }}
            onPaste={scheduleReadOnPaste}
            ref={node => { cardRef.current = node; }}
          />
          <div className={styles.wellFooter}>
            <button type="button" className={styles.ghost} onClick={() => { const node = cardRef.current as HTMLTextAreaElement | null; if (node) setWellText(node.value); setPhase(wellText ? "done" : "empty"); }}>Cancel</button>
            <button type="button" className={styles.smallPrimary} onClick={() => { const node = cardRef.current as HTMLTextAreaElement | null; if (node) { setWellText(node.value); runRead(node.value); } }}><LoaderCircle size={14} className={styles.spin} aria-hidden="true" /> Fill</button>
          </div>
        </div>
      ) : phase === "empty" ? (
        <div className={styles.well} role="region" aria-label="Pasted text" tabIndex={0}>
          <div className={styles.wellText}>
            <p className={styles.emptyHint}>Nothing pasted yet — try one of the samples.</p>
          </div>
          <div className={styles.wellFooter}>
            <button type="button" className={styles.ghost} onClick={trySample}><Pencil size={14} aria-hidden="true" /> Try sample</button>
          </div>
        </div>
      ) : (
        <div className={styles.well} role="region" aria-label="Pasted text" tabIndex={0}>
          <div className={styles.wellText}>
            {segments.map((part, index) => part.fieldId
              ? <mark key={`${part.fieldId}-${index}`} className={highlightFor(part.fieldId)} onMouseEnter={() => hoverId[1](part.fieldId ?? null)} onMouseLeave={() => hoverId[1](null)}>{part.text}</mark>
              : <span key={index}>{part.text}</span>)}
          </div>
          <div className={styles.wellFooter}>
            <AnimatePresence initial={false} mode="wait">
              {phase === "reading"
                ? <motion.span key="reading" className={styles.reading} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} exit={crossfadeOut}>{model.mark}<span className={styles.shimmer}>Reading with {model.name}…</span></motion.span>
                : <motion.span key="credit" className={styles.credit} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 2 }} animate={crossfadeIn} exit={crossfadeOut}>{model.mark}<span>Read by {model.name}</span></motion.span>}
            </AnimatePresence>
            <button type="button" className={styles.ghost} onClick={() => setPhase("editing")}><Pencil size={14} aria-hidden="true" /> Edit text</button>
          </div>
        </div>
      )}
      </div>

      <div className={styles.right}>
      <div className={styles.grid}>
        {fields.map(field => {
          const entry = state[field.id];
          const hasConfidence = entry?.confidence != null;
          const needsReview = hasConfidence && (entry.confidence as number) < reviewThreshold && entry.reviewed === "none";
          const statusLabel = !hasConfidence ? null
            : entry.reviewed === "checked" ? "Checked"
              : entry.reviewed === "edited" ? "Edited"
                : needsReview ? "Review" : undefined;
          const badgeKey = !hasConfidence ? "empty" : `${Math.round((entry.confidence as number) * 100)}-${entry.reviewed}`;
          return (
            <label key={field.id} className={[styles.field, field.span ? styles.span : ""].join(" ")}>
              <span className={styles.fieldTop}>
                <span className={styles.fieldLabel}>{field.label}</span>
                {hasConfidence ? (
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={badgeKey} className={[styles.badge, needsReview ? styles.badgeReview : ""].join(" ")} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 2, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={crossfadeIn} exit={crossfadeOut}>
                      <span className={needsReview ? styles.dotWarn : styles.dotOk} aria-hidden="true" />
                      {statusLabel ?? `${Math.round((entry.confidence as number) * 100)}%`}
                    </motion.span>
                  </AnimatePresence>
                ) : null}
              </span>
              <span className={[styles.inputWrap, activeId === field.id ? styles.breath : "", needsReview ? styles.reviewWrap : ""].filter(Boolean).join(" ")}>
                {field.kind === "company" ? (
                  <span className={styles.logoSlot}>{logoFor(values[field.id] ?? "")}</span>
                ) : null}
                <input
                  ref={node => { if (node) inputRefs.current.set(field.id, node); else inputRefs.current.delete(field.id); }}
                  className={styles.input}
                  type={field.kind === "email" ? "email" : field.kind === "tel" || field.kind === "phone" ? "tel" : field.kind === "url" ? "url" : "text"}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  value={values[field.id] ?? ""}
                  aria-invalid={needsReview || undefined}
                  aria-description={hasConfidence ? `${Math.round((entry.confidence as number) * 100)}% confident${entry.note ? `. ${entry.note}` : ""}` : undefined}
                  onChange={event => setValue(field.id, event.target.value, "edited")}
                  onFocus={() => hoverId[1](field.id)}
                  onBlur={() => hoverId[1](null)}
                />
                {needsReview ? (
                  <button type="button" className={styles.checkBtn} aria-label={`Check ${field.label}`} onClick={() => checkField(field.id)}>
                    <Check size={13} aria-hidden="true" /> Check
                  </button>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span className={styles.status} aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={statusText || "idle"} className={[styles.statusInner, phase === "saved" ? styles.statusOk : ""].join(" ")} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 2 }} animate={crossfadeIn} exit={crossfadeOut}>
              {phase === "saved" ? <><Check size={14} aria-hidden="true" /> {statusText}</> : statusText ? <>{statusText}</> : null}
            </motion.span>
          </AnimatePresence>
          <span className={styles.srOnly}>{announce}</span>
        </span>
        <span className={styles.actions}>
          <button type="button" className={styles.ghostBtn} onClick={doUndo} disabled={!filledIds.length}><Undo2 size={14} aria-hidden="true" /> Undo</button>
          <button type="button" className={styles.primary} onClick={() => { void startSave(); }} disabled={saving}>
            {saving ? <LoaderCircle size={14} className={styles.spin} aria-hidden="true" /> : saveDone ? <Check size={14} aria-hidden="true" /> : null}
            <span>{saving ? "Saving…" : submitLabel}</span>
          </button>
        </span>
      </div>
      </div>
    </div>
  );
}

export default SmartFormFill;
