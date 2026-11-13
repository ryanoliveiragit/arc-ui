"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { Check, RotateCcw, Sparkles, Square, TriangleAlert } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./agent-cursor.module.css";

export type AgentCursorPhase = "idle" | "thinking" | "editing" | "review" | "accepted" | "reverted" | "stopped" | "empty" | "error";

export interface DocBlock {
  id: string;
  kind: "title" | "h" | "p";
  text: string;
}

export type AgentEdit =
  | { type: "rewrite"; blockId: string; text: string; label?: string }
  | { type: "insert"; afterId: string; block: DocBlock; label?: string }
  | { type: "fix"; blockId: string; from: string; to: string; label?: string };

export interface AgentCursorProps {
  /** O documento como blocos de título, heading e parágrafo com ids estáveis. */
  blocks?: DocBlock[];
  /** Linha discreta sob o título, como dono e data-alvo. */
  meta?: string;
  /** Edits para reproduzir em ordem. Ignorado quando há run. */
  edits?: AgentEdit[];
  /** Busca edits no seu agente; o signal aborta no Stop. Rejeição vira erro com Retry. */
  run?: (signal: AbortSignal) => Promise<AgentEdit[]>;
  agent?: { name?: string; mark?: React.ReactNode; color?: string };
  /** Humano dentro do doc, desenhado como segundo cursor. Null oculta. */
  collaborator?: { name: string; avatar?: string; color?: string } | null;
  autoPlay?: boolean;
  /** Rejoga o run: aceita depois de uma pausa (nunca com hover/focus no card) e reinicia. Padrão true no exemplo. */
  loop?: boolean;
  speed?: number;
  onAccept?: (blocks: DocBlock[]) => void;
  onUndo?: (blocks: DocBlock[]) => void;
  onPhaseChange?: (phase: AgentCursorPhase) => void;
  /** Acrescenta "Simulated, nothing was saved" ao status de leitor de tela. Padrão true no exemplo. */
  simulated?: boolean;
  className?: string;
}

/** Cor da marca Claude (terceiros); cursor, seleção e tint seguem esse valor. */
const CLAUDE_COLOR = "#D97757";

const SAMPLE_BLOCKS: DocBlock[] = [
  { id: "title", kind: "title", text: "Usage-based billing launch" },
  {
    id: "intro",
    kind: "p",
    text: "On November 18 every Team workspace moves to usage-based billing: seats plus metered agent runs, invoiced monthly through Stripe.",
  },
  {
    id: "goals",
    kind: "p",
    text: "We want customers to be able to see what they will actually end up paying before any invoice even arrives. Surprise bills drove 31% of all billing tickets in Q3, and we keep hearing the same story on renewal calls. A live usage meter plus spend alerts should ship early enough that nobody is caught out on day one.",
  },
  { id: "rollout-h", kind: "h", text: "Rollout" },
  {
    id: "rollout",
    kind: "p",
    text: "Week one goes to 5% of workspaces behind the usage_billing flag. We widen to 50% once refund requests stay under 0.4% for seven days, then ship to everyone on December 2.",
  },
];

const TIGHT_GOALS =
  "Customers should see what they will pay before the invoice arrives. Surprise bills drove 31% of billing tickets in Q3, so a live usage meter and spend alerts ship on day one.";

const SAMPLE_META = "Emma Collins · Target Nov 18, 2026";

const SAMPLE_EDITS: AgentEdit[] = [
  { type: "rewrite", blockId: "goals", text: TIGHT_GOALS, label: "Tightening the goals" },
  { type: "insert", afterId: "intro", block: { id: "goals-h", kind: "h", text: "Goals" }, label: "Adding a heading" },
  { type: "fix", blockId: "rollout", from: "goes", to: "rolls out", label: "Fixing a typo" },
];

interface RT {
  id: string;
  kind: DocBlock["kind"];
  /** Texto original (o que Undo restaura). */
  base: string;
  /** Texto-alvo da edição (o que fica aceito). */
  live: string;
  mode: "plain" | "fade" | "stream";
  count: number;
  fixFrom: string | null;
  fixTo: string | null;
  tint: boolean;
  changed: boolean;
  inserted: boolean;
}

