"use client";

/*
 * File: sensei-art.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render certifications gallery grid with static thumbnail images
 */

import { useEffect, useRef, useState, memo } from "react";
import Image from "next/image";
import styles from "./sensei-art.module.css";

interface GalleryImage { src: string; thumb: string; }
interface ImageItemProps { image: GalleryImage; }

const GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 50 }, (_, k) => ({
  src: `Assets/art-gallery/Images/image_display/${k + 1}.webp`,
  thumb: `Assets/art-gallery/Images/image_display_thumb/${k + 1}.webp`,
}));

const ImageItem = memo(({ image }: ImageItemProps) => {
  const [thumbSrc, setThumbSrc] = useState(image.thumb);

  return (
    <div className={styles.art_pic}>
      <Image
        src={thumbSrc}
        alt="Certification thumbnail"
        width={350}
        height={350}
        sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, (max-width: 1199px) 33vw, 25vw"
        loading="lazy"
        quality={10}
        className={styles.galleryImg}
        onError={() => setThumbSrc("Assets/art-gallery/Images/logo/My_Logo.webp")}
      />
    </div>
  );
});

ImageItem.displayName = "ImageItem";

const GallerySkeleton = memo(() => (
  <div className={styles.skeletonItem} aria-hidden="true">
    <div className={styles.skeletonThumb} />
    <div className={styles.skeletonCaption}>
      <span className={styles.skeletonLine} />
      <span className={styles.skeletonLineShort} />
    </div>
  </div>
));

GallerySkeleton.displayName = "GallerySkeleton";

const SenseiArt = memo(function SenseiArt() {
  const sectionRef = useRef<HTMLElement>(null);
  const [shouldRenderGallery, setShouldRenderGallery] = useState(false);
  const PAGE_SIZE = 3;
  const INITIAL_VISIBLE_COUNT = 6;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    const sectionNode = sectionRef.current;
    if (!sectionNode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShouldRenderGallery(true);
        observer.disconnect();
      },
      { rootMargin: "220px 0px" }
    );

    observer.observe(sectionNode);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles["art-gallery-section"]} id="Certifications">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <h2 className={styles.title}><span lang="ja">認定資格 •</span><span lang="en"> Certifications</span></h2>
        </div>
        {!shouldRenderGallery ? (
          <div className={styles.Gallery} aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <GallerySkeleton key={`gallery-skeleton-${index}`} />
            ))}
          </div>
        ) : null}
        {shouldRenderGallery ? (
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
                  onClick={() => setVisibleCount((n) => Math.min(GALLERY_IMAGES.length, n + PAGE_SIZE))}
                >
                  Show more
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
});

export default SenseiArt;