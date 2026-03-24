"use client";

/*
 * File: sensei-header.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render sticky navigation header and mobile menu behavior
 */

import { useCallback, useMemo, memo } from "react";
import styles from "./sensei-header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHeader } from "@/app/core/hooks/useHeader";

const MENU_ICON_BASE = styles.MenuIcon;
const NAVBAR_BASE    = styles.navbar;
const ACTIVE_CLASS   = styles.active;

const SenseiHeader = memo(function SenseiHeader() {
  const {
    isMenuOpen, activeSection, toggleMenu, sectionIcons, setActiveSection, setIsMenuOpen,
  } = useHeader();

  const handleNavLinkClick = useCallback(
    (section: string) => {
      setActiveSection(section);
      // Wrapped in try-catch for private browsing mode & cross-origin restrictions
      try {
        localStorage.setItem("activeSection", section);
      } catch (e) {
        // localStorage is not available (private browsing, cross-origin iframe, etc.); silently ignore
        if (process.env.NODE_ENV === "development" && e instanceof Error) {
          console.debug("localStorage unavailable:", e.message);
        }
      }
      if (window.innerWidth <= 994) {
        setIsMenuOpen(false);
      }
    },
    []
  );

  const handleLogoClick = useCallback(
    () => {
      handleNavLinkClick("Home"); // Navigate to home section
    },
    [handleNavLinkClick]
  );

  const navLinks = useMemo(
    () =>
      Object.entries(sectionIcons).map(([section, icon]) => (
        <a
          key={section}
          href={`#${section}`}
          className={activeSection === section ? ACTIVE_CLASS : undefined}
          onClick={() => handleNavLinkClick(section)}
          aria-current={activeSection === section ? "page" : undefined}
        >
          <FontAwesomeIcon icon={icon} aria-hidden="true" />
          <span className={styles.navText}>{section}</span>
        </a>
      )),
    [sectionIcons, activeSection, handleNavLinkClick]
  );

  const menuIconClass = isMenuOpen ? `${MENU_ICON_BASE} ${ACTIVE_CLASS}` : MENU_ICON_BASE;
  const navbarClass = isMenuOpen ? `${NAVBAR_BASE} ${ACTIVE_CLASS}` : NAVBAR_BASE;

  return (
    <header className={styles.header}>
      <a href="#Home" className={styles.logo} onClick={handleLogoClick} aria-label="Go to Home section">アハメドズ</a>
      
      <button
        type="button"
        className={menuIconClass}
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-controls="main-navigation"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <nav id="main-navigation" className={navbarClass} aria-label="Main navigation">
        {navLinks}
      </nav>
    </header>
  );
});

export default SenseiHeader;