/*
 * PostArticle — one written post (/blog/<slug>), server-rendered.
 *
 *   reading-progress bar (pure CSS, scroll-driven — globals.css)
 *   header: back link, series / tags, title (morphs from the card it was
 *           opened from — React <ViewTransition>), dek, date, reading time
 *   body:   the MDX, with a sticky table of contents beside it on desktop
 *           and a collapsible one above it on smaller screens
 *   after:  share, the series, previous / next, related posts, comments,
 *           and who wrote it
 *
 * An Arabic post (lang: ar) is laid out right-to-left: the text, the TOC
 * column and the arrows flip; code blocks stay left-to-right.
 */

import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowLeft, ArrowRight, Calendar, Clock, RefreshCw } from "lucide-react";
import type { Post, PostMeta } from "@/app/core/content/posts";
import { tagSlug } from "@/app/core/content/posts";
import { renderMdx } from "@/app/core/content/render-mdx";
import { postComponents } from "@/app/components/blog/mdx-components";
import PostToc from "@/app/components/blog/PostToc";
import ShareRow from "@/app/components/blog/ShareRow";
import Comments from "@/app/components/blog/Comments";
import PostCard from "@/app/components/blog/PostCard";
import { GISCUS } from "@/app/core/config/comments";
import { formatDate, normalizePublicHref } from "@/app/core/config/shared";
import { absoluteUrl } from "@/app/core/config/site";
import { KanjiWatermark, chipNeutral } from "@/app/components/shared/kit";

const T = {
  en: {
    back: "Blog",
    toc: "On this page",
    min: "min read",
    updated: "Updated",
    series: "Series",
    part: "Part",
    newer: "Newer",
    older: "Older",
    related: "Keep reading",
    by: "Written by",
    bio: "Information security officer — GRC, SOC, DFIR, IAM. Instructor at NTI and AMIT. Arabic security videos on YouTube.",
    hire: "Work with me",
    cv: "CV",
  },
  ar: {
    back: "المدونة",
    toc: "محتوى المقال",
    min: "دقائق قراءة",
    updated: "آخر تحديث",
    series: "السلسلة",
    part: "الجزء",
    newer: "الأحدث",
    older: "الأقدم",
    related: "اقرأ كمان",
    by: "كتبه",
    bio: "مسؤول أمن معلومات — GRC وSOC وDFIR وIAM. محاضر في NTI وAMIT، وبنزّل فيديوهات أمن معلومات بالعربي على يوتيوب.",
    hire: "اتواصل معايا",
    cv: "السيرة الذاتية",
  },
} as const;

type Neighbours = { newer: PostMeta | null; older: PostMeta | null; series: PostMeta[]; related: PostMeta[] };

