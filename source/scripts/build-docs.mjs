/**
 * Publica os guias escritos de cada item: junta site/content/docs/*.json (um arquivo por lote, { "nome-do-item": guia })
 * e grava um arquivo por item em public/docs/<nome>.json, que a página de item busca quando o catálogo diz hasGuide.
 *
 *   node scripts/build-docs.mjs [--check]     (--check só valida, não grava)
 *
 * Formato do guia (todas as listas são opcionais; lista vazia ou ausente = a seção não aparece):
 *   quandoUsar: string[]          quando o item é a escolha certa
 *   quandoEvitar: string[]        quando escolher outra coisa; cite o outro item pelo nome entre crases, por exemplo `split-button`
 *   teclado: { teclas: string[], acao: string }[]
 *   acessibilidade: string[]
 *   movimento: string[]
 *   responsivo: string[]
 *   desempenho: string[]
 *   notasIA: string[]             dicas para quem pede este item a um assistente de código
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(root, "site", "content", "docs");
const outDir = path.join(root, "public", "docs");
const checkOnly = process.argv.includes("--check");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "site", "generated", "catalog.json"), "utf8"));
const names = new Set(catalog.items.map(item => item.name));
const lists = ["quandoUsar", "quandoEvitar", "acessibilidade", "movimento", "responsivo", "desempenho", "notasIA"];
const problems = [];
const guides = {};

if (fs.existsSync(sourceDir)) for (const file of fs.readdirSync(sourceDir).filter(name => name.endsWith(".json")).sort()) {
  let data;
  try { data = JSON.parse(fs.readFileSync(path.join(sourceDir, file), "utf8")); } catch (error) { problems.push(`${file}: JSON inválido (${error.message})`); continue; }
  for (const [name, guide] of Object.entries(data)) {
    const where = `${file} › ${name}`;
    if (!names.has(name)) { problems.push(`${where}: item não existe no catálogo`); continue; }
    if (guides[name]) problems.push(`${where}: item repetido em outro arquivo`);
    for (const key of Object.keys(guide)) if (![...lists, "teclado"].includes(key)) problems.push(`${where}: campo desconhecido "${key}"`);
    for (const key of lists) {
      const value = guide[key];
      if (value === undefined) continue;
      if (!Array.isArray(value) || value.some(entry => typeof entry !== "string" || !entry.trim())) problems.push(`${where}: "${key}" deve ser uma lista de frases`);
      else for (const entry of value) {
        if (entry.length > 260) problems.push(`${where}: frase longa demais em "${key}" (${entry.length} caracteres, máximo 260)`);
        for (const match of entry.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)*)`/g)) if (key === "quandoEvitar" && match[1].includes("-") && !names.has(match[1])) problems.push(`${where}: "${match[1]}" citado em quandoEvitar não é um item do catálogo`);
      }
    }
    if (guide.teclado !== undefined && (!Array.isArray(guide.teclado) || guide.teclado.some(row => !row || !Array.isArray(row.teclas) || !row.teclas.length || row.teclas.some(key => typeof key !== "string") || typeof row.acao !== "string" || !row.acao.trim()))) problems.push(`${where}: "teclado" deve ser uma lista de { teclas: string[], acao: string }`);
    if (!guide.quandoUsar?.length) problems.push(`${where}: falta "quandoUsar"`);
    guides[name] = guide;
  }
}

if (!checkOnly) {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, guide] of Object.entries(guides)) fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(guide) + "\n");
}
const missing = catalog.items.filter(item => !guides[item.name]).map(item => item.name);
console.log(`guias: ${Object.keys(guides).length} de ${catalog.items.length} itens${checkOnly ? " (só validação)" : " em public/docs/"}${missing.length ? `; sem guia: ${missing.length}` : ""}`);
if (problems.length) { console.log(`problemas (${problems.length}):\n  ${problems.slice(0, 60).join("\n  ")}`); process.exit(1); }
