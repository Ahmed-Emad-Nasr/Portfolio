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

  const scrollToTop = () => {
    // Lenis wraps window.scrollTo when it runs in root mode, so the motion
// comes out smooth on its own.
    // If the user asked for reduced motion we jump straight there.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      ref={btnRef}
      type="button"
      className={styles.button}
      onClick={scrollToTop}
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
