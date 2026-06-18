"use client";
import { useEffect, useRef, useState } from "react";

export type ScrollSpySection = {
  label: string;
  elementId: string;
};

type UseScrollSpyOptions = {
  sections: readonly ScrollSpySection[];
  defaultSection: string;
  storageKey: string;
};

export function useScrollSpy({ sections, defaultSection, storageKey }: UseScrollSpyOptions) {
  const [activeSection, setActiveSection] = useState(defaultSection);

  // تجميع كل الـ Props في Ref واحد لتنظيف الكود وتجنب الـ Re-renders
  const config = useRef({ sections, defaultSection, storageKey });
  config.current = { sections, defaultSection, storageKey };

  useEffect(() => {
    const { sections, storageKey, defaultSection } = config.current;

    // 1. قراءة الكاش عند التحميل
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && sections.some((s) => s.label === saved)) {
        setActiveSection(saved);
      }
    } catch {}

    let cachedPositions: { label: string; absoluteTop: number }[] = [];
    let markerOffset = 0;
    let lastActive = defaultSection;
    let ticking = false; // للتحكم في الـ requestAnimationFrame

    // 2. هذه الدالة تحسب أماكن العناصر مرة واحدة فقط لتجنب الـ Layout Thrashing
    const calculateGeometry = () => {
      const isMobile = window.innerWidth <= 994;
      const headerElement = document.querySelector<HTMLElement>("[data-site-header='true']");
      
      let headerHeight = isMobile ? 64 : 76;
      let headerTop = 0;

      if (headerElement) {
        headerHeight = headerElement.offsetHeight || headerHeight; // أسرع من getBoundingClientRect
        headerTop = Number.parseFloat(window.getComputedStyle(headerElement).top || "0") || 0;
      }

      markerOffset = Math.max(72, Math.round(headerTop + headerHeight + (isMobile ? 8 : 12)));

      // حفظ المكان المطلق (Absolute) لكل قسم في الصفحة
      cachedPositions = config.current.sections.map((section) => {
        const el = document.getElementById(section.elementId);
        // (مكان العنصر بالنسبة للشاشة + مقدار النزول الكلي) = المكان المطلق
        const absoluteTop = el ? el.getBoundingClientRect().top + window.scrollY : 0;
        return { label: section.label, absoluteTop };
      });
    };

    // 3. دالة الـ Scroll: الآن تقوم بعمليات حسابية في الذاكرة فقط، بدون استدعاء الـ DOM
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // window.scrollY لا يسبب Reflow، مما يجعله فائق السرعة
          const currentTargetPosition = window.scrollY + markerOffset;
          
          let current = config.current.defaultSection;
          let smallestDistance = Number.POSITIVE_INFINITY;

          // عملية بحث رياضية بسيطة جداً
          for (let i = 0; i < cachedPositions.length; i++) {
            const distance = Math.abs(cachedPositions[i].absoluteTop - currentTargetPosition);
            if (distance < smallestDistance) {
              smallestDistance = distance;
              current = cachedPositions[i].label;
            }
          }

          if (current !== lastActive) {
            lastActive = current;
            setActiveSection(current);
            
            // كتابة الكاش في الخلفية بدون توقيف الـ Main Thread
            setTimeout(() => {
              try { localStorage.setItem(config.current.storageKey, current); } catch {}
            }, 0);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // الحساب المبدئي وتفعيل الحالة الأولى
    calculateGeometry();
    handleScroll();

    // إضافة المستمعين للأحداث
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", calculateGeometry, { passive: true }); // نعيد الحساب فقط عند تغيير حجم الشاشة

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculateGeometry);
    };
  }, []); // [] تعني أن الـ Effect يعمل مرة واحدة فقط

  return { activeSection, setActiveSection };
}