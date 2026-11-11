"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import { AmountField, BetField, GameFrame, HistoryChips, PlayButton, formatAmount, formatMultiplier, roundAmount, usePlayMoney } from "./play-money";
import type { HistoryEntry } from "./play-money";
import styles from "./crash-game.module.css";

export interface CrashRound {
  /** Round number, starting at 1. */
  id: number;
  /** Multiplier at which the round crashed. */
  crashPoint: number;
  /** Multiplier the player cashed out at, or null when the bet was lost. */
  cashedOutAt: number | null;
  /** Amount bet. */
  bet: number;
  /** Amount paid back (0 when the bet was lost). */
  payout: number;
}

export interface CrashGameProps {
  /** Controlled play-money balance. */
  balance?: number;
  /** Starting balance when uncontrolled; the reset button returns to it. */
  defaultBalance?: number;
  /** Called with the new balance after a bet, a payout or a reset. */
  onBalanceChange?: (balance: number) => void;
  /** Bet amount shown at first. */
  defaultBet?: number;
  /** Smallest bet. */
  minBet?: number;
  /** A round never goes past this multiplier. */
  maxMultiplier?: number;
  /** Part of each bet the game keeps on average, from 0 to 0.5. It makes early crashes a little more likely. */
  margin?: number;
  /** Growth of the curve: the multiplier is e^(speed × seconds). */
  speed?: number;
  /** Crash points of earlier rounds for the history chips, newest first. */
  defaultHistory?: number[];
  /** How many history chips to keep. */
  historySize?: number;
  /** Called when a round crashes, with what the player got out of it. */
  onRoundEnd?: (round: CrashRound) => void;
  /** Random source returning a number in [0, 1). Called once per round, when the bet is placed. */
  random?: () => number;
  /** Name shown in the header. */
  title?: string;
  /** Extra class for the card. */
  className?: string;
}

type Phase = "idle" | "running" | "crashed";

interface RoundState { id: number; crashPoint: number; elapsed: number; bet: number; cashedAt: number | null; cashedTime: number; auto: number; drawnAt: number }

/** Fixed sample of earlier rounds: nothing random happens before the first bet. */
const sampleHistory = [1.84, 3.12, 1.07, 2.46, 14.3, 1.33, 5.61, 1.92];
/** Guide lines sit on fixed multipliers and sink as the scale grows, which reads as the camera pulling back. */
const levels = [1, 1.5, 2, 3, 5, 10, 20, 50, 100];
/** The dashed curve drawn before the first round, as a hint of what is coming. */
const ghostPoint = 2.6;
/** Once the player is out, the rest of the round plays faster. */
const fastForward = 3;
const curveSteps = 44;

const toneOf = (point: number): HistoryEntry["tone"] => (point >= 10 ? "high" : point >= 2 ? "mid" : "low");
const levelLabel = (level: number) => `${level}×`;

