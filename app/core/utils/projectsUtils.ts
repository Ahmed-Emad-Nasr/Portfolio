/*
 * File: projectsUtils.ts
 * PERF BUILD:
 * - Kept the cached Intl.DateTimeFormat (Excellent for performance).
 * - Stripped try...catch overhead (Assuming GitHub API dates are always valid).
 * - Inlined fallback returns to save memory allocation.
 */

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faCode, faTerminal } from "@fortawesome/free-solid-svg-icons";
import {
  faReact, faJs, faPython, faHtml5, faCss3, faJava,
  faPhp, faAndroid, faSwift, faWindows,
} from "@fortawesome/free-brands-svg-icons";

// ─── Statics ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, IconDefinition> = {
  TypeScript: faReact, JavaScript: faJs, Python: faPython, HTML: faHtml5,
  CSS: faCss3, Java: faJava, PHP: faPhp, Kotlin: faAndroid,
  Swift: faSwift, PowerShell: faTerminal, Shell: faTerminal, VisualBasic: faWindows,
};

// Cached Formatter (Zero initialization cost per render)
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric", month: "short", day: "numeric",
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const getIconForLanguage = (language: string | null): IconDefinition =>
  (language && ICON_MAP[language]) || faCode;

// No try/catch overhead — raw processing
export const formatDate = (dateString: string): string => 
  DATE_FORMATTER.format(new Date(dateString));