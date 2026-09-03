/*
 * scripts/css-audit.mjs
 *
 * فحص CSS للمشروع. صفر تبعيات — node بس.
 *
 *   node scripts/css-audit.mjs
 *
 * بيدوّر على أربع حاجات، وكلها اتلقت فعلاً في الموقع ده مرة على الأقل:
 *
 *   1. كلاسات معرّفة في .module.css ومحدش بيستخدمها
 *   2. متغيّرات CSS معرّفة ومحدش بيقراها
 *   3. ملفات CSS شبه متطابقة (الهيدر الرئيسي والبلوج كانوا 99٪ نفس الملف)
 *   4. خصائص غالية على المسار الحرج (backdrop-filter، transition عليها،
 *      محددات عالمية)
 *
 * شغّله قبل أي PR. أرخص من اكتشاف إن ٤٢٪ من نظام التوكنز ميت بعد سنة.
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

const files = walk(ROOT);
const cssFiles = files.filter((f) => f.endsWith(".css"));
const codeFiles = files.filter((f) => /\.tsx?$/.test(f));

const read = (f) => readFileSync(f, "utf8");
const allCode = codeFiles.map(read).join("\n");
const allCss = cssFiles.map((f) => strip(read(f))).join("\n");

let issues = 0;
const section = (title) => console.log(`\n\x1b[1m${title}\x1b[0m`);

/* ── 1. كلاسات ميتة ────────────────────────────────────────────────────── */
section("1. كلاسات معرّفة ومش مستخدمة");

/* بنجمع كل استخدام لأي متغيّر styles مهما كان اسمه (styles، anchorStyles، …)
   وبنمسك التركيب الديناميكي styles[`x-${y}`] بإننا نتجاهل أي كلاس بادئته
   موجودة في تركيب زي ده. */
