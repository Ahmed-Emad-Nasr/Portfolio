"use client";

import { useState, memo } from "react";
import Image from "next/image";
import styles from "./sensei-art.module.css";
import MotionInView from "@/app/core/components/MotionInView"; 

const GALLERY_IMAGES = Array.from({ length: 50 }, (_, k) => ({
  src: `Assets/art-gallery/Images/image_display/${k + 1}.webp`,
  thumb: `Assets/art-gallery/Images/image_display_thumb/${k + 1}.webp`,
}));

const ImageItem = memo(({ image, index }: { image: { src: string; thumb: string }; index: number }) => {
  const [failed, setFailed] = useState(false);

  return (
    <MotionInView
      variant="scale-up"
      delay={index * 0.05}
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className={styles.art_pic}>
        <Image
          src={failed ? image.src : image.thumb}
          alt="Certification"
          width={350}
          height={350}
          sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 25vw"
          loading="lazy"
          decoding="async"
          quality={10}
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