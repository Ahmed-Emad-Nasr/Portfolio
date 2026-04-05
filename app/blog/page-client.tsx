"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import {
  blogFeaturedYoutubeVideo,
  blogYoutubePlaylists,
  blogYoutubeVideos,
  caseEvidenceLibrary,
  YOUTUBE_CHANNEL_URL,
} from "@/app/core/data";
import DesktopQuickCTA from "@/app/core/components/DesktopQuickCTA";
import MobileQuickActions from "@/app/core/components/MobileQuickActions";

type PdfResource = {
  id: string;
  title: string;
  platform: string;
  type: string;
  href: string;
};

const cvResource: PdfResource = {
  id: "soc-analyst-cv",
  title: "Ahmed Emad SOC Analyst CV",
  platform: "Professional Profile",
  type: "PDF CV",
  href: "Assets/cv/AhmedEmadNasr_CV.pdf",
};

const blogPdfResources: PdfResource[] = [cvResource, ...caseEvidenceLibrary];

const buildScreenshotRange = (
  folder: string,
  start: number,
  end: number,
  excluded: number[] = []
): string[] => {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
    .filter((number) => !excluded.includes(number))
    .map((number) => `Assets/Cases/${folder}/Screenshot (${number}).png`);
};

const caseScreenshotsByEvidenceId: Record<string, string[]> = {
  "ass6-mitre": [
    "Assets/Cases/ass_6/1.png",
    "Assets/Cases/ass_6/2.png",
    "Assets/Cases/ass_6/3.png",
    "Assets/Cases/ass_6/4.png",
  ],
  "soc127-pdf": buildScreenshotRange("SOC127", 131, 134),
  "soc205-pdf": buildScreenshotRange("SOC205", 154, 162),
  "soc257-pdf": buildScreenshotRange("SOC257", 135, 140),
  "soc274-pdf": buildScreenshotRange("SOC274", 122, 130),
  "soc282-pdf": buildScreenshotRange("SOC282", 144, 149),
  "soc326-report": buildScreenshotRange("SOC326", 100, 121),
  "soc336-report": buildScreenshotRange("SOC336", 165, 178, [169]),
  "soc338-pdf": buildScreenshotRange("SOC338", 83, 90),
  "soc342-pdf": buildScreenshotRange("SOC342", 91, 99),
  "email-analysis-room-report": [
    "Assets/Cases/Email_Analysis_Room/1.png",
    "Assets/Cases/Email_Analysis_Room/2.png",
    "Assets/Cases/Email_Analysis_Room/3.png",
    "Assets/Cases/Email_Analysis_Room/4.png",
    "Assets/Cases/Email_Analysis_Room/5.png",
    "Assets/Cases/Email_Analysis_Room/6.png",
    "Assets/Cases/Email_Analysis_Room/7.png",
    "Assets/Cases/Email_Analysis_Room/8.png",
    "Assets/Cases/Email_Analysis_Room/9.png",
    "Assets/Cases/Email_Analysis_Room/10.png",
  ],
};

