"use client";

/*
 * ScrollProgress.tsx
 * Author: Ahmed Emad Nasr
 *
 * شريط تقدّم القراءة — بيقعد فوق الخط الأحمر بتاع الهيدر بالظبط
 * (نفس الـ 2px) فمش بيزوّد أي مساحة في الـ layout.
 *
 * قرارات مقصودة عشان الأداء:
 * 1. صفر re-render. الحساب بيتكتب على الـ DOM مباشرة عن طريق ref،
 *    زي ما الهيدر عامل بالظبط مع classList.toggle. مفيش useState هنا.
 * 2. rAF throttle للـ scroll listener + passive، فالـ scroll thread
 *    مبيتقفلش.
 * 3. transform: scaleX() بس — مفيش width animation يسبب layout/paint
 *    في كل فريم. الـ compositor بيعملها لوحده.
 * 4. ResizeObserver على الـ body، لأن الأقسام الـ dynamic
 *    (Experience / Projects / ArtGallery) بتزوّد ارتفاع الصفحة بعد الـ
 *    hydration، وبدونه النسبة بتفضل غلط لحد أول scroll.
 *
 * شغّال مع Lenis من غير أي wiring: الـ root mode بيعمل scroll حقيقي على
 * الـ window، فالـ scroll event بيتبعت عادي.
 */

import { useEffect, useRef } from "react";
import styles from "./ScrollProgress.module.css";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let raf = 0;
    let last = -1;

    const measure = () => {
      raf = 0;

      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;

      // تقريب لـ 3 خانات: بيمنع كتابة على الـ DOM من غير تغيير مرئي
      const value = Math.round(Math.min(1, Math.max(0, ratio)) * 1000) / 1000;
      if (value === last) return;
      last = value;

      bar.style.transform = `scaleX(${value})`;
      // بيختفي وإحنا فوق خالص عشان الخط الأحمر بتاع الهيدر يفضل نضيف
      bar.style.opacity = value > 0.002 ? "1" : "0";
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // aria-hidden عن قصد: العنصر ده زخرفي بحت، والـ screen reader عنده
  // معلومة الموضع أصلاً. تحديث aria-valuenow كل فريم = spam مش أكتر.
  return (
    <div className={styles.track} aria-hidden="true">
      <div ref={barRef} className={styles.bar} />
    </div>
  );
}
