/*
 * scripts/check-assets.mjs
 *
 * Verifies that every file referenced by any config actually exists in public/.
 *
 * Why is this the most important check in the project? Because this is exactly the kind of bug that stays invisible:
 * the build succeeds, TypeScript doesn't complain, the page opens fine — and an image or
 * PDF returns 404 only for the one visitor who clicks it. And you'll never know.
 *
 * Bugs this check would have caught:
 *  - a case folder was renamed but the paths weren't
 *  - a PDF was never uploaded
 *  - an image was deleted from public/
 *  - an uppercase letter in a file name (works on Windows, breaks on Linux/GitHub Pages)
 *
 * Run:  node scripts/check-assets.mjs
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
 * We read asset paths from the config files as text instead of importing them: the files are
 * TypeScript, and importing them would need a compiler. A regex is enough — we're looking
 * for any string that looks like a path inside Assets/.
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
 * Comments are stripped before checking.
 *
 * Without this, any comment explaining a path counts as a real reference. The first version reported
 * "Assets/..." and "Assets/…" as missing files — both came from comments
 * explaining old paths. Noise that hides the real problems.
 *
 * The stripping is deliberately simple (not a full parser): it removes /* … *\/ and // … to end of
 * line. It may wrongly strip "//" inside a string containing a URL, but that doesn't matter — we're
 * looking for local Assets/ paths, not external links.
 */
const stripComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

const ASSET_RE = /["'`](\/?Assets\/[^"'`\\$]+)["'`]/g;
/* Paths built with a template literal (like `Assets/Cases/X/${i + 1}.webp`)
   can't be read statically — we extract the folder and at least confirm it exists. */
const TEMPLATE_RE = /["'`](\/?Assets\/[^"'`]*?)\$\{/g;

/*
 * This pattern repeats throughout the config:
 *
 *   Array.from({ length: 24 }, (_, i) => `Assets/Cases/X/Screenshot (${343 + i}).webp`)
 *
 * Checking the folder alone isn't enough: the folder exists, but the numbering assumes the files
 * are consecutive with no gaps — and that assumption has actually broken (Screenshot 349 and 353
 * missing in the middle of the 343–366 series).
 *
 * So instead of checking the folder, we unroll the loop and check each file by name. This covers
 * both forms in use: `${i + 1}` and `${BASE + i}`.
 */
const LOOP_RE =
  /Array\.from\(\s*\{\s*length:\s*(\d+)\s*\}\s*,\s*\(_,\s*i\)\s*=>\s*`([^`]*?)\$\{\s*(?:(\d+)\s*\+\s*i|i\s*\+\s*(\d+))\s*\}([^`]*?)`/g;

/** Unrolls the loop into concrete paths */
const expandLoop = (length, prefix, base, suffix) => {
  const out = [];
  for (let i = 0; i < length; i++) out.push(`${prefix}${base + i}${suffix}`);
  return out;
};

/*
 * When a file is missing, the very next question is always: "so what IS in the folder?"
 *
 * Without that answer, every missing file becomes a manual trip: open the folder, look,
 * compare. The script already sees the folder — so it should just tell you.
 *
 * This turns "file not found" into "file not found, and here's what is there" —
 * which usually makes it immediately clear whether the name differs or the file is really missing.
 */
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

  /*
   * Images are displayed through getThumbnail(), which turns "1.webp" into
   * "1-thumb.webp". So every image in the config has **two** paths on
   * the site, and the check used to look at only one.
   *
   * That's what let nine broken images on a case page slip past this check and only get caught
   * by the link check after the build. Better to catch them here — faster and clearer.
   *
   * Thumbnails are reported as warnings, not errors: components fall back to the full
   * image if the thumb is missing, so the page works — but it loads a larger image
   * than necessary, and we want to know about that.
   */
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

/*
 * Group results before printing.
 *
 * Reason: if an entire case folder is missing, the first version would print one line per image
 * in it — 40 lines for one problem. Worse, GitHub only shows the first 10 annotations,
 * so the important one could get cut off.
 *
 * Now: a fully missing folder = one line with its file count. Stray files
 * are listed by name.
 */
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
