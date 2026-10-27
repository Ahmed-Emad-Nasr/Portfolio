#!/usr/bin/env node
/*
 * data-audit.mjs — cross-file checks TypeScript cannot do.
 *
 * The data files reference cases by string id (skills, start-here, ATT&CK).
 * A renamed or mistyped id still compiles and builds, and the visitor gets a
 * 404. This reads the data files and checks every reference.
 *
 *   npm run check:data
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DATA = join(process.cwd(), "data");
const read = (f) => readFileSync(join(DATA, f), "utf8");
const has = (f) => existsSync(join(DATA, f));

const B = (s) => `\x1b[1m${s}\x1b[0m`;
const RED = (s) => `\x1b[31m${s}\x1b[0m`;
const YEL = (s) => `\x1b[33m${s}\x1b[0m`;

let errors = 0;
let warnings = 0;
const section = (t) => console.log(`\n${B(t)}`);
const fail = (m) => { console.log(`   ${RED("error")} ${m}`); errors++; };
const warn = (m) => { console.log(`   ${YEL("warning")} ${m}`); warnings++; };
const ok = (m) => console.log(`   ✓ ${m}`);

/* ── 1. Case ids ─────────────────────────────────────────────────────── */
const casesSrc = read("cases.ts");
const allIds = [...casesSrc.matchAll(/^\s{4}id:\s*"([^"]+)"/gm)].map((m) => m[1]);
const caseIds = new Set(allIds);

section(`1. Case library — ${caseIds.size} cases`);
const dups = allIds.filter((id, i) => allIds.indexOf(id) !== i);
if (dups.length) fail(`duplicate ids: ${[...new Set(dups)].join(", ")}`);
else ok("no duplicate ids");

/* ── 2. References to cases ──────────────────────────────────────────── */
section("2. References to cases");
{
  const refs = {
    /* only the ids inside `evidence: [...]` (the group ids are not cases) */
    "skills.ts": (src) =>
      [...src.matchAll(/evidence:\s*\[([\s\S]*?)\]/g)].flatMap((blk) => [...blk[1].matchAll(/id:\s*"([a-z0-9-]+)"/g)].map((m) => m[1])),
    "start-here.ts": (src) => [...src.matchAll(/^\s{4}id:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]),
    "attack.ts": (src) => [...src.slice(src.indexOf("caseAttackMapping")).matchAll(/^\s{2}"([a-z0-9-]+)":\s*\[/gm)].map((m) => m[1]),
  };
  let bad = 0;
  for (const [file, idsOf] of Object.entries(refs)) {
    if (!has(file)) continue;
    const missing = idsOf(read(file)).filter((id) => !caseIds.has(id));
    if (missing.length) {
      fail(`${file} references cases that don't exist: ${missing.join(", ")}`);
      bad++;
    }
  }
  if (!bad) ok("every reference points at an existing case");
}

/* ── 3. ATT&CK mapping ──────────────────────────────────────────────── */
section("3. ATT&CK mapping");
if (has("attack.ts")) {
  const src = read("attack.ts");
  const defined = new Set([...src.matchAll(/\{\s*id:\s*"(T\d+(?:\.\d+)?)"/g)].map((m) => m[1]));
  const block = src.slice(src.indexOf("caseAttackMapping"));
  /* Sub-techniques (T1566.001) count under their parent (T1566) */
  const usedFull = [...block.matchAll(/"(T\d+(?:\.\d+)?)"/g)].map((m) => m[1]);
  const used = new Set(usedFull.map((t) => t.split(".")[0]));

  const subNames = new Set([...src.matchAll(/"(T\d+\.\d+)":\s*"/g)].map((m) => m[1]));
  const unnamed = [...new Set(usedFull.filter((t) => t.includes(".") && !subNames.has(t)))];
  if (unnamed.length) warn(`sub-techniques without a name in SUBTECHNIQUE_NAMES: ${unnamed.join(", ")}`);

  const undef = [...used].filter((t) => !defined.has(t));
  if (undef.length) fail(`techniques used but not defined in TECHNIQUES: ${undef.join(", ")}`);
  else ok(`all used techniques are defined (${used.size})`);

  const unused = [...defined].filter((t) => !used.has(t));
  if (unused.length) warn(`techniques defined but never used: ${unused.join(", ")}`);
}

/* ── 4. YouTube ids ──────────────────────────────────────────────────── */
section("4. YouTube ids");
if (has("youtube.ts")) {
  const src = read("youtube.ts");
  /* a video id is 11 characters; a playlist id is PL + 32 */
  const badVideos = [...src.matchAll(/videoId:\s*"([^"]+)"/g)].map((m) => m[1]).filter((v) => v.length !== 11);
  if (badVideos.length) fail(`video ids with the wrong length: ${badVideos.join(", ")}`);
  else ok("all video ids are 11 characters");

  const badLists = [...src.matchAll(/playlistId:\s*"([^"]+)"/g)].map((m) => m[1]).filter((p) => !/^PL[\w-]{32}$/.test(p));
  if (badLists.length) fail(`malformed playlist ids: ${badLists.join(", ")}`);
  else ok("all playlist ids are 34 characters");
}

/* ── 5. Avatar URLs ──────────────────────────────────────────────────── */
section("5. GitHub avatar URLs");
if (has("projects.ts")) {
  const avatars = [...new Set([...read("projects.ts").matchAll(/avatar_url:\s*"([^"]+)"/g)].map((m) => m[1]))];
  /* avatars.githubusercontent.com/u/<number> or github.com/<username>.png */
  const bad = avatars.filter(
    (u) => !/avatars\.githubusercontent\.com\/u\/\d+/.test(u) && !/^https:\/\/github\.com\/[\w-]+\.png$/.test(u),
  );
  if (bad.length) fail(`avatar URLs that return 404: ${bad.join(", ")}`);
  else ok("avatar URLs are well-formed");
}

/* ── 6. Timeline dates ───────────────────────────────────────────────── */
section("6. Timeline dates (experience.ts)");
if (has("experience.ts")) {
  const src = read("experience.ts");
  const items = [...src.matchAll(/\n {2}\{([\s\S]*?)\n {2}\}/g)].map((m) => ({
    tag: (m[1].match(/tag:\s*"([^"]+)"/) || [])[1],
    start: (m[1].match(/startDate:\s*"([^"]+)"/) || [])[1],
    end: (m[1].match(/endDate:\s*"([^"]+)"/) || [])[1],
  }));
  const today = new Date().toISOString().slice(0, 10);
  let bad = 0;
  for (const r of items) {
    if (r.start > today) { warn(`"${r.tag}" starts in the future (${r.start})`); bad++; }
    if (r.end && r.start && r.end < r.start) { fail(`"${r.tag}" ends before it starts`); bad++; }
  }
  if (!bad) ok(`${items.length} entries, dates in order`);
}

console.log(`\n${"─".repeat(62)}`);
console.log(`${errors} error(s) · ${warnings} warning(s)\n`);
process.exit(errors ? 1 : 0);
