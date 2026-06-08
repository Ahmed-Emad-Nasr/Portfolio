"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, type TouchEvent } from "react";
import styles from "../page.module.css";
import type { GalleryState } from "../blog-types";

// ─── Types ────────────────────────────────────────────────────────────────────

type BlogGalleryModalProps = {
  gallery: GalleryState | null;
  currentShot: string | null;
  setGallery: (value: GalleryState | null) => void;
  goGallery: (delta: number) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BlogGalleryModal({
  gallery,
  currentShot,
  setGallery,
  goGallery,
}: BlogGalleryModalProps) {
  const galleryDialogRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Effect 1: Focus management — runs only when the gallery opens/closes.
  // Separating this from the keyboard handler effect means focus is restored
  // correctly when the gallery closes regardless of which index was last active.
  useEffect(() => {
    if (!gallery) return;
    const prev = document.activeElement as HTMLElement | null;
    const dialog = galleryDialogRef.current;
    dialog?.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])'
    )?.[0]?.focus();

    return () => {
      prev?.focus();
    };
    // Only re-run when the gallery is opened/closed, not on index change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gallery != null]);

  // Effect 2: Keyboard navigation — re-runs when gallery/index changes so that
  // the focusables snapshot and the goGallery/setGallery references stay fresh.
  useEffect(() => {
    if (!gallery) return;
    const dialog = galleryDialogRef.current;
    const focusables = dialog?.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])'
    );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setGallery(null); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); goGallery(1); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); goGallery(-1); return; }
      if (e.key !== "Tab" || !focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gallery, goGallery, setGallery]);

  // Stable touch handlers — useCallback prevents identity churn on the anchor
  // element across gallery index changes.
  const handleTouchStart = useCallback((event: TouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      if (touchStartXRef.current === null) return;
      const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
      const deltaX = endX - touchStartXRef.current;
      touchStartXRef.current = null;
      if (Math.abs(deltaX) < 40) return;
      goGallery(deltaX < 0 ? 1 : -1);
    },
    [goGallery]
  );

  if (!gallery || !currentShot) return null;

  return (
    <div
      className={styles.galleryOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={`${gallery.title} screenshots gallery`}
      onClick={() => setGallery(null)}
    >
      <div
        ref={galleryDialogRef}
        className={styles.galleryDialog}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.galleryHeader}>
          <h3 className={styles.galleryTitle}>{gallery.title}</h3>
          <p className={styles.galleryCounter}>
            Screenshot {gallery.index + 1} of {gallery.screenshots.length}
          </p>
          <button
            type="button"
            className={styles.galleryClose}
            onClick={() => setGallery(null)}
            aria-label="Close screenshots gallery"
          >
            ✕ Close
          </button>
        </div>

        <div className={styles.galleryStage}>
          <button
            type="button"
            className={styles.galleryNav}
            onClick={() => goGallery(-1)}
            aria-label="Previous screenshot"
          >
            ←
          </button>
          <a
            href={currentShot}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.galleryImageWrap}
            aria-label="Open current screenshot in new tab"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={currentShot}
              alt={`${gallery.title} screenshot ${gallery.index + 1}`}
              fill
              sizes="(max-width: 991px) 95vw, 78vw"
              loading="lazy"
              quality={75}
            />
          </a>
          <button
            type="button"
            className={styles.galleryNav}
            onClick={() => goGallery(1)}
            aria-label="Next screenshot"
          >
            →
          </button>
        </div>

        <div className={styles.galleryThumbs}>
          {gallery.screenshots.map((shot, index) => (
            <button
              key={`${gallery.title}-${shot}`}
              type="button"
              className={
                index === gallery.index
                  ? `${styles.galleryThumbButton} ${styles.activeGalleryThumb}`
                  : styles.galleryThumbButton
              }
              onClick={() => setGallery({ ...gallery, index })}
              aria-label={`Open screenshot ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}