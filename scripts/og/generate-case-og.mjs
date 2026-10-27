/*
 * scripts/og/generate-case-og.mjs — one share card per case.
 *
 * Renders a 1200×630 card per case in the site's style (category, title,
 * verdict, severity, ATT&CK ids) into public/og/cases/<id>.jpg; the case
 * page uses it when the file exists.
 *
 *   npm run og:cases              only cards whose case changed (part of npm run prepare:assets)
 *   npm run og:cases -- --force   redraw every card
 *
 * A manifest (scripts/og/case-og.manifest.json) keeps a hash of each card's
 * HTML, so a run redraws only what changed and deletes cards of removed cases.
 *
 * Reads the TypeScript config with the TypeScript compiler, so it needs no
 * build step; renders with the Playwright Chromium already in the toolchain.
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.log("og:cases skipped: needs Playwright —  npm install && npx playwright install chromium");
  process.exit(0);
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/* Minimal CommonJS loader for the data's .ts files ("./x" and "@/x" imports) */
const tsFile = (base) => (existsSync(`${base}.ts`) ? `${base}.ts` : `${base}.tsx`);
function load(file) {
  const out = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  new Function("require", "module", "exports", "process", out)(
    (p) =>
      p.startsWith(".") ? load(tsFile(resolve(dirname(file), p)))
      : p.startsWith("@/") ? load(tsFile(join(ROOT, p.slice(2))))
      : require(p),
    mod,
    mod.exports,
    process,
  );
  return mod.exports;
}

const cfg = join(ROOT, "data");
const { caseEvidenceLibrary } = load(join(cfg, "cases.ts"));
const { caseDetails } = load(join(cfg, "case-details.ts"));
const { caseAttackMapping } = load(join(cfg, "attack.ts"));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
/* Fonts inlined as data URIs: a page set with setContent() cannot load file:// fonts */
const font = (f) => `data:font/woff2;base64,${readFileSync(join(ROOT, "scripts/og/fonts", f)).toString("base64")}`;

const html = (c) => {
  const d = caseDetails[c.id] ?? {};
  const ids = (caseAttackMapping[c.id] ?? []).slice(0, 5);
  const size = c.title.length > 70 ? 46 : c.title.length > 48 ? 54 : c.title.length > 30 ? 64 : 76;
  const sev = d.severity ? `<div class="sev sev-${d.severity.toLowerCase()}">${esc(d.severity)}</div>` : "";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Dela;src:url(${font("dela-gothic-one.woff2")})}
@font-face{font-family:Mono;src:url(${font("jetbrains-mono-latin.woff2")});font-weight:100 800}
@font-face{font-family:Outfit;src:url(${font("outfit-latin.woff2")});font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#080808;color:#fff;font-family:Outfit;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:radial-gradient(circle at 1px 1px,rgba(255,255,255,.07) 1px,transparent 0);background-size:40px 40px}
.top{position:absolute;top:0;left:0;right:0;height:4px;background:#BC002D}
.side{position:absolute;left:0;top:0;bottom:0;width:6px;background:linear-gradient(#BC002D,transparent)}
.sun{position:absolute;right:-120px;top:-80px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(188,0,45,.2) 0%,transparent 65%)}
.wrap{position:absolute;left:80px;top:72px;right:80px}
.badge{display:inline-flex;gap:14px;align-items:center;padding:10px 16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);font-family:Mono;font-size:15px;font-weight:700;letter-spacing:.25em;color:#a0a0a0;text-transform:uppercase}
.dot{width:10px;height:10px;background:#BC002D}
h1{margin-top:30px;font-family:Dela;font-size:${size}px;line-height:.98;letter-spacing:-.03em;text-transform:uppercase;max-width:1000px}
.verdict{margin-top:28px;display:flex;gap:14px;align-items:baseline;font-size:24px;color:rgba(255,255,255,.82);max-width:900px}
.verdict b{font-family:Mono;font-size:13px;letter-spacing:.3em;color:#BC002D;flex-shrink:0}
.ids{margin-top:22px;display:flex;gap:10px;flex-wrap:wrap}
.ids span{padding:6px 10px;border:1px solid rgba(255,215,0,.35);font-family:Mono;font-size:15px;font-weight:700;color:#FFD700}
.sev{position:absolute;right:80px;top:72px;padding:10px 18px;font-family:Mono;font-size:16px;font-weight:800;letter-spacing:.3em;text-transform:uppercase;border:1px solid}
.sev-critical{color:#ff4d6d;border-color:#BC002D;background:rgba(188,0,45,.15)}
.sev-high{color:#FFD700;border-color:rgba(255,215,0,.5);background:rgba(255,215,0,.08)}
.sev-medium,.sev-low{color:#38bdf8;border-color:rgba(56,189,248,.4);background:rgba(56,189,248,.08)}
.foot{position:absolute;left:80px;right:80px;bottom:52px;display:flex;justify-content:space-between;align-items:center;font-family:Mono;font-size:16px;letter-spacing:.22em;color:rgba(255,255,255,.45);text-transform:uppercase}
.mark{font-family:Dela;font-size:30px;letter-spacing:-.02em;color:#fff}.mark i{color:#BC002D;font-style:normal}
</style></head><body><div class="grid"></div><div class="sun"></div><div class="top"></div><div class="side"></div>
<div class="wrap">
<div class="badge"><span class="dot"></span>${esc(c.category)} · ${esc(c.platform)}</div>
<h1>${esc(c.title)}</h1>
${d.verdict ? `<div class="verdict"><b>VERDICT</b><span>${esc(d.verdict)}</span></div>` : ""}
${ids.length ? `<div class="ids">${ids.map((i) => `<span>${esc(i)}</span>`).join("")}</div>` : ""}
</div>${sev}
<div class="foot"><span class="mark">AE<i>.</i> <span style="font-family:Mono;font-size:16px;letter-spacing:.22em;color:rgba(255,255,255,.55)">Ahmed Emad Nasr</span></span><span>${esc(c.type)} · case library</span></div>
</body></html>`;
};

const out = join(ROOT, "public/og/cases");
mkdirSync(out, { recursive: true });
const MANIFEST = join(ROOT, "scripts/og/case-og.manifest.json");
const force = process.argv.includes("--force");
let manifest = {};
try { manifest = JSON.parse(readFileSync(MANIFEST, "utf8")); } catch { /* first run */ }

const todo = [];
const next = {};
for (const c of caseEvidenceLibrary) {
  const doc = html(c);
  const hash = createHash("sha1").update(doc).digest("hex");
  next[c.id] = hash;
  if (force || manifest[c.id] !== hash || !existsSync(join(out, `${c.id}.jpg`))) todo.push({ c, doc });
}

/* Cards for cases that no longer exist */
let removed = 0;
for (const f of readdirSync(out)) {
  if (f.endsWith(".jpg") && !(f.slice(0, -4) in next)) { rmSync(join(out, f)); removed++; }
}

if (todo.length) {
  let browser;
  try {
    browser = await chromium.launch();
  } catch {
    console.log("og:cases skipped: Playwright's Chromium isn't installed —  npx playwright install chromium");
    process.exit(0);
  }
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const { c, doc } of todo) {
    await page.setContent(doc, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(out, `${c.id}.jpg`), type: "jpeg", quality: 86 });
  }
  await browser.close();
}
writeFileSync(MANIFEST, JSON.stringify(next, null, 2) + "\n");
console.log(`share cards: ${todo.length} drawn · ${caseEvidenceLibrary.length - todo.length} unchanged · ${removed} removed → public/og/cases/`);
