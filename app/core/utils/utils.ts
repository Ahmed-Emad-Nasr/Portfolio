"use client";

// =============================================================================
// utils.ts
// Consolidated hooks/utilities file
// PERF BUILD: Removed GitHub fetch logic, kept pure utilities.
// =============================================================================

import { useEffect, useRef, useState, useCallback } from "react";
import { faHome, faBook, faCertificate, faFolder, faShieldHalved, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import type { IconProp, IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faCode, faTerminal } from "@fortawesome/free-solid-svg-icons";
import {
  faReact, faJs, faPython, faHtml5, faCss3, faJava,
  faPhp, faAndroid, faSwift, faWindows,
} from "@fortawesome/free-brands-svg-icons";

// -----------------------------------------------------------------------------
// Types (from useGitHubRepos.ts + useScrollSpy.ts)
// -----------------------------------------------------------------------------

export interface GitHubRepository {
  id: number;
  name: string;
  description: string;
  language: string;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  owner: { login: string; avatar_url: string };
  topics: string[];
  default_branch: string;
  watchers_count: number;
  license: { name: string } | null;
}

export type ScrollSpySection = {
  label: string;
  elementId: string;
};

type UseScrollSpyOptions = {
  sections: readonly ScrollSpySection[];
  defaultSection: string;
  storageKey: string;
};

// -----------------------------------------------------------------------------
// bulletUtils.ts
// PERF BUILD:
// - Removed expensive global Regex `replace(/\s+/g)`.
// - Eliminated `map().filter()` chains to prevent multi-array memory allocation overhead.
// - Uses blazing fast `includes()` (Native C++ string matching) before attempting any `split()`.
// -----------------------------------------------------------------------------

export const toBulletItems = (text: string): string[] => {
  if (!text) return [];

  let parts: string[];

  if (text.includes("•")) {
    parts = text.split("•");
  } else if (text.includes(";")) {
    parts = text.split(";");
  } else if (text.includes(".")) {
    // FIX: the old `split(/[.;]/)` split on EVERY period, so "Node.js",
    // "v2.0" and "10.5%" were shredded mid-word into garbage bullets.
    // Split only at a real sentence boundary: a period followed by
    // whitespace + a capital letter, or by end-of-string.
    parts = text.split(/\.(?=\s+[A-Z]|\s*$)/);
  } else if (text.includes(",")) {
    parts = text.split(",");
  } else {
    const trimmed = text.trim();
    return trimmed ? [trimmed] : [];
  }

  const result: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const val = parts[i].trim();
    if (val) result.push(val);
  }

  return result;
};

// -----------------------------------------------------------------------------
// experienceUtils.ts
// PERF BUILD:
// - Removed try...catch and isNaN safety checks.
// - Replaced new Date().getTime() with Date.parse() for zero object allocation.
// - Inlined pluralization logic to eliminate Call Stack overhead.
// - Pre-calculated MS_PER_MONTH constant.
// -----------------------------------------------------------------------------

// FIX: was 2629946880, which is not any real month length and drifts ~2 days
// per year — enough to flip the displayed month count on boundary dates.
// Gregorian mean month = 365.2425 / 12 days.
const MS_PER_MONTH = 2629746000;

export const calculateExperience = (startDate: string, endDate?: string): string => {
  const start = Date.parse(startDate);
  const end = endDate ? Date.parse(endDate) : Date.now();

  // The previous "PERF BUILD" removed the isNaN guard. A malformed date then
  // produced NaN, which failed every `> 0` check and silently rendered
  // "< 1 mo" — a wrong answer that looks like a real one.
  if (Number.isNaN(start) || Number.isNaN(end)) return "";

  const totalMonths = Math.floor((end - start) / MS_PER_MONTH);
  const years = Math.floor(totalMonths / 12);
  const mos = totalMonths % 12;

  if (years > 0 && mos > 0) return `${years} Year${years > 1 ? "s" : ""} ${mos} Month${mos > 1 ? "s" : ""}`;
  if (years > 0) return `${years} Year${years > 1 ? "s" : ""}`;
  if (totalMonths > 0) return `${totalMonths} Month${totalMonths > 1 ? "s" : ""}`;

  return "< 1 mo";
};

// -----------------------------------------------------------------------------
// projectsUtils.ts
// PERF BUILD:
// - Kept the cached Intl.DateTimeFormat (Excellent for performance).
// - Stripped try...catch overhead (Assuming GitHub API dates are always valid).
// - Inlined fallback returns to save memory allocation.
// -----------------------------------------------------------------------------

const ICON_MAP: Record<string, IconDefinition> = {
  TypeScript: faReact, JavaScript: faJs, Python: faPython, HTML: faHtml5,
  CSS: faCss3, Java: faJava, PHP: faPhp, Kotlin: faAndroid,
  Swift: faSwift, PowerShell: faTerminal, Shell: faTerminal, VisualBasic: faWindows,
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric", month: "short", day: "numeric",
});

export const getIconForLanguage = (language: string | null): IconDefinition =>
  (language && ICON_MAP[language]) || faCode;

// RENAMED from `formatDate`: a second export with that exact name lives in
// core/config/portfolio.ts using en-GB, while this one uses en-US. The same
// date rendered differently depending on which module a component imported
// from. Distinct names make the choice deliberate.
export const formatRepoDate = (dateString: string): string =>
  DATE_FORMATTER.format(new Date(dateString));

// -----------------------------------------------------------------------------
// useScrollSpy.ts
// -----------------------------------------------------------------------------

