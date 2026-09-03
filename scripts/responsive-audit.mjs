#!/usr/bin/env node
/*
 * responsive-audit.mjs
 *
 * فحص الـ responsive. أخوه الصغير لـ css-audit.mjs، ومن غير أي dependency
 * بردو. بيمسك أنواع الباجات اللي الفحص البصري بيفوّتها لأنها بتظهر على
 * مقاسات أو أجهزة مش موجودة قدامك وقت الشغل.
 *
 *   node scripts/responsive-audit.mjs
 *
 * بيرجع exit code 1 لو فيه أي خطأ (مش تحذير) — عشان يتحط في `npm run verify`.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/* سُلَّم الـ breakpoints المعتمد — القيم دي بس مسموحة.
   لو ضفت واحد جديد، ضيفه هنا وفي القسم ٧ في globals.css مع بعض. */
const LADDER = [430, 600, 768, 992, 1440, 1920, 2200];

/* أصغر font-size مقبول بالـ rem. الجذر ≈ ٩٫٥ بكسل، فـ 1.25rem ≈ ١٢ بكسل. */
const MIN_REM = 1.2;

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

/* ── 1. breakpoints بره السُلَّم ─────────────────────────────────────────── */
section("1. breakpoints بره السُلَّم المعتمد");
{
  let n = 0;
  for (const f of cssFiles) {
    const src = strip(readFileSync(f, "utf8"));
    for (const m of src.matchAll(/@media[^{]*?(?:max|min)-width:\s*([\d.]+)(px|rem)/g)) {
      const px = m[2] === "rem" ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
      if (!LADDER.includes(px)) {
        console.log(
          `   ${RED("خطأ")} ${rel(f)}:${lineOf(src, m.index)} — ${m[1]}${m[2]}` +
            (m[2] === "rem" ? ` (= ${px}px)` : "") +
            ` · الأقرب في السُلَّم: ${LADDER.reduce((a, b) => (Math.abs(b - px) < Math.abs(a - px) ? b : a))}px`,
        );
        n++;
      }
    }
  }
  errors += n;
  console.log(n ? `   → ${n} خطأ` : "   ✓ كله على السُلَّم");
}

/* ── 2. ترتيب الـ media queries ─────────────────────────────────────────── */
section("2. ترتيب الـ max-width (لازم الأوسع الأول)");
{
  /* بنقارن بس الـ queries اللي بتلمس نفس المحدد فعلاً.
     ملف زي globals.css مقسّم لـ ١٧ قسم، وكل قسم ليه breakpoints بتاعته —
     فمقارنة كل الملف كتلة واحدة بتدّي false positives على قواعد عمرها ما
     هتتقابل. اللي بيهم فعلاً هو: قاعدة أضيق اتغلبت بقاعدة أوسع بعديها على
     **نفس العنصر**. ده بالظبط اللي حصل في sensei-home.module.css بين
     600px و42rem. */
  const blocks = (src) => {
    const out = [];
    const re = /@media[^{]*?max-width:\s*([\d.]+)px[^{]*\{/g;
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
      /* بنسجّل (محدد + خاصية) مش المحدد لوحده. قاعدتين على :root بيغيّروا
         توكنين مختلفين مش بيتعارضوا — التعارض بيبقى لما نفس المحدد يكتب
         نفس الخاصية. */
      const pairs = new Set();
      for (const r of body.matchAll(/(^|\})\s*([^{}@]+?)\s*\{([^{}]*)\}/g)) {
        const sels = r[2].split(",").map((x) => x.trim()).filter(Boolean);
        const props = [...r[3].matchAll(/(^|;)\s*([\w-]+)\s*:/g)].map((x) => x[2]);
        for (const sel of sels) for (const prop of props) pairs.add(`${sel}|${prop}`);
      }
      out.push({ v: +m[1], line: lineOf(src, m.index), selectors: pairs });
    }
    return out;
  };

  let n = 0;
  for (const f of cssFiles) {
    const src = strip(readFileSync(f, "utf8"));
    const bs = blocks(src);
    for (let i = 0; i < bs.length; i++) {
      for (let j = 0; j < i; j++) {
        if (bs[i].v <= bs[j].v) continue; // الأوسع لازم يكون الأول
        const shared = [...bs[i].selectors].filter((s2) => bs[j].selectors.has(s2));
        if (!shared.length) continue;
        console.log(
          `   ${RED("خطأ")} ${rel(f)}:${bs[i].line} — max-width:${bs[i].v}px بعد ${bs[j].v}px ` +
            `(سطر ${bs[j].line})، والاتنين بيكتبوا: ${shared.slice(0, 3).map((x) => x.replace("|", " → ")).join(" · ")}. ` +
            `الأوسع بيكسب على الموبايل، فالقاعدة الأضيق ميتة.`,
        );
        n++;
      }
    }
  }
  errors += n;
  console.log(n ? `   → ${n} خطأ` : "   ✓ الترتيب سليم");
}

/* ── 3. خط أصغر من الحد الأدنى ──────────────────────────────────────────── */
section("3. font-size تحت الحد الأدنى");
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
          `   ${RED("خطأ")} ${rel(f)}:${lineOf(masked, m.index)} — ${m[1]}rem ≈ ${(parseFloat(m[1]) * 9.5).toFixed(1)}px.` +
            ` استخدم var(--text-xs) أو أكبر. (شغّل: node scripts/fix-type-scale.mjs --write)`,
        );
        n++;
      }
    }
  }
  errors += n;
  console.log(n ? `   → ${n} خطأ` : "   ✓ مفيش خط تحت الحد");
}

