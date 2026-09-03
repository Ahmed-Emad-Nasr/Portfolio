"use client";

/*
 * smooth-scroll.tsx — FIXED
 *
 * Three bugs in the previous version:
 *
 * 1. `useLenis()` was called in the SAME component that renders <ReactLenis>.
 *    The context provider lives inside the returned JSX, so the parent can
 *    never read it — `lenis` was always null and the entire useEffect body
 *    never ran. GSAP/ScrollTrigger were bundled (~70 KB) and did nothing.
 *    Fix: the hook now lives in a CHILD of the provider.
 *
 * 2. `gsap.ticker.add(...)` was never removed on cleanup (only `lenis.off`
 *    was). With reactStrictMode: true the effect runs twice in dev, so raf
 *    callbacks stacked up. Fix: keep the callback reference and remove it.
 *
 * 3. Lenis ran at full strength on every device. Smooth-scroll hijacking is
 *    a top cause of stutter on low-end phones, and it fights native momentum
 *    scrolling on touch. Fix: disabled entirely at the low tier.
 */

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import { useDeviceTier } from "@/app/core/hooks/useDeviceTier";
import { registerLenis, EASE_OUT_EXPO, SCROLL_DURATION } from "@/app/core/utils/scroll";
import KeyboardScroll from "@/app/core/components/KeyboardScroll";

/**
 * Lives INSIDE <ReactLenis>, so useLenis() can actually reach the context.
 * Renders nothing — it only wires Lenis's scroll loop to GSAP's ticker.
 */
function LenisGsapBridge() {
  const lenis = useLenis();

  /* نسجّل الـ instance في core/utils/scroll عشان كل زرار واختصار ولينك
     في النav يعدّي من نفس المحرّك اللي العجلة بتعدّي منه.

     من غير ده كل واحد فيهم بينادي window.scrollTo بنفسه. ودي بتشتغل —
     Lenis بيزامن حالته مع الحركة الأصلية — بس بمنحنى المتصفح الثابت
     (~٣٠٠ms، مفيش duration ولا easing في المواصفات). فالعجلة تنزل في
     ثانية والزرار يطقّ في تلت ثانية. حركتين في موقع واحد. */
  useEffect(() => {
    registerLenis(lenis ?? null);
    return () => registerLenis(null);
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    // GSAP + ScrollTrigger are ~70 KB. Load them only once smooth scroll is
    // actually active, instead of shipping them to every visitor up front.
    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);

      // Keep the reference so we can actually remove it later.
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        lenis.off("scroll", onScroll);
        gsap.ticker.remove(tick);
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const tier = useDeviceTier();

  // On weak hardware native scrolling beats any JS-driven easing. Bailing out
  // here also means Lenis never attaches its wheel/touch listeners at all.
  if (tier === "low") {
    /* Lenis مش بيتركّب هنا، بس الكيبورد لسه محتاج يشتغل: من غير Lenis
       مفيش `scroll-behavior: auto !important`، فـ scrollToY بيرجع لحركة
       المتصفح الأصلية — وهي بتشتغل على الـ compositor، يعني أرخص من أي
       حاجة نكتبها. نفس المفاتيح، نفس الإحساس، صفر جافاسكريبت للحركة. */
    return (
      <>
        <KeyboardScroll />
        {children}
      </>
    );
  }

  return (
    <ReactLenis
      root
      options={{
        /*
         * ── لماذا lerp وحده، من غير duration ──
         *
         * الاتنين كانوا مكتوبين مع بعض. Lenis بيستخدم **واحد بس**: لو
         * `lerp` متعرّف، بيشتغل بنظام الـ interpolation ويتجاهل
         * `duration` تماماً لحركة العجلة. فـ `duration: 1.2` كانت سطر
         * ميت — أي حد جه يعدّل السرعة منها مكانش هيلاقي أي فرق.
         *
         * ── القيم ──
         *
         * lerp = نسبة المسافة المتبقية اللي بتتقطع كل فريم. أقل = أبطأ
         * وأنعم. نزلت من 0.07 لـ 0.045: الصفحة بتوصل مكانها في ~٦٠ فريم
         * بدل ~٤٠، يعني الحركة بتستقرّ في حوالي ثانية بدل نص ثانية.
         *
         * wheelMultiplier = مسافة كل نقرة عجلة. 0.85 بتخلي كل نقرة تقطع
         * أقل، وده اللي بيدّي الصور اللي تحت الطية وقت تخلص تحميل قبل ما
         * توصل لنص الشاشة.
         *
         * الاتنين مع بعض هما اللي بيدّوا الإحساس اللي إنت طالبه: نزول
         * على مهله، مش فرملة.
         */
        lerp: tier === "mid" ? 0.075 : 0.045,
        wheelMultiplier: 0.85,
        smoothWheel: true,
        /*
         * لينكات الـ hash (#Contact، #Projects، اللينكات جوه المقالات).
         * Lenis عنده تعامل جاهز معاها وكان مقفول — يعني أي <a href="#x">
         * في الموقع كان بيقفّز. بننفس المدة والمنحنى بتوع باقي الحركات
         * عشان الإحساس يفضل واحد.
         */
        anchors: { duration: SCROLL_DURATION, easing: EASE_OUT_EXPO },
        // Never hijack touch scrolling — it breaks momentum and feels laggy.
        syncTouch: false,
      }}
    >
      <LenisGsapBridge />
      {/* الكيبورد. Lenis بيمسك العجلة بس، وبيحط
          `scroll-behavior: auto !important` على <html> — فمن غير ده
          الأسهم وPage Down بيقفّزوا أخشن من موقع من غير smooth scroll. */}
      <KeyboardScroll />
      {children}
    </ReactLenis>
  );
}