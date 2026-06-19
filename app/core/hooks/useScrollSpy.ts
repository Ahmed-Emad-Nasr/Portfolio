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