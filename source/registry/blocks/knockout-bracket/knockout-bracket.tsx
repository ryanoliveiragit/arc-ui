"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Check, RotateCcw, Trophy, WandSparkles } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./knockout-bracket.module.css";

export interface BracketTeam {
  /** Unique id, used in the picks. */
  id: string;
  /** Full team name. */
  name: string;
  /** Three-letter code, shown instead of the name when the bracket is narrow. */
  code: string;
  /** Seed number shown before the name. Auto-fill favours the lower seed. */
  seed: number;
}

/** Winner of each decided match: match id (`round-index`, both from zero) to team id. */
export type BracketPicks = Record<string, string>;

export interface KnockoutBracketProps {
  /** Teams in bracket order: the first two meet in the first match, and so on. The count must be a power of two. Defaults to eight sample clubs. */
  teams?: BracketTeam[];
  /** Picked winners. Pass it with `onValueChange` to control the bracket. */
  value?: BracketPicks;
  /** Starting picks when uncontrolled. */
  defaultValue?: BracketPicks;
  /** Called with all picks after one changes. Picks that no longer follow from earlier rounds are already removed. */
  onValueChange?: (picks: BracketPicks) => void;
  /** Heading above the bracket. */
  title?: string;
  /** Extra class for the section. */
  className?: string;
}

export const sampleTeams: BracketTeam[] = [
  { id: "harbor", name: "Harbor City", code: "HAR", seed: 1 },
  { id: "pine", name: "Pine Valley", code: "PIN", seed: 8 },
  { id: "redwood", name: "Redwood United", code: "RED", seed: 4 },
  { id: "lakeside", name: "Lakeside", code: "LAK", seed: 5 },
  { id: "northgate", name: "Northgate", code: "NOR", seed: 2 },
  { id: "ember", name: "Ember Athletic", code: "EMB", seed: 7 },
  { id: "stonebridge", name: "Stonebridge", code: "STO", seed: 3 },
  { id: "cobalt", name: "Cobalt Rovers", code: "COB", seed: 6 },
];

interface Match { id: string; round: number; index: number; slots: [BracketTeam | null, BracketTeam | null]; winner: BracketTeam | null }

/** Lays out every round from the picks. A pick only counts while its team is still in that match. */
function resolve(teams: BracketTeam[], picks: BracketPicks): Match[][] {
  const rounds: Match[][] = [];
  for (let round = 0, size = teams.length / 2; size >= 1; round++, size /= 2) {
    rounds.push(Array.from({ length: size }, (_, index) => {
      const previous = rounds[round - 1];
      const slots: Match["slots"] = previous ? [previous[index * 2]?.winner ?? null, previous[index * 2 + 1]?.winner ?? null] : [teams[index * 2] ?? null, teams[index * 2 + 1] ?? null];
      const id = `${round}-${index}`;
      return { id, round, index, slots, winner: slots.find(team => team !== null && team.id === picks[id]) ?? null };
    }));
  }
  return rounds;
}

const roundName = (round: number, total: number, teams: number) => {
  const left = total - round;
  return left === 1 ? "Final" : left === 2 ? "Semifinals" : left === 3 ? "Quarterfinals" : `Round of ${teams / 2 ** round}`;
};

/** A rounded elbow from the right edge of a match to a slot of the next round. */
function elbow(x1: number, y1: number, x2: number, y2: number) {
  const mid = (x1 + x2) / 2;
  const radius = Math.min(8, Math.abs(y2 - y1) / 2, (x2 - x1) / 2);
  if (radius < 1) return `M${x1} ${y1} H${x2}`;
  const turn = y2 > y1 ? radius : -radius;
  return `M${x1} ${y1} H${mid - radius} Q${mid} ${y1} ${mid} ${y1 + turn} V${y2 - turn} Q${mid} ${y2} ${mid + radius} ${y2} H${x2}`;
}

