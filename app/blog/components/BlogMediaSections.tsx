import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import MotionInView from "@/app/core/components/MotionInView";
import styles from "../page.module.css";

const CENTERED_STYLE = { alignItems: "center", justifyContent: "center" };

export default function BlogMediaSections({
  totalCasesCount, casesWithScreenshotsCount, totalScreenshotAssets,
  filteredChannelVideos, filteredPlaylists, featuredVideo,
  activeEmbeds, onActivateEmbed, formatDate, youtubeChannelUrl,
}: any) {
  const hubRef = useRef<HTMLDivElement | null>(null);
  const [isHubReady, setIsHubReady] = useState(false);

  // Observer is actually good for performance to defer heavy media loads.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsHubReady(true); observer.disconnect(); }
    }, { rootMargin: "320px 0px" });
    if (hubRef.current) observer.observe(hubRef.current);
    return () => observer.disconnect();
  }, []);

  const shouldRenderHubMedia = isHubReady || (!filteredChannelVideos.length && !filteredPlaylists.length);

  return (
    <>
      <MotionInView className={styles.insightStrip}>
        <article className={styles.insightCard}><strong>{totalCasesCount}</strong><span>Total Cases</span></article>
        <article className={styles.insightCard}><strong>{casesWithScreenshotsCount}</strong><span>With Screenshots</span></article>
        <article className={styles.insightCard}><strong>{totalScreenshotAssets}</strong><span>Screenshot Assets</span></article>
      </MotionInView>

      <MotionInView className={styles.youtubeHub} variant="fade">
        <div ref={hubRef}>
          <div className={styles.blockHeading}>
            <h2 id="youtube-hub-title">YouTube Hub</h2>
            <p>All channel videos appear here in one place.</p>
          </div>
          <div className={styles.youtubeHubActions}>
            <a href={youtubeChannelUrl} target="_blank" className={`${styles.primaryAction} ${styles.channelAction}`}>Open YouTube Channel</a>
          </div>

          {!filteredChannelVideos.length ? (
            <p className={styles.emptyState}>No channel videos match your current search.</p>
          ) : shouldRenderHubMedia ? (
            <>
              <div className={styles.youtubeHubGrid}>
                {filteredChannelVideos.map((video: any) => (
                  <article key={video.videoId} className={styles.videoCard}>
                    <div className={styles.videoFrame}>
                      {activeEmbeds[`video-${video.videoId}`] ? (
                        <iframe src={`https://www.youtube-nocookie.com/embed/${video.videoId}`} loading="lazy" allowFullScreen />
                      ) : (
                        <button type="button" className={styles.embedPreview} onClick={() => onActivateEmbed(`video-${video.videoId}`)}>
                          <Image src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`} alt="Preview" width={480} height={270} loading="lazy" unoptimized />
                          <span className={styles.embedPlayButton}>▶ Play Video</span>
                        </button>
                      )}
                    </div>
                    <div className={styles.videoCardContent}>
                      <h3>{video.title}</h3>
                      {video.publishedAt && <p className={styles.videoDate}>{formatDate(video.publishedAt)}</p>}
                    </div>
                    <a href={video.sourceUrl} target="_blank" className={styles.playlistAction}>Watch on YouTube</a>
                  </article>
                ))}
              </div>

              <section className={styles.block}>
                <MotionInView className={styles.blockHeading}>
                  <h2 id="blog-playlists-title">YouTube Playlists</h2>
                </MotionInView>
                <div className={styles.playlistGrid}>
                  {filteredPlaylists.map((playlist: any) => (
                    <article key={playlist.playlistId} className={styles.playlistCard}>
                      <div className={styles.playlistFrame}>
                        {activeEmbeds[`playlist-${playlist.playlistId}`] ? (
                          <iframe src={`https://www.youtube-nocookie.com/embed/videoseries?list=${playlist.playlistId}`} loading="lazy" allowFullScreen />
                        ) : (
                          <button type="button" className={styles.embedPreview} onClick={() => onActivateEmbed(`playlist-${playlist.playlistId}`)}>
                            <Image src={`https://i.ytimg.com/vi/${playlist.thumbnailVideoId ?? featuredVideo.videoId}/hqdefault.jpg`} alt="Preview" width={480} height={270} loading="lazy" unoptimized />
                            <span className={styles.embedPlayButton}>▶ Play Playlist</span>
                          </button>
                        )}
                      </div>
                      <div className={styles.playlistContent}>
                        <h3>{playlist.title}</h3>
                        {playlist.description && <p className={styles.playlistDescription}>{playlist.description}</p>}
                      </div>
                      <a href={playlist.sourceUrl} target="_blank" className={styles.playlistAction}>Open Playlist</a>
                    </article>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <p className={styles.emptyState}>Loading Previews...</p>
          )}
        </div>
      </MotionInView>
    </>
  );
}