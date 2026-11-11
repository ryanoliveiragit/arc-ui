import { useCallback, useEffect, useId, useRef, useState, type MouseEvent, type RefObject } from "react";
import { ArrowUp, FileText } from "lucide-react";
import styles from "./toc.module.css";

/**
 * O índice "Nesta página": lista as seções que existem no documento, marca a que está à vista (scroll spy) e rola até
 * a que for clicada. As seções são os filhos diretos do documento com `data-toc="Nome"` e um `id`.
 */

export interface TocEntry { id: string; label: string }

export interface TocState {
  /** Seções presentes agora, na ordem do documento. */
  entries: TocEntry[];
  /** Id da seção à vista. */
  active: string | null;
  /** Rola até a seção. `pin` mantém a seção no lugar por um instante, enquanto o conteúdo acima dela ainda carrega. Devolve false se ela não existe. */
  goTo: (id: string, options?: { smooth?: boolean; pin?: boolean; focus?: boolean }) => boolean;
  /** Marca a primeira seção e trava o scroll spy enquanto a página volta ao topo. */
  toTop: () => void;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sectionIn = (root: HTMLElement, id: string) => root.querySelector<HTMLElement>(`:scope > #${CSS.escape(id)}[data-toc]`);
/** Quanto tempo sem evento de rolagem conta como "a rolagem acabou". */
const SETTLE = 160;

export function useToc(container: RefObject<HTMLElement | null>): TocState {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [active, setActive] = useState<string | null>(null);
  /** Durante uma rolagem pedida por clique, o scroll spy fica parado: a marca já está no destino e não pisca pelo caminho. */
  const locked = useRef(false);
  const lockTimer = useRef(0);
  const stopPin = useRef<(() => void) | null>(null);

  const lock = useCallback(() => {
    locked.current = true;
    window.clearTimeout(lockTimer.current);
    lockTimer.current = window.setTimeout(() => { locked.current = false; }, SETTLE);
  }, []);

  // As seções entram e saem conforme os dados chegam: a lista acompanha os filhos do documento.
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const read = () => {
      const next = [...root.querySelectorAll<HTMLElement>(":scope > [data-toc][id]")].map(section => ({ id: section.id, label: section.dataset.toc ?? section.id }));
      setEntries(current => (current.length === next.length && current.every((entry, index) => entry.id === next[index]!.id && entry.label === next[index]!.label) ? current : next));
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { childList: true });
    return () => observer.disconnect();
  }, [container]);

  // Scroll spy: vale a última seção cujo topo já passou de uma linha pouco abaixo do cabeçalho; no fim da página, a última.
  useEffect(() => {
    const root = container.current;
    if (!root || !entries.length) return;
    let frame = 0;
    const compute = () => {
      frame = 0;
      if (locked.current) return;
      const sections = entries.map(entry => sectionIn(root, entry.id)).filter((section): section is HTMLElement => Boolean(section));
      const first = sections[0];
      if (!first) return;
      const line = (parseFloat(getComputedStyle(first).scrollMarginTop) || 0) + 72;
      let current = first.id;
      for (const section of sections) { if (section.getBoundingClientRect().top <= line) current = section.id; else break; }
      const page = root.parentElement ?? root;
      if (window.scrollY > 0 && page.getBoundingClientRect().bottom <= window.innerHeight + 2) current = sections[sections.length - 1]!.id;
      setActive(current);
    };
    const onScroll = () => {
      if (locked.current) { lock(); return; }
      if (!frame) frame = requestAnimationFrame(compute);
    };
    compute();
    // `capture` pega a rolagem de qualquer elemento, caso a casca do site role um contêiner em vez da janela.
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll, { capture: true }); window.removeEventListener("resize", onScroll); };
  }, [container, entries, lock]);

  useEffect(() => () => { window.clearTimeout(lockTimer.current); stopPin.current?.(); }, []);

  const goTo = useCallback<TocState["goTo"]>((id, options = {}) => {
    const root = container.current;
    const target = root ? sectionIn(root, id) : null;
    if (!root || !target) return false;
    stopPin.current?.();
    setActive(id);
    lock();
    const behavior: ScrollBehavior = options.smooth && !reducedMotion() ? "smooth" : "instant";
    target.scrollIntoView({ behavior, block: "start" });
    if (options.focus) target.focus({ preventScroll: true });
    if (options.pin) {
      // O que carrega acima da seção empurra a página: realinha até assentar, ou até a pessoa mexer.
      const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
      const observer = new ResizeObserver(() => { lock(); target.scrollIntoView({ behavior: "instant", block: "start" }); });
      const stop = () => { observer.disconnect(); window.clearTimeout(timer); events.forEach(type => window.removeEventListener(type, stop, { capture: true })); stopPin.current = null; };
      const timer = window.setTimeout(stop, 2500);
      observer.observe(root);
      events.forEach(type => window.addEventListener(type, stop, { capture: true, passive: true }));
      stopPin.current = stop;
    }
    return true;
  }, [container, lock]);

  const toTop = useCallback(() => {
    stopPin.current?.();
    const first = entries[0];
    if (first) setActive(first.id);
    lock();
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "instant" : "smooth" });
  }, [entries, lock]);

  return { entries, active, goTo, toTop };
}

interface TocProps {
  toc: TocState;
  /** Endereço de cada seção, para o link funcionar também em nova aba e em "copiar link". */
  hrefFor: (id: string) => string;
  /** Avisa que a seção foi escolhida no índice (a página atualiza a URL). */
  onNavigate?: (id: string) => void;
  markdownHref: string;
  onTop: () => void;
  className?: string;
}

export function Toc({ toc, hrefFor, onNavigate, markdownHref, onTop, className }: TocProps) {
  const titleId = useId();
  function onClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    // Clique com tecla de modificação (nova aba, nova janela) segue o link normal.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // O foco vai junto para a seção, como numa âncora comum: o próximo Tab continua de lá.
    if (toc.goTo(id, { smooth: true, focus: true })) onNavigate?.(id);
  }
  return (
    <aside className={[styles.rail, className].filter(Boolean).join(" ")}>
      <nav aria-labelledby={titleId}>
        <p id={titleId} className={styles.title}>Nesta página</p>
        <ul className={styles.list}>
          {toc.entries.map(entry => (
            <li key={entry.id}>
              <a className={styles.link} href={hrefFor(entry.id)} aria-current={toc.active === entry.id ? "location" : undefined} onClick={event => onClick(event, entry.id)}>{entry.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.extra}>
        <a className={styles.extraLink} href={markdownHref} target="_blank" rel="noreferrer"><FileText size={13} strokeWidth={1.75} aria-hidden="true" /><span>Ver em Markdown</span></a>
        <button type="button" className={styles.extraLink} onClick={onTop}><span>Voltar ao topo</span><ArrowUp size={13} strokeWidth={1.75} aria-hidden="true" /></button>
      </div>
    </aside>
  );
}
