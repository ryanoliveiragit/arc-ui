import { catalog } from "@/site/lib/catalog";

/** Dados do site num lugar só. `repository` fica vazio até o projeto ter um repositório público. */
export const site = {
  name: "ryan-ui",
  tagline: "Componentes e blocos React com movimento, prontos para copiar.",
  repository: "",
  upstream: catalog.upstream,
  counts: catalog.counts,
} as const;

/** Endereço base de onde o site está servido, com barra no fim. Funciona em qualquer subpasta. */
export const siteBase = () => new URL("./", window.location.href.split("#")[0]).href;

/** Endereço do item no registro, para a CLI do shadcn. */
export const registryUrl = (name: string) => `${siteBase()}r/${name}.json`;

/** Caminho relativo de um arquivo estático do site (public/). */
export const asset = (path: string) => `./${path.replace(/^\.?\//, "")}`;

export const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
