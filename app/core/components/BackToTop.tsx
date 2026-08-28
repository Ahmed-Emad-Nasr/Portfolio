"use client";

/*
 * BackToTop.tsx
 * Author: Ahmed Emad Nasr
 *
 * زرار الرجوع لفوق. بيظهر بعد ما تعدّي ٨٠٪ من ارتفاع الشاشة — يعني مش
 * بيزاحم الـ hero وإنت لسه فوق.
 *
 * زي باقي حاجات الـ scroll في المشروع: صفر re-render. الإظهار والإخفاء
 * بيتم بـ classList.toggle جوه rAF، مش بـ useState.
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
    // Lenis بيلفّ window.scrollTo لما يكون root، فالحركة بتطلع smooth لوحدها.
    // لو المستخدم طالب تقليل الحركة بنقفز على طول.
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
