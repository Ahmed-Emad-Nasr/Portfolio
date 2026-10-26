/*
 * TestimonialsSection — quotes from people who worked with or learned from
 * Ahmed (core/config/testimonials.ts). Renders nothing until there is at
 * least one, so the page never shows an empty section. Each quote fades up in
 * turn with its quotation mark drawn large behind it.
 */

import { Quote, ArrowUpRight } from "lucide-react";
import SectionHeader from "@/app/core/components/SectionHeader";
import { TiltCard } from "@/app/core/components/Motion";
import { KanjiWatermark } from "@/app/components/shared/kit";
import { testimonials } from "@/app/core/config/testimonials";
import { rv } from "@/app/core/reveal";

export default function TestimonialsSection() {
  if (testimonials.length === 0) return null;
  return (
    <section id="testimonials" aria-label="Testimonials" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <KanjiWatermark chars="推薦" side="right" />
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="In their words // Recommendations"
          japanese="推薦"
          titleA="In Their"
          titleB="Words."
          description="From the people I have worked for, worked with and taught."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={t.name} data-reveal={rv({ y: 32, duration: 0.7, delay: i * 0.1 })}>
              <TiltCard className="group spotlight relative h-full flex flex-col bg-surface/60 border border-foreground/5 p-8 hover:border-primary/40 transition-colors duration-500 overflow-hidden">
                <Quote size={96} className="absolute -top-4 -right-4 text-foreground/[0.04] group-hover:text-primary/10 transition-colors duration-700" aria-hidden="true" />
                <blockquote className="relative text-base text-foreground/85 font-light leading-relaxed mb-8">“{t.quote}”</blockquote>
                <figcaption className="mt-auto flex items-end justify-between gap-4 pt-5 border-t border-foreground/5">
                  <span>
                    <span className="block font-display text-sm font-black uppercase tracking-tight text-foreground">{t.name}</span>
                    <span className="block mt-1 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-foreground/60">{t.role} · {t.org}</span>
                  </span>
                  {t.link && (
                    <a href={t.link} target="_blank" rel="noopener noreferrer" className="shrink-0 text-foreground/60 hover:text-primary-ink transition-colors" aria-label={`Verify ${t.name}'s recommendation`}>
                      <ArrowUpRight size={16} />
                    </a>
                  )}
                </figcaption>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
