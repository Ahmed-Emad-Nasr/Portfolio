/*
 * scripts/check-assets.mjs
 *
 * بيتأكد إن كل ملف بيشاور عليه أي config موجود فعلاً في public/.
 *
 * ليه ده أهم فحص في المشروع؟ لأن ده بالظبط نوع الخطأ اللي مبيبانش:
 * الـ build بينجح، وTypeScript مبيزعقش، والصفحة بتفتح عادي — وصورة أو
 * PDF بيرجّع 404 لزائر واحد بس هو اللي بيدوس عليه. وإنت مش هتعرف.
 *
 * الأخطاء اللي كان الفحص ده هيمسكها:
 *  - اسم مجلد case اتغيّر والمسارات مااتغيرتش
 *  - PDF مش مرفوع أصلاً
 *  - صورة اتمسحت من public/
 *  - حرف كابيتال في اسم ملف (شغّال على ويندوز، بيقع على لينكس/GitHub Pages)
 *
 * تشغيل:  node scripts/check-assets.mjs
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

if (!existsSync(PUBLIC)) {
  console.error(`✖ public/ not found at ${PUBLIC}`);
  process.exit(1);
}

/*
 * بنقرا مسارات الأصول من ملفات الـ config كنص بدل ما نستوردها: الملفات
 * TypeScript، ولو استوردناها هنحتاج مترجم. الـ regex كفاية — إحنا بندوّر
 * على أي نص شكله مسار جوه Assets/.
 */
const CONFIG_FILES = [
  "app/core/config/cases.ts",
  "app/core/config/projects.ts",
  "app/core/config/youtube.ts",
  "app/core/config/cv.ts",
  "app/core/config/experience.ts",
  "app/blog/page.tsx",
  "app/blog/page-client.tsx",
  "app/components/home/sensei-home.tsx",
  "app/components/art_gallery/sensei-art.tsx",
  "app/layout.tsx",
];

const ASSET_RE = /["'`](\/?Assets\/[^"'`\\$]+)["'`]/g;
/* المسارات المبنية بـ template literal (زي `Assets/Cases/X/${i + 1}.webp`)
   مش ممكن تتقري ثابتة — بنستخرج المجلد ونتأكد إنه موجود على الأقل. */
const TEMPLATE_RE = /["'`](\/?Assets\/[^"'`]*?)\$\{/g;

const missing = [];
const checkedDirs = new Set();
let checked = 0;

/** ملفات public/ كلها، بحروفها الأصلية — عشان نمسك اختلاف الـ case */
const realPaths = new Set();
const walk = (dir, prefix = "") => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    realPaths.add(rel);
    if (statSync(full).isDirectory()) walk(full, rel);
  }
};
walk(PUBLIC);

const lowerMap = new Map();
for (const p of realPaths) lowerMap.set(p.toLowerCase(), p);

for (const file of CONFIG_FILES) {
  const abs = join(ROOT, file);
  if (!existsSync(abs)) continue;
  const src = readFileSync(abs, "utf8");

  for (const [, raw] of src.matchAll(ASSET_RE)) {
    const rel = raw.replace(/^\//, "");
    checked++;
    if (realPaths.has(rel)) continue;

    const alt = lowerMap.get(rel.toLowerCase());
    missing.push({
      file,
      path: rel,
      hint: alt ? `case mismatch — the real file is "${alt}"` : "not found in public/",
    });
  }

  for (const [, raw] of src.matchAll(TEMPLATE_RE)) {
    const dir = raw.replace(/^\//, "").replace(/\/[^/]*$/, "");
    if (!dir || checkedDirs.has(dir)) continue;
    checkedDirs.add(dir);
    checked++;
    if (realPaths.has(dir)) continue;
    const alt = lowerMap.get(dir.toLowerCase());
    missing.push({
      file,
      path: `${dir}/  (directory, referenced by a template literal)`,
      hint: alt ? `case mismatch — the real directory is "${alt}"` : "not found in public/",
    });
  }
}

console.log(`Checked ${checked} asset reference(s) across ${CONFIG_FILES.length} config file(s).`);

if (missing.length === 0) {
  console.log("✔ Every referenced asset exists in public/.");
  process.exit(0);
}

console.error(`\n✖ ${missing.length} missing asset(s):\n`);
for (const m of missing) {
  console.error(`  ${m.path}`);
  console.error(`      referenced in ${m.file} — ${m.hint}\n`);
}
process.exit(1);
