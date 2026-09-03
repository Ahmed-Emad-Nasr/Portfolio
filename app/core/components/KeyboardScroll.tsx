"use client";

/*
 * core/components/KeyboardScroll.tsx
 *
 * ═══ المشكلة ═══
 *
 * Lenis بيمسك عجلة الماوس واللمس. الكيبورد **لأ** — مفيش أي تعامل معاه
 * لا في Lenis ولا في الموقع.
 *
 * فاللي بيتصفّح بالكيبورد بياخد الحركة الأصلية بتاعة المتصفح: السهم
 * بيحرّك ~٤٠ بكسل فوراً من غير أي تنعيم، وPage Down بيقفّز شاشة كاملة
 * دفعة واحدة. وده جنب حركة العجلة اللي بتستقرّ في ثانية، بيبان كأنه موقع
 * تاني خالص.
 *
 * وده مش عدد صغير من الناس: مستخدمي قارئات الشاشة، وأي حد عنده صعوبة في
 * استخدام الماوس، وكمان أي حد بيقرا حاجة طويلة وسايب إيده على الكيبورد.
 *
 * ═══ الحل ═══
 *
 * الكومبوننت ده بيمسك مفاتيح التنقّل ويحوّلها لنفس حركة Lenis اللي
 * العجلة بتاخدها.
 *
 * ═══ اللي **مش** بياخده — وده أهم من اللي بياخده ═══
 *
 * خطف مفاتيح الكيبورد أسرع طريقة لكسر موقع، وأسرع طريقة لكسر إتاحته.
 * الحواجز:
 *
 *  1. أي modifier (Ctrl / Cmd / Alt) → سيبه. ده بيسيب Ctrl+Home وأوامر
 *     المتصفح والاختصارات المساعدة شغّالة زي ما هي.
 *  2. الـ focus في input / textarea / select / contenteditable → سيبه.
 *  3. الـ focus جوه منطقة بتسكرول لوحدها (الترمينال، الـ palette، مودال
 *     المعرض) → سيبه، عشان القوايم دي تفضل تسكرول.
 *  4. **Space** لما الـ focus على زرار أو لينك أو summary → سيبه. Space
 *     هو مفتاح التفعيل القياسي؛ خطفه بيخلي نص أزرار الموقع متشتغلش
 *     بالكيبورد. ده أخطر واحد في القايمة.
 *  5. المستخدم طالب تقليل الحركة → المفاتيح شغّالة بس بقفزة فورية.
 *
 * وفي كل الحالات دي إحنا **مبنعملش** preventDefault، فالمتصفح بيعمل
 * سلوكه الأصلي. الكومبوننت بينسحب، مش بيعطّل.
 */

import { useEffect } from "react";
import {
  getLenis,
  isInScrollableRegion,
  isTypingTarget,
  prefersReducedMotion,
  scrollToY,
} from "@/app/core/utils/scroll";

/* الأسهم بتاخد خطوة صغيرة، Page Up/Down بتاخد شاشة ناقص حتة عشان يفضل
   سطر أو اتنين مشتركين بين الشاشتين — ده اللي بيخلي القارئ ميضيعش مكانه. */
const ARROW_STEP = 120;
const PAGE_OVERLAP = 0.85;

/* مدة أقصر من القفزات البرمجية: الأسهم بتتضغط ورا بعض بسرعة، ولو كل واحدة
   أخدت ١٫٦ ثانية الحركة هتتراكم وتحسّ إنها بتتأخّر عنك. */
const KEY_DURATION = 0.7;

export default function KeyboardScroll() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (isInScrollableRegion(e.target)) return;

      /* لو فيه <dialog> أو أي overlay ماسك الشاشة، مش شغلنا. */
      if (document.querySelector("dialog[open]")) return;

      const viewport = window.innerHeight;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const current = getLenis()?.scroll ?? window.scrollY;

      let target: number | null = null;

      switch (e.key) {
        case "ArrowDown":
          target = current + ARROW_STEP;
          break;
        case "ArrowUp":
          target = current - ARROW_STEP;
          break;
        case "PageDown":
          target = current + viewport * PAGE_OVERLAP;
          break;
        case "PageUp":
          target = current - viewport * PAGE_OVERLAP;
          break;
        case "Home":
          target = 0;
          break;
        case "End":
          target = max;
          break;
        case " ":
        case "Spacebar": {
          /* الحاجز رقم ٤. لو الـ focus على حاجة بتتفعّل بالـ Space، ده
             تفعيل مش سكرول — نسيبه للمتصفح. */
          const el = document.activeElement;
          if (
            el instanceof HTMLElement &&
            el.closest("a[href], button, [role='button'], summary, input, [tabindex]")
          ) {
            return;
          }
          target = current + viewport * PAGE_OVERLAP * (e.shiftKey ? -1 : 1);
          break;
        }
        default:
          return;
      }

      if (target === null) return;

      /* لو إحنا فعلاً في آخر/أول الصفحة، مانمنعش السلوك الأصلي — سيب
         المتصفح يعمل الـ overscroll bounce بتاعه. */
      const clamped = Math.min(max, Math.max(0, target));
      if (Math.abs(clamped - current) < 1) return;

      e.preventDefault();
      scrollToY(clamped, {
        duration: KEY_DURATION,
        immediate: prefersReducedMotion(),
      });
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
