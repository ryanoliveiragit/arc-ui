"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FocusEvent, HTMLAttributes, KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./hover-highlight.module.css";

/**
 * A group in which one shared background pill glides to the item under the pointer or holding keyboard focus.
 * Use it for nav rows, menus and toolbars. With a `value`, the pill rests on that item and returns to it when the pointer leaves.
 */
export interface HoverHighlightProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Direction the items flow in. It also decides which arrow keys move focus. */
  orientation?: "vertical" | "horizontal";
  /** Pill color: a quiet neutral wash, or the solid accent with dark text on top. */
  tone?: "muted" | "accent";
  /** Value of the item the pill rests on while nothing is hovered (controlled). Pass null for none. */
  value?: string | null;
  /** Resting item when uncontrolled. */
  defaultValue?: string | null;
  /** Called when someone picks an item that has a `value`. */
  onValueChange?: (value: string) => void;
  /** Arrow keys, Home and End move focus between items. */
  arrowNavigation?: boolean;
  /** Extra class for the group element. */
  className?: string;
  /** `HoverHighlightItem`s, or any elements carrying `data-highlight-item`, at any depth. */
  children: ReactNode;
}

export interface HoverHighlightItemProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Identifies the item for `value` and `onValueChange`. Items without a value only take the hover pill. */
  value?: string;
  /** Renders a link instead of a button. */
  href?: string;
  /** Leaves the item out of hover, focus and selection. */
  disabled?: boolean;
  /** Extra class for the item. */
  className?: string;
  /** Item content: text, icons, shortcuts. */
  children: ReactNode;
}

interface GroupContext {
  selected: string | null;
  select: (value: string) => void;
}

const Context = createContext<GroupContext>({ selected: null, select: () => {} });
const ITEM = "[data-highlight-item]";
const fade = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] as [number, number, number, number] };
const focusVisible = (element: Element) => { try { return element.matches(":focus-visible"); } catch { return true; } };

export function HoverHighlight({ orientation = "vertical", tone = "muted", value, defaultValue = null, onValueChange, arrowNavigation = true, className, children, onPointerMove, onPointerLeave, onFocus, onBlur, onKeyDown, ...props }: HoverHighlightProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState<string | null>(defaultValue);
  const selected = value !== undefined ? value : internal;
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  // Pill geometry lives in motion values: following the pointer never re-renders the items.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const opacity = useMotionValue(0);
  const shown = useRef(false);
  const marked = useRef<HTMLElement | null>(null);

  const itemFrom = (target: EventTarget | null) => {
    const root = rootRef.current;
    const item = target instanceof Element ? target.closest<HTMLElement>(ITEM) : null;
    return item && root?.contains(item) && !item.hasAttribute("data-disabled") ? item : null;
  };

  /** Moves the pill to the hovered item, else to the selected one, else hides it. `glide` false snaps (first show, resize). */
  const place = useCallback((glide: boolean) => {
    const root = rootRef.current;
    if (!root) return;
    let target = hovered?.isConnected ? hovered : null;
    if (!target && selected != null) target = Array.from(root.querySelectorAll<HTMLElement>(ITEM)).find(item => item.dataset.value === selected) ?? null;
    if (marked.current !== target) {
      marked.current?.removeAttribute("data-highlighted");
      target?.setAttribute("data-highlighted", "");
      marked.current = target;
    }
    if (!target) { shown.current = false; animate(opacity, 0, fade); return; }
    const frame = root.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    const next = { x: box.left - frame.left - root.clientLeft + root.scrollLeft, y: box.top - frame.top - root.clientTop + root.scrollTop, width: box.width, height: box.height };
    if (glide && shown.current && !reduce) {
      animate(x, next.x, motionTokens.spring.morph);
      animate(y, next.y, motionTokens.spring.morph);
      animate(width, next.width, motionTokens.spring.morph);
      animate(height, next.height, motionTokens.spring.morph);
    } else {
      for (const [motionValue, to] of [[x, next.x], [y, next.y], [width, next.width], [height, next.height]] as const) { motionValue.stop(); motionValue.jump(to); }
    }
    shown.current = true;
    animate(opacity, 1, fade);
  }, [height, hovered, opacity, reduce, selected, width, x, y]);

  useLayoutEffect(() => { place(true); }, [place]);

  // Sizes change without a hover (fonts load, a section opens, the window resizes): the pill follows without animating.
  const latestPlace = useRef(place);
  latestPlace.current = place;
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => latestPlace.current(false));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const select = useCallback((next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }, [onValueChange, value]);
  const context = useMemo(() => ({ selected, select }), [select, selected]);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    if (event.pointerType === "touch") return;
    // Between two items the pill stays on the last one, so crossing a gap never makes it blink.
    const item = itemFrom(event.target);
    if (item && item !== hovered) setHovered(item);
  }

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    onFocus?.(event);
    const item = itemFrom(event.target);
    if (item && focusVisible(event.target)) setHovered(item);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    onBlur?.(event);
    if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setHovered(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (!arrowNavigation || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const current = itemFrom(event.target);
    if (!current || current !== event.target) return;
    const [previousKey, nextKey] = orientation === "vertical" ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(`${ITEM}:not([data-disabled])`) ?? []);
    const at = items.indexOf(current);
    const to = event.key === nextKey ? (at + 1) % items.length : event.key === previousKey ? (at - 1 + items.length) % items.length : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : -1;
    if (to < 0 || !items[to]) return;
    event.preventDefault();
    items[to].focus();
  }

  return (
    <Context.Provider value={context}>
      <div {...props} ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} data-orientation={orientation} data-tone={tone} onPointerMove={handlePointerMove} onPointerLeave={event => { onPointerLeave?.(event); setHovered(null); }} onFocus={handleFocus} onBlur={handleBlur} onKeyDown={handleKeyDown}>
        <motion.span className={styles.pill} style={{ x, y, width, height, opacity }} aria-hidden="true" />
        {children}
      </div>
    </Context.Provider>
  );
}

export function HoverHighlightItem({ value, href, disabled = false, className, children, onClick, ...props }: HoverHighlightItemProps) {
  const { selected, select } = useContext(Context);
  const active = value !== undefined && value === selected;
  const shared = {
    ...props,
    className: [styles.item, className].filter(Boolean).join(" "),
    "data-highlight-item": "",
    "data-value": value,
    "data-active": active || undefined,
    "data-disabled": disabled ? "" : undefined,
    "aria-current": active ? ("true" as const) : undefined,
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (disabled) { event.preventDefault(); return; }
      onClick?.(event);
      if (value !== undefined && !event.defaultPrevented) select(value);
    },
  };
  if (href !== undefined) return <a {...shared} href={disabled ? undefined : href} aria-disabled={disabled || undefined}>{children}</a>;
  return <button {...shared} type="button" disabled={disabled}>{children}</button>;
}

export default HoverHighlight;