const usedNames = new Set();
for (const m of allCode.matchAll(/\b\w*[Ss]tyles\.(\w+)/g)) usedNames.add(m[1]);
for (const m of allCode.matchAll(/\b\w*[Ss]tyles\[\s*[`"']([\w-]+)/g)) usedNames.add(m[1]);

const dynamicPrefixes = [];
for (const m of allCode.matchAll(/\b\w*[Ss]tyles\[\s*`([\w-]*)\$\{/g)) {
  if (m[1]) dynamicPrefixes.push(m[1]);
}

/* استدعاء ديناميكي كامل: styles[line.kind] أو styles[variant] — من غير أي
   نص ثابت نقدر نمسكه.

   ده كان بيدّي false positive حقيقي: Terminal.tsx بيرندر
   `className={styles[line.kind]}` و line.kind نوعه "in" | "out" | "err" |
   "dim". السكربت كان بيقول إن .in و .out و .dim كلاسات ميتة، وهي شغّالة —
   ومسحها كان هيكسر ألوان الترمينال من غير أي error.

   لما ملف يحتوي على تركيب زي ده، مبنقدرش نحكم على كلاساته إحصائياً، فبنعلّم
   الملف كله ونستثنيه من فحص الكلاسات الميتة مع ملاحظة صريحة. */
const dynamicFiles = new Set();
for (const f of codeFiles) {
  const src = read(f);
  if (/\b\w*[Ss]tyles\[\s*[A-Za-z_$][\w.$]*\s*\]/.test(src)) {
    /* بنربط ملف الكود بملف الـ CSS اللي بيستورده */
    for (const m of src.matchAll(/from\s+["'](\.[^"']*\.module\.css)["']/g)) {
      dynamicFiles.add(m[1].replace(/^\.\//, ""));
    }
  }
}

let deadClasses = 0;
let skippedDynamic = 0;
for (const f of cssFiles.filter((f) => f.endsWith(".module.css"))) {
  if ([...dynamicFiles].some((d) => f.endsWith(d.split("/").pop()))) {
    skippedDynamic++;
    continue;
  }
  const names = new Set(strip(read(f)).match(/\.[A-Za-z_][\w-]*/g)?.map((s) => s.slice(1)) ?? []);
  const dead = [...names].filter(
    (n) => !usedNames.has(n) && !dynamicPrefixes.some((p) => n.startsWith(p)),
  );
  if (dead.length) {
    console.log(`   ${relative(".", f)}`);
    console.log(`      ${dead.join(", ")}`);
    deadClasses += dead.length;
  }
}
console.log(deadClasses ? `   → ${deadClasses} كلاس` : "   ✓ نضيف");
if (skippedDynamic) {
  console.log(
    `   (${skippedDynamic} ملف اتخطّى — بيستخدم styles[expr] فمش ممكن يتفحص إحصائياً)`,
  );
}
issues += deadClasses;

/* ── 2. متغيّرات ميتة ──────────────────────────────────────────────────── */
section("2. متغيّرات CSS معرّفة ومش مقروءة");

const readVars = new Set([
  ...[...allCss.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]),
  // next/font بيولّد --font-* من الجافاسكريبت
  ...[...allCode.matchAll(/(--font-[\w-]+)/g)].map((m) => m[1]),
]);

const declared = new Map();
for (const f of cssFiles) {
  for (const m of strip(read(f)).matchAll(/^\s*(--[\w-]+)\s*:/gm)) {
    if (!declared.has(m[1])) declared.set(m[1], f);
  }
}
const deadVars = [...declared].filter(([v]) => !readVars.has(v));
for (const [v, f] of deadVars) console.log(`   ${v}  (${relative(".", f)})`);
console.log(
  deadVars.length
    ? `   → ${deadVars.length} من ${declared.size} (${Math.round((deadVars.length / declared.size) * 100)}٪)`
    : "   ✓ نضيف",
);
issues += deadVars.length;

/* ── 3. ملفات شبه متطابقة ──────────────────────────────────────────────── */
section("3. ملفات CSS شبه متطابقة");

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
      console.log(`   ${pct}٪ متطابقين:`);
      console.log(`      ${relative(".", fa)}`);
      console.log(`      ${relative(".", fb)}`);
      dupPairs++;
    }
  }
}
console.log(dupPairs ? `   → ${dupPairs} زوج` : "   ✓ نضيف");
issues += dupPairs;

/* ── 4. خصائص غالية ───────────────────────────────────────────────────── */
section("4. خصائص غالية على المسار الحرج");

const flags = [];
for (const f of cssFiles) {
  const t = strip(read(f));
  const rel = relative(".", f);

  // transition على backdrop-filter أو filter = إعادة رسم GPU كل فريم
  /* transition على filter جوه @media (hover: hover) مقبول: الجهاز اللي
     بيدفع التكلفة هو الوحيد اللي بيشوف الأثر. بنشيل البلوكات دي قبل الفحص. */
  const t2 = t.replace(
    /@media\s*\(hover:\s*hover\)[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g,
    "",
  );
  for (const m of t2.matchAll(/transition:[^;]*\b(backdrop-filter|filter)\b[^;]*/g)) {
    flags.push(`   ${rel}: transition على ${m[1]} — إعادة رسم GPU كل فريم`);
  }
  // backdrop-filter بقيمة ثابتة بدل التوكن = بيتخطّى ميزانية الجهاز
  for (const m of t.matchAll(/backdrop-filter:\s*blur\((\d)/g)) {
    if (m[1] !== "0") {
      flags.push(`   ${rel}: backdrop-filter بقيمة ثابتة — استخدم var(--ui-blur)`);
      break;
    }
  }
  // محدد عالمي بخصائص مش وراثية
  if (/^\s*\*\s*\{/m.test(t)) {
    flags.push(`   ${rel}: محدد \`*\` — بيتحسب على كل عنصر في الصفحة`);
  }
  // محدد بحث نصّي جزئي — بطيء وبيتكسر مع تهشير CSS Modules
  for (const m of t.matchAll(/\[class\*=/g)) {
    flags.push(`   ${rel}: [class*=…] — بطيء وبيتكسر مع تهشير CSS Modules`);
    break;
  }
  // transition: all بيراقب كل خاصية
  if (/transition:\s*all\b/.test(t)) {
    flags.push(`   ${rel}: transition: all — حدّد الخصائص بالاسم`);
  }
}
for (const line of [...new Set(flags)]) console.log(line);
console.log(flags.length ? `   → ${new Set(flags).size} تنبيه` : "   ✓ نضيف");
issues += new Set(flags).size;

/* ── الخلاصة ──────────────────────────────────────────────────────────── */
const bytes = cssFiles.reduce((n, f) => n + readFileSync(f).length, 0);
console.log(`\n${"─".repeat(60)}`);
console.log(`${cssFiles.length} ملف CSS · ${bytes.toLocaleString()} بايت · ${issues} ملاحظة`);
console.log(
  "\nملاحظة: التعليقات والمسافات بتتشال في build الإنتاج، فحجم الملف في\n" +
  "الريبو مش مقياس أداء. اللي بيتقاس هو عدد القواعد اللي المتصفح بيمرّ\n" +
  "عليها في كل style recalculation، وتكلفة الرسم للخصائص في القسم ٤.\n",
);
