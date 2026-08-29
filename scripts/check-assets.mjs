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

/*
 * التعليقات بتتشال قبل الفحص.
 *
 * من غير ده، أي تعليق بيشرح مسار بيتحسب مرجع حقيقي. النسخة الأولى بلّغت
 * عن "Assets/..." و "Assets/…" كملفات ناقصة — وهما جايين من تعليقات أنا
 * كاتبها بتشرح مسارات قديمة. ضوضاء بتغطي على المشاكل الحقيقية.
 *
 * الشيل بسيط عن قصد (مش parser كامل): بيشيل تعليقات /* … *\/ و // … لآخر
 * السطر. ممكن يشيل بالغلط "//" جوه string فيه URL، بس ده مش بيأثر — إحنا
 * بندوّر على مسارات Assets/ المحلية، مش على روابط خارجية.
 */
const stripComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

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
  const src = stripComments(readFileSync(abs, "utf8"));

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

/*
 * تجميع النتايج قبل العرض.
 *
 * السبب: لو مجلد case كامل ناقص، النسخة الأولى كانت هتطبع سطر لكل صورة
 * جواه — 40 سطر لمشكلة واحدة. والأسوأ إن GitHub بيعرض أول 10 annotations
 * بس، فالمهم كان ممكن يتقص.
 *
 * دلوقتي: مجلد ناقص بالكامل = سطر واحد بعدد ملفاته. الملفات الشاردة
 * بتتعرض بالاسم.
 */
const byDir = new Map();
for (const m of missing) {
  const dir = m.path.replace(/\/[^/]*$/, "");
  if (!byDir.has(dir)) byDir.set(dir, { items: [], file: m.file, hint: m.hint });
  byDir.get(dir).items.push(m);
}

/** مجلد يعتبر "ناقص بالكامل" لو هو نفسه مش موجود في public/ */
const dirMissingEntirely = (dir) => !realPaths.has(dir);

const wholeDirs = [];
const strays = [];
for (const [dir, group] of byDir) {
  if (dirMissingEntirely(dir) && group.items.length > 1) wholeDirs.push([dir, group]);
  else strays.push(...group.items);
}

console.error(`\n✖ ${missing.length} missing asset reference(s).\n`);

const inCI = Boolean(process.env.GITHUB_ACTIONS);
const annotate = (title, msg, file) => {
  if (inCI) console.log(`::error file=${file},title=${title}::${msg}`);
};

if (wholeDirs.length > 0) {
  console.error(`── ${wholeDirs.length} directory/directories missing entirely ──\n`);
  for (const [dir, group] of wholeDirs.sort()) {
    const alt = lowerMap.get(dir.toLowerCase());
    const detail = alt
      ? `exists but with different capitalisation: "${alt}"`
      : `not in public/ at all — is it committed?`;
    console.error(`  ${dir}/`);
    console.error(`      ${group.items.length} file(s) reference it — ${detail}`);
    console.error(`      referenced in ${group.file}\n`);
    annotate("Missing directory", `${dir}/ — ${detail} (${group.items.length} files)`, group.file);
  }
}

if (strays.length > 0) {
  console.error(`── ${strays.length} individual file(s) missing ──\n`);
  for (const m of strays.sort((a, b) => a.path.localeCompare(b.path))) {
    console.error(`  ${m.path}`);
    console.error(`      referenced in ${m.file} — ${m.hint}\n`);
    annotate("Missing asset", `${m.path} — ${m.hint}`, m.file);
  }
}

console.error(
  "─".repeat(70) + "\n" +
  "None of these is a code error. They are files the code expects to find in\n" +
  "public/. For each one, decide which side is wrong:\n" +
  "  • the file is not committed        → add it to public/ and commit\n" +
  "  • the path in the config is stale  → fix the path in the config file\n" +
  "  • only the capitalisation differs  → rename the file; GitHub Pages runs\n" +
  "    on Linux and is case-sensitive, so this works locally and 404s live\n",
);

process.exit(1);
