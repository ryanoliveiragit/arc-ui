#!/usr/bin/env node
// Captura o palco (painel do preview) de cada item do catálogo, para revisão visual.
//
//   node scripts/shot-stages.mjs <baseUrl> --out DIR [--theme dark|light] [--width 1440] [--height 1000]
//        [--only a,b] [--jobs 4] [--settle 1500] [--mobile]
//
// --mobile escolhe a largura de celular (390 px) no próprio palco antes de capturar.
// Salva DIR/<nome>.png e DIR/index.json (nome, tipo, categoria, tamanho do palco, status, erros do console).

import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const argv = process.argv.slice(2);
const base = argv[0];
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i < 0 ? def : argv[i + 1];
};
const out = opt("out", null);
if (!base?.startsWith("http") || !out) {
  console.error("uso: node scripts/shot-stages.mjs <baseUrl> --out DIR [--theme dark] [--only a,b]");
  process.exit(2);
}
const theme = opt("theme", "dark");
const width = Number(opt("width", 1440));
const height = Number(opt("height", 1000));
const jobs = Number(opt("jobs", 4));
const settle = Number(opt("settle", 1500));
const mobile = argv.includes("--mobile");
const only = opt("only", null)?.split(",").map((s) => s.trim()).filter(Boolean);

const catalog = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "..", "site", "generated", "catalog.json"), "utf8"));
let items = catalog.items;
if (only) items = items.filter((it) => only.includes(it.name));
fs.mkdirSync(out, { recursive: true });

function findBrowser() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const cache = path.join(os.homedir(), ".cache", "ms-playwright");
  if (fs.existsSync(cache)) {
    const builds = fs.readdirSync(cache).filter((n) => /^chromium-\d+$/.test(n)).sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
    for (const b of builds) for (const sub of ["chrome-linux64/chrome", "chrome-linux/chrome"]) {
      const c = path.join(cache, b, sub);
      if (fs.existsSync(c)) return c;
    }
  }
  return undefined;
}

const browser = await chromium.launch({ executablePath: findBrowser(), args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });

async function shoot(it) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  try {
    await page.goto(`${base.replace(/\/$/, "")}/#/c/${encodeURIComponent(it.name)}?theme=${theme}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    // [data-demo-stage] só existe a partir desta versão; o site antigo marca o painel só com data-status + data-layout.
    const panel = page.locator("[data-demo-stage], [data-status][data-layout]").first();
    await panel.waitFor({ timeout: 20_000 });
    if (mobile) {
      await page.getByRole("radio", { name: /celular/i }).first().click({ timeout: 5_000 }).catch(() => page.getByRole("button", { name: /celular/i }).first().click({ timeout: 5_000 }));
    }
    await page.locator('[data-status="ready"][data-layout]').first().waitFor({ timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(settle);
    await panel.scrollIntoViewIfNeeded();
    const box = await panel.boundingBox();
    await panel.screenshot({ path: path.join(out, `${it.name}.png`), timeout: 10_000 });
    const status = await panel.getAttribute("data-status");
    await page.close();
    return { name: it.name, kind: it.kind, category: it.category, status, w: Math.round(box?.width ?? 0), h: Math.round(box?.height ?? 0), errors };
  } catch (e) {
    await page.close().catch(() => {});
    return { name: it.name, kind: it.kind, category: it.category, status: "capture-error", error: String(e.message || e).split("\n")[0].slice(0, 200), errors };
  }
}

const results = [];
let i = 0;
async function worker() {
  while (i < items.length) {
    const j = i++;
    results[j] = await shoot(items[j]);
    process.stdout.write(results[j].status === "ready" && !results[j].errors.length ? "." : "!");
  }
}
await Promise.all(Array.from({ length: Math.min(jobs, items.length) }, worker));
fs.writeFileSync(path.join(out, "index.json"), JSON.stringify(results, null, 1));
const bad = results.filter((r) => r.status !== "ready" || r.errors.length);
console.log(`\n${results.length} capturados, ${bad.length} com erro ou status diferente de ready`);
for (const b of bad) console.log(`  ${b.name}: ${b.status} ${b.error ?? ""} ${b.errors.slice(0, 2).join(" | ")}`);
await browser.close();
