"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { Bomb, Gem, Minus, Plus } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import { BetField, FieldGroup, GameFrame, PlayButton, formatAmount, formatMultiplier, roundAmount, usePlayMoney } from "./play-money";
import styles from "./mines-game.module.css";

export interface MinesRound {
  /** Round number, starting at 1. */
  id: number;
  /** Mines hidden in the grid this round. */
  mines: number;
  /** Gems the player uncovered. */
  gems: number;
  /** Multiplier reached with those gems. */
  multiplier: number;
  /** "cashed-out" when the player left with the payout, "mine" when a mine ended the round. */
  outcome: "cashed-out" | "mine";
  /** Amount bet. */
  bet: number;
  /** Amount paid back (0 after a mine). */
  payout: number;
}

export interface MinesGameProps {
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
  /** Controlled number of mines hidden in the 25 tiles, from 1 to 24. */
  mines?: number;
  /** Number of mines at first when uncontrolled. */
  defaultMines?: number;
  /** Called when the player changes the number of mines. */
  onMinesChange?: (mines: number) => void;
  /** Part of each payout the game keeps, from 0 to 0.5. */
  margin?: number;
  /** Called when a round ends, by a cash out or by a mine. */
  onRoundEnd?: (round: MinesRound) => void;
  /** Random source returning a number in [0, 1). Called only when a bet is placed, to hide the mines. */
  random?: () => number;
  /** Name shown in the header. */
  title?: string;
  /** Extra class for the card. */
  className?: string;
}

type Phase = "idle" | "playing" | "over";
type Face = "gem" | "mine";

interface Tile {
  /** What the back of the tile shows. It stays while the tile flips closed for the next round. */
  face: Face | null;
  /** Flipped to its back. */
  open: boolean;
  /** Uncovered by the player, as opposed to shown when the round ended. */
  picked: boolean;
  /** Seconds to wait before flipping, for the reveal wave. */
  delay: number;
}

const side = 5;
const total = side * side;
const positions = Array.from({ length: total }, (_, index) => index);
const closedBoard = (): Tile[] => positions.map(() => ({ face: null, open: false, picked: false, delay: 0 }));
/** Steps between two tiles, used to spread the end-of-round reveal outward from the last pick. */
const distance = (a: number, b: number) => Math.abs((a % side) - (b % side)) + Math.abs(Math.floor(a / side) - Math.floor(b / side));
/** Fair payout for `gems` safe picks in a row with `mines` mines, less the margin the game keeps. */
const multiplierFor = (gems: number, mines: number, edge: number) => {
  let value = 1 - edge;
  for (let pick = 0; pick < gems; pick++) value *= (total - pick) / (total - mines - pick);
  return gems === 0 ? 1 : Math.max(1, Math.floor(value * 100) / 100);
};
/** A flip with a little weight: it lands with a small bounce. */
const flip: Transition = { type: "spring", visualDuration: 0.46, bounce: 0.2 };

