"use client";

/*
 * Spotlight.tsx — بقعة ضوء بتتبع الماوس فوق شبكة كروت
 * Author: Ahmed Emad Nasr
 *
 * ده المكوّن الوحيد في الحزمة اللي بيكلّف حاجة فعلاً. باقي التفاعلات
 * CSS خالص. قرّرت أكتبه لأنه أوضح تأثير "الموقع بيرد عليك" موجود، وممكن
 * يتعمل رخيص لو اتكتب صح — بس لازم تعرف بتدفع إيه.
 *
 * ═══ التكلفة ═══
 *
 *   · listener واحد على الحاوية (مش على كل كارت) — event delegation
 *   · rAF throttle: كتابة واحدة لكل فريم مهما كان عدد أحداث الماوس
 *   · بيكتب متغيّرين CSS بس — مفيش حساب تخطيط، مفيش قراءة من الـ DOM
 *     أثناء الحركة (المقاسات بتتقاس مرة واحدة وبتتخزّن)
 *   · الرسم: radial-gradient على الكارت اللي تحت الماوس بس
 *
 * الرسم ده حقيقي ومش مجاني. على ديسكتوب مش هتحسه. عشان كده المكوّن
 * بيرجع null على أي جهاز لمسي أو أي جهاز مش "high" — يعني كل
 * التليفونات والتابلت وأي لابتوب ضعيف عمره ما هيحمّل ولا سطر منه.
 *
 * ═══ الاستخدام ═══
 *
 *   <Spotlight className={styles.grid}>
 *     <article data-fx="card">…</article>
 *     <article data-fx="card">…</article>
 *   </Spotlight>
 *
 * محتاج القواعد اللي في _PATCHES/3-spotlight.md.
 */

import React, { useEffect, useRef } from "react";
import { useDeviceTier } from "@/app/core/hooks/useDeviceTier";

type SpotlightProps = {
  children: React.ReactNode;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children">;

export default function Spotlight({ children, className, ...rest }: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tier = useDeviceTier();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // الشرط ده هو اللي بيخلي المكوّن آمن. أي جهاز لمسي أو مش قوي
    // بيخرج هنا ومبيسجّلش أي listener.
    if (tier !== "high") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pendingX = 0;
    let pendingY = 0;
    let target: HTMLElement | null = null;

    /*
     * الكتابة بتحصل جوه rAF مش جوه الـ handler.
     *
     * pointermove بيضرب لحد ١٢٠ مرة في الثانية على شاشة 120Hz. من
     * غير الـ throttle ده كنا هنكتب على الـ DOM أكتر من عدد الفريمات
     * اللي بتترسم أصلاً — شغل بيتلغي قبل ما يبان.
     */
    const flush = () => {
      frame = 0;
      if (!target) return;
      target.style.setProperty("--spot-x", `${pendingX}px`);
      target.style.setProperty("--spot-y", `${pendingY}px`);
    };

    const onMove = (event: PointerEvent) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>(
        '[data-fx="card"]',
      );

      if (card !== target) {
        // نضّف الكارت اللي خرجنا منه، وإلا بيفضل مولّع
        target?.removeAttribute("data-spot");
        target = card;
        target?.setAttribute("data-spot", "on");
      }

      if (!card) return;

      /*
       * getBoundingClientRect بيجبر المتصفح يحسب التخطيط. استدعاؤه
       * هنا مقبول لأنه بيحصل مرة لكل فريم على عنصر واحد — مش في لوب.
       *
       * الحفظ في cache كان هيبقى غلط: الكارت بيتحرك 4px لفوق عند
       * الـ hover، والمقاسات المحفوظة كانت هتبقى قديمة.
       */
      const rect = card.getBoundingClientRect();
      pendingX = event.clientX - rect.left;
      pendingY = event.clientY - rect.top;

      frame ||= requestAnimationFrame(flush);
    };

    const onLeave = () => {
      target?.removeAttribute("data-spot");
      target = null;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    // passive: true بيقول للمتصفح إن الـ handler مش هيعمل
    // preventDefault، فمش محتاج يستناه قبل ما يكمّل scroll.
    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      target?.removeAttribute("data-spot");
    };
  }, [tier]);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
