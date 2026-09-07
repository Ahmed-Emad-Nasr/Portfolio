#!/usr/bin/env node
/*
 * data-audit.mjs
 *
 * فحص ترابط الداتا بين ملفات core/config.
 *
 * ── ليه ──
 *
 * الداتا متقسّمة على ١٤ ملف، والملفات بتشاور على بعض بمعرّفات نصية:
 * skills.ts بيشاور على cases، attack.ts بيشاور على cases، start-here.ts
 * كمان. **مفيش أي حاجة في TypeScript بتتأكد إن المعرّف ده موجود** — ده
 * نص، والـ compiler مبيعرفش إنه المفروض يطابق حاجة.
 *
 * يعني لو غيّرت `id` في cases.ts، الـ build بيعدّي عادي و`tsc` بيقول صفر
 * أخطاء، والزائر بيضغط على اللينك ويلاقي 404. التعليقات في skills.ts و
 * start-here.ts و attack.ts بتحذّر من ده بالنص — والتحذير في تعليق
 * مبيمنعش حاجة.
 *
 * الفحص ده بيعمل اللي التعليقات دي بتطلبه.
 *
 *   node scripts/data-audit.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CONFIG = join(process.cwd(), "app/core/config");
const read = (f) => readFileSync(join(CONFIG, f), "utf8");

/*
 * نسخة من الملف بعد شيل التعليقات.
 *
 * الفحص كان بيقرا الملف خام، فلما اتصلّح رقم في الكود وفضل مذكور في
 * تعليق بيشرح التصليح، السكربت مسك الرقم من التعليق وبلّغ عن خطأ
 * **اتصلّح خلاص**. الفحص لازم يقرا الكود بس.
 */
