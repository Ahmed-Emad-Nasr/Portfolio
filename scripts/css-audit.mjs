/*
 * scripts/css-audit.mjs
 *
 * CSS audit for the project. Zero dependencies — plain node.
 *
 *   node scripts/css-audit.mjs
 *
 * Looks for four things, each of which has actually turned up on this site at least once:
 *
 *   1. Classes defined in a CSS file (the named effects in globals.css) that nothing uses
 *   2. CSS custom properties that are declared but never read
 *   3. Near-identical CSS files (the main header and the blog header were 99% the same file)
 *   4. Expensive properties on the critical path (backdrop-filter, transitions on it,
 *      universal selectors)
 *
 * Run it before every PR. Cheaper than finding out a year later that 42% of the token system is dead.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "app";
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = ["app", "components", "lib", "data"].flatMap((d) => walk(d));
const cssFiles = files.filter((f) => f.endsWith(".css"));
const codeFiles = files.filter((f) => /\.tsx?$/.test(f));

const read = (f) => readFileSync(f, "utf8");
const allCode = codeFiles.map(read).join("\n");
const allCss = cssFiles.map((f) => strip(read(f))).join("\n");

let issues = 0;
const section = (title) => console.log(`\n\x1b[1m${title}\x1b[0m`);

/* ── 1. Dead classes ───────────────────────────────────────────────────── */
section("1. Classes defined but not used");

/* The components style themselves with Tailwind utilities, so the only
   hand-written classes left are the named effects in globals.css
   (.hero-btn, .cursor-ring, .loader-fill …). A class counts as used when its
   name appears as a whole word anywhere in the code — in a className string,
   a cn() call, or a classList.add() in a JS animation loop. */
const codeWords = new Set(allCode.match(/[A-Za-z_][\w-]*/g) ?? []);
let deadClasses = 0;
for (const f of cssFiles) {
  const css = strip(read(f))
    /* url(...) and string contents are not selectors */
    .replace(/url\([^)]*\)/g, "")
    .replace(/"[^"]*"|'[^']*'/g, "");
  /* Only selector text — the part before each { — can define a class */
  const selectors = [...css.matchAll(/([^{};]+)\{/g)].map((m) => m[1]).filter((t) => !t.trim().startsWith("@"));
  const names = new Set();
  for (const sel of selectors) {
    for (const m of sel.matchAll(/\.(-?[A-Za-z_][\w-]*)(?![\w\\])/g)) names.add(m[1]);
  }
  /* yarl__… are the lightbox library's own classes, restyled from here */
  const dead = [...names].filter((n) => !codeWords.has(n) && !n.startsWith("yarl__") && n !== "lenis-scrolling" && n !== "sticky");
  if (dead.length) {
    console.log(`   ${relative(".", f)}`);
    console.log(`      ${dead.join(", ")}`);
    deadClasses += dead.length;
  }
}
console.log(deadClasses ? `   → ${deadClasses} class(es)` : "   ✓ clean");
issues += deadClasses;

/* ── 2. Dead variables ─────────────────────────────────────────────────── */
section("2. CSS variables declared but never read");

const readVars = new Set([
  ...[...allCss.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]),
  // next/font generates --font-* from JavaScript
  ...[...allCode.matchAll(/(--font-[\w-]+)/g)].map((m) => m[1]),
  // Tailwind classes read variables from the JSX: bg-(--page-veil), mb-[var(--space-xl)]
  ...[...allCode.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]),
  ...[...allCode.matchAll(/[(:](--[\w-]+)/g)].map((m) => m[1]),
]);

/* Tokens inside @theme are Tailwind's: they are consumed by utility classes
   (bg-accent, text-xs, animate-fade-up …), never by a var() in CSS. */
const withoutTheme = (css) => {
  let out = css;
  for (let at = out.indexOf("@theme"); at !== -1; at = out.indexOf("@theme")) {
    let i = out.indexOf("{", at), depth = 0;
    for (; i < out.length; i++) {
      if (out[i] === "{") depth++;
      else if (out[i] === "}" && --depth === 0) break;
    }
    out = out.slice(0, at) + out.slice(i + 1);
  }
  return out;
};

