import type { ComponentType } from "react";
import type { DemoStage } from "./_kit";

/** O que um arquivo de demo exporta: o componente como default e, se quiser, `stage`. */
export interface DemoModule {
  /** `variant` chega quando a página de item pede uma versão do mesmo item (ver site/content/versions.json). Demos sem versões ignoram. */
  default: ComponentType<{ variant?: string }>;
  stage?: DemoStage;
}

/** Um chunk por demo: só o demo aberto é baixado. Arquivos que começam com "_" são apoio, não demos. */
const loaders = import.meta.glob<DemoModule>(["./*.tsx", "!./_*.tsx"]);

const cache = new Map<string, Promise<DemoModule>>();

export const hasDemo = (name: string) => `./${name}.tsx` in loaders;

export function loadDemo(name: string): Promise<DemoModule> {
  const cached = cache.get(name);
  if (cached) return cached;
  const loader = loaders[`./${name}.tsx`];
  const promise = loader ? loader() : Promise.reject(new Error(`Sem demo para "${name}".`));
  cache.set(name, promise);
  // Uma falha de rede não fica presa no cache: a próxima tentativa baixa de novo.
  promise.catch(() => cache.delete(name));
  return promise;
}

/** Padrão do palco por tipo de item, combinado com o que o demo exporta. */
export function resolveStage(kind: "component" | "block", stage: DemoStage | undefined): Required<DemoStage> {
  const block = kind === "block";
  const frame = stage?.frame ?? block;
  return { layout: stage?.layout ?? (block ? "fill" : "center"), frame, height: stage?.height ?? (frame ? 640 : 420) };
}
