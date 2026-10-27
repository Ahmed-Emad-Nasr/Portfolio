/*
 * scripts/og/generate-post-og.mjs — one share card per blog post.
 *
 * The same 1200×630 card as the case library (generate-case-og.mjs), for
 * the written posts in content/posts: tag, title, the one-line description,
 * up to four tags, reading time. Arabic posts are laid out right-to-left in
 * IBM Plex Sans Arabic. Output: public/og/posts/<slug>.jpg — the post page
 * uses it as its link preview when the file exists (a post's own `cover`
 * image still wins).
 *
 *   npm run og:posts              only cards whose post changed (part of npm run prepare:assets)
 *   npm run og:posts -- --force   redraw every card
 *
 * Drafts get a card too, so a preview build (SHOW_DRAFTS=1) has them.
 */
import { createRequire } from "node:module";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.log(
    "og:posts skipped: needs Playwright —  npm install && npx playwright install chromium",
  );
  process.exit(0);
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const POSTS = join(ROOT, "content/posts");
const OUT = join(ROOT, "public/og/posts");
const MANIFEST = join(ROOT, "scripts/og/post-og.manifest.json");

const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
/* Fonts inlined as data URIs: a page set with setContent() cannot load file:// fonts */
const font = (path) =>
  `data:font/woff2;base64,${readFileSync(join(ROOT, path)).toString("base64")}`;
const FONTS = `
@font-face{font-family:Dela;src:url(${font("scripts/og/fonts/dela-gothic-one.woff2")})}
@font-face{font-family:Mono;src:url(${font("scripts/og/fonts/jetbrains-mono-latin.woff2")});font-weight:100 800}
@font-face{font-family:Outfit;src:url(${font("scripts/og/fonts/outfit-latin.woff2")});font-weight:100 900}
@font-face{font-family:Arabic;src:url(${font("app/fonts/ibm-plex-sans-arabic/arabic-700.woff2")});font-weight:700}
@font-face{font-family:Arabic;src:url(${font("app/fonts/ibm-plex-sans-arabic/arabic-400.woff2")});font-weight:400}`;

const readingTime = (body) =>
  Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200));

