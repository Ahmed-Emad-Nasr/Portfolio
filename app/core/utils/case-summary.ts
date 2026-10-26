/*
 * core/utils/case-summary.ts
 * Author: Ahmed Emad Nasr
 *
 * Turns a case's one-paragraph description into a structured briefing for the
 * case page: an objective, the actions (or phases) taken, the outcome, and the
 * artifacts mentioned along the way (IPs, CVEs, ports …).
 *
 * The descriptions stay plain prose in cases.ts — they also feed the meta
 * description, the JSON-LD, the RSS feed and llms.txt, where prose is the
 * right shape. Only the case page reads this structure, so 77 summaries got a
 * layout without anyone rewriting 77 summaries.
 *
 * Everything here is conservative: when a sentence does not clearly split,
 * it is kept whole. Worst case is the old paragraph, never a mangled one.
 */

/** Text with inline code spans swapped for \u0000N\u0000 placeholders */
export type Rich = { text: string; code: readonly string[] };

export type SummaryStep = {
  /** The sentence or clause */
  text: string;
  /** A list that hung off it ("…7 issues: a, b, c" / "…included x, y, z") */
  items?: string[];
};

type SummaryPhase = { index: number; title: string; steps: SummaryStep[] };

type ArtifactKind = "ip" | "cve" | "osvdb" | "port" | "technique";
export type Artifact = { kind: ArtifactKind; value: string };

export type CaseSummary = {
  /** Shared code-span table — every text field below may hold placeholders */
  code: readonly string[];
  objective: string;
  steps: SummaryStep[];
  phases: SummaryPhase[];
  outcome?: string;
  artifacts: Artifact[];
};

/* ── Inline code spans ─────────────────────────────────────────────────── */

/* 'like this': the opening quote follows a start, space or bracket (so the
   apostrophe in "attacker's" never opens one), the closing quote is not
   followed by a letter (so "user's" inside never closes one). */
