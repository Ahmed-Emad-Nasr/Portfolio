#!/usr/bin/env node
/*
 * layout-audit.mjs — the live companion of responsive-audit.mjs: the built
 * site in a real browser at every kind of screen.
 *
 *   npm run build && npm run check:layout
 *
 * Serves out/ and opens one page of each kind at foldable (280px), small and
 * large phones, landscape phones, tablets, laptops, desktops, 4K and 5K —
 * then once more at the default text size raised to 200% (the browser /
 * phone "large text" setting). On each it scrolls to the end (so lazily
 * rendered sections take their real size) and reports:
 *
 *   · horizontal scroll on the page;
 *   · any element that runs past the screen edge (content cut off by
 *     main's overflow-x: hidden is a bug, not a scrollbar — so it counts);
 *   · text clipped inside its own box (overflow hidden / clip).
 *
 * Decoration marked aria-hidden, screen-reader-only text and content
 * inside horizontal scrollers are not counted. Exit 1 on any finding.
 * Quicker run: LAYOUT_QUICK=1 (fewer sizes).
 */

import { createRequire } from "node:module";
import { serveOut, samplePages } from "./lib/serve-out.mjs";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.log("check:layout skipped: needs Playwright —  npx playwright install chromium");
  process.exit(0);
}

const B = (s) => `\x1b[1m${s}\x1b[0m`;
const RED = (s) => `\x1b[31m${s}\x1b[0m`;

const FULL = [
  [280, 653], [320, 568], [360, 740], [390, 844], [412, 915], [667, 375], [844, 390],
  [600, 960], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080], [2560, 1440], [3840, 2160], [5120, 2880],
];
const QUICK = [[280, 653], [390, 844], [844, 390], [768, 1024], [1280, 800], [2560, 1440]];
const SIZES = process.env.LAYOUT_QUICK ? QUICK : FULL;
/* Large text: default font 32px (200%) on a phone, a tablet and a laptop */
const LARGE_TEXT = [[390, 844], [768, 1024], [1280, 800]];

const { url: base, close } = await serveOut();
const pages = [...samplePages(), ...(process.env.EXTRA_PAGES ? process.env.EXTRA_PAGES.split(",") : [])];

let browser;
try {
  browser = await chromium.launch();
} catch {
  console.log("check:layout skipped: Playwright's Chromium isn't installed —  npx playwright install chromium");
  close();
  process.exit(0);
}

function measure() {
  const W = innerWidth;
  const out = { docOverflow: document.documentElement.scrollWidth - W, wide: [], clipped: [] };
  const path = (el) => {
    const parts = [];
    for (let e = el, i = 0; e && i < 3 && e !== document.body; i++, e = e.parentElement) {
      let s = e.tagName.toLowerCase();
      if (e.id) s += `#${e.id}`;
      else if (typeof e.className === "string" && e.className) s += `.${e.className.trim().split(/\s+/).slice(0, 2).join(".")}`;
      parts.unshift(s);
    }
    return parts.join(" > ");
  };
  const clips = (el) => {
    const cs = getComputedStyle(el);
    return cs.overflowX !== "visible" || (cs.clipPath && cs.clipPath !== "none");
  };
  /* Only a horizontal scroller, or a clipping box narrower than the screen
     (a carousel), counts as intentional; main/body overflow-x: hidden just
     cut content off */
  const intentional = (el) => {
    for (let e = el.parentElement; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.overflowX === "auto" || cs.overflowX === "scroll") return true;
      if (clips(e)) {
        const r = e.getBoundingClientRect();
        if (r.left >= -1 && r.right <= W + 1 && r.width < W - 2) {
          const me = el.getBoundingClientRect();
          return !(me.right <= r.right + 1 && me.left >= r.left - 1);
        }
      }
    }
    return false;
  };
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    if (cs.position === "fixed" && cs.pointerEvents === "none") continue;
    if (el.closest('[aria-hidden="true"], .sr-only')) continue;
    if (+cs.opacity === 0) continue;
    const rc = el.getBoundingClientRect();
    if (!rc.width || !rc.height) continue;
    if ((rc.right > W + 1 || rc.left < -1) && !intentional(el)) {
      const pr = el.parentElement?.getBoundingClientRect();
      if (!pr || (pr.right <= W + 1 && pr.left >= -1)) out.wide.push(`${Math.round(rc.left)}→${Math.round(rc.right)}px  ${path(el)}  "${(el.textContent || "").trim().slice(0, 40)}"`);
    }
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasText && clips(el) && el.scrollWidth > el.clientWidth + 1 && cs.textOverflow !== "ellipsis" && !/line-clamp|truncate/.test(el.className)) {
      out.clipped.push(`${el.scrollWidth}>${el.clientWidth}px  ${path(el)}  "${el.textContent.trim().slice(0, 40)}"`);
    }
  }
  return out;
}

const findings = [];
async function check(w, h, font) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: Math.min(w, h) < 600, hasTouch: w < 1024, reducedMotion: "reduce", colorScheme: "dark" });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("sensei-booted", "1");
      localStorage.setItem("palette-hint-seen", "1");
    } catch {}
  });
  for (const path of pages) {
    const page = await ctx.newPage();
    if (font) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Page.setFontSizes", { fontSizes: { standard: font, fixed: Math.round(font * 0.8125) } });
    }
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 200));
    });
    const r = await page.evaluate(measure);
    const where = `${path} @ ${w}×${h}${font ? ` · text ${Math.round((font / 16) * 100)}%` : ""}`;
    if (r.docOverflow > 0) findings.push(`${where}: page scrolls sideways by ${r.docOverflow}px`);
    r.wide.slice(0, 5).forEach((x) => findings.push(`${where}: past the edge  ${x}`));
    r.clipped.slice(0, 5).forEach((x) => findings.push(`${where}: text clipped  ${x}`));
    await page.close();
  }
  await ctx.close();
}

for (const [w, h] of SIZES) await check(w, h, 0);
for (const [w, h] of LARGE_TEXT) await check(w, h, 32);
await browser.close();
close();

const runs = pages.length * (SIZES.length + LARGE_TEXT.length);
console.log(B(`\nLayout — ${pages.length} pages × ${SIZES.length} screens + ${LARGE_TEXT.length} at 200% text (${runs} page loads)`));
if (!findings.length) console.log("   ✓ nothing past the edge, nothing clipped, no sideways scroll");
else findings.forEach((f) => console.log(`   ${RED("✗")} ${f}`));
console.log(`\n${findings.length} finding(s)`);
process.exit(findings.length ? 1 : 0);
