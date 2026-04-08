import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const args = new Set(process.argv.slice(2));
const isDryRun = args.has("--dry-run");
const isForce = args.has("--force");
const sourceArg = process.argv.find((arg) => arg.startsWith("--src="));
const sourceDir = sourceArg ? sourceArg.replace("--src=", "") : "public/Assets";

const SOURCE_ROOT = path.resolve(projectRoot, sourceDir);
const OUTPUT_ROOT = path.resolve(SOURCE_ROOT, "_responsive");

const SOURCE_GLOB = ["**/*.{png,jpg,jpeg,webp}"];
const IGNORE_GLOBS = ["**/_responsive/**", "**/node_modules/**", "**/.git/**"];
const TARGET_WIDTHS = [320, 480, 640, 768, 960, 1200, 1600];
const TARGET_FORMATS = ["webp", "avif"];

const stats = {
  scanned: 0,
  generated: 0,
  skipped: 0,
};

async function shouldGenerate(sourcePath, outputPath) {
  if (isForce) return true;

  try {
    const [sourceInfo, outputInfo] = await Promise.all([stat(sourcePath), stat(outputPath)]);
    return sourceInfo.mtimeMs > outputInfo.mtimeMs;
  } catch {
    return true;
  }
}

async function generateVariants(sourcePath) {
  const relativePath = path.relative(SOURCE_ROOT, sourcePath);
  const ext = path.extname(relativePath);
  const baseName = path.basename(relativePath, ext);
  const relativeDir = path.dirname(relativePath);
  const outputDir = path.join(OUTPUT_ROOT, relativeDir);

  const image = sharp(sourcePath, { animated: false });
  const metadata = await image.metadata();
  const sourceWidth = metadata.width ?? 0;

  if (sourceWidth === 0) {
    stats.skipped += 1;
    return;
  }

  await mkdir(outputDir, { recursive: true });

  for (const width of TARGET_WIDTHS) {
    if (width > sourceWidth) continue;

    for (const format of TARGET_FORMATS) {
      const outputFile = path.join(outputDir, `${baseName}-w${width}.${format}`);
      const writeNeeded = await shouldGenerate(sourcePath, outputFile);
      if (!writeNeeded) {
        stats.skipped += 1;
        continue;
      }

      if (isDryRun) {
        stats.generated += 1;
        continue;
      }

      const pipeline = sharp(sourcePath).resize({ width, withoutEnlargement: true });
      if (format === "avif") {
        await pipeline.avif({ quality: 58, effort: 6 }).toFile(outputFile);
      } else {
        await pipeline.webp({ quality: 72, effort: 6 }).toFile(outputFile);
      }
      stats.generated += 1;
    }
  }
}

async function main() {
  const sourceFiles = await fg(SOURCE_GLOB, {
    cwd: SOURCE_ROOT,
    absolute: true,
    onlyFiles: true,
    ignore: IGNORE_GLOBS,
  });

  stats.scanned = sourceFiles.length;

  for (const sourcePath of sourceFiles) {
    await generateVariants(sourcePath);
  }

  console.log("\n=== Responsive Image Generation Summary ===");
  console.log(`source: ${path.relative(projectRoot, SOURCE_ROOT)}`);
  console.log(`output: ${path.relative(projectRoot, OUTPUT_ROOT)}`);
  console.log(`mode: ${isDryRun ? "dry-run" : "write"}`);
  console.log(`scanned: ${stats.scanned}`);
  console.log(`generated: ${stats.generated}`);
  console.log(`skipped: ${stats.skipped}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
