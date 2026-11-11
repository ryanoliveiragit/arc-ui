import { useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type Theme = "light" | "dark";
export const accents = ["lime", "neutral", "violet", "blue", "green", "amber", "orange", "coral", "rose"] as const;
export type Accent = (typeof accents)[number];

const THEME_KEY = "ryan-ui:theme";
const ACCENT_KEY = "ryan-ui:accent";

interface ThemeState { mode: ThemeMode; theme: Theme; accent: Accent }

const read = (key: string) => { try { return window.localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { window.localStorage.setItem(key, value); } catch { /* armazenamento bloqueado */ } };
const systemTheme = (): Theme => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
const isAccent = (value: string | null): value is Accent => accents.includes(value as Accent);

function initial(): ThemeState {
  const root = document.documentElement;
  const stored = read(THEME_KEY);
  const mode: ThemeMode = stored === "light" || stored === "dark" ? stored : "system";
  // O script do index.html já aplicou tema e cor (inclusive os da URL do preview); o estado parte do que está no <html>.
  const theme: Theme = root.dataset.theme === "dark" ? "dark" : "light";
  const accent = isAccent(root.dataset.accent ?? null) ? (root.dataset.accent as Accent) : "lime";
  return { mode, theme, accent };
}

let state: ThemeState = initial();
const listeners = new Set<() => void>();

function apply(next: ThemeState) {
  state = next;
  const root = document.documentElement;
  root.dataset.theme = next.theme;
  root.dataset.accent = next.accent;
  listeners.forEach(listener => listener());
}

export function setThemeMode(mode: ThemeMode) {
  write(THEME_KEY, mode);
  apply({ ...state, mode, theme: mode === "system" ? systemTheme() : mode });
}

export function setAccent(accent: Accent) {
  write(ACCENT_KEY, accent);
  apply({ ...state, accent });
}

/** Aplica sem salvar. Usado pelo preview, que recebe tema e cor da página que o hospeda. */
export function applyTheme(theme: Theme, accent?: Accent) {
  apply({ ...state, theme, accent: accent ?? state.accent });
}

// Outra aba ou o iframe de preview mudou o tema: acompanha.
window.addEventListener("storage", event => {
  if (event.key === THEME_KEY) { const mode: ThemeMode = event.newValue === "light" || event.newValue === "dark" ? event.newValue : "system"; apply({ ...state, mode, theme: mode === "system" ? systemTheme() : mode }); }
  if (event.key === ACCENT_KEY && isAccent(event.newValue)) apply({ ...state, accent: event.newValue });
});
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (state.mode === "system") apply({ ...state, theme: systemTheme() });
});

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const snapshot = () => state;

export function useTheme() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
