"use client";

import { useState, memo } from "react";
import Image from "next/image";
import styles from "./sensei-art.module.css";
import MotionInView from "@/app/core/components/MotionInView"; 

const GALLERY_IMAGES = Array.from({ length: 50 }, (_, k) => ({
  src: `Assets/art-gallery/Images/image_display/${k + 1}.webp`,
  thumb: `Assets/art-gallery/Images/image_display_thumb/${k + 1}.webp`,
}));

const ImageItem = memo(({ image }: { image: { src: string; thumb: string } }) => {
  const [failed, setFailed] = useState(false);

  return (
    // تم التعديل إلى once: true لضمان سلاسة السكرول وعدم إرهاق المعالج
    <MotionInView variant="fade" viewport={{ once: true, amount: 0.1 }}>
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
        <div className={styles["header-section"]}>
          <h2 className={styles.title}>
            <span lang="ja">認定資格 •</span><span lang="en"> Certifications</span>
          </h2>
        </div>
        
        <div className={styles["art-gallery-content"]}>
          <div className={styles.Gallery}>
            {GALLERY_IMAGES.slice(0, visibleCount).map((image) => (
              <ImageItem key={image.src} image={image} />
            ))}
          </div>

          {visibleCount < GALLERY_IMAGES.length && (
            <div className={styles.galleryActions}>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={() => setVisibleCount((n) => Math.min(GALLERY_IMAGES.length, n + 3))}
              >
                Show more
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

export default SenseiArt;