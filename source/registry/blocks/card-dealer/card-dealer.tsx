"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Transition } from "motion/react";
import { Club, Diamond, Heart, RotateCcw, Shuffle, Spade } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./card-dealer.module.css";

export type CardSuit = "spades" | "hearts" | "diamonds" | "clubs";

export interface PlayingCard {
  /** Unique key, such as "K-spades". */
  id: string;
  /** Printed rank: "2" to "10", "J", "Q", "K" or "A". */
  rank: string;
  /** The suit. */
  suit: CardSuit;
  /** Rank order from 0 (two) to 12 (ace). */
  value: number;
}

export interface CardDealerProps {
  /** How many positions the table has, from 1 to 7. Five makes a poker hand, and the hand gets named. */
  positions?: number;
  /** Called after every deal with the cards now on the table, in position order. */
  onDeal?: (hand: PlayingCard[]) => void;
  /** Accessible name of the table. */
  label?: string;
  /** Deal a full hand once the table has been measured, so a preview opens with cards on the table. */
  dealOnMount?: boolean;
  /** Extra class for the root. */
  className?: string;
}

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS: CardSuit[] = ["spades", "hearts", "diamonds", "clubs"];
const NAMES = ["Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King", "Ace"];
const suitIcons = { spades: Spade, hearts: Heart, diamonds: Diamond, clubs: Club };
/** Deck cards drawn as a visible stack. The rest of the deck is only a number. */
const STACK = 5;
/** Seconds between two cards of the same deal. */
const DEAL_GAP = .13;
const ease = [...motionTokens.ease.standard] as [number, number, number, number];
const out = [...motionTokens.ease.enter] as [number, number, number, number];
const inOut = [...motionTokens.ease.inOut] as [number, number, number, number];

const plural = (value: number) => `${NAMES[value]}${value === 4 ? "es" : "s"}`;
const describe = (card: PlayingCard) => `${NAMES[card.value]} of ${card.suit}`;

/** The factory order: mixed by a fixed recipe, so the server and the first client render deal the same cards. */
function factoryDeck(): PlayingCard[] {
  const cards = SUITS.flatMap(suit => RANKS.map((rank, value) => ({ id: `${rank}-${suit}`, rank, suit, value })));
  let seed = 20261;
  for (let index = cards.length - 1; index > 0; index--) {
    seed = (seed * 9301 + 49297) % 233280;
    const other = Math.floor((seed / 233280) * (index + 1));
    [cards[index], cards[other]] = [cards[other]!, cards[index]!];
  }
  return cards;
}

/** A real shuffle. Only ever called from a click, never while rendering. */
function shuffled(cards: PlayingCard[]) {
  const next = [...cards];
  for (let index = next.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [next[index], next[other]] = [next[other]!, next[index]!];
  }
  return next;
}

/** Names a hand the way a poker player would. Straights and flushes need all five cards. */
function nameHand(cards: PlayingCard[]) {
  const values = cards.map(card => card.value).sort((a, b) => b - a);
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const top = groups[0], second = groups[1];
  if (!top) return "";
  const five = cards.length === 5;
  const flush = five && cards.every(card => card.suit === cards[0]!.suit);
  const wheel = values.join() === "12,3,2,1,0";
  const straight = five && counts.size === 5 && (values[0]! - values[4]! === 4 || wheel);
  if (straight && flush) return values[0] === 12 && !wheel ? "Royal flush" : "Straight flush";
  if (top[1] === 4) return `Four ${plural(top[0])}`;
  if (top[1] === 3 && second?.[1] === 2) return "Full house";
  if (flush) return "Flush";
  if (straight) return "Straight";
  if (top[1] === 3) return `Three ${plural(top[0])}`;
  if (top[1] === 2 && second?.[1] === 2) return "Two pair";
  if (top[1] === 2) return `Pair of ${plural(top[0])}`;
  return `${NAMES[values[0]!]} high`;
}

interface Spot { x: number; y: number }

