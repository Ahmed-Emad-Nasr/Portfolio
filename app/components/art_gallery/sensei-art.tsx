"use client";
import { useCallback, useMemo, useState, memo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { type Variants, motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "yet-another-react-lightbox/styles.css";
import styles from "./sensei-art.module.css";

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });

interface GalleryImage { src: string; thumb: string; }
interface ImageItemProps { image: GalleryImage; index: number; setOpen: (index: number) => void; }

const GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 24 }, (_, k) => ({
  src: `Assets/art-gallery/Images/image_display/${k + 1}.png`,
  thumb: `Assets/art-gallery/Images/image_display_thumb/${k + 1}.webp`,
}));

const LIGHTBOX_SLIDES = GALLERY_IMAGES.map((image) => ({ src: image.src }));

// تم توحيد الـ Ease ليكون ناعم ومريح (Expo Out)
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]; 

const ImageItem = memo(({ image, index, setOpen }: ImageItemProps) => {
  const handleClick = useCallback(() => setOpen(index), [setOpen, index]);

  return (
    <div className={styles.art_pic}>
      <Image
        src={image.thumb} alt={`Art piece ${index + 1}`} width={350} height={350}
        sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, (max-width: 1199px) 33vw, 25vw"
        onClick={handleClick} loading="lazy" quality={75} className={styles.galleryImg}
      />
    </div>
  );
});

ImageItem.displayName = "ImageItem";

const SenseiArt = memo(function SenseiArt() {
  const [index, setIndex] = useState(-1);
  const open = index >= 0;

  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [galleryRef, galleryInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const prefersReducedMotion = useReducedMotion();

  const headerVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : -20 },
    // تم تعديل الـ duration إلى 0.8s
    visible: { opacity: 1, y: 0, transition: prefersReducedMotion ? { duration: 0.2 } : { duration: 0.8, ease: EASE } },
  }), [prefersReducedMotion]);

  const galleryVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: prefersReducedMotion ? { duration: 0.2 } : { duration: 0.8, ease: EASE } },
  }), [prefersReducedMotion]);

  const handleCloseLightbox = useCallback(() => setIndex(-1), []);

  return (
    <section className={styles["art-gallery-section"]} id="ArtGallery">
      <div className={styles.container}>
        <motion.div ref={headerRef} className={styles["header-section"]} initial="hidden" animate={headerInView ? "visible" : "hidden"} variants={headerVariants}>
          <h2 className={styles.title}><span lang="ja">画廊 •</span><span lang="en"> Art Gallery</span></h2>
        </motion.div>
        <motion.div ref={galleryRef} className={styles["art-gallery-content"]} initial="hidden" animate={galleryInView ? "visible" : "hidden"} variants={galleryVariants}>
          <div className={styles.Gallery}>
            {GALLERY_IMAGES.map((image, i) => <ImageItem key={image.src} image={image} index={i} setOpen={setIndex} />)}
          </div>
        </motion.div>
      </div>
      <Lightbox slides={LIGHTBOX_SLIDES} open={open} index={index} close={handleCloseLightbox} />
    </section>
  );
});

export default SenseiArt;