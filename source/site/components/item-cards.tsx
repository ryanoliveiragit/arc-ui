import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Section } from "@/site/components/item-ui";
import { categoryLabel, describe, neighbours, type CatalogItem, type ItemVersion } from "@/site/lib/catalog";
import { href, itemPath } from "@/site/lib/router";
import { asset } from "@/site/lib/site-config";
import { useTheme } from "@/site/lib/theme";
import styles from "./item-cards.module.css";

/** Os cartões do fim da página de item: outras versões, relacionados, "mais como este" e o par anterior / próximo. */

export const versionKey = (version: ItemVersion) => `${version.item.name}:${version.variant ?? ""}`;
/** Endereço de uma versão: outra página de item, ou a mesma com ?v=variante. */
export const versionHref = (version: ItemVersion) => href(itemPath(version.item), { v: version.variant });

/** Miniatura do demo no tema atual. Se o arquivo não existe, fica a inicial do nome. */
function Thumb({ source, fallback }: { source: string; fallback: string }) {
  const [missing, setMissing] = useState<string | null>(null);
  return (
    <span className={styles.thumb}>
      {missing === source
        ? <span aria-hidden="true">{fallback.slice(0, 1)}</span>
        : <img key={source} src={source} alt="" width={800} height={500} loading="lazy" decoding="async" onError={() => setMissing(source)} />}
    </span>
  );
}

/** As outras versões do item, em miniatura. */
export function VersionsSection({ versions, active }: { versions: ItemVersion[]; active: ItemVersion }) {
  const { theme } = useTheme();
  const others = versions.filter(version => versionKey(version) !== versionKey(active));
  if (!others.length) return null;
  return (
    <Section id="versoes" title="Outras versões">
      <div className={styles.wrap}><ul className={styles.grid}>
        {others.map(version => (
          <li key={versionKey(version)}>
            <a className={styles.card} href={versionHref(version)}>
              <Thumb source={asset(`thumbs/${version.item.name}${version.variant ? `--${version.variant}` : ""}-${theme}.webp`)} fallback={version.label} />
              <span className={styles.head}><span className={styles.title}>{version.label}</span></span>
              <span className={styles.text}>{version.variant ? version.item.title : describe(version.item)}</span>
            </a>
          </li>
        ))}
      </ul></div>
    </Section>
  );
}

const kindLabel = (item: CatalogItem) => (item.kind === "block" ? "Bloco" : "Componente");

export function RelatedSection({ items }: { items: CatalogItem[] }) {
  if (!items.length) return null;
  return (
    <Section id="relacionados" title="Relacionados">
      <div className={styles.wrap}><ul className={styles.grid}>
        {items.map(item => (
          <li key={item.name}>
            <a className={styles.card} data-kind="related" href={href(itemPath(item))}>
              <span className={styles.head}><span className={styles.title}>{item.title}</span><span className={styles.kind}>{kindLabel(item)}</span></span>
              <span className={styles.body}><span className={styles.text}>{describe(item)}</span><ArrowRight className={styles.arrow} size={14} strokeWidth={1.75} aria-hidden="true" /></span>
            </a>
          </li>
        ))}
      </ul></div>
    </Section>
  );
}

/** Itens da mesma categoria, com a miniatura em cima. */
export function MoreSection({ items }: { items: CatalogItem[] }) {
  const { theme } = useTheme();
  if (!items.length) return null;
  return (
    <Section id="mais" title="Mais como este">
      <div className={styles.wrap}><ul className={styles.grid}>
        {items.map(item => (
          <li key={item.name}>
            <a className={styles.card} href={href(itemPath(item))}>
              <Thumb source={asset(`thumbs/${item.name}-${theme}.webp`)} fallback={item.title} />
              <span className={styles.head}>
                <span className={styles.title}>{item.title}</span>
                {item.isNew ? <span className={styles.pill}>Novo</span> : null}
                <span className={styles.kind}>{categoryLabel(item.category)}</span>
              </span>
              <span className={styles.text}>{describe(item)}</span>
            </a>
          </li>
        ))}
      </ul></div>
    </Section>
  );
}

/** Anterior à esquerda, próximo à direita. Com um só, ele fica do próprio lado. */
export function Pager({ item }: { item: CatalogItem }) {
  const { previous, next } = neighbours(item);
  if (!previous && !next) return null;
  return (
    <nav className={styles.pager} aria-label="Item anterior e próximo">
      {previous ? (
        <a className={styles.pagerLink} data-side="previous" href={href(itemPath(previous))}>
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className={styles.pagerText}><span className={styles.pagerLabel}>Anterior</span><span className={styles.pagerTitle}>{previous.title}</span></span>
        </a>
      ) : null}
      {next ? (
        <a className={styles.pagerLink} data-side="next" href={href(itemPath(next))}>
          <span className={styles.pagerText}><span className={styles.pagerLabel}>Próximo</span><span className={styles.pagerTitle}>{next.title}</span></span>
          <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </a>
      ) : null}
    </nav>
  );
}
