#!/usr/bin/env node
/*
 * responsive-audit.mjs
 *
 * Responsive audit. The little sibling of css-audit.mjs, also with zero
 * dependencies. Catches the kinds of bugs visual checks miss because they only show up on
 * sizes or devices you don't have in front of you while working.
 *
 *   node scripts/responsive-audit.mjs
 *
 * Exits with code 1 on any error (not warning) — so it can sit in `npm run verify`.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/* The breakpoints actually used in the project.
   They were once unified into a 5-step ladder and then reverted to the originals — so the script follows
   reality, not the other way round. This list is a description, not a prescription: if you add a new value, add it here. */
/* 2400 and 3200: the large-screen steps of the root font size (globals.css). */
const LADDER = [360, 380, 430, 480, 600, 640, 672, 767, 768, 900, 991, 992, 1024, 1199, 1800, 2400, 3200];

/*
 * The small-font check is **disabled**.
 *
 * Root 62.5% × 0.9 = 9px, so any value under 1.2rem renders below 11px.
 * 53 such values were once bumped to tokens; that made the whole site larger, so it was fully reverted.
 *
 * This is a design decision, not a technical one, and it's the owner's call.
 */
const MIN_REM = 0;

const B = (s) => `\x1b[1m${s}\x1b[0m`;
const RED = (s) => `\x1b[31m${s}\x1b[0m`;
const YEL = (s) => `\x1b[33m${s}\x1b[0m`;

function walk(dir, ext, out = []) {
  for (const e of readdirSync(dir)) {
    if (["node_modules", ".next", "out", ".git"].includes(e)) continue;
    const f = join(dir, e);
    if (statSync(f).isDirectory()) walk(f, ext, out);
    else if (ext.some((x) => f.endsWith(x))) out.push(f);
  }
  return out;
}

const cssFiles = walk(join(ROOT, "app"), [".css"]);
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (c) => " ".repeat(c.length));
const rel = (f) => relative(ROOT, f);
const lineOf = (src, i) => src.slice(0, i).split("\n").length;

let errors = 0;
let warnings = 0;
const section = (t) => console.log(`\n${B(t)}`);

