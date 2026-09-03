/*
 * core/utils/scroll.ts
 *
 * ═══ ليه الملف ده موجود ═══
 *
 * الموقع فيه ٦ أماكن بتنادي `window.scrollTo` بنفسها:
 *
 *   header/sensei-header.tsx        behavior: "auto"    ← قفزة صريحة
 *   blog_header/sensei-header.tsx   behavior: "auto"    ← قفزة صريحة
 *   CommandPalette.tsx (×2)         behavior: "smooth"
 *   CommandPaletteMount.tsx (×2)    behavior: "smooth"
 *   BackToTop.tsx                   behavior: "smooth"
 *
 * دول **بيشتغلوا** — Lenis مبيكسرهمش. راجعت مصدر lenis@1.3.23:
 * `onNativeScroll` بيلاقي إن `isScrolling` مش شغّال بحركة منه، فبيزامن
 * حالته الداخلية مع الموضع الحقيقي (`animatedScroll = targetScroll =
 * actualScroll`) ويعلّم نفسه `isScrolling = "native"`. يعني بيمشي ورا
 * المتصفح بدل ما يحاربه.
 *
 * (وملف lenis.css في الإصدار ده **مفيهوش** `scroll-behavior: auto
 * !important` — القاعدة دي كانت في إصدارات أقدم. لو قريت الكلام ده في
 * حتة تانية، اتأكد من إصدارك الأول.)
 *
 * ═══ فالمشكلة الحقيقية إيه ═══
 *
 * مش إنهم بيقعوا. المشكلة إن الموقع فيه **حركتين مختلفتين**:
 *
 *   العجلة   →  Lenis, lerp 0.045     — بطيئة، بتستقرّ في ~ثانية
 *   الأزرار  →  smooth بتاع المتصفح   — منحنى ثابت، ~٣٠٠ms، مش قابل
 *                                        للتعديل خالص
 *   النav    →  قفزة فورية
 *
 * فالصفحة بتنزل على مهلها تحت إيدك، وبعدين تضغط زرار فتـ"طقّ". تلات
 * إحساسات مختلفة في موقع واحد.
 *
 * ومفيش طريقة تظبط بيها الحركة الأصلية بتاعة المتصفح — مفيش duration ولا
 * easing في مواصفات `scrollTo`. الطريقة الوحيدة للتحكم إنك تعدّي من
 * محرّك واحد.
 *
 * الملف ده هو المصدر الواحد. أي حاجة عايزة تحرّك الصفحة بتعدّي من هنا،
 * وهو بيقرر: Lenis لو موجود، وإلا الحركة الأصلية بتاعة المتصفح.
 */

import type Lenis from "lenis";

/* الـ instance بيتسجّل من LenisGsapBridge جوه <ReactLenis>. بيفضل null
   على السيرفر، وعلى الأجهزة الضعيفة (tier="low" مبيركّبش Lenis أصلاً) —
   وفي الحالتين الدوال تحت بترجع للسلوك الأصلي. */
let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null): void {
  lenis = instance;
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * ارتفاع الهيدر الثابت + مساحة تنفّس.
 *
 * الهيدر `position: fixed`، فأي هدف بيتزحلق ليه لازم يطرح ارتفاعه وإلا
 * العنوان بيتخبّى تحته. الرقم بيتقرا من الـ DOM مش ثابت مكتوب، لأن
 * الارتفاع بيتغيّر مع --ui-scale ومع الـ breakpoints.
 */
export function getHeaderOffset(): number {
  if (typeof document === "undefined") return 0;
  const header = document.querySelector<HTMLElement>("[data-site-header='true']");
  return (header?.offsetHeight ?? 0) + 15;
}

type ScrollOpts = {
  /** ثواني. بيتتجاهل لو المستخدم طالب تقليل الحركة. */
  duration?: number;
  offset?: number;
  /** يقفز على طول من غير أي حركة. */
  immediate?: boolean;
};

/*
 * منحنى التنعيم الافتراضي — expo-out.
 *
 * بيبدأ سريع وبيقف بهدوء شديد. ده المهم هنا: النهاية البطيئة هي اللي
 * بتدّي إحساس إن الصفحة "بتستقرّ" مش بتفرمل، وبتدّي الصور اللي تحت
 * الطية وقت تخلص تحميل قبل ما تبقى في منتصف الشاشة.
 */
export const EASE_OUT_EXPO = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** المدة الافتراضية لأي قفزة برمجية (زرار، اختصار، لينك في النav). */
export const SCROLL_DURATION = 1.6;

/** حرّك الصفحة لإحداثي رأسي معيّن. */
export function scrollToY(top: number, opts: ScrollOpts = {}): void {
  if (typeof window === "undefined") return;

  const immediate = opts.immediate || prefersReducedMotion();
  const target = Math.max(0, top);

  if (lenis) {
    lenis.scrollTo(target, {
      immediate,
      duration: opts.duration ?? SCROLL_DURATION,
      easing: EASE_OUT_EXPO,
      offset: opts.offset ?? 0,
      /* لو المستخدم لمس العجلة في النص، سيبه — القفزة البرمجية مش أهم من
         نيّته. من غير ده الصفحة بتحارب صباعه. */
      lock: false,
    });
    return;
  }

  /* مفيش Lenis: الجهاز ضعيف أو الـ tier منع تركيبه. الحركة الأصلية بتاعة
     المتصفح هي الصح هنا — بتشتغل على الـ compositor، يعني أرخص من أي
     حاجة نكتبها بجافاسكريبت. مفيش تحكم في مدتها، بس على جهاز ضعيف ده
     مش عيب — ده المطلوب. */
  window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
}

/** حرّك الصفحة لعنصر، مع مراعاة الهيدر الثابت. */
export function scrollToElement(el: Element | null, opts: ScrollOpts = {}): void {
  if (!el || typeof window === "undefined") return;
  const top = window.scrollY + el.getBoundingClientRect().top - getHeaderOffset();
  scrollToY(top, opts);
}

/** حرّك الصفحة لأول الصفحة. */
export function scrollToTop(opts: ScrollOpts = {}): void {
  scrollToY(0, opts);
}

/**
 * هل الـ focus دلوقتي في حاجة بتكتب فيها؟
 *
 * أي اختصار كيبورد لازم يعدّي من هنا الأول. من غيره سهم لتحت جوه خانة
 * بحث بيحرّك الصفحة بدل ما يحرّك المؤشر — وده بيكسر الخانة تماماً.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * هل العنصر ده (أو أي أب ليه) بيسكرول جوّه نفسه؟
 *
 * الترمينال والـ command palette ومودال المعرض كلهم عندهم مناطق بتسكرول
 * لوحدها (`overflow-y: auto` + `overscroll-behavior: contain`). لو
 * اختصارات الكيبورد خطفت السهم جوّاهم، القوايم دي مش هتسكرول خالص
 * والصفحة اللي وراها هي اللي هتتحرّك.
 */
export function isInScrollableRegion(target: EventTarget | null): boolean {
  let node = target instanceof HTMLElement ? target : null;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    const scrollable = /(auto|scroll|overlay)/.test(
      style.overflowY + style.overflow,
    );
    if (scrollable && node.scrollHeight > node.clientHeight + 1) return true;
    node = node.parentElement;
  }
  return false;
}