const buildRT = (blocks: DocBlock[]): RT[] =>
  blocks.map(block => ({
    id: block.id,
    kind: block.kind,
    base: block.text,
    live: block.text,
    mode: "plain",
    count: 0,
    fixFrom: null,
    fixTo: null,
    tint: false,
    changed: false,
    inserted: false,
  }));

interface Point {
  x: number;
  y: number;
}
interface Rect extends Point {
  w: number;
  h: number;
}

/** Posição de um ponto do texto relativo ao box do card. */
function textPoint(card: HTMLElement, blockEl: HTMLElement, kind: "start" | "end" | "word", needle?: string): Point | null {
  const cr = card.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(blockEl);
  const rects = Array.from(range.getClientRects()).filter(r => r.width > 2 && r.height > 4);
  if (kind === "word" && needle != null) {
    const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode() as Text | null;
    while (node) {
      const at = node.data.indexOf(needle);
      if (at >= 0) {
        const wr = document.createRange();
        wr.setStart(node, at);
        wr.setEnd(node, at + needle.length);
        const r = wr.getBoundingClientRect();
        return { x: r.left - cr.left, y: r.top + r.height - cr.top };
      }
      node = walker.nextNode() as Text | null;
    }
    const last = rects[rects.length - 1];
    if (!last) return null;
    return { x: last.right - cr.left, y: last.bottom - cr.top };
  }
  const target = kind === "start" ? rects[0] : rects[rects.length - 1];
  if (!target) return null;
  return kind === "start"
    ? { x: target.left - cr.left, y: target.bottom - cr.top }
    : { x: target.right - cr.left, y: target.bottom - cr.top };
}

function selectionRects(card: HTMLElement, blockEl: HTMLElement): Rect[] {
  const cr = card.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(blockEl);
  return Array.from(range.getClientRects())
    .filter(r => r.width > 2 && r.height > 4)
    .map(r => ({ x: r.left - cr.left, y: r.top - cr.top, w: r.width, h: r.height }));
}

function ClaudeMark({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g fill="currentColor">
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
          <rect key={angle} x={11.2} y={1.6} width={1.9} height={7.4} rx={0.95} transform={`rotate(${angle} 12 12)`} />
        ))}
        <circle cx={12} cy={12} r={2.3} />
      </g>
    </svg>
  );
}

