"use client";

/*
 * ScrollProgress.tsx
 * Author: Ahmed Emad Nasr
 *
 * شريط تقدّم مقسّم على أقسام الصفحة — قاعد فوق الخط الأحمر بتاع الهيدر
 * بالظبط (نفس الـ 2px) فمش بيزوّد أي مساحة في الـ layout.
 *
 * ليه مقسّم؟ الشريط المتصل بيقول "إنت فين في الصفحة" بس. المقسّم بيقول كمان
 * "إنت في أنهي قسم وفاضلك قد إيه فيه" — وعرض كل جزء متناسب مع طول القسم
 * الحقيقي، فالشكل نفسه بيوصّل معلومة عن بنية الصفحة.
 *
 * قرارات مقصودة عشان الأداء:
 * 1. صفر re-render أثناء الـ scroll. كل الحسابات بتتكتب على الـ DOM مباشرة
 *    عن طريق refs، زي ما الهيدر عامل بالظبط مع classList.toggle.
 * 2. rAF throttle + passive listener، فالـ scroll thread مبيتقفلش.
 * 3. transform: scaleX() بس — مفيش width animation يسبّب layout/paint كل فريم.
 * 4. ResizeObserver على الـ body: الأقسام الـ dynamic بتزوّد ارتفاع الصفحة
 *    بعد الـ hydration، ومن غيره النِسب بتفضل غلط لحد أول scroll.
 * 5. لو أي قسم مش موجود في الـ DOM، بيتوزّع التقسيم بالتساوي بدل ما يقع.
 *
 * شغّال مع Lenis من غير أي wiring: الـ root mode بيعمل scroll حقيقي على الـ
 * window، فالـ scroll event بيتبعت عادي.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./ScrollProgress.module.css";

// نفس الـ IDs المستخدمة في الـ scroll spy — مصدر واحد للحقيقة
const PORTFOLIO_SECTIONS = ["Home", "Experience", "Projects", "Certifications"] as const;
const BLOG_SECTIONS = ["blog-pdfs-title", "youtube-hub-title"] as const;
// صفحة الـ case مفيهاش أقسام — شريط واحد متصل على طول الصفحة.
// (أول جزء دايماً بيبدأ من 0 وآخر جزء بينتهي عند آخر الصفحة، فجزء واحد
//  معناه بالظبط شريط تقدّم عادي.)
const CASE_SECTIONS = ["case-body"] as const;

/** مسافة أمان فوق القسم عشان الجزء يخلص قبل ما القسم يختفي تحت الهيدر */
const HEADER_OFFSET = 80;

export default function ScrollProgress() {
  const pathname = usePathname();

  // المصفوفتين ثوابت على مستوى الموديول، فالمرجع ثابت والـ effect مبيعيدش
  // نفسه كل render.
  const ids = pathname.startsWith("/blog/")
    ? CASE_SECTIONS
    : pathname.startsWith("/blog")
      ? BLOG_SECTIONS
      : PORTFOLIO_SECTIONS;

  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const segs = segRefs.current;
    const fills = fillRefs.current;
    if (!fills.length) return;

    let raf = 0;
    let ranges: { start: number; end: number }[] = [];
    const lastValues = new Array<number>(fills.length).fill(-1);

    const measure = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);

      const starts = ids.map((id, i) => {
        // أول جزء لازم يبدأ من فوق خالص، مش من مكان قسم Home
        if (i === 0) return 0;
        const el = document.getElementById(id);
        if (!el) return (maxScroll / ids.length) * i; // fallback: توزيع متساوي
        const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        return Math.min(maxScroll, Math.max(0, top));
      });

      ranges = starts.map((start, i) => ({
        start,
        end: i === starts.length - 1 ? maxScroll : Math.max(start + 1, starts[i + 1]),
      }));

      // عرض كل جزء متناسب مع طول القسم الفعلي
      for (let i = 0; i < ranges.length; i++) {
        const seg = segs[i];
        if (!seg) continue;
        seg.style.flexGrow = String(Math.max(0.06, (ranges[i].end - ranges[i].start) / maxScroll));
      }
    };

    const paint = () => {
      raf = 0;
      const y = window.scrollY;

      for (let i = 0; i < ranges.length; i++) {
        const { start, end } = ranges[i];
        const ratio = (y - start) / (end - start);
        const value = Math.round(Math.min(1, Math.max(0, ratio)) * 1000) / 1000;

        if (value === lastValues[i]) continue;
        lastValues[i] = value;

        const fill = fills[i];
        const seg = segs[i];
        if (!fill || !seg) continue;

        fill.style.transform = `scaleX(${value})`;
        seg.dataset.state = value >= 1 ? "done" : value > 0 ? "active" : "idle";
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    const remeasure = () => {
      measure();
      paint();
    };

    remeasure();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure, { passive: true });

    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ids]);

  // aria-hidden عن قصد: العنصر زخرفي بحت، والـ screen reader عنده معلومة
  // الموضع أصلاً. تحديث aria-valuenow كل فريم = spam مش أكتر.
  return (
    <div className={styles.track} aria-hidden="true">
      {ids.map((id, i) => (
        <span
          key={id}
          data-state="idle"
          className={styles.segment}
          ref={(el) => {
            segRefs.current[i] = el;
          }}
        >
          <span
            className={styles.fill}
            ref={(el) => {
              fillRefs.current[i] = el;
            }}
          />
        </span>
      ))}
    </div>
  );
}
