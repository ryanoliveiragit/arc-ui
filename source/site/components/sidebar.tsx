import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { ArrowUpRight, BookOpen, Bookmark, ChevronDown, ChevronRight, Component, LayoutTemplate, Search, X } from "lucide-react";
import { categories, findItem, items, itemsByCategory, searchItems, versionsOf, type CatalogItem } from "@/site/lib/catalog";
import { href, itemPath, navigate, type Route } from "@/site/lib/router";
import { useSaved } from "@/site/lib/saved";
import { asset } from "@/site/lib/site-config";
import styles from "./sidebar.module.css";

export type SidebarFilter = "todos" | "novos" | "versoes";
type SectionId = "docs" | "componentes" | "blocos";

/** O que a pessoa fez na barra lateral. Fica na casca do site, então sobrevive à navegação e vale também para a gaveta do celular. */
export interface SidebarState {
  query: string;
  setQuery: (value: string) => void;
  filter: SidebarFilter;
  setFilter: (value: SidebarFilter) => void;
  /** Grupos recolhidos, pelo id da categoria. */
  collapsed: ReadonlySet<string>;
  toggleGroup: (id: string) => void;
  openGroup: (id: string) => void;
}

export function useSidebarState(): SidebarState {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SidebarFilter>("todos");
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set<string>());
  const toggleGroup = useCallback((id: string) => setCollapsed(current => { const next = new Set(current); if (!next.delete(id)) next.add(id); return next; }), []);
  const openGroup = useCallback((id: string) => setCollapsed(current => { if (!current.has(id)) return current; const next = new Set(current); next.delete(id); return next; }), []);
  return useMemo(() => ({ query, setQuery, filter, setFilter, collapsed, toggleGroup, openGroup }), [query, filter, collapsed, toggleGroup, openGroup]);
}

const filters: { value: SidebarFilter; label: string; title: string }[] = [
  { value: "todos", label: "Todos", title: "Todos os itens" },
  { value: "novos", label: "Novos", title: "Só os itens novos" },
  { value: "versoes", label: "Versões", title: "Só os itens com mais de uma versão" },
];
const jumps: { id: SectionId; label: string }[] = [
  { id: "componentes", label: "Componentes" },
  { id: "blocos", label: "Blocos" },
  { id: "docs", label: "Docs" },
];
const docLinks = [
  { label: "Introdução", path: "/" },
  { label: "Instalação", path: "/docs/instalacao" },
  { label: "Temas", path: "/docs/temas" },
  { label: "Licença", path: "/docs/licenca" },
];
const aiLink = { label: "Para IA", file: "llms.txt" };

interface Group { id: string; label: string; items: CatalogItem[] }
const componentGroups: Group[] = categories.filter(category => category.id !== "blocks").map(category => ({ id: category.id, label: category.label, items: itemsByCategory(category.id) })).filter(group => group.items.length > 0);
/** Os blocos são um grupo só; o nome evita repetir o título da seção. */
const blockGroup: Group = { id: "blocks", label: "Seções e telas", items: itemsByCategory("blocks") };
const newCount = items.filter(item => item.isNew).length;

/** A seção da árvore a que a página aberta pertence. É a que o atalho marca quando a página abre; depois ele segue a rolagem da lista. */
function routeSection(route: Route): SectionId | null {
  const [first] = route.segments;
  if (first === "c" || first === "componentes") return "componentes";
  if (first === "b" || first === "blocos") return "blocos";
  if (first === "docs" || route.path === "/") return "docs";
  return null;
}

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function GroupBlock({ group, open, forced, current, listId, onToggle, onNavigate }: { group: Group; open: boolean; forced: boolean; current: string | undefined; listId: string; onToggle: () => void; onNavigate?: () => void }) {
  const shown = open || forced;
  return (
    <div className={styles.group}>
      <h3 className={styles.groupHead}>
        <button type="button" className={styles.groupToggle} aria-expanded={shown} aria-controls={listId} onClick={onToggle}>
          <ChevronDown className={styles.chevron} size={12} strokeWidth={2} aria-hidden="true" />
          <span className={styles.groupLabel}>{group.label}</span>
          <span className={styles.count}>{group.items.length}</span>
        </button>
      </h3>
      <ul id={listId} className={styles.items} hidden={!shown}>
        {shown ? group.items.map(item => (
          <li key={item.name}>
            <a className={styles.item} data-row="" href={href(itemPath(item))} aria-current={item.name === current ? "page" : undefined} onClick={onNavigate}>
              <span className={styles.itemTitle}>{item.title}</span>
              {item.isNew ? <span className={styles.pill}>Novo</span> : null}
            </a>
          </li>
        )) : null}
      </ul>
    </div>
  );
}

