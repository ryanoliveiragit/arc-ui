"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion, useAnimationFrame, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import { BetField, FieldGroup, GameFrame, HistoryChips, PlayButton, formatAmount, roundAmount, usePlayMoney } from "./play-money";
import type { HistoryEntry } from "./play-money";
import styles from "./plinko-game.module.css";

export type PlinkoRisk = "low" | "medium" | "high";

export interface PlinkoDrop {
  /** Ball number, starting at 1. */
  id: number;
  /** Slot the ball landed in, counted from the left starting at 0. */
  slot: number;
  /** Multiplier of that slot. */
  multiplier: number;
  /** Amount bet on the ball. */
  bet: number;
  /** Amount paid back. */
  payout: number;
}

export interface PlinkoGameProps {
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
  /** Rows of pegs, from 6 to 12. The board ends in rows + 1 slots. */
  rows?: number;
  /** Controlled risk. Higher risk pays more at the edges and less in the middle. */
  risk?: PlinkoRisk;
  /** Risk at first when uncontrolled. */
  defaultRisk?: PlinkoRisk;
  /** Called when the player picks another risk. */
  onRiskChange?: (risk: PlinkoRisk) => void;
  /** Your own multipliers, one per slot from left to right (rows + 1 values). Replaces the table computed from `risk`. */
  multipliers?: number[];
  /** Part of each bet the computed table keeps on average, from 0 to 0.5. */
  margin?: number;
  /** How many balls may fall at the same time. */
  maxBalls?: number;
  /** Called when a ball lands in a slot. */
  onDrop?: (drop: PlinkoDrop) => void;
  /** Random source returning a number in [0, 1). Called only while a ball is dropped, to choose its path. */
  random?: () => number;
  /** Name shown in the header. */
  title?: string;
  /** Extra class for the card. */
  className?: string;
}

/** One flight of the ball, from the peg it just touched to the next one. */
interface Hop { fromX: number; fromY: number; toX: number; toY: number; kick: number; duration: number; end: number; peg: string | null }
interface Ball { id: number; start: number; hops: Hop[]; hop: number; slot: number; bet: number; multiplier: number }

// Board geometry in viewBox units. The SVG scales as a whole, so pegs, ball and gaps always keep their proportions.
const gapX = 40, gapY = 36, margin = 22, top = 46, pegRadius = 4, ballRadius = 7.5;
const risks: { value: PlinkoRisk; label: string }[] = [{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }];
/** How strongly a rare slot is rewarded: 1 pays every slot the same on average, lower values flatten the table. */
const spread: Record<PlinkoRisk, number> = { low: 0.5, medium: 0.75, high: 1 };
const slotLabel = (value: number) => `${value >= 100 ? Math.round(value) : Math.round(value * 10) / 10}`;
const toneOf = (value: number): HistoryEntry["tone"] => (value >= 3 ? "high" : value >= 1 ? "mid" : "low");

/** Chance of each slot: the ball goes left or right with an equal chance at every row, so slots follow a binomial distribution. */
function slotChances(rows: number) {
  const chances = [1];
  for (let row = 0; row < rows; row++) {
    const next = [0.5 * (chances[0] ?? 0)];
    for (let slot = 1; slot <= row; slot++) next.push(0.5 * ((chances[slot - 1] ?? 0) + (chances[slot] ?? 0)));
    next.push(0.5 * (chances[row] ?? 0));
    chances.splice(0, chances.length, ...next);
  }
  return chances;
}

/** Multipliers that grow toward the rare edge slots, scaled so the average payout is 1 − edge. */
function payoutTable(rows: number, risk: PlinkoRisk, edge: number) {
  const chances = slotChances(rows);
  const likeliest = Math.max(...chances);
  const raw = chances.map(chance => (likeliest / chance) ** spread[risk]);
  const mean = raw.reduce((sum, value, slot) => sum + value * (chances[slot] ?? 0), 0);
  return raw.map(value => { const scaled = (value * (1 - edge)) / mean; return Math.max(0.1, scaled >= 100 ? Math.round(scaled) : Math.round(scaled * 10) / 10); });
}

