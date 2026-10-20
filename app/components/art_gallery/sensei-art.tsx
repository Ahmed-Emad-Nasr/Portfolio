"use client";

import React, { useState, memo, type ReactNode } from "react";
import Image from "next/image";
import styles from "./sensei-art.module.css";
import Reveal, { RevealGroup } from "@/app/core/components/Reveal";
import Spotlight from "@/app/core/components/Spotlight";
import {
  GALLERY_IMAGE_COUNT,
  certificationAlt,
} from "@/app/core/config/certifications";

// Paths are RELATIVE on purpose. This project does not set Next's `basePath`;
// it handles the /Portfolio sub-path manually. On GitHub Pages the homepage is
// served at /Portfolio/, so a relative "Assets/..." resolves to
// /Portfolio/Assets/... correctly. Do NOT add a leading slash here — that
// would resolve to the domain root and 404 in production.
/*
 * `src` used to point at Assets/art-gallery/Images/image_display/ — and that folder
 * **doesn't exist in public/ at all**. Only image_display_thumb exists.
 *
 * The component shows the thumb by default and falls back to src on error, so the wall
 * looked fine and the problem wasn't visible — but the fallback was a dead path: as soon as
 * any thumb failed, the fallback returned a 404 too.
 *
 * Now both point at the same existing folder. If you upload the full-size images
 * later, restore the image_display path here and it will work right away.
 */
const GALLERY_IMAGES = Array.from({ length: GALLERY_IMAGE_COUNT }, (_, k) => ({
  n: k + 1,
  src: `Assets/art-gallery/Images/image_display_thumb/${k + 1}.webp`,
  thumb: `Assets/art-gallery/Images/image_display_thumb/${k + 1}.webp`,
  alt: certificationAlt(k + 1),
}));

type GalleryImage = (typeof GALLERY_IMAGES)[number];

const ImageItem = memo(({
  image,
  style,
}: {
  image: GalleryImage;
  /* Comes from RevealGroup — it sets --i on it for the staggering in the CSS */
  style?: React.CSSProperties;
}) => {
  const [failed, setFailed] = useState(false);

  return (
    /*
     * The MotionInView wrapper was removed from here.
     *
     * Every image used to wrap itself in MotionInView — meaning an IntersectionObserver
     * per image, and a subscription to the framer-motion engine per image. The gallery renders
     * up to 50 images.
     *
     * Now a RevealGroup on the grid observes only the container, and the staggering happens
     * in the CSS via --i. One observer entry instead of fifty.
     *
     * `style` comes from RevealGroup — it sets --i on it.
     */
    <div className={styles.art_pic} style={style} data-fx="card" data-card="tight">
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
          sizes="(max-width: 768px) 100vw, (max-width: 992px) 50vw, 25vw"
          loading="lazy"
          decoding="async"
          className={styles.galleryImg}
          onError={() => setFailed(true)}
        />
    </div>
  );
});

ImageItem.displayName = "ImageItem";

/*
 * `credentials` arrives pre-rendered from page.tsx (a Server Component).
 *
 * Reason: credentials.tsx reads certifications + skills + achievements
 * (~11.7 KB). Importing it from here would turn it into a client component
 * and bundle that data into the home page bundle. Exactly the same pattern used with
 * AttackMatrix.
 */
type SenseiArtProps = { credentials?: ReactNode };

const SenseiArt = memo(function SenseiArt({ credentials }: SenseiArtProps) {
  const [visibleCount, setVisibleCount] = useState(6);

  return (
    <section className={styles["art-gallery-section"]} id="Certifications">
      <div data-fx="container" data-container="full">
        {/*
          The big «認定資格 • Certifications» heading used to be here and was removed.

          It repeated the same word twice in a row: the big section heading, and directly below it
          the <h3>Certifications</h3> of the first block in credentials.

          Certifications, achievements and skills as readable data, above the image wall.
          The image wall alone said "I have things" without saying what.
        */}
        {credentials}

        <div className={styles["art-gallery-content"]}>
          <Spotlight>
            <RevealGroup className={styles.Gallery} variant="scale" staggerMs={50}>
              {GALLERY_IMAGES.slice(0, visibleCount).map((image) => (
                <ImageItem key={image.src} image={image} />
              ))}
            </RevealGroup>
          </Spotlight>

          {visibleCount < GALLERY_IMAGES.length && (
            /* delay is now in milliseconds, not seconds — 0.1 used to mean 100ms */
            <Reveal className={styles.galleryActions} variant="fade" delay={100}>
              <button
                type="button"
                data-fx="btn" data-btn="ghost" data-tone="main"
                onClick={() => setVisibleCount((n) => Math.min(GALLERY_IMAGES.length, n + 3))}
              >
                Show more
              </button>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
});

export default SenseiArt;