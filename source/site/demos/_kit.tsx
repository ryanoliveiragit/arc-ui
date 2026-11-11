import type { CSSProperties, ReactNode } from "react";
import styles from "./_kit.module.css";

/**
 * Como o palco mostra um demo. Um demo pode exportar `stage` para mudar o padrão:
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
const space = (value: Space) => `var(--space-${value})`;

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
