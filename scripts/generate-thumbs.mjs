/*
 * scripts/generate-thumbs.mjs
 *
 * Generates an "X-thumb.webp" thumbnail next to every image in public/Assets.
 *
 * ── Why this file exists ──────────────────────────────────────────────────
 *
 * getThumbnail() in the code turns "1.webp" into "1-thumb.webp", and every component
 * that shows an image goes through it. **Not a single image in the case library had
 * a thumbnail — zero out of 762.**
 *
 * Components fall back to the full image when the thumb is missing, so nobody noticed:
 * the page looks fine. But the blog page loads 78 full-size images (39 cards
 * × 2 images), which is about 32 MB served to the visitor as "thumbnails".
 *
 * ── Why sharp ─────────────────────────────────────────────────────────────
 *
 * It's already in devDependencies (Next uses it for image processing), so there's
 * nothing new to install. And no need for a separate Python script.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────
 *
 *   npm run thumbs             generate only what's missing
 *   npm run thumbs -- --dry    show what it would do without writing
 *   npm run thumbs -- --force  regenerate everything
 *   npm run thumbs -- --all    include PNG/JPEG and the remaining folders too
 */

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, extname, basename, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

/*
 * The widest size a thumbnail is shown at in the design is the featured card on the
 * blog page (~40vw). On a 1920px screen that's about 770px — but the image is shown
 * with object-fit inside a fixed box, so 640 is more than enough and saves more.
 *
 * If any thumbnail ever looks blurry, raise this number and run with --force.
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
 * Not every image in public/ needs a thumbnail. The ones that do are those the code
 * passes through getThumbnail() — i.e. case images only.
 *
 * What's excluded and why:
 *
 *  • Non-.webp — every image path in the config is .webp. The 452 PNG files
 *    in public/ aren't referenced by any code (old copies sitting next to the webp),
 *    so generating thumbs for them is wasted work and wasted space.
 *
 *  • image_display_thumb/ — the gallery references this folder directly, not via
 *    getThumbnail. The images inside it **are** the thumbnails, so generating
 *    "9-thumb.webp" inside a folder named _thumb is pointless duplication.
 *
 * `--all` disables these exclusions if you need it.
 */
const ALL = args.has("--all");

const shouldProcess = (relPath) => {
  if (ALL) return true;
  /*
   * .webp and .jpeg only.
   *
   * The 452 PNG files in public/ aren't referenced by any code — old copies sitting next to
   * the webp. Generating thumbs for them wastes work and space.
   *
   * .jpeg is included because at least one image in the config uses that extension
   * (Depi R4 Project/1.jpeg), and getThumbnail preserves the extension.
   */
  if (!/\.(webp|jpe?g)$/i.test(relPath)) return false;
  if (relPath.includes("image_display_thumb/")) return false;
  /*
   * Assets/Cases/thumbnails/ holds 232 thumbnails from an earlier attempt, with
   * flat names like "Folder__File.webp". The code never references them — it
   * looks for "X-thumb.webp" next to the original image.
   *
   * So they're neither a source (not originals) nor in need of thumbnails themselves.
   */
  if (relPath.startsWith("Assets/Cases/thumbnails/")) return false;
  return relPath.startsWith("Assets/Cases/");
};

/** Every image that isn't already a thumbnail */
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
 * getThumbnail preserves the original extension: "1.png" → "1-thumb.png".
 * So we must write with the same extension, or the code will look for a file we never created.
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
      // No upscaling: images narrower than this width are copied as-is
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
