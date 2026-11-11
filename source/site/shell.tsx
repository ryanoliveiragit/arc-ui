import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Compass } from "lucide-react";
import { EmptyState } from "@/registry/components/empty-state/empty-state";
import SearchPalette from "@/site/components/search-palette";
import { SiteFooter } from "@/site/components/site-footer";
import { SiteHeader } from "@/site/components/site-header";
import { findItem } from "@/site/lib/catalog";
import { href, useRoute } from "@/site/lib/router";
import { CatalogPage } from "@/site/pages/catalog";
import { DocsPage, type DocsPageId } from "@/site/pages/docs";
import { HomePage } from "@/site/pages/home";
import { ItemPage } from "@/site/pages/item";
import styles from "./shell.module.css";

const docPages = new Set(["instalacao", "temas", "licenca"]);

function NotFound() {
  return (
    <div className={styles.notFound}>
      <EmptyState
        label="Página não encontrada"
        icon={<Compass size={28} aria-hidden="true" />}
        title="Página não encontrada"
        description="Este endereço não existe neste site. Verifique o link ou volte ao início."
        action={<a className={styles.notFoundLink} href={href("/")}>Voltar ao início</a>}
      />
    </div>
  );
}

export default function Shell() {
  const route = useRoute();
  const [searchOpen, setSearchOpen] = useState(false);
  const [section, name] = route.segments;

  const item = section === "c" || section === "b" ? findItem(name) : undefined;
  const isDocs = section === "docs" && docPages.has(name ?? "");

  // O shell cuida só dos títulos que as páginas não cuidam (as demais setam o próprio).
  const managedTitle = useMemo(() => {
    if (route.path === "/componentes") return "Componentes";
    if (route.path === "/blocos") return "Blocos";
    if ((section === "c" || section === "b") && !item) return "Página não encontrada";
    return null;
  }, [route.path, section, item]);

  // Troca de página: volta ao topo sem animação e fecha a busca, se aberta.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
    setSearchOpen(false);
  }, [route.path]);

  useEffect(() => {
    if (!managedTitle) return;
    document.title = `${managedTitle} · ryan-ui`;
  }, [managedTitle]);

  // ⌘K / Ctrl+K em qualquer lugar; "/" fora de campos de texto.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); return; }
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) return;
      event.preventDefault();
      setSearchOpen(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  let page: ReactNode;
  switch (section) {
    case undefined: page = <HomePage />; break;
    case "componentes": page = <CatalogPage kind="component" route={route} />; break;
    case "blocos": page = <CatalogPage kind="block" route={route} />; break;
    case "c":
    case "b": page = item ? <ItemPage item={item} route={route} /> : <NotFound />; break;
    case "docs": page = isDocs ? <DocsPage page={name as DocsPageId} /> : <NotFound />; break;
    default: page = <NotFound />;
  }

  return (
    <div className={styles.app}>
      <SiteHeader route={route} onOpenSearch={() => setSearchOpen(true)} />
      <main className={styles.content}>{page}</main>
      <SiteFooter />
      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