/** A mines game with fake money: every gem uncovered in the 5×5 grid raises the multiplier, a mine ends the round, and tiles flip to show what they hid. */
export function MinesGame({
  balance,
  defaultBalance = 1000,
  onBalanceChange,
  defaultBet = 10,
  minBet = 1,
  mines: controlledMines,
  defaultMines = 3,
  onMinesChange,
  margin = 0.03,
  onRoundEnd,
  random = Math.random,
  title = "Mines",
  className,
}: MinesGameProps) {
  const reduceMotion = useReducedMotion();
  const money = usePlayMoney({ balance, defaultBalance, onBalanceChange });
  const [bet, setBet] = useState(defaultBet);
  const [internalMines, setInternalMines] = useState(defaultMines);
  const mines = Math.min(Math.max(Math.round(controlledMines ?? internalMines), 1), total - 1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [tiles, setTiles] = useState<Tile[]>(closedBoard);
  const [found, setFound] = useState(0);
  const [outcome, setOutcome] = useState<MinesRound["outcome"] | null>(null);
  const [focused, setFocused] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [step, setStep] = useState(1);

  const round = useRef({ id: 0, bet: 0, mines, hidden: [] as boolean[] });
  const grid = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const edge = Math.min(Math.max(margin, 0), 0.5);
  const playing = phase === "playing";
  const safe = total - (playing || phase === "over" ? round.current.mines : mines);
  const liveMines = playing || phase === "over" ? round.current.mines : mines;
  const current = multiplierFor(found, liveMines, edge);
  const next = found < safe ? multiplierFor(found + 1, liveMines, edge) : current;

  const changeMines = (delta: number) => {
    const value = Math.min(Math.max(mines + delta, 1), total - 1);
    if (value === mines) return;
    setStep(delta);
    setInternalMines(value);
    onMinesChange?.(value);
  };

  const start = () => {
    if (playing || bet < minBet || !money.spend(bet)) return;
    // Partial shuffle: the first `mines` positions of a shuffled deck hold the mines.
    const deck = [...positions];
    for (let index = 0; index < mines; index++) {
      const pick = index + Math.floor(Math.min(Math.max(random(), 0), 0.999999) * (total - index));
      const moved = deck[index] ?? index;
      deck[index] = deck[pick] ?? pick;
      deck[pick] = moved;
    }
    const hidden = positions.map(() => false);
    for (const position of deck.slice(0, mines)) hidden[position] = true;
    round.current = { id: round.current.id + 1, bet, mines, hidden };
    // Tiles left open by the last round flip closed in a diagonal sweep.
    setTiles(list => list.map((tile, index) => ({ ...tile, open: false, picked: false, delay: tile.open ? ((index % side) + Math.floor(index / side)) * 0.02 : 0 })));
    setFound(0);
    setOutcome(null);
    setPhase("playing");
    setAnnouncement(`Round started with ${mines} ${mines === 1 ? "mine" : "mines"} and a bet of ${formatAmount(bet)}. Pick a tile.`);
  };

  /** Ends the round and flips every tile still closed, in a wave that starts at `origin`. */
  const end = (result: MinesRound["outcome"], gems: number, origin: number) => {
    const state = round.current;
    const multiplier = multiplierFor(gems, state.mines, edge);
    const payout = result === "cashed-out" ? roundAmount(state.bet * multiplier) : 0;
    setTiles(list => list.map((tile, index) => (tile.open ? tile : index === origin
      ? { face: state.hidden[index] ? "mine" : "gem", open: true, picked: true, delay: 0 }
      : { face: state.hidden[index] ? "mine" : "gem", open: true, picked: false, delay: 0.16 + distance(origin, index) * 0.045 })));
    setPhase("over");
    setOutcome(result);
    if (payout > 0) money.pay(payout);
    setAnnouncement(result === "mine"
      ? `Mine. The round is over and the bet of ${formatAmount(state.bet)} is gone.`
      : `Cashed out at ${formatMultiplier(multiplier)}. ${formatAmount(payout)} added to the balance.`);
    onRoundEnd?.({ id: state.id, mines: state.mines, gems, multiplier, outcome: result, bet: state.bet, payout });
    if (result === "mine" && !reduceMotion && grid.current) animate(grid.current, { x: [0, -6, 5, -3, 2, 0] }, { duration: 0.4, ease: "easeOut" });
  };

  const pick = (index: number) => {
    if (!playing || tiles[index]?.open !== false) return;
    const state = round.current;
    if (state.hidden[index]) { end("mine", found, index); return; }
    const gems = found + 1;
    setFound(gems);
    if (gems >= total - state.mines) { end("cashed-out", gems, index); return; }
    setTiles(list => list.map((tile, position) => (position === index ? { face: "gem", open: true, picked: true, delay: 0 } : tile)));
    setAnnouncement(`Gem. Multiplier ${formatMultiplier(multiplierFor(gems, state.mines, edge))}.`);
  };

  const cashOut = () => {
    if (!playing || found === 0) return;
    end("cashed-out", found, focused);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const column = index % side, row = Math.floor(index / side);
    const target = event.key === "ArrowRight" ? (column < side - 1 ? index + 1 : index)
      : event.key === "ArrowLeft" ? (column > 0 ? index - 1 : index)
      : event.key === "ArrowDown" ? (row < side - 1 ? index + side : index)
      : event.key === "ArrowUp" ? (row > 0 ? index - side : index)
      : event.key === "Home" ? row * side
      : event.key === "End" ? row * side + side - 1
      : -1;
    if (target < 0) return;
    event.preventDefault();
    setFocused(target);
    buttons.current[target]?.focus();
  };

  const broke = !playing && money.balance < minBet;
  const lastPayout = roundAmount(round.current.bet * current);

  return (
    <GameFrame title={title} money={money} busy={playing} announcement={announcement} className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.body}>
        <div className={styles.boardWrap}>
          <div ref={grid} className={styles.board} role="group" aria-label="Board, 5 by 5 tiles. Arrow keys move between tiles." data-phase={phase}>
            {tiles.map((tile, index) => {
              const state = tile.open ? (tile.face === "mine" ? "mine" : "gem") : "hidden";
              return (
                <button
                  key={index}
                  ref={node => { buttons.current[index] = node; }}
                  type="button"
                  className={styles.tile}
                  style={{ animationDelay: `${((index % side) + Math.floor(index / side)) * 30}ms` }}
                  tabIndex={index === focused ? 0 : -1}
                  aria-disabled={!playing || tile.open}
                  aria-label={`Row ${Math.floor(index / side) + 1}, column ${(index % side) + 1}: ${state}`}
                  onClick={() => { setFocused(index); pick(index); }}
                  onFocus={() => setFocused(index)}
                  onKeyDown={event => onKeyDown(event, index)}
                >
                  <motion.span
                    className={styles.card}
                    style={{ transformPerspective: 520 }}
                    initial={false}
                    animate={{ rotateY: tile.open ? 180 : 0 }}
                    transition={reduceMotion ? { duration: 0 } : { ...flip, delay: tile.delay }}
                  >
                    <span className={styles.front} />
                    <span className={styles.back} data-face={tile.face ?? undefined} data-picked={tile.picked || undefined}>
                      {tile.face === "mine" ? <Bomb aria-hidden="true" /> : tile.face === "gem" ? <Gem aria-hidden="true" /> : null}
                    </span>
                  </motion.span>
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.panel}>
          <dl className={styles.stats} data-outcome={outcome ?? undefined}>
            <div className={styles.stat}>
              <dt>Multiplier</dt>
              <dd>
                <motion.span key={`${round.current.id}-${found}`} className={styles.value} initial={reduceMotion || found === 0 ? false : { scale: 1.22 }} animate={{ scale: 1 }} transition={{ type: "spring", visualDuration: 0.3, bounce: 0.3 }}>
                  {formatMultiplier(current)}
                </motion.span>
              </dd>
            </div>
            <div className={styles.stat}>
              <dt>Next gem</dt>
              <dd>{found < safe ? formatMultiplier(next) : "—"}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Gems</dt>
              <dd>{found}<span className={styles.of}> / {safe}</span></dd>
            </div>
          </dl>
          <div className={styles.fields}>
            <BetField value={bet} onValueChange={setBet} min={minBet} max={money.balance} disabled={playing} />
            <FieldGroup label="Mines">
              <div className={styles.stepper} data-disabled={playing || undefined}>
                <button type="button" className={styles.stepButton} onClick={() => changeMines(-1)} disabled={playing || mines <= 1} aria-label="Fewer mines"><Minus size={15} aria-hidden="true" /></button>
                <span className={styles.count} aria-live="polite" aria-atomic="true">
                  <AnimatePresence mode="popLayout" initial={false} custom={step}>
                    <motion.span
                      key={mines}
                      custom={step}
                      variants={{ enter: (direction: number) => ({ opacity: 0, y: reduceMotion ? 0 : direction > 0 ? 12 : -12 }), exit: (direction: number) => ({ opacity: 0, y: reduceMotion ? 0 : direction > 0 ? -12 : 12, transition: { duration: motionTokens.duration.instant } }) }}
                      initial="enter"
                      animate={{ opacity: 1, y: 0 }}
                      exit="exit"
                      transition={motionTokens.spring.snappy}
                    >
                      {mines}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <button type="button" className={styles.stepButton} onClick={() => changeMines(1)} disabled={playing || mines >= total - 1} aria-label="More mines"><Plus size={15} aria-hidden="true" /></button>
              </div>
            </FieldGroup>
          </div>
          {broke ? (
            <PlayButton labelKey="refill" tone="neutral" onClick={money.reset}>Reset the balance to play again</PlayButton>
          ) : playing && found > 0 ? (
            <PlayButton labelKey="cash-out" onClick={cashOut}>Cash out {formatAmount(lastPayout)}</PlayButton>
          ) : playing ? (
            <PlayButton labelKey="pick" tone="neutral" disabled onClick={() => undefined}>Pick a tile</PlayButton>
          ) : bet > money.balance ? (
            <PlayButton labelKey="lower" tone="neutral" onClick={() => setBet(money.balance)}>Lower the bet to {formatAmount(money.balance)}</PlayButton>
          ) : (
            <PlayButton labelKey="bet" onClick={start}>{phase === "over" ? "Bet again" : "Bet"}</PlayButton>
          )}
          <p className={styles.note} data-outcome={outcome ?? undefined}>
            {outcome === "mine" ? `You hit a mine after ${found} ${found === 1 ? "gem" : "gems"}.`
              : outcome === "cashed-out" ? `Cashed out at ${formatMultiplier(current)} for ${formatAmount(lastPayout)}.`
              : playing ? "Each gem raises the multiplier. A mine ends the round."
              : "More mines, bigger steps. Bet to arm the board."}
          </p>
        </div>
      </div>
    </GameFrame>
  );
}

export default MinesGame;
