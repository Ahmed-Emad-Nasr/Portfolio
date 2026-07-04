"use client";

// =============================================================================
// utils.ts
// Consolidated hooks/utilities file — merges useGitHubRepos.ts, useHeader.ts,
// useRandomMedia.ts, useScrollSpy.ts, bulletUtils.ts, experienceUtils.ts,
// and projectsUtils.ts into a single module.
// =============================================================================

import { useEffect, useRef, useState, useCallback } from "react";
import { faHome, faBook, faCertificate, faFolder } from "@fortawesome/free-solid-svg-icons";
import type { IconProp, IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faCode, faTerminal } from "@fortawesome/free-solid-svg-icons";
import {
  faReact, faJs, faPython, faHtml5, faCss3, faJava,
  faPhp, faAndroid, faSwift, faWindows,
} from "@fortawesome/free-brands-svg-icons";
import { GITHUB_USERNAME, staticProjectFallback } from "@/app/core/config/portfolio";

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

  // 1. فحص سريع جداً لمعرفة نوع الفاصل قبل عمل أي Split
  if (text.includes("•")) {
    parts = text.split("•");
  } else if (text.includes(".") || text.includes(";")) {
    parts = text.split(/[.;]/);
  } else if (text.includes(",")) {
    parts = text.split(",");
  } else {
    // إذا لم يوجد أي فاصل، نعيد النص كما هو بعد تنظيف أطرافه
    const trimmed = text.trim();
    return trimmed ? [trimmed] : [];
  }

  // 2. فلترة وتنظيف في خطوة واحدة (بدون map و filter) لتوفير الذاكرة
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

// 2629946880 = 1000 * 60 * 60 * 24 * 30.4391898
const MS_PER_MONTH = 2629946880;

export const calculateExperience = (startDate: string, endDate?: string): string => {
  // استخدام Date.parse سريع جداً ولا يحجز Object في الذاكرة
  const start = Date.parse(startDate);
  const end = endDate ? Date.parse(endDate) : Date.now();

  const totalMonths = Math.floor((end - start) / MS_PER_MONTH);
  const years = Math.floor(totalMonths / 12);
  const mos = totalMonths % 12;

  // Inlined Pluralization (بدون استدعاء دوال خارجية)
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

// Cached Formatter (Zero initialization cost per render)
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric", month: "short", day: "numeric",
});

export const getIconForLanguage = (language: string | null): IconDefinition =>
  (language && ICON_MAP[language]) || faCode;

// No try/catch overhead — raw processing
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

    // تم إزالة الـ try...catch لسرعة التنفيذ
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

            // تم إزالة الـ try...catch
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
    // استخدام المتصفح مباشرة لمراقبة حجم الشاشة بأداء فائق
    const mediaQuery = window.matchMedia("(min-width: 995px)");

    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      // إذا تجاوزت الشاشة 994 بيكسل، أغلق القائمة
      if (e.matches) setIsMenuOpen(false);
    };

    // إضافة المستمع (يعمل فقط عند نقطة الكسر، وليس مع كل بيكسل)
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []); // [] لضمان إنشاء المستمع مرة واحدة فقط

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

// 1. تعريف الرابط خارج دورة حياة الـ React
const VIDEO_URL = "https://youtu.be/9gK7uyTGxz8?si=GiQOXFyaSJjVO2HR&t=230";

// 2. دالة الفتح مباشرة بدون أي إجراءات فحص أو التقاط للأخطاء
const handleImageClick = () => window.open(VIDEO_URL, "_blank");

// 3. تخزين الكائن المُرجع في الذاكرة مرة واحدة فقط لمنع إعادة إنشائه مع كل Render
const staticAPI = { handleImageClick };

// 4. الـ Hook الآن لا يقوم بأي عملية سوى إرجاع المرجع الثابت
export const useRandomMedia = () => staticAPI;

