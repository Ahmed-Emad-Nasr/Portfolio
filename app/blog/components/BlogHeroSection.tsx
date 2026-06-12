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

// --- Cyber Security Icons (Inline SVGs) ---
const TerminalIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px" }}>
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);

const FileLockIcon = () => (
  <svg width="28" height="28" fill="none" stroke="var(--main-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 0.5rem", display: "block" }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <rect x="8" y="12" width="8" height="6" rx="1"></rect>
    <path d="M10 12v-2a2 2 0 1 1 4 0v2"></path>
  </svg>
);

const RadarVideoIcon = () => (
  <svg width="28" height="28" fill="none" stroke="var(--main-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 0.5rem", display: "block" }}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <polygon points="10 8 16 11 10 14 10 8"></polygon>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="28" height="28" fill="none" stroke="var(--main-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 0.5rem", display: "block" }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="M9 12l2 2 4-4"></path>
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px" }}>
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px" }}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

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
        
        <p className={styles.kicker}>
          <TerminalIcon /> Ahmed Emad Nasr
        </p>
        
        <h1>Security Blog & Technical Reports & Case Studies & Research & Youtube Videos</h1>
        
        <p>
          A single place for my SOC incident reports, DFIR writeups, and technical videos.
          Use search and filters to find what you need quickly.
        </p>

        <div className={styles.heroGrid}>
          {/* الجانب الأيسر: المحتوى الأساسي والإحصائيات */}
          <div className={styles.heroMainContent}>
            
            {/* الكروت الخاصة بالإحصائيات (Metrics) مضاف إليها الأيقونات */}
            <div className={styles.metrics}>
              <article>
                <FileLockIcon />
                <strong>{resourceCount}</strong>
                <span>PDF Resources</span>
              </article>
              <article>
                <RadarVideoIcon />
                <strong>36</strong>
                <span>Total Videos</span>
              </article>
              <article>
                <ShieldCheckIcon />
                <strong>24/7</strong>
                <span>On-Demand</span>
              </article>
            </div>

            {/* أزرار اتخاذ الإجراء (Actions) مع الأيقونات */}
            <div className={styles.heroActions}>
              <a href="#blog-pdfs-title" className={styles.primaryAction}>
                <TargetIcon /> Explore Cases
              </a>
              <Link href="/" className={`${styles.secondaryAction} ${styles.backAction}`}>
                <ArrowLeftIcon /> Back To Portfolio
              </Link>
            </div>

            <nav className={styles.quickLinks} aria-label="Quick section shortcuts">
              <a href="#blog-pdfs-title" className={styles.quickLink}>PDF Cases</a>
              <a href="#blog-playlists-title" className={styles.quickLink}>Playlists</a>
              <a href="#youtube-hub-title" className={styles.quickLink}>Channel Videos</a>
            </nav>
          </div>

          {/* الجانب الأيمن: كارت الفيديو المميز */}
          <article className={`${styles.featuredCard} ${styles.heroFeaturedCard}`}>
            <div className={styles.featuredFrame}>
              {activeEmbeds["featured-video"] ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${featuredVideo.videoId}?autoplay=1`}
                  title={featuredVideo.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
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
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
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
            
            {/* المحتوى النصي الخاص بالفيديو */}
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