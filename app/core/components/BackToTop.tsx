"use client";

/*
 * BackToTop.tsx
 * Author: Ahmed Emad Nasr
 *
 * The back-to-top button. It appears once you are past 80% of the viewport
 * height, so it does not crowd the hero while you are still at the top.
 *
 * Like everything else scroll-related in this project: zero re-renders.
 * Showing and hiding happens through classList.toggle inside rAF, not
 * useState.
 */

import { useEffect, useRef } from "react";
import { scrollToTop } from "@/app/core/utils/scroll";
import styles from "./BackToTop.module.css";

export default function BackToTop() {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      raf = 0;
      btnRef.current?.classList.toggle(
        styles.visible,
        window.scrollY > window.innerHeight * 0.8,
      );
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /*
   * The comment that used to be here said "Lenis wraps window.scrollTo" — which
   * isn't true, Lenis doesn't patch that function. What happens is that it syncs its state
   * with the native motion, so the button **worked** — but with the browser's curve
   * (a fixed ~300ms), not the site's motion, so it felt disconnected from the rest of the page.
   *
   * scrollToTop in core/utils/scroll goes through the same engine as the wheel, and respects
   * prefers-reduced-motion internally.
   */
  const handleClick = () => scrollToTop();

  return (
    <button
      ref={btnRef}
      type="button"
      className={styles.button}
      onClick={handleClick}
      aria-label="Back to top"
    >
      <span aria-hidden="true" className={styles.arrow}>
        ↑
      </span>
      <span aria-hidden="true" className={styles.label}>
        TOP
      </span>
    </button>
  );
}
