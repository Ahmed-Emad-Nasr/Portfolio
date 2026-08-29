/*
 * scripts/generate-thumbs.mjs
 *
 * بيولّد نسخة مصغّرة "X-thumb.webp" جنب كل صورة في public/Assets.
 *
 * ── ليه الملف ده موجود ────────────────────────────────────────────────────
 *
 * getThumbnail() في الكود بيحوّل "1.webp" لـ "1-thumb.webp"، وكل كومبوننت
 * بيعرض صورة بيمرّ عليها. **ولا صورة واحدة في مكتبة الـ cases كان ليها
 * نسخة مصغّرة — صفر من 762.**
 *
 * الكومبوننتس بترجع للصورة الكاملة لما الـ thumb مش موجود، فمحدش لاحظ:
 * الصفحة شكلها سليم. بس صفحة البلوج بتحمّل 78 صورة بالحجم الكامل (39 كارت
 * × صورتين)، وده حوالي 32 ميجا بتتقدّم للزائر كـ thumbnails.
 *
 * ── ليه sharp ─────────────────────────────────────────────────────────────
 *
 * موجود عندك في devDependencies أصلاً (Next بيستخدمه لمعالجة الصور)، فمفيش
 * حاجة جديدة تتثبّت. ومفيش داعي لسكربت Python منفصل.
 *
 * ── التشغيل ───────────────────────────────────────────────────────────────
 *
 *   npm run thumbs             بيولّد الناقص بس
 *   npm run thumbs -- --dry    بيقولك هيعمل إيه من غير ما يكتب
 *   npm run thumbs -- --force  بيعيد توليد كل حاجة
 *   npm run thumbs -- --all    يشمل PNG/JPEG وباقي المجلدات كمان
 */

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, extname, basename, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

/*
 * أعرض مقاس بتتعرض بيه صورة مصغّرة في التصميم هو الكارت المميز في صفحة
 * البلوج (~40vw). عند 1920px شاشة ده حوالي 770px — بس الصورة دي بتتعرض
 * بـ object-fit داخل صندوق ثابت، فـ 640 كفاية وزيادة، وبتوفّر أكتر.
 *
 * لو لاحظت أي صورة مصغّرة باينة مهزوزة، زوّد الرقم ده وشغّل بـ --force.
 */
const THUMB_WIDTH = 640;
const THUMB_QUALITY = 72;

const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const DRY = args.has("--dry");

if (!existsSync(PUBLIC)) {
  console.error("✖ public/ not found.");
  process.exit(1);
}

const SOURCE_EXT = /\.(webp|png|jpe?g)$/i;

/*
 * مش كل صورة في public/ محتاجة نسخة مصغّرة. اللي محتاجها هي اللي الكود
 * بيمرّرها على getThumbnail() — يعني صور الـ cases بس.
 *
 * اللي بيتستثنى ولّيه:
 *
 *  • غير .webp — كل مسارات الصور في الـ config بـ .webp. الـ 452 ملف PNG
 *    في public/ مش مذكورين في أي كود (نسخ قديمة قاعدة جنب الـ webp)،
 *    فتوليد thumbs ليهم شغل ضايع ومساحة ضايعة.
 *
 *  • image_display_thumb/ — الجاليري بيشاور على المجلد ده مباشرة، مش عن
 *    طريق getThumbnail. الصور اللي جواه **هي** النسخ المصغّرة، فتوليد
 *    "9-thumb.webp" جوه مجلد اسمه _thumb تكرار مالوش معنى.
 *
 * `--all` بيلغي الاستثناءات دي لو احتجتها.
 */
const ALL = args.has("--all");

