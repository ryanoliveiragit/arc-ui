/**
 * Junta os itens novos do ryan-ui (registry/_new/<lote>.json, cada um uma lista de itens no formato do registry.json)
 * ao registry.json e refaz o catálogo do site. Pode rodar quantas vezes quiser: um item com o mesmo nome é substituído.
 *
 *   node scripts/merge-new-items.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const file = path.join(root, "registry.json");
const dir = path.join(root, "registry", "_new");
const registry = JSON.parse(fs.readFileSync(file, "utf8"));
const added = new Map();
const problems = [];
for (const name of fs.readdirSync(dir).filter(entry => entry.endsWith(".json")).sort()) {
  let list;
  try { list = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")); } catch (error) { problems.push(`${name}: JSON inválido (${error.message})`); continue; }
  if (!Array.isArray(list)) { problems.push(`${name}: esperava uma lista de itens`); continue; }
  for (const item of list) {
    const missing = ["name", "type", "title", "description", "categories", "files", "meta"].filter(key => item?.[key] == null);
    if (missing.length) { problems.push(`${name}: item ${item?.name ?? "?"} sem ${missing.join(", ")}`); continue; }
    const absent = item.files.map(entry => entry.path).filter(entry => !fs.existsSync(path.join(root, entry)));
    if (absent.length) { problems.push(`${name}: ${item.name} aponta para arquivo que não existe: ${absent.join(", ")}`); continue; }
    added.set(item.name, { ...item, meta: { ...item.meta, origin: "ryan-ui", batch: name.replace(/\.json$/, "") } });
  }
}
const kept = registry.items.filter(item => !added.has(item.name));
const next = { ...registry, items: [...kept, ...added.values()] };
const temp = `${file}.${process.pid}.tmp`;
fs.writeFileSync(temp, JSON.stringify(next, null, 2) + "\n");
fs.renameSync(temp, file);
console.log(`registry.json: ${next.items.length} itens (${added.size} novos de registry/_new)`);
if (problems.length) console.log(`problemas (${problems.length}):\n  ${problems.join("\n  ")}`);
execFileSync(process.execPath, [path.join(root, "scripts", "build-catalog.mjs")], { stdio: "inherit" });
process.exit(problems.length ? 1 : 0);
