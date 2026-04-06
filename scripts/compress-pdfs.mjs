import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";
import chokidar from "chokidar";
import { PDFDocument } from "pdf-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const args = new Set(process.argv.slice(2));
const isDryRun = args.has("--dry-run");
const isWatchMode = args.has("--watch");
const targetDirArg = process.argv.find((arg) => arg.startsWith("--dir="));
const targetDir = targetDirArg ? targetDirArg.replace("--dir=", "") : "public";

const PDF_GLOB = ["**/*.pdf"];
const IGNORE_GLOBS = ["**/.DS_Store", "**/node_modules/**", "**/.git/**"];

const rootDir = path.resolve(projectRoot, targetDir);
const SUPPORTED_EXTENSION = ".pdf";
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

async function optimizePdf(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== SUPPORTED_EXTENSION) {
    stats.skipped += 1;
    return;
  }

  if (inFlightOptimizations.has(filePath)) {
    return;
  }

  inFlightOptimizations.add(filePath);

  try {
    const original = await readFile(filePath);
    let pdfDocument;

    try {
      pdfDocument = await PDFDocument.load(original);
    } catch (error) {
      stats.skipped += 1;
      console.error(`skip: ${path.relative(projectRoot, filePath)} (${error.message})`);
      return;
    }

    const optimized = await pdfDocument.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false,
    });

    stats.bytesBefore += original.byteLength;

    if (optimized.byteLength < original.byteLength) {
      if (!isDryRun) {
        await writeFile(filePath, optimized);
        recentlyWrittenFiles.set(filePath, Date.now());
      }

      stats.optimized += 1;
      stats.bytesAfter += optimized.byteLength;
      console.log(
        `optimized: ${path.relative(projectRoot, filePath)} (${formatBytes(original.byteLength)} -> ${formatBytes(optimized.byteLength)})`,
      );
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

  console.log("\n=== PDF Compression Summary ===");
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

  if (lastWriteAt && Date.now() - lastWriteAt < 1500) {
    recentlyWrittenFiles.delete(normalizedPath);
    return;
  }

  try {
    await optimizePdf(normalizedPath);
  } catch (error) {
    stats.skipped += 1;
    console.error(`skip: ${path.relative(projectRoot, normalizedPath)} (${error.message})`);
  }
}

function startWatcher() {
  const watcher = chokidar.watch(PDF_GLOB, {
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

  console.log(`watching for new/updated PDFs in ${path.relative(projectRoot, rootDir) || "."} ...`);
}

async function main() {
  const files = await fg(PDF_GLOB, {
    cwd: rootDir,
    absolute: true,
    onlyFiles: true,
    ignore: IGNORE_GLOBS,
  });

  stats.scanned = files.length;

  for (const filePath of files) {
    try {
      await optimizePdf(filePath);
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
