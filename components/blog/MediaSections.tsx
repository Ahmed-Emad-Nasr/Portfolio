"use client";

/*
 * MediaSections — the library's numbers and the YouTube hub (#videos).
 * Videos show a thumbnail first; the youtube-nocookie iframe mounts only
 * after a click (see the privacy page).
 */

import { memo, useCallback, useState } from "react";
import Image from "next/image";
import { Play, ExternalLink, ListVideo, ChevronDown, FileText } from "lucide-react";
import { TiltCard } from "@/components/ui/Motion";
import { CountUp } from "@/components/ui/CountUp";
import SectionHeader from "@/components/ui/SectionHeader";
import { Youtube } from "@/components/ui/BrandIcons";
import { formatDate, normalizePublicHref, YOUTUBE_CHANNEL_URL, type ChannelVideo } from "@/lib/shared";
import { blogFeaturedYoutubeVideo, blogYoutubePlaylists as playlists, blogYoutubeVideos } from "@/data/youtube";
import { libraryCounts } from "@/lib/library-data";
import { CounterBadge, KanjiWatermark, btnOutline } from "@/components/ui/kit";
import FadeIn from "@/components/ui/FadeIn";
import BilingualNote from "@/components/ui/BilingualNote";

const VIDEO_PAGE = 6;

/* The featured video first, then the rest newest first */
const videos: ChannelVideo[] = [
  blogFeaturedYoutubeVideo,
  ...[...blogYoutubeVideos]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((v) => ({ ...v, sourceUrl: `https://youtu.be/${v.videoId}` })),
];

const stats = [
  { value: libraryCounts.total, label: "Total cases", japanese: "事件" },
  { value: libraryCounts.withScreenshots, label: "With screenshots", japanese: "証拠" },
  { value: libraryCounts.screenshots, label: "Screenshot assets", japanese: "画像" },
];

