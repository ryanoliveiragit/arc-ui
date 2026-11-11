import { useState, type Ref } from "react";
import { Check, Menu, Moon, Search, SlidersHorizontal, Sun } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/components/popover/popover";
import { Tooltip } from "@/registry/components/tooltip/tooltip";
import { BrandMark } from "@/site/components/brand";
import { href, type Route } from "@/site/lib/router";
import { isMac, site } from "@/site/lib/site-config";
import { accents, setAccent, useTheme, type Accent } from "@/site/lib/theme";
import { switchTheme } from "@/site/lib/theme-transition";
import styles from "./site-header.module.css";

/** Links do cabeçalho. `match` diz em que rotas o link fica marcado: um segmento ("c") ou um caminho inteiro ("docs/temas"). */
const links = [
  { path: "/componentes", label: "Componentes", match: ["componentes", "c"] },
  { path: "/blocos", label: "Blocos", match: ["blocos", "b"] },
  { path: "/docs/instalacao", label: "Docs", match: ["docs/instalacao", "docs/licenca"] },
  { path: "/docs/temas", label: "Temas", match: ["docs/temas"] },
];

const accentNames: Record<Accent, string> = { lime: "Lima", neutral: "Neutro", violet: "Violeta", blue: "Azul", green: "Verde", amber: "Âmbar", orange: "Laranja", coral: "Coral", rose: "Rosa" };
/** As cores de destaque de foundation.css, para as amostras do seletor. */
const accentSwatch: Record<Accent, string> = { lime: "#ddfc74", neutral: "var(--neutral-9)", violet: "#7747ff", blue: "#0562ef", green: "#0db879", amber: "#f3ad20", orange: "#f48120", coral: "#f15f55", rose: "#ed4e9d" };

const isActive = (route: Route, match: string[]) => match.some(prefix => (prefix.includes("/") ? route.path.slice(1) === prefix : route.segments[0] === prefix));

/** "Aparência": escolhe a cor de destaque do site inteiro. */
function AccentPicker() {
  const { accent } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={styles.appearance} aria-label={`Aparência: cor de destaque ${accentNames[accent]}`}>
        <SlidersHorizontal size={16} strokeWidth={1.75} aria-hidden="true" />
        <span className={styles.appearanceLabel}>Aparência</span>
      </PopoverTrigger>
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

/** Alterna entre tema escuro e claro. O ícone mostra o tema atual. */
function ThemeToggle() {
  const { theme } = useTheme();
  const label = theme === "dark" ? "Mudar para o tema claro" : "Mudar para o tema escuro";
  return (
    <Tooltip content={label} side="bottom">
      <button type="button" className={styles.theme} aria-label={label} onClick={event => switchTheme(theme === "dark" ? "light" : "dark", event.currentTarget, "reveal")}>
        {theme === "dark" ? <Moon size={16} strokeWidth={1.75} aria-hidden="true" /> : <Sun size={16} strokeWidth={1.75} aria-hidden="true" />}
      </button>
    </Tooltip>
  );
}

/** `menuRef` é o botão de menu (só aparece em telas estreitas): a casca devolve o foco a ele quando a gaveta fecha. */
export function SiteHeader({ route, menuOpen, menuRef, onOpenMenu, onOpenSearch }: { route: Route; menuOpen: boolean; menuRef?: Ref<HTMLButtonElement>; onOpenMenu: () => void; onOpenSearch: () => void }) {
  const shortcut = isMac() ? "⌘ K" : "Ctrl K";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button ref={menuRef} type="button" className={styles.menuButton} aria-label="Abrir o menu" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={onOpenMenu}>
          <Menu size={22} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <a className={styles.brand} href={href("/")} aria-label={`${site.name}, página inicial`}>
          <BrandMark size={22} />
          <span>{site.name}</span>
        </a>

        <nav className={styles.nav} aria-label="Principal">
          {links.map(link => <a key={link.path} href={href(link.path)} aria-current={isActive(route, link.match) ? "page" : undefined}>{link.label}</a>)}
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.search} aria-label="Buscar no site" aria-keyshortcuts="Control+K Meta+K" onClick={onOpenSearch}>
            <Search size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className={styles.searchLabel}>Buscar</span>
            <kbd className={styles.kbd}>{shortcut}</kbd>
          </button>
          <div className={styles.group}>
            <AccentPicker />
            <ThemeToggle />
          </div>
          <a className={styles.github} href={site.repository} target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
    </header>
  );
}