/* ── 4. جريد ممكن يعمل overflow ─────────────────────────────────────────── */
section("4. minmax() من غير حارس");
{
  let n = 0;
  for (const f of cssFiles) {
    const src = strip(readFileSync(f, "utf8"));
    for (const m of src.matchAll(/minmax\(\s*([\d.]+)(px|rem)/g)) {
      console.log(
        `   ${RED("خطأ")} ${rel(f)}:${lineOf(src, m.index)} — minmax(${m[1]}${m[2]}, …)` +
          ` مبيقدرش ينزل تحت ${m[1]}${m[2]}، فبيخرج بره الشاشة على الموبايل` +
          ` وoverflow-x:hidden **بيقصّه** بدل ما يخليك تسكرول له.` +
          ` الصح: minmax(min(100%, ${m[1]}${m[2]}), …)`,
      );
      n++;
    }
  }
  errors += n;
  console.log(n ? `   → ${n} خطأ` : "   ✓ كل الجريدات محمية");
}

/* ── 5. تكلفة من غير فايدة على اللمس ────────────────────────────────────── */
section("5. transition غالي مش متقيّد بـ hover");
{
  let n = 0;
  for (const f of cssFiles) {
    const src = strip(readFileSync(f, "utf8"));
    const gated = src.replace(/@media\s*\(hover:\s*hover\)[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, "");
    for (const m of gated.matchAll(/transition:\s*(all|[^;]*\bfilter\b[^;]*)/g)) {
      console.log(
        `   ${YEL("تحذير")} ${rel(f)}:${lineOf(gated, m.index)} — ` +
          (m[1] === "all"
            ? "`transition: all` بيراقب كل خاصية. سمّي اللي بيتغيّر."
            : "transition على filter بيعيد رسم الصورة كل فريم، والموبايل بيدفعها من غير ما يشوف الـ hover."),
      );
      n++;
    }
  }
  warnings += n;
  console.log(n ? `   → ${n} تحذير` : "   ✓ نضيف");
}

/* ── 6. الشاشات الكبيرة ─────────────────────────────────────────────────── */
section("6. تغطية الشاشات الكبيرة");
{
  const all = cssFiles.map((f) => strip(readFileSync(f, "utf8"))).join("\n");
  const mins = new Set(
    [...all.matchAll(/min-width:\s*(\d+)px/g)].map((m) => +m[1]).filter((v) => v >= 1440),
  );
  if (mins.size === 0) {
    console.log(`   ${YEL("تحذير")} مفيش ولا min-width فوق 1440px — الشاشات الكبيرة مش متعامل معاها`);
    warnings++;
  } else {
    console.log(`   ✓ ${[...mins].sort((a, b) => a - b).join("px · ")}px`);
  }
}

/* ── الخلاصة ────────────────────────────────────────────────────────────── */
console.log(`\n${"─".repeat(60)}`);
console.log(`${cssFiles.length} ملف CSS · ${errors} خطأ · ${warnings} تحذير\n`);
process.exit(errors ? 1 : 0);