const CODE_SPAN = /(^|[\s([{])'([^'\n]{1,160}?)'(?=[^\w]|$)/g;

const PLACEHOLDER = /\u0000(\d+)\u0000/g;

function maskCode(text: string): Rich {
  const code: string[] = [];
  const masked = text.replace(CODE_SPAN, (_m, lead: string, inner: string) => {
    code.push(inner);
    return `${lead}\u0000${code.length - 1}\u0000`;
  });
  return { text: masked, code };
}

/* ── Splitting helpers (all work on masked text) ───────────────────────── */

/** Split at a separator only where brackets are balanced */
function splitTopLevel(text: string, at: (rest: string, i: number) => number): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if ((ch === ")" || ch === "]" || ch === "}") && depth > 0) depth--;
    else if (depth === 0) {
      const skip = at(text.slice(i), i);
      if (skip > 0) {
        parts.push(text.slice(start, i));
        start = i + skip;
        i = start - 1;
      }
    }
  }
  parts.push(text.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

const ABBREVIATIONS = /(?:\b(?:e\.g|i\.e|etc|vs|Inc|Ltd|approx|No)\.)$/;

function sentences(text: string): string[] {
  return splitTopLevel(text, (rest, i) => {
    const m = /^[.!?](\s+)(?=[A-Z\u0000"'])/.exec(rest);
    if (!m) return 0;
    if (ABBREVIATIONS.test(text.slice(0, i + 1))) return 0;
    return 1 + m[1].length;
  }).map((s) => (/[.!?]$/.test(s) ? s : `${s}.`));
}

const PAST = /^(?:[a-z]+ed|built|wrote|ran|found|set|made|led|kept|took|held|sent|drew|caught|brought|undertook|overrode|swept|began|became|gave|got|won|shot|read)\b/i;
/* Past participles that open a noun phrase, not an action: ", compromised
   EC2 behaviours", "an unlinked, unprotected portal", ", followed by …". A
   clause starting with one of these keeps the sentence whole. */
const NOT_AN_ACTION = /^(?:un[a-z]+ed|compromised|imported|encrypted|automated|advanced|detailed|simulated|suspected|infected|authenticated|exposed|misconfigured|outdated|embedded|privileged|targeted|signed|followed|based|related|associated|dedicated|distributed|limited|required)\b/i;
const isAction = (clause: string) => PAST.test(clause) && !NOT_AN_ACTION.test(clause);
const GERUND = /^[a-z]+ing\b/i;
const LIST_TRIGGER = /^(.*?\b(?:included|includes|encompassed|involved|covered|comprised|spanned))\s+(.+)$/;

const capitalise = (s: string) => s.replace(/^[a-z]/, (c) => c.toUpperCase());
const withStop = (s: string) => (/[.!?:]$/.test(s) ? s : `${s}.`);
/* Top-level comma clauses. A leading "and " stays on its clause so that
   clauses glued back together read exactly like the original. */
const rawClauses = (s: string) => splitTopLevel(s.replace(/[.]$/, ""), (rest) => (/^,\s+/.exec(rest)?.[0].length ?? 0));
const dropAnd = (s: string) => s.replace(/^and\s+/, "");
const commaClauses = (s: string) => rawClauses(s).map(dropAnd);

/** One sentence → one step, several steps, or a step with a sub-list */
function toSteps(sentence: string): SummaryStep[] {
  const body = sentence.replace(/[.]$/, "");

  /* "…uncovering 7 notable issues: a, b, and c" → head + items */
  const colon = splitTopLevel(body, (rest) => (/^:\s+/.test(rest) ? 2 : 0));
  if (colon.length === 2) {
    const items = commaClauses(colon[1]);
    if (items.length >= 3) return [{ text: `${colon[0]}:`, items: items.map((s) => withStop(capitalise(s))) }];
  }

  const raw = rawClauses(body);
  /* "Inspected X, monitored Y, and compiled Z" → one bullet per action. A
     clause that is not an action ("…, followed by …", "…, compromised EC2
     behaviours") stays attached to the action before it. */
  /* The sentence's own first word is always the verb ("Authenticated into …"),
     so only the later clauses go through the adjective check */
  if (raw.length >= 2 && PAST.test(raw[0])) {
    const actions: string[] = [];
    for (const [k, clause] of raw.entries()) {
      if (k === 0 || isAction(dropAnd(clause))) actions.push(dropAnd(clause));
      else actions[actions.length - 1] += `, ${clause}`;
    }
    if (actions.length >= 2) return actions.map((c) => ({ text: withStop(capitalise(c)) }));
  }

  const clauses = raw.map(dropAnd);
  if (clauses.length >= 3) {
    const rest = clauses.slice(1);
    /* "The work included doing X, doing Y, and doing Z" → intro + list */
    const trigger = LIST_TRIGGER.exec(clauses[0]);
    if (trigger && GERUND.test(trigger[2]) && rest.every((c) => GERUND.test(c))) {
      return [{ text: `${trigger[1]}:`, items: [trigger[2], ...rest].map((s) => withStop(capitalise(s))) }];
    }
  }
  return [{ text: sentence }];
}

/* ── Artifacts ─────────────────────────────────────────────────────────── */

const ARTIFACT_PATTERNS: [ArtifactKind, RegExp][] = [
  ["ip", /\b(?:\d{1,3}\.){3}\d{1,3}\b/g],
  ["cve", /\bCVE-\d{4}-\d{4,}\b/g],
  ["osvdb", /\bOSVDB-\d+\b/g],
  ["port", /\b\d{1,5}\/(?:tcp|udp)\b/gi],
  ["technique", /\bT1\d{3}(?:\.\d{3})?\b/g],
];

function artifactsOf(raw: string): Artifact[] {
  const seen = new Set<string>();
  const out: Artifact[] = [];
  for (const [kind, re] of ARTIFACT_PATTERNS) {
    for (const m of raw.matchAll(re)) {
      /* "UnrealIRCd 3.2.8.1" is a version, not a host: skip anything over 255
         and anything made only of single digits */
      if (kind === "ip" && (m[0].split(".").some((n) => Number(n) > 255) || /^(?:\d\.){3}\d$/.test(m[0]))) continue;
      const value = kind === "port" ? m[0].toLowerCase() : m[0];
      if (seen.has(value)) continue;
      seen.add(value);
      out.push({ kind, value });
    }
  }
  return out;
}

/* ── Public API ────────────────────────────────────────────────────────── */

const OUTCOME = /^(?:Compiled|Documented|Produced|Delivered|Achieved|Earned|Concluded|Summari[sz]ed|Finally,)/;
const PHASE = /\bPhase\s+(\d+)\s*[—–-]\s*([^:]{3,90}):\s*/g;

export function parseCaseSummary(description: string): CaseSummary {
  const { text, code } = maskCode(description.replace(/\s+/g, " ").trim());
  const artifacts = artifactsOf(description);

  /* Phased write-ups: everything before "Phase 1 —" is the objective */
  const marks = [...text.matchAll(PHASE)];
  if (marks.length >= 2) {
    const intro = sentences(text.slice(0, marks[0].index).trim());
    const phases = marks.map((m, k) => {
      const from = (m.index ?? 0) + m[0].length;
      const to = k + 1 < marks.length ? marks[k + 1].index : text.length;
      return {
        index: Number(m[1]),
        title: m[2].trim(),
        steps: sentences(text.slice(from, to).trim()).flatMap(toSteps),
      };
    });
    return {
      code,
      objective: intro[0] ?? "",
      steps: intro.slice(1).flatMap(toSteps),
      phases,
      artifacts,
    };
  }

  const all = sentences(text);
  const objective = all[0] ?? description;
  let body = all.slice(1);
  let outcome: string | undefined;
  if (body.length >= 2 && OUTCOME.test(body[body.length - 1])) {
    outcome = body[body.length - 1];
    body = body.slice(0, -1);
  }
  return { code, objective, steps: body.flatMap(toSteps), phases: [], outcome, artifacts };
}

/**
 * The short text for a case card in the library: the objective, plus the
 * next sentence when the objective alone is only a line ("Completed the X
 * room on TryHackMe."). Code spans come back as plain text and a leading
 * "Successfully" is dropped — on a card it costs a third of the first line.
 */
export function caseCardBlurb(description: string): string {
  const s = parseCaseSummary(description);
  const plain = (t: string) => t.replace(PLACEHOLDER, (_m, i: string) => s.code[Number(i)] ?? "");
  const step = s.steps[0] ?? s.phases[0]?.steps[0];
  /* A step that only introduces a list ("…covers solving multiple
     vulnerabilities:") reads as cut off on its own — bring the list along */
  const firstStep = step && (step.items?.length ? `${step.text} ${step.items.join(" ")}` : step.text);
  let text = plain(s.objective);
  if (text.length < 90 && firstStep) text = `${text} ${plain(firstStep)}`;
  return text.replace(/^Successfully\s+(\w)/, (_m, c: string) => c.toUpperCase());
}
