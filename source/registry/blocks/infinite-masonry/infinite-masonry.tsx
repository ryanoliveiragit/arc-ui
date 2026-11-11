"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUp, Heart } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import { people, photos } from "@/lib/media";
import styles from "./infinite-masonry.module.css";

export interface MasonryItem {
  /** Unique id. Cards with an id already in the feed are skipped. */
  id: string;
  /** Name of the shot, shown under the image. */
  title: string;
  /** Who made it, shown under the title. */
  author: string;
  /** Avatar image of the author. */
  avatar: string;
  /** Image address. */
  image: string;
  /** Text alternative of the image. */
  alt: string;
  /** Image height divided by its width. The grid reserves this space before the image loads. */
  ratio: number;
  /** Like count before the visitor's own like. */
  likes: number;
}

export interface InfiniteMasonryProps {
  /** Cards shown before any loading. Defaults to the first sample page. */
  initialItems?: MasonryItem[];
  /** Loads the next page. Receives the page number (1 for the first load after the initial cards). Resolve with an empty list to end the feed. Defaults to a simulated loader. */
  loadPage?: (page: number) => Promise<MasonryItem[]>;
  /** Narrowest a column may get, in px. The grid fits as many columns as its width allows. */
  minColumnWidth?: number;
  /** Most columns the grid uses, however wide it gets. */
  maxColumns?: number;
  /** Heading above the grid. */
  title?: string;
  /** Called when a card's like button is toggled. */
  onLikeChange?: (id: string, liked: boolean) => void;
  /** Extra class for the section. */
  className?: string;
}

const TITLES = ["Quiet corners", "Morning light study", "Clay and linen", "Second floor, east", "Low tide", "Weekend table", "Arches at noon", "Soft geometry", "The long hallway", "Green room", "After the rain", "Paper lanterns", "Ridge line", "Slow breakfast", "Blue hour", "Terracotta steps"];
const PAGE_SIZE = 12;
const SAMPLE_PAGES = 4;
const GAP = 16;
/** Height of the caption row under each image, used to balance the columns. */
const CAPTION = 56;

/** One page of sample cards. Everything derives from the index, so the feed is the same on every visit. */
export function sampleMasonryPage(page: number, size = PAGE_SIZE): MasonryItem[] {
  if (page >= SAMPLE_PAGES) return [];
  return Array.from({ length: size }, (_, offset) => {
    const index = page * size + offset;
    const shot = photos[(index * 5 + 3) % photos.length]!;
    const by = people[(index * 3 + 1) % people.length]!;
    // Portraits are trimmed and landscapes kept, so no card is taller than two of its neighbours.
    const ratio = Math.min(1.45, Math.max(0.62, shot.height / shot.width)) * (index % 4 === 2 ? 0.86 : 1);
    return { id: `shot-${index}`, title: TITLES[index % TITLES.length]!, author: by.name, avatar: by.src, image: shot.src, alt: shot.alt, ratio, likes: 18 + ((index * 37) % 240) };
  });
}

const simulatedLoad = (page: number) => new Promise<MasonryItem[]>(resolve => window.setTimeout(() => resolve(sampleMasonryPage(page)), 900));

function Card({ item, order, fresh, liked, onLike, position, total }: { item: MasonryItem; order: number; fresh: boolean; liked: boolean; onLike: () => void; position: number; total: number }) {
  const reduceMotion = useReducedMotion();
  const likes = item.likes + (liked ? 1 : 0);
  return (
    <motion.article
      className={styles.card}
      aria-posinset={position}
      aria-setsize={total}
      aria-label={`${item.title} by ${item.author}`}
      initial={fresh ? (reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.96 }) : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduceMotion ? { duration: motionTokens.duration.fast } : { ...motionTokens.spring.gentle, delay: Math.min(order * 0.05, 0.45) }}
    >
      <div className={styles.media} style={{ aspectRatio: `1 / ${item.ratio}` }}>
        <img src={item.image} alt={item.alt} loading="lazy" draggable={false} />
      </div>
      <div className={styles.caption}>
        <img className={styles.avatar} src={item.avatar} alt="" loading="lazy" />
        <div className={styles.text}>
          <span className={styles.name}>{item.title}</span>
          <span className={styles.author}>{item.author}</span>
        </div>
        <button type="button" className={styles.like} aria-pressed={liked} aria-label={`${liked ? "Unlike" : "Like"} ${item.title}, ${likes} likes`} onClick={onLike}>
          <motion.span className={styles.heart} key={liked ? "on" : "off"} initial={liked && !reduceMotion ? { scale: 0.5 } : false} animate={{ scale: 1 }} transition={{ type: "spring", visualDuration: 0.3, bounce: 0.45 }}>
            <Heart size={15} aria-hidden="true" />
          </motion.span>
          <span className={styles.likes}>{likes}</span>
        </button>
      </div>
    </motion.article>
  );
}

