"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHeader } from "@/app/core/utils/utils";
import Icon from "@/app/core/icons/Icon";
import styles from "./sensei-header.module.css";
import { scrollToElement } from "@/app/core/utils/scroll";

// Maps short labels to their full names
const getShortLabel = (section: string) => {
  switch (section.toLowerCase()) {
    case "home": return "HOME";
    case "experience": return "EXP";
    case "projects": case "work": return "WORK";
    case "certifications": case "cert": return "CERT";
    default: return section.toUpperCase();
  }
};

export default function SenseiHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const { isMenuOpen, activeSection, toggleMenu, sectionIcons, setActiveSection, setIsMenuOpen } = useHeader();

  // Check whether the user is on the blog page
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");

  // ── Scroll Event Handler (toggles the header class on scroll without an extra render) ──
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      headerRef.current?.classList.toggle(styles.scrolled, window.scrollY > 18);
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  // ── Lock scrolling on mobile while the menu is open ──────────────────────
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  // ── Nav click handler ─────────────────────────────────────────────────────
  const handleNavClick = (section: string, e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActiveSection(section);
    const target = document.getElementById(section);
    if (!target) return;
    
    /* Back to an instant jump, as explicitly requested — instead of the smooth scroll that was here.
       scrollToElement still accounts for the fixed header height, but immediate:true
       bypasses the Lenis engine and jumps straight there. */
    const doScroll = () => scrollToElement(target, { immediate: true });

    if (isMenuOpen) {
      setIsMenuOpen(false);
      requestAnimationFrame(doScroll);
    } else {
      doScroll();
    }
  };

  return (
    <>
      <header ref={headerRef} className={styles.header} data-site-header="true">
        <div className={styles.headerInner}>
          <div className={styles.headerContent}>
            
            {/* Left side: the new AE logo */}
            <div className={styles.brand}>
              <span className={styles.brandText}>
                AE<span className={styles.brandDot}>.</span>
              </span>
            </div>

            {/* The clean unified full-width menu */}
            <nav
              id="main-navigation"
              className={isMenuOpen ? `${styles.navbar} ${styles.active}` : styles.navbar}
              aria-label="Main navigation"
            >
              {Object.entries(sectionIcons).map(([section, icon]) => (
                <a
                  key={section}
                  href={`#${section}`}
                  className={activeSection === section ? styles.active : undefined}
                  onClick={(e) => handleNavClick(section, e)}
                  aria-current={activeSection === section ? "page" : undefined}
                >
                  <Icon name={icon} />
                  {getShortLabel(section)}
                </a>
              ))}

              {/* The blog button */}
              <Link
                href="/blog"
                className={isBlog ? styles.active : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {/* A book/article icon suited to the blog */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                BLOG
              </Link>
            </nav>

            {/* Menu button, mobile only */}
            <button
              type="button"
              className={isMenuOpen ? `${styles.menuIcon} ${styles.active}` : styles.menuIcon}
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
              aria-controls="main-navigation"
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>

          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      <button
        type="button"
        className={isMenuOpen ? `${styles.backdrop} ${styles.backdropActive}` : styles.backdrop}
        aria-label="Close navigation menu"
        onClick={() => setIsMenuOpen(false)}
        tabIndex={isMenuOpen ? 0 : -1}
      />
    </>
  );
}