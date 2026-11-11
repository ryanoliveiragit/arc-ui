import { useState, type CSSProperties } from "react";
import { categoryLabel, categoryTone, describe, versionsOf, type CatalogItem } from "@/site/lib/catalog";
import { href, itemPath } from "@/site/lib/router";
import { asset } from "@/site/lib/site-config";
import { useTheme } from "@/site/lib/theme";
import styles from "./item-card.module.css";

/** Etiqueta da categoria, no tom dela. */
export function CategoryTag({ category }: { category: string }) {
  const tone = categoryTone(category);
  return <span className={styles.tag} data-toned={tone ? "true" : undefined} style={tone ? ({ "--tone": tone } as CSSProperties) : undefined}>{categoryLabel(category)}</span>;
}

/** A pílula contornada dos itens escritos para o ryan-ui. A mesma da barra lateral. */
export function NewPill() {
  return <span className={styles.pill}>Novo</span>;
}

/** Um item da galeria: miniatura do demo no tema atual, nome, categoria e descrição. O cartão inteiro é o link. `layout="row"` é a visão em lista. */
export function ItemCard({ item, priority = false, layout = "card" }: { item: CatalogItem; priority?: boolean; layout?: "card" | "row" }) {
  const { theme } = useTheme();
  const [missing, setMissing] = useState<string | null>(null);
  const source = asset(`thumbs/${item.name}-${theme}.webp`);
  const versions = versionsOf(item).length;

  return (
    <a className={styles.card} data-layout={layout} href={href(itemPath(item))}>
      <span className={styles.thumb} data-kind={item.kind}>
        {missing === source
          ? <span className={styles.placeholder} aria-hidden="true">{item.title.slice(0, 1)}</span>
          : <img key={source} src={source} alt="" width={800} height={500} loading={priority ? "eager" : "lazy"} decoding="async" onError={() => setMissing(source)} />}
        {versions > 1 && layout === "card" ? <span className={styles.versions}>{versions} versões</span> : null}
      </span>
      <span className={styles.body}>
        <span className={styles.heading}>
          <span className={styles.title}>{item.title}</span>
          {item.isNew ? <NewPill /> : null}
          <CategoryTag category={item.category} />
        </span>
        <span className={styles.description}>{describe(item)}</span>
      </span>
    </a>
  );
}