/** A crash game with fake money: the multiplier climbs along a curve until it crashes at a random point; cash out first to keep the bet times the multiplier. */
export function CrashGame({
  balance,
  defaultBalance = 1000,
  onBalanceChange,
  defaultBet = 10,
  minBet = 1,
  maxMultiplier = 50,
  margin = 0.03,
  speed = 0.26,
  defaultHistory = sampleHistory,
  historySize = 8,
  onRoundEnd,
  random = Math.random,
  title = "Crash",
  className,
}: CrashGameProps) {
  const reduceMotion = useReducedMotion();
  const money = usePlayMoney({ balance, defaultBalance, onBalanceChange });
  const [bet, setBet] = useState(defaultBet);
  const [auto, setAuto] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [cashedAt, setCashedAt] = useState<number | null>(null);
  const [history, setHistory] = useState(() => defaultHistory.slice(0, historySize).map((point, index) => ({ id: -1 - index, point })));
  const [announcement, setAnnouncement] = useState("");
  const [size, setSize] = useState({ width: 0, height: 0 });

  const phaseRef = useRef<Phase>("idle");
  const round = useRef<RoundState>({ id: 0, crashPoint: 1, elapsed: 0, bet: 0, cashedAt: null, cashedTime: 0, auto: 0, drawnAt: 0 });
  const multiplier = useMotionValue(1);
  const multiplierText = useTransform(multiplier, formatMultiplier);
  const cashOutText = useTransform(multiplier, value => formatAmount(roundAmount(round.current.bet * Math.floor(value * 100) / 100)));

  const chart = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLDivElement>(null);
  const line = useRef<SVGPathElement>(null);
  const area = useRef<SVGPathElement>(null);
  const head = useRef<SVGGElement>(null);
  const mark = useRef<SVGGElement>(null);
  const guides = useRef<(SVGGElement | null)[]>([]);

  /** Plots the curve from 1× to `value`. The time and multiplier scales stretch with the round, so the head settles near the top right. */
  const draw = useCallback((value: number, elapsed: number) => {
    const { width, height } = size;
    if (!width || !height) return;
    const left = 14, right = width * 0.14 + 14, top = height * 0.24, bottom = 22;
    const plotWidth = width - left - right, plotHeight = height - top - bottom, base = height - bottom;
    const timeSpan = Math.max(elapsed, 4), valueSpan = Math.max(value, 1.6);
    const x = (time: number) => left + (time / timeSpan) * plotWidth;
    const y = (point: number) => base - ((point - 1) / (valueSpan - 1)) * plotHeight;
    let path = "";
    for (let step = 0; step <= curveSteps; step++) {
      const time = (elapsed * step) / curveSteps;
      path += `${step ? "L" : "M"}${x(time).toFixed(1)} ${y(Math.exp(speed * time)).toFixed(1)}`;
    }
    const endX = x(elapsed), endY = y(value);
    line.current?.setAttribute("d", path);
    area.current?.setAttribute("d", `${path}L${endX.toFixed(1)} ${base}L${left} ${base}Z`);
    head.current?.setAttribute("transform", `translate(${endX.toFixed(1)} ${endY.toFixed(1)})`);
    const state = round.current;
    if (mark.current) {
      const cashed = phaseRef.current !== "idle" && state.cashedAt !== null;
      mark.current.style.display = cashed ? "" : "none";
      if (cashed) {
        const markX = x(state.cashedTime);
        mark.current.setAttribute("transform", `translate(${markX.toFixed(1)} ${y(state.cashedAt ?? 1).toFixed(1)})`);
        // The label sits up and to the left, over the empty side of the curve; next to the left edge it drops under the curve instead.
        const label = mark.current.lastElementChild;
        const tight = markX < 64;
        label?.setAttribute("text-anchor", tight ? "start" : "end");
        label?.setAttribute("x", tight ? "9" : "-9");
        label?.setAttribute("y", tight ? "17" : "-9");
      }
    }
    levels.forEach((level, index) => {
      const guide = guides.current[index];
      if (!guide) return;
      const lineY = y(level);
      // A guide shows while it is inside the plot and far enough from the 1× baseline to keep its label readable.
      const visible = level === 1 || (level <= valueSpan * 1.02 && base - lineY > 18);
      guide.setAttribute("transform", `translate(0 ${Math.max(lineY, -20).toFixed(1)})`);
      guide.style.opacity = visible ? "1" : "0";
    });
  }, [size, speed]);

  useLayoutEffect(() => {
    const node = chart.current;
    if (!node) return;
    const measure = () => setSize(current => (current.width === node.clientWidth && current.height === node.clientHeight ? current : { width: node.clientWidth, height: node.clientHeight }));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Redraw on resize: the idle hint, the live curve or the final one, whichever is on screen.
  useLayoutEffect(() => {
    if (phaseRef.current === "idle") draw(ghostPoint, Math.log(ghostPoint) / speed);
    else draw(Math.exp(speed * round.current.elapsed), round.current.elapsed);
  }, [draw, speed]);

  const cashOut = (at?: number) => {
    const state = round.current;
    if (phaseRef.current !== "running" || state.cashedAt !== null) return;
    const live = Math.floor(Math.exp(speed * state.elapsed) * 100) / 100;
    const value = Math.min(Math.max(at ?? live, 1), state.crashPoint);
    const payout = roundAmount(state.bet * value);
    state.cashedAt = value;
    state.cashedTime = Math.log(value) / speed;
    money.pay(payout);
    setCashedAt(value);
    setAnnouncement(`Cashed out at ${formatMultiplier(value)}. ${formatAmount(payout)} added to the balance.`);
  };

  const finish = () => {
    const state = round.current;
    phaseRef.current = "crashed";
    setPhase("crashed");
    state.elapsed = Math.log(state.crashPoint) / speed;
    multiplier.set(state.crashPoint);
    draw(state.crashPoint, state.elapsed);
    setHistory(list => [{ id: state.id, point: state.crashPoint }, ...list].slice(0, historySize));
    const payout = state.cashedAt === null ? 0 : roundAmount(state.bet * state.cashedAt);
    setAnnouncement(`Crashed at ${formatMultiplier(state.crashPoint)}. ${state.cashedAt === null ? `The bet of ${formatAmount(state.bet)} is gone.` : `You were out at ${formatMultiplier(state.cashedAt)} with ${formatAmount(payout)}.`}`);
    onRoundEnd?.({ id: state.id, crashPoint: state.crashPoint, cashedOutAt: state.cashedAt, bet: state.bet, payout });
    if (!reduceMotion && readout.current) animate(readout.current, { x: [0, -7, 6, -4, 2, 0] }, { duration: 0.42, ease: "easeOut" });
  };

  const start = () => {
    if (phaseRef.current === "running" || bet < minBet || !money.spend(bet)) return;
    const edge = Math.min(Math.max(margin, 0), 0.5);
    const chance = Math.min(Math.max(random(), 0), 0.999999);
    const crashPoint = Math.min(Math.max(Math.floor(((1 - edge) / (1 - chance)) * 100) / 100, 1), Math.max(1, maxMultiplier));
    const target = Number.parseFloat(auto);
    round.current = { id: round.current.id + 1, crashPoint, elapsed: 0, bet, cashedAt: null, cashedTime: 0, auto: Number.isFinite(target) && target >= 1.01 ? target : 0, drawnAt: 0 };
    phaseRef.current = "running";
    setPhase("running");
    setCashedAt(null);
    multiplier.set(1);
    draw(1, 0);
    setAnnouncement(`Round started with a bet of ${formatAmount(bet)}.`);
  };

  useAnimationFrame((time, delta) => {
    if (phaseRef.current !== "running") return;
    const state = round.current;
    state.elapsed += (Math.min(delta, 64) / 1000) * (state.cashedAt === null ? 1 : fastForward);
    const value = Math.exp(speed * state.elapsed);
    if (state.cashedAt === null && state.auto > 0 && state.auto <= state.crashPoint && value >= state.auto) cashOut(state.auto);
    if (value >= state.crashPoint) { finish(); return; }
    // With reduced motion the round still has to progress, so the curve advances in a few calm steps per second instead of every frame.
    if (reduceMotion && time - state.drawnAt < 250) return;
    state.drawnAt = time;
    multiplier.set(value);
    draw(value, state.elapsed);
  });

  const entries = useMemo<HistoryEntry[]>(() => history.map(item => ({ id: item.id, label: formatMultiplier(item.point), tone: toneOf(item.point) })), [history]);
  const running = phase === "running";
  const broke = !running && money.balance < minBet;
  const lastBet = round.current.bet;
  const status = phase === "idle"
    ? { key: "idle", tone: "muted", text: "Place a bet to start a round" }
    : running && cashedAt === null
      ? { key: "live", tone: "muted", text: "Cash out before it crashes" }
      : cashedAt !== null
        ? { key: `out-${phase}`, tone: "success", text: `${running ? "Cashed out" : "Crashed · you were out"} at ${formatMultiplier(cashedAt)} · +${formatAmount(roundAmount(lastBet * cashedAt))}` }
        : { key: "crashed", tone: "danger", text: `Crashed · bet of ${formatAmount(lastBet)} gone` };

  return (
    <GameFrame title={title} money={money} busy={running} announcement={announcement} className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.historyRow}>
        <span className={styles.historyLabel}>Last rounds</span>
        <HistoryChips entries={entries} label="Crash points of the last rounds, newest first" />
      </div>
      <div ref={chart} className={styles.chart} data-phase={phase} data-out={cashedAt !== null || undefined}>
        <svg className={styles.plot} viewBox={`0 0 ${size.width || 1} ${size.height || 1}`} aria-hidden="true" focusable="false">
          {levels.map((level, index) => (
            <g key={level} ref={node => { guides.current[index] = node; }} className={styles.guide} style={{ opacity: 0 }}>
              <line x1={0} x2={size.width} y1={0} y2={0} />
              <text x={size.width - 10} y={-5} textAnchor="end">{levelLabel(level)}</text>
            </g>
          ))}
          <path ref={area} className={styles.area} />
          <path ref={line} className={styles.line} />
          <g ref={mark} className={styles.mark} style={{ display: "none" }}>
            <circle r={5} />
            <text x={-9} y={-9} textAnchor="end">{cashedAt === null ? "" : formatMultiplier(cashedAt)}</text>
          </g>
          <g ref={head} className={styles.head}>
            <circle className={styles.pulse} r={7} />
            <circle className={styles.burst} r={7} />
            <circle className={styles.dot} r={6} />
          </g>
        </svg>
        <div ref={readout} className={styles.readout}>
          <motion.span className={styles.multiplier}>{multiplierText}</motion.span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status.key}
              className={styles.status}
              data-tone={status.tone}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant } }}
              transition={motionTokens.spring.snappy}
            >
              {status.text}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <div className={styles.controls}>
        <div className={styles.fields}>
          <BetField value={bet} onValueChange={setBet} min={minBet} max={money.balance} disabled={running} />
          <AmountField label="Auto cash out" value={auto} onValueChange={setAuto} placeholder="Off" suffix="×" disabled={running} />
        </div>
        {broke ? (
          <PlayButton labelKey="refill" tone="neutral" onClick={money.reset}>Reset the balance to play again</PlayButton>
        ) : running && cashedAt === null ? (
          <PlayButton labelKey="cash-out" onClick={() => cashOut()}>Cash out <motion.span>{cashOutText}</motion.span></PlayButton>
        ) : running ? (
          <PlayButton labelKey="waiting" tone="neutral" disabled onClick={() => undefined}>Waiting for the round to end</PlayButton>
        ) : bet > money.balance ? (
          <PlayButton labelKey="lower" tone="neutral" onClick={() => setBet(money.balance)}>Lower the bet to {formatAmount(money.balance)}</PlayButton>
        ) : (
          <PlayButton labelKey="bet" onClick={start}>{phase === "crashed" ? "Bet again" : "Bet"}</PlayButton>
        )}
      </div>
    </GameFrame>
  );
}

export default CrashGame;
