import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";
import chokidar from "chokidar";
import imagemin from "imagemin";
import imageminGifsicle from "imagemin-gifsicle";
import imageminJpegtran from "imagemin-jpegtran";
import imageminOptipng from "imagemin-optipng";
import sharp from "sharp";
import { optimize as optimizeSvg } from "svgo";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const args = new Set(process.argv.slice(2));
const isDryRun = args.has("--dry-run");
const isWatchMode = args.has("--watch");
const targetDirArg = process.argv.find((arg) => arg.startsWith("--dir="));
const targetDir = targetDirArg ? targetDirArg.replace("--dir=", "") : "public";

const IMAGE_GLOB = ["**/*.{png,jpg,jpeg,gif,svg,webp,avif}"];
const IGNORE_GLOBS = ["**/.DS_Store", "**/node_modules/**", "**/.git/**"];

const rootDir = path.resolve(projectRoot, targetDir);
const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif"]);
const recentlyWrittenFiles = new Map();
const inFlightOptimizations = new Set();

const stats = {
  scanned: 0,
  optimized: 0,
  unchanged: 0,
  skipped: 0,
  bytesBefore: 0,
  bytesAfter: 0,
};

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

async function processWithImagemin(filePath, ext) {
  const input = await readFile(filePath);
  const plugins = [];

  if (ext === ".png") {
    plugins.push(imageminOptipng({ optimizationLevel: 3 }));
  } else if (ext === ".jpg" || ext === ".jpeg") {
    plugins.push(imageminJpegtran({ progressive: true }));
  } else if (ext === ".gif") {
    plugins.push(imageminGifsicle({ optimizationLevel: 3, interlaced: true }));
  }

  if (plugins.length === 0) {
    return null;
  }

  const output = await imagemin.buffer(input, { plugins });
  return output;
}

async function processWithSharp(filePath, ext) {
  const input = await readFile(filePath);

  if (ext === ".webp") {
    return sharp(input, { animated: true }).webp({ lossless: true, effort: 6 }).toBuffer();
  }

  if (ext === ".avif") {
    return sharp(input, { animated: true }).avif({ lossless: true, effort: 6 }).toBuffer();
  }

  return null;
}

async function processSvg(filePath) {
  const input = await readFile(filePath, "utf8");
  const result = optimizeSvg(input, {
    path: filePath,
    multipass: true,
    plugins: [
      "preset-default",
      {
        name: "removeViewBox",
        active: false,
      },
    ],
  });

  if (!result.data) {
    return null;
  }

  return Buffer.from(result.data, "utf8");
}

async function optimizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    stats.skipped += 1;
    return;
  }

  if (inFlightOptimizations.has(filePath)) {
    return;
  }

  inFlightOptimizations.add(filePath);

  try {
  const original = await readFile(filePath);
  let optimized = null;

  if (ext === ".svg") {
    optimized = await processSvg(filePath);
  } else if (ext === ".webp" || ext === ".avif") {
    optimized = await processWithSharp(filePath, ext);
  } else {
    optimized = await processWithImagemin(filePath, ext);
  }

  if (!optimized) {
    stats.skipped += 1;
    return;
  }

  stats.bytesBefore += original.byteLength;

  if (optimized.byteLength < original.byteLength) {
    if (!isDryRun) {
      await writeFile(filePath, optimized);
      recentlyWrittenFiles.set(filePath, Date.now());
    }

    stats.optimized += 1;
    stats.bytesAfter += optimized.byteLength;
    console.log(`optimized: ${path.relative(projectRoot, filePath)} (${formatBytes(original.byteLength)} -> ${formatBytes(optimized.byteLength)})`);
  } else {
    stats.unchanged += 1;
    stats.bytesAfter += original.byteLength;
  }
  } finally {
    inFlightOptimizations.delete(filePath);
  }
}

function printSummary() {
  const saved = stats.bytesBefore - stats.bytesAfter;
  const ratio = stats.bytesBefore > 0 ? (saved / stats.bytesBefore) * 100 : 0;

  console.log("\n=== Lossless Image Compression Summary ===");
  console.log(`target dir: ${path.relative(projectRoot, rootDir) || "."}`);
  console.log(`mode: ${isDryRun ? "dry-run (no files written)" : "write"}`);
  console.log(`scanned: ${stats.scanned}`);
  console.log(`optimized: ${stats.optimized}`);
  console.log(`unchanged: ${stats.unchanged}`);
  console.log(`skipped: ${stats.skipped}`);
  console.log(`before: ${formatBytes(stats.bytesBefore)}`);
  console.log(`after: ${formatBytes(stats.bytesAfter)}`);
  console.log(`saved: ${formatBytes(saved)} (${ratio.toFixed(2)}%)`);
}

async function handleWatchEvent(filePath) {
  const normalizedPath = path.resolve(filePath);
  const lastWriteAt = recentlyWrittenFiles.get(normalizedPath);

  // Skip self-triggered events right after this script writes the optimized file.
  if (lastWriteAt && Date.now() - lastWriteAt < 1500) {
    recentlyWrittenFiles.delete(normalizedPath);
    return;
  }

  try {
    await optimizeFile(normalizedPath);
  } catch (error) {
    stats.skipped += 1;
    console.error(`skip: ${path.relative(projectRoot, normalizedPath)} (${error.message})`);
  }
}

function startWatcher() {
  const watcher = chokidar.watch(IMAGE_GLOB, {
    cwd: rootDir,
    ignoreInitial: true,
    ignored: IGNORE_GLOBS,
  });

  watcher.on("add", (relativePath) => {
    void handleWatchEvent(path.join(rootDir, relativePath));
  });

  watcher.on("change", (relativePath) => {
    void handleWatchEvent(path.join(rootDir, relativePath));
  });

  watcher.on("error", (error) => {
    console.error(`watch error: ${error.message}`);
  });

  console.log(`watching for new/updated images in ${path.relative(projectRoot, rootDir) || "."} ...`);
}

async function main() {
  const files = await fg(IMAGE_GLOB, {
    cwd: rootDir,
    absolute: true,
    onlyFiles: true,
    ignore: IGNORE_GLOBS,
  });

  stats.scanned = files.length;

  for (const filePath of files) {
    try {
      await optimizeFile(filePath);
    } catch (error) {
      stats.skipped += 1;
      console.error(`skip: ${path.relative(projectRoot, filePath)} (${error.message})`);
    }
  }

  printSummary();

  if (isWatchMode) {
    startWatcher();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