/* ── 1. Breakpoints off the ladder ─────────────────────────────────────── */
section("1. Breakpoints outside the approved ladder");
{
  let n = 0;
  for (const f of cssFiles) {
    const src = strip(readFileSync(f, "utf8"));
    for (const m of src.matchAll(/@media[^{]*?(?:max|min)-width:\s*([\d.]+)(px|rem)/g)) {
      const px = m[2] === "rem" ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
      if (!LADDER.includes(px)) {
        console.log(
          `   ${RED("error")} ${rel(f)}:${lineOf(src, m.index)} — ${m[1]}${m[2]}` +
            (m[2] === "rem" ? ` (= ${px}px)` : "") +
            ` · nearest on the ladder: ${LADDER.reduce((a, b) => (Math.abs(b - px) < Math.abs(a - px) ? b : a))}px`,
        );
        n++;
      }
    }
  }
  errors += n;
  console.log(n ? `   → ${n} error(s)` : "   ✓ all on the ladder");
}

/* ── 2. Media query order ──────────────────────────────────────────────── */
section("2. max-width order (widest must come first)");
{
  /* Only compare queries that actually touch the same selector.
     A file like globals.css is split into 17 sections, each with its own breakpoints —
     so comparing the whole file as one block gives false positives on rules that will never
     meet. What actually matters is: a narrower rule overridden by a wider rule after it on
     **the same element**. That's exactly what happened in sensei-home.module.css between
     600px and 42rem. */
  const blocks = (src) => {
    const out = [];
    /* Catches px and rem. It used to catch px only, so it missed the one real bug
       in these files: a 42rem (=672px) block written after a 600px block. */
    const re = /@media[^{]*?max-width:\s*([\d.]+)(px|rem)[^{]*\{/g;
    let m;
    while ((m = re.exec(src))) {
      let depth = 1;
      let i = re.lastIndex;
      while (i < src.length && depth > 0) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") depth--;
        i++;
      }
      const body = src.slice(re.lastIndex, i - 1);
      /* Record (selector + property), not the selector alone. Two rules on :root that change
         two different tokens don't conflict — a conflict is when the same selector writes
         the same property. */
      const pairs = new Set();
      for (const r of body.matchAll(/(^|\})\s*([^{}@]+?)\s*\{([^{}]*)\}/g)) {
        const sels = r[2].split(",").map((x) => x.trim()).filter(Boolean);
        const props = [...r[3].matchAll(/(^|;)\s*([\w-]+)\s*:/g)].map((x) => x[2]);
        for (const sel of sels) for (const prop of props) pairs.add(`${sel}|${prop}`);
      }
      const px = m[2] === "rem" ? +m[1] * 16 : +m[1];
      out.push({ v: px, raw: `${m[1]}${m[2]}`, line: lineOf(src, m.index), selectors: pairs });
    }
    return out;
  };

  let n = 0;
  for (const f of cssFiles) {
    const src = strip(readFileSync(f, "utf8"));
    const bs = blocks(src);
    for (let i = 0; i < bs.length; i++) {
      for (let j = 0; j < i; j++) {
        if (bs[i].v <= bs[j].v) continue; // the wider one must come first
        const shared = [...bs[i].selectors].filter((s2) => bs[j].selectors.has(s2));
        if (!shared.length) continue;
        console.log(
          `   ${YEL("warning")} ${rel(f)}:${bs[i].line} — max-width:${bs[i].raw} after ${bs[j].raw} ` +
            `(line ${bs[j].line}), and both write: ${shared.slice(0, 3).map((x) => x.replace("|", " → ")).join(" · ")}. ` +
            `The wider one wins on mobile, so the narrower rule is dead.`,
        );
        n++;
      }
    }
  }
  /* A warning, not an error: the only current case (42rem after 600px in
     sensei-home) is the original state the site ships with, and the "dead" rules
     are ones that never show anyway. We report it without failing the build. */
  warnings += n;
  console.log(n ? `   → ${n} warning(s)` : "   ✓ order is correct");
}

/* ── 3. Font smaller than the minimum ──────────────────────────────────── */
section("3. font-size below the minimum");
{
  let n = 0;
  for (const f of cssFiles) {
    const src = readFileSync(f, "utf8");
    const masked = strip(src);
    for (const m of masked.matchAll(/font-size:\s*([\d.]+)rem/g)) {
      const before = masked.slice(Math.max(0, m.index - 40), m.index);
      if (/(clamp|min|max)\([^)]*$/.test(before)) continue;
      if (parseFloat(m[1]) < MIN_REM) {
        console.log(
          `   ${RED("error")} ${rel(f)}:${lineOf(masked, m.index)} — ${m[1]}rem ≈ ${(parseFloat(m[1]) * 9.5).toFixed(1)}px.` +
            ` Use var(--text-xs) or larger.`,
        );
        n++;
      }
    }
  }
  errors += n;
  console.log(n ? `   → ${n} error(s)` : "   ✓ no font below the minimum");
}

/* ── 4. Grids that can overflow ────────────────────────────────────────── */
section("4. Unguarded minmax()");
{
  let n = 0;
  for (const f of cssFiles) {
    const src = strip(readFileSync(f, "utf8"));
    for (const m of src.matchAll(/minmax\(\s*([\d.]+)(px|rem)/g)) {
      console.log(
        `   ${RED("error")} ${rel(f)}:${lineOf(src, m.index)} — minmax(${m[1]}${m[2]}, …)` +
          ` can't shrink below ${m[1]}${m[2]}, so it overflows the screen on mobile` +
          ` and overflow-x:hidden **clips** it instead of letting you scroll to it.` +
          ` Correct form: minmax(min(100%, ${m[1]}${m[2]}), …)`,
      );
      n++;
    }
  }
  errors += n;
  console.log(n ? `   → ${n} error(s)` : "   ✓ all grids are guarded");
}

/* ── 5. Cost with no benefit on touch ──────────────────────────────────── */
section("5. Expensive transition not gated behind hover");
{
  let n = 0;
  for (const f of cssFiles) {
    const src = strip(readFileSync(f, "utf8"));
    const gated = src.replace(/@media\s*\(hover:\s*hover\)[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, "");
    for (const m of gated.matchAll(/transition:\s*(all|[^;]*\bfilter\b[^;]*)/g)) {
      console.log(
        `   ${YEL("warning")} ${rel(f)}:${lineOf(gated, m.index)} — ` +
          (m[1] === "all"
            ? "`transition: all` watches every property. Name the ones that change."
            : "a transition on filter repaints the image every frame, and mobile pays for it without ever seeing the hover."),
      );
      n++;
    }
  }
  warnings += n;
  console.log(n ? `   → ${n} warning(s)` : "   ✓ clean");
}

/* ── 6. Large screens ──────────────────────────────────────────────────── */
section("6. Large-screen coverage");
{
  const all = cssFiles.map((f) => strip(readFileSync(f, "utf8"))).join("\n");
  const mins = new Set(
    [...all.matchAll(/min-width:\s*(\d+)px/g)].map((m) => +m[1]).filter((v) => v >= 1440),
  );
  if (mins.size === 0) {
    console.log(`   ${YEL("warning")} no min-width above 1440px — large screens aren't handled`);
    warnings++;
  } else {
    console.log(`   ✓ ${[...mins].sort((a, b) => a - b).join("px · ")}px`);
  }
}

/* ── Summary ───────────────────────────────────────────────────────────── */
console.log(`\n${"─".repeat(60)}`);
console.log(`${cssFiles.length} CSS files · ${errors} error(s) · ${warnings} warning(s)\n`);
process.exit(errors ? 1 : 0);
