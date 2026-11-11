import { setThemeMode, type Theme } from "@/site/lib/theme";

export type ThemeTransition = "reveal" | "eclipse" | "split" | "rise";

interface ViewTransitionLike { ready: Promise<void>; finished: Promise<void> }
type StartViewTransition = (update: () => void) => ViewTransitionLike;

const EASE = "cubic-bezier(.22, 1, .36, 1)";

/**
 * Troca o tema com uma transição de página inteira (View Transitions API). O tema novo é revelado por cima do antigo:
 *   reveal   um círculo que cresce a partir do botão
 *   eclipse  um disco que entra pela lateral e cobre a tela
 *   split    duas metades que se abrem a partir do centro
 *   rise     sobe a partir da base
 * Sem suporte do navegador, ou com "reduzir movimento" ligado, a troca é imediata.
 */
export function switchTheme(next: Theme, trigger?: HTMLElement | null, variant: ThemeTransition = "reveal") {
  const start = (document as Document & { startViewTransition?: StartViewTransition }).startViewTransition?.bind(document);
  if (!start || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setThemeMode(next); return; }

  const root = document.documentElement;
  const box = trigger?.getBoundingClientRect();
  const x = box ? box.left + box.width / 2 : window.innerWidth / 2;
  const y = box ? box.top + box.height / 2 : 0;
  const far = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const cover = Math.hypot(window.innerWidth, window.innerHeight);

  const frames: Record<ThemeTransition, { clipPath: string[]; duration: number }> = {
    reveal: { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${far}px at ${x}px ${y}px)`], duration: 560 },
    eclipse: { clipPath: [`circle(${cover}px at ${-cover}px 50%)`, `circle(${cover}px at 50% 50%)`], duration: 720 },
    split: { clipPath: ["inset(0 50% 0 50%)", "inset(0 0 0 0)"], duration: 520 },
    rise: { clipPath: ["inset(100% 0 0 0)", "inset(0 0 0 0)"], duration: 520 },
  };

  root.dataset.themeTransition = variant;
  const transition = start(() => setThemeMode(next));
  transition.ready.then(() => {
    const { clipPath, duration } = frames[variant];
    root.animate({ clipPath }, { duration, easing: EASE, pseudoElement: "::view-transition-new(root)" });
  }).catch(() => { /* transição pulada pelo navegador: o tema já foi aplicado */ });
  transition.finished.finally(() => { delete root.dataset.themeTransition; });
}