const html = (p) => {
  const ar = p.lang === "ar";
  const len = p.title.length;
  const size = ar
    ? len > 60
      ? 50
      : len > 36
        ? 58
        : 68
    : len > 70
      ? 46
      : len > 48
        ? 54
        : len > 30
          ? 64
          : 76;
  const tags = p.tags.slice(0, 4);
  return `<!doctype html><html lang="${ar ? "ar" : "en"}" dir="${ar ? "rtl" : "ltr"}"><head><meta charset="utf-8"><style>${FONTS}
*{margin:0;box-sizing:border-box}
html{width:1200px;height:630px;overflow:hidden}
body{width:1200px;height:630px;background:#080808;color:#fff;font-family:Outfit,Arabic;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:radial-gradient(circle at 1px 1px,rgba(255,255,255,.07) 1px,transparent 0);background-size:40px 40px}
.top{position:absolute;top:0;left:0;right:0;height:4px;background:#BC002D}
.side{position:absolute;inset-inline-start:0;top:0;bottom:0;width:6px;background:linear-gradient(#BC002D,transparent)}
.sun{position:absolute;inset-inline-end:-120px;top:-80px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(188,0,45,.2) 0%,transparent 65%)}
.wrap{position:absolute;inset-inline:80px;top:72px}
.badge{display:inline-flex;gap:14px;align-items:center;padding:10px 16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);font-family:Mono,Arabic;font-size:15px;font-weight:700;letter-spacing:.25em;color:#a0a0a0;text-transform:uppercase}
.dot{width:10px;height:10px;background:#BC002D}
h1{margin-top:30px;font-size:${size}px;max-width:1000px}
h1.en{font-family:Dela;line-height:.98;letter-spacing:-.03em;text-transform:uppercase}
h1.ar{font-family:Arabic,Outfit;font-weight:700;line-height:1.3}
.dek{margin-top:26px;max-width:900px;font-size:24px;line-height:1.45;color:rgba(255,255,255,.78);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ar .dek,.dek.ar{font-family:Arabic,Outfit;font-size:26px}
.tags{margin-top:24px;display:flex;gap:10px;flex-wrap:wrap}
.tags span{padding:6px 12px;border:1px solid rgba(0,210,239,.35);font-family:Mono,Arabic;font-size:15px;font-weight:700;color:#00D2EF}
.foot{position:absolute;inset-inline:80px;bottom:52px;display:flex;justify-content:space-between;align-items:center;font-family:Mono;font-size:16px;letter-spacing:.22em;color:rgba(255,255,255,.45);text-transform:uppercase}
.mark{font-family:Dela;font-size:30px;letter-spacing:-.02em;color:#fff;direction:ltr}.mark i{color:#BC002D;font-style:normal}
</style></head><body><div class="grid"></div><div class="sun"></div><div class="top"></div><div class="side"></div>
<div class="wrap">
<div class="badge"><span class="dot"></span>${ar ? "مقال" : "Blog post"}${p.series ? ` · ${esc(p.series)}` : ""}</div>
<h1 class="${ar ? "ar" : "en"}">${esc(p.title)}</h1>
<p class="dek ${ar ? "ar" : ""}">${esc(p.description)}</p>
${tags.length ? `<div class="tags">${tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
</div>
<div class="foot"><span class="mark">AE<i>.</i> <span style="font-family:Mono;font-size:16px;letter-spacing:.22em;color:rgba(255,255,255,.55)">Ahmed Emad Nasr</span></span><span>${ar ? `${p.minutes} دقائق قراءة` : `blog · ${p.minutes} min read`}</span></div>
</body></html>`;
};

const posts = existsSync(POSTS)
  ? readdirSync(POSTS)
      .filter((f) => /\.mdx?$/.test(f))
      .map((f) => {
        const { data, content } = matter(readFileSync(join(POSTS, f), "utf8"));
        return {
          slug: f.replace(/\.mdx?$/, ""),
          title: String(data.title ?? ""),
          description: String(data.description ?? ""),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          series: data.series ? String(data.series) : "",
          lang: data.lang === "ar" ? "ar" : "en",
          minutes: readingTime(content),
        };
      })
      .filter((p) => p.title)
  : [];

mkdirSync(OUT, { recursive: true });
const force = process.argv.includes("--force");
let manifest = {};
try {
  manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
} catch {
  /* first run */
}

const todo = [];
const next = {};
for (const p of posts) {
  const doc = html(p);
  const hash = createHash("sha1").update(doc).digest("hex");
  next[p.slug] = hash;
  if (
    force ||
    manifest[p.slug] !== hash ||
    !existsSync(join(OUT, `${p.slug}.jpg`))
  )
    todo.push({ p, doc });
}

let removed = 0;
for (const f of readdirSync(OUT)) {
  if (f.endsWith(".jpg") && !(f.slice(0, -4) in next)) {
    rmSync(join(OUT, f));
    removed++;
  }
}

if (todo.length) {
  let browser;
  try {
    browser = await chromium.launch();
  } catch {
    console.log(
      "og:posts skipped: Playwright's Chromium isn't installed —  npx playwright install chromium",
    );
    process.exit(0);
  }
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  for (const { p, doc } of todo) {
    await page.setContent(doc, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: join(OUT, `${p.slug}.jpg`),
      type: "jpeg",
      quality: 86,
    });
  }
  await browser.close();
}
writeFileSync(MANIFEST, JSON.stringify(next, null, 2) + "\n");
console.log(
  `post share cards: ${todo.length} drawn · ${posts.length - todo.length} unchanged · ${removed} removed → public/og/posts/`,
);
