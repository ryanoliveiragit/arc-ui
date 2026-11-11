"use client";

import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, Ref } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./order-book.module.css";

export type OrderSide = "bid" | "ask";

export interface OrderLevel {
  /** Price of the level. */
  price: number;
  /** Size resting at that price, in the base asset. */
  size: number;
}

/**
 * A live order book: bids on the left, asks on the right, best prices meeting in the middle. A depth bar behind each row
 * shows the cumulative size up to it, and a row flashes when its size changes. When the price moves, rows slide to their
 * new place instead of jumping. Hover or focus a row to see what it takes to trade through to it; click one to select its price.
 */
export interface OrderBookProps {
  /** Buy orders. Any order: the highest price is drawn first. */
  bids: OrderLevel[];
  /** Sell orders. Any order: the lowest price is drawn first. */
  asks: OrderLevel[];
  /** Accessible name of the book, such as "BTC-USD order book". */
  label: string;
  /** Rows shown per side. */
  depth?: number;
  /** Code of the asset sizes are counted in, such as "BTC". */
  baseSymbol?: string;
  /** Code of the asset prices are quoted in, such as "USD". */
  quoteSymbol?: string;
  /** Decimal places of a price. */
  pricePrecision?: number;
  /** Decimal places of a size. */
  sizePrecision?: number;
  /** Selected price, or null for none. Leave undefined to let the book keep its own selection. */
  selectedPrice?: number | null;
  /** Price selected at first when the book keeps its own selection. */
  defaultSelectedPrice?: number | null;
  /** Called with the level that was clicked, or with null when the selected level is clicked again. */
  onSelectLevel?: (level: (OrderLevel & { side: OrderSide }) | null) => void;
  /** Formatting locale. Fixed by default so server and client render the same numbers. */
  locale?: string;
  /** Extra class for the root element. */
  className?: string;
}

export interface OrderBookFeedOptions {
  /** Price the book starts around. */
  mid: number;
  /** Price step between two levels. */
  tick: number;
  /** Levels kept on each side. */
  levels?: number;
  /** Typical size of a level near the best price. */
  size?: number;
  /** Milliseconds between two ticks. */
  interval?: number;
  /** Seed of the generator. The same seed always replays the same session. */
  seed?: number;
  /** Stops the ticks while true. */
  paused?: boolean;
}

export interface OrderBookFeed {
  /** Buy levels, best first. */
  bids: OrderLevel[];
  /** Sell levels, best first. */
  asks: OrderLevel[];
  /** False while paused, while the tab is hidden, or when the person asked for reduced motion. */
  running: boolean;
}

type Hover = { side: OrderSide; index: number };
type Rung = OrderLevel & { total: number; cost: number };

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const noopSubscribe = () => () => {};
/** Reduced motion only after hydration, so the server and the first client render agree. */
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = useReducedMotion();
  return hydrated && !!reduced;
}

type Ladder = { center: number; sizes: Map<number, number>; state: number };
const draw = (ladder: Ladder) => { ladder.state = (ladder.state * 1664525 + 1013904223) >>> 0; return ladder.state / 4294967296; };
const fresh = (ladder: Ladder, size: number, distance: number) => size * (.25 + draw(ladder) * 1.35) * (1 + distance * .14);

/**
 * A simulated feed for demos and empty states: a seeded ladder whose sizes change a few at a time and whose price steps
 * up or down now and then. It stands still under reduced motion and while the tab is hidden.
 */
