import Image from "next/image";
import MotionInView from "@/app/core/components/MotionInView";
import styles from "../page.module.css";
import type { ChannelVideo } from "../blog-types";

type FeaturedVideo = {
  videoId: string;
  title: string;
  description?: string;
  sourceUrl: string;
};

type BlogMediaSectionsProps = {
  totalCasesCount: number;
  casesWithScreenshotsCount: number;
  totalScreenshotAssets: number;
  filteredChannelVideos: ChannelVideo[];
  filteredPlaylists: Array<{
    playlistId: string;
    title: string;
    description?: string;
    sourceUrl: string;
    thumbnailVideoId?: string;
    tags?: readonly string[];
    videoCount?: number;
  }>;
  featuredVideo: FeaturedVideo;
  activeEmbeds: Record<string, boolean>;
  onActivateEmbed: (key: string) => void;
  formatDate: (value: string) => string;
  youtubeChannelUrl: string;
};

export default function BlogMediaSections({
  totalCasesCount,
  casesWithScreenshotsCount,
  totalScreenshotAssets,
  filteredChannelVideos,
  filteredPlaylists,
  featuredVideo,
  activeEmbeds,
  onActivateEmbed,
  formatDate,
  youtubeChannelUrl,
}: BlogMediaSectionsProps) {
  return (
    <>
      <MotionInView className={styles.insightStrip} aria-label="Case library highlights">
        <article className={styles.insightCard}>
          <strong>{totalCasesCount}</strong>
          <span>Total Cases</span>
        </article>
        <article className={styles.insightCard}>
          <strong>{casesWithScreenshotsCount}</strong>
          <span>With Screenshots</span>
        </article>
        <article className={styles.insightCard}>
          <strong>{totalScreenshotAssets}</strong>
          <span>Screenshot Assets</span>
        </article>
      </MotionInView>

      <MotionInView className={styles.youtubeHub} aria-labelledby="youtube-hub-title" variant="fade">
        <div className={styles.blockHeading}>
          <h2 id="youtube-hub-title">YouTube Hub</h2>
          <p>All channel videos appear here in one place, including the featured video.</p>
        </div>
        <p className={styles.youtubeHubSummary}>{filteredChannelVideos.length} video(s) available.</p>
        <div className={styles.youtubeHubActions}>
          <a href={youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className={`${styles.primaryAction} ${styles.channelAction}`}>
            Open YouTube Channel
          </a>
        </div>

        <div className={styles.youtubeHubGrid}>
          {filteredChannelVideos.map((video) => (
            <article key={`hub-video-${video.videoId}`} className={styles.videoCard}>
              <div className={styles.videoFrame}>
                {activeEmbeds[`video-${video.videoId}`] ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <button
                    type="button"
                    className={styles.embedPreview}
                    onClick={() => onActivateEmbed(`video-${video.videoId}`)}
                    aria-label={`Play ${video.title}`}
                  >
                    <Image
                      src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
                      alt={video.title}
                      className={styles.embedPreviewImage}
                      width={480}
                      height={270}
                      loading="lazy"
                      decoding="async"
                      unoptimized
                    />
                    <span className={styles.embedPlayButton}>▶ Play Video</span>
                  </button>
                )}
              </div>
              <div className={styles.videoCardContent}>
                <h3>{video.title}</h3>
                {video.publishedAt && <p className={styles.videoDate}>{formatDate(video.publishedAt)}</p>}
              </div>
              <a href={video.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.playlistAction}>
                Watch on YouTube
              </a>
            </article>
          ))}
        </div>

        {filteredChannelVideos.length === 0 && (
          <p className={styles.emptyState}>No channel videos match your current search.</p>
        )}
      </MotionInView>

      <section className={styles.block} aria-labelledby="blog-playlists-title">
        <MotionInView className={styles.blockHeading}>
          <h2 id="blog-playlists-title">YouTube Playlists</h2>
          <p>{filteredPlaylists.length} playlist(s) found.</p>
        </MotionInView>
        <div className={styles.playlistGrid}>
          {filteredPlaylists.map((playlist) => (
            <article key={playlist.playlistId} className={styles.playlistCard}>
              <div className={styles.playlistFrame}>
                {activeEmbeds[`playlist-${playlist.playlistId}`] ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/videoseries?list=${playlist.playlistId}`}
                    title={playlist.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <button
                    type="button"
                    className={styles.embedPreview}
                    onClick={() => onActivateEmbed(`playlist-${playlist.playlistId}`)}
                    aria-label={`Play ${playlist.title}`}
                  >
                    <Image
                      src={`https://i.ytimg.com/vi/${playlist.thumbnailVideoId ?? featuredVideo.videoId}/hqdefault.jpg`}
                      alt={playlist.title}
                      className={styles.embedPreviewImage}
                      width={480}
                      height={270}
                      loading="lazy"
                      decoding="async"
                      unoptimized
                    />
                    <span className={styles.embedPlayButton}>▶ Play Playlist</span>
                  </button>
                )}
              </div>
              <div className={styles.playlistContent}>
                <h3>{playlist.title}</h3>
                {playlist.description && <p className={styles.playlistDescription}>{playlist.description}</p>}
                {playlist.tags && playlist.tags.length > 0 && (
                  <div className={styles.playlistTags}>
                    {playlist.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className={styles.playlistTag}>{tag}</span>
                    ))}
                  </div>
                )}
                {playlist.videoCount && <p className={styles.playlistVideoCount}>{playlist.videoCount} videos</p>}
              </div>
              <a href={playlist.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.playlistAction}>
                Open Playlist
              </a>
            </article>
          ))}
        </div>
        {filteredPlaylists.length === 0 && (
          <p className={styles.emptyState}>No playlist results match your current search.</p>
        )}
      </section>
    </>
  );
}
