import { useEffect, useRef } from "react";
import { ScrollArea } from "@/registry/components/scroll-area/scroll-area";
import { categories, itemsByCategory, type CatalogItem } from "@/site/lib/catalog";
import { href, itemPath } from "@/site/lib/router";
import styles from "./sidebar.module.css";

/** A lista de itens ao lado da página de item, por categoria. O item aberto fica marcado e à vista. */
export function Sidebar({ current }: { current: CatalogItem }) {
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const active = viewport.current?.querySelector<HTMLElement>('[aria-current="page"]');
    const box = viewport.current;
    if (!active || !box) return;
    // Rola só a lista (não a página), e só se o item estiver fora de vista.
    const top = active.offsetTop, bottom = top + active.offsetHeight;
    if (top < box.scrollTop + 48 || bottom > box.scrollTop + box.clientHeight - 48) box.scrollTop = Math.max(0, top - box.clientHeight / 2);
  }, [current.name]);

  return (
    <nav className={styles.sidebar} aria-label="Itens">
      <ScrollArea className={styles.scroll} viewportRef={viewport} viewportClassName={styles.viewport} fade={32} label="Lista de itens">
        {categories.map(category => (
          <section key={category.id} className={styles.group}>
            <h2 className={styles.heading}><a href={href(category.id === "blocks" ? "/blocos" : "/componentes", category.id === "blocks" ? undefined : { cat: category.id })}>{category.label}</a></h2>
            <ul className={styles.list}>
              {itemsByCategory(category.id).map(item => (
                <li key={item.name}><a href={href(itemPath(item))} aria-current={item.name === current.name ? "page" : undefined}>{item.title}</a></li>
              ))}
            </ul>
          </section>
        ))}
      </ScrollArea>
    </nav>
  );
}
