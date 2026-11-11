/**
 * Abre o demo de cada item num Chromium sem janela e registra o que quebrou.
 *
 *   node scripts/test-demos.mjs [opções] [itens...]
 *
 *   --url <base>      site já no ar (padrão: http://127.0.0.1:5199/, o `npm run dev`)
 *   --themes a,b      temas a testar (padrão: light,dark)
 *   --shots <pasta>   grava uma captura PNG de cada demo (nome-tema.png)
 *   --width <px>      largura da janela (padrão 1280); --height <px> (padrão 800)
 *   --json <arquivo>  grava o resultado completo em JSON
 *   --settle <ms>     espera depois de pronto, para animações de entrada (padrão 900)
 *   --poke            depois de pronto, clica nos controles visíveis e digita no primeiro campo, para pegar erro de interação
 *   --jobs <n>        páginas em paralelo (padrão 4)
 *
 * Um demo falha quando: a página dá erro de JavaScript, o console registra erro, um arquivo não carrega (404),
 * o demo não fica pronto em 15 s, ou fica pronto mas não desenha nada visível.
 * Sai com código 1 se algum falhar.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const option = (name, fallback) => { const index = args.indexOf(`--${name}`); if (index === -1) return fallback; const value = args[index + 1]; args.splice(index, 2); return value; };
const base = option("url", "http://127.0.0.1:5199/").replace(/\/?$/, "/");
const themes = option("themes", "light,dark").split(",");
const shots = option("shots", null);
const width = Number(option("width", 1280)), height = Number(option("height", 800));
const jsonFile = option("json", null);
const settle = Number(option("settle", 900));
const concurrency = Number(option("jobs", 4));
const pokeIndex = args.indexOf("--poke");
const poke = pokeIndex > -1;
if (poke) args.splice(pokeIndex, 1);

const catalog = JSON.parse(fs.readFileSync(path.join(root, "site", "generated", "catalog.json"), "utf8"));
const all = catalog.items.map(item => item.name);
const names = args.length ? args : all;
const unknown = names.filter(name => !all.includes(name));
if (unknown.length) { console.error(`item desconhecido: ${unknown.join(", ")}`); process.exit(2); }

/** Usa o Chromium que o Playwright já baixou nesta máquina, ou o Chrome instalado. */
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

/** Ruído conhecido que não é defeito do demo. */
const ignorable = text => /Download the React DevTools|\[vite\]|favicon\.(ico|svg)/.test(text);

const browser = await chromium.launch({ executablePath: findBrowser(), args: ["--no-sandbox"] });
if (shots) fs.mkdirSync(shots, { recursive: true });
const results = [];

