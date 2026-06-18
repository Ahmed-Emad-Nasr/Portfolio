"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHeader } from "@/app/core/hooks/useHeader";

import styles from "./sensei-header.module.css";

const BLOG_PATH = "/blog";

const ShieldIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 1L14 4V9C14 12.3 11.3 14.9 8 16C4.7 14.9 2 12.3 2 9V4L8 1Z" />
  </svg>
);

const SiemIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className={styles.siemIcon}>
    <rect x="1" y="1" width="6" height="6" rx="1.5" />
    <rect x="9" y="1" width="6" height="6" rx="1.5" />
    <rect x="1" y="9" width="6" height="6" rx="1.5" />
    <path d="M9 12h6M12 9v6" strokeLinecap="round" />
  </svg>
);

export default function SenseiHeader() {
  const pathname  = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  const { isMenuOpen, activeSection, toggleMenu, sectionIcons, setActiveSection, setIsMenuOpen } = useHeader();

  const isBlog = pathname === BLOG_PATH || pathname.startsWith(`${BLOG_PATH}/`);

  // ── Scroll → CSS class, zero re-renders ──────────────────────────────────
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

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth > 994) { document.body.style.overflow = ""; return; }
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen, setIsMenuOpen]);

  // ── Nav click ─────────────────────────────────────────────────────────────
  const handleNavClick = (section: string, e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActiveSection(section);
    const target = document.getElementById(section);
    if (!target) return;
    const doScroll = () => {
      const headerH = headerRef.current?.offsetHeight ?? 0;
      const topGap  = parseFloat(getComputedStyle(headerRef.current!).top) || 0;
      window.scrollTo({
        top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerH - topGap - 10),
        behavior: "auto",
      });
    };
    if (isMenuOpen) { setIsMenuOpen(false); requestAnimationFrame(doScroll); }
    else doScroll();
  };

  return (
    <>
      <header ref={headerRef} className={styles.header} data-site-header="true">
        <span className={styles.headerScan} aria-hidden="true" />

        {/* ── Top row ─────────────────────────────────────────────────── */}
        <div className={styles.topRow}>
          {/* Brand */}
          <div className={styles.brand} aria-hidden="true">
            <div className={styles.brandIcon}><ShieldIcon /></div>
            <span className={styles.brandText}>
              AHMED<span className={styles.brandAccent}>.SEC</span>
            </span>

            {/* Arabic name chip */}
            <div className={styles.arabicName}>
              <SiemIcon />
              <span className={styles.arabicText}>أحمد عماد</span>
            </div>
          </div>

          {/* Nav */}
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
                <FontAwesomeIcon icon={icon} aria-hidden="true" />
                {section.replace(/([a-z])([A-Z])/g, "$1 $2")}
              </a>
            ))}
          </nav>

          {/* Right cluster */}
          <div className={styles.rightCluster}>
            <span className={styles.threatChip} aria-hidden="true">
              <span className={styles.threatDot} />
              THREAT:LOW
            </span>

            <span className={styles.statusChip} aria-hidden="true">
              <span className={styles.statusDot} />
              ONLINE
            </span>

            <Link
              href={BLOG_PATH}
              className={isBlog ? `${styles.blogLink} ${styles.active}` : styles.blogLink}
              aria-label="Open blog"
              aria-current={isBlog ? "page" : undefined}
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>

            <button
              type="button"
              className={isMenuOpen ? `${styles.menuIcon} ${styles.active}` : styles.menuIcon}
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-controls="main-navigation"
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>

      </header>

      {/* Backdrop */}
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