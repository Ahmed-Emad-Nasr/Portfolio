"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, type TouchEvent } from "react";
import styles from "../page.module.css";
import type { GalleryState } from "../blog-types";

export default function BlogGalleryModal({ gallery, currentShot, setGallery, goGallery }: any) {
  const touchStartXRef = useRef<number | null>(null);

  // اختصارات الكيبورد فقط (خفيف جداً)
  useEffect(() => {
    if (!gallery) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGallery(null);
      if (e.key === "ArrowRight") goGallery(1);
      if (e.key === "ArrowLeft") goGallery(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gallery, goGallery, setGallery]);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLElement>) => {
    touchStartXRef.current = e.changedTouches[0]?.clientX ?? null;
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent<HTMLElement>) => {
    if (touchStartXRef.current === null) return;
    const deltaX = (e.changedTouches[0]?.clientX ?? touchStartXRef.current) - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(deltaX) > 40) goGallery(deltaX < 0 ? 1 : -1);
  }, [goGallery]);

  if (!gallery || !currentShot) return null;

  return (
    <div className={styles.galleryOverlay} onClick={() => setGallery(null)}>
      <div className={styles.galleryDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.galleryHeader}>
          <h3 className={styles.galleryTitle}>{gallery.title}</h3>
          <p className={styles.galleryCounter}>Screenshot {gallery.index + 1} of {gallery.screenshots.length}</p>
          <button type="button" className={styles.galleryClose} onClick={() => setGallery(null)}>✕ Close</button>
        </div>

        <div className={styles.galleryStage}>
          <button type="button" className={styles.galleryNav} onClick={() => goGallery(-1)} aria-label="Previous screenshot">←</button>
          <a
            href={currentShot}
            target="_blank"
            className={styles.galleryImageWrap}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image src={currentShot} alt={`${gallery.title} — screenshot ${gallery.index + 1} of ${gallery.screenshots.length}`} fill sizes="(max-width: 991px) 95vw, 78vw" loading="lazy" quality={75} />
          </a>
          <button type="button" className={styles.galleryNav} onClick={() => goGallery(1)} aria-label="Next screenshot">→</button>
        </div>

        <div className={styles.galleryThumbs}>
          {gallery.screenshots.map((shot: string, index: number) => (
            <button
              key={shot}
              type="button"
              className={index === gallery.index ? `${styles.galleryThumbButton} ${styles.activeGalleryThumb}` : styles.galleryThumbButton}
              onClick={() => setGallery({ ...gallery, index })}
              aria-label={`Go to screenshot ${index + 1}`}
              aria-current={index === gallery.index}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}