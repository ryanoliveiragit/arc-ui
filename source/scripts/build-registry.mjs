/**
 * Gera os arquivos estáticos que o site busca em runtime e que a CLI do shadcn serve:
 *   public/r/<nome>.json    um registro por item, com o conteúdo dos arquivos (schema registry-item do shadcn)
 *   public/api/<nome>.json  a API pública do item, quebrada de site/generated/api.json (rode build-api antes)
 *
 *   node scripts/build-registry.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const registry = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8"));

const dirR = path.join(root, "public", "r");
const dirApi = path.join(root, "public", "api");
// As pastas são inteiras geradas: limpa para nenhum arquivo de item removido do registro sobreviver.
fs.rmSync(dirR, { recursive: true, force: true });
fs.rmSync(dirApi, { recursive: true, force: true });
fs.mkdirSync(dirR, { recursive: true });
fs.mkdirSync(dirApi, { recursive: true });

let written = 0;
for (const item of registry.items) {
  const files = item.files.map(file => {
    const content = fs.readFileSync(path.join(root, file.path), "utf8");
    return { path: file.path, target: file.target, type: file.type, content };
  });
  const record = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.name,
    // O site e a CLI só entendem os tipos de arquivo do shadcn; "registry:item" vira componente.
    type: item.type === "registry:item" ? "registry:component" : item.type,
    description: item.description,
    dependencies: item.dependencies ?? [],
    registryDependencies: item.registryDependencies ?? [],
    files,
  };
  fs.writeFileSync(path.join(dirR, `${item.name}.json`), JSON.stringify(record) + "\n");
  written += 1;
}

const apiFile = path.join(root, "site", "generated", "api.json");
if (!fs.existsSync(apiFile)) {
  console.error("sem site/generated/api.json: rode `node scripts/build-api.mjs` antes.");
  process.exit(1);
}
const api = JSON.parse(fs.readFileSync(apiFile, "utf8"));
for (const [name, data] of Object.entries(api)) fs.writeFileSync(path.join(dirApi, `${name}.json`), JSON.stringify(data) + "\n");
console.log(`registro: ${written} itens em public/r/; api: ${Object.keys(api).length} itens em public/api/`);
