"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { PORTFOLIO_DATA } from "@/data/portfolio-data";
import { TiltCard } from "@/components/ui/Motion";
import dynamic from "next/dynamic";
import { Sparkles, Maximize2, ChevronDown } from "lucide-react";
import ScrambleText from "@/components/ui/ScrambleText";
import FadeIn from "@/components/ui/FadeIn";

const Lightbox = dynamic(() => import("@/components/ui/Lightbox"), { ssr: false });

const FIRST = 9;
const PAGE = 9;

type GalleryFilter = "all" | "Certificate & credential" | "Exam score & verified badge" | "Teaching, events & field record";

const FILTERS: { id: GalleryFilter; label: string; japanese: string }[] = [
  { id: "all", label: "All records", japanese: "全部" },
  { id: "Certificate & credential", label: "Certificates", japanese: "認定" },
  { id: "Exam score & verified badge", label: "Exams & badges", japanese: "成績" },
  { id: "Teaching, events & field record", label: "Teaching & events", japanese: "現場" },
];

export default function ArtGallery() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [visible, setVisible] = useState(FIRST);

  const filteredItems = useMemo(
    () =>
      PORTFOLIO_DATA.artGallery.filter(
        (img) => filter === "all" || img.category === filter,
      ),
    [filter],
  );

  const items = filteredItems.slice(0, visible);

  const lightboxSlides = useMemo(
    () =>
      filteredItems.map((img) => ({
        src: img.src,
        title: img.title,
        description: `${img.description} Topics: ${img.keywords.join(", ")}.`,
      })),
    [filteredItems],
  );

  return (
    <section id="art" aria-labelledby="art-title" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      {/* Background Decorative Kanji */}
      <div
        className="absolute right-10 top-20 pointer-events-none select-none text-foreground/[0.03] text-[15vw] font-black z-0 vertical-text uppercase"
        aria-hidden="true"
        role="img"
      >
        <span>記</span>
        <span>録</span>
        <span>証</span>
        <span>明</span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
          <FadeIn x={-40} y={0} duration={0.8} className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-primary" />
              <span className="text-primary-ink text-xs font-black tracking-[0.4em] uppercase font-mono">
                <ScrambleText text="Visual Archive" />
              </span>
            </div>
            <h2 id="art-title" className="font-display title-fit [--title-n:9] font-black tracking-tighter uppercase leading-[0.85]">
              <span className="text-foreground">Proof</span> <br />
              <span className="text-primary italic">Gallery.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-base md:text-lg font-light leading-relaxed text-foreground/65 [text-wrap:pretty]">
              Certificates, exam transcripts, verified badges, classroom sessions and moments along the way. Filter by category or open any record full size.
            </p>
          </FadeIn>

          {/* Counter Badge */}
          <FadeIn y={20} duration={0.6} delay={0.3}>
            <div className="relative px-6 py-3 border border-foreground/10 bg-surface/60 backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary" />
              <div className="flex items-center gap-3">
                <span className="font-mono text-primary-ink text-2xl font-black tabular-nums">
                  {String(filteredItems.length).padStart(2, "0")}
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                    Items
                  </span>
                  <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                    Shown
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-12 flex flex-wrap gap-3" role="tablist" aria-label="Filter gallery by category">
          {FILTERS.map((f) => {
            const count =
              f.id === "all"
                ? PORTFOLIO_DATA.artGallery.length
                : PORTFOLIO_DATA.artGallery.filter((img) => img.category === f.id).length;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setFilter(f.id);
                  setVisible(FIRST);
                }}
                className={`px-5 py-2.5 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.2em] border transition-all duration-300 ${
                  active
                    ? "bg-primary text-white border-primary"
                    : "bg-foreground/[0.03] text-foreground/70 border-foreground/10 hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {f.label} <span className="ml-1.5 tabular-nums opacity-80">({count})</span>
                <span className="ml-2 text-[0.5625rem]" lang="ja" aria-hidden="true" data-jp={f.japanese} />
              </button>
            );
          })}
        </div>

        {/* Art Grid — masonry columns */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {items.map((img, idx) => (
            <FadeIn y={0} scale={0.95} duration={0.8} delay={(idx % 6) * 0.08}
              key={img.src}
              className="break-inside-avoid"
            >
              <TiltCard
                max={5}
                className="spotlight relative group overflow-hidden bg-surface border border-foreground/5 transition-all duration-700 hover:border-primary/40"
              >
                {/* Corner bracket accents */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-500 z-20 pointer-events-none" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-500 z-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-500 z-20 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-500 z-20 pointer-events-none" />

                <button
                  type="button"
                  onClick={() => {
                    setIndex(idx);
                    setOpen(true);
                  }}
                  aria-label={`Open ${img.title} in lightbox`}
                  className="absolute inset-0 z-30 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-4px]"
                />

                {/* Image */}
                <Image
                  src={img.thumb}
                  alt={img.description}
                  width={500}
                  height={500}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  unoptimized={true}
                />

                <div
                  className="gallery-halftone pointer-events-none absolute inset-0 z-[5] opacity-0 transition-[opacity,transform] duration-[900ms] ease-out group-hover:scale-[1.2] group-hover:opacity-100"
                  aria-hidden="true"
                />

                {/* Hover overlay */}
                <div className="hover-reveal absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 z-10">
                  <div
                    className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, transparent 48%, var(--primary) 48%, var(--primary) 49%, transparent 49%)",
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-primary-ink mb-2">
                      <Sparkles size={12} />
                      <span className="font-mono text-[0.625rem] font-bold tracking-[0.3em] uppercase">
                        Visual Entry {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-black text-foreground uppercase tracking-tight">
                      {img.title}
                    </h3>
                    <p className="mt-2 text-xs text-foreground/70 leading-relaxed">{img.description}</p>
                    <p className="mt-2 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-tertiary">{img.category}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="w-10 h-[1px] bg-primary/40" />
                      <Maximize2 size={14} className="text-on-surface-variant" />
                    </div>
                  </div>
                </div>
              </TiltCard>
            </FadeIn>
          ))}
        </div>

        {visible < filteredItems.length && (
          <div className="mt-14 flex justify-center">
            <button
              type="button"
              onClick={() => setVisible((n) => Math.min(filteredItems.length, n + PAGE))}
              className="group flex items-center gap-3 px-8 py-4 border border-foreground/15 border-l-2 border-l-primary bg-foreground/[0.02] backdrop-blur-md text-foreground font-mono font-bold uppercase tracking-widest text-sm transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:-translate-y-0.5 active:translate-y-0"
            >
              <ChevronDown size={14} className="text-primary-ink transition-transform duration-300 group-hover:translate-y-0.5" />
              Show more
              <span className="font-mono text-[0.625rem] text-foreground/60 tabular-nums">
                {visible}/{filteredItems.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {open && (
        <Lightbox
          close={() => setOpen(false)}
          index={index}
          slides={lightboxSlides}
        />
      )}
    </section>
  );
}
