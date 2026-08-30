/* ═══════════════════════════════════════════════════════════════════════════
   تعديل app/components/home/sensei-home.tsx — صورة الـ LCP
   ═══════════════════════════════════════════════════════════════════════════

   المشكلة: مع output: "export" لازم images.unoptimized = true، وساعتها
   <Image> بترندر <img> عادي **من غير srcset**. الـ prop اللي اسمها
   sizes="(max-width: 968px) 80vw, 560px" موجودة في الكود ومالهاش أي أثر:
   مفيش نسخ تانية من الصورة عشان المتصفح يختار من بينها.

   يعني تليفون بشاشة 360px بيحمّل نفس الملف اللي بيتحمّل على 4K. والصورة دي
   هي عنصر الـ LCP بالظبط.

   الحل: loader مخصّص للصورة دي بس. loader بيرجّع مسار ثابت — مفيش سيرفر
   ولا API، بيشتغل على GitHub Pages عادي. والمكسب الإضافي إن <Image> فاضلة
   مكانها، فالـ <link rel="preload"> بالـ imagesrcset الصح بيتولّد لوحده
   (ده اللي كنّا هنخسره لو حوّلنا لـ <img> يدوي).

   ── الخطوات ──
   1. شغّل: node scripts/generate-hero-sizes.mjs
   2. طبّق التعديلات تحت.
   ═══════════════════════════════════════════════════════════════════════════ */


/* ── [أ] ضيف الاستيراد ده مع باقي الاستيرادات في أول الملف ───────────────── */

import { normalizePublicHref } from "@/app/core/config/shared";


/* ── [ب] ضيف الكتلة دي على مستوى الموديول (بره الكومبوننت، جنب ROLES) ────── */

/** المقاسات اللي scripts/generate-hero-sizes.mjs بيولّدها فعلاً. */
const HERO_WIDTHS = [320, 420, 560, 840] as const;

const HERO_SRC = "Assets/art-gallery/Images/logo/3omda.webp";

/*
 * بيربط العرض اللي Next بيطلبه بأقرب ملف مولّد فوقه.
 * على مستوى الموديول عن قصد: مرجع ثابت، فـ <Image> مبتعيدش الحساب كل render.
 */
const heroLoader = ({ src, width }: { src: string; width: number }) => {
  const chosen =
    HERO_WIDTHS.find((w) => w >= width) ?? HERO_WIDTHS[HERO_WIDTHS.length - 1];
  return normalizePublicHref(src.replace(/\.webp$/, `-${chosen}.webp`));
};


/* ── [ج] بدّل عنصر <Image> الحالي بده ────────────────────────────────────── */

            <Image
              /*
                كان: failed ? "/Assets/…" : "Assets/…"
                المسار النسبي بيتحل بالنسبة لعنوان الصفحة الحالية. شغّال من
                "/Portfolio/" وبيقع من أي مسار أعمق. normalizePublicHref جوه
                الـ loader بيحط الـ basePath صح مهما كان مكان الصفحة.
              */
              src={HERO_SRC}
              loader={failed ? undefined : heroLoader}
              /*
                unoptimized={false} بيلغي images.unoptimized من next.config
                للصورة دي بس، فالـ loader فوق بيشتغل ويتولّد srcset حقيقي.
                لو التحميل فشل (النسخ المولّدة مش موجودة لأي سبب) بنرجع
                للأصل بالكامل — الصورة عمرها ما تختفي.
              */
              unoptimized={failed}
              alt="Ahmed Emad Nasr, SOC Analyst"
              className={styles.image}
              width={560}
              height={560}
              sizes="(max-width: 600px) 300px, (max-width: 992px) 420px, 560px"
              priority
              fetchPriority="high"
              decoding="async"
              onError={() => setFailed(true)}
            />


/* ── [د] ملاحظة على الـ sizes ─────────────────────────────────────────────

   الـ sizes القديمة كانت "(max-width: 968px) 80vw, 560px".

   بس الـ CSS بيقول حاجة تانية:
     @media (max-width: 992px) → .homeImg { max-width: 420px }
     @media (max-width: 600px) → .homeImg { max-width: 300px }

   يعني على تابلت 900px: الـ 80vw = 720px، والصورة الحقيقية 420px.
   المتصفح كان هيحجز ضعف البايتس المطلوبة. الـ sizes الجديدة بتطابق
   الـ breakpoints الفعلية.

   لو غيّرت max-width في الـ CSS، غيّر الـ sizes معاها — دول مصدرين لازم
   يفضلوا متزامنين. */
