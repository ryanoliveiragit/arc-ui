import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { AnimatedCounter } from "@/registry/components/animated-counter/animated-counter";
import { CopyButton } from "@/registry/components/copy-button/copy-button";
import { Skeleton } from "@/registry/components/skeleton/skeleton";
import { DemoMount } from "@/site/components/demo-mount";
import { ItemCard } from "@/site/components/item-card";
import { categories, findItem, items, itemsByCategory, type CatalogItem } from "@/site/lib/catalog";
import { href, itemPath } from "@/site/lib/router";
import { registryUrl, site } from "@/site/lib/site-config";
import { accents } from "@/site/lib/theme";
import styles from "./home.module.css";

/** O mosaico da página inicial: demos que rodam ao vivo. `area` é a posição na grade (ver home.module.css). */
const bento = [
  { name: "toast-stack", area: "a" },
  { name: "text-morph", area: "b" },
  { name: "elastic-slider", area: "c" },
  { name: "billing-toggle", area: "d" },
  { name: "animated-counter", area: "e" },
  { name: "morph-select", area: "f" },
  { name: "segmented-control", area: "g" },
] as const;
const featuredNames = ["hero-section", "command-palette", "sign-in", "plan-comparison", "chat-app", "dynamic-island", "stats-band", "faq-section", "blog-grid", "site-header"];

/** Fica visível (e anima a entrada) quando chega perto da tela; some do DOM de novo quando `unmount` e sai da tela. */
function useNear<T extends HTMLElement>(rootMargin: string, once: boolean) {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") { setNear(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setNear(true); if (once) observer.disconnect(); } else if (!once) setNear(false);
    }, { rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, once]);
  return [ref, near] as const;
}

/** Seção que entra com um leve deslize quando aparece na tela. */
function Reveal({ children, className, labelledBy }: { children: ReactNode; className?: string; labelledBy?: string }) {
  const [ref, seen] = useNear<HTMLElement>("0px 0px -12% 0px", true);
  return <section ref={ref} className={[styles.reveal, className].filter(Boolean).join(" ")} data-seen={seen ? "true" : undefined} aria-labelledby={labelledBy}>{children}</section>;
}

/** Um demo ao vivo dentro do mosaico. Só monta perto da tela, para a página ficar leve. */
function BentoCell({ item, area, index }: { item: CatalogItem; area: string; index: number }) {
  const [ref, near] = useNear<HTMLDivElement>("240px 0px", false);
  return (
    <article className={styles.cell} style={{ gridArea: area, "--i": index } as CSSProperties}>
      <a className={styles.cellLabel} href={href(itemPath(item))}>{item.title}<ArrowRight size={13} aria-hidden="true" /></a>
      <div ref={ref} className={styles.cellStage}>
        {near ? <DemoMount name={item.name} fallback={<div className={styles.cellLoading}><Skeleton label="Carregando demo" lines={2} /></div>} renderError={() => <p className={styles.cellError}>Este demo não abriu aqui. <a href={href(itemPath(item))}>Abrir a página dele</a>.</p>} /> : null}
      </div>
    </article>
  );
}

/** Faixa de nomes rolando sem parar. É decoração: leitores de tela ignoram (a galeria tem a lista de verdade). */
function NameMarquee({ names, reverse }: { names: string[]; reverse?: boolean }) {
  return (
    <div className={styles.marqueeRow} data-reverse={reverse ? "true" : undefined}>
      {[0, 1].map(copy => <ul key={copy} className={styles.marqueeTrack}>{names.map(name => <li key={name}>{name}</li>)}</ul>)}
    </div>
  );
}

