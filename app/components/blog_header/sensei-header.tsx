"use client";

/*
 * File: sensei-header.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render sticky navigation header (Cybersecurity HUD Theme)
 */

import { memo, useCallback, useEffect, useState } from "react";
import styles from "./sensei-header.module.css";

const NAV_ITEMS = [
  { label: "Home", targetId: null },
  { label: "Cases", targetId: "blog-pdfs-title" },
  { label: "Projects", targetId: "Projects" },
  { label: "YouTube Hub", targetId: "youtube-hub-title" },
] as const;

const SenseiHeader = memo(function SenseiHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollToSection = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const headerElement = document.querySelector<HTMLElement>("[data-site-header='true']");
    const headerRect = headerElement?.getBoundingClientRect();
    const computedTop = headerElement
      ? Number.parseFloat(window.getComputedStyle(headerElement).top || "0")
      : 0;
    const headerHeight = headerRect?.height ?? 0;
    const offset = headerHeight + (Number.isFinite(computedTop) ? computedTop : 0) + 10;
    const targetTop = window.scrollY + target.getBoundingClientRect().top - offset;

    window.scrollTo({ top: Math.max(0, targetTop), behavior: "auto" });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={isScrolled ? `${styles.header} ${styles.scrolled}` : styles.header}
      data-site-header="true"
    >
      <span className={styles.brand} aria-label="Ahmed Emad Nasr Blog">
        Ahmed Emad Nasr Blog
      </span>

      <nav className={styles.nav} aria-label="Blog navigation">
        {NAV_ITEMS.map((item) =>
          item.targetId ? (
            <a
              key={item.label}
              href={`#${item.targetId}`}
              className={styles.navLink}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(item.targetId);
              }}
            >
              {item.label}
            </a>
          ) : (
            <button
              key={item.label}
              type="button"
              className={styles.navLink}
              onClick={scrollToTop}
            >
              {item.label}
            </button>
          )
        )}
      </nav>
    </header>
  );
});

export default SenseiHeader;