const readCode = (f) =>
  readFileSync(join(CONFIG, f), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ");
const has = (f) => existsSync(join(CONFIG, f));

const B = (s) => `\x1b[1m${s}\x1b[0m`;
const RED = (s) => `\x1b[31m${s}\x1b[0m`;
const YEL = (s) => `\x1b[33m${s}\x1b[0m`;

let errors = 0;
let warnings = 0;
const section = (t) => console.log(`\n${B(t)}`);
const fail = (m) => { console.log(`   ${RED("خطأ")} ${m}`); errors++; };
const warn = (m) => { console.log(`   ${YEL("تحذير")} ${m}`); warnings++; };
const ok = (m) => console.log(`   ✓ ${m}`);

/* ── مصدر الحقيقة: معرّفات الـ cases ─────────────────────────────────── */
const casesSrc = read("cases.ts");
const caseIds = new Set([...casesSrc.matchAll(/^\s{4}id:\s*"([^"]+)"/gm)].map((m) => m[1]));

section(`1. مكتبة الـ cases — ${caseIds.size} تقرير`);
{
  const all = [...casesSrc.matchAll(/^\s{4}id:\s*"([^"]+)"/gm)].map((m) => m[1]);
  const dups = all.filter((id, i) => all.indexOf(id) !== i);
  if (dups.length) fail(`ids مكررة: ${[...new Set(dups)].join(", ")}`);
  else ok("مفيش ids مكررة");
}

/* ── المراجع المتقاطعة ──────────────────────────────────────────────── */
section("2. مراجع بين الملفات");
{
  const refs = [
    /*
     * skills.ts فيه نوعين من الـ id: معرّف المجموعة نفسها (siem, ir, …)
     * ومعرّفات الـ evidence اللي بتشاور على cases. لازم نقرا اللي جوه
     * evidence بس — أول نسخة من الفحص ده كانت بتقرا الاتنين وبتبلّغ عن
     * ٨ أخطاء وهمية.
     */
    ["skills.ts", "EVIDENCE_ONLY", "evidence"],
    ["start-here.ts", /^\s{4}id:\s*"([a-z0-9-]+)"/gm, "startHere"],
    ["attack.ts", null, "caseAttackMapping"],
  ];
  let bad = 0;
  for (const [file, re, label] of refs) {
    if (!has(file)) continue;
    const src = read(file);
    let ids;
    if (file === "skills.ts") {
      /* بنقص بلوكات evidence: [...] الأول، وبعدين نقرا الـ ids من جواها */
      ids = [];
      for (const blk of src.matchAll(/evidence:\s*\[([\s\S]*?)\]/g)) {
        ids.push(...[...blk[1].matchAll(/id:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]));
      }
    } else if (file === "attack.ts") {
      const block = src.slice(src.indexOf("caseAttackMapping"));
      ids = [...block.matchAll(/^\s{2}"([a-z0-9-]+)":\s*\[/gm)].map((m) => m[1]);
    } else {
      ids = [...src.matchAll(re)].map((m) => m[1]);
    }
    const missing = ids.filter((id) => !caseIds.has(id));
    if (missing.length) { fail(`${file} (${label}) بيشاور على ids مش موجودة: ${missing.join(", ")}`); bad++; }
  }
  if (!bad) ok("كل المراجع بتشاور على cases موجودة");
}

/* ── ATT&CK ─────────────────────────────────────────────────────────── */
section("3. ربط ATT&CK");
let coveredTechniques = 0;
if (has("attack.ts")) {
  const src = read("attack.ts");
  const defined = new Set([...src.matchAll(/\{\s*id:\s*"(T\d+(?:\.\d+)?)"/g)].map((m) => m[1]));
  const block = src.slice(src.indexOf("caseAttackMapping"));
  const used = new Set([...block.matchAll(/"(T\d+(?:\.\d+)?)"/g)].map((m) => m[1]));
  coveredTechniques = used.size;

  const undef = [...used].filter((t) => !defined.has(t));
  if (undef.length) fail(`تكنيكات مستخدمة ومش معرّفة في TECHNIQUES: ${undef.join(", ")}`);
  else ok(`كل التكنيكات المستخدمة معرّفة (${used.size})`);

  const unused = [...defined].filter((t) => !used.has(t));
  if (unused.length) warn(`تكنيكات معرّفة ومحدش بيستخدمها — بتزوّد حجم الملف بس: ${unused.join(", ")}`);
}

/* ── الأرقام المكتوبة بإيد ──────────────────────────────────────────── */
section("4. أرقام مكتوبة بإيد مقابل الداتا الحقيقية");
{
  /*
   * ده أخطر قسم. الادعاءات الرقمية عن شغلك بتتكتب بإيد في نص، والداتا
   * بتكبر بعدين — فالرقم بيبقى قديم من غير ما حد ياخد باله. وده رقم
   * بيتقرا في سياق توظيف.
   */
  if (has("cv.ts")) {
    const cv = readCode("cv.ts");
    const reports = cv.match(/Published (\d+) investigation reports/);
    if (reports && Number(reports[1]) !== caseIds.size) {
      fail(
        `CV_SUMMARY بيقول "Published ${reports[1]} investigation reports" — ` +
          `الحقيقة ${caseIds.size} في cases.ts`,
      );
    } else if (reports) ok(`عدد التقارير مطابق (${caseIds.size})`);

    const tech = cv.match(/covering (\d+) MITRE/);
    if (tech && coveredTechniques && Number(tech[1]) !== coveredTechniques) {
      fail(`CV_SUMMARY بيقول "covering ${tech[1]} MITRE techniques" — الحقيقة ${coveredTechniques}`);
    } else if (tech) ok(`عدد التكنيكات مطابق (${coveredTechniques})`);
  }
}

/* ── معرّفات المنصات الخارجية ───────────────────────────────────────── */
section("5. معرّفات يوتيوب");
if (has("youtube.ts")) {
  const src = read("youtube.ts");
  /* معرّف الفيديو ١١ حرف، وقايمة التشغيل PL + ٣٢ = ٣٤ */
  const badVideos = [...src.matchAll(/videoId:\s*"([^"]+)"/g)]
    .map((m) => m[1]).filter((v) => v.length !== 11);
  if (badVideos.length) fail(`معرّفات فيديو بطول غلط: ${badVideos.join(", ")}`);
  else ok("كل معرّفات الفيديو ١١ حرف");

  const badLists = [...src.matchAll(/playlistId:\s*"([^"]+)"/g)]
    .map((m) => m[1]).filter((p) => !/^PL[\w-]{32}$/.test(p));
  if (badLists.length) {
    fail(
      `معرّفات قوائم تشغيل مقطوعة (اللينك والـ iframe هيرجعوا خطأ): ` +
        badLists.map((p) => `${p} (${p.length} حرف)`).join(", "),
    );
  } else ok("كل معرّفات القوائم ٣٤ حرف");
}

/* ── روابط الصور الخارجية ───────────────────────────────────────────── */
section("6. روابط خارجية معروفة الصيغة");
if (has("projects.ts")) {
  const src = read("projects.ts");
  const avatars = [...new Set([...src.matchAll(/avatar_url:\s*"([^"]+)"/g)].map((m) => m[1]))];
  /*
   * صيغتين بيشتغلوا:
   *   avatars.githubusercontent.com/u/<رقم>   ← الرقم مش الاسم
   *   github.com/<الاسم>.png                   ← أبسط، وبيقبل الاسم
   *
   * أول نسخة من الفحص ده كانت بتقبل الأولى بس، فلما اتصلّح الرابط
   * للصيغة التانية (وهي صحيحة) السكربت فضل يبلّغ عنه. الفحص كان أضيق
   * من الواقع.
   */
  const bad = avatars.filter(
    (u) =>
      !/avatars\.githubusercontent\.com\/u\/\d+/.test(u) &&
      !/^https:\/\/github\.com\/[\w-]+\.png$/.test(u),
  );
  if (bad.length) {
    fail(
      `avatar_url لازم يكون avatars.githubusercontent.com/u/<رقم> أو ` +
        `github.com/<الاسم>.png — الصيغة دي بترجع 404: ` + bad.join(", "),
    );
  } else ok("روابط الأفاتار بصيغة صحيحة");
}

/* ── الخط الزمني ────────────────────────────────────────────────────── */
section("7. الخط الزمني (experience.ts)");
if (has("experience.ts")) {
  const src = read("experience.ts");
  const body = src.slice(src.indexOf("knowledgeEducationItems = ["));
  const objs = [...body.matchAll(/\n {2}\{([\s\S]*?)\n {2}\}/g)].map((m) => m[1]);

  const rows = objs.map((o) => ({
    tag: (o.match(/tag:\s*"([^"]+)"/) || [])[1],
    right: (o.match(/isRight:\s*(true|false)/) || [])[1],
    start: (o.match(/startDate:\s*"([^"]+)"/) || [])[1],
    end: (o.match(/endDate:\s*"([^"]+)"/) || [])[1],
  }));

  /*
   * الكومبوننت بيعرض بترتيب المصفوفة من غير أي فرز
   * (experience-section.tsx: knowledgeEducationItems.map). فترتيب الملف
   * هو الترتيب اللي بيتشاف على الشاشة.
   */
  const dates = rows.map((r) => r.start);
  const sorted = [...dates].sort().reverse();
  if (dates.join() !== sorted.join()) {
    warn("الترتيب في الملف مش تنازلي بالتاريخ — والكومبوننت بيعرض بترتيب المصفوفة من غير فرز");
    rows.forEach((r, i) => {
      if (r.start !== sorted[i]) console.log(`        ${r.start}  ${r.tag}`);
    });
  } else ok("مرتّب تنازلياً بالتاريخ");

  /* التبادل يمين/شمال — الشكل بيعتمد عليه */
  let breaks = 0;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].right && rows[i].right === rows[i - 1].right) {
      warn(`"${rows[i].tag}" على نفس جهة اللي قبله (${rows[i].right === "true" ? "يمين" : "شمال"})`);
      breaks++;
    }
  }
  if (!breaks) ok("التبادل يمين/شمال سليم");

  /* تواريخ مستقبلية */
  const today = new Date().toISOString().slice(0, 10);
  for (const r of rows) {
    if (r.start > today) warn(`"${r.tag}" تاريخ بدايته في المستقبل (${r.start})`);
    if (r.end && r.start && r.end < r.start) fail(`"${r.tag}" تاريخ النهاية قبل البداية`);
  }
}

console.log(`\n${"─".repeat(62)}`);
console.log(`${errors} خطأ · ${warnings} تحذير\n`);
process.exit(errors ? 1 : 0);
