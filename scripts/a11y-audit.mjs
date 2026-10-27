#!/usr/bin/env node
/*
 * a11y-audit.mjs — accessibility check of the built site in a real browser.
 *
 *   npm run build && npm run check:a11y
 *
 * Serves out/ (scripts/lib/serve-out.mjs), opens one page of every kind the
 * site has (home, blog, cases with and without a case file, the collection,
 * CV, legal pages, 404) on a phone and
 * a desktop, in the dark and the light theme, and runs axe-core against WCAG
 * 2.2 A/AA. Each page is scrolled to the end and given time for every
 * scroll entrance to finish before it is measured.
 *
 * Fails (exit 1) on any violation axe rates serious or critical. Moderate
 * and minor ones are listed as warnings. Extra paths: EXTRA_PAGES=/a,/b
 */

import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { serveOut, samplePages } from "./lib/serve-out.mjs";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.log("check:a11y skipped: needs Playwright —  npx playwright install chromium");
  process.exit(0);
}
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const B = (s) => `\x1b[1m${s}\x1b[0m`;
const RED = (s) => `\x1b[31m${s}\x1b[0m`;
const YEL = (s) => `\x1b[33m${s}\x1b[0m`;

const VIEWPORTS = [
  { name: "phone", width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: "desktop", width: 1440, height: 900 },
];
const THEMES = ["dark", "light"];
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const { url: base, close } = await serveOut();
const pages = [...samplePages(), ...(process.env.EXTRA_PAGES ? process.env.EXTRA_PAGES.split(",") : [])];

let browser;
try {
  browser = await chromium.launch();
} catch {
  console.log("check:a11y skipped: Playwright's Chromium isn't installed —  npx playwright install chromium");
  close();
  process.exit(0);
}

/* rule id → { impact, help, where: Set<"page · viewport · theme → selector"> } */
const found = new Map();

for (const vp of VIEWPORTS) {
  for (const theme of THEMES) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, colorScheme: theme, reducedMotion: "reduce" });
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem("theme", t);
        localStorage.setItem("palette-hint-seen", "1");
      } catch {}
    }, theme);
    for (const path of pages) {
      const page = await ctx.newPage();
      await page.goto(base + path, { waitUntil: "networkidle" });
      /* Let lazy sections render (content-visibility) and every scroll
         entrance play to the end (framer-motion fades opacity even with
         reduced motion) — a half-faded element measures as low contrast */
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        scrollTo(0, 0);
      });
      await page.waitForTimeout(2500);
      await page.addScriptTag({ content: AXE });
      const result = await page.evaluate(async (tags) => {
        const r = await axe.run(document, { runOnly: { type: "tag", values: tags }, resultTypes: ["violations"] });
        return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 4) }));
      }, TAGS);
      for (const v of result) {
        if (!found.has(v.id)) found.set(v.id, { impact: v.impact, help: v.help, where: new Set() });
        for (const n of v.nodes) found.get(v.id).where.add(`${path} · ${vp.name} · ${theme} → ${n}`);
      }
      await page.close();
    }
    await ctx.close();
  }
}
await browser.close();
close();

const serious = [...found].filter(([, v]) => v.impact === "serious" || v.impact === "critical");
const minor = [...found].filter(([, v]) => !(v.impact === "serious" || v.impact === "critical"));

console.log(B(`\nAccessibility (axe-core, WCAG 2.2 AA) — ${pages.length} pages × ${VIEWPORTS.length} viewports × ${THEMES.length} themes`));
for (const [id, v] of [...serious, ...minor]) {
  const tag = v.impact === "serious" || v.impact === "critical" ? RED(v.impact) : YEL(v.impact);
  console.log(`\n${tag}  ${B(id)} — ${v.help}`);
  [...v.where].slice(0, 8).forEach((w) => console.log(`   ${w}`));
  if (v.where.size > 8) console.log(`   … and ${v.where.size - 8} more`);
}
if (!found.size) console.log("   ✓ no violations");
console.log(`\n${serious.length} serious/critical rule(s) · ${minor.length} moderate/minor`);
process.exit(serious.length ? 1 : 0);