const Embed = memo(function Embed({
  id,
  src,
  thumb,
  title,
  label,
  active,
  onActivate,
}: {
  id: string;
  src: string;
  thumb: string;
  title: string;
  label: string;
  active: boolean;
  onActivate: (key: string) => void;
}) {
  return (
    <div className="relative aspect-video overflow-hidden border-b border-foreground/5 bg-background">
      {active ? (
        <iframe src={src} title={title} loading="lazy" allowFullScreen className="absolute inset-0 h-full w-full" />
      ) : (
        <button type="button" onClick={() => onActivate(id)} className="group/play absolute inset-0 block h-full w-full" aria-label={`${label}: ${title}`}>
          <Image
            src={thumb}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            unoptimized
            className="object-cover grayscale group-hover/play:grayscale-0 group-hover/play:scale-105 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply group-hover/play:bg-transparent transition-all duration-700" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-5 py-3 bg-primary text-white font-mono text-[0.625rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-transform duration-300 group-hover/play:scale-105">
            <Play size={13} fill="currentColor" /> {label}
          </span>
        </button>
      )}
    </div>
  );
});

export default function MediaSections() {
  const [visible, setVisible] = useState(VIDEO_PAGE);
  /* Which embeds were clicked (the iframe replaces the thumbnail) */
  const [activeEmbeds, setActiveEmbeds] = useState<Record<string, boolean>>({});
  const onActivateEmbed = useCallback((key: string) => {
    setActiveEmbeds((c) => ({ ...c, [key]: true }));
  }, []);

  return (
    <>
      {/* Numbers strip */}
      <section aria-label="Library in numbers" className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-foreground/10 bg-surface/50 backdrop-blur-md divide-y sm:divide-y-0 sm:divide-x divide-foreground/5">
          {stats.map((s, i) => (
            <FadeIn y={16} duration={0.55} delay={i * 0.07} key={s.label} className="px-6 py-5 flex items-center gap-4">
              <span className="font-mono text-xl md:text-2xl font-black text-accent tabular-nums">
                <CountUp target={s.value} />
              </span>
              <span className="flex flex-col">
                <span className="font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">{s.label}</span>
                <span className="jp-eyebrow text-[0.5625rem] text-foreground/25" lang="ja" aria-hidden="true" data-jp={s.japanese} />
              </span>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* YouTube hub */}
      <section id="youtube" className="relative py-24 md:py-32 overflow-hidden" aria-label="YouTube hub">
        <KanjiWatermark chars="動画" side="right" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-8">
            <SectionHeader
              eyebrow="YouTube // On the channel"
              japanese="動画"
              titleA="Watch &"
              titleB="Learn."
              description="Arabic walkthroughs and labs from the channel — SIEM, malware analysis, web security and GRC basics, all in one place."
            />
            <div className="mb-16 md:mb-20 flex flex-col items-start gap-4">
              <CounterBadge value={videos.length} top="Videos" bottom="Indexed" />
              <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className={btnOutline}>
                <Youtube size={13} /> Open the channel
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.slice(0, visible).map((video, idx) => (
                <FadeIn y={32} duration={0.7} delay={(idx % 3) * 0.1} key={video.videoId} className="flex">
                  <TiltCard className="spotlight group relative w-full flex flex-col bg-surface/60 border border-foreground/5 hover:border-primary/40 transition-colors duration-500 overflow-hidden">
                    <div className="absolute top-0 left-0 z-10 w-full h-[2px] bg-gradient-to-r from-primary via-primary/40 to-transparent opacity-70" aria-hidden="true" />
                    <Embed
                      id={`video-${video.videoId}`}
                      src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
                      thumb={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
                      title={video.title}
                      label="Play"
                      active={Boolean(activeEmbeds[`video-${video.videoId}`])}
                      onActivate={onActivateEmbed}
                    />
                    <div className="flex flex-col flex-1 p-6">
                      <span className="flex items-center gap-3 mb-2">
                        <span className="px-1.5 py-0.5 border border-accent/40 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.2em] text-accent" title="Narrated in Arabic">
                          AR
                        </span>
                        {video.publishedAt && (
                          <span className="font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-tertiary">
                            {formatDate(video.publishedAt)}
                          </span>
                        )}
                      </span>
                      <h3 className="font-display text-lg font-black uppercase tracking-tight text-foreground leading-tight mb-5">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="mb-5 text-sm text-foreground/60 font-light leading-relaxed">{video.description}</p>
                      )}
                      {video.tags && video.tags.length > 0 && (
                        <ul className="mb-6 flex flex-wrap gap-2" aria-label={`${video.title} topics`}>
                          {video.tags.slice(0, 6).map((tag) => (
                            <li key={tag} className="px-2 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-tertiary bg-tertiary/10 border border-tertiary/20">
                              {tag}
                            </li>
                          ))}
                        </ul>
                      )}
                      <BilingualNote label="شرح عربي // AR">
                        {video.tags && video.tags.length > 0
                          ? `شرح تطبيقي باللغة العربية يتناول ${video.tags.slice(0, 3).join(" و")} مع خطوات الإعداد والتحليل العملي.`
                          : "شرح عملي باللغة العربية يوضح خطوات الإعداد والتطبيق والتحليل الأمني بالتفصيل."}
                      </BilingualNote>
                      <div className="mt-auto pt-5 flex flex-wrap gap-3">
                        <a href={video.sourceUrl} target="_blank" rel="noopener noreferrer" className={`${btnOutline} w-fit`}>
                          <ExternalLink size={13} /> Watch on YouTube
                        </a>
                        {video.caseId && (
                          <a href={normalizePublicHref(`/blog/${video.caseId}`)} className={`${btnOutline} w-fit`}>
                            <FileText size={13} /> The case
                          </a>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                </FadeIn>
              ))}
          </div>

          {visible < videos.length && (
            <div className="mt-14 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((n) => Math.min(videos.length, n + VIDEO_PAGE))}
                className="group flex items-center gap-3 px-8 py-4 border border-foreground/15 border-l-2 border-l-primary bg-foreground/[0.02] backdrop-blur-md text-foreground font-mono font-bold uppercase tracking-widest text-sm transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:-translate-y-0.5 active:translate-y-0"
              >
                <ChevronDown size={14} className="text-primary-ink transition-transform duration-300 group-hover:translate-y-0.5" />
                Show more
                <span className="font-mono text-[0.625rem] text-foreground/60 tabular-nums">
                  {visible}/{videos.length}
                </span>
              </button>
            </div>
          )}

          {playlists.length > 0 && (
            <div className="mt-24">
              <div className="mb-10 flex flex-wrap items-center gap-4">
                <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
                <h3 id="blog-playlists-title" className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">
                  Playlists
                </h3>
                <span className="brush-jp text-lg text-foreground/30" lang="ja" aria-hidden="true" data-jp="連続" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {playlists.map((playlist, idx) => (
                  <FadeIn
                    y={24}
                    duration={0.65}
                    delay={idx * 0.08}
                    key={playlist.playlistId}
                    className="group spotlight spotlight-blue relative bg-surface/60 border border-foreground/5 hover:border-tertiary/50 transition-colors duration-500 flex flex-col overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 z-10 w-full h-[2px] bg-tertiary/0 group-hover:bg-tertiary transition-colors duration-500" aria-hidden="true" />
                    <Embed
                      id={`playlist-${playlist.playlistId}`}
                      src={`https://www.youtube-nocookie.com/embed/videoseries?list=${playlist.playlistId}`}
                      thumb={`https://i.ytimg.com/vi/${playlist.thumbnailVideoId ?? blogFeaturedYoutubeVideo.videoId}/hqdefault.jpg`}
                      title={playlist.title}
                      label="Play playlist"
                      active={Boolean(activeEmbeds[`playlist-${playlist.playlistId}`])}
                      onActivate={onActivateEmbed}
                    />
                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h4 className="font-display text-lg font-black uppercase tracking-tight text-foreground group-hover:text-tertiary transition-colors duration-300">
                          {playlist.title}
                        </h4>
                        <ListVideo size={14} className="shrink-0 text-foreground/25 group-hover:text-tertiary transition-colors duration-300" />
                      </div>
                      {playlist.description && (
                        <p className="text-sm text-foreground/60 font-light leading-relaxed mb-5 line-clamp-3">{playlist.description}</p>
                      )}
                      <div className="mb-5 flex flex-wrap items-center gap-2">
                        {playlist.videoCount && (
                          <span className="px-2 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-accent bg-accent/10 border border-accent/20">
                            {playlist.videoCount} videos
                          </span>
                        )}
                        {playlist.tags?.slice(0, 4).map((tag) => (
                          <span key={tag} className="px-2 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-foreground/60 bg-foreground/[0.04] border border-foreground/10">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <BilingualNote label="سلسلة تعليمية // AR">
                        {`سلسلة دروس عربية متكاملة (${playlist.videoCount ?? 5} فيديوهات) لتعلم وتطبيق ${playlist.title} عملياً خطوة بخطوة.`}
                      </BilingualNote>
                      <a href={playlist.sourceUrl} target="_blank" rel="noopener noreferrer" className={`${btnOutline} mt-auto pt-5 w-fit`}>
                        <ExternalLink size={13} /> Open playlist
                      </a>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
