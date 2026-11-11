import { useEffect } from "react";
import { Bookmark, ChevronRight, X } from "lucide-react";
import { ItemCard } from "@/site/components/item-card";
import { PageFooter } from "@/site/components/site-footer";
import { findItem, type CatalogItem } from "@/site/lib/catalog";
import { href } from "@/site/lib/router";
import { toggleSaved, useSaved } from "@/site/lib/saved";
import { site } from "@/site/lib/site-config";
import gallery from "./catalog.module.css";
import styles from "./saved.module.css";

/** Os itens que a pessoa salvou com o botão "Salvar" da página de item. Ficam só neste navegador (ver site/lib/saved.ts). */
export function SavedPage() {
  const saved = useSaved();
  const list = saved.map(findItem).filter((item): item is CatalogItem => Boolean(item));
  useEffect(() => { document.title = `Salvos · ${site.name}`; }, []);

  return (
    <div className={gallery.page}>
      <nav className={gallery.crumbs} aria-label="Você está em">
        <ol>
          <li><a href={href("/")}>Início</a></li>
          <li aria-hidden="true"><ChevronRight size={14} strokeWidth={1.75} /></li>
          <li aria-current="page">Salvos</li>
        </ol>
      </nav>
      <header className={gallery.header}>
        <h1>Salvos</h1>
        <p className={gallery.lead}>O que você guardou para ver depois. A lista fica só neste navegador: não há conta nem servidor.</p>
      </header>

      {list.length ? (
        <>
          <div className={styles.bar}>
            <p className={gallery.summary} role="status">{list.length} {list.length === 1 ? "item salvo" : "itens salvos"}</p>
          </div>
          <ul className={`${gallery.grid} ${styles.grid}`}>
            {list.map((item, index) => (
              <li key={item.name} className={styles.entry}>
                <ItemCard item={item} priority={index < 8} />
                <button type="button" className={styles.remove} aria-label={`Remover ${item.title} dos salvos`} title="Remover dos salvos" onClick={() => toggleSaved(item.name)}>
                  <X size={14} strokeWidth={2} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <section className={styles.empty} aria-labelledby="salvos-vazio">
          <span className={styles.emptyIcon} aria-hidden="true"><Bookmark size={20} strokeWidth={1.75} /></span>
          <h2 id="salvos-vazio">Nada salvo ainda</h2>
          <p>
            Em qualquer página de componente ou bloco, o botão <span className={styles.sample}><Bookmark size={13} strokeWidth={1.75} aria-hidden="true" />Salvar</span> fica
            ao lado do comando de instalação. O que você salvar aparece aqui e no contador da barra lateral.
          </p>
          <div className={styles.emptyActions}>
            <a className={styles.primary} href={href("/componentes")}>Ver componentes</a>
            <a className={styles.secondary} href={href("/blocos")}>Ver blocos</a>
          </div>
        </section>
      )}

      <PageFooter />
    </div>
  );
}
