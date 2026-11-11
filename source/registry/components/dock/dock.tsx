"use client";

import { Fragment, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./dock.module.css";

export interface DockItem {
  /** Unique id, reported by `onValueChange` when the item is pressed. */
  id: string;
  /** Name shown in the tooltip and announced to screen readers. */
  label: string;
  /** The icon, usually an SVG sized around 45% of the tile. */
  icon: ReactNode;
  /** Draws a quiet dot under the icon, for something that is running in the background. */
  open?: boolean;
  /** Draws a thin divider before this item, to split the dock into groups. */
  separatorBefore?: boolean;
  /** Keeps the item visible but not pressable. */
  disabled?: boolean;
  /** Runs when the item is pressed, after the bounce starts. */
  onSelect?: () => void;
}

/**
 * An app dock: tiles magnify around the cursor, show their name in a tooltip, bounce when pressed, and the active one carries a dot.
 * Magnification is for mouse and pen only; touch and reduced motion get a still dock.
 */
export interface DockProps {
  /** The tiles, left to right. */
  items: DockItem[];
  /** Id of the active item (controlled). Pass null for none. */
  value?: string | null;
  /** Active item when uncontrolled. */
  defaultValue?: string | null;
  /** Called with the id of the pressed item. */
  onValueChange?: (value: string) => void;
  /** Tile size at rest, in pixels. */
  size?: number;
  /** How much the tile under the cursor grows: 1.6 means 60% larger. */
  magnification?: number;
  /** Distance in pixels over which the magnification falls off to nothing. */
  range?: number;
  /** Accessible name of the toolbar. */
  label?: string;
  /** Extra class for the dock bar. */
  className?: string;
}

const follow = { stiffness: motionTokens.spring.responsive.stiffness, damping: motionTokens.spring.responsive.damping, mass: .6 };
const tipIn = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] as [number, number, number, number] };
const tipOut = { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] as [number, number, number, number] };
const focusVisible = (element: Element) => { try { return element.matches(":focus-visible"); } catch { return true; } };

interface DockTileProps {
  item: DockItem;
  active: boolean;
  pointerX: MotionValue<number>;
  base: number;
  magnification: number;
  range: number;
  reduce: boolean;
  onPress: (item: DockItem) => void;
}

function DockTile({ item, active, pointerX, base, magnification, range, reduce, onPress }: DockTileProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState(false);
  // Size follows the distance between the cursor and this tile's center along a cosine falloff, then a spring smooths it.
  const target = useTransform(pointerX, (pointer: number) => {
    const node = slotRef.current;
    if (!node || !Number.isFinite(pointer)) return base;
    const box = node.getBoundingClientRect();
    const distance = Math.abs(pointer - (box.left + box.width / 2));
    return base + base * (magnification - 1) * Math.cos(Math.min(distance / range, 1) * Math.PI / 2);
  });
  const size = useSpring(target, follow);
  const glyphScale = useTransform(size, (value: number) => value / base);
  const hop = useMotionValue(0);

  function press() {
    if (item.disabled) return;
    if (!reduce) animate(hop, [0, -base * .32, 0, -base * .1, 0], { duration: .62, times: [0, .28, .58, .78, 1], ease: ["easeOut", "easeIn", "easeOut", "easeIn"] });
    onPress(item);
  }

  return (
    <motion.div ref={slotRef} className={styles.slot} style={{ width: size, height: size }} onPointerEnter={event => { if (event.pointerType !== "touch") setHot(true); }} onPointerLeave={() => setHot(false)}>
      <motion.button type="button" className={styles.tile} style={{ y: hop }} data-dock-item="" data-active={active || undefined} aria-label={item.label} aria-pressed={active} disabled={item.disabled} onClick={press} onFocus={event => { if (focusVisible(event.currentTarget)) setHot(true); }} onBlur={() => setHot(false)}>
        <motion.span className={styles.glyph} style={{ scale: glyphScale }} aria-hidden="true">{item.icon}</motion.span>
      </motion.button>
      <AnimatePresence>
        {hot ? <motion.span key="tip" className={styles.tip} aria-hidden="true" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: .94 }} animate={{ opacity: 1, y: 0, scale: 1, transition: tipIn }} exit={{ opacity: 0, transition: tipOut }}>{item.label}</motion.span> : null}
      </AnimatePresence>
      <span className={styles.dot} data-state={active ? "active" : item.open ? "open" : "off"} aria-hidden="true" />
    </motion.div>
  );
}

export function Dock({ items, value, defaultValue = null, onValueChange, size = 48, magnification = 1.6, range = 140, label = "Dock", className }: DockProps) {
  const reduce = !!useReducedMotion();
  const [internal, setInternal] = useState<string | null>(defaultValue);
  const active = value !== undefined ? value : internal;
  const barRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(Number.POSITIVE_INFINITY);

  function press(item: DockItem) {
    if (value === undefined) setInternal(item.id);
    onValueChange?.(item.id);
    item.onSelect?.();
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType === "touch") return;
    pointerX.set(event.clientX);
  }

  // Keyboard focus magnifies the focused tile the way the cursor would.
  function onFocus(target: Element) {
    if (reduce || !focusVisible(target)) return;
    const box = target.getBoundingClientRect();
    pointerX.set(box.left + box.width / 2);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tiles = Array.from(barRef.current?.querySelectorAll<HTMLElement>("[data-dock-item]:not(:disabled)") ?? []);
    const at = tiles.indexOf(document.activeElement as HTMLElement);
    if (at < 0) return;
    const to = event.key === "ArrowRight" ? (at + 1) % tiles.length : event.key === "ArrowLeft" ? (at - 1 + tiles.length) % tiles.length : event.key === "Home" ? 0 : tiles.length - 1;
    event.preventDefault();
    tiles[to]?.focus();
  }

  return (
    <div ref={barRef} role="toolbar" aria-label={label} aria-orientation="horizontal" className={[styles.dock, className].filter(Boolean).join(" ")} style={{ "--dock-size": `${size}px` } as CSSProperties} onPointerMove={onPointerMove} onPointerLeave={() => pointerX.set(Number.POSITIVE_INFINITY)} onFocus={event => onFocus(event.target)} onBlur={event => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) pointerX.set(Number.POSITIVE_INFINITY); }} onKeyDown={onKeyDown}>
      {items.map(item => (
        <Fragment key={item.id}>
          {item.separatorBefore ? <span className={styles.separator} role="separator" aria-orientation="vertical" /> : null}
          <DockTile item={item} active={item.id === active} pointerX={pointerX} base={size} magnification={magnification} range={range} reduce={reduce} onPress={press} />
        </Fragment>
      ))}
    </div>
  );
}

export default Dock;
