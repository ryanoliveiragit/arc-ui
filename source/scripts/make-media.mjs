/**
 * Gera a mídia de demonstração em public/media: avatares em gradiente e "fotos" abstratas, tudo SVG feito aqui.
 * Nenhuma imagem de terceiros. Saída determinística (semente = id), então rodar de novo não muda os arquivos.
 *
 *   node scripts/make-media.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "public", "media");

/** Gerador pseudoaleatório com semente (mulberry32) a partir do hash do id. */
function random(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const n = value => Math.round(value * 100) / 100;
const oklch = (l, c, h) => `oklch(${n(l)}% ${n(c)} ${n(((h % 360) + 360) % 360)})`;

function avatarSvg(id, width, height) {
  const r = random(id);
  const hue = r() * 360, shift = 40 + r() * 70, angle = Math.round(r() * 360);
  const cx = 20 + r() * 60, cy = 15 + r() * 45;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="">
<defs>
<linearGradient id="g" gradientTransform="rotate(${angle} .5 .5)"><stop offset="0" stop-color="${oklch(78, 0.13, hue)}"/><stop offset="1" stop-color="${oklch(62, 0.17, hue + shift)}"/></linearGradient>
<radialGradient id="h" cx="${n(cx)}%" cy="${n(cy)}%" r="65%"><stop offset="0" stop-color="${oklch(93, 0.07, hue - shift / 2)}" stop-opacity=".85"/><stop offset="1" stop-color="${oklch(93, 0.07, hue - shift / 2)}" stop-opacity="0"/></radialGradient>
<radialGradient id="s" cx="${n(100 - cx)}%" cy="${n(100 - cy / 2)}%" r="60%"><stop offset="0" stop-color="${oklch(45, 0.16, hue + shift * 1.4)}" stop-opacity=".55"/><stop offset="1" stop-color="${oklch(45, 0.16, hue + shift * 1.4)}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${width}" height="${height}" fill="url(#g)"/><rect width="${width}" height="${height}" fill="url(#s)"/><rect width="${width}" height="${height}" fill="url(#h)"/>
</svg>
`;
}

/** Paletas das cenas: [nome para o alt, matiz base, croma]. */
const palettes = { sand: ["warm sand", 70, 0.05], clay: ["terracotta", 45, 0.1], dusk: ["dusk violet", 300, 0.08], sea: ["sea blue", 230, 0.08], moss: ["moss green", 150, 0.07], rose: ["soft rose", 15, 0.08], amber: ["amber", 80, 0.1], slate: ["cool slate", 250, 0.03] };

/** Camadas de morros com um sol baixo. */
function ridges(id, width, height, palette) {
  const r = random(id), [, hue, chroma] = palettes[palette];
  const layers = 5, sunX = width * (0.25 + r() * 0.5), sunY = height * (0.28 + r() * 0.12), sunR = Math.min(width, height) * (0.07 + r() * 0.04);
  let paths = "";
  for (let i = 0; i < layers; i++) {
    const base = height * (0.46 + i * 0.11), amp = height * (0.05 + r() * 0.05), steps = 6 + Math.floor(r() * 3);
    let d = `M0 ${n(base + (r() - 0.5) * amp)}`;
    for (let s = 1; s <= steps; s++) {
      const x = (width / steps) * s, y = base + (r() - 0.5) * amp * 2, cx = x - width / steps / 2, cy = base + (r() - 0.5) * amp * 2.4;
      d += ` Q${n(cx)} ${n(cy)} ${n(x)} ${n(y)}`;
    }
    d += ` V${height} H0 Z`;
    paths += `<path d="${d}" fill="${oklch(74 - i * 11, chroma + i * 0.012, hue + i * 6)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${oklch(90, chroma * 0.7, hue + 40)}"/><stop offset="1" stop-color="${oklch(95, chroma * 0.9, hue - 20)}"/></linearGradient></defs>
<rect width="${width}" height="${height}" fill="url(#sky)"/><circle cx="${n(sunX)}" cy="${n(sunY)}" r="${n(sunR)}" fill="${oklch(97, 0.05, hue - 10)}"/>${paths}
</svg>
`;
}

/** Arcos e faixas, para arquitetura. */
function arches(id, width, height, palette) {
  const r = random(id), [, hue, chroma] = palettes[palette];
  const count = 3 + Math.floor(r() * 3), gap = width * 0.04, w = (width - gap * (count + 1)) / count, floor = height * (0.8 + r() * 0.06);
  let shapes = "";
  for (let i = 0; i < count; i++) {
    const x = gap + i * (w + gap), top = height * (0.2 + r() * 0.25), radius = w / 2;
    shapes += `<path d="M${n(x)} ${n(floor)} V${n(top + radius)} A${n(radius)} ${n(radius)} 0 0 1 ${n(x + w)} ${n(top + radius)} V${n(floor)} Z" fill="${oklch(60 + r() * 22, chroma + r() * 0.04, hue + (r() - 0.5) * 30)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs><linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${oklch(93, chroma * 0.5, hue + 20)}"/><stop offset="1" stop-color="${oklch(87, chroma * 0.7, hue)}"/></linearGradient></defs>
<rect width="${width}" height="${height}" fill="url(#wall)"/>${shapes}<rect y="${n(floor)}" width="${width}" height="${n(height - floor)}" fill="${oklch(42, chroma * 0.8, hue - 10)}"/>
</svg>
`;
}

/** Natureza-morta: parede, mesa e alguns objetos de formas simples. */
function still(id, width, height, palette) {
  const r = random(id), [, hue, chroma] = palettes[palette];
  const table = height * (0.66 + r() * 0.08), unit = Math.min(width, height);
  const count = 2 + Math.floor(r() * 2), slot = width / (count + 1);
  let shapes = "";
  for (let i = 0; i < count; i++) {
    const cx = slot * (i + 1) + (r() - 0.5) * slot * 0.3, kind = Math.floor(r() * 3), fill = oklch(52 + r() * 30, chroma + 0.02 + r() * 0.05, hue + (r() - 0.5) * 70);
    if (kind === 0) { const w = unit * (0.1 + r() * 0.06), h = unit * (0.22 + r() * 0.14); shapes += `<rect x="${n(cx - w / 2)}" y="${n(table - h)}" width="${n(w)}" height="${n(h)}" rx="${n(w / 2)}" fill="${fill}"/>`; }
    else if (kind === 1) { const rad = unit * (0.09 + r() * 0.05); shapes += `<path d="M${n(cx - rad)} ${n(table - rad)} A${n(rad)} ${n(rad)} 0 0 0 ${n(cx + rad)} ${n(table - rad)} Z" fill="${fill}" transform="translate(0 ${n(rad)})"/>`; }
    else { const w = unit * (0.16 + r() * 0.06), h = unit * (0.12 + r() * 0.05), stem = unit * (0.14 + r() * 0.08); shapes += `<rect x="${n(cx - unit * 0.008)}" y="${n(table - stem)}" width="${n(unit * 0.016)}" height="${n(stem)}" fill="${oklch(35, 0.02, hue)}"/><path d="M${n(cx - w / 2)} ${n(table - stem)} L${n(cx - w / 3)} ${n(table - stem - h)} H${n(cx + w / 3)} L${n(cx + w / 2)} ${n(table - stem)} Z" fill="${fill}"/>`; }
  }
  const glowX = width * (0.2 + r() * 0.6);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs><radialGradient id="glow" cx="${n((glowX / width) * 100)}%" cy="30%" r="70%"><stop offset="0" stop-color="${oklch(96, chroma * 0.6, hue + 15)}"/><stop offset="1" stop-color="${oklch(86, chroma * 0.9, hue)}"/></radialGradient></defs>
<rect width="${width}" height="${height}" fill="url(#glow)"/>${shapes}<rect y="${n(table)}" width="${width}" height="${n(height - table)}" fill="${oklch(70, chroma + 0.02, hue - 15)}"/><rect y="${n(table)}" width="${width}" height="${n(unit * 0.012)}" fill="${oklch(60, chroma + 0.03, hue - 15)}"/>
</svg>
`;
}

const scenes = { ridges, arches, still };
const sceneNames = { ridges: "Abstract landscape of layered ridges", arches: "Abstract row of arches", still: "Abstract still life of simple shapes" };

/** id, cena, paleta, largura, altura. As proporções seguem o que os blocos esperam de cada foto. */
export const photoPlan = [
  ["lounge-chair", "still", "sand", 1280, 1600], ["table-lamp", "still", "amber", 1600, 900], ["linen-throw", "still", "sand", 1067, 1600],
  ["glass-carafe", "still", "sea", 1280, 1600], ["stoneware-cups", "still", "slate", 1067, 1600], ["stacked-bowls", "still", "clay", 1600, 1067],
  ["ceramic-lamp", "still", "rose", 1067, 1600], ["living-room", "still", "sand", 1200, 1600], ["sunroom", "arches", "moss", 1600, 1067],
  ["home-office", "still", "moss", 1600, 1200], ["reading-chair", "still", "moss", 1600, 900], ["bedroom", "still", "rose", 1067, 1600],
  ["restaurant", "arches", "amber", 1067, 1600], ["wine-bar", "still", "clay", 1600, 1067], ["concert-hall", "arches", "slate", 1600, 1143],
  ["curved-facade", "arches", "sand", 1600, 1067], ["pool-house", "arches", "sea", 1600, 900], ["terracotta-waves", "ridges", "clay", 1067, 1600],
  ["mountain-ridges", "ridges", "dusk", 1600, 1068], ["alpine-lake", "ridges", "sea", 1067, 1600], ["coastline", "ridges", "moss", 1200, 1600],
  ["sea-at-dusk", "ridges", "dusk", 1067, 1600], ["lisbon-tram", "arches", "amber", 1600, 1064], ["lisbon-bridge", "ridges", "rose", 1600, 1166],
  ["lisbon-rooftops", "ridges", "clay", 1280, 1600], ["salmon-dinner", "still", "rose", 1067, 1600], ["chef-plating", "still", "slate", 1600, 1600],
];
export const peopleIds = ["emma-collins", "marcus-johnson", "jasmine-brooks", "olivia-bennett", "sofia-ramirez", "ryan-sullivan", "hannah-walsh", "chloe-nguyen", "ava-mitchell", "daniel-kim", "jordan-reyes", "mateo-alvarez", "tyler-hayes", "andre-williams", "nathan-cole", "diane-foster"];
export const photoAlt = (scene, palette) => `${sceneNames[scene]} in ${palettes[palette][0]} tones`;

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  for (const dir of ["people", "people/portrait", "photos"]) fs.mkdirSync(path.join(out, dir), { recursive: true });
  for (const id of peopleIds) {
    fs.writeFileSync(path.join(out, "people", `${id}.svg`), avatarSvg(id, 400, 400));
    fs.writeFileSync(path.join(out, "people", "portrait", `${id}.svg`), avatarSvg(id, 800, 1000));
  }
  for (const [id, scene, palette, width, height] of photoPlan) fs.writeFileSync(path.join(out, "photos", `${id}.svg`), scenes[scene](id, width, height, palette));
  fs.writeFileSync(path.join(out, "CREDITS.md"), "# Mídia de demonstração\n\nTodas as imagens desta pasta são SVG gerados por `scripts/make-media.mjs` (avatares em gradiente e cenas abstratas).\nNão há fotos nem imagens de terceiros. Licença: MIT, como o resto do projeto.\n");
  console.log(`mídia gerada: ${peopleIds.length} avatares, ${peopleIds.length} retratos, ${photoPlan.length} cenas`);
}
