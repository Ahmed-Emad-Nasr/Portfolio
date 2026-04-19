"use client";

/*
 * File: sensei-art.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render certifications gallery grid and lightbox viewer integration
 */

import { useCallback, useEffect, useRef, useState, memo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import "yet-another-react-lightbox/styles.css";
import styles from "./sensei-art.module.css";
import MotionInView from "@/app/core/components/MotionInView";

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false, loading: () => <div>Loading gallery...</div> });

interface GalleryImage { src: string; thumb: string; }
interface CertificationMeta { title: string; issuer: string; date: string; verifyUrl: string; }
interface ImageItemProps { image: GalleryImage; index: number; setOpen: (index: number) => void; meta: CertificationMeta; }
interface GallerySkeletonProps { index: number; }

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const sectionHeaderVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: EASE_OUT } },
};

const galleryVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

const GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 24 }, (_, k) => ({
  src: `Assets/art-gallery/Images/image_display/${k + 1}.png`,
  thumb: `Assets/art-gallery/Images/image_display_thumb/${k + 1}.webp`,
}));

const CERTIFICATION_METADATA: CertificationMeta[] = Array.from({ length: 24 }, (_, index) => ({
  title: `Certification ${index + 1}`,
  issuer: "Cybersecurity Program",
  date: "2024-2026",
  verifyUrl: "https://www.linkedin.com/in/ahmed-emad-nasr/",
}));

CERTIFICATION_METADATA[0] = { title: "eJPT v2", issuer: "INE", date: "2025", verifyUrl: "https://my.ine.com/" };
CERTIFICATION_METADATA[1] = { title: "CCNA 200-301", issuer: "Cisco", date: "2025", verifyUrl: "https://www.cisco.com/" };
CERTIFICATION_METADATA[2] = { title: "SOC Analyst Path L1/L2", issuer: "TryHackMe", date: "2025", verifyUrl: "https://tryhackme.com/" };
CERTIFICATION_METADATA[3] = { title: "DEPI Information Security Analyst", issuer: "DEPI", date: "2025", verifyUrl: "https://www.depi.gov.eg/" };
CERTIFICATION_METADATA[4] = { title: "HCIA Cloud & Datacom", issuer: "Huawei ICT Academy", date: "2024", verifyUrl: "https://www.huawei.com/minisite/ict-academy/en/" };

const LIGHTBOX_SLIDES = GALLERY_IMAGES.map((image, index) => ({
  src: image.src,
  title: CERTIFICATION_METADATA[index]?.title,
  description: `${CERTIFICATION_METADATA[index]?.issuer} • ${CERTIFICATION_METADATA[index]?.date}`,
}));

const ImageItem = memo(({ image, index, setOpen, meta }: ImageItemProps) => {
  const [thumbSrc, setThumbSrc] = useState(image.thumb);
  const handleClick = useCallback(() => setOpen(index), [setOpen, index]);

  return (
    <motion.div className={styles.art_pic} variants={itemVariants}>
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
          quality={75}
          className={styles.galleryImg}
          onError={() => setThumbSrc("Assets/art-gallery/Images/logo/My_Logo.webp")}
        />
      </button>
      {/* تم حذف الميتاداتا أسفل الشهادة */}
    </motion.div>
  );
});

ImageItem.displayName = "ImageItem";

const GallerySkeleton = memo(({ index }: GallerySkeletonProps) => (
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

  return (
    <section ref={sectionRef} className={styles["art-gallery-section"]} id="Certifications">
      <div className={styles.container}>
        <MotionInView className={styles["header-section"]} variants={sectionHeaderVariants}>
          <h2 className={styles.title}><span lang="ja">認定資格 •</span><span lang="en"> Certifications</span></h2>
        </MotionInView>
        {!shouldRenderGallery ? (
          <div className={styles.Gallery} aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <GallerySkeleton key={`gallery-skeleton-${index}`} index={index} />
            ))}
          </div>
        ) : null}
        {shouldRenderGallery ? (
          <MotionInView
            className={styles["art-gallery-content"]}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div className={styles.Gallery} variants={galleryVariants}>
              {GALLERY_IMAGES.map((image, i) => <ImageItem key={image.src} image={image} index={i} setOpen={setIndex} meta={CERTIFICATION_METADATA[i]} />)}
            </motion.div>
          </MotionInView>
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