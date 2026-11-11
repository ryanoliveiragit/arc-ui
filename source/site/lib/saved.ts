import { useSyncExternalStore } from "react";

/**
 * Itens salvos pela pessoa (o botão "Salvar" da página de item e a lista "Salvos" da barra lateral).
 * Fica só neste navegador, em localStorage; não há conta nem servidor.
 */
const KEY = "ryan-ui:saved";

function read(): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
  } catch { return []; }
}

let state: string[] = read();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());

function write(next: string[]) {
  state = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* armazenamento bloqueado: vale só nesta visita */ }
  emit();
}

// Outra aba salvou ou removeu: acompanha.
window.addEventListener("storage", event => { if (event.key === KEY) { state = read(); emit(); } });

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const snapshot = () => state;

/** Nomes dos itens salvos, do mais recente para o mais antigo. */
export function useSaved(): string[] {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
export const isSaved = (name: string) => state.includes(name);
/** Salva ou remove; devolve true quando o item ficou salvo. */
export function toggleSaved(name: string): boolean {
  const saved = state.includes(name);
  write(saved ? state.filter(entry => entry !== name) : [name, ...state]);
  return !saved;
}
