/*
 * /blog/tag/<tag> — every post with one tag, plus a door to the case
 * library already filtered on the same word (cases have tags of their own).
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell, chipNeutral } from "@/app/components/shared/kit";
import SectionHeader from "@/app/core/components/SectionHeader";
import PostCard from "@/app/components/blog/PostCard";
import CaseFilterLink from "@/app/components/cases/CaseFilterLink";
import { getAllPosts, getTags } from "@/app/core/content/posts";
import { caseEvidenceLibrary } from "@/app/core/config/cases";

export const dynamicParams = false;

/* A static export needs at least one path per dynamic route; with no posts
   yet, one placeholder page is built and answers 404. */
const NO_TAGS = "_";

export function generateStaticParams() {
  const tags = getTags();
  return tags.length ? tags.map((t) => ({ tag: t.slug })) : [{ tag: NO_TAGS }];
}

const find = (slug: string) => getTags().find((t) => t.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const t = find(tag);
  if (!t) return { title: "Tag not found", robots: { index: false } };
  return {
    title: `${t.tag} — Blog`,
    description: `Posts about ${t.tag} by Ahmed Emad Nasr.`,
    alternates: { canonical: `/blog/tag/${t.slug}` },
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const t = find(tag);
  if (!t) notFound();
  const posts = getAllPosts().filter((p) => p.tags.includes(t.tag));
  const needle = t.tag.toLowerCase();
  const caseCount = caseEvidenceLibrary.filter((c) => [...c.tags, ...c.tools, c.category].some((x) => x.toLowerCase() === needle)).length;

  return (
    <PageShell>
      <section className="relative px-6 md:px-20 pt-36 md:pt-44 pb-24">
        <div className="relative z-10 mx-auto max-w-7xl">
          <Link href="/#posts" className="group mb-10 inline-flex items-center gap-2 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.3em] text-primary-ink hover:text-foreground transition-colors">
            <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true" />
            Blog
          </Link>
          <SectionHeader as="h1" eyebrow={`Tag // ${posts.length} post${posts.length === 1 ? "" : "s"}`} japanese="札" titleA="Tagged" titleB={`${t.tag}.`} />
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, i) => (
              <li key={post.slug}>
                <PostCard post={post} index={i} headingLevel="h2" />
              </li>
            ))}
          </ul>
          <div className="mt-14 flex flex-wrap items-center gap-3">
            {caseCount > 0 && (
              <CaseFilterLink params={{ q: t.tag }} className="border border-foreground/15 px-5 py-3 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:border-primary hover:text-primary-ink">
                {caseCount} case{caseCount === 1 ? "" : "s"} tagged {t.tag} in the library →
              </CaseFilterLink>
            )}
            {getTags()
              .filter((x) => x.slug !== t.slug)
              .slice(0, 12)
              .map((x) => (
                <Link key={x.slug} href={`/blog/tag/${x.slug}`} className={`${chipNeutral} hover:border-primary hover:text-foreground transition-colors`}>
                  {x.tag}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