// -----------------------------------------------------------------------------
// useGitHubRepos.ts
// -----------------------------------------------------------------------------

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 4;
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=${PAGE_SIZE}&type=owner&page=`;
const REPO_CACHE_KEY = "github_repos_fast_cache";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useGitHubRepos = () => {
  const [state, setState] = useState({
    repos: [] as GitHubRepository[],
    isLoading: true,
    isLoadingMore: false,
    hasMore: true,
    nextPageToLoad: 2,
    source: "live" as "live" | "cache" | "static",
    loadError: null as string | null,
  });

  // نستخدم Ref لتتبع التحديثات بدون التسبب في Re-renders إضافية
  const refreshNonce = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(() => {
    refreshNonce.current += 1;
    setState(p => ({ ...p, isLoading: true, loadError: null, nextPageToLoad: 2, hasMore: true }));
  }, []);

  useEffect(() => {
    // إلغاء أي طلب سابق لضمان عدم استهلاك الذاكرة
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchInitial = async () => {
      // 1. عرض الكاش فوراً إن وجد (Zero Loading Time)
      const rawCache = typeof window !== "undefined" ? localStorage.getItem(REPO_CACHE_KEY) : null;
      if (rawCache) {
        try {
          const parsed = JSON.parse(rawCache);
          if (Date.now() - parsed.ts <= CACHE_TTL_MS) {
            setState(p => ({
              ...p, repos: parsed.items, source: "cache", isLoading: false,
              hasMore: parsed.hasMore, nextPageToLoad: parsed.nextPage
            }));

            // تحديث صامت في الخلفية (Stale-While-Revalidate)
            fetch(`${API_URL}1`, { signal: controller.signal })
              .then(res => res.ok ? res.json() : Promise.reject())
              .then(data => {
                if (data.length) {
                  const hasMore = data.length === PAGE_SIZE;
                  setTimeout(() => localStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ ts: Date.now(), items: data, hasMore, nextPage: 2 })), 0);
                  setState(p => ({ ...p, repos: data, source: "live", hasMore, nextPageToLoad: 2 }));
                }
              }).catch(() => {}); // تجاهل أخطاء التحديث الصامت
            return;
          }
        } catch {} // تجاهل الأخطاء وتخطي الكاش إذا كان تالفاً
      }

      // 2. إذا لم يوجد كاش، قم بجلب البيانات (محاولة واحدة فقط، بدون تأخير)
      try {
        const res = await fetch(`${API_URL}1`, { signal: controller.signal });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const hasMore = data.length === PAGE_SIZE;

        setTimeout(() => localStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ ts: Date.now(), items: data, hasMore, nextPage: 2 })), 0);
        setState({ repos: data, source: "live", isLoading: false, isLoadingMore: false, hasMore, nextPageToLoad: 2, loadError: null });
      } catch (err: any) {
        if (err.name === "AbortError") return;

        // 3. في حال فشل الطلب فوراً يتم عرض الـ Fallback
        setState({
          repos: staticProjectFallback as unknown as GitHubRepository[],
          source: "static", isLoading: false, isLoadingMore: false, hasMore: false,
          nextPageToLoad: 2, loadError: "GitHub data unavailable. Showing static fallback."
        });
      }
    };

    fetchInitial();
    return () => controller.abort();
  }, [refreshNonce.current]); // الاعتماد على الـ Ref لتجنب مشاكل الـ Dependencies

  const loadRemainingRepos = async () => {
    if (state.isLoading || state.isLoadingMore || !state.hasMore) return;
    setState(p => ({ ...p, isLoadingMore: true }));

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_URL}${state.nextPageToLoad}`, { signal: controller.signal });
      if (!res.ok) throw new Error();
      const data = await res.json();

      if (data.length > 0) {
        const hasMore = data.length === PAGE_SIZE;
        const nextPage = state.nextPageToLoad + 1;

        setState(p => {
          const merged = [...p.repos, ...data];
          // تحديث الكاش في الخلفية
          setTimeout(() => localStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ ts: Date.now(), items: merged, hasMore, nextPage })), 0);
          return { ...p, repos: merged, hasMore, nextPageToLoad: nextPage };
        });
      } else {
        setState(p => ({ ...p, hasMore: false }));
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setState(p => ({ ...p, loadError: "Failed to load more projects." }));
      }
    } finally {
      setState(p => ({ ...p, isLoadingMore: false }));
    }
  };

  return { ...state, loadRemainingRepos, refresh };
};
