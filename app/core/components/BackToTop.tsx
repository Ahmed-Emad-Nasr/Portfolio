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
   * التعليق اللي كان هنا بيقول إن "Lenis بيلفّ window.scrollTo" — وده
   * مش صح، Lenis مبيعملش patch للدالة دي. اللي بيحصل إنه بيزامن حالته
   * مع الحركة الأصلية، فالزرار كان **شغّال** — بس بمنحنى المتصفح
   * (~٣٠٠ms ثابتة) مش بحركة الموقع، فكان بيحسّ مقطوع عن باقي الصفحة.
   *
   * scrollToTop في core/utils/scroll بيعدّي من نفس محرّك العجلة، وبيراعي
   * prefers-reduced-motion جوّه.
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
