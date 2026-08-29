/*
 * scripts/check-links.mjs
 *
 * بيزحف على `out/` بعد الـ build وبيتأكد إن كل لينك داخلي بيوصل لملف
 * موجود فعلاً.
 *
 * الفحص ده كان هيمسك الخطأين اللي وصلوا للإنتاج:
 *  - /blog/soc-analyst-cv — كارت بيلينك على صفحة generateStaticParams
 *    مبيولّدهاش
 *  - أي مسار أصل اتغيّر في الكود ومااتغيرش على القرص
 *
 * تشغيل:  npm run build && node scripts/check-links.mjs
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");

if (!existsSync(OUT)) {
  console.error("✖ out/ not found. Run `npm run build` first.");
  process.exit(1);
}

/* لازم يطابق basePath بتاع next.config.mjs. لو غيّرته، غيّره هنا. */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/Portfolio";

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else files.push(full);
  }
};
walk(OUT);

/** كل عنوان يقدر الموقع يخدمه */
const servable = new Set();
for (const f of files) {
  const rel = "/" + relative(OUT, f).split(/[\\/]/).join("/");
  servable.add(rel);
  if (rel.endsWith(".html")) {
    servable.add(rel.slice(0, -5));                    // /blog/x.html → /blog/x
    if (rel.endsWith("/index.html")) servable.add(rel.slice(0, -11) || "/");
  }
}

const broken = new Map();
/*
 * الـ thumbnails حالة خاصة.
 *
 * getThumbnail() بيولّد "X-thumb.webp" لكل صورة. لو الملف مش موجود،
 * الكومبوننتس بترجع للصورة الكاملة — فالصفحة شغالة والزائر مش شايف حاجة
 * مكسورة. مجرد إن المتصفح بيحمّل صورة أكبر من اللازم.
 *
 * لو حسبناها أخطاء، الـ CI هيفضل أحمر على حاجة مش كاسرة — وأي فحص بيفضل
 * أحمر بيتجاهل. فبتتعد تحذير، والعدد بيتعرض عشان تعرف حجم المشكلة.
 */
const missingThumbs = new Map();
let checkedLinks = 0;

for (const f of files.filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(f, "utf8");
  const from = relative(OUT, f);

  for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    // الـ chunks بتاعة Next اسمها بيتولّد، مش محتاجة فحص
    if (href.startsWith("/_next/")) continue;

    checkedLinks++;

    // شيل الـ basePath عشان نقارن بمسارات out/
    const path = href.startsWith(BASE_PATH) ? href.slice(BASE_PATH.length) || "/" : href;
    const trimmed = path.replace(/\/$/, "") || "/";

    const candidates = [path, trimmed, `${trimmed}.html`, `${trimmed}/index.html`];
    if (trimmed === "/") candidates.push("/index.html");

    if (candidates.some((c) => servable.has(c))) continue;

    const target = /-thumb\.(webp|png|jpe?g)$/i.test(href) ? missingThumbs : broken;
    if (!target.has(href)) target.set(href, new Set());
    target.get(href).add(from);
  }
}

console.log(`Checked ${checkedLinks} internal link(s) across ${files.filter((f) => f.endsWith(".html")).length} page(s).`);

if (missingThumbs.size > 0) {
  const dirs = new Set([...missingThumbs.keys()].map((h) => h.replace(/\/[^/]*$/, "")));
  console.warn(
    `\n⚠ ${missingThumbs.size} thumbnail(s) missing across ${dirs.size} folder(s).\n` +
    `  Not a failure: the components fall back to the full-size image, so the\n` +
    `  page renders correctly. But the browser then downloads the large file\n` +
    `  where a thumbnail was intended — this is the single biggest payload\n` +
    `  problem on the site. Run your image script over these folders.\n`,
  );
}

if (broken.size === 0) {
  console.log("✔ No broken internal links.");
  process.exit(0);
}

console.error(`\n✖ ${broken.size} broken internal link(s):\n`);

const inCI = Boolean(process.env.GITHUB_ACTIONS);

for (const [href, pages] of [...broken].sort()) {
  const from = [...pages].slice(0, 3).join(", ");
  const more = pages.size > 3 ? ` (+${pages.size - 3} more)` : "";
  console.error(`  ${href}`);
  console.error(`      linked from: ${from}${more}\n`);
  if (inCI) {
    console.log(`::error title=Broken link::${href} — linked from ${from}${more}`);
  }
}

console.error(
  "\nEach of these is a link on a built page pointing at a file that does not\n" +
  "exist in out/. Common causes: a page id that generateStaticParams does not\n" +
  "emit, or an asset path that no longer matches public/.\n",
);

process.exit(1);
