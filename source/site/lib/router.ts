import { useSyncExternalStore } from "react";

/** Rotas por hash (#/c/button), para o site funcionar em hospedagem estática sem regra de servidor. */
export interface Route {
  /** Caminho sem o "#", por exemplo "/c/button". */
  path: string;
  segments: string[];
  query: URLSearchParams;
}

function parse(hash: string): Route {
  const raw = hash.replace(/^#/, "") || "/";
  const [pathPart = "/", queryPart = ""] = raw.split("?");
  const path = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  return { path, segments: path.split("/").filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(queryPart) };
}

let cached: { hash: string; route: Route } | null = null;
function current(): Route {
  const hash = window.location.hash;
  if (!cached || cached.hash !== hash) cached = { hash, route: parse(hash) };
  return cached.route;
}

function subscribe(notify: () => void) {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, current, current);
}

/** Monta o href de uma rota: href("/c/button") → "#/c/button". */
export function href(path: string, query?: Record<string, string | undefined>): string {
  const entries = Object.entries(query ?? {}).filter((entry): entry is [string, string] => entry[1] !== undefined && entry[1] !== "");
  const search = entries.length ? `?${new URLSearchParams(entries).toString()}` : "";
  return `#${path}${search}`;
}

export function navigate(path: string, options: { replace?: boolean; query?: Record<string, string | undefined> } = {}) {
  const target = href(path, options.query);
  if (options.replace) window.location.replace(target);
  else window.location.hash = target.slice(1);
}

/** Caminho da página de um item do catálogo. */
export const itemPath = (item: { kind: "component" | "block"; name: string }) => `/${item.kind === "block" ? "b" : "c"}/${item.name}`;
