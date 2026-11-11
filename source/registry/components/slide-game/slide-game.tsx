"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import { BetField, GameFrame, HistoryChips, PlayButton, formatAmount, roundAmount, usePlayMoney } from "./play-money";
import type { HistoryEntry } from "./play-money";
import styles from "./slide-game.module.css";

export interface SlideTile {
  /** Multiplier paid when the strip stops on this tile. */
  multiplier: number;
  /** Relative chance of this tile: a weight of 2 comes up twice as often as a weight of 1. */
  weight: number;
}

export interface SlideRound {
  /** Round number, starting at 1. */
  id: number;
  /** Multiplier the strip stopped on. */
  multiplier: number;
  /** Amount bet. */
  bet: number;
  /** Amount paid back. */
  payout: number;
}

export interface SlideGameProps {
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
  /** The kinds of tile on the strip and how often each comes up. */
  tiles?: SlideTile[];
  /** Seconds the strip takes to slide and slow down to its result. */
  duration?: number;
  /** Called when the strip has stopped, with the result. */
  onRoundEnd?: (round: SlideRound) => void;
  /** Random source returning a number in [0, 1). Called only after a bet, to pick the result and fill the strip. */
  random?: () => number;
  /** Name shown in the header. */
  title?: string;
  /** Extra class for the card. */
  className?: string;
}

type Phase = "idle" | "sliding" | "landed";
interface Cell { id: number; multiplier: number }
interface Spin { id: number; from: number; target: number; nudge: number; bet: number; multiplier: number }

/** Default tiles. Weights add up to 100, so each weight is its chance in percent; the average payout is 0.97 of the bet. */
const defaultTiles: SlideTile[] = [
  { multiplier: 0, weight: 32 },
  { multiplier: 0.5, weight: 24 },
  { multiplier: 1.2, weight: 20 },
  { multiplier: 1.5, weight: 10 },
  { multiplier: 2, weight: 7 },
  { multiplier: 3, weight: 4 },
  { multiplier: 5, weight: 2 },
  { multiplier: 10, weight: 1 },
];

// Strip geometry in px; the CSS reads the same numbers through custom properties.
const tileWidth = 76, tileGap = 8, pitch = tileWidth + tileGap;
/** Tiles kept on each side of the center, enough to fill the widest card. */
const lead = 8;
/** Tiles that pass under the marker in one slide. */
const travel = 36;
/** Leaves at speed and spends most of its time slowing down. */
const slowdown = [0.09, 0.62, 0.1, 1] as const;

const offsetFor = (index: number) => -(index * pitch + tileWidth / 2);
const label = (multiplier: number) => `${multiplier}×`;
const tierOf = (multiplier: number) => (multiplier >= 5 ? "top" : multiplier >= 2 ? "good" : multiplier >= 1 ? "base" : multiplier > 0 ? "low" : "zero");
const toneOf = (multiplier: number): HistoryEntry["tone"] => (multiplier >= 5 ? "high" : multiplier >= 1 ? "mid" : "low");

