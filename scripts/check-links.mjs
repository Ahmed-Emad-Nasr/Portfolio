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

    if (!broken.has(href)) broken.set(href, new Set());
    broken.get(href).add(from);
  }
}

console.log(`Checked ${checkedLinks} internal link(s) across ${files.filter((f) => f.endsWith(".html")).length} page(s).`);

if (broken.size === 0) {
  console.log("✔ No broken internal links.");
  process.exit(0);
}

console.error(`\n✖ ${broken.size} broken internal link(s):\n`);
for (const [href, pages] of [...broken].sort()) {
  console.error(`  ${href}`);
  console.error(`      linked from: ${[...pages].slice(0, 3).join(", ")}${pages.size > 3 ? ` (+${pages.size - 3} more)` : ""}\n`);
}
process.exit(1);
