"use client";

/*
 * File: sensei-header.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render sticky navigation header and mobile menu behavior
 */

import { useCallback, useMemo, memo, useEffect, type MouseEvent } from "react";
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

  useEffect(() => {
    if (window.innerWidth > 994) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleNavLinkClick = useCallback(
    (section: string, event?: MouseEvent<HTMLAnchorElement>) => {
      event?.preventDefault();
      setActiveSection(section);

      const path = window.location.pathname;
      const scopePrefix = path.startsWith("/Portfolio/") || path === "/Portfolio" ? "/Portfolio" : "";
      const homePath = `${scopePrefix}/`;

      if (path !== homePath && path !== scopePrefix) {
        window.location.assign(`${homePath}#${section}`);
        return;
      }

      window.location.hash = `#${section}`;

      // Wrapped in try-catch for private browsing mode & cross-origin restrictions
      try {
        localStorage.setItem("activeSection", section);
      } catch (e) {
        // localStorage is not available (private browsing, cross-origin iframe, etc.); silently ignore
        void e;
      }
      if (window.innerWidth <= 994) {
        setIsMenuOpen(false);
      }
    },
    [setActiveSection, setIsMenuOpen]
  );

  // Keep keyboard behavior predictable: Escape closes mobile menu.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, setIsMenuOpen]);

  const handleLogoClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      handleNavLinkClick("Home", event);
    },
    [handleNavLinkClick]
  );

  const handleBackdropClick = useCallback(() => {
    setIsMenuOpen(false);
  }, [setIsMenuOpen]);

  const navLinks = useMemo(
    () =>
      Object.entries(sectionIcons).map(([section, icon]) => {
        const navLabel = section.replace(/([a-z])([A-Z])/g, "$1 $2");

        return (
          <a
            key={section}
            href={`#${section}`}
            className={activeSection === section ? ACTIVE_CLASS : undefined}
            onClick={(event) => handleNavLinkClick(section, event)}
            aria-current={activeSection === section ? "page" : undefined}
          >
            <FontAwesomeIcon icon={icon} aria-hidden="true" />
            <span className={styles.navText}>{navLabel}</span>
          </a>
        );
      }),
    [sectionIcons, activeSection, handleNavLinkClick]
  );

  const menuIconClass = isMenuOpen ? `${MENU_ICON_BASE} ${ACTIVE_CLASS}` : MENU_ICON_BASE;
  const navbarClass = isMenuOpen ? `${NAVBAR_BASE} ${ACTIVE_CLASS}` : NAVBAR_BASE;

  return (
    <header className={styles.header} data-site-header="true">
      <a
        href="#Home"
        className={styles.logo}
        onClick={handleLogoClick}
        aria-label="Go to Home section"
      >
        アハメドズ
      </a>
      
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

      <nav
        id="main-navigation"
        className={navbarClass}
        aria-label="Main navigation"
      >
        {navLinks}
      </nav>
      {isMenuOpen ? <button type="button" className={styles.backdrop} aria-label="Close navigation menu" onClick={handleBackdropClick} /> : null}
    </header>
  );
});

export default SenseiHeader;