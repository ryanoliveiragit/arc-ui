import { Fragment, useCallback, useEffect, useRef, useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref } from "react";
import { Check, CircleAlert, Copy } from "lucide-react";
import { writeClipboard } from "@/lib/use-copy-feedback";
import { findItem } from "@/site/lib/catalog";
import { href, itemPath } from "@/site/lib/router";
import styles from "./item-ui.module.css";

/**
 * Peças pequenas da página de item, no desenho do site (não são os componentes da biblioteca): seção com título, abas
 * sublinhadas e em pílula, controle segmentado discreto, botões de ícone, botão de copiar, chips de código e de tecla.
 */

export const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

/* ---------- Seção do documento ---------- */

interface SectionProps {
  /** Âncora da seção: vale no índice "Nesta página" e em `?secao=<id>` na URL. */
  id: string;
  title: string;
  /** Nome no índice, quando o título é longo demais para ele. */
  tocLabel?: string;
  /** Uma linha de apoio logo abaixo do título. */
  intro?: ReactNode;
  children: ReactNode;
}

/** Uma seção do documento. O índice "Nesta página" acha as seções pelo atributo `data-toc`, então só lista as que renderizaram. */
export function Section({ id, title, tocLabel, intro, children }: SectionProps) {
  return (
    <section id={id} className={styles.section} data-toc={tocLabel ?? title} aria-labelledby={`${id}-titulo`} tabIndex={-1}>
      <h2 id={`${id}-titulo`} className={styles.sectionTitle} data-intro={intro ? "true" : undefined}>{title}</h2>
      {intro ? <p className={styles.sectionIntro}>{intro}</p> : null}
      {children}
    </section>
  );
}

/* ---------- Texto com `código` e links de item ---------- */

/**
 * Texto dos guias: o que vem entre crases vira chip de código. Com `linkItems`, um nome de item entre crases
 * (`split-button`) vira link para a página dele.
 */
export function Rich({ text, linkItems = false, current }: { text: string; linkItems?: boolean; current?: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 0) return <Fragment key={index}>{part}</Fragment>;
        const target = linkItems && part !== current ? findItem(part) : undefined;
        return target
          ? <a key={index} className={styles.itemLink} href={href(itemPath(target))}><code className={styles.code}>{part}</code></a>
          : <code key={index} className={styles.code}>{part}</code>;
      })}
    </>
  );
}

export function InlineCode({ children }: { children: ReactNode }) {
  return <code className={styles.code}>{children}</code>;
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className={styles.kbd}>{children}</kbd>;
}

/** Lista de frases com marcador redondo. */
export function Bullets({ items, linkItems, current }: { items: string[]; linkItems?: boolean; current?: string }) {
  return <ul className={styles.bullets}>{items.map((text, index) => <li key={index}><Rich text={text} linkItems={linkItems} current={current} /></li>)}</ul>;
}

/**
 * Para áreas que rolam de lado (tabelas, código): elas entram na ordem do Tab só quando de fato rolam, para o teclado
 * alcançar o que está escondido sem ganhar paradas inúteis quando tudo cabe.
 */
export function useScrollableFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const check = () => setScrollable(element.scrollWidth > element.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
  }, []);
  return { ref, tabIndex: scrollable ? 0 : undefined };
}

