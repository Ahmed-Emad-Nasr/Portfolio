"use client";

/*
 * cursor-mount.tsx
 *
 * موجود عشان يشيل الـ dynamic import اللي فيه ssr: false.
 *
 * ليه: `next/dynamic` بـ `ssr: false` ممنوع جوه Server Component،
 * وapp/layout.tsx **هو** Server Component (بيصدّر `metadata`، وده حاجة
 * الـ Server Components بس اللي بتعملها). حطّه هنا، ورا حاجز "use client"،
 * هو النمط المدعوم.
 *
 * ═══ التعديل ═══
 *
 * `dynamic()` بيبدأ تحميل الـ chunk أول ما المكوّن يترندر — يعني على
 * التليفون الـ chunk كان بيتحمّل بالكامل وبعدين المكوّن يقرا
 * matchMedia("(pointer: fine)") جوّه ويرجع من غير ما يعمل حاجة.
 *
 * والـ chunk ده مش صغير: useMotionValue + useSpring بيجروا محرّك الأنيميشن
 * بتاع framer-motion كله وراهم. بايتس بتتحمّل وتتفكّ وتتنفّذ على المسار
 * الحرج، على جهاز مستحيل يستخدمها.
 *
 * الفحص بقى **قبل** الـ import: التليفون عمره ما يطلب الملف أصلاً.
 * الـ state ضروري عشان أول render في المتصفح يطابق اللي جه من السيرفر
 * (null في الحالتين) — مفيش hydration mismatch.
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { isTouchDevice } from "@/app/core/hooks/useDeviceTier";

const CustomCursor = dynamic(() => import("./custom-cursor"), { ssr: false });

export default function CursorMount() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (isTouchDevice()) return;
    // reduced-motion برضه بيلغيه: مؤشر بزنبرك هو بالظبط نوع الحركة اللي
    // الإعداد ده موجود عشانها.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
  }, []);

  if (!enabled) return null;
  return <CustomCursor />;
}
