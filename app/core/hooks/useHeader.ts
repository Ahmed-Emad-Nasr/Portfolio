"use client";
/*
 * File: useHeader.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Handle header navigation state, active section tracking, and mobile menu
 */
import { useState, useEffect, useRef } from "react";
import {
  faHome,
  faBook,
  faCertificate,
  faFolder,
} from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useScrollSpy } from "./useScrollSpy";

const SECTION_ICONS: Record<string, IconProp> = {
  Home:           faHome,
  Experience:     faBook,
  Projects:       faFolder,
  Certifications: faCertificate,
};

const SECTIONS = Object.keys(SECTION_ICONS);
const SPY_SECTIONS = SECTIONS.map((label) => ({ label, elementId: label }));

export const useHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fix #2: Ref mirrors state — handler reads current value without being a dep,
  // so the listener is registered once and never torn down on menu toggle.
  const isMenuOpenRef = useRef(isMenuOpen);
  isMenuOpenRef.current = isMenuOpen;

  const { activeSection, setActiveSection } = useScrollSpy({
    sections: SPY_SECTIONS,
    defaultSection: "Home",
    storageKey: "portfolio-activeSection",
  });

  // Fix #1: Plain function — no deps, useCallback adds memoization cost for nothing.
  const toggleMenu = (): void => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    // Fix #2: Reads ref — no stale closure, no re-registration on every toggle.
    const handleResize = (): void => {
      if (window.innerWidth > 994 && isMenuOpenRef.current) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty — listener registered once for the component lifetime.

  return {
    isMenuOpen,
    activeSection,
    toggleMenu,
    sectionIcons: SECTION_ICONS,
    setActiveSection,
    setIsMenuOpen,
  };
};