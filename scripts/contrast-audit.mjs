#!/usr/bin/env node
/*
 * contrast-audit.mjs
 *
 * فحص تباين WCAG على كل نص في ملفات الـ CSS.
 *
 * ── ليه الملف ده موجود ──
 *
 * كان عندي فحص شبيه بيستثني العناصر اللي جواها aria-hidden، على أساس إن
 * axe بيتخطّاها. **وده كان غلط، وLighthouse كشفه.**
 *
 *   aria-hidden بيخفي العنصر من **قارئ الشاشة**.
 *   التباين مش قضية قارئ شاشة — هو قضية ناس بيشوفوا بصعوبة.
 *
 * النص اللي عليه aria-hidden لسه **ظاهر على الشاشة**، فلازم يتفحص. بسبب
 * الاستثناء ده قلت "صفر راسبة" وLighthouse لقى تلاتة — كلهم من اللي
 * استثنيته.
 *
 * الفحص ده مبيستثنيش حاجة. لو عنصر زخرفي فعلاً وعايز تعفيه، حطّه في
 * ALLOWLIST تحت **باسمه وبسبب مكتوب** — مش بقاعدة عامة تخفي حاجات
 * إنت مش شايفها.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const BG = "#000000";
const ROOT_PX = 9; // الجذر ≈ 9 بكسل (62.5% × --ui-scale)

/* توكنز الألوان — لازم تفضل مطابقة لـ globals.css */
const TOKENS = {
  "--foreground": "#ffffff", "--text-color": "#ffffff", "--text-bright": "#ffffff",
  "--text-muted": "#d8d6cc", "--text-dim": "#a59f90",
  "--primary": "#bc002d", "--main-color": "#bc002d", "--main-text": "#f5003b",
  "--main-light": "#ff2d78", "--accent": "#ffd700", "--accent-color": "#ffd700",
  "--accent-light": "#fff0a6", "--tertiary": "#00d2ef", "--danger": "#ff2d55",
};

/*
 * إعفاءات صريحة. كل سطر لازم يبقى **باسم المحدد** ومعاه سبب.
 * مفيش "استثني كل الملف" ومفيش "استثني كل aria-hidden".
 */
const ALLOWLIST = new Map([
  // مثال على الشكل المطلوب:
  // [".foo", "سبب واضح ليه ده مقبول"],
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

/** أبيض بشفافية فوق أسود → رمادي مكافئ */
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
     * الخلفية: لو نفس القاعدة بتحدد background كمان، احسب عليها مش على
     * الأسود. من غير ده كل قاعدة hover بتقلب الخلفية لذهبي والنص لأسود
     * بتتحسب "أسود على أسود" وتطلع راسبة وهي سليمة تماماً.
     */
    const bm = body.match(/(?:^|;)\s*background(?:-color)?:\s*([^;]+)/);
    const bgHere = bm ? resolve(bm[1]) : null;
    const bg = bgHere ?? BG;
    checked++;
    const fm = body.match(/font-size:\s*([\d.]+)rem/);
    const px = fm ? parseFloat(fm[1]) * ROOT_PX : null;
    const bold = /font-weight:\s*(bold|[7-9]00)/.test(body);
    /* نص كبير = 18.66px عريض أو 24px عادي */
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
console.log(`\nفُحص ${checked} تصريح لون · ${real.length} راسب\n`);
for (const f of real) {
  console.log(
    `  ✖ ${f.sel.padEnd(26)} ${f.hex}  تباين ${f.r.toFixed(2)} / ${f.need}` +
      `${f.px ? `  (${f.px.toFixed(1)}px)` : ""}\n     ${rel(f.file)}`,
  );
}
const skipped = fails.filter((f) => f.allowed);
if (skipped.length) {
  console.log(`\n  ${skipped.length} معفى صراحةً:`);
  for (const f of skipped) console.log(`    ${f.sel} — ${f.allowed}`);
}
console.log();
process.exit(real.length ? 1 : 0);
