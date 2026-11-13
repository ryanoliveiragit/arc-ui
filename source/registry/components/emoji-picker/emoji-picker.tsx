"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Coffee,
  Flag,
  History,
  Lightbulb,
  PawPrint,
  Plane,
  Search,
  Shapes,
  Smile,
  Volleyball,
  X,
  type LucideIcon,
} from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import { ALL_EMOJI, applyTone, DEFAULT_RECENT, EMOJI_SECTIONS, TONE_HAND, type EmojiEntry, type SkinTone } from "./emoji-data";
import styles from "./emoji-picker.module.css";

export interface EmojiSelection {
  /** Chosen emoji with the active skin tone applied where the base takes one. */
  emoji: string;
  /** Base sequence without a skin tone modifier. */
  base: string;
  /** Display name of the emoji. */
  name: string;
  /** Skin tone applied (0 = default). */
  skinTone: SkinTone;
}

export interface EmojiPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "children"> {
  /** Called when an emoji is chosen by click, Enter, or Space. Check event.shiftKey to keep a popover open for several picks. */
  onSelect?: (selection: EmojiSelection, event: MouseEvent | KeyboardEvent) => void;
  /** Controlled skin tone: 0 is the default yellow, 1 to 5 go light to dark. */
  skinTone?: SkinTone;
  /** Skin tone before anything has been stored. */
  defaultSkinTone?: SkinTone;
  /** Called when a tone is chosen in the tone menu. */
  onSkinToneChange?: (tone: SkinTone) => void;
  /** localStorage key for recent emoji and the tone. Pass null to keep them in memory for this page only. Blocked storage falls back to memory automatically. */
  storageKey?: string | null;
  /** How many recently used emoji to keep. */
  recentLimit?: number;
  /** Shown under Popular until something has been picked. */
  defaultRecent?: readonly string[];
  /** Emoji per row. Defaults to as many 36px cells as fit, at least 6. */
  columns?: number;
  /** Focuses the search field on mount. Popovers and dialogs usually focus it already. */
  autoFocus?: boolean;
  /** Placeholder of the search field. */
  searchPlaceholder?: string;
  /** Accessible name of the picker group. */
  label?: string;
}

const CELL = 36;
/** 36px cell + 4px row gap. */
const ROW_H = 40;
const HEAD_H = 30;
const OVERSCAN_ROWS = 3;
/** Horizontal breathing room around the grid (matches .inner margin in the css module). */
const PAD_X = 12;

const TONE_NAMES = ["Default", "Light", "Medium light", "Medium", "Medium dark", "Dark"] as const;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  popular: History,
  "smileys-and-people": Smile,
  "animals-and-nature": PawPrint,
  "food-and-drink": Coffee,
  activities: Volleyball,
  "travel-and-places": Plane,
  objects: Lightbulb,
  symbols: Shapes,
  flags: Flag,
};

const BY_BASE = new Map<string, EmojiEntry>();
for (const { entry } of ALL_EMOJI) if (!BY_BASE.has(entry.base)) BY_BASE.set(entry.base, entry);

interface StoredState {
  recents: string[];
  tone: number;
}

function loadState(key: string): StoredState | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<StoredState>;
    const recents = Array.isArray(data.recents) ? data.recents.filter(v => typeof v === "string") : [];
    const tone = typeof data.tone === "number" && data.tone >= 0 && data.tone <= 5 ? Math.round(data.tone) : 0;
    return { recents, tone };
  } catch {
    return null;
  }
}

type Row = { kind: "head"; id: string; label: string } | { kind: "grid"; cells: EmojiEntry[] };

interface Layout {
  rows: Row[];
  /** Flat, display-ordered list of every cell (the keyboard space). */
  cells: EmojiEntry[];
  /** rowStart[r] = index into cells of the first cell of row r. */
  rowStart: number[];
  /** Top offset of each row in px. */
  offsets: number[];
  /** Total list height in px. */
  total: number;
  /** Section id -> top offset of its heading row. Insertion order = section order. */
  catOffset: Map<string, number>;
}

