#!/usr/bin/env node
/*
 * data-audit.mjs
 *
 * Cross-file data integrity audit for core/config.
 *
 * ── Why ──
 *
 * The data is split across 14 files, and they reference each other by string ids:
 * skills.ts points at cases, attack.ts points at cases, and so does
 * start-here.ts. **Nothing in TypeScript checks that the id actually exists** — it's
 * a string, and the compiler has no idea it's supposed to match anything.
 *
 * So if you change an `id` in cases.ts, the build passes, `tsc` reports zero
 * errors, and the visitor clicks the link and gets a 404. The comments in skills.ts,
 * start-here.ts and attack.ts warn about this in plain text — and a warning in a comment
 * prevents nothing.
 *
 * This audit does what those comments ask for.
 *
 *   node scripts/data-audit.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CONFIG = join(process.cwd(), "app/core/config");
const read = (f) => readFileSync(join(CONFIG, f), "utf8");

/*
 * A copy of the file with comments stripped.
 *
 * The audit used to read the raw file, so when a number was fixed in code but still
 * mentioned in a comment explaining the fix, the script caught the number in the comment
 * and reported an error that was **already fixed**. The audit must read code only.
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
const fail = (m) => { console.log(`   ${RED("error")} ${m}`); errors++; };
const warn = (m) => { console.log(`   ${YEL("warning")} ${m}`); warnings++; };
const ok = (m) => console.log(`   ✓ ${m}`);

/* ── Source of truth: case ids ─────────────────────────────────────────── */
const casesSrc = read("cases.ts");
const caseIds = new Set([...casesSrc.matchAll(/^\s{4}id:\s*"([^"]+)"/gm)].map((m) => m[1]));

section(`1. Case library — ${caseIds.size} reports`);
{
  const all = [...casesSrc.matchAll(/^\s{4}id:\s*"([^"]+)"/gm)].map((m) => m[1]);
  const dups = all.filter((id, i) => all.indexOf(id) !== i);
  if (dups.length) fail(`duplicate ids: ${[...new Set(dups)].join(", ")}`);
  else ok("no duplicate ids");
}

/* ── Cross-references ──────────────────────────────────────────────────── */
section("2. Cross-file references");
{
  const refs = [
    /*
     * skills.ts has two kinds of id: the group's own id (siem, ir, …)
     * and the evidence ids that point at cases. We must read only what's inside
     * evidence — the first version of this audit read both and reported
     * 8 false errors.
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
      /* Cut out the evidence: [...] blocks first, then read the ids inside them */
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
    if (missing.length) { fail(`${file} (${label}) references ids that don't exist: ${missing.join(", ")}`); bad++; }
  }
  if (!bad) ok("all references point at existing cases");
}

/* ── ATT&CK ─────────────────────────────────────────────────────────── */
section("3. ATT&CK mapping");
let coveredTechniques = 0;
if (has("attack.ts")) {
  const src = read("attack.ts");
  const defined = new Set([...src.matchAll(/\{\s*id:\s*"(T\d+(?:\.\d+)?)"/g)].map((m) => m[1]));
  const block = src.slice(src.indexOf("caseAttackMapping"));
  const used = new Set([...block.matchAll(/"(T\d+(?:\.\d+)?)"/g)].map((m) => m[1]));
  coveredTechniques = used.size;

  const undef = [...used].filter((t) => !defined.has(t));
  if (undef.length) fail(`techniques used but not defined in TECHNIQUES: ${undef.join(", ")}`);
  else ok(`all used techniques are defined (${used.size})`);

  const unused = [...defined].filter((t) => !used.has(t));
  if (unused.length) warn(`techniques defined but never used — they only add file size: ${unused.join(", ")}`);
}

/* ── Hand-written numbers ──────────────────────────────────────────────── */
section("4. Hand-written numbers vs. the real data");
{
  /*
   * The most dangerous section. Numeric claims about your work are hand-written in text, while the data
   * keeps growing — so the number goes stale without anyone noticing. And it's a number
   * read in a hiring context.
   */
  if (has("cv.ts")) {
    const cv = readCode("cv.ts");
    const reports = cv.match(/Published (\d+) investigation reports/);
    if (reports && Number(reports[1]) !== caseIds.size) {
      fail(
        `CV_SUMMARY says "Published ${reports[1]} investigation reports" — ` +
          `actual count is ${caseIds.size} in cases.ts`,
      );
    } else if (reports) ok(`report count matches (${caseIds.size})`);

    const tech = cv.match(/covering (\d+) MITRE/);
    if (tech && coveredTechniques && Number(tech[1]) !== coveredTechniques) {
      fail(`CV_SUMMARY says "covering ${tech[1]} MITRE techniques" — actual count is ${coveredTechniques}`);
    } else if (tech) ok(`technique count matches (${coveredTechniques})`);
  }
}

/* ── External platform ids ─────────────────────────────────────────────── */
section("5. YouTube ids");
if (has("youtube.ts")) {
  const src = read("youtube.ts");
  /* A video id is 11 characters; a playlist id is PL + 32 = 34 */
  const badVideos = [...src.matchAll(/videoId:\s*"([^"]+)"/g)]
    .map((m) => m[1]).filter((v) => v.length !== 11);
  if (badVideos.length) fail(`video ids with the wrong length: ${badVideos.join(", ")}`);
  else ok("all video ids are 11 characters");

  const badLists = [...src.matchAll(/playlistId:\s*"([^"]+)"/g)]
    .map((m) => m[1]).filter((p) => !/^PL[\w-]{32}$/.test(p));
  if (badLists.length) {
    fail(
      `truncated playlist ids (the link and the iframe will return an error): ` +
        badLists.map((p) => `${p} (${p.length} chars)`).join(", "),
    );
  } else ok("all playlist ids are 34 characters");
}

/* ── External image URLs ───────────────────────────────────────────────── */
section("6. Well-formed external URLs");
if (has("projects.ts")) {
  const src = read("projects.ts");
  const avatars = [...new Set([...src.matchAll(/avatar_url:\s*"([^"]+)"/g)].map((m) => m[1]))];
  /*
   * Two formats work:
   *   avatars.githubusercontent.com/u/<number>   ← the numeric id, not the username
   *   github.com/<username>.png                  ← simpler, accepts the username
   *
   * The first version of this audit accepted only the first one, so when the URL was fixed
   * to the second format (which is valid) the script kept reporting it. The audit was stricter
   * than reality.
   */
  const bad = avatars.filter(
    (u) =>
      !/avatars\.githubusercontent\.com\/u\/\d+/.test(u) &&
      !/^https:\/\/github\.com\/[\w-]+\.png$/.test(u),
  );
  if (bad.length) {
    fail(
      `avatar_url must be avatars.githubusercontent.com/u/<number> or ` +
        `github.com/<username>.png — this format returns 404: ` + bad.join(", "),
    );
  } else ok("avatar URLs are well-formed");
}

/* ── Timeline ──────────────────────────────────────────────────────────── */
section("7. Timeline (experience.ts)");
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
   * The component used to render in array order without any sorting
   * (experience-section.tsx: knowledgeEducationItems.map), so the file order
   * was the order shown on screen.
   */
  /*
   * Ordering and alternation are now computed in the component
   * (core/config/portfolio-data.ts sorts by date before the timeline renders).
   *
   * So the two checks that used to live here — "array not sorted" and "two items on the same
   * side" — were measuring something that no longer affects the screen. Keeping them
   * would have meant reporting problems that were fixed at the root.
   *
   * What still matters: that the component **still** sorts. If someone removes the sort
   * later, the file order will matter again.
   */
  const comp = readCode("portfolio-data.ts");
  if (!/\.sort\(/.test(comp)) {
    warn("the component no longer sorts by date — array order in the file matters again");
  } else ok("the component sorts by date and assigns sides itself");

  if (/isRight:/.test(src)) {
    warn("`isRight` is still hard-coded in the data — it has no effect after sorting, cleaner to remove it");
  } else ok("no hard-coded isRight");

  /* Future dates */
  const today = new Date().toISOString().slice(0, 10);
  for (const r of rows) {
    if (r.start > today) warn(`"${r.tag}" has a start date in the future (${r.start})`);
    if (r.end && r.start && r.end < r.start) fail(`"${r.tag}" end date is before the start date`);
  }
}

console.log(`\n${"─".repeat(62)}`);
console.log(`${errors} error(s) · ${warnings} warning(s)\n`);
process.exit(errors ? 1 : 0);
