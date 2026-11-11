/**
 * Gera as miniaturas da galeria: uma captura webp de 800×500 de cada demo, nos dois temas.
 * O ItemCard procura em public/thumbs/<nome>-<tema>.webp.
 *
 *   node scripts/build-thumbs.mjs [opções] [itens...]
 *
 *   --url <base>      site já no ar (padrão: http://127.0.0.1:5199/, o `npm run dev`)
 *   --out <pasta>     pasta de saída (padrão: public/thumbs)
 *   --jobs <n>        páginas em paralelo (padrão: 4)
 *   --quality <0-100> qualidade do webp (padrão: 80)
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const option = (name, fallback) => { const index = args.indexOf(`--${name}`); if (index === -1) return fallback; const value = args[index + 1]; args.splice(index, 2); return value; };
const base = option("url", "http://127.0.0.1:5199/").replace(/\/?$/, "/");
const outDir = path.resolve(option("out", "public/thumbs"));
const concurrency = Number(option("jobs", 4));
const quality = Number(option("quality", 80));
const themes = ["light", "dark"];

/** O mesmo Chromium que o Playwright já baixou nesta máquina, ou o Chrome instalado. */
function findBrowser() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const cache = path.join(os.homedir(), ".cache", "ms-playwright");
  if (fs.existsSync(cache)) {
    const builds = fs.readdirSync(cache).filter(name => /^chromium-\d+$/.test(name)).sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
    for (const build of builds) for (const sub of ["chrome-linux64/chrome", "chrome-linux/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium", "chrome-win/chrome.exe"]) {
      const candidate = path.join(cache, build, sub);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  for (const candidate of ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]) if (fs.existsSync(candidate)) return candidate;
  return undefined;
}

const catalog = JSON.parse(fs.readFileSync(path.join(root, "site", "generated", "catalog.json"), "utf8"));
const all = catalog.items.map(item => item.name);
const names = args.length ? args : all;
const unknown = names.filter(name => !all.includes(name));
if (unknown.length) { console.error(`item desconhecido: ${unknown.join(", ")}`); process.exit(2); }

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: findBrowser(), args: ["--no-sandbox"] });
const results = [];

/** Versões dentro de um mesmo item (site/content/versions.json, entradas com `variant`): miniatura em <nome>--<variante>-<tema>.webp. */
const versionGroups = JSON.parse(fs.readFileSync(path.join(root, "site", "content", "versions.json"), "utf8"));
const variants = Object.values(versionGroups).flat().filter(entry => entry.variant && names.includes(entry.name));

async function shoot(name, theme, variant) {
  // deviceScaleFactor 2: a galeria exibe a miniatura em ~270px, mas em telas retina
  // ela pede o dobro de pixels; o navegador faz o downscale e o resultado fica nítido.
  const context = await browser.newContext({ viewport: { width: 800, height: 500 }, deviceScaleFactor: 2, colorScheme: theme === "dark" ? "dark" : "light" });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", error => problems.push(`erro: ${error.message}`));
  try {
    await page.goto(`${base}#/preview/${name}?theme=${theme}${variant ? `&v=${variant}` : ""}`, { waitUntil: "load", timeout: 30000 });
    const status = await page.waitForFunction(() => ["ready", "error"].includes(document.documentElement.dataset.demoStatus ?? ""), null, { timeout: 15000 }).then(() => page.evaluate(() => document.documentElement.dataset.demoStatus));
    if (status !== "ready") problems.push(`demo: ${status === "error" ? await page.evaluate(() => document.documentElement.dataset.demoError ?? "erro sem mensagem") : "não ficou pronto"}`);
    else {
      await page.waitForTimeout(1800); // anima de entrada terminando
      const painted = await page.evaluate(() => {
        if (!document.querySelector("main")) return false;
        return [...document.body.querySelectorAll("*")].some(node => { const box = node.getBoundingClientRect(); return box.width > 8 && box.height > 8 && Number(getComputedStyle(node).opacity) > 0.02; });
      });
      if (!painted) problems.push("nada visível para capturar");
    }
    if (!problems.length) await page.screenshot({ path: path.join(outDir, `${name}${variant ? `--${variant}` : ""}-${theme}.webp`), type: "webp", quality });
  } catch (error) {
    problems.push(`teste: ${String(error.message ?? error).split("\n")[0]}`);
  }
  await context.close();
  return { name: variant ? `${name}--${variant}` : name, theme, ok: problems.length === 0, problems };
}

const queue = [...names.flatMap(name => themes.map(theme => [name, theme])), ...variants.flatMap(entry => themes.map(theme => [entry.name, theme, entry.variant]))];
let done = 0;
await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
  for (;;) {
    const job = queue.shift();
    if (!job) return;
    const result = await shoot(...job);
    results.push(result);
    done++;
    console.log(`${done}/${queue.length + done}  ${result.ok ? "ok  " : "FALHA"} ${result.name}-${result.theme}${result.problems.length ? ` — ${result.problems.join("; ")}` : ""}`);
  }
}));
await browser.close();

const failed = results.filter(result => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} miniaturas geradas em ${path.relative(root, outDir) || outDir}`);
if (failed.length) {
  console.log(`falharam: ${[...new Set(failed.map(result => `${result.name} (${result.theme})`))].join(", ")}`);
  process.exit(1);
}