/** Cartão de tabela: raio 18, borda de 1px. A tabela rola de lado dentro dele quando não cabe (celular). */
export function TableCard({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  const { ref, tabIndex } = useScrollableFocus<HTMLDivElement>();
  return <div ref={ref} className={cx(styles.tableCard, className)} role="group" aria-label={label} tabIndex={tabIndex}>{children}</div>;
}

/* ---------- Abas (sublinhadas ou em pílula) ---------- */

export interface TabItem<T extends string> { value: T; label: string; icon?: ReactNode }

export const tabId = (base: string, value: string) => `${base}-aba-${value}`;
export const panelId = (base: string, value: string) => `${base}-painel-${value}`;

interface TabListProps<T extends string> {
  /** Prefixo dos ids; o painel de cada aba usa `panelId(base, value)` e `aria-labelledby={tabId(base, value)}`. */
  base: string;
  label: string;
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "underline" | "pill";
  /** Só nas sublinhadas: linha fina de ponta a ponta sob as abas. */
  hairline?: boolean;
  /** Todas as abas mostram o mesmo painel (o conteúdo é que muda): `aria-controls` aponta para ele. */
  panel?: string;
  className?: string;
}

/** Lista de abas com foco itinerante: setas, Home e End mudam de aba; Tab sai da lista. */
export function TabList<T extends string>({ base, label, items, value, onChange, variant = "underline", hairline = false, panel, className }: TabListProps<T>) {
  const list = useRef<HTMLDivElement>(null);
  /** Nas pílulas que não cabem, de que lados ainda há aba escondida: a borda desse lado esmaece (máscara). */
  const [hidden, setHidden] = useState<"start" | "end" | "both" | undefined>();
  useEffect(() => {
    const element = list.current;
    if (!element || variant !== "pill") return;
    const check = () => {
      const start = element.scrollLeft > 1, end = element.scrollLeft + element.clientWidth < element.scrollWidth - 1;
      setHidden(start && end ? "both" : start ? "start" : end ? "end" : undefined);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    element.addEventListener("scroll", check, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener("scroll", check); };
  }, [variant, items.length]);
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = items.findIndex(item => item.value === value);
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % items.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    const target = items[next];
    if (!target) return;
    event.preventDefault();
    onChange(target.value);
    list.current?.querySelector<HTMLElement>(`#${CSS.escape(tabId(base, target.value))}`)?.focus();
  }
  return (
    <div ref={list} role="tablist" aria-label={label} className={cx(styles.tabs, className)} data-variant={variant} data-hairline={hairline ? "true" : undefined} data-hidden={hidden} onKeyDown={onKeyDown}>
      {items.map(item => {
        const selected = item.value === value;
        return (
          <button key={item.value} type="button" role="tab" id={tabId(base, item.value)} aria-selected={selected} aria-controls={panel ?? panelId(base, item.value)} tabIndex={selected ? 0 : -1} className={styles.tab} onClick={() => onChange(item.value)}>
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Controle segmentado discreto ---------- */

interface SegmentedProps<T extends string> {
  label: string;
  options: { value: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  /** Mostra só o ícone; o nome vira o rótulo acessível e a dica. */
  iconOnly?: boolean;
  className?: string;
}

/** Escolha única entre poucas opções, como um grupo de rádio: setas mudam a opção. */
export function Segmented<T extends string>({ label, options, value, onChange, iconOnly = false, className }: SegmentedProps<T>) {
  const group = useRef<HTMLDivElement>(null);
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = options.findIndex(option => option.value === value);
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % options.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + options.length) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    const target = options[next];
    if (!target) return;
    event.preventDefault();
    onChange(target.value);
    group.current?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
  }
  return (
    <div ref={group} role="radiogroup" aria-label={label} className={cx(styles.segmented, className)} data-icons={iconOnly ? "true" : undefined} onKeyDown={onKeyDown}>
      {options.map(option => {
        const checked = option.value === value;
        return (
          <button key={option.value} type="button" role="radio" aria-checked={checked} aria-label={iconOnly ? option.label : undefined} title={iconOnly ? option.label : undefined} tabIndex={checked ? 0 : -1} className={styles.segment} onClick={() => onChange(option.value)}>
            {option.icon}
            {iconOnly ? null : <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** O mesmo desenho, para navegação: cada opção é um link e a atual leva `aria-current`. */
export function SegmentedLinks({ label, options, className }: { label: string; options: { key: string; label: string; href: string; current: boolean; onClick?: (event: MouseEvent<HTMLAnchorElement>) => void }[]; className?: string }) {
  return (
    <div role="group" aria-label={label} className={cx(styles.segmented, className)}>
      {options.map(option => <a key={option.key} href={option.href} aria-current={option.current ? "true" : undefined} className={styles.segment} onClick={option.onClick}><span>{option.label}</span></a>)}
    </div>
  );
}

/* ---------- Botões ---------- */

/** Botão só com ícone. `aria-label` é obrigatório: é o nome do botão. */
export function IconButton({ className, children, ref, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { "aria-label": string; ref?: Ref<HTMLButtonElement> }) {
  return <button ref={ref} type="button" {...props} className={cx(styles.iconButton, className)}>{children}</button>;
}

/** Link com cara de botão de ícone. */
export function IconLink({ className, children, ref, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { "aria-label": string; ref?: Ref<HTMLAnchorElement> }) {
  return <a ref={ref} {...props} className={cx(styles.iconButton, className)}>{children}</a>;
}

export type CopyState = "idle" | "copied" | "error";

/** Copia um texto (ou o que uma função assíncrona devolver) e guarda o resultado por um instante, para o botão avisar. */
export function useCopy(duration = 1800) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = useCallback(async (value: string | (() => Promise<string>)) => {
    window.clearTimeout(timer.current);
    let ok = true;
    try {
      if (typeof value === "string") await writeClipboard(value);
      else await copyLater(value);
    } catch { ok = false; }
    setState(ok ? "copied" : "error");
    timer.current = window.setTimeout(() => setState("idle"), duration);
    return ok;
  }, [duration]);
  return { state, copy };
}

/**
 * Copia um texto que ainda vai chegar (um arquivo buscado na hora). O Safari só aceita escrever na área de transferência
 * dentro do gesto do usuário, então a promessa vai dentro do ClipboardItem; onde isso não existe, espera o texto e copia.
 */
async function copyLater(load: () => Promise<string>) {
  const pending = load();
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "text/plain": pending.then(text => new Blob([text], { type: "text/plain" })) })]);
      return;
    } catch { /* recusado: tenta o caminho simples abaixo */ }
  }
  await writeClipboard(await pending);
}

interface CopyButtonProps {
  value: string | (() => Promise<string>);
  /** Texto do botão; com `iconOnly`, é só o nome acessível. */
  label?: string;
  iconOnly?: boolean;
  className?: string;
}

/** Botão de copiar: ícone (e rótulo) trocam por "Copiado" por um instante, e o leitor de tela ouve o resultado. */
export function CopyButton({ value, label = "Copiar", iconOnly = false, className }: CopyButtonProps) {
  const { state, copy } = useCopy();
  const icon = state === "copied" ? <Check size={14} strokeWidth={2} aria-hidden="true" /> : state === "error" ? <CircleAlert size={14} strokeWidth={1.75} aria-hidden="true" /> : <Copy size={14} strokeWidth={1.75} aria-hidden="true" />;
  const feedback = state === "copied" ? "Copiado" : state === "error" ? "Não copiou" : "";
  return (
    <button type="button" className={cx(iconOnly ? styles.iconButton : styles.textButton, className)} data-state={state} aria-label={iconOnly ? label : undefined} title={iconOnly ? label : undefined} onClick={() => { void copy(value); }}>
      {icon}
      {/* O rótulo visível anuncia a troca; no botão só de ícone, um texto invisível faz esse papel sem mudar o nome do botão. */}
      {iconOnly ? <span className={styles.srOnly} role="status">{feedback}</span> : <span aria-live="polite">{feedback || label}</span>}
    </button>
  );
}
