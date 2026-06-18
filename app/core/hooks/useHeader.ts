"use client";

/*
 * File: useHeader.ts
 * PERF BUILD:
 * - Replaced `resize` event listener (fires constantly) with `matchMedia`.
 * This ensures the state only updates EXACTLY when crossing the 995px breakpoint, 
 * consuming 0 CPU cycles during normal window resizing.
 * - Removed redundant `useRef` for state tracking.
 */

import { useState, useEffect, useCallback } from "react";
import { faHome, faBook, faCertificate, faFolder } from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useScrollSpy } from "./useScrollSpy";

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
    setIsMenuOpen 
  };
};