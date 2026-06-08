"use client";
import { useEffect, useRef, useState } from "react";

export type ScrollSpySection = {
  label: string;
  elementId: string;
};

type UseScrollSpyOptions = {
  sections: readonly ScrollSpySection[];
  defaultSection: string;
  storageKey: string;
};

const SCROLL_SAMPLE_MS = 180;

export function useScrollSpy({ sections, defaultSection, storageKey }: UseScrollSpyOptions) {
  const [activeSection, setActiveSection] = useState(defaultSection);

  // Fix #1: Stabilize references so the effect never re-registers due to parent re-renders.
  const sectionsRef   = useRef(sections);
  sectionsRef.current = sections;

  const storageKeyRef   = useRef(storageKey);
  storageKeyRef.current = storageKey;

  const defaultSectionRef   = useRef(defaultSection);
  defaultSectionRef.current = defaultSection;

  useEffect(() => {
    try {
      const savedSection = localStorage.getItem(storageKeyRef.current);
      if (savedSection && sectionsRef.current.some((s) => s.label === savedSection)) {
        setActiveSection(savedSection);
      }
    } catch {
      // localStorage can be unavailable in some private or embedded contexts.
    }

    // Fix #2: Cache header element once — DOM query removed from scroll hot path.
    const headerElement = document.querySelector<HTMLElement>("[data-site-header='true']");

    // Fix #3: Compute header top once at setup — no getComputedStyle per scroll tick.
    const headerTop = headerElement
      ? Number.parseFloat(window.getComputedStyle(headerElement).top || "0")
      : 0;
    const cachedHeaderTop = Number.isFinite(headerTop) ? headerTop : 0;

    let rafId = 0;
    let timeoutId: number | undefined;
    let lastRun = 0;
    let lastSection = defaultSectionRef.current;

    const evaluateSection = () => {
      const isMobile = window.innerWidth <= 994;

      // Fix #2 + #3: headerElement and top already resolved — only height is live
      // (could change on resize, so we read it here, but querySelector is gone).
      const headerHeight = headerElement?.getBoundingClientRect().height ?? (isMobile ? 64 : 76);
      const marker = Math.max(72, Math.round(cachedHeaderTop + headerHeight + (isMobile ? 8 : 12)));

      const currentSections  = sectionsRef.current;
      const currentDefault   = defaultSectionRef.current;
      const currentStorageKey = storageKeyRef.current;

      let current = currentDefault;
      let smallestDistance = Number.POSITIVE_INFINITY;

      for (const section of currentSections) {
        const el = document.getElementById(section.elementId);
        if (!el) continue;
        const distance = Math.abs(el.getBoundingClientRect().top - marker);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          current = section.label;
        }
      }

      if (current !== lastSection) {
        lastSection = current;
        setActiveSection(current);
        try {
          localStorage.setItem(currentStorageKey, current);
        } catch {
          // Ignore storage write failures.
        }
      }

      lastRun   = window.performance.now();
      rafId     = 0;
      timeoutId = undefined;
    };

    const handleScroll = () => {
      const elapsed = window.performance.now() - lastRun;
      if (rafId || timeoutId !== undefined) return;
      if (elapsed >= SCROLL_SAMPLE_MS) {
        rafId = window.requestAnimationFrame(evaluateSection);
        return;
      }
      timeoutId = window.setTimeout(() => {
        rafId = window.requestAnimationFrame(evaluateSection);
      }, SCROLL_SAMPLE_MS - elapsed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []); // Fix #1: Empty — refs keep values current without triggering re-registration.

  return { activeSection, setActiveSection };
}