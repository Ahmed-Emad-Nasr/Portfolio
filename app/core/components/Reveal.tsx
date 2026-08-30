"use client";

/*
 * Reveal.tsx — ظهور العناصر مع الـ scroll، بـ CSS بالكامل
 * Author: Ahmed Emad Nasr
 *
 * بديل لـ MotionInView. نفس النتيجة البصرية، بتكلفة مختلفة تماماً.
 *
 * ═══ ليه ═══
 *
 * `whileInView` بتاعة framer-motion بتعمل **IntersectionObserver لكل
 * عنصر**، وكل عنصر كمان بيشترك في محرّك الأنيميشن وبيتحرّك من
 * الجافاسكريبت فريم بفريم. الموقع فيه ٣٥ استخدام، ومعرض الأعمال لوحده
 * بيرندر لحد ٥٠ عنصر — يعني ٥٠ observer و٥٠ اشتراك في المحرّك، وكلهم
 * بيشتغلوا على الـ main thread أثناء الـ scroll.
 *
 * الملف ده بيستخدم:
 *   · **observer واحد** للصفحة كلها، مشترك بين كل العناصر
 *   · CSS `animation` للحركة نفسها — بتتنفّذ على الـ compositor
 *
 * دور الجافاسكريبت اتقلّص لحاجة واحدة: يغيّر attribute مرة واحدة لما
 * العنصر يدخل الشاشة. بعدها المتصفح بيكمّل لوحده. صفر شغل لكل فريم.
 *
 * والحركة نفسها هي نفس `fadeInUp` بتاعة الـ hero — نفس المسافة (24px)،
 * نفس الـ easing (--motion-ease)، نفس منطق التأخير المتدرّج. الفرق إنها
 * بقت متاحة لكل الموقع بدل ما تكون مكتوبة بالإيد في sensei-home.module.css.
 *
 * ═══ ليه opacity و transform بس ═══
 *
 * دول الخاصيتين الوحيدتين اللي المتصفح بيحرّكهم على الـ compositor من
 * غير layout ولا paint. أي حاجة تانية — height، margin، filter، حتى
 * background-color — بتجبر إعادة حساب في كل فريم.
 *
 * القاعدة دي مش تفضيل، هي السبب إن الأنيميشن ده مجاني فعلاً على
 * الموبايل.
 */

import React, { memo, useEffect, useRef } from "react";

export type RevealVariant =
  | "up"      // الافتراضي — نفس fadeInUp بتاع الـ hero
  | "down"
  | "left"
  | "right"
  | "fade"    // opacity بس — أرخص واحدة
  | "scale";

/* ═══ الـ observer المشترك ═══
 *
 * واحد للصفحة كلها. بيتعمل عند أول استخدام وبيفضل موجود — إنشاء
 * observer وتدميره مع كل mount أغلى من إن واحد يفضل عايش.
 *
 * `rootMargin` السالب من تحت معناه إن العنصر بيتحسب "ظاهر" لما يبقى
 * داخل الشاشة بـ ١٢٪ من ارتفاعها، مش أول ما يلمس الحافة. من غير ده
 * الحركة بتخلص قبل ما الزائر يبص على العنصر.
 */
let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  sharedObserver ??= new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.dataset.reveal = "in";
        // مرة واحدة وبس. `once: false` كان معناه إن كل عنصر بيعيد
        // الحركة كل ما يرجع للشاشة — يعني شغل أنيميشن مستمر طول الـ
        // scroll على صفحة طويلة.
        observer.unobserve(el);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
  );
  return sharedObserver;
}

/*
 * بيقول للـ CSS إن الجافاسكريبت اشتغل.
 *
 * الحالة الابتدائية (opacity: 0) بتتكتب في الـ HTML من السيرفر. لو
 * الـ bundle فشل يتحمّل لأي سبب، الموقع كان هيفضل **مخفي بالكامل**.
 *
 * الشبكة الأمنية في الـ CSS: طول ما `data-reveal-ready` مش موجودة على
 * <html>، فيه أنيميشن بيظهر كل حاجة بعد ٤ ثواني. أول ما المكوّن ده
 * يشتغل بيحط الـ attribute، فالقاعدة دي بتبطّل تطابق ومبتضربش أبداً.
 *
 * يعني: الجافاسكريبت شغّال → ظهور مع الـ scroll. اتعطّل → كل حاجة
 * بتبان لوحدها. مفيش حالة الموقع بيفضل فاضي فيها.
 */
function markReady() {
  document.documentElement.dataset.revealReady = "1";
}

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: RevealVariant;
  /** تأخير بالملي ثانية قبل ما الحركة تبدأ */
  delay?: number;
  /** العنصر اللي هيترندر. div افتراضياً — استخدم li/section حسب المكان. */
  as?: "div" | "section" | "article" | "li" | "header" | "figure";
} & Omit<React.HTMLAttributes<HTMLElement>, "style">;

const Reveal = memo(function Reveal({
  children,
  className,
  style,
  variant = "up",
  delay,
  as: Tag = "div",
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    markReady();

    const el = ref.current;
    if (!el) return;

    /*
     * `data-tier` بيتكتب على <html> بسكربت inline في <head> قبل أول
     * paint. لو مش موجود يبقى السكربت اتعطّل — نعرض المحتوى على طول
     * بدل ما نراهن على أنيميشن.
     */
    const tier = document.documentElement.dataset.tier;
    if (!tier) {
      el.dataset.reveal = "in";
      return;
    }

    const observer = getObserver();
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={className}
      data-reveal="pending"
      data-reveal-variant={variant}
      style={
        delay
          ? ({ ...style, "--reveal-delay": `${delay}ms` } as React.CSSProperties)
          : style
      }
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default Reveal;

/* ═══ RevealGroup ═══
 *
 * لما يبقى عندك قايمة، الغلط الشائع إنك تلف كل عنصر في <Reveal> لوحده —
 * معرض الأعمال كده بيبقى ٥٠ عنصر في الـ observer.
 *
 * ده بيراقب **الحاوية بس**، والأبناء بيتأخّروا واحد ورا التاني بـ CSS
 * عن طريق متغيّر --i. يعني observer entry واحد بدل خمسين، ونفس الشكل
 * المتدرّج بالظبط.
 *
 * الـ `staggerMs` بيتحدّد بسقف: ٥٠ عنصر × ٦٠ms = ٣ ثواني قبل ما آخر
 * واحد يبان. الـ CSS بيقفل التدرّج بعد العنصر الـ ١٢ عشان القوائم
 * الطويلة متبقاش انتظار.
 */
export const RevealGroup = memo(function RevealGroup({
  children,
  className,
  style,
  variant = "up",
  staggerMs = 60,
  as: Tag = "div",
  ...rest
}: RevealProps & { staggerMs?: number }) {
  return (
    <Reveal
      as={Tag}
      variant={variant}
      className={className}
      style={{ ...style, "--reveal-stagger": `${staggerMs}ms` } as React.CSSProperties}
      data-reveal-group="true"
      {...rest}
    >
      {React.Children.map(children, (child, i) =>
        React.isValidElement<{ style?: React.CSSProperties }>(child)
          ? React.cloneElement(child, {
              style: { ...(child.props.style ?? {}), "--i": i } as React.CSSProperties,
            })
          : child,
      )}
    </Reveal>
  );
});
