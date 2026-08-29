"use client";

import { useState, memo } from "react";
import Image from "next/image";
import styles from "./sensei-art.module.css";
import MotionInView from "@/app/core/components/MotionInView";
import {
  GALLERY_IMAGE_COUNT,
  certificationAlt,
} from "@/app/core/config/certifications";
import Credentials from "@/app/components/credentials/credentials";

// Paths are RELATIVE on purpose. This project does not set Next's `basePath`;
// it handles the /Portfolio sub-path manually. On GitHub Pages the homepage is
// served at /Portfolio/, so a relative "Assets/..." resolves to
// /Portfolio/Assets/... correctly. Do NOT add a leading slash here — that
// would resolve to the domain root and 404 in production.
const GALLERY_IMAGES = Array.from({ length: GALLERY_IMAGE_COUNT }, (_, k) => ({
  n: k + 1,
  src: `Assets/art-gallery/Images/image_display/${k + 1}.webp`,
  thumb: `Assets/art-gallery/Images/image_display_thumb/${k + 1}.webp`,
  alt: certificationAlt(k + 1),
}));

type GalleryImage = (typeof GALLERY_IMAGES)[number];

const ImageItem = memo(({ image, index }: { image: GalleryImage; index: number }) => {
  const [failed, setFailed] = useState(false);

  return (
    // delay={index * 0.05} meant image #60 waited three full seconds after
    // entering the viewport before appearing. The stagger is capped so the
    // effect stays a flourish instead of a delay.
    <MotionInView
      variant="scale-up"
      delay={Math.min(index, 6) * 0.05}
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className={styles.art_pic}>
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
          sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 25vw"
          loading="lazy"
          decoding="async"
          className={styles.galleryImg}
          onError={() => setFailed(true)}
        />
      </div>
    </MotionInView>
  );
});

ImageItem.displayName = "ImageItem";

const SenseiArt = memo(function SenseiArt() {
  const [visibleCount, setVisibleCount] = useState(6);

  return (
    <section className={styles["art-gallery-section"]} id="Certifications">
      <div className={styles.container}>
        <MotionInView className={styles["header-section"]} variant="slide-up" viewport={{ once: true, amount: 0.3 }}>
          <h2 className={styles.title}>
            <span lang="ja">認定資格 •</span><span lang="en"> Certifications</span>
          </h2>
        </MotionInView>

        {/* الشهادات والإنجازات والمهارات كبيانات مقروءة، فوق حيطة الصور.
            حيطة الصور لوحدها كانت بتقول "عندي حاجات" من غير ما تقول إيه. */}
        <Credentials />

        <div className={styles["art-gallery-content"]}>
          <MotionInView className={styles.Gallery} variant="stagger" viewport={{ once: true, amount: 0.1 }}>
            {GALLERY_IMAGES.slice(0, visibleCount).map((image, index) => (
              <ImageItem key={image.src} image={image} index={index} />
            ))}
          </MotionInView>

          {visibleCount < GALLERY_IMAGES.length && (
            <MotionInView className={styles.galleryActions} variant="fade" delay={0.1} viewport={{ once: true, amount: 0.1 }}>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={() => setVisibleCount((n) => Math.min(GALLERY_IMAGES.length, n + 3))}
              >
                Show more
              </button>
            </MotionInView>
          )}
        </div>
      </div>
    </section>
  );
});

export default SenseiArt;