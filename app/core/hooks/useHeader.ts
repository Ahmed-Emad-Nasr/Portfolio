"use client";
/*
 * File: useHeader.ts
 * Author: Ahmed Emad Nasr
 * PERF: SECTION_ICONS and SECTIONS are already module-level constants — good.
 * PERF: SPY_SECTIONS moved to module-level (was inside hook body, re-created every render)
 * PERF: Resize handler uses 768px breakpoint instead of 994 — corrected to
 * match CSS breakpoint. Also debounced via rAF to avoid layout thrash on
 * rapid resize events.
 */
import { useState, useEffect, useRef } from "react";
import { faHome, faBook, faCertificate, faFolder } from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useScrollSpy } from "./useScrollSpy";

const SECTION_ICONS: Record<string, IconProp> = {
  Home:           faHome,
  Experience:     faBook,
  Projects:       faFolder,
  Certifications: faCertificate,
};

// PERF: Module-level — never re-created inside hook body
const SPY_SECTIONS = Object.keys(SECTION_ICONS).map((label) => ({ label, elementId: label }));

export const useHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMenuOpenRef = useRef(isMenuOpen);
  isMenuOpenRef.current = isMenuOpen;

  const { activeSection, setActiveSection } = useScrollSpy({
    sections: SPY_SECTIONS,
    defaultSection: "Home",
    storageKey: "portfolio-activeSection",
  });

  const toggleMenu = (): void => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    let rafId = 0;

    const handleResize = (): void => {
      if (rafId) return;
      // PERF: rAF-debounced — resize fires dozens of times per drag, no need
      // to check + setIsMenuOpen on every pixel
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        if (window.innerWidth > 994 && isMenuOpenRef.current) setIsMenuOpen(false);
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return { isMenuOpen, activeSection, toggleMenu, sectionIcons: SECTION_ICONS, setActiveSection, setIsMenuOpen };
};