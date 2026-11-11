import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Compass, TriangleAlert, X } from "lucide-react";
import { EmptyState } from "@/registry/components/empty-state/empty-state";
import { BrandMark } from "@/site/components/brand";
import SearchPalette from "@/site/components/search-palette";
import { SiteSidebar, useSidebarState } from "@/site/components/sidebar";
import { SiteFooter } from "@/site/components/site-footer";
import { SiteHeader } from "@/site/components/site-header";
import { findItem } from "@/site/lib/catalog";
import { href, useRoute } from "@/site/lib/router";
import { site } from "@/site/lib/site-config";
import { CatalogPage } from "@/site/pages/catalog";
import { DocsPage, type DocsPageId } from "@/site/pages/docs";
import { HomePage } from "@/site/pages/home";
import { SavedPage } from "@/site/pages/saved";
import styles from "./shell.module.css";

/** A página de item é a mais pesada e fica num chunk à parte: o início e as galerias não esperam por ela. */
const loadItemPage = () => import("@/site/pages/item");
const ItemPage = lazy(() => loadItemPage().then(module => ({ default: module.ItemPage })));

const docPages = new Set(["instalacao", "temas", "licenca"]);
/** A partir desta largura a barra lateral fica na página; abaixo dela, vira gaveta. */
const WIDE = "(min-width: 64rem)";

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    notify => { const list = window.matchMedia(query); list.addEventListener("change", notify); return () => list.removeEventListener("change", notify); },
    () => window.matchMedia(query).matches,
  );
}

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

/** Se uma página quebra ao carregar ou ao desenhar, o quadro (cabeçalho e barra lateral) continua de pé e a pessoa pode ir para outra. */
class PageBoundary extends Component<{ resetKey: string; children: ReactNode }, { error: Error | null; resetKey: string }> {
  state = { error: null as Error | null, resetKey: this.props.resetKey };
  static getDerivedStateFromError(error: unknown) { return { error: error instanceof Error ? error : new Error(String(error)) }; }
  static getDerivedStateFromProps(props: { resetKey: string }, state: { error: Error | null; resetKey: string }) {
    return props.resetKey === state.resetKey ? null : { error: null, resetKey: props.resetKey };
  }
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className={styles.notFound}>
        <EmptyState
          label="Esta página não abriu"
          icon={<TriangleAlert size={26} aria-hidden="true" />}
          title="Esta página não abriu"
          description="Algo quebrou ao carregar esta página. Recarregue ou escolha outra na navegação."
          action={<button type="button" className={styles.notFoundLink} onClick={() => window.location.reload()}>Recarregar</button>}
        />
        <pre className={styles.errorDetail}>{error.message}</pre>
      </div>
    );
  }
}

/**
 * A casca do site. Decide o quadro de cada rota:
 *   início e 404            cabeçalho + conteúdo de ponta a ponta + rodapé grande
 *   galerias, itens, docs   cabeçalho + barra lateral + <main> (a página põe o próprio respiro)
 * A barra lateral fica montada enquanto se navega entre essas páginas, então rolagem, grupos recolhidos, filtro e busca continuam.
 */
