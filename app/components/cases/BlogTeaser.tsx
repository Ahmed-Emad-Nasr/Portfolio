/*
 * BlogTeaser — the home page's door to /blog: the latest posts (when there
 * are any), the three reports to start with, and the numbers behind the
 * library. Everything else that used to sit at the bottom of the one-page
 * site (the full library, ATT&CK, detection rules, triage, videos) is one
 * click away on the blog page.
 */

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import SectionHeader from "@/app/core/components/SectionHeader";
import StartHere from "@/app/components/cases/StartHere";
import PostCard from "@/app/components/blog/PostCard";
import { getAllPosts } from "@/app/core/content/posts";
import { libraryCounts } from "@/app/core/config/library-data";
import { blogYoutubeVideos } from "@/app/core/config/youtube";
import { KanjiWatermark, ctaPrimary, ctaSecondary } from "@/app/components/shared/kit";
import FadeIn from "@/app/core/components/FadeIn";

export default function BlogTeaser() {
  const posts = getAllPosts().slice(0, 3);
  return (
    <section id="blog" aria-label="From the blog" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <KanjiWatermark chars="記録" side="right" />
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="Writing // From the blog"
          japanese="記録"
          titleA="From the"
          titleB="Blog."
          description={`Write-ups, ${libraryCounts.reports} full investigation reports, ${libraryCounts.total} documented cases and ${blogYoutubeVideos.length} Arabic videos — the evidence behind everything above.`}
        />

        {posts.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
              <h3 className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">Latest posts</h3>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <li key={post.slug}>
                  <PostCard post={post} index={i} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <StartHere headingLevel="h3" note="Short on time? Three reports to start with — detection engineering, a full DFIR investigation and a malware teardown. The rest of the library is on the blog." />

        <FadeIn y={20} duration={0.6} className="flex flex-wrap gap-4">
          <Link href="/blog" className={ctaPrimary}>
            <BookOpen size={16} aria-hidden="true" />
            Open the blog
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <Link href="/blog#cases" className={ctaSecondary}>
            Case library <span className="font-mono text-accent tabular-nums">{libraryCounts.total}</span>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
