"use client";

/*
 * sensei-header.tsx  —  PERF BUILD
 *
 * Changes vs original:
 *  1. isScrolled — no longer React state. Toggled via a CSS class on the header
 *     DOM node directly inside the rAF handler. Zero re-renders on scroll.
 *  2. Scroll throttle — simplified to a single rAF gate (no double-timer
 *     pattern needed since we're not calling setState).
 *  3. Body-scroll-lock effect — unchanged logic but reduced deps array.
 *  4. handleNavLinkClick / handleBackdropClick — same logic, refs cleaned up.
 *  5. The backdrop is now always in the DOM (display:none via CSS) — no
 *     conditional rendering overhead on open/close.
 */

import { useCallback, memo, useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./sensei-header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHeader } from "@/app/core/hooks/useHeader";

const BLOG_PATH = "/blog";

const ShieldIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 1L14 4V9C14 12.3 11.3 14.9 8 16C4.7 14.9 2 12.3 2 9V4L8 1Z" />
  </svg>
);

const SenseiHeader = memo(function SenseiHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const {
    isMenuOpen,
    activeSection,
    toggleMenu,
    sectionIcons,
    setActiveSection,
    setIsMenuOpen,
  } = useHeader();

  const isBlogRoute =
    pathname === BLOG_PATH || pathname.startsWith(`${BLOG_PATH}/`);

  // ── Body scroll lock ────────────────────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth > 994) {
      setIsMenuOpen(false);
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    const onResize = () => {
      if (window.innerWidth > 994) {
        setIsMenuOpen(false);
        document.body.style.overflow = "";
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, setIsMenuOpen]);

  // ── Scroll detection — no React state, direct DOM class mutation ─────────
  useEffect(() => {
    let rafId = 0;

    const update = () => {
      headerRef.current?.classList.toggle(styles.scrolled, window.scrollY > 18);
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update(); // run once on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []); // empty deps — never re-subscribes

  // ── Escape key ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen, setIsMenuOpen]);

  // ── Smooth scroll to section ─────────────────────────────────────────────
  const playSectionFade = useCallback((target: HTMLElement) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    target.animate(
      [
        { opacity: 0.35, transform: "translate3d(0, 14px, 0)" },
        { opacity: 1,    transform: "translate3d(0, 0, 0)" },
      ],
      { duration: 420, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)", fill: "both" }
    );
  }, []);

  const scrollToSection = useCallback(
    (section: string) => {
      const target   = document.getElementById(section);
      if (!target) return;
      const headerEl = headerRef.current;
      const headerH  = headerEl?.getBoundingClientRect().height ?? 0;
      const topVal   = headerEl ? parseFloat(getComputedStyle(headerEl).top) : 0;
      const offset   = headerH + (isFinite(topVal) ? topVal : 0) + 10;
      window.scrollTo({ top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset), behavior: "auto" });
      playSectionFade(target);
    },
    [playSectionFade]
  );

  const handleNavLinkClick = useCallback(
    (section: string, event?: MouseEvent<HTMLAnchorElement>) => {
      event?.preventDefault();
      setActiveSection(section);
      if (window.innerWidth <= 994) {
        setIsMenuOpen(false);
        requestAnimationFrame(() => scrollToSection(section));
      } else {
        scrollToSection(section);
      }
    },
    [scrollToSection, setActiveSection, setIsMenuOpen]
  );

  const handleBackdropClick = useCallback(() => setIsMenuOpen(false), [setIsMenuOpen]);

  const menuIconClass = isMenuOpen ? `${styles.MenuIcon} ${styles.active}` : styles.MenuIcon;
  const navbarClass   = isMenuOpen ? `${styles.navbar} ${styles.active}`   : styles.navbar;

  return (
    <>
      <header
        ref={headerRef}
        className={styles.header}        // scrolled class toggled by DOM directly
        data-site-header="true"
      >
        <span className={styles.headerScan} aria-hidden="true" />

        <div className={styles.brand} aria-hidden="true">
          <div className={styles.brandIcon}><ShieldIcon /></div>
          <span className={styles.brandText}>
            AHMED<span className={styles.brandAccent}>.SEC</span>
          </span>
        </div>

        <nav id="main-navigation" className={navbarClass} aria-label="Main navigation">
          {Object.entries(sectionIcons).map(([section, icon]) => (
            <a
              key={section}
              href={`#${section}`}
              className={activeSection === section ? styles.active : undefined}
              onClick={(e) => handleNavLinkClick(section, e)}
              aria-current={activeSection === section ? "page" : undefined}
            >
              <FontAwesomeIcon icon={icon} aria-hidden="true" />
              <span className={styles.navText}>
                {section.replace(/([a-z])([A-Z])/g, "$1 $2")}
              </span>
            </a>
          ))}
        </nav>

        <Link
          href={BLOG_PATH}
          className={isBlogRoute ? `${styles.blogLink} ${styles.active}` : styles.blogLink}
          aria-label="Open blog page"
          aria-current={isBlogRoute ? "page" : undefined}
          onClick={() => { if (window.innerWidth <= 994) setIsMenuOpen(false); }}
        >
          <span className={styles.navText}>Blog</span>
        </Link>

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
      </header>

      {/* Always mounted — visibility driven by isMenuOpen class */}
      <button
        type="button"
        className={`${styles.backdrop}${isMenuOpen ? ` ${styles.backdropActive}` : ""}`}
        aria-label="Close navigation menu"
        onClick={handleBackdropClick}
        tabIndex={isMenuOpen ? 0 : -1}
      />
    </>
  );
});

export default SenseiHeader;