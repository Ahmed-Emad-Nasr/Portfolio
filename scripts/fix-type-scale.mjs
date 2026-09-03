#!/usr/bin/env node
/*
 * fix-type-scale.mjs
 *
 * WHY THIS EXISTS
 *
 *   globals.css sets   html { font-size: calc(62.5% * var(--ui-scale)) }
 *
 * so 1rem is roughly 9px, not 16px. Any `font-size` written as if rem were
 * 16px renders about 44% smaller than the author intended:
 *
 *     0.72rem  ->  6.5px
 *     0.90rem  ->  8.1px
 *     1.10rem  ->  9.9px
 *
 * attack-matrix.module.css carries a comment describing exactly this bug and
 * was rewritten onto the tokens. The other 12 stylesheets were not.
 *
 * WHAT IT DOES
 *
 *   font-size <= 0.95rem   ->  var(--text-xs)    (~11.9px, the floor)
 *   font-size 0.96-1.19rem ->  var(--text-sm)    (~13.3px)
 *
 * Values already written as tokens, in clamp(), or >= 1.2rem are untouched.
 *
 * Usage:
 *   node scripts/fix-type-scale.mjs           # report only
 *   node scripts/fix-type-scale.mjs --write   # apply
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const WRITE = process.argv.includes("--write");
const FLOOR = 1.2; // rem — anything below this is the bug

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === "out") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith(".css")) out.push(full);
  }
  return out;
}

// font-size: <number>rem  — not inside clamp()/min()/max()/calc(), not a var()
const DECL = /font-size:\s*(\d*\.?\d+)rem/g;

const changes = [];

// Blank out comment bodies (keeping offsets) so matches inside prose about
// this very bug — attack-matrix.module.css documents it — are not rewritten.
function maskComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (c) => " ".repeat(c.length));
}

for (const file of walk(join(ROOT, "app"))) {
  const src = readFileSync(file, "utf8");
  const masked = maskComments(src);
  let touched = 0;

  const next = src.replace(DECL, (match, raw, offset) => {
    const value = parseFloat(raw);
    if (value >= FLOOR) return match;
    if (masked.slice(offset, offset + match.length) !== match) return match;

    // Skip if this sits inside a clamp()/min()/max() argument list — those
    // already have a floor of their own.
    const before = src.slice(Math.max(0, offset - 40), offset);
    if (/(clamp|min|max)\([^)]*$/.test(before)) return match;

    const token = value <= 0.95 ? "--text-xs" : "--text-sm";
    const px = (value * 9).toFixed(1);
    changes.push({
      file: relative(ROOT, file),
      line: src.slice(0, offset).split("\n").length,
      from: `${raw}rem`,
      to: `var(${token})`,
      renderedPx: px,
    });
    touched++;
    return `font-size: var(${token})`;
  });

  if (touched && WRITE) writeFileSync(file, next);
}

const byFile = new Map();
for (const c of changes) {
  if (!byFile.has(c.file)) byFile.set(c.file, []);
  byFile.get(c.file).push(c);
}

console.log(
  `\n${WRITE ? "APPLIED" : "DRY RUN"} — ${changes.length} declaration(s) in ${byFile.size} file(s)\n`
);

for (const [file, list] of [...byFile].sort()) {
  console.log(`  ${file}`);
  for (const c of list) {
    console.log(
      `    :${String(c.line).padStart(4)}  ${c.from.padEnd(8)} (~${c.renderedPx}px)  ->  ${c.to}`
    );
  }
  console.log();
}

if (!WRITE && changes.length) console.log("Re-run with --write to apply.\n");
