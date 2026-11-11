import { useEffect, useState } from "react";

type State<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; error: Error };

const cache = new Map<string, Promise<unknown>>();

function load<T>(url: string): Promise<T> {
  const cached = cache.get(url) as Promise<T> | undefined;
  if (cached) return cached;
  const request = fetch(url).then(response => {
    if (!response.ok) throw new Error(`${response.status} ao buscar ${url}`);
    return response.json() as Promise<T>;
  });
  cache.set(url, request);
  request.catch(() => cache.delete(url));
  return request;
}

/** Busca um JSON estático do site e guarda em cache. `url` nulo não busca nada. */
export function useJson<T>(url: string | null): State<T> {
  const [state, setState] = useState<{ url: string | null; value: State<T> }>({ url, value: { status: "loading" } });
  useEffect(() => {
    if (!url) return;
    let alive = true;
    load<T>(url).then(data => { if (alive) setState({ url, value: { status: "ready", data } }); }).catch((error: unknown) => { if (alive) setState({ url, value: { status: "error", error: error instanceof Error ? error : new Error(String(error)) } }); });
    return () => { alive = false; };
  }, [url]);
  return state.url === url ? state.value : { status: "loading" };
}

/** Texto bruto por import dinâmico (por exemplo o código de um demo). */
export function useText(loader: (() => Promise<string>) | undefined, key: string): State<string> {
  const [state, setState] = useState<{ key: string; value: State<string> }>({ key, value: { status: "loading" } });
  useEffect(() => {
    if (!loader) { setState({ key, value: { status: "error", error: new Error("sem arquivo") } }); return; }
    let alive = true;
    loader().then(data => { if (alive) setState({ key, value: { status: "ready", data } }); }).catch((error: unknown) => { if (alive) setState({ key, value: { status: "error", error: error instanceof Error ? error : new Error(String(error)) } }); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- o loader é estável por chave
  }, [key]);
  return state.key === key ? state.value : { status: "loading" };
}