export function useOrderBookFeed({ mid, tick, levels = 10, size = 1, interval = 850, seed = 7, paused = false }: OrderBookFeedOptions): OrderBookFeed {
  const reduced = useReducedMotionSafe();
  const ladderRef = useRef<Ladder | null>(null);
  if (!ladderRef.current) {
    const ladder: Ladder = { center: Math.round(mid / tick), sizes: new Map(), state: seed >>> 0 };
    for (let step = 0; step < levels; step++) {
      ladder.sizes.set(ladder.center - step, fresh(ladder, size, step));
      ladder.sizes.set(ladder.center + 1 + step, fresh(ladder, size, step));
    }
    ladderRef.current = ladder;
  }
  const [version, setVersion] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const sync = () => setVisible(document.visibilityState !== "hidden");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  const running = !paused && !reduced && visible;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const ladder = ladderRef.current!;
      // Now and then the price steps: the level that was traded through changes side and starts small.
      const roll = draw(ladder);
      if (roll < .2) {
        const up = draw(ladder) < .5;
        ladder.center += up ? 1 : -1;
        ladder.sizes.set(up ? ladder.center : ladder.center + 1, fresh(ladder, size, 0) * .4);
        ladder.sizes.set(up ? ladder.center + levels : ladder.center - levels + 1, fresh(ladder, size, levels - 1));
        ladder.sizes.delete(up ? ladder.center - levels : ladder.center + levels + 1);
      }
      // Every tick a few levels gain or lose size.
      const changes = 2 + Math.floor(draw(ladder) * 3);
      for (let change = 0; change < changes; change++) {
        const step = Math.floor(draw(ladder) * draw(ladder) * levels);
        const key = draw(ladder) < .5 ? ladder.center - step : ladder.center + 1 + step;
        const current = ladder.sizes.get(key) ?? fresh(ladder, size, step);
        ladder.sizes.set(key, Math.max(size * .04, draw(ladder) < .3 ? fresh(ladder, size, step) : current * (.55 + draw(ladder) * .95)));
      }
      setVersion(value => value + 1);
    }, interval);
    return () => window.clearInterval(timer);
  }, [running, interval, levels, size]);

  return useMemo(() => {
    const ladder = ladderRef.current!;
    const level = (key: number): OrderLevel => ({ price: Math.round(key * tick * 1e8) / 1e8, size: ladder.sizes.get(key) ?? 0 });
    return {
      bids: Array.from({ length: levels }, (_, step) => level(ladder.center - step)),
      asks: Array.from({ length: levels }, (_, step) => level(ladder.center + 1 + step)),
      running,
    };
    // version stands for the ladder, which changes in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, levels, tick, running]);
}

interface RowProps {
  side: OrderSide; index: number; price: number; size: number; share: number;
  priceText: string; sizeText: string; totalText: string; name: string;
  inRange: boolean; selected: boolean; tabStop: boolean; reduced: boolean;
  onPick: (side: OrderSide, index: number) => void;
  onEnter: (side: OrderSide, index: number) => void;
  /** AnimatePresence measures the row through this ref when it leaves. */
  ref?: Ref<HTMLLIElement>;
}

/** One price level. It remembers the last size it showed, so it can flash in the direction the size moved. */
const Row = memo(function Row({ side, index, size, share, priceText, sizeText, totalText, name, inRange, selected, tabStop, reduced, onPick, onEnter, ref }: RowProps) {
  const [seen, setSeen] = useState({ size, count: 0, grew: true });
  if (seen.size !== size) setSeen({ size, count: seen.count + 1, grew: size > seen.size });
  return <motion.li ref={ref} className={styles.item} layout={reduced ? false : "position"} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: reduced ? { duration: 0 } : { duration: motionTokens.duration.standard, ease: enter, delay: .16 } }}
    exit={{ opacity: 0, transition: { duration: reduced ? 0 : motionTokens.duration.instant } }} transition={reduced ? { duration: 0 } : { layout: motionTokens.spring.smooth }}>
    <button type="button" className={styles.row} data-side={side} data-index={index} data-in-range={inRange || undefined} aria-pressed={selected} aria-label={name} tabIndex={tabStop ? 0 : -1}
      onClick={() => onPick(side, index)} onPointerEnter={() => onEnter(side, index)}>
      <span className={styles.depth} style={{ "--share": share } as CSSProperties} aria-hidden="true" />
      {seen.count > 0 && <span key={seen.count} className={styles.flash} data-grew={seen.grew || undefined} aria-hidden="true" />}
      <span className={styles.total} aria-hidden="true">{totalText}</span>
      <span key={`size-${seen.count}`} className={styles.size} data-changed={seen.count > 0 ? (seen.grew ? "up" : "down") : undefined} aria-hidden="true">{sizeText}</span>
      <span className={styles.price} aria-hidden="true">{priceText}</span>
    </button>
  </motion.li>;
});