/** Single-elimination bracket: pick a winner and it travels along its connector into the next round. */
export function KnockoutBracket({ teams = sampleTeams, value, defaultValue = {}, onValueChange, title = "Harbor Cup playoffs", className }: KnockoutBracketProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const [internal, setInternal] = useState<BracketPicks>(defaultValue);
  const [filling, setFilling] = useState(false);
  const [lines, setLines] = useState<Record<string, string>>({});
  const picks = value ?? internal;
  const rounds = useMemo(() => resolve(teams, picks), [teams, picks]);
  const all = rounds.flat();
  const decided = all.filter(match => match.winner).length;
  const champion = rounds[rounds.length - 1]?.[0]?.winner ?? null;
  const board = useRef<HTMLDivElement>(null);

  const commit = (next: BracketPicks) => {
    // Drop picks that an earlier change made impossible.
    const clean: BracketPicks = {};
    for (const match of resolve(teams, next).flat()) if (match.winner) clean[match.id] = match.winner.id;
    if (value === undefined) setInternal(clean);
    onValueChange?.(clean);
  };
  const pick = (match: Match, team: BracketTeam) => {
    const next = { ...picks };
    if (match.winner?.id === team.id) delete next[match.id]; else next[match.id] = team.id;
    commit(next);
  };

  // Auto-fill decides one open match at a time, so each winner is seen travelling to the next round.
  const open = all.find(match => !match.winner && match.slots[0] && match.slots[1]);
  useEffect(() => {
    if (!filling) return;
    if (!open) { setFilling(false); return; }
    const [first, second] = open.slots;
    if (!first || !second) return;
    const timer = window.setTimeout(() => commit({ ...picks, [open.id]: (first.seed <= second.seed ? first : second).id }), reduceMotion ? 0 : 320);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one step per change of the open match
  }, [filling, open?.id]);

  // Connectors are measured from the real boxes, so they follow any column width or row height.
  useLayoutEffect(() => {
    const node = board.current;
    if (!node) return;
    const measure = () => {
      const frame = node.getBoundingClientRect();
      const next: Record<string, string> = {};
      node.querySelectorAll<HTMLElement>("[data-match]").forEach(source => {
        const [round, index] = (source.dataset.match ?? "").split("-").map(Number) as [number, number];
        const target = node.querySelector<HTMLElement>(`[data-slot="${round + 1}-${Math.floor(index / 2)}-${index % 2}"]`);
        if (!target) return;
        const from = source.getBoundingClientRect(), to = target.getBoundingClientRect();
        next[source.dataset.match ?? ""] = elbow(Math.round(from.right - frame.left), Math.round(from.top + from.height / 2 - frame.top), Math.round(to.left - frame.left), Math.round(to.top + to.height / 2 - frame.top));
      });
      setLines(current => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [teams.length]);

  const enter = reduceMotion ? { opacity: 0 } : { opacity: 0, x: -16, filter: `blur(${motionTokens.blur.soft}px)` };

  return (
    <section className={[styles.bracket, className].filter(Boolean).join(" ")} aria-label={title}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.progress}>{decided} of {all.length} matches decided</p>
        </div>
        <div className={styles.tools}>
          <button type="button" className={styles.tool} disabled={!open || filling} onClick={() => setFilling(true)}><WandSparkles size={14} aria-hidden="true" />Auto-fill</button>
          <button type="button" className={styles.tool} disabled={decided === 0} onClick={() => { setFilling(false); commit({}); }}><RotateCcw size={14} aria-hidden="true" />Reset</button>
        </div>
      </header>

      <LayoutGroup id={uid}>
        <div ref={board} className={styles.board} style={{ gridTemplateColumns: `repeat(${rounds.length}, minmax(0, 1fr))` }}>
          <svg className={styles.lines} aria-hidden="true">
            {all.map(match => lines[match.id] ? (
              <g key={match.id}>
                <path className={styles.line} d={lines[match.id]} />
                <motion.path className={styles.lineOn} d={lines[match.id]} initial={false} animate={{ pathLength: match.winner ? 1 : 0, opacity: match.winner ? 1 : 0 }} transition={reduceMotion ? { duration: 0 } : { pathLength: { duration: 0.42, ease: motionTokens.ease.inOut }, opacity: { duration: 0.1 } }} />
              </g>
            ) : null)}
          </svg>
          {rounds.map((round, roundIndex) => {
            const name = roundName(roundIndex, rounds.length, teams.length);
            return (
              <div key={roundIndex} className={styles.round} role="group" aria-label={name}>
                <p className={styles.roundName}><span className={styles.full}>{name}</span><span className={styles.code} aria-hidden="true">{name.replace("finals", "s").replace("Quarter", "Quarters").replace("Semi", "Semis").replace(/ss$/, "s")}</span></p>
                <div className={styles.matches}>
                  {round.map(match => (
                    <motion.div key={match.id} className={styles.match} data-match={match.id} data-final={roundIndex === rounds.length - 1} initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionTokens.spring.gentle, delay: roundIndex * 0.08 + match.index * 0.03 }}>
                      {match.slots.map((team, slot) => {
                        const won = team !== null && match.winner?.id === team.id;
                        const lost = team !== null && match.winner !== null && !won;
                        return (
                          <div key={slot} className={styles.slot} data-slot={`${match.id}-${slot}`}>
                            {won ? <motion.span layoutId={`pick-${match.id}`} className={styles.pick} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.snappy} /> : null}
                            <AnimatePresence mode="popLayout" initial={false}>
                              {team ? (
                                <motion.button
                                  key={team.id}
                                  type="button"
                                  className={styles.team}
                                  data-won={won}
                                  data-lost={lost}
                                  aria-pressed={won}
                                  aria-label={`${team.name}, seed ${team.seed}. ${won ? "Picked to win" : "Pick to win"} ${name.toLowerCase().replace(/s$/, "")}${round.length > 1 ? ` ${match.index + 1}` : ""}`}
                                  onClick={() => { setFilling(false); pick(match, team); }}
                                  initial={roundIndex === 0 ? false : enter}
                                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                  transition={reduceMotion ? { duration: motionTokens.duration.fast } : { ...motionTokens.spring.gentle, delay: 0.3 }}
                                >
                                  <span className={styles.seed}>{team.seed}</span>
                                  <span className={styles.name}><span className={styles.full}>{team.name}</span><span className={styles.code}>{team.code}</span></span>
                                  <span className={styles.check} aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
                                </motion.button>
                              ) : (
                                <motion.span key="open" className={styles.pending} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }}>
                                  <span className={styles.full}>Winner of {roundName(roundIndex - 1, rounds.length, teams.length).toLowerCase().replace(/s$/, "")} {match.index * 2 + slot + 1}</span><span className={styles.code}>TBD</span>
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </LayoutGroup>

      <div className={styles.podium} role="status">
        <AnimatePresence mode="wait" initial={false}>
          {champion ? (
            <motion.p key={champion.id} className={styles.champion} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={reduceMotion ? { duration: motionTokens.duration.fast } : { type: "spring", visualDuration: 0.4, bounce: 0.32, delay: 0.35 }}>
              <Trophy size={16} aria-hidden="true" /><span><strong>{champion.name}</strong> win the cup</span>
            </motion.p>
          ) : (
            <motion.p key="none" className={styles.waiting} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }}>Pick a winner in each match to crown a champion.</motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default KnockoutBracket;
