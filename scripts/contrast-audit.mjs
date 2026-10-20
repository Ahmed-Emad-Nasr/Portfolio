#!/usr/bin/env node
/*
 * contrast-audit.mjs
 *
 * WCAG contrast audit for every text colour in the CSS files.
 *
 * ── Why this file exists ──
 *
 * A similar earlier check excluded elements inside aria-hidden, on the basis that
 * axe skips them. **That was wrong, and Lighthouse caught it.**
 *
 *   aria-hidden hides an element from **screen readers**.
 *   Contrast isn't a screen-reader issue — it's an issue for people with low vision.
 *
 * Text with aria-hidden is still **visible on screen**, so it must be checked. Because of
 * that exclusion the old check reported "zero failures" while Lighthouse found three — all of them from
 * the excluded set.
 *
 * This audit excludes nothing. If an element really is decorative and you want to exempt it, put it in
 * the ALLOWLIST below **by name with a written reason** — not with a blanket rule that hides things
 * you can't see.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const BG = "#000000";
const ROOT_PX = 9; // root ≈ 9px (62.5% × --ui-scale)

/* Colour tokens — must stay in sync with globals.css */
const TOKENS = {
  "--foreground": "#ffffff", "--text-color": "#ffffff", "--text-bright": "#ffffff",
  "--text-muted": "#d8d6cc", "--text-dim": "#a59f90",
  "--primary": "#bc002d", "--main-color": "#bc002d", "--main-text": "#f5003b",
  "--main-light": "#ff2d78", "--accent": "#ffd700", "--accent-color": "#ffd700",
  "--accent-light": "#fff0a6", "--tertiary": "#00d2ef", "--danger": "#ff2d55",
};

/*
 * Explicit exemptions. Every line must be **by selector name** with a reason.
 * No "exempt the whole file" and no "exempt all aria-hidden".
 */
const ALLOWLIST = new Map([
  // Example of the required shape:
  // [".foo", "a clear reason why this is acceptable"],
]);

const rel = (f) => relative(ROOT, f);

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (["node_modules", ".next", "out"].includes(e)) continue;
    const f = join(dir, e);
    if (statSync(f).isDirectory()) walk(f, out);
    else if (f.endsWith(".css")) out.push(f);
  }
  return out;
}

function luminance(hex) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a, b) {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Semi-transparent white over black → equivalent grey */
function flattenWhite(alpha) {
  const v = Math.round(255 * alpha);
  return "#" + v.toString(16).padStart(2, "0").repeat(3);
}

function resolve(value) {
  const v = value.trim().replace(/\s*!important$/, "");
  const tok = v.match(/^var\((--[\w-]+)\)$/);
  if (tok) return TOKENS[tok[1]] ?? null;
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  if (/^#[0-9a-f]{3}$/i.test(v)) return "#" + v.slice(1).split("").map((c) => c + c).join("");
  const rgba = v.match(/^rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([\d.]+)\s*\)$/);
  if (rgba) return flattenWhite(parseFloat(rgba[1]));
  return null;
}

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");
const RULE = /([^{}]+)\{([^}]*)\}/g;

const fails = [];
let checked = 0;

for (const file of walk(join(ROOT, "app"))) {
  const src = strip(readFileSync(file, "utf8"));
  for (const m of RULE.exec.call ? [...src.matchAll(RULE)] : []) {
    const sel = m[1].trim().split("\n").pop().trim();
    const body = m[2];
    const cm = body.match(/(?:^|;)\s*color:\s*([^;]+)/);
    if (!cm) continue;
    const hex = resolve(cm[1]);
    if (!hex) continue;

    /*
     * Background: if the same rule also sets a background, compute against that instead of
     * black. Without this, every hover rule that flips the background to gold and the text to black
     * is computed as "black on black" and fails while being perfectly fine.
     */
    const bm = body.match(/(?:^|;)\s*background(?:-color)?:\s*([^;]+)/);
    const bgHere = bm ? resolve(bm[1]) : null;
    const bg = bgHere ?? BG;
    checked++;
    const fm = body.match(/font-size:\s*([\d.]+)rem/);
    const px = fm ? parseFloat(fm[1]) * ROOT_PX : null;
    const bold = /font-weight:\s*(bold|[7-9]00)/.test(body);
    /* Large text = 18.66px bold or 24px regular */
    const large = px !== null && (px >= 24 || (bold && px >= 18.66));
    const need = large ? 3.0 : 4.5;
    const r = ratio(hex, bg);
    if (r < need) {
      const why = ALLOWLIST.get(sel);
      fails.push({ sel, hex, bg, r, need, px, file, allowed: why });
    }
  }
}

const real = fails.filter((f) => !f.allowed);
console.log(`\nChecked ${checked} colour declarations · ${real.length} failing\n`);
for (const f of real) {
  console.log(
    `  ✖ ${f.sel.padEnd(26)} ${f.hex}  contrast ${f.r.toFixed(2)} / ${f.need}` +
      `${f.px ? `  (${f.px.toFixed(1)}px)` : ""}\n     ${rel(f.file)}`,
  );
}
const skipped = fails.filter((f) => f.allowed);
if (skipped.length) {
  console.log(`\n  ${skipped.length} explicitly exempted:`);
  for (const f of skipped) console.log(`    ${f.sel} — ${f.allowed}`);
}
console.log();
process.exit(real.length ? 1 : 0);