export function HomePage() {
  useEffect(() => { document.title = "ryan-ui · componentes e blocos React com movimento"; }, []);
  const cells = bento.map(entry => ({ ...entry, item: findItem(entry.name) })).filter((entry): entry is typeof entry & { item: CatalogItem } => Boolean(entry.item?.hasDemo));
  const featured = featuredNames.map(findItem).filter((item): item is CatalogItem => Boolean(item)).slice(0, 8);
  const command = `npx shadcn@latest add ${registryUrl("button")}`;
  const titles = items.map(item => item.title);
  const half = Math.ceil(titles.length / 2);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}><span className={styles.dot} aria-hidden="true" />Código aberto · MIT · React 19</p>
        <h1>Componentes React com <span className={styles.keep}><mark>movimento</mark>,</span> prontos para copiar.</h1>
        <p className={styles.lead}>{site.counts.components} componentes e {site.counts.blocks} blocos em CSS modules e tokens de design. A CLI do shadcn copia o código para o seu projeto, e ele é seu.</p>
        <div className={styles.actions}>
          <a className={styles.primary} href={href("/componentes")}>Ver componentes<ArrowRight size={16} aria-hidden="true" /></a>
          <a className={styles.secondary} href={href("/docs/instalacao")}>Como instalar</a>
        </div>
        <div className={styles.command}>
          <code><span aria-hidden="true">$ </span>{command}</code>
          <CopyButton value={command} label="Copiar comando" iconOnly variant="plain" />
        </div>
      </section>

      {cells.length ? (
        <section className={styles.bento} aria-label="Demos ao vivo">
          {cells.map((cell, index) => <BentoCell key={cell.name} item={cell.item} area={cell.area} index={index} />)}
        </section>
      ) : null}

      <div className={styles.marquee} aria-hidden="true">
        <NameMarquee names={titles.slice(0, half)} />
        <NameMarquee names={titles.slice(half)} reverse />
      </div>

      <Reveal className={styles.stats}>
        <dl>
          <div><dd><AnimatedCounter value={site.counts.components} animateOnView locale="pt-BR" /></dd><dt>componentes</dt></div>
          <div><dd><AnimatedCounter value={site.counts.blocks} animateOnView locale="pt-BR" /></dd><dt>blocos</dt></div>
          <div><dd><AnimatedCounter value={accents.length} animateOnView locale="pt-BR" /></dd><dt>cores de destaque</dt></div>
          <div><dd><AnimatedCounter value={2} animateOnView locale="pt-BR" /></dd><dt>temas: escuro e claro</dt></div>
        </dl>
      </Reveal>

      <Reveal className={styles.section} labelledBy="home-featured">
        <header className={styles.sectionHeader}>
          <div>
            <h2 id="home-featured">Destaques</h2>
            <p>Abra qualquer um para ver o demo ao vivo, o código, as props e a instalação.</p>
          </div>
          <a className={styles.more} href={href("/blocos")}>Ver todos<ArrowRight size={15} aria-hidden="true" /></a>
        </header>
        <ul className={styles.cardGrid}>{featured.map(item => <li key={item.name}><ItemCard item={item} /></li>)}</ul>
      </Reveal>

      <Reveal className={styles.section} labelledBy="home-categories">
        <header className={styles.sectionHeader}>
          <div>
            <h2 id="home-categories">Por categoria</h2>
            <p>Do botão ao gráfico, tudo com teclado, tema claro e escuro, e respeito a “reduzir movimento”.</p>
          </div>
        </header>
        <ul className={styles.categories}>
          {categories.map(category => {
            const list = itemsByCategory(category.id);
            if (!list.length) return null;
            return (
              <li key={category.id}>
                <a className={styles.category} href={category.id === "blocks" ? href("/blocos") : href("/componentes", { cat: category.id })}>
                  <span className={styles.categoryCount}>{list.length}</span>
                  <strong>{category.label}</strong>
                  <small>{list.slice(0, 4).map(item => item.title).join(", ")}{list.length > 4 ? "…" : ""}</small>
                </a>
              </li>
            );
          })}
        </ul>
      </Reveal>

      <Reveal className={styles.closing}>
        <h2>Comece por um componente</h2>
        <p>Abra a página dele, teste o demo e instale com um comando. São {items.length} itens para escolher.</p>
        <div className={styles.actions}>
          <a className={styles.primary} href={href("/componentes")}>Explorar a galeria<ArrowRight size={16} aria-hidden="true" /></a>
          <a className={styles.secondary} href={href("/docs/temas")}>Temas e tokens</a>
        </div>
      </Reveal>
    </div>
  );
}
