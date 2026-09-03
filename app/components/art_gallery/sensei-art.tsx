"use client";

import React, { useState, memo, type ReactNode } from "react";
import Image from "next/image";
import styles from "./sensei-art.module.css";
import Reveal, { RevealGroup } from "@/app/core/components/Reveal";
import Spotlight from "@/app/core/components/Spotlight";
import {
  GALLERY_IMAGE_COUNT,
  certificationAlt,
} from "@/app/core/config/certifications";

// Paths are RELATIVE on purpose. This project does not set Next's `basePath`;
// it handles the /Portfolio sub-path manually. On GitHub Pages the homepage is
// served at /Portfolio/, so a relative "Assets/..." resolves to
// /Portfolio/Assets/... correctly. Do NOT add a leading slash here — that
// would resolve to the domain root and 404 in production.
/*
 * `src` كان بيشاور على Assets/art-gallery/Images/image_display/ — والمجلد
 * ده **مش موجود في public/ أصلاً**. الموجود هو image_display_thumb بس.
 *
 * الكومبوننت بيعرض الـ thumb افتراضياً وبيرجع لـ src عند الخطأ، فالحيطة
 * شكلها سليم والمشكلة مكانتش بتبان — بس الـ fallback كان مسار ميت: أول ما
 * أي thumb يفشل، البديل بيعمل 404 كمان.
 *
 * دلوقتي الاتنين على نفس المجلد الموجود. لو رفعت الصور بالحجم الكامل
 * بعدين، رجّع مسار image_display هنا وهتشتغل على طول.
 */
const GALLERY_IMAGES = Array.from({ length: GALLERY_IMAGE_COUNT }, (_, k) => ({
  n: k + 1,
  src: `Assets/art-gallery/Images/image_display_thumb/${k + 1}.webp`,
  thumb: `Assets/art-gallery/Images/image_display_thumb/${k + 1}.webp`,
  alt: certificationAlt(k + 1),
}));

type GalleryImage = (typeof GALLERY_IMAGES)[number];

const ImageItem = memo(({
  image,
  style,
}: {
  image: GalleryImage;
  /* بييجي من RevealGroup — هو اللي بيحط --i عليه عشان التدرّج في الـ CSS */
  style?: React.CSSProperties;
}) => {
  const [failed, setFailed] = useState(false);

  return (
    /*
     * الغلاف MotionInView اتشال من هنا.
     *
     * كل صورة كانت بتلف نفسها في MotionInView — يعني IntersectionObserver
     * لكل صورة، واشتراك في محرّك framer-motion لكل صورة. المعرض بيرندر
     * لحد 50 صورة.
     *
     * دلوقتي RevealGroup على الشبكة بيراقب الحاوية بس، والتدرّج بيحصل
     * في الـ CSS عن طريق --i. observer entry واحد بدل خمسين.
     *
     * `style` بييجي من RevealGroup — هو اللي بيحط --i عليه.
     */
    <div className={styles.art_pic} style={style} data-fx="card" data-card="tight">
        {/* alt was the literal string "Certification" on all 74 images.
            See core/config/certifications.ts — fill that map in and every
            certificate here gets its real name, issuer and (optionally) a
            verification link, for free.

            `quality` is gone: it is a no-op while images.unoptimized is true,
            so it only implied an optimisation pipeline that does not run. */}
        <Image
          src={failed ? image.src : image.thumb}
          alt={image.alt}
          width={350}
          height={350}
          sizes="(max-width: 768px) 100vw, (max-width: 992px) 50vw, 25vw"
          loading="lazy"
          decoding="async"
          className={styles.galleryImg}
          onError={() => setFailed(true)}
        />
    </div>
  );
});

ImageItem.displayName = "ImageItem";

/*
 * `credentials` بييجي جاهز من page.tsx (Server Component).
 *
 * السبب: credentials.tsx بيقرا certifications + skills + achievements
 * (~11.7 كيلوبايت). استيراده من هنا كان بيحوّله لـ client component
 * ويحزّم الداتا دي في bundle الصفحة الرئيسية. نفس النمط المستخدم مع
 * AttackMatrix بالظبط.
 */
type SenseiArtProps = { credentials?: ReactNode };

const SenseiArt = memo(function SenseiArt({ credentials }: SenseiArtProps) {
  const [visibleCount, setVisibleCount] = useState(6);

  return (
    <section className={styles["art-gallery-section"]} id="Certifications">
      <div data-fx="container" data-container="full">
        {/*
          العنوان الكبير «認定資格 • Certifications» كان هنا واتشال.

          كان بيكرر نفس الكلمة مرتين ورا بعض: عنوان القسم الكبير، وتحته
          على طول <h3>Certifications</h3> بتاع أول بلوك في credentials.

          الشهادات والإنجازات والمهارات كبيانات مقروءة، فوق حيطة الصور.
          حيطة الصور لوحدها كانت بتقول "عندي حاجات" من غير ما تقول إيه.
        */}
        {credentials}

        <div className={styles["art-gallery-content"]}>
          <Spotlight>
            <RevealGroup className={styles.Gallery} variant="scale" staggerMs={50}>
              {GALLERY_IMAGES.slice(0, visibleCount).map((image) => (
                <ImageItem key={image.src} image={image} />
              ))}
            </RevealGroup>
          </Spotlight>

          {visibleCount < GALLERY_IMAGES.length && (
            /* delay بالملي ثانية دلوقتي مش بالثواني — كان 0.1 يعني 100ms */
            <Reveal className={styles.galleryActions} variant="fade" delay={100}>
              <button
                type="button"
                data-fx="btn" data-btn="ghost" data-tone="main"
                onClick={() => setVisibleCount((n) => Math.min(GALLERY_IMAGES.length, n + 3))}
              >
                Show more
              </button>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
});

export default SenseiArt;