/*
 * PostsSection — the written posts (content/posts/*.mdx) on the one-page
 * site, with the tags to browse by. Server-rendered: the post links are in
 * the HTML for search engines. Each post keeps its own page at /blog/<slug>.
 */

import Link from "next/link";
import { chipNeutral } from "@/app/components/shared/kit";
import PostCard from "@/app/components/blog/PostCard";
import { getAllPosts, getTags } from "@/app/core/content/posts";

export default function PostsSection() {
  const posts = getAllPosts();
  const tags = getTags();
  if (!posts.length) return null;

  return (
    <section id="posts" aria-labelledby="posts-title" className="relative py-16 md:py-24 px-6 md:px-20 bg-background">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
              <span className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">Posts</span>
            </div>
            <h3 id="posts-title" className="font-display text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]">
              Latest <span className="text-primary italic">write-ups.</span>
            </h3>
          </div>
          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Browse by tag">
              {tags.slice(0, 10).map((t) => (
                <li key={t.slug}>
                  <Link href={`/blog/tag/${t.slug}`} className={`${chipNeutral} inline-flex gap-1.5 hover:border-primary hover:text-foreground transition-colors`}>
                    {t.tag} <span className="text-accent tabular-nums">{t.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <li key={post.slug}>
              <PostCard post={post} index={i} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
