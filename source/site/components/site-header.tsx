import { useState } from "react";
import { Check, Menu, Palette, Search } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/registry/components/drawer/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/components/popover/popover";
import { ThemeSwitch } from "@/registry/components/theme-switch/theme-switch";
import { Tooltip } from "@/registry/components/tooltip/tooltip";
import { BrandMark } from "@/site/components/brand";
import { href, type Route } from "@/site/lib/router";
import { isMac, site } from "@/site/lib/site-config";
import { accents, setAccent, useTheme, type Accent } from "@/site/lib/theme";
import { switchTheme } from "@/site/lib/theme-transition";
import styles from "./site-header.module.css";

const links = [
  { path: "/componentes", label: "Componentes", match: ["componentes", "c"] },
  { path: "/blocos", label: "Blocos", match: ["blocos", "b"] },
  { path: "/docs/instalacao", label: "Instalação", match: ["docs/instalacao"] },
  { path: "/docs/temas", label: "Temas", match: ["docs/temas"] },
];

const accentNames: Record<Accent, string> = { lime: "Lima", neutral: "Neutro", violet: "Violeta", blue: "Azul", green: "Verde", amber: "Âmbar", orange: "Laranja", coral: "Coral", rose: "Rosa" };
/** As cores de destaque de foundation.css, para as amostras do seletor. */
const accentSwatch: Record<Accent, string> = { lime: "#ddfc74", neutral: "var(--neutral-9)", violet: "#7747ff", blue: "#0562ef", green: "#0db879", amber: "#f3ad20", orange: "#f48120", coral: "#f15f55", rose: "#ed4e9d" };

const isActive = (route: Route, match: string[]) => match.some(prefix => (prefix.includes("/") ? route.path.slice(1) === prefix : route.segments[0] === prefix));

function AccentPicker() {
  const { accent } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip content="Cor de destaque" side="bottom">
        <PopoverTrigger className={styles.iconButton} aria-label={`Cor de destaque: ${accentNames[accent]}`}>
          <Palette size={17} strokeWidth={1.75} aria-hidden="true" />
          <span className={styles.accentDot} style={{ background: accentSwatch[accent] }} aria-hidden="true" />
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent align="end" className={styles.accentPanel}>
        <p className={styles.accentTitle}>Cor de destaque</p>
        <div className={styles.accentGrid} role="radiogroup" aria-label="Cor de destaque">
          {accents.map(name => (
            <button key={name} type="button" role="radio" aria-checked={accent === name} className={styles.accentOption} onClick={() => setAccent(name)}>
              <span className={styles.swatch} style={{ background: accentSwatch[name] }}>{accent === name ? <Check size={13} strokeWidth={2.5} aria-hidden="true" /> : null}</span>
              <span>{accentNames[name]}</span>
            </button>
          ))}
        </div>
        <p className={styles.accentHint}>Muda o site inteiro, inclusive os demos. É o atributo <code>data-accent</code> no <code>&lt;html&gt;</code>.</p>
      </PopoverContent>
    </Popover>
  );
}

export function SiteHeader({ route, onOpenSearch, onSearchIntent }: { route: Route; onOpenSearch: () => void; onSearchIntent?: () => void }) {
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const shortcut = isMac() ? "⌘K" : "Ctrl K";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
          <DrawerTrigger className={`${styles.iconButton} ${styles.menuButton}`} aria-label="Abrir menu"><Menu size={18} strokeWidth={1.75} aria-hidden="true" /></DrawerTrigger>
          <DrawerContent side="left" title={site.name} description="Navegação do site">
            <nav className={styles.drawerNav} aria-label="Principal">
              <a href={href("/")} onClick={() => setMenuOpen(false)} aria-current={route.path === "/" ? "page" : undefined}>Início</a>
              {links.map(link => <a key={link.path} href={href(link.path)} onClick={() => setMenuOpen(false)} aria-current={isActive(route, link.match) ? "page" : undefined}>{link.label}</a>)}
              <a href={href("/docs/licenca")} onClick={() => setMenuOpen(false)} aria-current={route.path === "/docs/licenca" ? "page" : undefined}>Licença e créditos</a>
            </nav>
          </DrawerContent>
        </Drawer>

        <a className={styles.brand} href={href("/")} aria-label={`${site.name}, página inicial`}>
          <BrandMark />
          <span>{site.name}</span>
        </a>

        <nav className={styles.nav} aria-label="Principal">
          {links.map(link => <a key={link.path} href={href(link.path)} aria-current={isActive(route, link.match) ? "page" : undefined}>{link.label}</a>)}
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.search} onClick={onOpenSearch} onPointerEnter={onSearchIntent} onFocus={onSearchIntent} aria-keyshortcuts="Control+K Meta+K">
            <Search size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className={styles.searchLabel}>Buscar componentes…</span>
            <kbd className={styles.kbd}>{shortcut}</kbd>
          </button>
          <AccentPicker />
          <ThemeSwitch theme={theme} iconOnly label={theme === "dark" ? "Mudar para o tema claro" : "Mudar para o tema escuro"} onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "reveal")} />
        </div>
      </div>
    </header>
  );
}
