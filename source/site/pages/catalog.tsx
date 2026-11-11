import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { ChevronRight, LayoutGrid, List, Search, SearchX, X } from "lucide-react";
import { EmptyState } from "@/registry/components/empty-state/empty-state";
import { ItemCard } from "@/site/components/item-card";
import { PageFooter } from "@/site/components/site-footer";
import { categories, items, searchItems, type ItemKind } from "@/site/lib/catalog";
import { href, navigate, type Route } from "@/site/lib/router";
import { site } from "@/site/lib/site-config";
import styles from "./catalog.module.css";

const copy: Record<ItemKind, { title: string; lead: string; path: string; placeholder: string; other: { path: string; one: string; many: string } }> = {
  component: { title: "Componentes", lead: "Peças de interface com movimento e teclado prontos: botões, campos, menus, gráficos, interfaces de IA e mais.", path: "/componentes", placeholder: "Buscar: botão, data, gráfico…", other: { path: "/blocos", one: "bloco novo", many: "blocos novos" } },
  block: { title: "Blocos", lead: "Seções e telas completas, montadas com os componentes: cabeçalhos, heróis, login, preços e mais.", path: "/blocos", placeholder: "Buscar: login, preços, rodapé…", other: { path: "/componentes", one: "componente novo", many: "componentes novos" } },
};
const views = [
  { value: "grade", label: "Grade", icon: <LayoutGrid size={14} strokeWidth={1.75} aria-hidden="true" /> },
  { value: "lista", label: "Lista", icon: <List size={14} strokeWidth={1.75} aria-hidden="true" /> },
] as const;

/**
 * A galeria de um tipo de item: busca, categorias em fichas (mais a ficha "Novos") e visão em grade ou lista.
 * O estado fica na URL (?q, ?cat, ?novos, ?ver), então dá para compartilhar e voltar.
 */
