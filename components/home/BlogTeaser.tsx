/* The home page's door to /blog: three reports to start with and the library's numbers */

import PageLink from "@/components/ui/PageLink";
import { ArrowRight, BookOpen } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import StartHere from "@/components/blog/StartHere";
import { libraryCounts } from "@/lib/library-data";
import { blogYoutubeVideos } from "@/data/youtube";
import { KanjiWatermark, ctaPrimary, ctaSecondary } from "@/components/ui/kit";
import FadeIn from "@/components/ui/FadeIn";

export default function BlogTeaser() {
  return (
    <section id="blog" aria-label="From the blog" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <KanjiWatermark chars="記録" side="right" />
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="Writing // From the blog"
          japanese="記録"
          titleA="From the"
          titleB="Blog."
          description={`${libraryCounts.reports} full investigation reports, ${libraryCounts.total} documented cases and ${blogYoutubeVideos.length} Arabic videos — the evidence behind everything above.`}
        />

        <StartHere headingLevel="h3" note="Short on time? Three reports to start with — detection engineering, a full DFIR investigation and a malware teardown. The rest of the library is on the blog." />

        <FadeIn y={20} duration={0.6} className="flex flex-wrap gap-4">
          <PageLink href="/blog" className={ctaPrimary}>
            <BookOpen size={16} aria-hidden="true" />
            Open the blog
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </PageLink>
          <PageLink href="/blog#cases" className={ctaSecondary}>
            Case library <span className="font-mono text-accent tabular-nums">{libraryCounts.total}</span>
          </PageLink>
        </FadeIn>
      </div>
    </section>
  );
}