const declared = new Map();
for (const f of cssFiles) {
  for (const m of withoutTheme(strip(read(f))).matchAll(/^\s*(--[\w-]+)\s*:/gm)) {
    if (!declared.has(m[1])) declared.set(m[1], f);
  }
}
const deadVars = [...declared].filter(([v]) => !readVars.has(v));
for (const [v, f] of deadVars) console.log(`   ${v}  (${relative(".", f)})`);
console.log(
  deadVars.length
    ? `   → ${deadVars.length} of ${declared.size} (${Math.round((deadVars.length / declared.size) * 100)}%)`
    : "   ✓ clean",
);
issues += deadVars.length;

/* ── 3. Near-identical files ───────────────────────────────────────────── */
section("3. Near-identical CSS files");

const normalized = cssFiles.map((f) => [
  f,
  strip(read(f)).split("\n").map((l) => l.trim()).filter(Boolean),
]);

let dupPairs = 0;
for (let i = 0; i < normalized.length; i++) {
  for (let j = i + 1; j < normalized.length; j++) {
    const [fa, a] = normalized[i];
    const [fb, b] = normalized[j];
    if (!a.length || !b.length) continue;
    const setB = new Set(b);
    const shared = a.filter((l) => setB.has(l)).length;
    const pct = Math.round((shared / Math.max(a.length, b.length)) * 100);
    if (pct >= 70) {
      console.log(`   ${pct}% identical:`);
      console.log(`      ${relative(".", fa)}`);
      console.log(`      ${relative(".", fb)}`);
      dupPairs++;
    }
  }
}
console.log(dupPairs ? `   → ${dupPairs} pair(s)` : "   ✓ clean");
issues += dupPairs;

/* ── 4. Expensive properties ───────────────────────────────────────────── */
section("4. Expensive properties on the critical path");

const flags = [];
for (const f of cssFiles) {
  const t = strip(read(f));
  const rel = relative(".", f);

  // transition on backdrop-filter or filter = GPU repaint every frame
  /* A transition on filter inside @media (hover: hover) is acceptable: the device
     paying the cost is the only one that sees the effect. Strip those blocks before checking. */
  const t2 = t.replace(
    /@media\s*\(hover:\s*hover\)[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g,
    "",
  );
  for (const m of t2.matchAll(/transition:[^;]*\b(backdrop-filter|filter)\b[^;]*/g)) {
    flags.push(`   ${rel}: transition on ${m[1]} — GPU repaint every frame`);
  }
  // backdrop-filter with a hard-coded value instead of the token = bypasses the device budget
  for (const m of t.matchAll(/backdrop-filter:\s*blur\((\d)/g)) {
    if (m[1] !== "0") {
      flags.push(`   ${rel}: hard-coded backdrop-filter value — use var(--ui-blur)`);
      break;
    }
  }
  // universal selector with non-inherited properties
  if (/^\s*\*\s*\{/m.test(t)) {
    flags.push(`   ${rel}: \`*\` selector — evaluated against every element on the page`);
  }
  // partial attribute-substring selector — slow, and breaks with CSS Modules hashing
  for (const m of t.matchAll(/\[class\*=/g)) {
    flags.push(`   ${rel}: [class*=…] — slow, and breaks with CSS Modules hashing`);
    break;
  }
  // transition: all watches every property
  if (/transition:\s*all\b/.test(t)) {
    flags.push(`   ${rel}: transition: all — name the properties explicitly`);
  }
}
for (const line of [...new Set(flags)]) console.log(line);
console.log(flags.length ? `   → ${new Set(flags).size} warning(s)` : "   ✓ clean");
issues += new Set(flags).size;

/* ── Summary ───────────────────────────────────────────────────────────── */
const bytes = cssFiles.reduce((n, f) => n + readFileSync(f).length, 0);
console.log(`\n${"─".repeat(60)}`);
console.log(`${cssFiles.length} CSS files · ${bytes.toLocaleString()} bytes · ${issues} note(s)`);
console.log(
  "\nNote: comments and whitespace are stripped in the production build, so file size in\n" +
  "the repo is not a performance metric. What matters is how many rules the browser walks\n" +
  "on every style recalculation, and the paint cost of the properties in section 4.\n",
);
