/**
 * Importa o núcleo open source (MIT) do Arc para o ryan-ui e troca o nome da marca.
 *
 *   node scripts/import-upstream.mjs <pasta do clone de kuratlielia/arc-library>
 *
 * Roda uma vez. Depois disso `registry/` e `lib/` deste projeto são a fonte da verdade: consertos são feitos aqui.
 * O LICENSE do upstream é copiado sem alteração (a licença MIT exige manter o aviso de copyright).
 */
import fs from "node:fs";
import path from "node:path";

const upstream = process.argv[2];
if (!upstream || !fs.existsSync(path.join(upstream, "registry.json"))) {
  console.error("uso: node scripts/import-upstream.mjs <pasta do arc-library>");
  process.exit(1);
}
const root = path.resolve(import.meta.dirname, "..");
if (fs.existsSync(path.join(root, "registry")) && !process.argv.includes("--force")) {
  console.error("registry/ já existe. Use --force para importar por cima (apaga consertos locais).");
  process.exit(1);
}

/** Regras de troca de nome, na ordem. Cada uma: [regex, substituto]. */
const rules = [
  [/\bArc(ProviderProps|Provider|Context|LinkProps|LinkComponent|Link|ImageProps|ImageComponent|Image|Img|Anchor|Components|Mark)\b/g, "Ryan$1"],
  [/\buseArc(Link|Image)\b/g, "useRyan$1"],
  [/--arc-gradient/g, "--ryan-gradient"],
  [/\barc-provider\b/g, "ryan-provider"],
  [/@\/components\/arc\//g, "@/components/ryan-ui/"],
  [/\bcomponents\/arc\b/g, "components/ryan-ui"],
  [/\barc-announcement\b/g, "ryan-ui-announcement"],
  [/\ban Arc (account|button)\b/g, "a ryan-ui $1"],
  [/\bArc (arch|mark)\b/g, "ryan-ui mark"],
  [/\bArc\b/g, "ryan-ui"],
];
/** `type Arc` no donut-chart é um arco geométrico, não a marca. */
const skipWordRule = file => file.includes("donut-chart");

function rebrand(file, text) {
  let next = text;
  for (const [pattern, replacement] of rules) {
    if (pattern.source === "\\bArc\\b" && skipWordRule(file)) continue;
    next = next.replace(pattern, replacement);
  }
  return next;
}

const stats = { files: 0, changed: 0 };
function copyTree(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const targetName = entry.name.replace(/^arc-provider/, "ryan-provider");
    const target = path.join(to, targetName);
    if (entry.isDirectory()) { fs.mkdirSync(target, { recursive: true }); copyTree(source, target); continue; }
    stats.files++;
    if (/\.(tsx?|css|mjs|json)$/.test(entry.name)) {
      const text = fs.readFileSync(source, "utf8");
      const next = rebrand(source, text);
      if (next !== text) stats.changed++;
      fs.writeFileSync(target, next);
    } else fs.copyFileSync(source, target);
  }
}

for (const dir of ["registry", "lib"]) {
  fs.rmSync(path.join(root, dir), { recursive: true, force: true });
  fs.mkdirSync(path.join(root, dir), { recursive: true });
  copyTree(path.join(upstream, dir), path.join(root, dir));
}
fs.copyFileSync(path.join(upstream, "LICENSE"), path.join(root, "LICENSE"));

/** registry.json: nome do registro, nomes dos itens de fundação, destinos de instalação e links. */
const registry = JSON.parse(fs.readFileSync(path.join(upstream, "registry.json"), "utf8"));
const itemName = name => name.replace(/^arc-foundation$/, "ryan-foundation").replace(/^arc-motion-tokens$/, "ryan-motion-tokens");
registry.name = "ryan-ui";
registry.homepage = "{{SITE_URL}}";
for (const item of registry.items) {
  item.name = itemName(item.name);
  item.title = rebrand("registry.json", item.title);
  item.description = rebrand("registry.json", item.description);
  item.registryDependencies = (item.registryDependencies ?? []).map(dep => itemName(dep.replace("https://uiarc.dev/r/", "").replace(/\.json$/, "")));
  if (!item.registryDependencies.length) delete item.registryDependencies;
  for (const file of item.files) {
    file.path = file.path.replace("lib/arc-provider", "lib/ryan-provider");
    file.target = file.target.replace("@components/arc/", "@components/ryan-ui/").replace("arc-provider", "ryan-provider");
  }
  delete item.docs;
  if (item.meta) { delete item.meta.docs; delete item.meta.markdown; delete item.meta.tier; }
}
fs.writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry, null, 2) + "\n");

const upstreamCommit = fs.existsSync(path.join(upstream, ".git")) ? fs.readFileSync(path.join(upstream, ".git", fs.readFileSync(path.join(upstream, ".git", "HEAD"), "utf8").trim().replace("ref: ", "")), "utf8").trim() : "desconhecido";
fs.writeFileSync(path.join(root, "UPSTREAM.json"), JSON.stringify({ repository: "https://github.com/kuratlielia/arc-library", license: "MIT", copyright: "Copyright (c) 2026 Elia Kuratli", commit: upstreamCommit, importedAt: new Date().toISOString().slice(0, 10), items: registry.items.length }, null, 2) + "\n");
console.log(`importado: ${stats.files} arquivos, ${stats.changed} com troca de nome, ${registry.items.length} itens no registro, commit ${upstreamCommit.slice(0, 12)}`);
