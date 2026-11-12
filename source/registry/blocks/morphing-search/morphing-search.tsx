"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { CornerDownLeft, FileText, Search, SearchX, User, X, Zap } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./morphing-search.module.css";

export interface SearchItem {
  /** Unique id. */
  id: string;
  /** Main line. This is what the query is matched against. */
  title: string;
  /** Second line: where the item lives or what it does. */
  subtitle?: string;
  /** Heading the item is listed under. */
  group: string;
  /** Icon shown before the title. Defaults to one that fits the sample groups. */
  icon?: ReactNode;
  /** Extra words that should match the item. Only the title and these words are searched. */
  keywords?: string;
}

export interface MorphingSearchProps {
  /** Everything that can be found. Defaults to sample pages, people and actions. */
  items?: SearchItem[];
  /** Whether the icon has grown into the field. Pass it with `onOpenChange` to control it. */
  open?: boolean;
  /** Whether the search starts open when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the search opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Text in the field. Pass it with `onQueryChange` to control it. */
  query?: string;
  /** Starting text when uncontrolled. */
  defaultQuery?: string;
  /** Called with the text of the field whenever it changes. */
  onQueryChange?: (query: string) => void;
  /** Called with the chosen result. The search closes afterwards. */
  onSelect?: (item: SearchItem) => void;
  /** Hint shown in the empty field. */
  placeholder?: string;
  /** Width of the open field in px. It never grows past the space the component is given. */
  width?: number;
  /** Edge the field grows from: `end` keeps the icon's right edge in place, `start` its left edge. */
  align?: "start" | "end";
  /** Key that opens the search from anywhere on the page. Pass an empty string to turn it off. */
  shortcut?: string;
  /** Most results listed at once. */
  limit?: number;
  /** Extra class for the anchor box. */
  className?: string;
}

export const sampleSearchItems: SearchItem[] = [
  { id: "invoices", group: "Pages", title: "Invoices", subtitle: "Billing", keywords: "payments bills" },
  { id: "billing", group: "Pages", title: "Billing settings", subtitle: "Settings", keywords: "plan card payment" },
  { id: "members", group: "Pages", title: "Team members", subtitle: "Settings", keywords: "people users seats" },
  { id: "api", group: "Pages", title: "API keys", subtitle: "Developers", keywords: "tokens secret" },
  { id: "emma", group: "People", title: "Emma Collins", subtitle: "Product designer" },
  { id: "daniel", group: "People", title: "Daniel Kim", subtitle: "Backend engineer" },
  { id: "sofia", group: "People", title: "Sofia Ramirez", subtitle: "Operations lead" },
  { id: "new-invoice", group: "Actions", title: "Create invoice", subtitle: "Starts a draft", keywords: "new bill" },
  { id: "invite", group: "Actions", title: "Invite a teammate", subtitle: "Sends an email invitation", keywords: "add member people" },
  { id: "export", group: "Actions", title: "Export customers", subtitle: "Downloads a CSV file", keywords: "download" },
];

const CLOSED = 44;
const groupIcon = (group: string) => (group === "People" ? <User size={15} /> : group === "Actions" ? <Zap size={15} /> : <FileText size={15} />);

