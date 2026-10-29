#!/usr/bin/env node
/*
 * dead-code.mjs
 *
 * Finds code that nothing uses. Zero dependencies. Does it run on
 * esbuild's AST? No — it runs regexes over the file text after stripping
 * comments and strings. So it can be wrong, and every section says how to verify
 * by hand before you delete anything.
 *
 *   node scripts/dead-code.mjs
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, basename } from "node:path";

const ROOT = process.cwd();
const B = (s) => `\x1b[1m${s}\x1b[0m`;
const DIM = (s) => `\x1b[2m${s}\x1b[0m`;
const YEL = (s) => `\x1b[33m${s}\x1b[0m`;

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (["node_modules", ".next", "out", ".git"].includes(e)) continue;
    const f = join(dir, e);
    if (statSync(f).isDirectory()) walk(f, out);
    else out.push(f);
  }
  return out;
}

const all = ["app", "components", "data", "lib"].flatMap((d) => walk(join(ROOT, d)));
const code = all.filter((f) => /\.tsx?$/.test(f));
const read = (f) => readFileSync(f, "utf8");
const rel = (f) => relative(ROOT, f);

/* Strip comments and strings — so a word inside a comment doesn't count as a use */
const clean = (s) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/`(?:\\.|[^`\\])*`/g, " ` ` ")
    .replace(/"(?:\\.|[^"\\])*"/g, ' "" ')
    .replace(/'(?:\\.|[^'\\])*'/g, " '' ");

const src = new Map(code.map((f) => [f, read(f)]));
const body = new Map(code.map((f) => [f, clean(read(f))]));

let findings = 0;
const section = (t) => console.log(`\n${B(t)}`);

/* ── 1. Exports nobody imports ─────────────────────────────────────────── */
section("1. Exports nobody imports");
{
  /* Names Next consumes itself without an explicit import */
  const FRAMEWORK = new Set([
    "default", "metadata", "viewport", "generateStaticParams", "generateMetadata",
    "dynamic", "revalidate", "fetchCache", "runtime", "preferredRegion",
    "dynamicParams", "maxDuration", "GET", "POST", "config",
  ]);

  const hits = [];
  for (const f of code) {
    const t = body.get(f);
    const names = new Set();
    for (const m of t.matchAll(/export\s+(?:async\s+)?(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)/g))
      names.add(m[1]);
    for (const m of t.matchAll(/export\s+(?:type|interface)\s+([A-Za-z_$][\w$]*)/g))
      names.add(m[1]);
    for (const m of t.matchAll(/export\s*\{([^}]*)\}/g))
      for (const part of m[1].split(","))
        names.add(part.split(/\s+as\s+/).pop().trim());

    for (const name of names) {
      if (!name || FRAMEWORK.has(name)) continue;
      const used = code.some(
        (g) => g !== f && new RegExp(`\\b${name}\\b`).test(body.get(g)),
      );
      if (!used) hits.push({ f, name });
    }
  }
  for (const h of hits) console.log(`   ${YEL("?")} ${rel(h.f)} → ${h.name}`);
  console.log(hits.length ? `   → ${hits.length}` : "   ✓ clean");
  console.log(DIM("   Verify by hand: the name may be read from a non-.ts/.tsx file."));
  findings += hits.length;
}

/* ── 2. Files nobody imports ───────────────────────────────────────────── */
section("2. Files nobody imports");
{
  /* Next reaches these files by name/path, not via import */
  const ROUTE = /^(page|layout|template|loading|error|not-found|global-error|route|default|sitemap|robots|manifest|icon|apple-icon|opengraph-image)\.tsx?$/;
  const hits = [];
  for (const f of code) {
    if (ROUTE.test(basename(f))) continue;
    const stem = basename(f).replace(/\.tsx?$/, "");
    const used = code.some(
      (g) => g !== f && new RegExp(`["'\`][^"'\`]*\\b${stem}["'\`]`).test(src.get(g)),
    );
    if (!used) hits.push(f);
  }
  for (const f of hits) console.log(`   ${YEL("?")} ${rel(f)}`);
  console.log(hits.length ? `   → ${hits.length}` : "   ✓ clean");
  findings += hits.length;
}

/* ── 3. CSS files nobody imports ───────────────────────────────────────── */
section("3. CSS files nobody imports");
{
  const hits = [];
  for (const f of all.filter((x) => x.endsWith(".css"))) {
    if (basename(f) === "globals.css") continue;
    const name = basename(f);
    const used = code.some((g) => src.get(g).includes(name));
    if (!used) hits.push(f);
  }
  for (const f of hits) console.log(`   ${YEL("?")} ${rel(f)}  (orphan)`);
  console.log(hits.length ? `   → ${hits.length}` : "   ✓ clean");
  findings += hits.length;
}

/* ── 4. Icons defined but not used ─────────────────────────────────────── */
section("4. Icons defined but not used");
{
  const iconFile = code.find((f) => f.endsWith("icon-data.ts"));
  if (!iconFile) console.log("   (no icon-data.ts)");
  else {
    const defined = [...body.get(iconFile).matchAll(/^\s*(fa[A-Z][\w]*)\s*:/gm)].map((m) => m[1]);
    const everywhere = [...src.values()].join("\n");
    const dead = defined.filter(
      (n) => (everywhere.match(new RegExp(`\\b${n}\\b`, "g")) || []).length <= 1,
    );
    for (const n of dead) console.log(`   ${YEL("?")} ${n}`);
    console.log(dead.length ? `   → ${dead.length} of ${defined.length}` : `   ✓ all ${defined.length} in use`);
    findings += dead.length;
  }
}

/* ── 5. package.json dependencies nobody imports ───────────────────────── */
section("5. Packages nobody imports");
{
  const pkg = JSON.parse(read(join(ROOT, "package.json")));
  const everywhere = [...src.values()].join("\n");
  const scripts = Object.values(pkg.scripts || {}).join(" ");
  const scriptSrc = walk(join(ROOT, "scripts")).map(read).join("\n");
  /* Framework packages — Next pulls them in internally, not via an import in your code */
  const IMPLICIT = new Set(["react", "react-dom", "next"]);
  const hits = [];
  for (const dep of Object.keys(pkg.dependencies || {})) {
    if (IMPLICIT.has(dep)) continue;
    const re = new RegExp(`["'\`]${dep.replace(/[/\\]/g, "\\$&")}`);
    if (!re.test(everywhere) && !re.test(scriptSrc) && !scripts.includes(dep))
      hits.push(dep);
  }
  for (const d of hits) console.log(`   ${YEL("?")} ${d}  (dependencies)`);
  console.log(hits.length ? `   → ${hits.length}` : "   ✓ clean");
  findings += hits.length;
}

console.log(`\n${"─".repeat(60)}`);
console.log(`${code.length} code files · ${findings} item(s) to review\n`);
console.log(DIM("All of this is a guess. Review every line before deleting.\n"));