export function CatalogPage({ kind, route }: { kind: ItemKind; route: Route }) {
  const { title, lead, path, placeholder, other } = copy[kind];
  const category = kind === "component" ? route.query.get("cat") ?? "" : "";
  const onlyNew = route.query.get("novos") === "1";
  const view = route.query.get("ver") === "lista" ? "lista" : "grade";
  const urlQuery = route.query.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const input = useRef<HTMLInputElement>(null);
  const pool = useMemo(() => items.filter(item => item.kind === kind), [kind]);
  const groups = useMemo(() => categories.filter(entry => entry.id !== "blocks").map(entry => ({ ...entry, count: pool.filter(item => item.category === entry.id).length })).filter(entry => entry.count > 0), [pool]);
  const newCount = useMemo(() => pool.filter(item => item.isNew).length, [pool]);
  const otherNew = useMemo(() => items.filter(item => item.kind !== kind && item.isNew).length, [kind]);
  const state = (next: { q?: string; cat?: string; novos?: boolean; ver?: string }) => ({
    q: (next.q ?? query).trim() || undefined,
    cat: (next.cat ?? category) || undefined,
    novos: (next.novos ?? onlyNew) ? "1" : undefined,
    ver: (next.ver ?? view) === "lista" ? "lista" : undefined,
  });

  useEffect(() => { document.title = `${title} · ${site.name}`; }, [title]);

  // A URL acompanha a busca sem criar uma entrada de histórico por tecla. O filtro lido é o do momento em que o tempo vence,
  // não o de quando a tecla foi apertada (senão "Limpar filtros" traria a categoria de volta).
  const latest = useRef(state);
  useEffect(() => { latest.current = state; });
  const first = useRef(true);
  const pushed = useRef(urlQuery);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const timer = window.setTimeout(() => { const next = latest.current({}); pushed.current = next.q ?? ""; navigate(path, { replace: true, query: next }); }, 200);
    return () => window.clearTimeout(timer);
  }, [query, path]);
  // E o campo acompanha a URL quando ela muda por fora (voltar do navegador, um link para a galeria), não quando é o eco da própria digitação.
  useEffect(() => {
    if (urlQuery === pushed.current) return;
    pushed.current = urlQuery;
    setQuery(urlQuery);
  }, [urlQuery]);

  const results = useMemo(() => {
    let list = pool;
    if (category) list = list.filter(item => item.category === category);
    if (onlyNew) list = list.filter(item => item.isNew);
    return searchItems(query, list);
  }, [query, category, onlyNew, pool]);
  const filtering = Boolean(query.trim() || category || onlyNew);

  /** Fichas e visão são links de verdade (dá para copiar o endereço), mas trocam o filtro sem empilhar histórico. */
  const go = (next: Parameters<typeof state>[0]) => ({
    href: href(path, state(next)),
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      navigate(path, { replace: true, query: state(next) });
    },
  });

  return (
    <div className={styles.page}>
      <nav className={styles.crumbs} aria-label="Você está em">
        <ol>
          <li><a href={href("/")}>Início</a></li>
          <li aria-hidden="true"><ChevronRight size={14} strokeWidth={1.75} /></li>
          <li aria-current="page">{title}</li>
        </ol>
      </nav>
      <header className={styles.header}>
        <h1>{title}</h1>
        <p className={styles.lead}>{lead}</p>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Search size={15} strokeWidth={1.75} aria-hidden="true" />
          <span className={styles.visuallyHidden}>Buscar em {title.toLowerCase()}</span>
          <input ref={input} type="search" placeholder={placeholder} value={query} autoComplete="off" spellCheck={false} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Escape" && query) { event.preventDefault(); setQuery(""); } }} />
          {query ? <button type="button" className={styles.clear} aria-label="Limpar a busca" onClick={() => { setQuery(""); input.current?.focus(); }}><X size={14} strokeWidth={2} aria-hidden="true" /></button> : null}
        </label>
        <p className={styles.summary} role="status">{results.length === pool.length ? `${pool.length} itens` : `${results.length} de ${pool.length} itens`}</p>
        <div className={styles.views} role="group" aria-label="Visão">
          {views.map(option => <a key={option.value} className={styles.view} aria-current={view === option.value ? "true" : undefined} {...go({ ver: option.value })}>{option.icon}<span>{option.label}</span></a>)}
        </div>
      </div>

      <nav className={styles.chips} aria-label="Filtrar por categoria">
        <a className={styles.chip} aria-current={!category && !onlyNew ? "true" : undefined} {...go({ cat: "", novos: false })}>Todos<span className={styles.chipCount}>{pool.length}</span></a>
        {groups.map(entry => <a key={entry.id} className={styles.chip} aria-current={category === entry.id ? "true" : undefined} {...go({ cat: entry.id, novos: false })}>{entry.label}<span className={styles.chipCount}>{entry.count}</span></a>)}
        {newCount ? <a className={styles.chip} data-new="" aria-current={onlyNew ? "true" : undefined} {...go({ cat: "", novos: true })}><span className={styles.dot} aria-hidden="true" />Novos<span className={styles.chipCount}>{newCount}</span></a> : null}
      </nav>
      {onlyNew && otherNew ? <p className={styles.note}>Itens escritos para o {site.name}. <a href={href(other.path, { novos: "1" })}>Ver também {otherNew} {otherNew === 1 ? other.one : other.many}</a></p> : null}

      {results.length ? (
        <ul className={styles.grid} data-view={view}>
          {results.map((item, index) => <li key={item.name} style={{ "--i": Math.min(index, 11) } as CSSProperties}><ItemCard item={item} priority={index < 8} layout={view === "lista" ? "row" : "card"} /></li>)}
        </ul>
      ) : (
        <div className={styles.empty}>
          <EmptyState
            icon={<SearchX aria-hidden="true" />}
            title="Nada encontrado"
            description={query.trim() ? `Nenhum item combina com “${query.trim()}”${category || onlyNew ? " neste filtro" : ""}.` : "Nenhum item neste filtro."}
            action={filtering ? <button type="button" className={styles.reset} onClick={() => { setQuery(""); navigate(path, { replace: true, query: { ver: view === "lista" ? "lista" : undefined } }); }}>Limpar filtros</button> : undefined}
          />
        </div>
      )}

      <PageFooter />
    </div>
  );
}