function buildLayout(query: string, recentEntries: readonly EmojiEntry[], hasRecent: boolean, cols: number): Layout {
  const rows: Row[] = [];
  const cells: EmojiEntry[] = [];
  const rowStart: number[] = [];
  const offsets: number[] = [];
  const catOffset = new Map<string, number>();
  let y = 0;
  const head = (id: string, label: string) => {
    rows.push({ kind: "head", id, label });
    rowStart.push(cells.length);
    offsets.push(y);
    catOffset.set(id, y);
    y += HEAD_H;
  };
  const grid = (items: EmojiEntry[]) => {
    for (let i = 0; i < items.length; i += cols) {
      const slice = items.slice(i, i + cols);
      rows.push({ kind: "grid", cells: slice });
      rowStart.push(cells.length);
      offsets.push(y);
      cells.push(...slice);
      y += ROW_H;
    }
  };
  const q = query.trim().toLowerCase();
  if (q) {
    grid(ALL_EMOJI.filter(({ entry }) => entry.lower.includes(q)).map(({ entry }) => entry));
  } else {
    head("popular", hasRecent ? "Recently used" : "Popular");
    grid(recentEntries as EmojiEntry[]);
    for (const s of EMOJI_SECTIONS) {
      head(s.id, s.name);
      grid(s.items);
    }
  }
  return { rows, cells, rowStart, offsets, total: y, catOffset };
}