/** A slide game with fake money: a strip of multiplier tiles shoots past a center marker, slows down and stops on the multiplier that pays the bet. */
export function SlideGame({
  balance,
  defaultBalance = 1000,
  onBalanceChange,
  defaultBet = 10,
  minBet = 1,
  tiles = defaultTiles,
  duration = 3.8,
  onRoundEnd,
  random = Math.random,
  title = "Slide",
  className,
}: SlideGameProps) {
  const reduceMotion = useReducedMotion();
  const money = usePlayMoney({ balance, defaultBalance, onBalanceChange });
  const kinds = useMemo(() => { const valid = tiles.filter(tile => tile.weight > 0 && tile.multiplier >= 0); return valid.length ? valid : defaultTiles; }, [tiles]);
  const totalWeight = useMemo(() => kinds.reduce((sum, tile) => sum + tile.weight, 0), [kinds]);
  const [bet, setBet] = useState(defaultBet);
  const [phase, setPhase] = useState<Phase>("idle");
  // The strip on first paint is a fixed pattern: nothing random happens before the first bet.
  const [strip, setStrip] = useState<Cell[]>(() => Array.from({ length: lead * 2 + 1 }, (_, index) => ({ id: index, multiplier: kinds[(index * 5 + 2) % kinds.length]?.multiplier ?? 0 })));
  const [spin, setSpin] = useState<Spin | null>(null);
  const [history, setHistory] = useState<{ id: number; multiplier: number }[]>([]);
  const [announcement, setAnnouncement] = useState("");

  const x = useMotionValue(offsetFor(lead));
  const fade = useMotionValue(1);
  const centered = useRef(lead);
  const cellId = useRef(lead * 2 + 1);
  const pointer = useRef<HTMLSpanElement>(null);

  const land = (round: Spin) => {
    const payout = roundAmount(round.bet * round.multiplier);
    money.pay(payout);
    setPhase("landed");
    setHistory(list => [{ id: round.id, multiplier: round.multiplier }, ...list].slice(0, 8));
    setAnnouncement(`Landed on ${round.multiplier} times. ${payout > 0 ? `${formatAmount(payout)} back.` : "Nothing back this time."}`);
    onRoundEnd?.({ id: round.id, multiplier: round.multiplier, bet: round.bet, payout });
  };
  const landRef = useRef(land);
  useEffect(() => { landRef.current = land; });

  // Runs one slide. The new strip starts with the tiles that were on screen, so the jump back to its start is invisible.
  useLayoutEffect(() => {
    if (!spin) return;
    let cancelled = false;
    let settle: ReturnType<typeof animate> | undefined;
    x.jump(offsetFor(spin.from));
    if (reduceMotion) {
      // No travel: the strip is swapped for its final position with a short fade.
      x.jump(offsetFor(spin.target));
      fade.jump(0);
      const appear = animate(fade, 1, { duration: motionTokens.duration.standard });
      appear.then(() => { if (!cancelled) landRef.current(spin); });
      return () => { cancelled = true; appear.stop(); fade.jump(1); };
    }
    // It stops a little off center, like a real strip, then eases onto the tile.
    const slide = animate(x, offsetFor(spin.target) + spin.nudge, { duration, ease: [...slowdown] });
    slide.then(() => {
      if (cancelled) return;
      landRef.current(spin);
      settle = animate(x, offsetFor(spin.target), motionTokens.spring.gentle);
    });
    return () => { cancelled = true; slide.stop(); settle?.stop(); };
  }, [spin, duration, reduceMotion, x, fade]);

  // The pointer flicks each time a tile edge passes under it.
  useEffect(() => {
    if (reduceMotion) return;
    let last = Math.round((-x.get() - tileWidth / 2) / pitch), flickedAt = 0;
    return x.on("change", value => {
      const index = Math.round((-value - tileWidth / 2) / pitch);
      if (index === last) return;
      last = index;
      const now = performance.now();
      if (now - flickedAt < 60 || !pointer.current) return;
      flickedAt = now;
      animate(pointer.current, { rotate: [-20, 0] }, { duration: 0.18, ease: "easeOut" });
    });
  }, [x, reduceMotion]);

  const play = () => {
    if (phase === "sliding" || bet < minBet || !money.spend(bet)) return;
    const chance = () => Math.min(Math.max(random(), 0), 0.999999);
    const draw = () => {
      let mark = chance() * totalWeight;
      for (const tile of kinds) { mark -= tile.weight; if (mark < 0) return tile.multiplier; }
      return kinds[kinds.length - 1]?.multiplier ?? 0;
    };
    const cell = (multiplier: number): Cell => ({ id: cellId.current++, multiplier });
    const result = draw();
    const kept = strip.slice(centered.current - lead, centered.current + lead + 1);
    const target = lead + travel;
    const next = [...kept, ...Array.from({ length: target - kept.length }, () => cell(draw())), cell(result), ...Array.from({ length: lead }, () => cell(draw()))];
    centered.current = target;
    setStrip(next);
    setSpin(current => ({ id: (current?.id ?? 0) + 1, from: lead, target, nudge: (chance() - 0.5) * tileWidth * 0.72, bet, multiplier: result }));
    setPhase("sliding");
    setAnnouncement(`Sliding with a bet of ${formatAmount(bet)}.`);
  };

  const sliding = phase === "sliding";
  const broke = !sliding && money.balance < minBet;
  const entries = useMemo<HistoryEntry[]>(() => history.map(item => ({ id: item.id, label: label(item.multiplier), tone: toneOf(item.multiplier) })), [history]);
  const payout = spin ? roundAmount(spin.bet * spin.multiplier) : 0;
  const status = phase === "landed" && spin
    ? { key: `landed-${spin.id}`, tone: spin.multiplier >= 1 ? "success" : "muted", text: `Landed on ${label(spin.multiplier)} · ${payout > 0 ? `${formatAmount(payout)} back` : "nothing back this time"}` }
    : sliding
      ? { key: "sliding", tone: "muted", text: "Sliding…" }
      : { key: "idle", tone: "muted", text: "Bet to send the strip sliding" };

  return (
    <GameFrame title={title} money={money} busy={sliding} announcement={announcement} className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.historyRow}>
        <span className={styles.historyLabel}>Last results</span>
        {entries.length ? <HistoryChips entries={entries} label="Multipliers of the last rounds, newest first" /> : <span className={styles.empty}>none yet</span>}
      </div>
      <div className={styles.stage} data-phase={phase} style={{ "--tile": `${tileWidth}px`, "--tile-gap": `${tileGap}px` } as CSSProperties}>
        <div className={styles.viewport} aria-hidden="true">
          <motion.div className={styles.strip} style={{ x, opacity: fade }}>
            {strip.map((cell, index) => (
              <div
                key={cell.id}
                className={styles.tile}
                data-tier={tierOf(cell.multiplier)}
                data-winner={(phase === "landed" && index === spin?.target) || undefined}
                // Only the tiles of the first strip stagger in, outward from the center; later tiles mount off screen.
                style={cell.id <= lead * 2 ? { animationDelay: `${Math.abs(cell.id - lead) * 45}ms` } : undefined}
              >
                {label(cell.multiplier)}
              </div>
            ))}
          </motion.div>
        </div>
        <span className={styles.marker} aria-hidden="true"><span ref={pointer} className={styles.pointer} /></span>
        <p className={styles.result}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status.key}
              className={styles.resultText}
              data-tone={status.tone}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant } }}
              transition={motionTokens.spring.snappy}
            >
              {status.text}
            </motion.span>
          </AnimatePresence>
        </p>
      </div>
      <ul className={styles.chances} aria-label="Chance of each multiplier">
        {kinds.map(tile => {
          const share = (tile.weight / totalWeight) * 100;
          return <li key={tile.multiplier} className={styles.chance} data-tier={tierOf(tile.multiplier)}><b>{label(tile.multiplier)}</b>{share >= 10 ? Math.round(share) : Math.round(share * 10) / 10}%</li>;
        })}
      </ul>
      <div className={styles.controls}>
        <BetField value={bet} onValueChange={setBet} min={minBet} max={money.balance} disabled={sliding} />
        {broke ? (
          <PlayButton labelKey="refill" tone="neutral" onClick={money.reset}>Reset the balance</PlayButton>
        ) : sliding ? (
          <PlayButton labelKey="sliding" tone="neutral" disabled onClick={() => undefined}>Sliding…</PlayButton>
        ) : bet > money.balance ? (
          <PlayButton labelKey="lower" tone="neutral" onClick={() => setBet(money.balance)}>Lower the bet to {formatAmount(money.balance)}</PlayButton>
        ) : (
          <PlayButton labelKey="bet" onClick={play}>{phase === "landed" ? "Bet again" : "Bet"}</PlayButton>
        )}
      </div>
    </GameFrame>
  );
}

export default SlideGame;
