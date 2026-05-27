"use client";

import Image from "next/image";
import Link from "next/link";
import { type Dispatch, type SetStateAction } from "react";
import MotionInView from "@/app/core/components/MotionInView";
import styles from "../page.module.css";

type FeaturedVideo = {
  videoId: string;
  title: string;
  description?: string;
  sourceUrl: string;
};

type BlogHeroSectionProps = {
  leadCaseTitle: string | null;
  resourceCount: number;
  featuredVideo: FeaturedVideo;
  featuredPosterSrc: string;
  setFeaturedPosterSrc: Dispatch<SetStateAction<string>>;
  activeEmbeds: Record<string, boolean>;
  onActivateEmbed: (key: string) => void;
};

export default function BlogHeroSection({
  leadCaseTitle,
  resourceCount,
  featuredVideo,
  featuredPosterSrc,
  setFeaturedPosterSrc,
  activeEmbeds,
  onActivateEmbed,
}: BlogHeroSectionProps) {
  return (
    <section className={styles.hero}>
      <MotionInView className={styles.heroInner}>
        <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>Portfolio</Link>
          <span aria-hidden="true" className={styles.breadcrumbSeparator}>/</span>
          <Link href="/blog" className={styles.breadcrumbLink}>Blog</Link>
          <span aria-hidden="true" className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{leadCaseTitle ?? "Cases"}</span>
        </nav>
        <span className={styles.heroGlow} aria-hidden="true" />
        <p className={styles.kicker}>Ahmed Emad Nasr</p>
        <h1>Security Blog & Technical Reports & Case Studies & Research & Youtube Videos</h1>
        <p>
          A single place for my SOC incident reports, DFIR writeups, and technical videos.
          Use search and filters to find what you need quickly.
        </p>

        <div className={styles.heroGrid}>
          <div className={styles.heroMainContent}>
            <div className={styles.metrics}>
              <article>
                <strong>{resourceCount}</strong>
                <span>PDF Resources</span>
              </article>
              <article>
                <strong>36</strong>
                <span>Total Videos</span>
              </article>
              <article>
                <strong>24/7</strong>
                <span>On-Demand</span>
              </article>
            </div>

            <div className={styles.heroActions}>
              <a href="#blog-pdfs-title" className={styles.primaryAction}>
                Explore Cases
              </a>
              <Link href="/" className={`${styles.secondaryAction} ${styles.backAction}`}>
                Back To Portfolio
              </Link>
            </div>

            <nav className={styles.quickLinks} aria-label="Quick section shortcuts">
              <a href="#blog-pdfs-title" className={styles.quickLink}>PDF Cases</a>
              <a href="#blog-playlists-title" className={styles.quickLink}>Playlists</a>
              <a href="#youtube-hub-title" className={styles.quickLink}>Channel Videos</a>
            </nav>
          </div>

          <article className={`${styles.featuredCard} ${styles.heroFeaturedCard}`}>
            <div className={styles.featuredFrame}>
              {activeEmbeds["featured-video"] ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${featuredVideo.videoId}`}
                  title={featuredVideo.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  className={styles.embedPreview}
                  onClick={() => onActivateEmbed("featured-video")}
                  aria-label={`Play ${featuredVideo.title}`}
                >
                  <Image
                    src={featuredPosterSrc}
                    alt={featuredVideo.title}
                    className={styles.embedPreviewImage}
                    width={480}
                    height={270}
                    loading="lazy"
                    decoding="async"
                    unoptimized
                    onError={() => {
                      if (featuredPosterSrc.includes("maxresdefault")) {
                        setFeaturedPosterSrc(`https://i.ytimg.com/vi/${featuredVideo.videoId}/hqdefault.jpg`);
                        return;
                      }

                      if (featuredPosterSrc.includes("hqdefault")) {
                        setFeaturedPosterSrc(`https://i.ytimg.com/vi/${featuredVideo.videoId}/mqdefault.jpg`);
                        return;
                      }

                      setFeaturedPosterSrc("/Assets/art-gallery/Images/logo/My_Logo.webp");
                    }}
                  />
                  <span className={styles.embedPlayButton}>▶ Play</span>
                </button>
              )}
            </div>
            <div className={styles.featuredContent}>
              <p className={styles.featuredTag}>Featured Video</p>
              <h2>{featuredVideo.title}</h2>
              <a href={featuredVideo.sourceUrl} target="_blank" rel="noopener noreferrer">
                Watch on YouTube ↗
              </a>
            </div>
          </article>
        </div>
      </MotionInView>
    </section>
  );
}
