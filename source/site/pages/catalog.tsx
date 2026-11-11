import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { LayoutGrid, List, SearchX } from "lucide-react";
import { Button } from "@/registry/components/button/button";
import { EmptyState } from "@/registry/components/empty-state/empty-state";
import { SearchField } from "@/registry/components/search-field/search-field";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { ItemCard } from "@/site/components/item-card";
import { categories, categoryTone, items, searchItems, type ItemKind } from "@/site/lib/catalog";
import { href, navigate, type Route } from "@/site/lib/router";
import styles from "./catalog.module.css";

const copy: Record<ItemKind, { title: string; lead: string; path: string }> = {
  component: { title: "Componentes", lead: "Peças de interface com movimento e teclado prontos: botões, campos, menus, gráficos, interfaces de IA e mais.", path: "/componentes" },
  block: { title: "Blocos", lead: "Seções e telas completas, montadas com os componentes: cabeçalhos, heróis, login, preços e mais.", path: "/blocos" },
};
const views = [
  { value: "grade", label: "Grade", accessory: <LayoutGrid size={14} aria-hidden="true" /> },
  { value: "lista", label: "Lista", accessory: <List size={14} aria-hidden="true" /> },
];

/** A galeria de um tipo de item, com busca, filtro por categoria e visão em grade ou lista. O estado fica na URL, então dá para compartilhar e voltar. */
export function CatalogPage({ kind, route }: { kind: ItemKind; route: Route }) {
  const { title, lead, path } = copy[kind];
  const category = kind === "component" ? route.query.get("cat") ?? "" : "";
  const view = route.query.get("ver") === "lista" ? "lista" : "grade";
  const [query, setQuery] = useState(route.query.get("q") ?? "");
  const pool = useMemo(() => items.filter(item => item.kind === kind), [kind]);
  const groups = useMemo(() => categories.filter(entry => entry.id !== "blocks").map(entry => ({ ...entry, count: pool.filter(item => item.category === entry.id).length })).filter(entry => entry.count > 0), [pool]);
  const state = (next: { q?: string; cat?: string; ver?: string }) => ({ q: (next.q ?? query).trim() || undefined, cat: (next.cat ?? category) || undefined, ver: (next.ver ?? view) === "lista" ? "lista" : undefined });

  // A URL acompanha a busca sem criar uma entrada de histórico por tecla.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const timer = window.setTimeout(() => navigate(path, { replace: true, query: state({}) }), 200);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- categoria e visão mudam pela própria navegação
  }, [query]);

  const results = useMemo(() => searchItems(query, category ? pool.filter(item => item.category === category) : pool), [query, category, pool]);
  const filtering = Boolean(query.trim() || category);

  return (
    <div className={styles.page} data-aside={kind === "component" ? "true" : undefined}>
      {kind === "component" ? (
        <nav className={styles.aside} aria-label="Categorias">
          <h2 className={styles.asideTitle}>Categorias</h2>
          <ul className={styles.categoryList}>
            <li><a href={href(path, state({ cat: "" }))} aria-current={category ? undefined : "true"} onClick={event => { event.preventDefault(); navigate(path, { replace: true, query: { ...state({}), cat: undefined } }); }}><span className={styles.swatch} />Todos<span className={styles.number}>{pool.length}</span></a></li>
            {groups.map(entry => (
              <li key={entry.id}>
                <a href={href(path, state({ cat: entry.id }))} aria-current={category === entry.id ? "true" : undefined} onClick={event => { event.preventDefault(); navigate(path, { replace: true, query: state({ cat: entry.id }) }); }}>
                  <span className={styles.swatch} style={{ "--tone": categoryTone(entry.id) ?? "var(--text-muted)" } as CSSProperties} />{entry.label}<span className={styles.number}>{entry.count}</span>
                </a>
              </li>
            ))}
          </ul>
          <h2 className={styles.asideTitle}>Primeiros passos</h2>
          <ul className={styles.categoryList}>
            <li><a href={href("/docs/instalacao")}>Instalação</a></li>
            <li><a href={href("/docs/temas")}>Temas</a></li>
          </ul>
        </nav>
      ) : null}

      <div className={styles.main}>
        <header className={styles.header}>
          <h1>{title}</h1>
          <p className={styles.lead}>{lead}</p>
        </header>

        <div className={styles.filters}>
          <div className={styles.search}>
            <SearchField label={`Buscar em ${title.toLowerCase()}`} placeholder={kind === "component" ? "Buscar: botão, data, gráfico…" : "Buscar: login, preços, rodapé…"} value={query} onValueChange={setQuery} />
          </div>
          <p className={styles.summary} role="status">{results.length === pool.length ? `${pool.length} itens` : `${results.length} de ${pool.length} itens`}</p>
          <SegmentedControl label="Visão" options={views} value={view} onValueChange={next => navigate(path, { replace: true, query: state({ ver: next }) })} />
        </div>

        {results.length ? (
          <ul className={styles.grid} data-view={view}>
            {results.map((item, index) => <li key={item.name} style={{ "--i": Math.min(index, 11) } as CSSProperties}><ItemCard item={item} priority={index < 8} layout={view === "lista" ? "row" : "card"} /></li>)}
          </ul>
        ) : (
          <div className={styles.empty}>
            <EmptyState
              icon={<SearchX aria-hidden="true" />}
              title="Nada encontrado"
              description={query.trim() ? `Nenhum item combina com “${query.trim()}”${category ? " nesta categoria" : ""}.` : "Nenhum item nesta categoria."}
              action={filtering ? <Button variant="secondary" onClick={() => { setQuery(""); navigate(path, { replace: true, query: { ver: view === "lista" ? "lista" : undefined } }); }}>Limpar filtros</Button> : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
