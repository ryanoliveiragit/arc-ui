/**
 * Lê o código-fonte de cada item e extrai a API pública: o que o arquivo exporta, as interfaces de props (com o
 * comentário de cada prop) e os valores padrão. Sai em site/generated/api.json, que alimenta a aba "API" do site.
 * A leitura é só sintática (parser do TypeScript), então é rápida e não depende de tipos resolvidos.
 *
 *   node scripts/build-api.mjs [--digest <pasta>]   # --digest também grava um resumo .md por item
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const registry = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8"));
const digestIndex = process.argv.indexOf("--digest");
const digestDir = digestIndex > -1 ? path.resolve(process.argv[digestIndex + 1]) : null;

const clean = text => text.replace(/\s+/g, " ").trim();
const docOf = (node, source) => {
  const ranges = ts.getLeadingCommentRanges(source.text, node.getFullStart()) ?? [];
  const last = ranges.at(-1);
  if (!last) return "";
  const raw = source.text.slice(last.pos, last.end);
  if (!raw.startsWith("/**")) return "";
  return clean(raw.replace(/^\/\*\*+/, "").replace(/\*+\/$/, "").replace(/^\s*\* ?/gm, ""));
};
const isExported = node => (ts.canHaveModifiers(node) ? ts.getModifiers(node) ?? [] : []).some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword);

/** Os valores padrão que um componente dá às props na desestruturação: `{ size = "md" }` → { size: '"md"' }. */
function defaultsOf(fn, source) {
  const first = fn.parameters?.[0];
  if (!first || !ts.isObjectBindingPattern(first.name)) return null;
  const defaults = {};
  for (const element of first.name.elements) {
    if (!element.initializer || element.dotDotDotToken) continue;
    const prop = (element.propertyName ?? element.name).getText(source);
    const value = clean(element.initializer.getText(source));
    defaults[prop] = value.length > 48 ? `${value.slice(0, 45)}…` : value;
  }
  return { defaults, propsType: first.type ? clean(first.type.getText(source)) : null };
}

/** Acha a função dentro de `forwardRef(function X(...))`, `memo(...)` ou uma arrow function. */
function functionIn(node) {
  if (!node) return null;
  if (ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isFunctionDeclaration(node)) return node;
  if (ts.isCallExpression(node)) for (const argument of node.arguments) { const found = functionIn(argument); if (found) return found; }
  if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isSatisfiesExpression?.(node)) return functionIn(node.expression);
  return null;
}

function readFile(file) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const exports = [], types = [], functions = new Map();
  let defaultExport = null;
  const exportedLater = new Set();
  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement) && !statement.moduleSpecifier && statement.exportClause && ts.isNamedExports(statement.exportClause)) for (const element of statement.exportClause.elements) exportedLater.add((element.propertyName ?? element.name).text);
    if (ts.isExportAssignment(statement) && ts.isIdentifier(statement.expression)) defaultExport = statement.expression.text;
  }
  for (const statement of source.statements) {
    const exported = isExported(statement);
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
      const name = statement.name.text;
      if (!exported && !exportedLater.has(name) && !/Props$/.test(name)) continue;
      const entry = { name, exported: exported || exportedLater.has(name), doc: docOf(statement, source), file };
      if (ts.isInterfaceDeclaration(statement)) {
        entry.kind = "interface";
        entry.extends = (statement.heritageClauses ?? []).flatMap(clause => clause.types.map(type => clean(type.getText(source))));
        entry.members = statement.members.filter(member => ts.isPropertySignature(member) || ts.isMethodSignature(member)).map(member => ({
          name: member.name.getText(source).replace(/^["']|["']$/g, ""),
          optional: Boolean(member.questionToken),
          type: ts.isPropertySignature(member) ? clean(member.type?.getText(source) ?? "unknown") : clean(member.getText(source).replace(/^[^(]*/, "")),
          doc: docOf(member, source),
        }));
      } else {
        entry.kind = "type";
        entry.text = clean(statement.type.getText(source));
        if (ts.isTypeLiteralNode(statement.type)) entry.members = statement.type.members.filter(ts.isPropertySignature).map(member => ({ name: member.name.getText(source), optional: Boolean(member.questionToken), type: clean(member.type?.getText(source) ?? "unknown"), doc: docOf(member, source) }));
      }
      types.push(entry);
      continue;
    }
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      const name = statement.name.text;
      functions.set(name, { doc: docOf(statement, source), ...(defaultsOf(statement, source) ?? {}) });
      if (exported || exportedLater.has(name)) exports.push(name);
      if (exported && (ts.getModifiers(statement) ?? []).some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword)) defaultExport = name;
      continue;
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        const name = declaration.name.text, fn = functionIn(declaration.initializer);
        if (fn) functions.set(name, { doc: docOf(statement, source), ...(defaultsOf(fn, source) ?? {}) });
        if (exported || exportedLater.has(name)) exports.push(name);
      }
    }
  }
  return { exports, types, functions, defaultExport };
}

