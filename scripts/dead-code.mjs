#!/usr/bin/env node
/*
 * dead-code.mjs
 *
 * بيدوّر على الكود اللي مفيش حاجة بتستعمله. زيرو dependencies، بيشتغل على
 * الـ AST بتاع esbuild؟ لأ — بيشتغل بـ regex على نص الملف بعد شيل
 * التعليقات والسترينجات. يعني ممكن يغلط، وكل قسم مكتوب فيه إزاي تتأكد
 * بإيدك قبل ما تمسح أي حاجة.
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

const all = walk(join(ROOT, "app"));
const code = all.filter((f) => /\.tsx?$/.test(f));
const read = (f) => readFileSync(f, "utf8");
const rel = (f) => relative(ROOT, f);

/* شيل التعليقات والسترينجات — عشان كلمة جوه تعليق متتحسبش استخدام */
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

/* ── 1. exports مفيش حد بيستوردها ──────────────────────────────────────── */
section("1. exports مفيش حد بيستوردها");
{
  /* أسماء بيستهلكها Next نفسه من غير import صريح */
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
  console.log(hits.length ? `   → ${hits.length}` : "   ✓ نضيف");
  console.log(DIM("   تأكد بإيدك: الاسم ممكن يتقرا من ملف مش .ts/.tsx."));
  findings += hits.length;
}

/* ── 2. ملفات مفيش حد بيستوردها ────────────────────────────────────────── */
section("2. ملفات مفيش حد بيستوردها");
{
  /* Next بيوصل للملفات دي بالاسم/المسار، مش بـ import */
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
  console.log(hits.length ? `   → ${hits.length}` : "   ✓ نضيف");
  findings += hits.length;
}

/* ── 3. ملفات CSS مفيش حد بيستوردها ────────────────────────────────────── */
section("3. ملفات CSS مفيش حد بيستوردها");
{
  const hits = [];
  for (const f of all.filter((x) => x.endsWith(".css"))) {
    if (basename(f) === "globals.css") continue;
    const name = basename(f);
    const used = code.some((g) => src.get(g).includes(name));
    if (!used) hits.push(f);
  }
  for (const f of hits) console.log(`   ${YEL("?")} ${rel(f)}  (يتيم)`);
  console.log(hits.length ? `   → ${hits.length}` : "   ✓ نضيف");
  findings += hits.length;
}

/* ── 4. أيقونات معرّفة ومش مستخدمة ─────────────────────────────────────── */
section("4. أيقونات معرّفة ومش مستخدمة");
{
  const iconFile = code.find((f) => f.endsWith("icon-data.ts"));
  if (!iconFile) console.log("   (مفيش icon-data.ts)");
  else {
    const defined = [...body.get(iconFile).matchAll(/^\s*(fa[A-Z][\w]*)\s*:/gm)].map((m) => m[1]);
    const everywhere = [...src.values()].join("\n");
    const dead = defined.filter(
      (n) => (everywhere.match(new RegExp(`\\b${n}\\b`, "g")) || []).length <= 1,
    );
    for (const n of dead) console.log(`   ${YEL("?")} ${n}`);
    console.log(dead.length ? `   → ${dead.length} من ${defined.length}` : `   ✓ كل الـ ${defined.length} مستخدمة`);
    findings += dead.length;
  }
}

/* ── 5. حزم في package.json مفيش حد بيستوردها ──────────────────────────── */
section("5. حزم مفيش حد بيستوردها");
{
  const pkg = JSON.parse(read(join(ROOT, "package.json")));
  const everywhere = [...src.values()].join("\n");
  const scripts = Object.values(pkg.scripts || {}).join(" ");
  const scriptSrc = walk(join(ROOT, "scripts")).map(read).join("\n");
  /* حزم الإطار نفسه — Next بيستدعيها من جواه، مش بـ import في كودك */
  const IMPLICIT = new Set(["react", "react-dom", "next"]);
  const hits = [];
  for (const dep of Object.keys(pkg.dependencies || {})) {
    if (IMPLICIT.has(dep)) continue;
    const re = new RegExp(`["'\`]${dep.replace(/[/\\]/g, "\\$&")}`);
    if (!re.test(everywhere) && !re.test(scriptSrc) && !scripts.includes(dep))
      hits.push(dep);
  }
  for (const d of hits) console.log(`   ${YEL("?")} ${d}  (dependencies)`);
  console.log(hits.length ? `   → ${hits.length}` : "   ✓ نضيف");
  findings += hits.length;
}

console.log(`\n${"─".repeat(60)}`);
console.log(`${code.length} ملف كود · ${findings} حاجة محتاجة مراجعة\n`);
console.log(DIM("كل ده تخمين. راجع كل سطر قبل ما تمسح.\n"));