/** A plinko board with fake money: each ball bounces left or right off every row of pegs and lights up the multiplier slot it lands in. */
export function PlinkoGame({
  balance,
  defaultBalance = 1000,
  onBalanceChange,
  defaultBet = 10,
  minBet = 1,
  rows: rowsProp = 8,
  risk: controlledRisk,
  defaultRisk = "medium",
  onRiskChange,
  multipliers,
  margin: marginProp = 0.03,
  maxBalls = 8,
  onDrop,
  random = Math.random,
  title = "Plinko",
  className,
}: PlinkoGameProps) {
  const reduceMotion = useReducedMotion();
  const id = useId();
  const money = usePlayMoney({ balance, defaultBalance, onBalanceChange });
  const [bet, setBet] = useState(defaultBet);
  const [internalRisk, setInternalRisk] = useState(defaultRisk);
  const risk = controlledRisk ?? internalRisk;
  const [flying, setFlying] = useState<number[]>([]);
  const [history, setHistory] = useState<{ id: number; multiplier: number }[]>([]);
  const [lastSlot, setLastSlot] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const rows = Math.min(Math.max(Math.round(rowsProp), 6), 12);
  const edge = Math.min(Math.max(marginProp, 0), 0.5);
  const table = useMemo(() => (multipliers?.length === rows + 1 ? multipliers : payoutTable(rows, risk, edge)), [multipliers, rows, risk, edge]);
  const width = (rows + 1) * gapX + margin * 2, height = top + (rows - 1) * gapY + 30, center = width / 2;
  const pegX = (row: number, index: number) => center + (index - (row + 2) / 2) * gapX;
  const pegY = (row: number) => top + row * gapY;

  const balls = useRef<Ball[]>([]);
  const dropped = useRef(0);
  const ballNodes = useRef(new Map<number, SVGCircleElement>());
  const pegNodes = useRef(new Map<string, SVGCircleElement>());
  const slotNodes = useRef<(HTMLLIElement | null)[]>([]);

  /** Restarts a CSS animation by flipping between two identical keyframe sets. */
  const flash = (node: HTMLElement | SVGElement | null | undefined, key: "hit" | "lit") => { if (node) node.dataset[key] = node.dataset[key] === "a" ? "b" : "a"; };

  const land = (ball: Ball) => {
    balls.current = balls.current.filter(item => item !== ball);
    setFlying(list => list.filter(item => item !== ball.id));
    const payout = roundAmount(ball.bet * ball.multiplier);
    money.pay(payout);
    flash(slotNodes.current[ball.slot], "lit");
    setLastSlot(ball.slot);
    setHistory(list => [{ id: ball.id, multiplier: ball.multiplier }, ...list].slice(0, 8));
    setAnnouncement(`Ball ${ball.id} landed on ${slotLabel(ball.multiplier)} times: ${formatAmount(payout)} back.`);
    onDrop?.({ id: ball.id, slot: ball.slot, multiplier: ball.multiplier, bet: ball.bet, payout });
  };

  const drop = () => {
    if (balls.current.length >= maxBalls || bet < minBet || !money.spend(bet)) return;
    const chance = () => Math.min(Math.max(random(), 0), 0.999999);
    const hops: Hop[] = [];
    let clock = 0;
    const add = (hop: Omit<Hop, "end">) => { clock += hop.duration; hops.push({ ...hop, end: clock }); };
    // Free fall onto the middle peg of the first row, then one hop per row. `rights` counts the bounces to the right so far.
    let x = center + (chance() - 0.5) * 6, y = pegY(0) - pegRadius - ballRadius, rights = 0;
    add({ fromX: x, fromY: -ballRadius * 2, toX: x, toY: y, kick: 0, duration: 0.34, peg: null });
    for (let row = 0; row < rows; row++) {
      const peg = `${row}-${rights + 1}`;
      rights += chance() < 0.5 ? 0 : 1;
      const last = row === rows - 1;
      const toX = last ? center + (rights - rows / 2) * gapX : pegX(row + 1, rights + 1) + (chance() - 0.5) * 5;
      const toY = last ? height + ballRadius + 8 : pegY(row + 1) - pegRadius - ballRadius;
      add({ fromX: x, fromY: y, toX, toY, kick: 38 + chance() * 26, duration: (last ? 0.3 : 0.25) + chance() * 0.05, peg });
      x = toX;
      y = toY;
    }
    dropped.current += 1;
    const ball: Ball = { id: dropped.current, start: performance.now(), hops, hop: 0, slot: rights, bet, multiplier: table[rights] ?? 0 };
    balls.current = [...balls.current, ball];
    setFlying(list => [...list, ball.id]);
  };

  useAnimationFrame(() => {
    if (!balls.current.length) return;
    const now = performance.now();
    for (const ball of [...balls.current]) {
      const elapsed = (now - ball.start) / 1000;
      // With reduced motion nothing falls: the result shows after a short pause.
      if (reduceMotion) { if (elapsed >= 0.35) land(ball); continue; }
      let index = ball.hop;
      while (index < ball.hops.length && elapsed >= (ball.hops[index]?.end ?? 0)) {
        index += 1;
        flash(pegNodes.current.get(ball.hops[index]?.peg ?? ""), "hit");
      }
      ball.hop = index;
      const hop = ball.hops[index];
      if (!hop) { land(ball); continue; }
      const progress = Math.min(Math.max((elapsed - (hop.end - hop.duration)) / hop.duration, 0), 1);
      // Steady sideways drift; vertically a small kick up off the peg, then gravity takes over.
      const x = hop.fromX + (hop.toX - hop.fromX) * progress;
      const y = hop.fromY - hop.kick * progress + (hop.toY - hop.fromY + hop.kick) * progress * progress;
      const node = ballNodes.current.get(ball.id);
      if (!node) continue;
      node.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      node.style.opacity = index === ball.hops.length - 1 && progress > 0.7 ? String(Math.max(0, 1 - (progress - 0.7) / 0.3)) : "1";
    }
  });

  const changeRisk = (value: PlinkoRisk) => { setInternalRisk(value); onRiskChange?.(value); };
  const busy = flying.length > 0;
  const broke = !busy && money.balance < minBet;
  const entries = useMemo<HistoryEntry[]>(() => history.map(item => ({ id: item.id, label: `${slotLabel(item.multiplier)}×`, tone: toneOf(item.multiplier) })), [history]);
  const half = rows / 2;

  return (
    <GameFrame title={title} money={money} busy={busy} announcement={announcement} className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.body}>
        <div className={styles.boardWrap}>
          <div className={styles.board} style={{ "--board-margin": `${(margin / width) * 100}%` } as CSSProperties}>
            <svg className={styles.pegs} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
              {Array.from({ length: rows }, (_, row) => Array.from({ length: row + 3 }, (_, index) => (
                <circle
                  key={`${row}-${index}`}
                  ref={node => { if (node) pegNodes.current.set(`${row}-${index}`, node); else pegNodes.current.delete(`${row}-${index}`); }}
                  className={styles.peg}
                  cx={pegX(row, index)}
                  cy={pegY(row)}
                  r={pegRadius}
                  style={{ animationDelay: `${row * 35}ms` }}
                />
              )))}
              {reduceMotion ? null : flying.map(ball => (
                <circle key={ball} ref={node => { if (node) ballNodes.current.set(ball, node); else ballNodes.current.delete(ball); }} className={styles.ball} r={ballRadius} transform={`translate(${center} ${-ballRadius * 2})`} />
              ))}
            </svg>
            <ol className={styles.slots} aria-label="Multiplier of each slot, left to right">
              {table.map((value, slot) => {
                const heat = (Math.abs(slot - half) / half) ** 2;
                return (
                  <li key={slot} ref={node => { slotNodes.current[slot] = node; }} className={styles.slot} data-hot={heat >= 0.49 || undefined} data-last={lastSlot === slot || undefined} style={{ "--heat": heat.toFixed(3) } as CSSProperties}>
                    <span key={risk} className={styles.slotValue} style={{ animationDelay: `${Math.abs(slot - half) * 24}ms` }}>{slotLabel(value)}<span className={styles.times}>×</span></span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.historyRow}>
            <span className={styles.historyLabel}>Last drops</span>
            {entries.length ? <HistoryChips entries={entries} label="Multipliers of the last drops, newest first" /> : <span className={styles.empty}>none yet</span>}
          </div>
          <div className={styles.fields}>
            <BetField value={bet} onValueChange={setBet} min={minBet} max={money.balance} label="Bet per ball" />
            <FieldGroup label="Risk">
              <div className={styles.segments} data-disabled={busy || undefined}>
                {risks.map(option => (
                  <label key={option.value} className={styles.segment} data-active={risk === option.value || undefined}>
                    <input className={styles.radio} type="radio" name={`${id}-risk`} value={option.value} checked={risk === option.value} disabled={busy} onChange={() => changeRisk(option.value)} />
                    {risk === option.value ? <motion.span layoutId={`${id}-risk-thumb`} className={styles.thumb} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.morph} /> : null}
                    <span className={styles.segmentLabel}>{option.label}</span>
                  </label>
                ))}
              </div>
            </FieldGroup>
          </div>
          {broke ? (
            <PlayButton labelKey="refill" tone="neutral" onClick={money.reset}>Reset the balance to play again</PlayButton>
          ) : money.balance >= minBet && bet > money.balance ? (
            <PlayButton labelKey="lower" tone="neutral" onClick={() => setBet(money.balance)}>Lower the bet to {formatAmount(money.balance)}</PlayButton>
          ) : (
            <PlayButton labelKey="drop" disabled={bet > money.balance || flying.length >= maxBalls} onClick={drop}>Drop a ball</PlayButton>
          )}
          <p className={styles.note}>
            {busy ? `${flying.length} ${flying.length === 1 ? "ball" : "balls"} falling. Drop more while you wait.` : "Edge slots pay the most and are the hardest to reach."}
          </p>
        </div>
      </div>
    </GameFrame>
  );
}

export default PlinkoGame;