async function check(name, theme) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, colorScheme: theme === "dark" ? "dark" : "light" });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", error => problems.push(`erro: ${error.message}`));
  page.on("console", message => { if (message.type() === "error" && !ignorable(message.text())) problems.push(`console: ${message.text().slice(0, 300)}`); });
  page.on("requestfailed", request => { if (!ignorable(request.url())) problems.push(`falhou: ${request.url().replace(base, "")} (${request.failure()?.errorText ?? "?"})`); });
  page.on("response", response => { if (response.status() >= 400 && !ignorable(response.url())) problems.push(`${response.status()}: ${response.url().replace(base, "")}`); });
  const started = Date.now();
  let status = "timeout";
  try {
    await page.goto(`${base}#/preview/${name}?theme=${theme}`, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction(() => ["ready", "error"].includes(document.documentElement.dataset.demoStatus ?? ""), null, { timeout: 15000 });
    status = await page.evaluate(() => document.documentElement.dataset.demoStatus);
    if (status === "error") problems.push(`demo: ${await page.evaluate(() => document.documentElement.dataset.demoError ?? "erro sem mensagem")}`);
    await page.waitForTimeout(settle);
    if (status === "ready") {
      const painted = await page.evaluate(() => {
        const main = document.querySelector("main");
        if (!main) return { ok: false, why: "sem <main>" };
        // Portais (diálogos, toasts) ficam fora do <main>, então o corpo inteiro conta.
        const nodes = [...document.body.querySelectorAll("*")].filter(node => node !== main && !["SCRIPT", "STYLE"].includes(node.tagName));
        const visible = nodes.filter(node => { const box = node.getBoundingClientRect(); if (box.width < 2 || box.height < 2) return false; const style = getComputedStyle(node); return style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) > 0.02; });
        return { ok: visible.length > 0, why: `${nodes.length} nós, ${visible.length} visíveis`, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth };
      });
      if (!painted.ok) problems.push(`vazio: o demo não desenhou nada visível (${painted.why})`);
      else if (painted.scrollWidth > painted.clientWidth + 1) problems.push(`aviso: rolagem horizontal (${painted.scrollWidth}px em ${painted.clientWidth}px)`);
    }
    if (shots) await page.screenshot({ path: path.join(shots, `${name}-${theme}.png`) });
    if (poke && status === "ready") {
      // Fumaça: aciona até 10 controles e digita num campo. Não confere resultado, só se algo quebra.
      const selector = 'main button:not([disabled]), main [role="button"], main [role="tab"], main [role="switch"], main [role="checkbox"], main [role="radio"], main [role="combobox"], main summary';
      const count = Math.min(await page.locator(selector).count(), 10);
      for (let index = 0; index < count; index++) {
        try { await page.locator(selector).nth(index).click({ timeout: 700 }); await page.waitForTimeout(180); await page.keyboard.press("Escape"); await page.waitForTimeout(120); } catch { /* coberto ou saiu da tela: segue */ }
      }
      try { const field = page.locator('main input:not([type="hidden"]):not([type="file"]):not([disabled]), main textarea:not([disabled]), main [contenteditable="true"]').first(); if (await field.count()) { await field.click({ timeout: 700 }); await page.keyboard.type("Hello 42"); await page.keyboard.press("Tab"); } } catch { /* sem campo utilizável */ }
      await page.waitForTimeout(250);
      const after = await page.evaluate(() => document.documentElement.dataset.demoStatus);
      if (after === "error") { status = "error"; problems.push(`demo (após interação): ${await page.evaluate(() => document.documentElement.dataset.demoError ?? "erro sem mensagem")}`); }
      if (shots) await page.screenshot({ path: path.join(shots, `${name}-${theme}-poke.png`) });
    }
  } catch (error) {
    problems.push(`teste: ${String(error.message ?? error).split("\n")[0]}`);
  }
  await context.close();
  const failures = problems.filter(problem => !problem.startsWith("aviso:"));
  return { name, theme, status, ok: status === "ready" && failures.length === 0, problems: [...new Set(problems)], ms: Date.now() - started };
}

const queue = names.flatMap(name => themes.map(theme => [name, theme]));
let done = 0;
await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
  for (;;) {
    const job = queue.shift();
    if (!job) return;
    const result = await check(...job);
    results.push(result);
    done++;
    if (!result.ok || result.problems.length) console.log(`${result.ok ? "ok  " : "FALHA"} ${result.name} (${result.theme})${result.problems.length ? `\n      ${result.problems.join("\n      ")}` : ""}`);
  }
}));
await browser.close();

results.sort((a, b) => a.name.localeCompare(b.name) || a.theme.localeCompare(b.theme));
const failed = results.filter(result => !result.ok);
if (jsonFile) fs.writeFileSync(jsonFile, JSON.stringify({ base, themes, total: results.length, failed: failed.length, results }, null, 1) + "\n");
console.log(`\n${results.length - failed.length}/${results.length} passaram (${names.length} itens × ${themes.length} temas)${failed.length ? `; falharam: ${[...new Set(failed.map(result => result.name))].join(", ")}` : ""}`);
process.exit(failed.length ? 1 : 0);
