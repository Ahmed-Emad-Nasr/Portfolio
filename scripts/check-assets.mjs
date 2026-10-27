/*
 * check-assets.mjs — every Assets/ path named in the data and components
 * exists in public/ (exact case: GitHub Pages is case-sensitive). The build
 * and TypeScript cannot catch a missing image or PDF.
 *
 *   npm run check:assets
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

/* Every file that names a path under public/Assets/ (data, and the few
   components and pages that point at an image directly) */
const CONFIG_FILES = [
  "data/cases.ts",
  "data/case-details.ts",
  "data/certifications.ts",
  "data/cv.ts",
  "data/experience.ts",
  "data/portfolio-data.ts",
  "data/projects.ts",
  "data/youtube.ts",
  "components/home/HeroSection.tsx",
  "app/layout.tsx",
];

/* Comments are stripped first, so a path mentioned in a comment is not a reference */
const stripComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

const ASSET_RE = /["'`](\/?Assets\/[^"'`\\$]+)["'`]/g;
/* Paths built with a template literal (like `Assets/Cases/X/${i + 1}.webp`)
   can't be read statically — we extract the folder and at least confirm it exists. */
const TEMPLATE_RE = /["'`](\/?Assets\/[^"'`]*?)\$\{/g;

/* Array.from ranges (`Screenshot (${343 + i}).webp`) are expanded and every
   file checked: a gap in the numbering is a missing image */
const LOOP_RE =
  /Array\.from\(\s*\{\s*length:\s*(\d+)\s*\}\s*,\s*\(_,\s*i\)\s*=>\s*`([^`]*?)\$\{\s*(?:(\d+)\s*\+\s*i|i\s*\+\s*(\d+))\s*\}([^`]*?)`/g;

/** Unrolls the loop into concrete paths */
const expandLoop = (length, prefix, base, suffix) => {
  const out = [];
  for (let i = 0; i < length; i++) out.push(`${prefix}${base + i}${suffix}`);
  return out;
};

/* For a missing file, show what IS in its folder (usually makes the fix obvious) */
const listDir = (dir, limit = 12) => {
  const entries = [...realPaths]
    .filter((p) => p.startsWith(`${dir}/`) && !p.slice(dir.length + 1).includes("/"))
    .map((p) => p.slice(dir.length + 1))
    .sort();

  if (entries.length === 0) return null;
  const shown = entries.slice(0, limit);
  const more = entries.length > limit ? ` … (+${entries.length - limit} more)` : "";
  return { count: entries.length, text: shown.join(", ") + more };
};

const missing = [];
/** Missing thumbnails — a warning, not an error (components have a fallback) */
const missingThumbs = new Set();
const checkedDirs = new Set();
let checked = 0;

/** All files in public/, with their original casing — to catch case mismatches */
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

  /* Images are shown through getThumbnail() ("1.webp" → "1-thumb.webp"), so check the thumbnail too */
  for (const [, raw] of src.matchAll(ASSET_RE)) {
    const rel = raw.replace(/^\//, "");
    if (!/\.(webp|png|jpe?g)$/i.test(rel)) continue;
    /*
     * getThumbnail() applies only to case images — the cards and the evidence grid.
     * The logo, for example, is shown via its direct path and never goes through it, so asking for a thumbnail
     * of it would be a false warning.
     */
    if (!rel.startsWith("Assets/Cases/")) continue;
    const thumb = rel.replace(/(\.\w+)$/, "-thumb$1");
    if (realPaths.has(rel) && !realPaths.has(thumb)) missingThumbs.add(thumb);
  }

  /* Unrolled loops — every file by name, not just the folder */
  const loopCovered = new Set();
  for (const [, len, prefix, baseA, baseB, suffix] of src.matchAll(LOOP_RE)) {
    const base = Number(baseA ?? baseB);
    if (!prefix.includes("Assets/")) continue;

    for (const path of expandLoop(Number(len), prefix, base, suffix)) {
      const rel = path.replace(/^\//, "");
      loopCovered.add(rel.replace(/\/[^/]*$/, ""));
      checked++;
      if (realPaths.has(rel)) continue;
      const alt = lowerMap.get(rel.toLowerCase());
      missing.push({
        file,
        path: rel,
        hint: alt
          ? `case mismatch — the real file is "${alt}"`
          : "not found — a generated sequence assumes consecutive numbering, and this number is a gap",
      });
    }
  }

  for (const [, raw] of src.matchAll(TEMPLATE_RE)) {
    const dir = raw.replace(/^\//, "").replace(/\/[^/]*$/, "");
    /* Already checked file by file above — no need to check the folder again */
    if (loopCovered.has(dir)) continue;
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

if (missingThumbs.size > 0) {
  console.warn(
    `\n⚠ ${missingThumbs.size} image(s) have no -thumb variant. The components fall\n` +
    `  back to the full-size file, so nothing is visibly broken — but the browser\n` +
    `  downloads the large image where a thumbnail was intended.\n` +
    `  Re-run your image script over these folders:\n`,
  );
  const dirs = new Set([...missingThumbs].map((t) => t.replace(/\/[^/]*$/, "")));
  for (const d of [...dirs].sort()) console.warn(`    ${d}/`);
  console.warn("");
}

if (missing.length === 0) {
  console.log("✔ Every referenced asset exists in public/.");
  process.exit(0);
}

/* A fully missing folder is one line (with its file count), not one per file */
const byDir = new Map();
for (const m of missing) {
  const dir = m.path.replace(/\/[^/]*$/, "");
  if (!byDir.has(dir)) byDir.set(dir, { items: [], file: m.file, hint: m.hint });
  byDir.get(dir).items.push(m);
}

/** A folder counts as "fully missing" if the folder itself doesn't exist in public/ */
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
    console.error(`      referenced in ${group.file}`);

    const parent = dir.replace(/\/[^/]*$/, "");
    const siblings = parent !== dir ? listDir(parent) : null;
    if (siblings) {
      console.error(`      its parent "${parent}/" contains ${siblings.count} item(s):`);
      console.error(`        ${siblings.text}`);
    }
    console.error("");
    annotate("Missing directory", `${dir}/ — ${detail} (${group.items.length} files)`, group.file);
  }
}

if (strays.length > 0) {
  console.error(`── ${strays.length} individual file(s) missing ──\n`);
  /* Folders whose contents were already listed — so we don't repeat the same listing for every
     missing file in the same folder */
  const shownDirs = new Set();

  for (const m of strays.sort((a, b) => a.path.localeCompare(b.path))) {
    console.error(`  ${m.path}`);
    console.error(`      referenced in ${m.file} — ${m.hint}`);

    const dir = m.path.replace(/\/[^/]*$/, "");
    if (dir !== m.path && !shownDirs.has(dir)) {
      shownDirs.add(dir);
      const contents = listDir(dir);
      if (contents) {
        console.error(`      the folder DOES exist and contains ${contents.count} item(s):`);
        console.error(`        ${contents.text}`);
      }
    }
    console.error("");
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