const normalizePublicHref = (href: string): string => {
  if (typeof window === "undefined") return href;
  if (/^https?:\/\//i.test(href)) return href;

  const path = window.location.pathname;
  const scopePrefix =
    path.startsWith("/Portfolio/") || path === "/Portfolio" ? "/Portfolio" : "";

  const normalized = href.startsWith("/") ? href : `/${href}`;
  return encodeURI(`${scopePrefix}${normalized}`);
};

const formatDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const matchesSearch = (value: string, query: string): boolean =>
  value.toLowerCase().includes(query.toLowerCase());

export default function BlogPageClient() {
  const [query, setQuery] = useState("");
  const [pdfFilter, setPdfFilter] = useState("All");

  const pdfTypeFilters = useMemo(() => {
    const uniqueTypes = Array.from(new Set(blogPdfResources.map((item) => item.type)));
    return ["All", ...uniqueTypes];
  }, []);

  const filteredPdfs = useMemo(() => {
    return blogPdfResources.filter((item) => {
      const typeMatches = pdfFilter === "All" || item.type === pdfFilter;
      const textMatches =
        matchesSearch(item.title, query) ||
        matchesSearch(item.platform, query) ||
        matchesSearch(item.type, query);

      return typeMatches && textMatches;
    });
  }, [pdfFilter, query]);

  const featuredVideo = blogFeaturedYoutubeVideo;

  const filteredVideos = useMemo(() => {
    return blogYoutubeVideos.filter((video) => {
      const isNotFeatured = video.videoId !== featuredVideo.videoId;
      const textMatches = matchesSearch(video.title, query);
      return isNotFeatured && textMatches;
    });
  }, [featuredVideo.videoId, query]);

  const filteredPlaylists = useMemo(() => {
    return blogYoutubePlaylists.filter((playlist) =>
      matchesSearch(playlist.title, query)
    );
  }, [query]);

  return (
    <main id="main-content" className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.heroGlow} aria-hidden="true" />
        <p className={styles.kicker}>Knowledge Hub</p>
        <h1>Blog, Reports, and Technical Videos</h1>
        <p>
          A single place for my PDF reports, assignments, and security videos.
          Use search and filters to find what you want quickly.
        </p>
        <div className={styles.metrics}>
          <article>
            <strong>{blogPdfResources.length}</strong>
            <span>PDF Resources</span>
          </article>
          <article>
            <strong>{blogYoutubeVideos.length + 1}</strong>
            <span>Total Videos</span>
          </article>
          <article>
            <strong>24/7</strong>
            <span>On-Demand Access</span>
          </article>
        </div>
        <div className={styles.heroActions}>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noreferrer"
            className={`${styles.primaryAction} ${styles.channelAction}`}
          >
            Open YouTube Channel
          </a>
          <Link
            href="/"
            className={`${styles.secondaryAction} ${styles.backAction}`}
          >
            Back To Portfolio
          </Link>
        </div>
      </section>

      <section className={styles.toolbar} aria-label="Blog filters and search">
        <div className={styles.searchWrap}>
          <label htmlFor="blog-search" className={styles.searchLabel}>
            Search in PDFs and Videos
          </label>
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, type, or topic..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterWrap}>
          <p className={styles.filterTitle}>PDF Filter</p>
          <div className={styles.filterButtons} role="tablist" aria-label="PDF type filters">
            {pdfTypeFilters.map((type) => {
              const isActive = type === pdfFilter;
              return (
                <button
                  key={type}
                  type="button"
                  className={isActive ? `${styles.filterButton} ${styles.activeFilter}` : styles.filterButton}
                  onClick={() => setPdfFilter(type)}
                  aria-pressed={isActive}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.featuredBlock} aria-labelledby="featured-video-title">
        <div className={styles.blockHeading}>
          <h2 id="featured-video-title">Featured Video</h2>
          <p>Your selected highlighted video.</p>
        </div>

        <article className={styles.featuredCard}>
          <div className={styles.featuredFrame}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${featuredVideo.videoId}`}
              title={featuredVideo.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className={styles.featuredContent}>
            <p className={styles.featuredTag}>Featured</p>
            <h3>{featuredVideo.title}</h3>
            <p>
              This is pinned as the main featured content for your blog.
            </p>
            <a href={featuredVideo.sourceUrl} target="_blank" rel="noreferrer">
              Watch on YouTube
            </a>
          </div>
        </article>
      </section>

      <section className={styles.block} aria-labelledby="blog-playlists-title">
        <div className={styles.blockHeading}>
          <h2 id="blog-playlists-title">YouTube Playlists</h2>
          <p>{filteredPlaylists.length} playlist(s) found.</p>
        </div>

        <div className={styles.playlistGrid}>
          {filteredPlaylists.map((playlist) => (
            <article key={playlist.playlistId} className={styles.playlistCard}>
              <div className={styles.playlistFrame}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/videoseries?list=${playlist.playlistId}`}
                  title={playlist.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <h3>{playlist.title}</h3>
              <a href={playlist.sourceUrl} target="_blank" rel="noreferrer">
                Open Playlist
              </a>
            </article>
          ))}
        </div>

        {filteredPlaylists.length === 0 ? (
          <p className={styles.emptyState}>No playlist results match your current search.</p>
        ) : null}
      </section>

      <section className={styles.block} aria-labelledby="blog-pdfs-title">
        <div className={styles.blockHeading}>
          <h2 id="blog-pdfs-title">PDF Library</h2>
          <p>{filteredPdfs.length} result(s) found.</p>
        </div>

        <div className={styles.pdfGrid}>
          {filteredPdfs.map((item) => {
            const href = normalizePublicHref(item.href);
            const screenshots = caseScreenshotsByEvidenceId[item.id] ?? [];
            const hasScreenshots = screenshots.length > 0;
            const primaryScreenshot = screenshots[0];
            const secondaryScreenshots = screenshots.slice(1, 5);
            const extraScreenshotsCount = Math.max(0, screenshots.length - 5);

            return (
              <article
                key={item.id}
                className={hasScreenshots ? `${styles.pdfCard} ${styles.caseCardLarge}` : styles.pdfCard}
              >
                <div className={styles.caseCardHead}>
                  <p className={styles.badge}>{item.type}</p>
                  {hasScreenshots ? (
                    <span className={styles.shotCount}>{screenshots.length} screenshots</span>
                  ) : null}
                </div>
                <h3>{item.title}</h3>
                <p>{item.platform}</p>

                {primaryScreenshot ? (
                  <div className={styles.screenshotArea}>
                    <a
                      href={normalizePublicHref(primaryScreenshot)}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.primaryShot}
                      aria-label={`Open main screenshot for ${item.title}`}
                    >
                      <Image
                        src={normalizePublicHref(primaryScreenshot)}
                        alt={`${item.title} main screenshot`}
                        fill
                        sizes="(max-width: 560px) 100vw, (max-width: 991px) 70vw, 40vw"
                        loading="lazy"
                      />
                    </a>

                    {secondaryScreenshots.length > 0 ? (
                      <div className={styles.shotGrid}>
                        {secondaryScreenshots.map((shot, index) => (
                          <a
                            key={`${item.id}-shot-${shot}`}
                            href={normalizePublicHref(shot)}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.shotThumb}
                            aria-label={`Open screenshot ${index + 2} for ${item.title}`}
                          >
                            <Image
                              src={normalizePublicHref(shot)}
                              alt={`${item.title} screenshot ${index + 2}`}
                              fill
                              sizes="(max-width: 560px) 45vw, 18vw"
                              loading="lazy"
                            />
                          </a>
                        ))}
                        {extraScreenshotsCount > 0 ? (
                          <span className={styles.moreShotsBadge}>+{extraScreenshotsCount}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className={styles.cardActions}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.viewAction}
                  >
                    View PDF
                  </a>
                  <a href={href} download className={styles.downloadAction}>
                    Download
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {filteredPdfs.length === 0 ? (
          <p className={styles.emptyState}>No PDF results match your current search/filter.</p>
        ) : null}
      </section>

      <section className={styles.block} aria-labelledby="blog-videos-title">
        <div className={styles.blockHeading}>
          <h2 id="blog-videos-title">YouTube Videos</h2>
          <p>{filteredVideos.length} result(s) found.</p>
        </div>

        <div className={styles.videoGrid}>
          {filteredVideos.map((video) => (
            <article key={video.videoId} className={styles.videoCard}>
              <div className={styles.videoFrame}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
                  title={video.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <h3>{video.title}</h3>
              <p>{formatDate(video.publishedAt)}</p>
            </article>
          ))}
        </div>

        {filteredVideos.length === 0 ? (
          <p className={styles.emptyState}>No video results match your current search.</p>
        ) : null}
      </section>

      <DesktopQuickCTA />
      <MobileQuickActions />
    </main>
  );
}