const api = {};
for (const item of registry.items) {
  if (item.type === "registry:item") continue;
  const own = item.files.map(file => file.path).filter(file => /\.tsx?$/.test(file) && (file.includes(`/${item.name}/`) || /theme-switch/.test(item.name) && file.includes("/theme-switch/")));
  const entry = { exports: [], components: [], types: [] };
  for (const file of own) {
    const info = readFile(file);
    for (const name of info.exports) {
      const fn = info.functions.get(name);
      const kind = /^use[A-Z]/.test(name) ? "hook" : /^[A-Z]/.test(name) && fn ? "component" : fn ? "function" : "const";
      entry.exports.push({ name, kind, file, default: info.defaultExport === name || undefined });
      if (kind === "component") {
        const propsName = fn.propsType?.match(/^[A-Z]\w*/)?.[0] ?? `${name}Props`;
        entry.components.push({ name, doc: fn.doc ?? "", props: propsName, defaults: fn.defaults ?? {}, file });
      }
    }
    entry.types.push(...info.types);
  }
  api[item.name] = entry;
}
fs.mkdirSync(path.join(root, "site", "generated"), { recursive: true });
fs.writeFileSync(path.join(root, "site", "generated", "api.json"), JSON.stringify(api) + "\n");
const componentCount = Object.values(api).reduce((sum, entry) => sum + entry.components.length, 0);
const empty = Object.entries(api).filter(([, entry]) => !entry.components.length).map(([name]) => name);
console.log(`api: ${Object.keys(api).length} itens, ${componentCount} componentes exportados${empty.length ? `; sem componente detectado: ${empty.join(", ")}` : ""}`);

if (digestDir) {
  fs.mkdirSync(digestDir, { recursive: true });
  for (const item of registry.items) {
    const entry = api[item.name];
    if (!entry) continue;
    const lines = [`# ${item.name} (${item.meta?.kind}) — ${item.title}`, "", item.description, "", `files: ${item.files.map(file => file.path).join(", ")}`, `npm: ${(item.dependencies ?? []).join(", ") || "-"}`, "", "## exports", ...entry.exports.map(e => `- ${e.name} (${e.kind}${e.default ? ", default" : ""}) — ${e.file}`), "", "## components"];
    for (const component of entry.components) {
      lines.push(`### <${component.name}> props: ${component.props}`);
      if (component.doc) lines.push(component.doc);
      const defaults = Object.entries(component.defaults).map(([k, v]) => `${k}=${v}`).join(", ");
      if (defaults) lines.push(`defaults: ${defaults}`);
    }
    lines.push("", "## types");
    for (const type of entry.types) {
      if (type.kind === "interface") {
        lines.push(`${type.exported ? "export " : ""}interface ${type.name}${type.extends.length ? ` extends ${type.extends.join(", ")}` : ""} {`);
        for (const member of type.members) lines.push(`  ${member.doc ? `/** ${member.doc} */ ` : ""}${member.name}${member.optional ? "?" : ""}: ${member.type};`);
        lines.push("}");
      } else lines.push(`${type.exported ? "export " : ""}type ${type.name} = ${type.text};`);
    }
    fs.writeFileSync(path.join(digestDir, `${item.name}.md`), lines.join("\n") + "\n");
  }
  console.log(`resumos em ${digestDir}`);
}
