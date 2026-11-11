/**
 * Gera site/generated/catalog.json a partir do registry.json: a lista de itens que o site mostra.
 * Também confere que todo item tem demo em site/demos/<nome>.tsx (avisa os que faltam; com --strict falha).
 *
 *   node scripts/build-catalog.mjs [--strict]
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const registry = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8"));
/** Descrições em português: um arquivo .json por lote em site/content/pt, no formato { "nome-do-item": "frase" }. */
const descriptionsDir = path.join(root, "site", "content", "pt");
const descriptions = {};
if (fs.existsSync(descriptionsDir)) for (const file of fs.readdirSync(descriptionsDir).filter(name => name.endsWith(".json")).sort()) Object.assign(descriptions, JSON.parse(fs.readFileSync(path.join(descriptionsDir, file), "utf8")));

/** Guias escritos por item (quando usar, teclado, acessibilidade…): um .json por lote em site/content/docs, no formato { "nome-do-item": { … } }. Ver scripts/build-docs.mjs. */
const guidesDir = path.join(root, "site", "content", "docs");
const guides = {};
if (fs.existsSync(guidesDir)) for (const file of fs.readdirSync(guidesDir).filter(name => name.endsWith(".json")).sort()) Object.assign(guides, JSON.parse(fs.readFileSync(path.join(guidesDir, file), "utf8")));

const items = [];
for (const item of registry.items) {
  if (item.type === "registry:item") continue; // fundação: tokens de design e de movimento
  const kind = item.meta?.kind === "block" ? "block" : "component";
  const ownFolder = `/${item.name}/`;
  items.push({
    name: item.name,
    title: item.title,
    description: item.description,
    descricao: descriptions[item.name] ?? null,
    kind,
    category: kind === "block" ? "blocks" : item.categories?.[0] ?? "special",
    tags: item.meta?.tags ?? [],
    dependencies: item.dependencies ?? [],
    requires: (item.registryDependencies ?? []).filter(dep => !dep.startsWith("ryan-")),
    files: item.files.map(file => file.path),
    ownFiles: item.files.map(file => file.path).filter(file => file.includes(ownFolder) || file.includes(`/${item.name}.`)),
    hasDemo: fs.existsSync(path.join(root, "site", "demos", `${item.name}.tsx`)),
    /** Escrito para o ryan-ui (não veio do núcleo importado). */
    isNew: item.meta?.origin === "ryan-ui" && item.meta?.batch !== "hero",
    /** Tem guia escrito em site/content/docs (publicado em public/docs/<nome>.json). */
    hasGuide: Boolean(guides[item.name]),
  });
}
items.sort((a, b) => a.title.localeCompare(b.title, "en"));

const upstream = JSON.parse(fs.readFileSync(path.join(root, "UPSTREAM.json"), "utf8"));
const catalog = { generatedFrom: "registry.json", upstream: { repository: upstream.repository, commit: upstream.commit, copyright: upstream.copyright }, counts: { components: items.filter(i => i.kind === "component").length, blocks: items.filter(i => i.kind === "block").length }, items };
fs.mkdirSync(path.join(root, "site", "generated"), { recursive: true });
fs.writeFileSync(path.join(root, "site", "generated", "catalog.json"), JSON.stringify(catalog, null, 1) + "\n");

const missing = items.filter(item => !item.hasDemo).map(item => item.name);
console.log(`catálogo: ${catalog.counts.components} componentes + ${catalog.counts.blocks} blocos; demos: ${items.length - missing.length}/${items.length}`);
if (missing.length) {
  console.log(`sem demo (${missing.length}): ${missing.join(", ")}`);
  if (process.argv.includes("--strict")) process.exit(1);
}
