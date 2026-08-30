"use client";

/*
 * MotionInView.tsx — TRIMMED
 *
 * الملف ده كان بيصدّر كومبوننت `MotionInView` كامل (variants، viewport
 * animation، كل حاجة) + `motionVariants` + `AnimatePresence` معاد تصديره.
 * دلوقتي مفيش حد بيستخدم أي واحد منهم: كل استخدام اتنقل لـ Reveal/
 * RevealGroup (CSS بالكامل، observer مشترك — شوف Reveal.tsx)، وده الكومنت
 * اللي كان موجود في sensei-art.tsx كان بيقوله صراحة: "الغلاف MotionInView
 * اتشال من هنا". آخر مكان كان بيستخدمه اتشال، بس الملف نفسه فضل زي ما هو.
 *
 * اللي فضل فعليًا مستخدم هو `MotionProvider` بس، اللي بيتركّب مرة واحدة في
 * layout.tsx ويوفّر framer-motion features لأي `m.*` تحته (استخدامه
 * الوحيد دلوقتي: sensei_loader.tsx). مسحت الباقي عشان الملف يعبّر عن
 * الواقع، مش عن حالة قديمة.
 */

import React from "react";
import { LazyMotion } from "framer-motion";

/*
 * `domAnimation` كان static import، فالـ ~25KB بتاعته كانت جزء من الـ bundle
 * الأساسي على كل صفحة — بما فيها صفحات البلوج اللي أنيميشناتها أقل.
 *
 * LazyMotion بيقبل دالة بترجّع Promise، فالحزمة بتتحمّل بعد الـ paint الأول
 * بدل ما تتأخّره. الـ m.* components بترندر بحالتها الابتدائية لحد ما توصل،
 * وده بالظبط اللي بيحصل دلوقتي برضه أثناء تحميل الـ bundle — الفرق إن
 * المحتوى بيتعرض أسرع.
 *
 * الدالة بره الكومبوننت عن قصد: لو اتعرّفت جوّه، كل render كان هيبعت
 * مرجع جديد وLazyMotion هيعيد التحميل.
 */
const loadDomAnimation = () =>
  import("framer-motion").then((mod) => mod.domAnimation);

/** Mount ONCE, near the root. Provides features for every m.* below it. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadDomAnimation} strict>
      {children}
    </LazyMotion>
  );
}