export default async function PostArticle({ post, neighbours }: { post: Post; neighbours: Neighbours }) {
  const t = T[post.lang];
  const rtl = post.lang === "ar";
  const Back = rtl ? ArrowRight : ArrowLeft;
  const Fwd = rtl ? ArrowLeft : ArrowRight;
  const content = await renderMdx(post.source, postComponents);
  const url = absoluteUrl(`/blog/${post.slug}`);

  return (
    <article lang={post.lang} dir={rtl ? "rtl" : "ltr"} className="relative px-6 md:px-12 lg:px-20 pt-32 md:pt-40 pb-24">
      {/* Reading progress — a CSS scroll-timeline, no script */}
      <div className="read-progress" aria-hidden="true" />
      <KanjiWatermark chars="記録" side={rtl ? "left" : "right"} />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* ─── Header ─── */}
        <header className="max-w-3xl">
          <Link href="/blog#posts" className="group mb-10 inline-flex items-center gap-2 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.3em] text-primary-ink hover:text-foreground transition-colors">
            <Back size={14} className="transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1" aria-hidden="true" />
            {t.back}
          </Link>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            {post.draft && <span className="border border-primary px-2 py-1 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-primary-ink">Draft — not published</span>}
            {post.series && (
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-tertiary">
                {t.series}: {post.series}
                {post.seriesPart ? ` · ${t.part} ${post.seriesPart}` : ""}
              </span>
            )}
          </div>

          <ViewTransition name={`post-title-${post.slug}`} share="morph" default="none">
            <h1 className={`text-foreground [text-wrap:balance] ${rtl ? "post-title-ar text-4xl md:text-5xl font-bold leading-[1.25]" : "font-display text-4xl md:text-6xl font-black uppercase tracking-tight [word-spacing:0.12em] leading-[0.95]"}`}>
              {post.title}
            </h1>
          </ViewTransition>

          <p className="mt-6 max-w-2xl text-lg md:text-xl font-light leading-relaxed text-foreground/70 [text-wrap:pretty]">{post.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-foreground/10 py-4 font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-foreground/60">
            <span className="inline-flex items-center gap-2">
              <Calendar size={13} aria-hidden="true" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </span>
            {post.updated && (
              <span className="inline-flex items-center gap-2">
                <RefreshCw size={13} aria-hidden="true" />
                {t.updated} <time dateTime={post.updated}>{formatDate(post.updated)}</time>
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Clock size={13} aria-hidden="true" />
              {post.readTime} {t.min}
            </span>
            {post.tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5 normal-case tracking-normal" aria-label="Tags">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={`/blog/tag/${tagSlug(tag)}`} className={`${chipNeutral} inline-block hover:border-primary hover:text-foreground transition-colors`}>
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {post.cover && (
            // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimiser
            <img src={normalizePublicHref(post.cover)} alt="" className="mt-10 w-full border border-foreground/10" />
          )}
        </header>

        {/* ─── Body + table of contents ─── */}
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] xl:gap-20">
          <div className="min-w-0 max-w-3xl">
            <PostToc headings={post.headings} label={t.toc} variant="inline" />
            <div className="prose-post">{content}</div>

            <div className="mt-14 border-t border-foreground/10 pt-8">
              <ShareRow url={url} title={post.title} lang={post.lang} />
            </div>

            {/* The series, in order */}
            {neighbours.series.length > 1 && (
              <nav aria-label={t.series} className="mt-12 border border-foreground/10 bg-surface/50 p-6">
                <p className="mb-4 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.25em] text-tertiary">
                  {t.series}: {post.series}
                </p>
                <ol className="flex flex-col gap-2">
                  {neighbours.series.map((p, i) => (
                    <li key={p.slug} className="flex gap-3 text-sm">
                      <span className="font-mono text-foreground/65 tabular-nums">{String(p.seriesPart ?? i + 1).padStart(2, "0")}</span>
                      {p.slug === post.slug ? (
                        <span className="text-foreground" aria-current="page">{p.title}</span>
                      ) : (
                        <Link href={`/blog/${p.slug}`} className="text-foreground/70 hover:text-primary-ink transition-colors">{p.title}</Link>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Newer / older */}
            {(neighbours.newer || neighbours.older) && (
              <nav aria-label="More posts" className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {neighbours.older ? (
                  <Link href={`/blog/${neighbours.older.slug}`} className="group border border-foreground/10 p-5 transition-colors hover:border-primary/50">
                    <span className="mb-2 flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-foreground/65">
                      <Back size={12} aria-hidden="true" /> {t.older}
                    </span>
                    <span className="block font-medium text-foreground group-hover:text-primary-ink transition-colors">{neighbours.older.title}</span>
                  </Link>
                ) : <span />}
                {neighbours.newer && (
                  <Link href={`/blog/${neighbours.newer.slug}`} className="group border border-foreground/10 p-5 text-end transition-colors hover:border-primary/50">
                    <span className="mb-2 flex items-center justify-end gap-2 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-foreground/65">
                      {t.newer} <Fwd size={12} aria-hidden="true" />
                    </span>
                    <span className="block font-medium text-foreground group-hover:text-primary-ink transition-colors">{neighbours.newer.title}</span>
                  </Link>
                )}
              </nav>
            )}

            {GISCUS && <Comments config={GISCUS} term={`blog/${post.slug}`} lang={post.lang} />}

            {/* Who wrote it */}
            <aside className="mt-16 flex flex-col gap-5 border border-foreground/10 border-s-2 border-s-primary bg-surface/50 p-6 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export: no image optimiser */}
              <img src={normalizePublicHref("/Assets/art-gallery/Images/logo/3omda.webp")} alt="" width={64} height={64} loading="lazy" decoding="async" className="h-16 w-16 shrink-0 rounded-full border border-foreground/10 object-cover" />
              <div className="min-w-0">
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-foreground/65">{t.by}</p>
                <p className="mt-1 font-display text-lg font-black uppercase text-foreground" dir="ltr">Ahmed Emad Nasr</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/65">{t.bio}</p>
              </div>
              <div className="flex shrink-0 gap-2 sm:ms-auto">
                <Link href="/#contact" className="bg-primary px-4 py-2.5 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-foreground hover:text-background">{t.hire}</Link>
                <Link href="/cv" className="border border-foreground/15 px-4 py-2.5 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:border-primary hover:text-foreground">{t.cv}</Link>
              </div>
            </aside>
          </div>

          <aside className="hidden lg:block">
            <PostToc headings={post.headings} label={t.toc} />
          </aside>
        </div>

        {/* Related posts (shared tags) */}
        {neighbours.related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-24">
            <h2 id="related-title" className="mb-8 font-display text-2xl md:text-3xl font-black uppercase tracking-tight">
              {t.related}
            </h2>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" dir="ltr">
              {neighbours.related.map((p, i) => (
                <li key={p.slug}>
                  <PostCard post={p} index={i} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