export function EmojiPicker({
  onSelect,
  skinTone,
  defaultSkinTone,
  onSkinToneChange,
  storageKey = "arc-emoji-picker",
  recentLimit = 27,
  defaultRecent = DEFAULT_RECENT,
  columns,
  autoFocus = false,
  searchPlaceholder = "Search emoji",
  label = "Emoji picker",
  className,
  style,
  ...rest
}: EmojiPickerProps) {
  const reduced = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const toneRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const toneBtnRef = useRef<HTMLButtonElement>(null);
  const catRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // ----- recently used + skin tone (localStorage, memory fallback) -----
  const [stored] = useState<StoredState | null>(() => (storageKey ? loadState(storageKey) : null));
  const [picks, setPicks] = useState<string[]>(stored?.recents ?? []);
  const [tone, setTone] = useState<SkinTone>((stored?.tone ?? defaultSkinTone ?? 0) as SkinTone);
  useEffect(() => {
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ recents: picks, tone }));
    } catch {
      /* blocked storage: state already lives in memory */
    }
  }, [picks, tone, storageKey]);

  const effectiveTone: SkinTone = skinTone !== undefined ? skinTone : tone;
  const changeTone = useCallback(
    (t: SkinTone) => {
      if (skinTone === undefined) setTone(t);
      onSkinToneChange?.(t);
    },
    [skinTone, onSkinToneChange],
  );

  const hasRecent = picks.length > 0;
  const recentKey = (hasRecent ? picks : defaultRecent).join("\u0000");
  const recentEntries = useMemo(
    () =>
      recentKey.split("\u0000").map(base => BY_BASE.get(base) ?? { base, name: base, keywords: "", tonePositions: 0, lower: base.toLowerCase() }),
    [recentKey],
  );

  // ----- columns from measured width -----
  const [width, setWidth] = useState(352);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(Math.max(e.contentRect.width, 0));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const cols = columns ?? Math.max(6, Math.floor((width - PAD_X * 2) / CELL));

  // ----- rows & virtualization -----
  const [query, setQuery] = useState("");
  const layout = useMemo(() => buildLayout(query, recentEntries, hasRecent, cols), [query, recentEntries, hasRecent, cols]);
  const { rows, cells, rowStart, offsets, total, catOffset } = layout;

  const rowOfCell = useMemo(() => {
    const m: number[] = new Array<number>(cells.length).fill(-1);
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.kind !== "grid") continue;
      const start = rowStart[r] ?? 0;
      for (let i = 0; i < row.cells.length; i++) m[start + i] = r;
    }
    return m;
  }, [rows, rowStart, cells.length]);

  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    setActiveIdx(0);
  }, [query, cols]);
  const clampIdx = useCallback((i: number) => Math.min(Math.max(i, 0), Math.max(cells.length - 1, 0)), [cells.length]);

  const [hover, setHover] = useState<number | null>(null);
  const [gridFocused, setGridFocused] = useState(false);
  const shown = hover !== null ? hover : query.trim() || gridFocused ? activeIdx : -1;

  const [scrollTop, setScrollTop] = useState(0);
  const [viewH, setViewH] = useState(260);
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setViewH(el.clientHeight);
    const ro = new ResizeObserver(() => setViewH(scrollRef.current?.clientHeight ?? 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ----- category <-> scroll sync -----
  const [activeCat, setActiveCat] = useState("popular");
  const jumpLock = useRef<{ id: string; top: number } | null>(null);
  const ticking = useRef(false);
  const syncCat = useCallback(
    (top: number) => {
      // While a tab press scrolls the list, hold the indicator on the target instead of stepping through the sections in between.
      if (jumpLock.current) {
        if (Math.abs(top - jumpLock.current.top) < 3) jumpLock.current = null;
        return;
      }
      let current = "popular";
      catOffset.forEach((off, id) => {
        if (off <= top + 8) current = id;
      });
      setActiveCat(c => (c === current ? c : current));
    },
    [catOffset],
  );

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el || ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      ticking.current = false;
      const top = el.scrollTop;
      setScrollTop(top);
      syncCat(top);
    });
  };

  const jumpTo = useCallback(
    (id: string) => {
      const top = catOffset.get(id) ?? 0;
      jumpLock.current = { id, top };
      setActiveCat(id);
      scrollRef.current?.scrollTo({ top: Math.max(top - 2, 0), behavior: reduced ? "auto" : "smooth" });
    },
    [catOffset, reduced],
  );

  // ----- keyboard navigation -----
  const keepRowInView = useCallback(
    (r: number) => {
      const el = scrollRef.current;
      const top = offsets[r];
      if (!el || top === undefined) return;
      const bot = top + ROW_H;
      if (top < el.scrollTop) el.scrollTop = Math.max(top - 8, 0);
      else if (bot > el.scrollTop + el.clientHeight) el.scrollTop = bot - el.clientHeight + 8;
    },
    [offsets],
  );

  const pick = useCallback(
    (idx: number, event: MouseEvent | KeyboardEvent) => {
      const cell = cells[idx];
      if (!cell) return;
      const t: SkinTone = cell.tonePositions > 0 ? effectiveTone : 0;
      onSelect?.({ emoji: applyTone(cell.base, t), base: cell.base, name: cell.name, skinTone: t }, event);
      setPicks(p => [cell.base, ...p.filter(x => x !== cell.base)].slice(0, recentLimit));
    },
    [cells, effectiveTone, onSelect, recentLimit],
  );

  const navigate = useCallback(
    (dr: number, dc: number) => {
      if (!cells.length) return;
      const i = clampIdx(activeIdx);
      const r0 = rowOfCell[i];
      if (r0 === undefined || r0 < 0) return;
      const local = i - (rowStart[r0] ?? i);
      let tr = r0 + dr;
      const tl = local + dc;
      if (dr !== 0) while (tr >= 0 && tr < rows.length && rows[tr]?.kind !== "grid") tr += dr;
      if (tr < 0 || tr >= rows.length) return;
      const row = rows[tr];
      const len = row?.kind === "grid" ? row.cells.length : 1;
      const next = (rowStart[tr] ?? i) + Math.min(Math.max(tl, 0), len - 1);
      setActiveIdx(next);
      keepRowInView(tr);
    },
    [cells.length, activeIdx, rowOfCell, rowStart, rows, clampIdx, keepRowInView],
  );

  const pageMove = useCallback(
    (dir: number) => {
      navigate(dir * Math.max(1, Math.ceil(viewH / ROW_H)), 0);
    },
    [viewH, navigate],
  );

  const lineEnd = useCallback(
    (event: { ctrlKey: boolean; metaKey: boolean }, dir: number) => {
      if (!cells.length) return;
      const i = clampIdx(activeIdx);
      let next: number;
      if (event.ctrlKey || event.metaKey) {
        next = dir > 0 ? cells.length - 1 : 0;
      } else {
        const r = rowOfCell[i];
        if (r === undefined || r < 0) return;
        const row = rows[r];
        const len = row?.kind === "grid" ? row.cells.length : 1;
        next = (rowStart[r] ?? i) + (dir > 0 ? len - 1 : 0);
      }
      setActiveIdx(next);
      const rr = rowOfCell[next];
      if (rr !== undefined && rr >= 0) keepRowInView(rr);
    },
    [cells.length, activeIdx, rowOfCell, rowStart, rows, clampIdx, keepRowInView],
  );

  const onGridKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        navigate(1, 0);
        break;
      case "ArrowUp":
        e.preventDefault();
        // Up from the first row returns to the search field.
        if (clampIdx(activeIdx) === 0) searchRef.current?.focus();
        else navigate(-1, 0);
        break;
      case "ArrowRight":
        e.preventDefault();
        navigate(0, 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        navigate(0, -1);
        break;
      case "PageUp":
        e.preventDefault();
        pageMove(-1);
        break;
      case "PageDown":
        e.preventDefault();
        pageMove(1);
        break;
      case "Home":
        e.preventDefault();
        lineEnd(e, -1);
        break;
      case "End":
        e.preventDefault();
        lineEnd(e, 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        pick(clampIdx(activeIdx), e.nativeEvent);
        break;
      default:
        // Typing while the grid has focus goes to the search field.
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          setQuery(q => q + e.key);
          searchRef.current?.focus();
        }
    }
  };

  const onSearchKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      pick(shown >= 0 ? shown : clampIdx(activeIdx), e.nativeEvent);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cells.length) scrollRef.current?.focus();
    }
  };

  // Escape cascade: close the tone menu, then clear the search, then let the surrounding popover close.
  // Capture phase + stopPropagation keeps the first Escape from closing the popover by accident.
  const [toneOpen, setToneOpen] = useState(false);
  const toneOpenRef = useRef(false);
  toneOpenRef.current = toneOpen;
  const queryRef = useRef(query);
  queryRef.current = query;
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (toneOpenRef.current) {
        event.stopPropagation();
        setToneOpen(false);
        // O radiogroup é desmontado no fechamento; devolve o foco ao botão que o abria.
        requestAnimationFrame(() => toneBtnRef.current?.focus());
      } else if (queryRef.current) {
        event.stopPropagation();
        setQuery("");
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs mirror the state; the listener itself never changes
  }, [toneOpen]);

  useEffect(() => {
    if (autoFocus) searchRef.current?.focus();
  }, [autoFocus]);

  // ----- category bar -----
  const browse = query.trim() === "";
  const categories = useMemo(
    () => [{ id: "popular", name: hasRecent ? "Recently used" : "Popular" }, ...EMOJI_SECTIONS.map(s => ({ id: s.id, name: s.name }))],
    [hasRecent],
  );
  const [catFocus, setCatFocus] = useState(0);
  const focusCat = (i: number) => {
    const n = (i + categories.length) % categories.length;
    setCatFocus(n);
    catRefs.current[n]?.focus();
  };
  const onCatsKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusCat(catFocus + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusCat(catFocus - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusCat(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusCat(categories.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const id = categories[catFocus]?.id;
      if (id) jumpTo(id);
    }
  };

  const IND_W = 16;
  const [indX, setIndX] = useState(0);
  useLayoutEffect(() => {
    if (!browse) return;
    const idx = Math.max(0, categories.findIndex(c => c.id === activeCat));
    const el = catRefs.current[idx];
    if (el) setIndX(el.offsetLeft + el.offsetWidth / 2 - IND_W / 2);
  }, [browse, activeCat, categories]);

  // ----- tone menu -----
  const focusTone = (i: number) => {
    changeTone(i as SkinTone);
    toneRefs.current[i]?.focus();
  };
  const onToneKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusTone((effectiveTone + 1) % 6);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusTone((effectiveTone + 5) % 6);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusTone(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusTone(5);
    }
  };

  // ----- visible window -----
  const overPx = OVERSCAN_ROWS * ROW_H;
  let visFirst = 0;
  while (visFirst < rows.length - 1 && (offsets[visFirst + 1] ?? Infinity) <= scrollTop - overPx) visFirst++;
  let visLast = rows.length - 1;
  while (visLast > 0 && (offsets[visLast - 1] ?? -Infinity) > scrollTop + viewH + overPx) visLast--;
  if (shown >= 0) {
    const r = rowOfCell[shown];
    if (r !== undefined && r >= 0) {
      visFirst = Math.min(visFirst, r);
      visLast = Math.max(visLast, r);
    }
  }

  const qTrimmed = query.trim();
  const resultMsg = qTrimmed ? `${cells.length} ${cells.length === 1 ? "result" : "results"}` : "";
  const shownCell = shown >= 0 ? cells[shown] : undefined;

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} style={style} role="group" aria-label={label} {...rest}>
      {/* A linha de busca e o seletor de tom compartilham o mesmo slot: abrir o tom troca a busca pelas seis mãos, como no original. */}
      <div className={styles.searchRow}>
        {toneOpen ? (
          <motion.div
            key="tones"
            id={`${uid}-tones`}
            className={styles.tones}
            role="radiogroup"
            aria-label="Skin tone"
            onKeyDown={onToneKey}
            initial={reduced ? false : { clipPath: "inset(0 100% 0 0 round 10px)" }}
            animate={{ clipPath: "inset(0 0 0 0 round 10px)" }}
            transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.standard, ease: motionTokens.ease.standard }}
          >
            {TONE_NAMES.map((name, i) => (
              <button
                key={name}
                ref={el => {
                  toneRefs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={effectiveTone === i}
                tabIndex={effectiveTone === i ? 0 : -1}
                className={effectiveTone === i ? `${styles.toneOpt} ${styles.toneOn}` : styles.toneOpt}
                onClick={() => changeTone(i as SkinTone)}
              >
                <span aria-hidden="true">{applyTone(TONE_HAND, i as SkinTone)}</span>
                <span className={styles.srOnly}>{name}</span>
              </button>
            ))}
          </motion.div>
        ) : (
          <div key="search" className={styles.searchWrap}>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                autoComplete="off"
                spellCheck={false}
                className={styles.searchInput}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                aria-activedescendant={shown >= 0 ? `${uid}-c${shown}` : undefined}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onSearchKey}
              />
            </div>
            {qTrimmed && (
              <button
                type="button"
                className={styles.clear}
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}
        {!toneOpen && (
          <button
            ref={toneBtnRef}
            type="button"
            className={styles.toneBtn}
            aria-expanded={false}
            aria-controls={`${uid}-tones`}
            aria-label={`Skin tone: ${TONE_NAMES[effectiveTone]}`}
            onClick={() => {
              setToneOpen(true);
              requestAnimationFrame(() => toneRefs.current[effectiveTone]?.focus());
            }}
          >
            <span aria-hidden="true">{applyTone(TONE_HAND, effectiveTone)}</span>
          </button>
        )}
      </div>

      {browse && (
        <div className={styles.cats} role="toolbar" aria-label="Emoji categories" tabIndex={0} onKeyDown={onCatsKey}>
          {categories.map((c, i) => {
            const Icon = CATEGORY_ICONS[c.id] ?? Smile;
            return (
              <button
                key={c.id}
                ref={el => {
                  catRefs.current[i] = el;
                }}
                type="button"
                tabIndex={-1}
                title={c.name}
                aria-label={c.name}
                aria-current={activeCat === c.id ? "true" : undefined}
                className={styles.cat}
                onClick={() => jumpTo(c.id)}
              >
                <Icon size={17} aria-hidden="true" />
              </button>
            );
          })}
          <motion.div
            aria-hidden="true"
            className={styles.catInd}
            initial={false}
            animate={{ x: indX }}
            transition={reduced ? { duration: 0 } : { ...motionTokens.spring.morph }}
          />
        </div>
      )}

      <div
        id={`${uid}-grid`}
        ref={scrollRef}
        role="grid"
        aria-label={label}
        aria-rowcount={rows.length}
        aria-activedescendant={shown >= 0 ? `${uid}-c${shown}` : undefined}
        tabIndex={0}
        className={styles.scroll}
        onScroll={onScroll}
        onKeyDown={onGridKey}
        onFocus={() => setGridFocused(true)}
        onBlur={() => setGridFocused(false)}
        onMouseLeave={() => setHover(null)}
        style={{ "--cols": cols } as CSSProperties}
      >
        <div className={styles.inner} style={{ height: total }}>
          {rows.slice(visFirst, visLast + 1).map((row, k) => {
            const gi = visFirst + k;
            const top = offsets[gi] ?? 0;
            if (row.kind === "head") {
              return (
                <div key={`h-${row.id}`} role="row" aria-rowindex={gi + 1} className={styles.headRow} style={{ top }}>
                  <span role="columnheader" className={styles.head}>
                    {row.label}
                  </span>
                </div>
              );
            }
            return (
              <div key={`g-${gi}`} role="row" aria-rowindex={gi + 1} className={styles.gridRow} style={{ top }}>
                {row.cells.map((c, ci) => {
                  const idx = (rowStart[gi] ?? 0) + ci;
                  const glyph = c.tonePositions > 0 ? applyTone(c.base, effectiveTone) : c.base;
                  return (
                    <button
                      key={idx}
                      id={`${uid}-c${idx}`}
                      type="button"
                      role="gridcell"
                      tabIndex={-1}
                      aria-label={c.name}
                      className={idx === shown ? `${styles.cell} ${styles.cellOn}` : styles.cell}
                      onMouseEnter={() => setHover(idx)}
                      onClick={e => pick(idx, e.nativeEvent)}
                    >
                      <span aria-hidden="true">{glyph}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
          {qTrimmed && cells.length === 0 && <div className={styles.empty}>No results for “{qTrimmed}”</div>}
        </div>
      </div>

      <div className={styles.footer}>
        {/* A linha de prévia repete o nome do emoji ativo; fica fora do leitor de tela (o aria-activedescendant já anuncia). */}
        <div className={styles.preview} aria-hidden="true">
          {shownCell ? (
            <motion.span
              key={`${shownCell.base}-${effectiveTone}`}
              className={styles.previewEmoji}
              initial={reduced ? false : { scale: 1.18 }}
              animate={{ scale: 1 }}
              transition={{ ...motionTokens.spring.snappy }}
            >
              {shownCell.tonePositions > 0 ? applyTone(shownCell.base, effectiveTone) : shownCell.base}
            </motion.span>
          ) : (
            <span className={styles.previewIdle}>{TONE_HAND}</span>
          )}
          <span className={styles.previewName}>{shownCell ? shownCell.name : "Pick an emoji"}</span>
        </div>
      </div>

      <div className={styles.srOnly} aria-live="polite">
        {resultMsg}
      </div>
    </div>
  );
}

export default EmojiPicker;
