"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    try {
      const savedSection = localStorage.getItem(storageKey);
      if (savedSection && sections.some((section) => section.label === savedSection)) {
        setActiveSection(savedSection);
      }
    } catch {
      // localStorage can be unavailable in some private or embedded contexts.
    }

    let rafId = 0;
    let timeoutId: number | undefined;
    let lastRun = 0;
    let lastSection = defaultSection;

    const evaluateSection = () => {
      const isMobile = window.innerWidth <= 994;
      const headerElement = document.querySelector<HTMLElement>("[data-site-header='true']");
      const headerRect = headerElement?.getBoundingClientRect();
      const headerHeight = headerRect?.height ?? (isMobile ? 64 : 76);
      const headerTop = headerElement ? Number.parseFloat(window.getComputedStyle(headerElement).top || "0") : 0;
      const topOffset = Number.isFinite(headerTop) ? headerTop : 0;
      const marker = Math.max(72, Math.round(topOffset + headerHeight + (isMobile ? 8 : 12)));

      let current = defaultSection;
      let smallestDistance = Number.POSITIVE_INFINITY;

      for (const section of sections) {
        const el = document.getElementById(section.elementId);
        if (!el) continue;

        const { top } = el.getBoundingClientRect();
        const distance = Math.abs(top - marker);

        if (distance < smallestDistance) {
          smallestDistance = distance;
          current = section.label;
        }
      }

      if (current !== lastSection) {
        lastSection = current;
        setActiveSection(current);

        try {
          localStorage.setItem(storageKey, current);
        } catch {
          // Ignore storage write failures.
        }
      }

      lastRun = window.performance.now();
      rafId = 0;
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
  }, [defaultSection, sections, storageKey]);

  return { activeSection, setActiveSection };
}