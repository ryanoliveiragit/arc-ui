import data from "@/site/generated/catalog.json";
import versionGroups from "@/site/content/versions.json";

export type ItemKind = "component" | "block";

export interface CatalogItem {
  name: string;
  title: string;
  /** Descrição original, em inglês. */
  description: string;
  /** Descrição em português, quando existe. */
  descricao: string | null;
  kind: ItemKind;
  category: string;
  tags: string[];
  /** Pacotes npm que o item usa. */
  dependencies: string[];
  /** Outros itens do ryan-ui que o item usa. */
  requires: string[];
  files: string[];
  ownFiles: string[];
  hasDemo: boolean;
  /** Escrito para o ryan-ui (não veio do núcleo importado). */
  isNew: boolean;
  /** Tem guia escrito (quando usar, teclado, acessibilidade…) em docs/<nome>.json. */
  hasGuide: boolean;
}

export const catalog = data as { upstream: { repository: string; commit: string; copyright: string }; counts: { components: number; blocks: number }; items: CatalogItem[] };
export const items: CatalogItem[] = catalog.items;

const byName = new Map(items.map(item => [item.name, item]));
export const findItem = (name: string | undefined) => (name ? byName.get(name) : undefined);

/** Categorias na ordem em que aparecem no site, com o rótulo em português. */
export const categories = [
  { id: "actions", label: "Ações" },
  { id: "inputs", label: "Entradas" },
  { id: "disclosure", label: "Revelação" },
  { id: "feedback", label: "Feedback" },
  { id: "data", label: "Dados" },
  { id: "text", label: "Texto" },
  { id: "ai", label: "Agentes de IA" },
  { id: "games", label: "Jogos" },
  { id: "special", label: "Especial" },
  { id: "blocks", label: "Blocos" },
] as const;
export type CategoryId = (typeof categories)[number]["id"];
/** Tom de cada categoria (tokens --tone-* de foundation.css), para o ponto e a etiqueta. Sem tom: neutro. */
const tones: Record<string, string> = { actions: "var(--tone-teal)", inputs: "var(--tone-sky)", data: "var(--tone-violet)", feedback: "var(--tone-amber)", disclosure: "var(--tone-green)", text: "var(--tone-rose)", ai: "var(--tone-orchid)", games: "var(--tone-amber)" };
export const categoryTone = (id: string): string | undefined => tones[id];
export const categoryLabel = (id: string) => categories.find(category => category.id === id)?.label ?? id;

export const itemsByCategory = (id: string) => items.filter(item => item.category === id);
export const describe = (item: CatalogItem) => item.descricao ?? item.description;

/** Item anterior e próximo dentro da mesma lista (componentes ou blocos), na ordem das categorias. */
const ordered = categories.flatMap(category => itemsByCategory(category.id));
export function neighbours(item: CatalogItem) {
  const index = ordered.findIndex(entry => entry.name === item.name);
  return { previous: index > 0 ? ordered[index - 1] : undefined, next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined };
}

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Busca simples por nome, descrição (pt e en), categoria e tags. Todos os termos precisam aparecer. */
export function searchItems(query: string, pool: CatalogItem[] = items): CatalogItem[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return pool;
  const scored: { item: CatalogItem; score: number }[] = [];
  for (const item of pool) {
    const title = normalize(item.title), name = item.name;
    const rest = normalize(`${item.description} ${item.descricao ?? ""} ${categoryLabel(item.category)} ${item.category} ${item.tags.join(" ")}`);
    let score = 0, matched = true;
    for (const term of terms) {
      if (title.startsWith(term) || name.startsWith(term)) score += 6;
      else if (title.includes(term) || name.includes(term)) score += 4;
      else if (rest.includes(term)) score += 1;
      else { matched = false; break; }
    }
    if (matched) scored.push({ item, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title)).map(entry => entry.item);
}

/**
 * Versões de um item: itens do catálogo que são a mesma peça em outro desenho ou comportamento (toast simples ou em pilha,
 * os quatro alternadores de tema…). Cada versão continua um item instalável; a página de item deixa escolher entre elas.
 * A lista vem de site/content/versions.json: { "grupo": [{ "name": "toast", "label": "Padrão" }, …] }. Uma entrada com `variant`
 * é uma versão dentro do mesmo item (o demo recebe a prop `variant`); sem `variant`, a versão é outro item do catálogo.
 */
export interface ItemVersion { item: CatalogItem; label: string; /** Variante do mesmo item (passada ao demo); ausente quando a versão é outro item. */ variant?: string }
const groups: ItemVersion[][] = Object.values(versionGroups as Record<string, { name: string; label: string; variant?: string }[]>)
  .map(group => group.flatMap(entry => { const item = byName.get(entry.name); return item ? [{ item, label: entry.label, variant: entry.variant }] : []; }))
  .filter(group => group.length > 1);
const groupOf = new Map<string, ItemVersion[]>();
for (const group of groups) for (const entry of group) groupOf.set(entry.item.name, group);
/** As versões do grupo do item, na ordem do arquivo. Um item sem grupo devolve só ele mesmo. */
export const versionsOf = (item: CatalogItem): ItemVersion[] => groupOf.get(item.name) ?? [{ item, label: item.title }];

/**
 * Itens relacionados, para o fim da página de item: primeiro os que ele usa, depois os que o usam, depois os da mesma
 * categoria com mais tags em comum. As outras versões do mesmo grupo ficam de fora (têm a própria faixa na página).
 */
export function relatedItems(item: CatalogItem, limit = 4): CatalogItem[] {
  const sameGroup = new Set(versionsOf(item).map(version => version.item.name));
  const picked = new Map<string, CatalogItem>();
  const add = (entry: CatalogItem | undefined) => { if (entry && entry.name !== item.name && !sameGroup.has(entry.name) && !picked.has(entry.name)) picked.set(entry.name, entry); };
  item.requires.forEach(name => add(byName.get(name)));
  items.filter(entry => entry.requires.includes(item.name)).forEach(add);
  const shared = (entry: CatalogItem) => entry.tags.filter(tag => item.tags.includes(tag)).length;
  items.filter(entry => entry.category === item.category).sort((a, b) => shared(b) - shared(a) || a.title.localeCompare(b.title)).forEach(add);
  return [...picked.values()].slice(0, limit);
}
