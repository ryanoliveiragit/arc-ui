"use client";

import { useId, useState } from "react";
import type { FormEvent, MouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { AnimatePresence, motion, useAnimationControls, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { MotionValue, Transition } from "motion/react";
import { Activity, ArrowLeft, ArrowUpRight, BookOpen, CreditCard, LifeBuoy, Search } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./not-found.module.css";

export interface NotFoundLink {
  /** Link text. */
  label: string;
  /** Where the link goes. */
  href: string;
  /** One short line under the label. */
  description?: string;
  /** Icon in the link's tile. */
  icon?: ReactNode;
  /** Extra words the search should match, separated by spaces. */
  keywords?: string;
}

export interface NotFoundProps {
  /** Small label above the title. */
  eyebrow?: string;
  /** Main heading. */
  title?: string;
  /** Text under the heading. */
  description?: string;
  /** Pages offered as a way back. The search field filters them as you type. */
  links?: NotFoundLink[];
  /** Target of the main button. */
  homeHref?: string;
  /** Text of the main button. */
  homeLabel?: string;
  /** Placeholder of the search field. */
  searchPlaceholder?: string;
  /** Called with the trimmed query when the search form is submitted. */
  onSearch?: (query: string) => void;
  /** Called when a link or the main button is used. Call `event.preventDefault()` to route on the client. */
  onNavigate?: (link: NotFoundLink, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Extra class for the section. */
  className?: string;
}

const defaultLinks: NotFoundLink[] = [
  { label: "Documentation", href: "/docs", description: "Guides and API reference", icon: <BookOpen size={18} />, keywords: "docs guide api help" },
  { label: "Pricing", href: "/pricing", description: "Plans for teams of any size", icon: <CreditCard size={18} />, keywords: "plans billing cost" },
  { label: "Support", href: "/support", description: "Talk to a person", icon: <LifeBuoy size={18} />, keywords: "help contact chat" },
  { label: "System status", href: "/status", description: "Uptime and incidents", icon: <Activity size={18} />, keywords: "uptime outage incident" },
];
const ease = [...motionTokens.ease.enter] as [number, number, number, number];
const still: Transition = { duration: 0 };
/** Pieces of the picture land one after another with a small bounce. */
const land = (index: number, reduce: boolean): Transition => (reduce ? still : { type: "spring", visualDuration: .5, bounce: .32, delay: .08 + index * .09, opacity: { duration: motionTokens.duration.standard, delay: .08 + index * .09 } });
const FOUR = "M66 6 L14 86 L98 86 M70 50 L70 132";

/** Moves its children a little with the pointer; deeper layers move more, which reads as depth. */
function Layer({ x, y, depth, children }: { x: MotionValue<number>; y: MotionValue<number>; depth: number; children: ReactNode }) {
  const dx = useTransform(x, value => value * depth);
  const dy = useTransform(y, value => value * depth);
  return <motion.g style={{ x: dx, y: dy }}>{children}</motion.g>;
}

/**
 * A 404 page that is pleasant to land on. The picture is built from plain shapes: two fours and a round zero with eyes
 * that follow the pointer, blink, and hop when poked, while small shapes drift around with depth. Below it, a search
 * field filters the suggested pages as you type.
 */
export function NotFound({ eyebrow = "Error 404", title = "This page wandered off", description = "The link may be old, or the page may have moved. Search for it, or start again from one of these.", links = defaultLinks, homeHref = "/", homeLabel = "Back to home", searchPlaceholder = "Search pages", onSearch, onNavigate, className }: NotFoundProps) {
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const [query, setQuery] = useState("");
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 140, damping: 18 });
  const y = useSpring(pointerY, { stiffness: 140, damping: 18 });
  const eyeX = useTransform(x, value => value * 6);
  const eyeY = useTransform(y, value => value * 5);
  const hop = useAnimationControls();

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set(Math.min(Math.max(((event.clientX - box.left) / box.width - .5) * 2, -1), 1));
    pointerY.set(Math.min(Math.max(((event.clientY - box.top) / Math.max(box.height, 1) - .35) * 2, -1), 1));
  };
  const onPointerLeave = () => { pointerX.set(0); pointerY.set(0); };
  const poke = () => { if (!reduce) void hop.start({ y: [0, -30, 0], rotate: [0, -8, 6, 0], transition: { duration: .62, ease: motionTokens.ease.standard, times: [0, .42, 1] } }); };

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = words.length ? links.filter(link => { const text = `${link.label} ${link.description ?? ""} ${link.keywords ?? ""}`.toLowerCase(); return words.every(word => text.includes(word)); }) : links;
  const submit = (event: FormEvent) => { event.preventDefault(); if (query.trim()) onSearch?.(query.trim()); };

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} aria-labelledby={`${uid}-title`} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <svg className={styles.art} viewBox="0 0 420 190" role="img" aria-label="The number 404; the zero is a round face looking around.">
        <Layer x={x} y={y} depth={-5}>
          <motion.g initial={{ opacity: 0, scale: reduce ? 1 : .4 }} animate={{ opacity: 1, scale: 1 }} transition={land(5, reduce)}>
            <g className={styles.drift}><path className={styles.triangle} d="M262 8 L276 32 L248 32 Z" /></g>
            <g className={styles.spin}><rect className={styles.square} x="384" y="140" width="18" height="18" rx="3" /></g>
            <g className={styles.driftSlow}><circle className={styles.dot} cx="150" cy="158" r="7" /></g>
            <g className={styles.spinSlow}><path className={styles.plus} d="M20 30 h20 M30 20 v20" /></g>
            <g className={styles.drift}><circle className={styles.ring} cx="342" cy="16" r="7" /></g>
          </motion.g>
        </Layer>
        <motion.ellipse className={styles.shadow} cx="210" cy="181" rx="44" ry="5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={reduce ? still : { duration: motionTokens.duration.considered, delay: .5 }} />
        <Layer x={x} y={y} depth={4}>
          <motion.g initial={{ opacity: 0, y: reduce ? 0 : -46 }} animate={{ opacity: 1, y: 0 }} transition={land(0, reduce)}>
            <path className={styles.four} d={FOUR} transform="translate(22 26)" />
          </motion.g>
        </Layer>
        <Layer x={x} y={y} depth={4}>
          <motion.g initial={{ opacity: 0, y: reduce ? 0 : -46 }} animate={{ opacity: 1, y: 0 }} transition={land(2, reduce)}>
            {/* The second four hangs a little crooked and swings from its top. */}
            <g className={styles.swing}><path className={styles.four} d={FOUR} transform="translate(288 26)" /></g>
          </motion.g>
        </Layer>
        <Layer x={x} y={y} depth={9}>
          <motion.g initial={{ opacity: 0, y: reduce ? 0 : -60 }} animate={{ opacity: 1, y: 0 }} transition={land(1, reduce)}>
            <g className={styles.float}>
              <motion.g className={styles.zero} animate={hop} onClick={poke}>
                <circle className={styles.face} cx="210" cy="96" r="62" />
                <motion.g style={{ x: eyeX, y: eyeY }}>
                  <g className={styles.blink}>
                    <ellipse className={styles.eye} cx="189" cy="88" rx="7.5" ry="9.5" />
                    <ellipse className={styles.eye} cx="231" cy="88" rx="7.5" ry="9.5" />
                  </g>
                  <path className={styles.mouth} d="M199 118 Q210 111 221 118" />
                </motion.g>
              </motion.g>
            </g>
          </motion.g>
        </Layer>
      </svg>

      <div className={styles.copy}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 id={`${uid}-title`} className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>

      <form className={styles.search} role="search" onSubmit={submit}>
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
        <input className={styles.input} type="search" value={query} placeholder={searchPlaceholder} aria-label={searchPlaceholder} aria-controls={`${uid}-links`} autoComplete="off" onChange={event => setQuery(event.target.value)} />
        <button type="submit" className={styles.go} disabled={!query.trim()}>Search</button>
      </form>

      <nav className={styles.nav} aria-label="Suggested pages">
        <p className={styles.navTitle} aria-live="polite">{words.length ? (matches.length ? `${matches.length} of ${links.length} pages match` : `Nothing matches “${query.trim()}”. Try the home page.`) : "Popular pages"}</p>
        <ul id={`${uid}-links`} className={styles.links}>
          <AnimatePresence initial={false} mode="popLayout">
            {matches.map((link, index) => (
              <motion.li key={link.href} layout initial={{ opacity: 0, scale: reduce ? 1 : .94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduce ? 1 : .94, transition: { duration: reduce ? 0 : motionTokens.duration.instant } }} transition={reduce ? still : { ...motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease, delay: index * motionTokens.stagger.item } }}>
                <a className={styles.link} href={link.href} onClick={event => onNavigate?.(link, event)}>
                  {link.icon ? <span className={styles.linkIcon} aria-hidden="true">{link.icon}</span> : null}
                  <span className={styles.linkText}><span className={styles.linkLabel}>{link.label}</span>{link.description ? <span className={styles.linkNote}>{link.description}</span> : null}</span>
                  <ArrowUpRight size={16} className={styles.linkArrow} aria-hidden="true" />
                </a>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </nav>

      <a className={styles.home} href={homeHref} onClick={event => onNavigate?.({ label: homeLabel, href: homeHref }, event)}>
        <ArrowLeft size={16} aria-hidden="true" />
        {homeLabel}
      </a>
    </section>
  );
}

/** Ready preview. Links stay on the page and report what they would open. */
export default function NotFoundPreview() {
  const [note, setNote] = useState("");
  return (
    <div className={styles.preview}>
      <NotFound onSearch={query => setNote(`A real site would now search for “${query}”.`)} onNavigate={(link, event) => { event.preventDefault(); setNote(`A real site would now open ${link.label} (${link.href}).`); }} />
      <p className={styles.previewNote} aria-live="polite">{note}</p>
    </div>
  );
}
