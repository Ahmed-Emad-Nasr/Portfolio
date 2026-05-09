/*
 * File: projectsUtils.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Map project metadata (icons and dates) for UI presentation
 */

// ─── Statics ──────────────────────────────────────────────────────────────────
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faCode,
  faTerminal,
} from "@fortawesome/free-solid-svg-icons";
import {
  faReact,
  faJs,
  faPython,
  faHtml5,
  faCss3,
  faJava,
  faPhp,
  faAndroid,
  faSwift,
  faWindows,
} from "@fortawesome/free-brands-svg-icons";

// Map languages to IconDefinition objects so components can render SVG icons
const ICON_MAP: Readonly<Record<string, IconDefinition>> = {
  TypeScript: faReact,
  JavaScript: faJs,
  Python: faPython,
  HTML: faHtml5,
  CSS: faCss3,
  Java: faJava,
  PHP: faPhp,
  Kotlin: faAndroid,
  Swift: faSwift,
  PowerShell: faTerminal,
  Shell: faTerminal,
  VisualBasic: faWindows,
};

const FALLBACK_ICON = faCode;

// Reuse a single Intl.DateTimeFormat instance instead of constructing a new one
// on every formatDate call. Intl constructors are expensive.
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year:  "numeric",
  month: "short",
  day:   "numeric",
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const getIconForLanguage = (language: string | null): IconDefinition =>
  (language && ICON_MAP[language]) || FALLBACK_ICON;

export const formatDate = (dateString: string): string => {
  try {
    return DATE_FORMATTER.format(new Date(dateString));
  } catch {
    return "Unknown date";
  }
};