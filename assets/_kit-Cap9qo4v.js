var e=`import { useCallback, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import styles from "./_kit.module.css";

/**
 * O elemento do palco ([data-demo-stage]) quando o demo roda dentro dele; null na página de preview avulsa.
 * Demos com sobreposição usam ele como fronteira: o popover/diálogo abre já aberto e fica contido no palco,
 * com o gatilho visível, em vez de posicionar à janela inteira (que cortaria na rolagem da página).
 */
export const demoStage = (): HTMLElement | null =>
  typeof document === "undefined" ? null : document.querySelector<HTMLElement>("[data-demo-stage]");

/**
 * Para sobreposições que o demo já mostra abertas: no carregamento o foco não entra no painel (a página não pula para o
 * demo nem tira o foco de quem está lendo); nas aberturas seguintes, pelo gatilho, o componente move o foco como sempre.
 * Passe o retorno em onOpenAutoFocus.
 */
export function useQuietFirstOpen() {
  const first = useRef(true);
  return useCallback((event: Event) => {
    if (first.current) { first.current = false; event.preventDefault(); }
  }, []);
}

/**
 * Reserva o espaço que a sobreposição aberta ocupa junto do gatilho. No palco centralizado, o conjunto gatilho + painel
 * fica no meio do quadro, sem sobra de um lado e sem o painel encostar na borda do outro.
 */
export function Room({ children, below = 0, above = 0, width, align = "center" }: { children: ReactNode; below?: number; above?: number; width?: number; align?: CSSProperties["alignItems"] }) {
  return <div style={{ display: "flex", flexDirection: "column", alignItems: align, paddingTop: above, paddingBottom: below, width: width ? "100%" : undefined, maxWidth: width }}>{children}</div>;
}

/**
 * Como o palco mostra um demo. Um demo pode exportar \`stage\` para mudar o padrão:
 *
 *   export const stage: DemoStage = { layout: "fill", frame: true, height: 640 };
 */
export interface DemoStage {
  /** "center": o demo fica centralizado com respiro (padrão dos componentes). "fill": ocupa a largura toda, sem respiro (padrão dos blocos). */
  layout?: "center" | "fill";
  /** Roda o demo num iframe. Use quando o item depende da largura da janela (media queries) ou se prende à janela com position: fixed. Padrão: só blocos. */
  frame?: boolean;
  /** Altura do palco em px. Padrão: 420 para componentes, 640 para blocos em iframe. */
  height?: number;
}

type Space = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
const space = (value: Space) => \`var(--space-\${value})\`;

interface LayoutProps {
  children: ReactNode;
  /** Espaço entre os filhos, na escala de tokens (--space-N). */
  gap?: Space;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  /** Largura máxima em px. */
  width?: number;
  className?: string;
  style?: CSSProperties;
}

/** Coluna. */
export function Stack({ children, gap = 4, align, justify, width, className, style }: LayoutProps) {
  return <div className={[styles.stack, className].filter(Boolean).join(" ")} style={{ gap: space(gap), alignItems: align, justifyContent: justify, width: width ? "100%" : undefined, maxWidth: width, ...style }}>{children}</div>;
}

/** Linha que quebra quando falta espaço. */
export function Row({ children, gap = 3, align = "center", justify, width, className, style, wrap = true }: LayoutProps & { wrap?: boolean }) {
  return <div className={[styles.row, className].filter(Boolean).join(" ")} style={{ gap: space(gap), alignItems: align, justifyContent: justify, flexWrap: wrap ? "wrap" : "nowrap", width: width ? "100%" : undefined, maxWidth: width, ...style }}>{children}</div>;
}

/** Texto pequeno e discreto: rótulo de uma variação ou o valor atual de um controle. */
export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={[styles.caption, className].filter(Boolean).join(" ")}>{children}</p>;
}

/** Um controle com rótulo em cima. */
export function Field({ label, children, width }: { label: ReactNode; children: ReactNode; width?: number }) {
  return <div className={styles.field} style={{ width: width ? "100%" : undefined, maxWidth: width }}><span className={styles.fieldLabel}>{label}</span>{children}</div>;
}

/** Cartão neutro para dar contexto a um componente que vive dentro de um painel. */
export function Surface({ children, width, padding = 5, className, style }: { children: ReactNode; width?: number; padding?: Space; className?: string; style?: CSSProperties }) {
  return <div className={[styles.surface, className].filter(Boolean).join(" ")} style={{ padding: space(padding), width: width ? "100%" : undefined, maxWidth: width, ...style }}>{children}</div>;
}
`;export{e as default};