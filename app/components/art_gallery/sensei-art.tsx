"use client";

/*
 * File: sensei-art.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render certifications gallery grid and lightbox viewer integration
 */

import { useCallback, useEffect, useRef, useState, memo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import styles from "./sensei-art.module.css";


const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false, loading: () => <div>Loading gallery...</div> });

interface GalleryImage { src: string; thumb: string; }
interface CertificationMeta { title: string; issuer: string; date: string; verifyUrl: string; }
interface ImageItemProps { image: GalleryImage; index: number; setOpen: (index: number) => void; meta: CertificationMeta; }

const GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 31 }, (_, k) => ({
  src: `Assets/art-gallery/Images/image_display/${k + 1}.png`,
  thumb: `Assets/art-gallery/Images/image_display_thumb/${k + 1}.webp`,
}));

const DEFAULT_CERT: CertificationMeta = {
  title: "Cybersecurity Certification",
  issuer: "Cybersecurity Program",
  date: "2024-2026",
  verifyUrl: "https://www.linkedin.com/in/ahmed-emad-nasr/",
};

const CERTIFICATION_OVERRIDES: Record<number, CertificationMeta> = {
  0: { title: "eJPT v2", issuer: "INE", date: "2025", verifyUrl: "https://my.ine.com/" },
  1: { title: "CCNA 200-301", issuer: "Cisco", date: "2025", verifyUrl: "https://www.cisco.com/" },
  2: { title: "SOC Analyst Path L1/L2", issuer: "TryHackMe", date: "2025", verifyUrl: "https://tryhackme.com/" },
  3: { title: "DEPI Information Security Analyst", issuer: "DEPI", date: "2025", verifyUrl: "https://www.depi.gov.eg/" },
  4: { title: "HCIA Cloud & Datacom", issuer: "Huawei ICT Academy", date: "2024", verifyUrl: "https://www.huawei.com/minisite/ict-academy/en/" },
};

const CERTIFICATION_METADATA: CertificationMeta[] = Array.from({ length: 31 }, (_, i) => CERTIFICATION_OVERRIDES[i] ?? { ...DEFAULT_CERT, title: `Certification ${i + 1}` });

const LIGHTBOX_SLIDES = GALLERY_IMAGES.map((image, index) => ({
  src: image.src,
  title: CERTIFICATION_METADATA[index]?.title,
  description: `${CERTIFICATION_METADATA[index]?.issuer} • ${CERTIFICATION_METADATA[index]?.date}`,
}));

const ImageItem = memo(({ image, index, setOpen, meta }: ImageItemProps) => {
  const [thumbSrc, setThumbSrc] = useState(image.thumb);
  const handleClick = useCallback(() => setOpen(index), [setOpen, index]);

  return (
    <div className={styles.art_pic}>
      <button
        type="button"
        className={styles.imageButton}
        onClick={handleClick}
        aria-label={`Open certification image ${index + 1}`}
      >
        <Image
          src={thumbSrc}
          alt={`${meta.title} certification`}
          width={350}
          height={350}
          sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, (max-width: 1199px) 33vw, 25vw"
          loading="lazy"
          quality={20}
          className={styles.galleryImg}
          onError={() => setThumbSrc("Assets/art-gallery/Images/logo/My_Logo.webp")}
        />
      </button>
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
  const [index, setIndex] = useState(-1);
  const [shouldRenderGallery, setShouldRenderGallery] = useState(false);
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const open = index >= 0;

  const handleCloseLightbox = useCallback(() => setIndex(-1), []);

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

  // Load lightbox CSS only when the gallery is about to render/open.
  useEffect(() => {
    if (!shouldRenderGallery) return;
    let cancelled = false;
    (async () => {
      try {
        await import("yet-another-react-lightbox/styles.css");
      } catch (e) {
        if (!cancelled) {
          // swallow — CSS failing to load shouldn't break UI
          // eslint-disable-next-line no-console
          console.warn("Failed to load lightbox styles", e);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [shouldRenderGallery]);

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
              {GALLERY_IMAGES.slice(0, visibleCount).map((image, i) => (
                <ImageItem key={image.src} image={image} index={i} setOpen={setIndex} meta={CERTIFICATION_METADATA[i]} />
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
      {open ? (
        <Lightbox
          slides={LIGHTBOX_SLIDES}
          open={open}
          index={index}
          close={handleCloseLightbox}
          animation={{ fade: 0, swipe: 0 }}
        />
      ) : null}
    </section>
  );
});

export default SenseiArt;