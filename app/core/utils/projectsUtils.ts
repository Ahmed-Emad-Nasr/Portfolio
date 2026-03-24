/*
 * File: projectsUtils.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Map project metadata (icons and dates) for UI presentation
 */

// ─── Statics ──────────────────────────────────────────────────────────────────

// Object literal hoisted at module level — created once, never recreated per call.
const ICON_MAP: Readonly<Record<string, string>> = {
  TypeScript:  "fa-brands fa-react",
  JavaScript:  "fa-brands fa-js",
  Python:      "fa-brands fa-python",
  HTML:        "fa-brands fa-html5",
  CSS:         "fa-brands fa-css3",
  Java:        "fa-brands fa-java",
  PHP:         "fa-brands fa-php",
  Kotlin:      "fa-brands fa-android",
  Swift:       "fa-brands fa-swift",
  PowerShell:  "fa-solid fa-terminal",
  Shell:       "fa-solid fa-terminal",
  VisualBasic: "fa-brands fa-windows",
};

const FALLBACK_ICON = "fa-solid fa-code";

// Reuse a single Intl.DateTimeFormat instance instead of constructing a new one
// on every formatDate call. Intl constructors are expensive.
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year:  "numeric",
  month: "short",
  day:   "numeric",
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const getIconForLanguage = (language: string | null): string =>
  (language && ICON_MAP[language]) || FALLBACK_ICON;

export const formatDate = (dateString: string): string => {
  try {
    return DATE_FORMATTER.format(new Date(dateString));
  } catch {
    return "Unknown date";
  }
};