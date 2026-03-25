"use client";

/*
 * File: sensei-art.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render certifications gallery grid and lightbox viewer integration
 */

import { useCallback, useState, memo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import "yet-another-react-lightbox/styles.css";
import styles from "./sensei-art.module.css";
import MotionInView from "@/app/core/components/MotionInView";

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });

interface GalleryImage { src: string; thumb: string; }
interface ImageItemProps { image: GalleryImage; index: number; setOpen: (index: number) => void; }

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sectionHeaderVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE_OUT } },
};

const galleryVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.34, ease: EASE_OUT },
  },
};

const GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 24 }, (_, k) => ({
  src: `Assets/art-gallery/Images/image_display/${k + 1}.png`,
  thumb: `Assets/art-gallery/Images/image_display_thumb/${k + 1}.webp`,
}));

const LIGHTBOX_SLIDES = GALLERY_IMAGES.map((image) => ({ src: image.src }));

const ImageItem = memo(({ image, index, setOpen }: ImageItemProps) => {
  const handleClick = useCallback(() => setOpen(index), [setOpen, index]);

  return (
    <motion.div className={styles.art_pic} variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.7, ease: EASE_OUT }}>
      <Image
        src={image.thumb} alt={`Certification ${index + 1}`} width={350} height={350}
        sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, (max-width: 1199px) 33vw, 25vw"
        onClick={handleClick} loading="lazy" quality={75} className={styles.galleryImg}
      />
    </motion.div>
  );
});

ImageItem.displayName = "ImageItem";

const SenseiArt = memo(function SenseiArt() {
  const [index, setIndex] = useState(-1);
  const open = index >= 0;

  const handleCloseLightbox = useCallback(() => setIndex(-1), []);

  return (
    <section className={styles["art-gallery-section"]} id="Certifications">
      <div className={styles.container}>
        <MotionInView className={styles["header-section"]} variants={sectionHeaderVariants}>
          <h2 className={styles.title}><span lang="ja">認定資格 •</span><span lang="en"> Certifications</span></h2>
        </MotionInView>
        <MotionInView className={styles["art-gallery-content"]} variants={galleryVariants} threshold={0.02}>
          <motion.div className={styles.Gallery} variants={galleryVariants}>
            {GALLERY_IMAGES.map((image, i) => <ImageItem key={image.src} image={image} index={i} setOpen={setIndex} />)}
          </motion.div>
        </MotionInView>
      </div>
      <Lightbox
        slides={LIGHTBOX_SLIDES}
        open={open}
        index={index}
        close={handleCloseLightbox}
        animation={{ fade: 0, swipe: 0 }}
      />
    </section>
  );
});

export default SenseiArt;