function TableCard({ card, slot, depth, spots, positions, order, base, riffle, reduce }: { card: PlayingCard; slot: number | null; depth: number; spots: { deck: Spot; slots: Spot[] }; positions: number; order: number; base: number; riffle: boolean; reduce: boolean }) {
  const Icon = suitIcons[card.suit];
  const red = card.suit === "hearts" || card.suit === "diamonds";
  const onTable = slot != null && spots.slots[slot];
  const middle = (positions - 1) / 2;
  const lean = slot == null ? 0 : slot - middle;
  const side = depth % 2 ? 1 : -1;
  const deckX = spots.deck.x - depth * 1.2, deckY = spots.deck.y - depth * 1.6;
  const instant: Transition = { duration: 0 };

  // On the table: slide across fast and fall late, which bends the path into an arc, while the card lifts and turns face up.
  const target: TargetAndTransition = onTable
    ? { x: onTable.x, y: onTable.y + Math.abs(lean) * Math.abs(lean) * 2.5, rotate: lean * 3.5, rotateY: 0, scale: reduce ? 1 : [1, 1.16, 1] }
    : { x: riffle ? [deckX, deckX + side * (22 + depth * 3), deckX] : deckX, y: deckY, rotate: riffle ? [0, side * 9, 0] : 0, rotateY: 180, scale: 1 };
  const delay = base + order * DEAL_GAP;
  const transition: Transition = reduce
    ? instant
    : onTable
      ? { x: { duration: .62, ease: out, delay }, y: { duration: .62, ease: inOut, delay }, rotate: { duration: .62, ease: out, delay }, scale: { duration: .62, ease: inOut, delay, times: [0, .45, 1] }, rotateY: { duration: .46, ease: inOut, delay: delay + .14 } }
      : riffle
        ? { duration: .36, ease: inOut, delay: depth * .035, repeat: 1, rotateY: instant }
        : { duration: .5, ease, rotateY: { duration: .4, ease: inOut } };

  return (
    <motion.div
      className={styles.card}
      style={{ zIndex: slot != null ? 20 + slot : 10 - depth, transformPerspective: 900 }}
      // Opacity is never animated here: a see-through element flattens its 3D children, and the face would show mirrored.
      // A card that leaves flies back onto the deck and is removed there, where the next back looks the same.
      initial={{ x: deckX, y: deckY, rotate: 0, rotateY: 180, scale: 1 }}
      animate={target}
      exit={{ x: spots.deck.x, y: spots.deck.y, rotate: 0, rotateY: 180, scale: 1, transition: reduce ? instant : { duration: .5, ease, rotateY: { duration: .4, ease: inOut } } }}
      transition={transition}
    >
      <span className={styles.face} data-red={red ? "" : undefined}>
        <span className={styles.index}>{card.rank}<Icon fill="currentColor" strokeWidth={0} /></span>
        <span className={styles.pip}><Icon fill="currentColor" strokeWidth={0} /></span>
      </span>
      <span className={styles.back} />
    </motion.div>
  );
}

/**
 * A deck and a table. Dealing sends each card from the deck to its position along an arc, lifting and turning face up
 * on the way, one after another. Shuffle riffles the deck into a new random order and Reset restores the factory
 * order. With five positions the finished hand is named like a poker hand.
 */
