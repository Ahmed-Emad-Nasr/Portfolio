import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public");
const TARGET_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

const stats = {
  scanned: 0,
  compressed: 0,
  skipped: 0,
  failed: 0,
  bytesBefore: 0,
  bytesAfter: 0,
};

const CONCURRENCY = 8;
const PROGRESS_EVERY = 100;

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!TARGET_EXTENSIONS.has(ext)) continue;
    files.push(fullPath);
  }

  return files;
};

const encodeByExtension = (instance, ext) => {
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return instance.jpeg({ quality: 72, mozjpeg: true, chromaSubsampling: "4:2:0" });
    case ".png":
      return instance.png({ compressionLevel: 9, palette: true, quality: 70, effort: 10 });
    case ".webp":
      return instance.webp({ quality: 70, alphaQuality: 65, effort: 6 });
    case ".avif":
      return instance.avif({ quality: 50, effort: 6 });
    default:
      return instance;
  }
};

const compressFile = async (filePath) => {
  stats.scanned += 1;

  const ext = path.extname(filePath).toLowerCase();
  const original = await fs.readFile(filePath);
  stats.bytesBefore += original.byteLength;

  try {
    const base = sharp(original, { failOn: "none", animated: false }).rotate();
    const encoded = await encodeByExtension(base, ext).toBuffer();

    // Replace only if meaningfully smaller (>=2% reduction)
    const reductionRatio = encoded.byteLength / original.byteLength;
    if (reductionRatio < 0.98 && encoded.byteLength > 0) {
      await fs.writeFile(filePath, encoded);
      stats.compressed += 1;
      stats.bytesAfter += encoded.byteLength;
      return;
    }

    stats.skipped += 1;
    stats.bytesAfter += original.byteLength;
  } catch {
    stats.failed += 1;
    stats.bytesAfter += original.byteLength;
  }
};

const runWithConcurrency = async (files) => {
  let cursor = 0;

  const worker = async () => {
    while (cursor < files.length) {
      const index = cursor;
      cursor += 1;
      await compressFile(files[index]);

      if (stats.scanned % PROGRESS_EVERY === 0) {
        console.log(`Processed ${stats.scanned}/${files.length} images...`);
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
};

const formatMB = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

const main = async () => {
  const files = await walk(ROOT);
  await runWithConcurrency(files);

  const saved = stats.bytesBefore - stats.bytesAfter;
  const savedPct = stats.bytesBefore > 0 ? ((saved / stats.bytesBefore) * 100).toFixed(2) : "0.00";

  console.log("Image compression complete");
  console.log(`Scanned: ${stats.scanned}`);
  console.log(`Compressed: ${stats.compressed}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Before: ${formatMB(stats.bytesBefore)}`);
  console.log(`After: ${formatMB(stats.bytesAfter)}`);
  console.log(`Saved: ${formatMB(saved)} (${savedPct}%)`);
};

main().catch((error) => {
  console.error("Compression failed:", error);
  process.exitCode = 1;
});
