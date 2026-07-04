"use client";

// =============================================================================
// utils.ts
// Consolidated hooks/utilities file
// PERF BUILD: Removed GitHub fetch logic, kept pure utilities.
// =============================================================================

import { useEffect, useRef, useState, useCallback } from "react";
import { faHome, faBook, faCertificate, faFolder } from "@fortawesome/free-solid-svg-icons";
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
  } else if (text.includes(".") || text.includes(";")) {
    parts = text.split(/[.;]/);
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

const MS_PER_MONTH = 2629946880;

export const calculateExperience = (startDate: string, endDate?: string): string => {
  const start = Date.parse(startDate);
  const end = endDate ? Date.parse(endDate) : Date.now();

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

export const formatDate = (dateString: string): string =>
  DATE_FORMATTER.format(new Date(dateString));

// -----------------------------------------------------------------------------
// useScrollSpy.ts
// -----------------------------------------------------------------------------

export function useScrollSpy({ sections, defaultSection, storageKey }: UseScrollSpyOptions) {
  const [activeSection, setActiveSection] = useState(defaultSection);

  const config = useRef({ sections, defaultSection, storageKey });
  config.current = { sections, defaultSection, storageKey };

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

            setTimeout(() => {
              localStorage.setItem(config.current.storageKey, current);
            }, 0);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    calculateGeometry();
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", calculateGeometry, { passive: true });

    return () => {
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

const SECTION_ICONS: Record<string, IconProp> = {
  Home:           faHome,
  Experience:     faBook,
  Projects:       faFolder,
  Certifications: faCertificate,
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