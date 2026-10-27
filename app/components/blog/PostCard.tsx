/*
 * PostCard — one written post in a list (the blog page, the home page
 * teaser, tag pages). Same card surface as the case cards; an Arabic post's
 * text runs right-to-left inside the card, the card itself stays in place.
 */

import Link from "next/link";
import { ViewTransition } from "react";
import { Clock, Calendar } from "lucide-react";
import type { PostMeta } from "@/app/core/content/posts";
import { formatDate } from "@/app/core/config/shared";
import { chipTertiary, chipNeutral } from "@/app/components/shared/kit";
import { rv } from "@/app/core/reveal";

export default function PostCard({ post, index = 0, headingLevel: H = "h3" }: { post: PostMeta; index?: number; headingLevel?: "h2" | "h3" }) {
  const rtl = post.lang === "ar";
  return (
    <article
      className="@container spotlight group relative h-full bg-surface/60 border border-foreground/5 hover:border-primary/40 transition-colors duration-500"
      data-reveal={rv({ y: 24, duration: 0.6, delay: Math.min(index, 5) * 0.06 })}
    >
      <span className="absolute top-0 left-0 h-[2px] w-0 bg-primary transition-[width] duration-500 group-hover:w-full" aria-hidden="true" />
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col gap-4 p-6 @md:p-7">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-foreground/60">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={11} aria-hidden="true" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={11} aria-hidden="true" />
            {post.readTime} min
          </span>
          {rtl && <span className="border border-accent/40 px-1.5 py-0.5 text-accent">عربي</span>}
          {post.draft && <span className="border border-primary/60 px-1.5 py-0.5 text-primary-ink">Draft</span>}
          {post.series && (
            <span className="text-tertiary normal-case tracking-normal">
              {post.series}
              {post.seriesPart ? ` · ${post.seriesPart}` : ""}
            </span>
          )}
        </div>
        <div lang={post.lang} dir={rtl ? "rtl" : "ltr"} className="flex flex-col gap-3">
          {/* Same name as the post page's <h1>: opening the post morphs this
              title into the headline (React <ViewTransition>, Next 16) */}
          <ViewTransition name={`post-title-${post.slug}`} share="morph" default="none">
            <H className={`text-foreground group-hover:text-primary-ink transition-colors duration-300 [text-wrap:balance] ${rtl ? "text-xl @md:text-2xl font-bold leading-snug" : "font-display text-lg @md:text-xl font-black uppercase leading-tight tracking-tight"}`}>
              {post.title}
            </H>
          </ViewTransition>
          <p className="text-sm text-foreground/60 font-light leading-relaxed [text-wrap:pretty] line-clamp-3">{post.description}</p>
        </div>
        {post.tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Tags">
            {post.tags.slice(0, 4).map((t, i) => (
              <li key={t} className={i === 0 ? chipTertiary : chipNeutral}>{t}</li>
            ))}
          </ul>
        )}
      </Link>
    </article>
  );
}