function CursorArrow({ color, surface }: { color: string; surface: string }) {
  return (
    <svg width={17} height={19} viewBox="0 0 17 19" aria-hidden="true" style={{ display: "block" }}>
      <path
        d="M1.2 1 L1.2 14.6 L4.6 11.5 L6.9 17 L9.3 16 L7 10.7 L11.9 10.2 Z"
        fill={color}
        stroke={surface}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AgentCursor({
  blocks = SAMPLE_BLOCKS,
  meta,
  edits: editsProp,
  run,
  agent,
  collaborator = { name: "Emma Collins" },
  autoPlay = true,
  loop,
  speed = 1,
  onAccept,
  onUndo,
  onPhaseChange,
  simulated,
  className,
}: AgentCursorProps) {
  const loopOn = loop ?? !run;
  const simulatedOn = simulated ?? !run;
  /** No exemplo os blocks e o meta vêm juntos; meta explícido sempre ganha. */
  const docMeta = meta ?? (blocks === SAMPLE_BLOCKS ? SAMPLE_META : undefined);
  const agentName = agent?.name ?? "Claude";
  const agentColor = agent?.color ?? CLAUDE_COLOR;
  const collabColor = collaborator?.color ?? "var(--series-2)";

  const rawReduce = useReducedMotion();
  const reduce = rawReduce ?? false;

  const [phase, setPhaseState] = useState<AgentCursorPhase>("idle");
  const [status, setStatus] = useState("Ready");
  const [rt, setRt] = useState<RT[]>(() => buildRT(blocks));
  const [sel, setSel] = useState<{ rects: Rect[]; on: number } | null>(null);
  const [flip, setFlip] = useState(false);
  const [cursorIn, setCursorIn] = useState(false);
  const [emmaPos, setEmmaPos] = useState<Point | null>(null);
  const [announce, setAnnounce] = useState("");
  const [errorText, setErrorText] = useState("");
  const [applied, setApplied] = useState(0);
  const [barFlash, setBarFlash] = useState<"ok" | "undo" | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const blockEls = useRef(new Map<string, HTMLElement>());
  const [onScreen, setOnScreen] = useState(true);
  const pauseRef = useRef(false);
  const holdRef = useRef(false);
  const speedRef = useRef(speed);
  const reduceRef = useRef(reduce);
  const seqRef = useRef(0);
  const runningRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  speedRef.current = speed;
  reduceRef.current = reduce;

  const cx = useMotionValue(40);
  const cy = useMotionValue(52);

  const setPhase = useCallback((next: AgentCursorPhase) => {
    setPhaseState(next);
    onPhaseChange?.(next);
  }, [onPhaseChange]);

  /* Documento externo: se blocks muda fora, ele vira o novo baseline. */
  useEffect(() => {
    setRt(buildRT(blocks));
    setSel(null);
  }, [blocks]);

  /* Pausa quando sai da tela. */
  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => setOnScreen(entries.some(entry => entry.isIntersecting)), { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    pauseRef.current = !onScreen;
  }, [onScreen]);
  useEffect(() => () => abortRef.current?.abort(), []);

  /** Pausável por screen-off e abortável pelo Stop. */
  const wait = useCallback((ms: number, signal: AbortSignal) => {
    const total = (reduceRef.current ? ms * 0.12 : ms) / speedRef.current;
    if (total <= 0) return Promise.resolve();
    return new Promise<void>(resolve => {
      let elapsed = 0;
      let last = performance.now();
      const tick = () => {
        const now = performance.now();
        if (!pauseRef.current) elapsed += now - last;
        last = now;
        if (signal.aborted || elapsed >= total) return resolve();
        window.setTimeout(tick, 40);
      };
      window.setTimeout(tick, 40);
    });
  }, []);

  /** Desliza o cursor num arco suave; devolve os ms gastos. */
  const glide = useCallback((target: Point | null): number => {
    if (!target) return 0;
    const card = cardRef.current;
    const width = card ? card.clientWidth : 640;
    setFlip(target.x > width - 150);
    const dist = Math.hypot(target.x - cx.get(), target.y - cy.get());
    const raw = Math.min(600, Math.max(280, dist * 1.1));
    if (reduceRef.current) {
      cx.set(target.x);
      cy.set(target.y);
      return raw;
    }
    const ms = raw / speedRef.current;
    const midY = Math.min(cy.get(), target.y) - 24;
    animate(cx, target.x, { duration: ms / 1000, ease: "easeInOut" });
    animate(cy, [cy.get(), midY, target.y], { duration: ms / 1000, times: [0, 0.5, 1], ease: "easeInOut" });
    return raw;
  }, [cx, cy]);

  const point = useCallback((blockId: string, kind: "start" | "end" | "word", needle?: string) => {
    const card = cardRef.current;
    const el = blockEls.current.get(blockId);
    return card && el ? textPoint(card, el, kind, needle) : null;
  }, []);

  const currentBlocks = useCallback((): DocBlock[] => {
    return rt.map(block => ({ id: block.id, kind: block.kind, text: block.changed ? block.live : block.base }));
  }, [rt]);

  const resetDoc = useCallback((toBlocks: DocBlock[]) => {
    setRt(buildRT(toBlocks));
    setSel(null);
    setBarFlash(null);
    setStatus("Ready");
  }, []);

  /* ---------- runner ---------- */

  const startRun = useCallback(async () => {
    if (runningRef.current || !cardRef.current) return;
    runningRef.current = true;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const seq = ++seqRef.current;
    const alive = () => seq === seqRef.current && !ctrl.signal.aborted;
    resetDoc(blocks);
    setErrorText("");
    setApplied(0);
    setCursorIn(true);
    cx.set(38);
    cy.set(50);
    setPhase("thinking");
    setAnnounce(`${agentName} is thinking about edits${simulatedOn ? ", simulated run" : ""}`);
    setStatus("Thinking");
    await wait(620, ctrl.signal);
    if (!alive()) return;

    let list: AgentEdit[] | null = editsProp ?? (run ? null : SAMPLE_EDITS);
    if (!list && run) {
      try {
        list = await run(ctrl.signal);
      } catch (error) {
        if (alive()) {
          runningRef.current = false;
          setPhase("error");
          setErrorText(error instanceof Error ? error.message : "The agent did not return edits.");
          setAnnounce(`Edit run failed${error instanceof Error ? `: ${error.message}` : ""}`);
        }
        return;
      }
    }
    if (!list || list.length === 0) {
      if (alive()) {
        runningRef.current = false;
        setPhase("empty");
        setAnnounce("The agent has no edits for this document");
      }
      return;
    }

    setPhase("editing");
    let done = 0;

    for (const edit of list) {
      if (!alive()) return;
      const label =
        edit.type === "rewrite" ? edit.label ?? "Rewriting" : edit.type === "insert" ? edit.label ?? "Adding a block" : edit.label ?? "Fixing a typo";
      setStatus(label);

      if (edit.type === "rewrite") {
        const p = point(edit.blockId, "start");
        await wait(glide(p), ctrl.signal);
        if (!alive()) return;
        const card = cardRef.current;
        const el = blockEls.current.get(edit.blockId);
        if (card && el && !reduceRef.current) {
          const rects = selectionRects(card, el);
          setSel({ rects, on: 0 });
          for (let i = 1; i <= rects.length; i += 1) {
            setSel({ rects, on: i });
            await wait(Math.max(40, 420 / Math.max(1, rects.length)), ctrl.signal);
            if (!alive()) return;
          }
          await wait(140, ctrl.signal);
        }
        if (!alive()) return;
        setSel(null);
        setAnnounce(`${label}: replacing paragraph with a tighter version`);
        setRt(current => current.map(b => (b.id === edit.blockId ? { ...b, mode: "fade" } : b)));
        await wait(110, ctrl.signal);
        if (!alive()) return;
        const words = edit.text.split(" ");
        setRt(current => current.map(b => (b.id === edit.blockId ? { ...b, live: edit.text, mode: "stream", count: reduceRef.current ? words.length : 0 } : b)));
        if (reduceRef.current) {
          await wait(120, ctrl.signal);
        } else {
          let count = 0;
          while (count < words.length) {
            count = Math.min(words.length, count + 4);
            setRt(current => current.map(b => (b.id === edit.blockId ? { ...b, count } : b)));
            await wait(34, ctrl.signal);
            if (!alive()) return;
          }
        }
        setRt(current => current.map(b => (b.id === edit.blockId ? { ...b, mode: "plain", tint: true, changed: true } : b)));
        done += 1;
        await wait(430, ctrl.signal);
      } else if (edit.type === "insert") {
        const p = point(edit.afterId, "start");
        await wait(glide(p), ctrl.signal);
        if (!alive()) return;
        setAnnounce(label);
        setRt(current => {
          const at = current.findIndex(b => b.id === edit.afterId);
          const next = current.slice();
          next.splice(at < 0 ? next.length : at + 1, 0, {
            id: edit.block.id,
            kind: edit.block.kind,
            base: edit.block.text,
            live: edit.block.text,
            mode: "plain",
            count: 0,
            fixFrom: null,
            fixTo: null,
            tint: true,
            changed: true,
            inserted: true,
          });
          return next;
        });
        done += 1;
        await wait(reduceRef.current ? 120 : 420, ctrl.signal);
      } else {
        const p = point(edit.blockId, "word", edit.from);
        await wait(glide(p), ctrl.signal);
        if (!alive()) return;
        setAnnounce(label);
        setRt(current => current.map(b => (b.id === edit.blockId ? { ...b, fixFrom: edit.from, fixTo: edit.to } : b)));
        await wait(reduceRef.current ? 120 : 950, ctrl.signal);
        if (!alive()) return;
        setRt(current =>
          current.map(b =>
            b.id === edit.blockId
              ? { ...b, base: b.base.replace(edit.from, edit.to ?? ""), live: b.base.replace(edit.from, edit.to ?? ""), fixFrom: null, tint: false, changed: true }
              : b,
          ),
        );
        done += 1;
        await wait(reduceRef.current ? 80 : 380, ctrl.signal);
      }
    }

    if (!alive()) return;
    const last = list[list.length - 1];
    const restId = last ? (last.type === "insert" ? last.afterId : last.blockId) : "";
    await wait(glide(point(restId, "end")), ctrl.signal);
    if (!alive()) return;
    runningRef.current = false;
    setApplied(done);
    setPhase("review");
    setAnnounce(`${done} ${done === 1 ? "edit" : "edits"} ready for review`);
  }, [agentName, blocks, cx, cy, editsProp, glide, point, reduce, resetDoc, run, setPhase, simulatedOn, wait]);

  const stopRun = useCallback(() => {
    abortRef.current?.abort();
    runningRef.current = false;
    resetDoc(blocks);
    setPhase("stopped");
    setAnnounce("Stopped, changes discarded");
  }, [blocks, resetDoc, setPhase]);

  const doAccept = useCallback(() => {
    const next = currentBlocks();
    onAccept?.(next);
    setPhase("accepted");
    setBarFlash("ok");
    setAnnounce("Accepted, the document was updated");
    window.setTimeout(() => {
      resetDoc(blocks);
      setPhase("idle");
    }, reduceRef.current ? 200 : 950);
  }, [blocks, currentBlocks, onAccept, resetDoc, setPhase]);

  const doUndo = useCallback(() => {
    onUndo?.(blocks);
    setPhase("reverted");
    setBarFlash("undo");
    setAnnounce("Undone, the original document was restored");
    window.setTimeout(() => {
      resetDoc(blocks);
      setPhase("idle");
    }, reduceRef.current ? 200 : 850);
  }, [blocks, onUndo, resetDoc, setPhase]);

  /* Loop: no review, aceita sozinho depois de uma pausa, salvo hover/focus ou screen-off. */
  useEffect(() => {
    if (phase !== "review" || !loopOn || !autoPlay || reduce) return;
    let held = 0;
    const timer = window.setInterval(() => {
      if (holdRef.current || pauseRef.current) return;
      held += 100;
      if (held >= 2400) {
        window.clearInterval(timer);
        doAccept();
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, loopOn, autoPlay, reduce, doAccept]);

  /* Autoplay: começa visível e reinicia após cada ciclo. */
  useEffect(() => {
    if (!autoPlay || runningRef.current) return;
    if (phase !== "idle") return;
    const timer = window.setTimeout(() => {
      if (onScreen && !pauseRef.current && !runningRef.current) void startRun();
    }, 180);
    return () => window.clearTimeout(timer);
  }, [autoPlay, phase, onScreen, startRun]);

  /* Âncora do cursor da colaboradora: fim do primeiro parágrafo, reancora no resize. */
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const anchor = () => {
      const p = point("intro", "end") ?? point(blocks[1]?.id ?? "", "end");
      setEmmaPos(p);
    };
    anchor();
    let frame = 0;
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(anchor);
    });
    observer?.observe(card);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [point, blocks]);

  const headerButton = useMemo(() => {
    if (phase === "thinking" || phase === "editing")
      return { icon: <Square size={14} aria-hidden="true" />, label: "Stop", onClick: stopRun };
    if (phase === "review") return { icon: <RotateCcw size={13} aria-hidden="true" />, label: "Run again", onClick: () => void startRun() };
    if (phase === "error") return { icon: <TriangleAlert size={13} aria-hidden="true" />, label: "Retry", onClick: () => void startRun() };
    if (phase === "stopped" || phase === "reverted")
      return { icon: <RotateCcw size={13} aria-hidden="true" />, label: "Run again", onClick: () => void startRun() };
    if (phase === "idle" && !autoPlay)
      return { icon: <Sparkles size={13} aria-hidden="true" />, label: `Ask ${agentName}`, onClick: () => void startRun() };
    return null;
  }, [phase, autoPlay, stopRun, startRun, agentName]);

  const surfaceToken = "var(--surface)";

  return (
    <div
      ref={cardRef}
      spellCheck={false}
      className={[styles.card, className].filter(Boolean).join(" ")}
      style={{ "--agent": agentColor } as React.CSSProperties}
      onMouseEnter={() => {
        holdRef.current = true;
      }}
      onMouseLeave={() => {
        holdRef.current = false;
      }}
      onFocusCapture={() => {
        holdRef.current = true;
      }}
      onBlurCapture={() => {
        holdRef.current = false;
      }}
    >
      <p className={styles.srOnly} role="status" aria-live="polite">
        {announce}
        {announce && simulatedOn ? ", Simulated, nothing was saved" : ""}
      </p>

      {/* cabeçalho: presença + status + ação */}
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <span className={styles.agentChip} style={{ color: agentColor, background: "color-mix(in oklab, " + agentColor + " 16%, transparent)" }}>
            {agent?.mark ?? <ClaudeMark size={15} />}
          </span>
          {collaborator?.avatar ? (
            <img className={styles.collabAvatar} src={collaborator.avatar} alt="" aria-hidden="true" />
          ) : null}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={status}
              className={styles.status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: reduce ? 0 : 0.16 } }}
              exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.1 } }}
            >
              {status}
            </motion.span>
          </AnimatePresence>
        </div>
        {headerButton ? (
          <button type="button" className={styles.headBtn} onClick={headerButton.onClick}>
            {headerButton.icon}
            {headerButton.label}
          </button>
        ) : null}
      </div>

      {/* documento */}
      <div className={styles.doc} aria-busy={phase === "editing" || phase === "thinking"}>
        {rt.map((block, index) => (
          <Fragment key={block.id}>
          <motion.div
            ref={el => {
              if (el) blockEls.current.set(block.id, el);
              else blockEls.current.delete(block.id);
            }}
            className={[
              styles.block,
              block.kind === "title" ? styles.title : block.kind === "h" ? styles.h : styles.p,
              block.tint ? styles.tinted : null,
            ]
              .filter(Boolean)
              .join(" ")}
            initial={block.inserted && !reduce ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            transition={reduce ? { duration: 0 } : motionTokens.spring.smooth}
          >
            {block.kind === "title" ? (
              <h2 className={styles.titleText}>{block.base}</h2>
            ) : block.kind === "h" ? (
              <h3 className={styles.hText}>{block.live}</h3>
            ) : block.mode === "stream" ? (
              <span className={styles.streamWrap}>
                <span className={styles.ghost} aria-hidden="true">
                  {block.live}
                </span>
                <span className={styles.live}>
                  {block.live
                    .split(" ")
                    .slice(0, block.count)
                    .map((word, index, arr) => (
                      <span key={index} className={index >= arr.length - 3 ? styles.fresh : undefined}>
                        {word}
                        {index < arr.length - 1 ? " " : ""}
                      </span>
                    ))}
                </span>
              </span>
            ) : block.mode === "fade" ? (
              <motion.span
                className={styles.fadeOut}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.11, ease: "easeOut" }}
              >
                {block.base}
              </motion.span>
            ) : (
              <span>
                {block.fixFrom != null
                  ? (() => {
                      const at = block.base.indexOf(block.fixFrom);
                      return (
                        <>
                          {at >= 0 ? block.base.slice(0, at) : block.base}
                          {at >= 0 ? <span className={styles.fixMark}>{block.fixFrom}</span> : null}
                          {at >= 0 ? block.base.slice(at + block.fixFrom.length) : ""}
                        </>
                      );
                    })()
                  : block.changed
                    ? block.live
                    : block.base}
              </span>
            )}
          </motion.div>
          {index === 0 && docMeta ? <p className={styles.meta}>{docMeta}</p> : null}
          </Fragment>
        ))}
      </div>

      {/* seleção linha a linha */}
      {sel ? (
        <div className={styles.selLayer} aria-hidden="true">
          {sel.rects.map((rect, index) => (
            <span
              key={index}
              className={`${styles.selRect} ${index < sel.on ? styles.selOn : ""}`}
              style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
            />
          ))}
        </div>
      ) : null}

      {/* cursores */}
      <div className={styles.cursorLayer} aria-hidden="true">
        {collaborator ? (
          <div
            className={`${styles.cursor} ${styles.cursorCollab}`}
            style={{ transform: emmaPos ? `translate(${emmaPos.x}px, ${emmaPos.y}px)` : "translate(-40px, -40px)", opacity: emmaPos ? 1 : 0 }}
          >
            <span className={styles.driftBox}>
              <span className={styles.arrow}><CursorArrow color={collabColor} surface={surfaceToken} /></span>
              <span className={styles.tag}>
                {collaborator.avatar ? <img className={styles.tagAvatar} src={collaborator.avatar} alt="" /> : <span className={styles.tagDot} style={{ background: collabColor }} />}
                <span className={styles.tagName}>{collaborator.name.split(" ")[0]}</span>
              </span>
            </span>
          </div>
        ) : null}
        <motion.div className={styles.cursorAgent} style={{ x: cx, y: cy, opacity: cursorIn ? 1 : 0 }}>
          <span className={styles.arrow}><CursorArrow color={agentColor} surface={surfaceToken} /></span>
          <span className={`${styles.tag} ${flip ? styles.tagFlip : ""}`}>
            <span className={styles.tagMark} style={{ color: agentColor }}>{agent?.mark ?? <ClaudeMark size={11} />}</span>
            <span className={styles.tagName}>{agentName}</span>
          </span>
        </motion.div>
      </div>

      {/* barra de revisão flutuante */}
      <AnimatePresence>
        {(phase === "review" || phase === "accepted" || phase === "reverted" || phase === "error" || phase === "empty") && (
          <motion.div
            key="bar"
            className={styles.bar}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.2, ease: motionTokens.ease.enter } }}
            exit={{ opacity: 0, y: 6, transition: { duration: reduce ? 0 : 0.12 } }}
          >
            {phase === "error" ? (
              <>
                <span className={styles.barIcon} style={{ color: "var(--danger)" }}><TriangleAlert size={14} /></span>
                <span className={styles.barText}>{errorText}</span>
                <button type="button" className={styles.barBtn} onClick={() => void startRun()}>
                  <RotateCcw size={12} aria-hidden="true" /> Retry
                </button>
              </>
            ) : phase === "empty" ? (
              <span className={styles.barText}><span className={styles.okIcon} aria-hidden="true"><Check size={13} /></span> No changes suggested</span>
            ) : barFlash === "ok" ? (
              <span className={styles.barText}>
                <span className={styles.okIcon} aria-hidden="true"><Check size={13} /></span> Accepted
              </span>
            ) : barFlash === "undo" ? (
              <span className={styles.barText}>
                <span className={styles.undoIcon} aria-hidden="true"><RotateCcw size={12} /></span> Undone
              </span>
            ) : (
              <>
                <span className={styles.barText}>
                  <strong>{applied}</strong> suggested changes <span className={styles.byLine}>by {agentName}</span>
                </span>
                <span className={styles.barSep} aria-hidden="true" />
                <button type="button" className={styles.barBtn} onClick={doUndo}>
                  <RotateCcw size={12} aria-hidden="true" /> Undo
                </button>
                <button type="button" className={styles.barBtnAccent} onClick={doAccept}>
                  <Check size={13} aria-hidden="true" /> Accept changes
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