export function CardDealer({ positions = 5, onDeal, label = "Card table", dealOnMount = false, className }: CardDealerProps) {
  const reduce = useReducedMotion() ?? false;
  const count = Math.min(Math.max(Math.round(positions), 1), 7);
  const [deck, setDeck] = useState<PlayingCard[]>(factoryDeck);
  const [hand, setHand] = useState<(PlayingCard | null)[]>(() => Array.from({ length: count }, () => null));
  const [order, setOrder] = useState<Record<string, number>>({});
  const [base, setBase] = useState(0);
  const [riffle, setRiffle] = useState(false);
  const [spots, setSpots] = useState<{ deck: Spot; slots: Spot[] } | null>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const dealRef = useRef(onDeal);
  dealRef.current = onDeal;

  // Positions are real elements; the cards are moved onto them, so the layout stays responsive.
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const measure = () => {
      const deckSpot = inner.querySelector<HTMLElement>("[data-deck]");
      const slotSpots = Array.from(inner.querySelectorAll<HTMLElement>("[data-slot]"));
      if (!deckSpot) return;
      // Measured against the card layer's own box, whatever positioned ancestors sit in between.
      const origin = inner.getBoundingClientRect();
      const spot = (node: HTMLElement): Spot => { const box = node.getBoundingClientRect(); return { x: box.left - origin.left, y: box.top - origin.top }; };
      setSpots({ deck: spot(deckSpot), slots: slotSpots.map(spot) });
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [count]);
  useEffect(() => () => { timers.current.forEach(id => window.clearTimeout(id)); }, []);
  // A new number of positions clears the table.
  useEffect(() => { setHand(current => (current.length === count ? current : Array.from({ length: count }, () => null))); }, [count]);

  const cardsOnTable = hand.filter((card): card is PlayingCard => card != null);
  const full = cardsOnTable.length === count;
  const later = (run: () => void, ms: number) => { timers.current.push(window.setTimeout(run, reduce ? 0 : ms)); };

  const deal = (howMany: number) => {
    let pool = deck, table = hand, wait = 0;
    // A full table goes back under the deck first, then the next cards come off the top.
    if (table.every(Boolean)) { pool = [...pool, ...cardsOnTable]; table = table.map(() => null); wait = .3; }
    const empty = table.flatMap((card, index) => (card ? [] : [index])).slice(0, howMany);
    const next = [...table], nextOrder: Record<string, number> = {};
    empty.forEach((slot, index) => { const card = pool[index]; if (card) { next[slot] = card; nextOrder[card.id] = index; } });
    setDeck(pool.slice(empty.length));
    setHand(next);
    setOrder(nextOrder);
    setBase(wait);
    dealRef.current?.(next.filter((card): card is PlayingCard => card != null));
  };
  // dealOnMount: one deal, a beat after the positions are known (the cards need real spots to fly to).
  const dealtOnMount = useRef(false);
  useEffect(() => {
    if (!dealOnMount || dealtOnMount.current || !spots) return;
    dealtOnMount.current = true;
    const id = window.setTimeout(() => deal(count), reduce ? 0 : 450);
    timers.current.push(id);
  });
  const gather = () => { setHand(Array.from({ length: count }, () => null)); setOrder({}); setBase(0); };
  const shuffle = () => {
    const all = [...deck, ...cardsOnTable];
    gather();
    setDeck(all);
    later(() => { setRiffle(true); setDeck(shuffled(all)); }, cardsOnTable.length ? 420 : 0);
    later(() => setRiffle(false), (cardsOnTable.length ? 420 : 0) + 820);
  };
  const reset = () => { gather(); setDeck(factoryDeck()); setRiffle(false); };

  const handName = full && count >= 2 ? nameHand(cardsOnTable) : "";
  const status = cardsOnTable.length ? `On the table: ${cardsOnTable.map(describe).join(", ")}.${handName ? ` ${handName}.` : ""}` : "The table is empty.";

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.table} role="group" aria-label={label}>
        <div ref={innerRef} className={styles.inner} style={{ "--positions": count } as CSSProperties}>
          <div className={styles.deckRow}>
            <button type="button" className={styles.deck} data-deck="" aria-label={`Deck, ${deck.length} cards. Deal one card`} disabled={full || riffle} onClick={() => deal(1)} />
            <span className={styles.count} aria-hidden="true"><strong>{deck.length}</strong> in the deck</span>
          </div>
          <div className={styles.slots}>
            {hand.map((_, index) => <span key={index} className={styles.slot} data-slot="" />)}
          </div>
          {spots ? (
            <div className={styles.cards} aria-hidden="true">
              <AnimatePresence>
                {deck.slice(0, STACK).map((card, depth) => <TableCard key={card.id} card={card} slot={null} depth={depth} spots={spots} positions={count} order={0} base={0} riffle={riffle} reduce={reduce} />)}
                {hand.map((card, slot) => (card ? <TableCard key={card.id} card={card} slot={slot} depth={0} spots={spots} positions={count} order={order[card.id] ?? 0} base={base} riffle={false} reduce={reduce} /> : null))}
              </AnimatePresence>
            </div>
          ) : null}
        </div>
        <div className={styles.result}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={handName || (cardsOnTable.length ? "partial" : "empty")} className={styles.resultChip} data-named={handName ? "" : undefined} initial={{ opacity: 0, y: reduce ? 0 : 6, scale: reduce ? 1 : .94 }} animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? { duration: 0 } : { ...motionTokens.spring.snappy, delay: handName ? base + count * DEAL_GAP + .35 : 0 } }} exit={{ opacity: 0, transition: { duration: reduce ? 0 : motionTokens.duration.instant } }}>
              {handName || (cardsOnTable.length ? `${cardsOnTable.length} of ${count} dealt` : "Deal a hand to start")}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <div className={styles.controls}>
        <button type="button" className={`${styles.button} ${styles.primary}`} disabled={riffle} onClick={() => deal(count)}>{full ? "Deal next hand" : "Deal hand"}</button>
        <button type="button" className={styles.button} disabled={riffle} onClick={shuffle}><Shuffle size={16} aria-hidden="true" />Shuffle</button>
        <button type="button" className={styles.button} onClick={reset}><RotateCcw size={16} aria-hidden="true" />Reset</button>
      </div>
      <p className={styles.srOnly} aria-live="polite">{status}</p>
    </div>
  );
}

/** Ready preview: a five card table. */
export default function CardDealerPreview() {
  return (
    <section className={styles.preview}>
      <CardDealer dealOnMount />
    </section>
  );
}
