"use client";

/*
 * useDeviceTier — يصنّف جهاز الزائر مرة واحدة.
 *
 * ═══ إيه اللي اتغيّر ═══
 *
 * 1) التصنيف بقى بيحصل **قبل أول paint** عن طريق سكربت inline صغير في
 *    <head> (شوف DEVICE_TIER_SCRIPT تحت). قبل كده كان بيحصل جوّه useEffect،
 *    يعني بعد ما الـ bundle كله يتحمّل ويعمل hydrate — وده كان معناه إن كل
 *    الأنيميشن التقيل (20 عنصر في الـ hero + backdrop-filter + Lenis) بيشتغل
 *    بكامل تكلفته بالظبط في النافذة الحرجة اللي الـ LCP والـ TBT بيتقاسوا
 *    فيها، وبعدين يتقفل. الـ CSS gating كان مكتوب صح ومربوط متأخر.
 *
 * 2) أي جهاز touch بشاشة ضيقة (تليفون) بقى "low" مباشرةً.
 *    قبل كده `isCoarse` كان بيدّي "mid" — والتليفونات كلها كانت بتقع هناك،
 *    يعني بتاخد نص الميزانية بس. الـ "mid" أصلاً كان مقصود بيه اللابتوبات
 *    الضعيفة، مش الموبايل. التابلت (عرض > 900) لسه "mid" زي ما هو.
 *
 * لازم detectTier() والسكربت يفضلوا **متطابقين** — أي تعديل في واحد
 * يتعمل في التاني.
 */

import { useEffect, useState } from "react";

export type DeviceTier = "low" | "mid" | "high";

/** عرض الشاشة اللي تحته الجهاز اللمسي يتحسب تليفون */
const PHONE_MAX_WIDTH = 900;

/*
 * السكربت ده بيتحقن في <head> كـ inline blocking script.
 * بيتنفّذ قبل ما المتصفح يرسم أي حاجة، فقواعد html[data-tier="low"]
 * في globals.css بتبقى شغّالة من أول فريم.
 *
 * مكتوب مضغوط عن قصد — ده بايتس بتتحط في كل صفحة HTML.
 * try/catch عشان أي متصفح قديم ميوقّفش الصفحة.
 */
export const DEVICE_TIER_SCRIPT = `(function(){try{var d=document.documentElement,n=navigator,c=n.connection||{},m=window.matchMedia.bind(window),t;if(m("(prefers-reduced-motion: reduce)").matches||c.saveData||/(^|-)2g$/.test(c.effectiveType||"")){t="low"}else{var h=n.hardwareConcurrency||4,y=n.deviceMemory||4,x=m("(pointer: coarse)").matches;t=(x&&window.innerWidth<=${PHONE_MAX_WIDTH})||h<=4||y<=2?"low":h<=8||y<=4||x?"mid":"high"}d.dataset.tier=t}catch(e){document.documentElement.dataset.tier="mid"}})()`;

function detectTier(): DeviceTier {
  // تفضيل نظام التشغيل بيتفوق على أي تخمين للهاردوير.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  // Data Saver شغّال = المستخدم طلب أقل صراحةً.
  if (nav.connection?.saveData) return "low";

  const cores = nav.hardwareConcurrency ?? 4;
  // deviceMemory متاح في Chromium بس، ومقرّب (0.25/0.5/1/2/4/8).
  const memory = nav.deviceMemory ?? 4;
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");

  if (slowNet) return "low";
  // تليفون = ميزانية حركة منخفضة، مهما كان الشيب جواه سريع. الشاشة الصغيرة
  // معناها إن الزخرفة بتتشاف أقل أصلاً، والبطارية والشبكة أهم.
  if (isCoarse && window.innerWidth <= PHONE_MAX_WIDTH) return "low";
  if (cores <= 4 || memory <= 2) return "low";
  if (cores <= 8 || memory <= 4 || isCoarse) return "mid";
  return "high";
}

/** بيقرا اللي السكربت كتبه بدل ما يحسب من الأول */
function readTier(): DeviceTier | null {
  const value = document.documentElement.dataset.tier;
  return value === "low" || value === "mid" || value === "high" ? value : null;
}

// السيرفر وأول render في المتصفح لازم يتفقوا، فبنبدأ من "mid".
// السكربت كتب القيمة الحقيقية على <html> خلاص، فالـ CSS مضبوط من أول لحظة —
// الـ state هنا بيلحق بعد الـ hydration وده بيأثر على فروع الجافاسكريبت بس.
const DEFAULT_TIER: DeviceTier = "mid";

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>(DEFAULT_TIER);

  useEffect(() => {
    const apply = () => {
      // السكربت شغّال قبلنا في الحالة العادية — منعيدش الحساب من غير داعي.
      const next = readTier() ?? detectTier();
      setTier(next);
      document.documentElement.dataset.tier = next;
    };

    apply();

    // لو المستخدم قلب سويتش reduced-motion، أو لفّ التليفون ودخل/خرج من
    // حدود العرض، نعيد التقييم.
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia(`(max-width: ${PHONE_MAX_WIDTH}px)`);

    const recompute = () => {
      const next = detectTier();
      setTier(next);
      document.documentElement.dataset.tier = next;
    };

    motionQuery.addEventListener("change", recompute);
    widthQuery.addEventListener("change", recompute);
    return () => {
      motionQuery.removeEventListener("change", recompute);
      widthQuery.removeEventListener("change", recompute);
    };
  }, []);

  return tier;
}

/** اختصار: true لما الجهاز يستاهل يتخطّى كل الحركة الزخرفية. */
export function useIsLowTier(): boolean {
  return useDeviceTier() === "low";
}

/**
 * فحص متزامن للأجهزة اللمسية — للمكوّنات اللي عايزة تقرر **قبل** ما تطلب
 * chunk أصلاً (المؤشر المخصص، الـ command palette). بيرجع false على السيرفر.
 */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