export function useScrollSpy({ sections, defaultSection, storageKey }: UseScrollSpyOptions) {
  const [activeSection, setActiveSection] = useState(defaultSection);

  // The main effect below runs once (deps: []) but needs the LATEST props on
  // every scroll frame, so they are mirrored into a ref. Writing that ref
  // during render is what React's `react-hooks/refs` rule forbids — during a
  // concurrent render React may discard the result, leaving the ref holding
  // values from a render that never committed.
  //
  // Fix: write it in an effect with NO dependency array, so it re-syncs after
  // every committed render. It is declared BEFORE the main effect so that on
  // mount it runs first and the main effect always reads fresh values.
  const config = useRef({ sections, defaultSection, storageKey });

  useEffect(() => {
    config.current = { sections, defaultSection, storageKey };
  });

  useEffect(() => {
    const { sections, storageKey, defaultSection } = config.current;

    const saved = localStorage.getItem(storageKey);
    if (saved && sections.some((s) => s.label === saved)) {
      setActiveSection(saved);
    }

    let cachedPositions: { label: string; absoluteTop: number }[] = [];
    let markerOffset = 0;
    let lastActive = defaultSection;
    let ticking = false;

    const calculateGeometry = () => {
      const isMobile = window.innerWidth <= 994;
      const headerElement = document.querySelector<HTMLElement>("[data-site-header='true']");

      let headerHeight = isMobile ? 64 : 76;
      let headerTop = 0;

      if (headerElement) {
        headerHeight = headerElement.offsetHeight || headerHeight;
        headerTop = Number.parseFloat(window.getComputedStyle(headerElement).top || "0") || 0;
      }

      markerOffset = Math.max(72, Math.round(headerTop + headerHeight + (isMobile ? 8 : 12)));

      cachedPositions = config.current.sections.map((section) => {
        const el = document.getElementById(section.elementId);
        const absoluteTop = el ? el.getBoundingClientRect().top + window.scrollY : 0;
        return { label: section.label, absoluteTop };
      });
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentTargetPosition = window.scrollY + markerOffset;

          let current = config.current.defaultSection;
          let smallestDistance = Number.POSITIVE_INFINITY;

          for (let i = 0; i < cachedPositions.length; i++) {
            const distance = Math.abs(cachedPositions[i].absoluteTop - currentTargetPosition);
            if (distance < smallestDistance) {
              smallestDistance = distance;
              current = cachedPositions[i].label;
            }
          }

          if (current !== lastActive) {
            lastActive = current;
            setActiveSection(current);

            // localStorage.setItem is synchronous and touches disk. Firing it
            // on every section change during a fast scroll caused visible
            // hitches; requestIdleCallback defers it to spare time.
            const persist = () => localStorage.setItem(config.current.storageKey, current);
            if ("requestIdleCallback" in window) window.requestIdleCallback(persist);
            else setTimeout(persist, 200);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    calculateGeometry();
    handleScroll();

    // FIX: the sections are code-split, so at mount time most of them are
    // still zero-height placeholders. The old code measured once and cached
    // those wrong offsets forever — the nav highlighted the wrong section for
    // the whole session. A ResizeObserver on <body> re-measures whenever a
    // section actually lands and changes the page height.
    const resizeObserver = new ResizeObserver(() => {
      calculateGeometry();
      handleScroll();
    });
    resizeObserver.observe(document.body);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", calculateGeometry, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculateGeometry);
    };
  }, []);

  return { activeSection, setActiveSection };
}

// -----------------------------------------------------------------------------
// useHeader.ts
// PERF BUILD:
// - Replaced `resize` event listener (fires constantly) with `matchMedia`.
//   This ensures the state only updates EXACTLY when crossing the 995px breakpoint,
//   consuming 0 CPU cycles during normal window resizing.
// - Removed redundant `useRef` for state tracking.
// -----------------------------------------------------------------------------

/*
 * الترتيب هنا هو ترتيب الـ nav وترتيب الـ scrollspy وترتيب اختصارات
 * "g + حرف" في الـ command palette — مصدر واحد للتلاتة.
 *
 * اتضاف: Coverage (خريطة ATT&CK) و Contact (قسم الفورم الجديد). قبل كده
 * كان فيه JSON-LD في layout.tsx و page.tsx بيشاور على "#Contact" ومفيش
 * أي طريقة في الـ nav توصّلك له.
 */
const SECTION_ICONS: Record<string, IconProp> = {
  Home:           faHome,
  Experience:     faBook,
  Projects:       faFolder,
  Certifications: faCertificate,
  Coverage:       faShieldHalved,
  Contact:        faEnvelope,
};

const SPY_SECTIONS = Object.keys(SECTION_ICONS).map((label) => ({ label, elementId: label }));

export const useHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { activeSection, setActiveSection } = useScrollSpy({
    sections: SPY_SECTIONS,
    defaultSection: "Home",
    storageKey: "portfolio-activeSection",
  });

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 995px)");

    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsMenuOpen(false);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  return {
    isMenuOpen,
    activeSection,
    toggleMenu,
    sectionIcons: SECTION_ICONS,
    setActiveSection,
    setIsMenuOpen,
  };
};

// -----------------------------------------------------------------------------
// useRandomMedia.ts
// -----------------------------------------------------------------------------

const VIDEO_URL = "https://youtu.be/9gK7uyTGxz8?si=GiQOXFyaSJjVO2HR&t=230";

const handleImageClick = () => window.open(VIDEO_URL, "_blank");

const staticAPI = { handleImageClick };

export const useRandomMedia = () => staticAPI;