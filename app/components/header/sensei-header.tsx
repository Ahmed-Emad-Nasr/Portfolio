"use client";
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
      localStorage.setItem("activeSection", section);
      if (window.innerWidth <= 994) {
        setIsMenuOpen(false);
      }
    },
    [setActiveSection, setIsMenuOpen]
  );

  const handleLogoClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      handleNavLinkClick("Home"); // Navigate to home section
    },
    [handleNavLinkClick]
  );

  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMenu();
      }
    },
    [toggleMenu]
  );

  const navLinks = useMemo(
    () =>
      Object.entries(sectionIcons).map(([section, icon]) => (
        <a
          key={section}
          href={`#${section}`}
          className={activeSection === section ? ACTIVE_CLASS : undefined}
          onClick={() => handleNavLinkClick(section)}
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
      <a href="#" className={styles.logo} onClick={handleLogoClick}>
        <span lang="ja">アーメド エマド</span>
      </a>

      <div
        className={menuIconClass}
        onClick={toggleMenu}
        onKeyDown={handleMenuKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </div>

      <nav className={navbarClass} aria-label="Main navigation">
        {navLinks}
      </nav>
    </header>
  );
});

export default SenseiHeader;