const shouldProcess = (relPath) => {
  if (ALL) return true;
  /*
   * .webp و .jpeg بس.
   *
   * الـ 452 ملف PNG في public/ مش مذكورين في أي كود — نسخ قديمة قاعدة جنب
   * الـ webp. توليد thumbs ليهم شغل ومساحة على الفاضي.
   *
   * الـ .jpeg موجود لأن فيه صورة واحدة على الأقل بالامتداد ده في الـ config
   * (Depi R4 Project/1.jpeg)، و getThumbnail بيحافظ على الامتداد.
   */
  if (!/\.(webp|jpe?g)$/i.test(relPath)) return false;
  if (relPath.includes("image_display_thumb/")) return false;
  /*
   * Assets/Cases/thumbnails/ فيه 232 صورة مصغّرة من محاولة سابقة، بأسماء
   * مسطّحة من نوع "Folder__File.webp". الكود مبيشاورش عليها خالص — هو
   * بيدوّر على "X-thumb.webp" جنب الصورة الأصلية.
   *
   * فهي لا بتتستخدم كمصدر (مش صور أصلية) ولا محتاجة نسخ مصغّرة لنفسها.
   */
  if (relPath.startsWith("Assets/Cases/thumbnails/")) return false;
  return relPath.startsWith("Assets/Cases/");
};

/** كل الصور اللي مش نسخة مصغّرة أصلاً */
const images = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!SOURCE_EXT.test(entry) || /-thumb\.\w+$/i.test(entry)) continue;

    const rel = relative(PUBLIC, full).split(/[\\/]/).join("/");
    if (shouldProcess(rel)) images.push(full);
  }
};
walk(PUBLIC);

/*
 * getThumbnail بيحافظ على الامتداد الأصلي: "1.png" → "1-thumb.png".
 * فلازم نكتب بنفس الامتداد وإلا الكود هيدوّر على ملف مش هنعمله.
 */
const thumbPathFor = (file) => {
  const ext = extname(file);
  return join(dirname(file), `${basename(file, ext)}-thumb${ext}`);
};

let created = 0;
let skipped = 0;
let failed = 0;
let sourceBytes = 0;
let thumbBytes = 0;

for (const file of images) {
  const target = thumbPathFor(file);

  if (!FORCE && existsSync(target)) {
    skipped++;
    continue;
  }

  const rel = relative(PUBLIC, file).split(/[\\/]/).join("/");

  if (DRY) {
    console.log(`would create  ${rel.replace(SOURCE_EXT, "-thumb$&")}`);
    created++;
    continue;
  }

  try {
    const pipeline = sharp(file).resize({
      width: THUMB_WIDTH,
      // مفيش تكبير: الصورة الأصغر من العرض ده بتتنسخ زي ما هي
      withoutEnlargement: true,
    });

    const ext = extname(file).toLowerCase();
    if (ext === ".png") pipeline.png({ quality: THUMB_QUALITY, compressionLevel: 9 });
    else if (ext === ".jpg" || ext === ".jpeg") pipeline.jpeg({ quality: THUMB_QUALITY, mozjpeg: true });
    else pipeline.webp({ quality: THUMB_QUALITY });

    await pipeline.toFile(target);

    sourceBytes += statSync(file).size;
    thumbBytes += statSync(target).size;
    created++;

    if (created % 50 === 0) console.log(`  … ${created} generated`);
  } catch (error) {
    failed++;
    console.error(`✖ ${rel}: ${error instanceof Error ? error.message : error}`);
  }
}

console.log("");
console.log(`Source images found : ${images.length}`);
console.log(`Thumbnails created  : ${created}${DRY ? " (dry run — nothing written)" : ""}`);
console.log(`Already present     : ${skipped}`);
if (failed > 0) console.log(`Failed              : ${failed}`);

if (!DRY && created > 0 && sourceBytes > 0) {
  const mb = (b) => (b / 1024 / 1024).toFixed(1);
  const saved = sourceBytes - thumbBytes;
  console.log("");
  console.log(`Full-size total     : ${mb(sourceBytes)} MB`);
  console.log(`Thumbnail total     : ${mb(thumbBytes)} MB`);
  console.log(`Saved per full load : ${mb(saved)} MB (${Math.round((saved / sourceBytes) * 100)}% smaller)`);
  console.log("");
  console.log("Commit the new -thumb files, then run `npm run check:links` to confirm.");
}

process.exit(failed > 0 ? 1 : 0);