export function OrderBook({ bids, asks, label, depth = 10, baseSymbol = "", quoteSymbol = "", pricePrecision = 2, sizePrecision = 3, selectedPrice, defaultSelectedPrice = null, onSelectLevel, locale = "en-US", className }: OrderBookProps) {
  const reduced = useReducedMotionSafe();
  const bookRef = useRef<HTMLDivElement>(null);
  const formats = useMemo(() => ({
    price: new Intl.NumberFormat(locale, { minimumFractionDigits: pricePrecision, maximumFractionDigits: pricePrecision }),
    size: new Intl.NumberFormat(locale, { minimumFractionDigits: sizePrecision, maximumFractionDigits: sizePrecision }),
    percent: new Intl.NumberFormat(locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
    share: new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
  }), [locale, pricePrecision, sizePrecision]);

  const model = useMemo(() => {
    const ladder = (levels: OrderLevel[], direction: 1 | -1): Rung[] => {
      let total = 0, cost = 0;
      return [...levels].filter(level => level.size > 0).sort((a, b) => (a.price - b.price) * direction).slice(0, depth).map(level => { total += level.size; cost += level.size * level.price; return { ...level, total, cost }; });
    };
    const bid = ladder(bids, -1), ask = ladder(asks, 1);
    const bidTotal = bid[bid.length - 1]?.total ?? 0, askTotal = ask[ask.length - 1]?.total ?? 0;
    const bestBid = bid[0]?.price, bestAsk = ask[0]?.price;
    const mid = bestBid != null && bestAsk != null ? (bestBid + bestAsk) / 2 : bestBid ?? bestAsk ?? 0;
    return { bid, ask, bidTotal, askTotal, deepest: Math.max(bidTotal, askTotal) || 1, mid, spread: bestBid != null && bestAsk != null ? bestAsk - bestBid : 0 };
  }, [bids, asks, depth]);

  const [trend, setTrend] = useState({ mid: model.mid, up: true });
  if (trend.mid !== model.mid) setTrend({ mid: model.mid, up: model.mid > trend.mid });

  const [internal, setInternal] = useState<number | null>(defaultSelectedPrice);
  const selected = selectedPrice !== undefined ? selectedPrice : internal;
  const [hover, setHover] = useState<Hover | null>(null);
  const [stop, setStop] = useState<Hover>({ side: "bid", index: 0 });

  const latest = useRef({ model, selected, selectedPrice, onSelectLevel });
  latest.current = { model, selected, selectedPrice, onSelectLevel };
  const handlers = useMemo(() => ({
    pick: (side: OrderSide, index: number) => {
      const now = latest.current;
      const level = now.model[side][index];
      if (!level) return;
      const off = now.selected === level.price;
      if (now.selectedPrice === undefined) setInternal(off ? null : level.price);
      now.onSelectLevel?.(off ? null : { side, price: level.price, size: level.size });
    },
    enter: (side: OrderSide, index: number) => setHover({ side, index }),
  }), []);

  function onFocus(event: FocusEvent<HTMLDivElement>) {
    const row = (event.target as HTMLElement).closest<HTMLElement>("[data-side]");
    if (!row) return;
    const next = { side: row.dataset.side as OrderSide, index: Number(row.dataset.index) };
    setStop(next);
    setHover(next);
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const row = (event.target as HTMLElement).closest<HTMLElement>("[data-side]");
    if (!row) return;
    const side = row.dataset.side as OrderSide, index = Number(row.dataset.index);
    const other: OrderSide = side === "bid" ? "ask" : "bid";
    const moves: Record<string, Hover> = {
      ArrowUp: { side, index: index - 1 }, ArrowDown: { side, index: index + 1 }, Home: { side, index: 0 }, End: { side, index: model[side].length - 1 },
      ArrowLeft: { side: "bid", index }, ArrowRight: { side: "ask", index },
    };
    const next = moves[event.key];
    if (!next || (next.side === other && !model[other].length)) return;
    event.preventDefault();
    const target = Math.min(Math.max(next.index, 0), model[next.side].length - 1);
    bookRef.current?.querySelector<HTMLElement>(`[data-side="${next.side}"][data-index="${target}"]`)?.focus();
  }

  const stopSide: OrderSide = model[stop.side].length ? stop.side : stop.side === "bid" ? "ask" : "bid";
  const stopIndex = Math.min(stop.index, Math.max(0, model[stopSide].length - 1));
  const unit = baseSymbol ? ` ${baseSymbol}` : "";
  const rows = (side: OrderSide) => model[side].map((level, index) => <Row key={level.price} side={side} index={index} price={level.price} size={level.size} share={level.total / model.deepest}
    priceText={formats.price.format(level.price)} sizeText={formats.size.format(level.size)} totalText={formats.size.format(level.total)}
    name={`${side === "bid" ? "Bid" : "Ask"} ${formats.price.format(level.price)}, size ${formats.size.format(level.size)}${unit}, total ${formats.size.format(level.total)}${unit}`}
    inRange={hover?.side === side && index <= hover.index} selected={selected === level.price} tabStop={side === stopSide && index === stopIndex} reduced={reduced}
    onPick={handlers.pick} onEnter={handlers.enter} />);

  const swept = hover ? model[hover.side][Math.min(hover.index, model[hover.side].length - 1)] : undefined;
  // The sweep line keeps its last text while it fades out.
  const [sweep, setSweep] = useState<{ side: OrderSide; total: number; average: number } | null>(null);
  if (swept && hover && (sweep?.side !== hover.side || sweep.total !== swept.total)) setSweep({ side: hover.side, total: swept.total, average: swept.cost / swept.total });
  const bidShare = model.bidTotal + model.askTotal > 0 ? model.bidTotal / (model.bidTotal + model.askTotal) : .5;
  const quote = quoteSymbol ? ` (${quoteSymbol})` : "", base = baseSymbol ? ` (${baseSymbol})` : "";

  return <div className={[styles.root, className].filter(Boolean).join(" ")} role="group" aria-label={label}>
    <div className={styles.heads} aria-hidden="true">
      <div className={styles.head} data-side="bid"><span className={styles.total}>Total</span><span>Size{base}</span><span>Bid{quote}</span></div>
      <div className={styles.head} data-side="ask"><span className={styles.total}>Total</span><span>Size{base}</span><span>Ask{quote}</span></div>
    </div>

    <div ref={bookRef} className={styles.book} onFocus={onFocus} onBlur={event => { if (!bookRef.current?.contains(event.relatedTarget as Node | null)) setHover(null); }}
      onKeyDown={onKeyDown} onPointerLeave={() => setHover(null)}>
      <ul className={styles.side} data-side="bid" aria-label="Bids, best price first"><AnimatePresence initial={false} mode="popLayout">{rows("bid")}</AnimatePresence></ul>
      <ul className={styles.side} data-side="ask" aria-label="Asks, best price first"><AnimatePresence initial={false} mode="popLayout">{rows("ask")}</AnimatePresence></ul>
    </div>

    <div className={styles.spread}>
      <span className={styles.pair}><span className={styles.term}>Spread</span><span className={styles.figure}>{formats.price.format(model.spread)}</span><span className={styles.term}>{formats.percent.format(model.mid ? model.spread / model.mid * 100 : 0)}%</span></span>
      <span className={styles.mid} data-up={trend.up || undefined}><span className={styles.term}>Mid</span><span className={styles.midValue}>{formats.price.format(model.mid)}</span><ArrowUp className={styles.arrow} size={14} strokeWidth={2.25} aria-hidden="true" /></span>
    </div>

    <div className={styles.foot} data-mode={hover ? "sweep" : "balance"}>
      <div className={styles.balance} aria-hidden={hover ? true : undefined}>
        <span className={styles.balanceLabel} data-side="bid">{formats.share.format(bidShare * 100)}% bids</span>
        <span className={styles.meter} role="img" aria-label={`Bids hold ${formats.share.format(bidShare * 100)}% of the visible size`}><span className={styles.meterFill} style={{ "--share": bidShare } as CSSProperties} /></span>
        <span className={styles.balanceLabel} data-side="ask">{formats.share.format((1 - bidShare) * 100)}% asks</span>
      </div>
      <p className={styles.sweep} data-side={sweep?.side} aria-hidden={hover ? undefined : true}>
        {sweep && <><span className={styles.term}>{sweep.side === "bid" ? "Sell" : "Buy"}</span><span className={styles.figure}>{formats.size.format(sweep.total)}{unit}</span><span className={styles.term}>at an average of</span><span className={styles.figure}>{formats.price.format(sweep.average)}</span></>}
      </p>
    </div>
  </div>;
}

export default OrderBook;
