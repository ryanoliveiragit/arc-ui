"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Button } from "@/registry/components/button/button";
import { ease } from "./hero-motion";
import shell from "./hero-section.module.css";

export interface HeroNavLink {
  /** Text of the link. */
  label: string;
  /** Where it goes. Without it the entry is a button that only calls `onClick`. */
  href?: string;
  /** Called on press. */
  onClick?: () => void;
}

export interface HeroNavProps {
  /** Product name beside the mark. */
  brand: string;
  /** A small glyph drawn on the accent tile, in the accent's text color. */
  mark?: ReactNode;
  /** Where the brand links to. Without it the brand is plain text. */
  brandHref?: string;
  /** Section links. They hide on narrow screens. */
  links?: HeroNavLink[];
  /** The quiet entry on the right, such as "Sign in". Hides on narrow screens. */
  signIn?: HeroNavLink | null;
  /** The button on the right. */
  action?: HeroNavLink | null;
  /** Fades the bar in on mount. Defaults to true. */
  animateIn?: boolean;
}

function NavEntry({ link, quiet = false }: { link: HeroNavLink; quiet?: boolean }) {
  const className = [shell.navLink, quiet ? shell.navQuiet : ""].filter(Boolean).join(" ");
  return link.href
    ? <a className={className} href={link.href} onClick={link.onClick}>{link.label}</a>
    : <button type="button" className={className} onClick={link.onClick}>{link.label}</button>;
}

/** The bar across the top of a hero: brand, section links, and the way in. */
export function HeroNav({ brand, mark, brandHref, links = [], signIn = { label: "Sign in" }, action = { label: "Get started" }, animateIn = true }: HeroNavProps) {
  const name = <><span className={shell.brandMark} aria-hidden="true">{mark}</span>{brand}</>;
  return <motion.header className={shell.nav} initial={animateIn ? { opacity: 0, y: -8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, ease: ease.enter }}>
    {brandHref ? <a className={shell.brand} href={brandHref}>{name}</a> : <span className={shell.brand}>{name}</span>}
    {links.length > 0 && <nav aria-label="Primary">
      <ul className={shell.navLinks}>{links.map(link => <li key={link.label}><NavEntry link={link} /></li>)}</ul>
    </nav>}
    <div className={shell.navEnd}>
      {signIn && <NavEntry link={signIn} quiet />}
      {action && (action.href
        ? <a className={shell.navLink} href={action.href} onClick={action.onClick}>{action.label}</a>
        : <Button variant="secondary" size="sm" onClick={action.onClick}>{action.label}</Button>)}
    </div>
  </motion.header>;
}

/** The faint grid of solid dots behind a hero. Set `--dots-fade` on it (a mask image) to choose where the grid fades out. */
export function HeroBackdrop({ className }: { className?: string }) {
  return <div className={[shell.dots, className].filter(Boolean).join(" ")} aria-hidden="true" />;
}

export interface HeroMarkProps {
  /** The phrase to mark. Keep it short: it never breaks across lines. */
  children: string;
  /** Draws the marker in from the left on mount. Defaults to true; reduced motion shows it drawn. */
  animateIn?: boolean;
}

/** One phrase of a headline under a solid accent marker that draws in from left to right. */
export function HeroMark({ children, animateIn = true }: HeroMarkProps) {
  return <span className={shell.mark}>{children}<span className={shell.markInk} data-still={animateIn ? undefined : ""} aria-hidden="true">{children}</span></span>;
}