/** Masonry feed: cards of different heights fill the shortest column, and the next page loads when the end scrolls into view. */
export function InfiniteMasonry({ initialItems, loadPage = simulatedLoad, minColumnWidth = 160, maxColumns = 4, title = "Fresh from the studio", onLikeChange, className }: InfiniteMasonryProps) {
  const [items, setItems] = useState<MasonryItem[]>(() => initialItems ?? sampleMasonryPage(0));
  const [columnCount, setColumnCount] = useState(3);
  const [columnWidth, setColumnWidth] = useState(240);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);
  const [liked, setLiked] = useState<ReadonlySet<string>>(() => new Set());
  const grid = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const page = useRef(1);
  const busy = useRef(false);
  const mounted = useRef(true);
  /** Position of each card inside the page it arrived with, for the stagger. */
  const arrival = useRef(new Map<string, number>());
  /** Cards that already rose in. Moving to another column on resize must not replay the entrance. */
  const seen = useRef(new Set<string>());

  useLayoutEffect(() => {
    const node = grid.current;
    if (!node) return;
    const measure = () => {
      const width = node.clientWidth;
      const count = Math.max(1, Math.min(maxColumns, Math.floor((width + GAP) / (minColumnWidth + GAP))));
      setColumnCount(count);
      setColumnWidth((width - GAP * (count - 1)) / count);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [maxColumns, minColumnWidth]);

  // Greedy placement: each card goes to the column that is shortest so far. New pages never move older cards.
  const columns = useMemo(() => {
    const lanes = Array.from({ length: columnCount }, () => ({ height: 0, cards: [] as { item: MasonryItem; position: number }[] }));
    items.forEach((item, index) => {
      const lane = lanes.reduce((best, candidate) => (candidate.height < best.height ? candidate : best), lanes[0]!);
      lane.cards.push({ item, position: index + 1 });
      lane.height += item.ratio * columnWidth + CAPTION + GAP;
    });
    return lanes;
  }, [items, columnCount, columnWidth]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(entries => setNearEnd(entries.some(entry => entry.isIntersecting)), { rootMargin: "0px 0px 320px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  // Runs again after each page lands, so a tall screen keeps loading until the end is out of view. The request outlives
  // this effect on purpose: scrolling away while it is in flight must not drop the page it brings.
  useEffect(() => {
    if (!nearEnd || finished || busy.current) return;
    busy.current = true;
    setLoading(true);
    loadPage(page.current).then(next => {
      if (!mounted.current) return;
      page.current += 1;
      if (next.length === 0) setFinished(true);
      else {
        next.forEach((item, index) => arrival.current.set(item.id, index));
        setItems(current => [...current, ...next.filter(item => !current.some(existing => existing.id === item.id))]);
      }
    }).catch(() => { if (mounted.current) setFinished(true); }).finally(() => {
      busy.current = false;
      if (mounted.current) setLoading(false);
    });
  }, [nearEnd, finished, loading, loadPage]);

  useEffect(() => { items.forEach(item => seen.current.add(item.id)); }, [items]);

  const toggleLike = (id: string) => {
    const next = new Set(liked);
    if (next.has(id)) next.delete(id); else next.add(id);
    setLiked(next);
    onLikeChange?.(id, next.has(id));
  };

  return (
    <section className={[styles.masonry, className].filter(Boolean).join(" ")} aria-label={title}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.count}>{items.length} shots{liked.size ? `, ${liked.size} liked` : ""}</p>
        </header>
        <div ref={grid} className={styles.grid} role="feed" aria-busy={loading}>
          {columns.map((lane, laneIndex) => (
            <div key={laneIndex} className={styles.column}>
              {lane.cards.map(({ item, position }) => (
                <Card key={item.id} item={item} position={position} total={finished ? items.length : -1} order={arrival.current.get(item.id) ?? position - 1} fresh={!seen.current.has(item.id)} liked={liked.has(item.id)} onLike={() => toggleLike(item.id)} />
              ))}
              {loading ? <div className={styles.skeleton} style={{ aspectRatio: `1 / ${[1.1, 0.8, 1.3, 0.95][laneIndex % 4]}` }} aria-hidden="true" /> : null}
            </div>
          ))}
        </div>
        <div ref={sentinel} className={styles.sentinel} aria-hidden="true" />
        <div className={styles.footer} role="status">
          {loading ? <span className={styles.loading}><span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />Loading more shots</span> : null}
          {finished ? (
            <>
              <span>You have seen all {items.length} shots.</span>
              <button type="button" className={styles.top} onClick={() => grid.current?.closest("section")?.scrollIntoView({ behavior: "smooth", block: "start" })}><ArrowUp size={14} aria-hidden="true" />Back to top</button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default InfiniteMasonry;