function Marked({ text, query }: { text: string; query: string }) {
  const word = query.trim().split(/\s+/)[0] ?? "";
  const at = word ? text.toLowerCase().indexOf(word.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<mark className={styles.hit}>{text.slice(at, at + word.length)}</mark>{text.slice(at + word.length)}</>;
}

/** A search icon that stretches into a field and then lets a results panel grow out of it; Escape walks the same steps back. */
export function MorphingSearch({ items = sampleSearchItems, open, defaultOpen = false, onOpenChange, query, defaultQuery = "", onQueryChange, onSelect, placeholder = "Search pages, people, actions", width = 440, align = "end", shortcut = "/", limit = 6, className }: MorphingSearchProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const [openInternal, setOpenInternal] = useState(defaultOpen);
  const [queryInternal, setQueryInternal] = useState(defaultQuery);
  const [active, setActive] = useState(0);
  const [space, setSpace] = useState(width);
  const [panelHeight, setPanelHeight] = useState(0);
  const anchor = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const isOpen = open ?? openInternal;
  const text = query ?? queryInternal;

  const setOpen = (next: boolean) => { if (open === undefined) setOpenInternal(next); onOpenChange?.(next); };
  const setQuery = (next: string) => { if (query === undefined) setQueryInternal(next); onQueryChange?.(next); setActive(0); };
  const close = (refocus: boolean) => { setOpen(false); setQuery(""); if (refocus) trigger.current?.focus(); };

  const results = useMemo(() => {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return items.slice(0, limit);
    const first = words[0] ?? "";
    return items
      .filter(item => { const hay = `${item.title} ${item.keywords ?? ""}`.toLowerCase(); return words.every(word => hay.includes(word)); })
      .sort((a, b) => Number(b.title.toLowerCase().startsWith(first)) - Number(a.title.toLowerCase().startsWith(first)))
      .slice(0, limit);
  }, [items, text, limit]);
  // Results stay grouped under their headings, in the order the groups first appear.
  const groups = useMemo(() => [...new Set(results.map(item => item.group))].map(group => ({ group, items: results.filter(item => item.group === group) })), [results]);
  const flat = groups.flatMap(entry => entry.items);
  const current = flat[Math.min(active, flat.length - 1)];

  // Both measurements run after mount on purpose: motion ignores a target that changes before it has mounted.
  useEffect(() => {
    const node = anchor.current;
    if (!node) return;
    const measure = () => setSpace(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = panel.current;
    if (!node) return;
    const measure = () => setPanelHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { if (isOpen) input.current?.focus({ preventScroll: true }); }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => { if (event.target instanceof Node && !shell.current?.contains(event.target)) { setOpen(false); setQuery(""); } };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the listener only needs to follow `isOpen`
  }, [isOpen]);
  useEffect(() => {
    if (!shortcut || isOpen) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target;
      if (event.key !== shortcut || event.metaKey || event.ctrlKey || event.altKey) return;
      if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      event.preventDefault();
      setOpen(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the listener only needs to follow `isOpen` and the key
  }, [shortcut, isOpen]);

  const choose = (item: SearchItem) => { onSelect?.(item); close(true); };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (flat.length) setActive(index => (Math.min(index, flat.length - 1) + (event.key === "ArrowDown" ? 1 : flat.length - 1)) % flat.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (current) choose(current);
    } else if (event.key === "Escape") {
      event.preventDefault();
      // Escape steps back one stage at a time: first the text, then the field.
      if (text) setQuery(""); else close(true);
    } else if (event.key === "Tab") { setOpen(false); setQuery(""); }
  };

  const openWidth = Math.max(CLOSED, Math.min(width, space));
  const morph = reduceMotion ? { duration: 0 } : motionTokens.spring.morph;

  return (
    <div ref={anchor} className={[styles.anchor, className].filter(Boolean).join(" ")} data-align={align}>
      <motion.div
        ref={shell}
        className={styles.shell}
        data-open={isOpen}
        initial={false}
        animate={{ width: isOpen ? openWidth : CLOSED }}
        // Opening: the field stretches first and the panel follows. Closing: the panel folds, then the field shrinks.
        transition={reduceMotion ? { duration: 0 } : { ...motionTokens.spring.morph, delay: isOpen ? 0 : 0.1 }}
      >
        <div className={styles.bar} role="search">
          <button ref={trigger} type="button" className={styles.trigger} aria-label={shortcut ? `Search (press ${shortcut})` : "Search"} aria-expanded={isOpen} tabIndex={isOpen ? -1 : 0} onClick={() => (isOpen ? input.current?.focus() : setOpen(true))}>
            <Search size={18} aria-hidden="true" />
          </button>
          <input
            ref={input}
            className={styles.input}
            type="text"
            role="combobox"
            aria-label="Search"
            aria-expanded={isOpen}
            aria-controls={`${uid}-list`}
            aria-activedescendant={isOpen && current ? `${uid}-${current.id}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            value={text}
            tabIndex={isOpen ? 0 : -1}
            disabled={!isOpen}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <AnimatePresence initial={false}>
            {isOpen ? (
              <motion.button key="close" type="button" className={styles.close} aria-label={text ? "Clear search" : "Close search"} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: -90 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.5, transition: { duration: motionTokens.duration.instant } }} transition={reduceMotion ? { duration: 0 } : { ...motionTokens.spring.snappy, delay: 0.12 }} onClick={() => { if (text) { setQuery(""); input.current?.focus(); } else close(true); }}>
                <X size={15} aria-hidden="true" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>

        <motion.div className={styles.drop} initial={false} animate={{ height: isOpen ? panelHeight : 0, opacity: isOpen ? 1 : 0 }} transition={reduceMotion ? { duration: 0 } : isOpen ? { height: { ...motionTokens.spring.smooth, delay: panelHeight && text ? 0 : 0.16 }, opacity: { duration: motionTokens.duration.standard, delay: text ? 0 : 0.16 } } : { duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }} inert={!isOpen}>
          <div ref={panel} className={styles.panel} style={{ width: openWidth - 2 }}>
            <div id={`${uid}-list`} role="listbox" aria-label="Results" className={styles.list}>
              <LayoutGroup id={uid}>
                {groups.map(entry => (
                  <div key={entry.group} role="group" aria-labelledby={`${uid}-group-${entry.group}`} className={styles.group}>
                    <p id={`${uid}-group-${entry.group}`} className={styles.heading}>{text ? entry.group : `Suggested ${entry.group.toLowerCase()}`}</p>
                    <AnimatePresence initial={false} mode="popLayout">
                      {entry.items.map(item => {
                        const on = current?.id === item.id;
                        return (
                          <motion.div
                            key={item.id}
                            layout={reduceMotion ? false : "position"}
                            id={`${uid}-${item.id}`}
                            role="option"
                            aria-selected={on}
                            className={styles.option}
                            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant } }}
                            transition={morph}
                            onPointerMove={() => { const index = flat.indexOf(item); if (index !== active) setActive(index); }}
                            onPointerDown={event => event.preventDefault()}
                            onClick={() => choose(item)}
                          >
                            {on ? <motion.span layoutId="active" className={styles.glow} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.responsive} /> : null}
                            <span className={styles.icon} aria-hidden="true">{item.icon ?? groupIcon(item.group)}</span>
                            <span className={styles.text}><span className={styles.title}><Marked text={item.title} query={text} /></span>{item.subtitle ? <span className={styles.subtitle}>{item.subtitle}</span> : null}</span>
                            <span className={styles.enter} aria-hidden="true"><CornerDownLeft size={13} /></span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ))}
              </LayoutGroup>
            </div>
            {flat.length === 0 ? (
              <p className={styles.empty} role="status"><SearchX size={18} aria-hidden="true" /><span>No results for “{text.trim()}”. Try a page name or a person.</span></p>
            ) : (
              <p className={styles.keys} aria-hidden="true"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>↵</kbd> open <kbd>esc</kbd> {text ? "clear" : "close"}</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

const INVOICES = [
  { id: "INV-2041", customer: "Northwind Labs", amount: "$1,280.00", state: "Paid" },
  { id: "INV-2040", customer: "Juniper & Vale", amount: "$640.00", state: "Due Friday" },
  { id: "INV-2039", customer: "Harbor City FC", amount: "$2,150.00", state: "Paid" },
  { id: "INV-2038", customer: "Stonebridge Studio", amount: "$310.00", state: "Draft" },
  { id: "INV-2037", customer: "Alder & Finch", amount: "$940.00", state: "Paid" },
  { id: "INV-2036", customer: "Kite Supply Co.", amount: "$1,725.00", state: "Due Monday" },
];

/** Ready preview: the search living at the end of an app toolbar, above a page it can cover. */
export function MorphingSearchPreview() {
  const [opened, setOpened] = useState<SearchItem | null>(null);
  return (
    <section className={styles.preview} aria-label="Morphing search">
      <div className={styles.app}>
        <header className={styles.toolbar}>
          <span className={styles.brand}><span className={styles.logo} aria-hidden="true" />Ledgerly</span>
          <nav className={styles.nav} aria-label="Sections"><span data-current="true">Invoices</span><span>Customers</span><span>Reports</span></nav>
          <div className={styles.slot}><MorphingSearch onSelect={setOpened} /></div>
        </header>
        <div className={styles.page}>
          <p className={styles.pageTitle}>Invoices</p>
          <p className={styles.note} role="status">{opened ? <>Last opened from search: <strong>{opened.title}</strong></> : <>Click the search icon or press <kbd>/</kbd>, then type “in” or “team”.</>}</p>
          <ul className={styles.table}>
            {INVOICES.map(row => <li key={row.id}><span>{row.id}</span><span>{row.customer}</span><span>{row.state}</span><span>{row.amount}</span></li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default MorphingSearchPreview;
