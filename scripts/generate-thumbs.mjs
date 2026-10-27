/*
 * generate-thumbs.mjs — an "X-thumb.webp" next to every case image in
 * public/Assets (getThumbnail() in lib/shared.ts points at them; without
 * one, the full-size image is downloaded instead).
 *
 *   npm run thumbs             only what's missing
 *   npm run thumbs -- --dry    show what it would do
 *   npm run thumbs -- --force  regenerate everything
 *   npm run thumbs -- --all    include PNG/JPEG and the other folders
 */

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, extname, basename, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

/* Cards show thumbnails with object-fit in a fixed box: 640px is plenty */
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

/* Only case images go through getThumbnail(): .webp/.jpeg under Assets/Cases/
   (not the gallery's own _thumb folder or old Assets/Cases/thumbnails/).
   --all lifts these limits. */
const ALL = args.has("--all");

const shouldProcess = (relPath) => {
  if (ALL) return true;
  if (!/\.(webp|jpe?g)$/i.test(relPath)) return false;
  if (relPath.includes("image_display_thumb/")) return false;
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