/**
 * A árvore do site: busca que filtra, filtro, Salvos, atalhos de seção, Docs, Componentes por categoria, Blocos e o cartão de novidades.
 * `variant="rail"` é a coluna fixa do computador; `variant="drawer"` é o mesmo conteúdo dentro da gaveta.
 */
export function SiteSidebar({ route, state, variant = "rail", searchRef, onNavigate }: { route: Route; state: SidebarState; variant?: "rail" | "drawer"; searchRef?: Ref<HTMLInputElement>; onNavigate?: () => void }) {
  const { query, setQuery, filter, setFilter, collapsed, toggleGroup } = state;
  const saved = useSaved();
  const uid = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState<SectionId | null>(() => routeSection(route));

  const [first, second] = route.segments;
  const currentItem = first === "c" || first === "b" ? findItem(second) : undefined;
  const searching = query.trim().length > 0;
  const savedCount = useMemo(() => saved.filter(name => findItem(name)).length, [saved]);

  // O que passa pelo filtro e pela busca. A árvore mantém a ordem do catálogo; `best` é o melhor resultado, para o Enter.
  const { visible, best } = useMemo(() => {
    let pool = items;
    if (filter === "novos") pool = pool.filter(item => item.isNew);
    if (filter === "versoes") pool = pool.filter(item => versionsOf(item).length > 1);
    const found = searchItems(query, pool);
    return { visible: new Set(found.map(item => item.name)), best: query.trim() ? found[0] : undefined };
  }, [query, filter]);
  const groups = useMemo(() => componentGroups.map(group => ({ ...group, items: group.items.filter(item => visible.has(item.name)) })).filter(group => group.items.length > 0), [visible]);
  const blocks = useMemo(() => ({ ...blockGroup, items: blockGroup.items.filter(item => visible.has(item.name)) }), [visible]);
  const componentCount = groups.reduce((total, group) => total + group.items.length, 0);
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const matchesDoc = (label: string) => terms.every(term => normalize(label).includes(term));
  const docs = searching ? docLinks.filter(link => matchesDoc(link.label)) : docLinks;
  const showAi = !searching || matchesDoc(aiLink.label);
  const present: Record<SectionId, boolean> = { docs: docs.length > 0 || showAi, componentes: componentCount > 0, blocos: blocks.items.length > 0 };
  const nothing = !present.docs && !present.componentes && !present.blocos;

  /*
   * O atalho marcado (Componentes · Blocos · Docs). Ao abrir uma página ele marca a seção dela; quando a pessoa rola a lista,
   * passa a marcar a seção que está no topo. As rolagens que a própria lista faz (trazer a página aberta à vista, o pulo de
   * um atalho) não mexem na marca: ficam "quietas" até a rolagem parar ou até a pessoa usar roda, toque, clique ou teclado.
   */
  const readTop = useCallback((): SectionId | null => {
    const list = listRef.current;
    const nodes = list ? [...list.querySelectorAll<HTMLElement>("[data-section]")] : [];
    if (!list || !nodes.length) return null;
    const top = list.getBoundingClientRect().top;
    let current = nodes[0]!;
    for (const node of nodes) if (node.getBoundingClientRect().top - top <= 48) current = node;
    if (list.scrollTop > 0 && list.scrollHeight - list.clientHeight - list.scrollTop < 2) current = nodes[nodes.length - 1]!;
    return current.dataset.section as SectionId;
  }, []);
  const quiet = useRef(false);
  const quietTimer = useRef(0);
  const settle = useCallback(() => { window.clearTimeout(quietTimer.current); quietTimer.current = window.setTimeout(() => { quiet.current = false; }, 180); }, []);
  const hush = useCallback(() => { quiet.current = true; settle(); }, [settle]);
  const wake = () => { quiet.current = false; window.clearTimeout(quietTimer.current); };
  const frame = useRef(0);
  const onScroll = () => {
    if (quiet.current) { settle(); return; }
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setSection(readTop()));
  };
  useEffect(() => () => { cancelAnimationFrame(frame.current); window.clearTimeout(quietTimer.current); }, []);

  // A página aberta fica à vista dentro da lista. Quem rola é a lista, nunca a página.
  // Roda ao trocar de página e também depois de limpar a busca ou trocar o filtro: a lista mudou e a página aberta pode ter saído de vista.
  const currentOpen = currentItem ? !collapsed.has(currentItem.category) : true;
  const filtering = searching || filter !== "todos";
  const pageSection = routeSection(route);
  const shownPath = useRef<string | null>(null);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>('[data-row][aria-current="page"]');
    const box = list.getBoundingClientRect(), row = active?.getBoundingClientRect();
    if (row?.height) {
      const top = row.top - box.top, bottom = row.bottom - box.top;
      // 34px: o título do grupo grudado no topo; 36px: a faixa que some embaixo.
      if (top < 34 || bottom > list.clientHeight - 36) { hush(); list.scrollTop += top - (list.clientHeight - row.height) / 2; }
    }
    // Página nova, ou a lista inteira de volta: marca a seção da página. Lista filtrada: marca o que ficou no topo.
    const navigated = shownPath.current !== route.path;
    shownPath.current = route.path;
    setSection(navigated || !filtering ? pageSection : readTop());
    // Só o caminho conta: mudar ?q= ou ?cat= na galeria não é trocar de página.
  }, [route.path, pageSection, currentOpen, filtering, filter, hush, readTop]);
  // Cada tecla da busca muda a lista filtrada: a marca segue o que está no topo.
  const listKey = `${query}\n${[...collapsed].join(",")}`;
  const firstList = useRef(true);
  useEffect(() => {
    if (firstList.current) { firstList.current = false; return; }
    if (filtering) setSection(readTop());
  }, [listKey, filtering, readTop]);

  function jumpTo(id: SectionId) {
    const list = listRef.current;
    const node = list?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (!list || !node) return;
    hush();
    list.scrollTo({ top: node.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop, behavior: reducedMotion() ? "auto" : "smooth" });
    setSection(id);
  }

  function onSearchKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (query) { event.preventDefault(); setQuery(""); } else event.currentTarget.blur();
    } else if (event.key === "ArrowDown") {
      const target = listRef.current?.querySelector<HTMLElement>("[data-row]");
      if (target) { event.preventDefault(); target.focus(); }
    } else if (event.key === "Enter" && best) {
      event.preventDefault();
      navigate(itemPath(best));
      onNavigate?.();
    }
  }

  const Root = variant === "rail" ? "aside" : "div";
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setInput = (node: HTMLInputElement | null) => { inputRef.current = node; if (typeof searchRef === "function") searchRef(node); else if (searchRef) searchRef.current = node; };

  return (
    <Root className={styles.sidebar} data-variant={variant} aria-label={variant === "rail" ? "Catálogo" : undefined}>
      <label className={styles.search}>
        <Search size={14} strokeWidth={2} aria-hidden="true" />
        <span className={styles.visuallyHidden}>Filtrar a lista por nome ou uso</span>
        <input ref={setInput} className={styles.searchInput} type="search" placeholder="Nome ou uso" value={query} autoComplete="off" spellCheck={false} aria-keyshortcuts="/" onChange={event => setQuery(event.target.value)} onKeyDown={onSearchKey} />
        {query
          ? <button type="button" className={styles.clear} aria-label="Limpar a busca" onClick={() => { setQuery(""); inputRef.current?.focus(); }}><X size={13} strokeWidth={2} aria-hidden="true" /></button>
          : <kbd className={styles.kbd} aria-hidden="true">/</kbd>}
      </label>

      <div className={styles.filter} role="group" aria-label="Filtrar itens">
        {filters.map(option => <button key={option.value} type="button" className={styles.filterOption} title={option.title} aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}>{option.label}</button>)}
      </div>

      <a className={styles.saved} href={href("/salvos")} aria-current={route.path === "/salvos" ? "page" : undefined} onClick={onNavigate}>
        <Bookmark size={14} strokeWidth={2} aria-hidden="true" />
        <span>Salvos</span>
        {savedCount ? <span className={styles.count}>{savedCount}</span> : null}
      </a>

      <div className={styles.jump} role="group" aria-label="Ir para a seção">
        {jumps.map(jump => <button key={jump.id} type="button" className={styles.jumpButton} aria-current={section === jump.id && present[jump.id] ? "true" : undefined} disabled={!present[jump.id]} onClick={() => jumpTo(jump.id)}>{jump.label}</button>)}
      </div>

      <div ref={listRef} className={styles.list} onScroll={onScroll} onWheel={wake} onTouchStart={wake} onPointerDown={wake} onKeyDown={wake}>
        {present.docs ? (
          <nav className={styles.section} data-section="docs" aria-labelledby={`${uid}-docs`}>
            <h2 className={styles.heading} id={`${uid}-docs`}>
              <BookOpen size={14} strokeWidth={1.75} aria-hidden="true" />
              <a href={href("/docs/instalacao")} onClick={onNavigate}>Docs</a>
            </h2>
            <ul className={styles.items}>
              {docs.map(link => <li key={link.path}><a className={styles.item} data-row="" href={href(link.path)} aria-current={route.path === link.path ? "page" : undefined} onClick={onNavigate}><span className={styles.itemTitle}>{link.label}</span></a></li>)}
              {showAi ? (
                <li>
                  <a className={styles.item} href={asset(aiLink.file)} target="_blank" rel="noreferrer">
                    <span className={styles.itemTitle}>{aiLink.label}</span>
                    <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
                    <span className={styles.visuallyHidden}>(abre em outra aba)</span>
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>
        ) : null}

        {present.componentes ? (
          <nav className={styles.section} data-section="componentes" aria-labelledby={`${uid}-componentes`}>
            <h2 className={styles.heading} id={`${uid}-componentes`}>
              <Component size={14} strokeWidth={1.75} aria-hidden="true" />
              <a href={href("/componentes")} aria-current={route.path === "/componentes" ? "page" : undefined} onClick={onNavigate}>Componentes</a>
              <span className={styles.count}>{componentCount}</span>
            </h2>
            {groups.map(group => <GroupBlock key={group.id} group={group} open={!collapsed.has(group.id)} forced={searching} current={currentItem?.name} listId={`${uid}-${group.id}`} onToggle={() => toggleGroup(group.id)} onNavigate={onNavigate} />)}
          </nav>
        ) : null}

        {present.blocos ? (
          <nav className={styles.section} data-section="blocos" aria-labelledby={`${uid}-blocos`}>
            <h2 className={styles.heading} id={`${uid}-blocos`}>
              <LayoutTemplate size={14} strokeWidth={1.75} aria-hidden="true" />
              <a href={href("/blocos")} aria-current={route.path === "/blocos" ? "page" : undefined} onClick={onNavigate}>Blocos</a>
              <span className={styles.count}>{blocks.items.length}</span>
            </h2>
            <GroupBlock group={blocks} open={!collapsed.has(blocks.id)} forced={searching} current={currentItem?.name} listId={`${uid}-${blocks.id}`} onToggle={() => toggleGroup(blocks.id)} onNavigate={onNavigate} />
          </nav>
        ) : null}

        {nothing ? (
          <div className={styles.empty} role="status">
            <span>{searching ? <>Nada combina com “{query.trim()}”{filter === "todos" ? "" : " neste filtro"}.</> : "Nenhum item neste filtro."}</span>
            <button type="button" className={styles.emptyButton} onClick={() => { setQuery(""); setFilter("todos"); }}>Limpar</button>
          </div>
        ) : null}
      </div>

      <a className={styles.news} href={href("/componentes", { novos: "1" })} onClick={onNavigate}>
        <span className={styles.newsDot} aria-hidden="true" />
        <span>Novidades</span>
        <span className={styles.newsCount}>{newCount} novos</span>
        <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
      </a>
    </Root>
  );
}