export default function Shell() {
  const route = useRoute();
  const wide = useMediaQuery(WIDE);
  const sidebar = useSidebarState();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const railSearch = useRef<HTMLInputElement>(null);
  const drawerSearch = useRef<HTMLInputElement>(null);
  /** A gaveta foi aberta pela tecla "/": o foco vai para a busca dela. */
  const focusDrawerSearch = useRef(false);
  const [section, name] = route.segments;

  const item = section === "c" || section === "b" ? findItem(name) : undefined;
  let page: ReactNode;
  let framed = true;
  if (section === undefined) { page = <HomePage />; framed = false; }
  else if (section === "componentes") page = <CatalogPage key="component" kind="component" route={route} />;
  else if (section === "blocos") page = <CatalogPage key="block" kind="block" route={route} />;
  else if (item) page = <ItemPage item={item} route={route} />;
  else if (section === "docs" && docPages.has(name ?? "")) page = <DocsPage page={name as DocsPageId} />;
  else if (section === "salvos" && route.segments.length === 1) page = <SavedPage />;
  else { page = <NotFound />; framed = false; }
  const missing = !framed && section !== undefined;

  useEffect(() => { if (missing) document.title = `Página não encontrada · ${site.name}`; }, [missing]);

  // Troca de página: volta ao topo sem animação e fecha busca e gaveta, se abertas.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
    setSearchOpen(false);
    setMenuOpen(false);
  }, [route.path]);

  // Abrir um item mostra o grupo dele na barra lateral, mesmo que estivesse recolhido.
  const { openGroup } = sidebar;
  const itemName = item?.name, itemCategory = item?.category;
  useEffect(() => { if (itemName && itemCategory) openGroup(itemCategory); }, [itemName, itemCategory, openGroup]);

  // Com a casca no ar, a página de item já vai sendo baixada: o primeiro clique num item não espera.
  useEffect(() => { const timer = window.setTimeout(() => { loadItemPage().catch(() => { /* a falha aparece quando a página for aberta */ }); }, 1500); return () => window.clearTimeout(timer); }, []);

  // A gaveta só existe em telas estreitas.
  useEffect(() => { if (wide) setMenuOpen(false); }, [wide]);

  // ⌘K / Ctrl+K abre a busca geral; "/" (fora de campos de texto) leva o foco à busca da barra lateral.
  const state = useRef({ wide, framed, menuOpen });
  useEffect(() => { state.current = { wide, framed, menuOpen }; }, [wide, framed, menuOpen]);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setMenuOpen(false); setSearchOpen(true); return; }
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) return;
      event.preventDefault();
      const now = state.current;
      if (now.menuOpen) drawerSearch.current?.focus();
      else if (!now.wide) { focusDrawerSearch.current = true; setMenuOpen(true); }
      else if (now.framed) railSearch.current?.focus();
      else setSearchOpen(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className={styles.app}>
      <button type="button" className={styles.skip} onClick={() => mainRef.current?.focus()}>Pular para o conteúdo</button>
      <SiteHeader route={route} menuOpen={menuOpen} menuRef={menuButton} onOpenMenu={() => { focusDrawerSearch.current = false; setMenuOpen(true); }} onOpenSearch={() => setSearchOpen(true)} />

      {framed ? (
        <div className={styles.frame}>
          {wide ? <SiteSidebar route={route} state={sidebar} searchRef={railSearch} /> : null}
          <main ref={mainRef} className={styles.main} tabIndex={-1}>
            <PageBoundary resetKey={route.path}><Suspense fallback={<div className={styles.pending} aria-busy="true" />}>{page}</Suspense></PageBoundary>
          </main>
        </div>
      ) : (
        <>
          <main ref={mainRef} className={styles.content} tabIndex={-1}><PageBoundary resetKey={route.path}>{page}</PageBoundary></main>
          <SiteFooter />
        </>
      )}

      {wide ? null : (
        <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className={styles.overlay} />
            <DialogPrimitive.Content
              className={styles.drawer}
              aria-describedby={undefined}
              onOpenAutoFocus={event => { if (focusDrawerSearch.current) { event.preventDefault(); focusDrawerSearch.current = false; drawerSearch.current?.focus(); } }}
              onCloseAutoFocus={event => { event.preventDefault(); menuButton.current?.focus(); }}
              // Com texto na busca, o Esc primeiro limpa a busca; só depois fecha a gaveta.
              onEscapeKeyDown={event => { if (sidebar.query && document.activeElement === drawerSearch.current) event.preventDefault(); }}
            >
              <div className={styles.drawerHeader}>
                <DialogPrimitive.Title className={styles.drawerTitle}><BrandMark size={22} /><span>{site.name}</span><span className={styles.visuallyHidden}>: menu</span></DialogPrimitive.Title>
                <DialogPrimitive.Close className={styles.drawerClose} aria-label="Fechar o menu"><X size={18} strokeWidth={1.75} aria-hidden="true" /></DialogPrimitive.Close>
              </div>
              <SiteSidebar route={route} state={sidebar} variant="drawer" searchRef={drawerSearch} onNavigate={closeMenu} />
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}

      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
