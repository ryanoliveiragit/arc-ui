import { BrandMark } from "@/site/components/brand";
import { items } from "@/site/lib/catalog";
import { href } from "@/site/lib/router";
import { asset, site } from "@/site/lib/site-config";
import styles from "./site-footer.module.css";

/** O rodapé grande, do início e da página de erro. */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.about}>
          <a className={styles.brand} href={href("/")}><BrandMark size={22} /><span>{site.name}</span></a>
          <p>{site.counts.components} componentes e {site.counts.blocks} blocos React com movimento. Código aberto, licença MIT.</p>
        </div>
        <nav className={styles.links} aria-label="Rodapé">
          <a href={href("/componentes")}>Componentes</a>
          <a href={href("/blocos")}>Blocos</a>
          <a href={href("/docs/instalacao")}>Instalação</a>
          <a href={href("/docs/temas")}>Temas</a>
          <a href={href("/docs/licenca")}>Licença e créditos</a>
        </nav>
      </div>
      <p className={styles.credit}>
        Baseado no núcleo open source do <a href={site.upstream.repository} target="_blank" rel="noreferrer">Arc</a>, de Elia Kuratli, sob licença MIT. O aviso de copyright original está em <a href={href("/docs/licenca")}>Licença e créditos</a>.
      </p>
    </footer>
  );
}

/** A linha de rodapé das páginas com barra lateral (galerias, docs, salvos): fica no fim da coluna de conteúdo. */
export function PageFooter() {
  return (
    <footer className={styles.line}>
      <span>{site.name} · {items.length} itens</span>
      <a href={asset("llms.txt")} target="_blank" rel="noreferrer">llms.txt</a>
    </footer>
  );
}
