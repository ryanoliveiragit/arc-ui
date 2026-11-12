#!/usr/bin/env node
// Geometric sweep over every catalog item: verifies that the demo "palco"
// (data-demo-stage) frames the whole component — overlays inside, nothing
// clipped by the panel edge, nothing escaped outside, nothing empty.
//
// Usage:
//   node scripts/sweep-stage.mjs http://127.0.0.1:5198/ \
//     [--themes dark,light] [--width 1440] [--height 945] \
//     [--only popover,date-picker] [--shots DIR] [--json OUT.json] \
//     [--jobs 4] [--settle 1300]
//
// Exit code 0 = everything ok, 1 = findings.

import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TOL = 4; // px tolerated before counting as clipped/escaped

function parseCli(argv) {
  const args = { themes: ["dark", "light"], width: 1440, height: 945, only: null, shots: null, json: null, jobs: 4, settle: 1300 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--themes")) args.themes = (argv[++i] || "").split(",").filter(Boolean);
    else if (a.startsWith("--width")) args.width = Number(argv[++i]);
    else if (a.startsWith("--height")) args.height = Number(argv[++i]);
    else if (a.startsWith("--only")) args.only = (argv[++i] || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    else if (a.startsWith("--shots")) args.shots = argv[++i];
    else if (a.startsWith("--json")) args.json = argv[++i];
    else if (a.startsWith("--jobs")) args.jobs = Math.max(1, Number(argv[++i]));
    else if (a.startsWith("--settle")) args.settle = Number(argv[++i]);
  }
  if (!args.themes.length) throw new Error("--themes must list at least one theme");
  return args;
}

const args = parseCli(process.argv.slice(2));
const base = process.argv[2];
if (!base || !base.startsWith("http")) {
  console.error("usage: node sweep-stage.mjs <baseUrl> [opts]");
  process.exit(2);
}

const CATALOG = path.join(import.meta.dirname, "..", "site", "generated", "catalog.json");
const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
let items = catalog.items;
if (args.only) {
  items = items.filter((it) => {
    const name = it.name.toLowerCase();
    return args.only.some((frag) => name.includes(frag));
  });
}
if (!items.length) {
  console.error(`no catalog items match --only ${args.only?.join(",")}`);
  process.exit(2);
}
if (args.shots) fs.mkdirSync(args.shots, { recursive: true });

const routeOf = (it, theme) =>
  `#/c/${encodeURIComponent(it.name)}?theme=${theme}`;

/**
 * Gate on the top-level stage panel's ready state (for framed demos it turns
 * ready only when the iframe posts its status), then measure inside the
 * preview iframe when there is one — that's where overlays actually live.
 * Returns whatever object has .evaluate for the right document (Page or Frame).
 */
async function findStage(page) {
  await page.locator('[data-demo-stage][data-status="ready"]').first().waitFor({ timeout: 15_000 });
  if (!(await page.locator('iframe[src*="/preview/"]').count())) return page;
  for (let i = 0; i < 20; i++) {
    const frame = page.frames().find((f) => f !== page.mainFrame() && f.url().includes("/preview"));
    if (frame) {
      try {
        await frame.locator("[data-demo-stage]").waitFor({ state: "attached", timeout: 2_000 });
        return frame;
      } catch { /* ainda carregando */ }
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error("iframe do preview não expôs o palco");
}

function measureScript() {
  return ({ tol }) => {
    const stage = document.querySelector("[data-demo-stage]");
    if (!stage) return { error: "no [data-demo-stage] found" };
    const chrome = document.querySelector('[data-site-chrome="1"]');
    const sr = stage.getBoundingClientRect();
    if (!sr.width || !sr.height) return { error: "stage has zero size", stage: { w: sr.width, h: sr.height } };

    const clipAncestors = new Set();
    for (const el of document.querySelectorAll("*")) {
      if (el === stage || !stage.contains(el)) continue;
      const cs = getComputedStyle(el);
      if (["hidden", "clip", "auto", "scroll"].includes(cs.overflowX) || ["hidden", "clip", "auto", "scroll"].includes(cs.overflowY)) {
        clipAncestors.add(el);
      }
    }
    const clippedBetween = (a, b) => {
      let cur = b.parentElement;
      while (cur && cur !== a && cur !== document.documentElement) {
        if (clipAncestors.has(cur)) return true;
        cur = cur.parentElement;
      }
      return false;
    };

    const els = Array.from(document.querySelectorAll("*"));
    let ink = 0;
    const clipped = [];
    const escaped = [];
    for (const el of els) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      if (cs.position === "fixed" && !document.body.contains(el)) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (parseFloat(cs.opacity) < 0.01) continue;
      const hasDirectText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
      const painted =
        cs.backgroundColor !== "rgba(0, 0, 0, 0)" ||
        cs.boxShadow !== "none" ||
        cs.borderTopWidth !== "0px" ||
        cs.borderLeftWidth !== "0px" ||
        el.matches("svg,img,canvas,video,hr");
      if (hasDirectText || painted) ink += r.width * r.height * parseFloat(cs.opacity);

      // Só tinta conta como defeito visual: camadas de posição/medida invisíveis
      // (ex.: a thumbLayer do slider desliza pelo percentual do próprio tamanho)
      // podem ultrapassar a borda sem que nada apareça cortado. Filhos com tinta
      // são avaliados pelos próprios rects, então a exclusão não esconde erro.
      const pseudoInk = (n) => {
        for (const pseudo of [":before", ":after"]) {
          const ps = getComputedStyle(n, pseudo);
          if (ps.backgroundColor !== "rgba(0, 0, 0, 0)" || ps.boxShadow !== "none") return true;
        }
        return false;
      };
      const inks = hasDirectText || painted || pseudoInk(el);
      if (stage.contains(el)) {
        const oR = r.right - sr.right, oB = r.bottom - sr.bottom, oL = sr.left - r.left, oT = sr.top - r.top;
        if (inks && Math.max(oR, oB, oL, oT) > tol && !clippedBetween(stage, el)) {
          clipped.push({
            tag: el.tagName.toLowerCase(),
            cls: String(el.className.baseVal ?? el.className).split(" ").slice(0, 3).join("."),
            where: [oL > tol ? "left" : null, oT > tol ? "top" : null, oR > tol ? "right" : null, oB > tol ? "bottom" : null].filter(Boolean).join("+"),
            px: Math.round(Math.max(oR, oB, oL, oT)),
          });
        }
      } else {
        const inter = r.left < sr.right && r.right > sr.left && r.top < sr.bottom && r.bottom > sr.top;
        if (!inter) continue;
        if (el.contains(stage)) continue;
        if (chrome && chrome.contains(el)) continue;
        const oR = r.right - sr.right, oB = r.bottom - sr.bottom, oL = sr.left - r.left, oT = sr.top - r.top;
        if (inks && Math.max(oR, oB, oL, oT) > tol) {
          escaped.push({
            tag: el.tagName.toLowerCase(),
            cls: String(el.className.baseVal ?? el.className).split(" ").slice(0, 3).join("."),
            where: [oL > tol ? "left" : null, oT > tol ? "top" : null, oR > tol ? "right" : null, oB > tol ? "bottom" : null].filter(Boolean).join("+"),
            px: Math.round(Math.max(oR, oB, oL, oT)),
          });
        }
      }
    }
    return { stage: { w: Math.round(sr.width), h: Math.round(sr.height) }, ink: Math.round(ink), clipped: clipped.slice(0, 12), escaped: escaped.slice(0, 12) };
  }
}

/** Usa o Chromium que o Playwright já baixou nesta máquina, ou o Chrome instalado (mesma regra do test-demos). */
function findBrowser() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const cache = path.join(os.homedir(), ".cache", "ms-playwright");
  if (fs.existsSync(cache)) {
    const builds = fs.readdirSync(cache).filter((name) => /^chromium-\d+$/.test(name)).sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
    for (const build of builds) for (const sub of ["chrome-linux64/chrome", "chrome-linux/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium", "chrome-win/chrome.exe"]) {
      const candidate = path.join(cache, build, sub);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  for (const candidate of ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]) if (fs.existsSync(candidate)) return candidate;
  return undefined;
}

const browser = await chromium.launch({ executablePath: findBrowser(), args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: args.width, height: args.height }, deviceScaleFactor: 1 });

async function measureItem(t) {
  const page = await context.newPage();
  const tag = `${t.theme}:${t.item.name}`.replace(/\s+/g, "_");
  const shotPath = args.shots ? `${args.shots}/${t.theme}__${tag}.png` : null;
  try {
    await page.goto(base.replace(/\/$/, "") + "/", { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.evaluate((h) => { history.replaceState(null, "", h); }, routeOf(t.item, t.theme));
    let frame, measured;
    for (let attempt = 1; attempt <= 2; attempt++) {
      frame = await findStage(page);
      const m = await frame.evaluate(measureScript(), { tol: TOL });
      await new Promise((r) => setTimeout(r, args.settle));
      const m2 = await frame.evaluate(measureScript(), { tol: TOL });
      measured = m2 && m2.stage ? m2 : m;
      if (!measured.error) break;
      if (attempt === 1) { await page.reload({ waitUntil: "domcontentloaded" }); await page.evaluate((h) => { history.replaceState(null, "", h); }, routeOf(t.item, t.theme)); }
    }
    const clipped = (measured?.clipped || []).concat(measured?.error ? [{ where: measured.error }] : []);
    const status = measured?.error ? "load-error" : clipped.length || (measured?.escaped || []).length || measured?.ink < 300 ? "fail" : "ok";
    if (status === "ok") await page.close();
    if (shotPath && (status === "fail" || measured?.ink < 900)) await page.screenshot({ path: shotPath, timeout: 5_000 }).catch(() => {});
    await page.close();
    return { theme: t.theme, name: t.item.name, type: t.item.kind, status, ...(measured || {}), screenshot: shotPath && status !== "ok" ? shotPath : undefined };
  } catch (e) {
    await page.close().catch(() => {});
    return { theme: t.theme, name: t.item.name, type: t.item.kind, status: "load-error", error: String(e.message || e).split("\n")[0].slice(0, 200) };
  }
}

const targets = [];
for (const theme of args.themes) for (const item of items) targets.push({ theme, item });

const results = [];
let idx = 0;
const t0 = Date.now();
async function worker() {
  while (idx < targets.length) {
    const j = idx++;
    results[j] = await measureItem(targets[j]);
    const r = results[j];
    const dot = r.status === "ok" ? "." : r.status === "fail" ? "F" : "E";
    process.stdout.write(dot);
    if (r.status !== "ok") process.stdout.write(` ${dot}${r.name}(${r.theme})${r.error ? ": " + r.error : ""}\n`);
  }
}
await Promise.all(Array.from({ length: Math.min(args.jobs, targets.length) }, () => worker()));

const findings = results.filter((r) => r.status !== "ok");
const byName = new Map();
for (const f of findings) {
  if (!byName.has(f.name)) byName.set(f.name, { name: f.name, type: f.type, themes: [], clipped: new Set(), escaped: new Set(), errors: [] });
  const g = byName.get(f.name);
  g.themes.push(f.theme);
  (f.clipped || []).forEach((c) => g.clipped.add(`${c.tag}.${c.cls} → ${c.where} ${c.px}px`));
  (f.escaped || []).forEach((c) => g.escaped.add(`${c.tag}.${c.cls} → ${c.where} ${c.px}px`));
  if (f.error) g.errors.push(f.error);
  if (f.status === "load-error") g.errors.push(f.theme);
}

console.log(`\nSweep done in ${((Date.now() - t0) / 1000).toFixed(1)}s — ${results.length} measured, ${results.filter(r=>r.status==="ok").length} ok, ${findings.length} findings across ${byName.size} items.`);
for (const g of [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))) {
  console.log(`\n• ${g.name} [${g.type}] themes=${[...new Set(g.themes)].join(",")}`);
  for (const c of g.clipped) console.log(`    clipped   ${c}`);
  for (const c of g.escaped) console.log(`    escaped   ${c}`);
  for (const c of g.errors) console.log(`    error     ${c}`);
}
if (args.json) {
  fs.writeFileSync(args.json, JSON.stringify({ base, themes: args.themes, width: args.width, height: args.height, at: new Date().toISOString(), results }, null, 1));
  console.log(`\nJSON → ${args.json}`);
}
if (args.shots) console.log(`Screenshots (non-ok / low-ink) → ${args.shots}/`);
await browser.close();
process.exit(findings.length ? 1 : 0);
