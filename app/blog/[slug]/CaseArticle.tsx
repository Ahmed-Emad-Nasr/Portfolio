"use client";

/*
 * CaseArticle — one case page, in the Sensei-Dev design language: the
 * experience "service record" panel for the header, tertiary/accent chips,
 * the credential cards' image treatment for screenshots, and the theme's
 * lightbox for the evidence.
 */

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState, ViewTransition, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Download, ExternalLink, Images, Clock, Calendar, AlertTriangle, Maximize2 } from "lucide-react";
import { normalizePublicHref, getThumbnail, formatDate } from "@/app/core/config/shared";
import { useCopyLink } from "@/app/components/cases/useCopyLink";
import CaseSummary from "./CaseSummary";
import CaseFile, { ReadingProgress, VerdictBar } from "./CaseFile";
import type { CaseDetail } from "@/app/core/config/case-details";
import { btnOutline, chipAccent, chipTertiary, ctaPrimary, ctaSecondary, KanjiWatermark } from "@/app/components/shared/kit";
import FadeIn from "@/app/core/components/FadeIn";

const GalleryLightbox = dynamic(() => import("@/app/components/art-gallery/GalleryLightbox"), { ssr: false });

type CaseItem = {
  id: string;
  title: string;
  description: string;
  platform: string;
  type: string;
  category: string;
  difficulty: string;
  href?: string;
  tags: readonly string[];
  tools: readonly string[];
  skillsGained: readonly string[];
  readTime: number;
  date: string;
};

type Sibling = { id: string; title: string } | null;
/* Passed in from the server page — importing attack.ts or cases.ts here
   would bundle them into the browser. */
type Technique = { id: string; name: string; tactic: string };
type Collection = { href: string; title: string };
type Related = { id: string; title: string; category: string; readTime: number; sharedTechniques: number };

function BlockTitle({ children, japanese, id }: { children: ReactNode; japanese: string; id?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-6 h-[2px] bg-primary" aria-hidden="true" />
      <h2 id={id} className="font-mono text-[0.625rem] text-primary-ink tracking-[0.35em] uppercase font-bold">
        {children}
      </h2>
      <span className="brush-jp text-base text-foreground/30" lang="ja" aria-hidden="true" data-jp={japanese} />
    </div>
  );
}

function Shot({ shot, index, total, title, onOpen }: { shot: string; index: number; total: number; title: string; onOpen: (i: number) => void }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      /* Starts with the visible caption ("Evidence 03") so voice control
         ("click evidence 03") and the name agree */
      aria-label={`Evidence ${String(index + 1).padStart(2, "0")} — open screenshot ${index + 1} of ${total}`}
      className="spotlight group relative aspect-[16/10] overflow-hidden bg-surface border border-foreground/5 hover:border-primary/40 transition-all duration-700"
    >
      <Image
        src={normalizePublicHref(thumbFailed ? shot : getThumbnail(shot))}
        alt={`${title} — screenshot ${index + 1}`}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        loading="lazy"
        onError={() => setThumbFailed(true)}
        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
      />
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-500 z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-500 z-20 pointer-events-none" />
      <div className="hover-reveal absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-between p-3 z-10">
        <span className="font-mono text-[0.5625rem] font-bold tracking-[0.3em] uppercase text-white">
          Evidence {String(index + 1).padStart(2, "0")}
        </span>
        <Maximize2 size={12} className="text-white/70" />
      </div>
    </button>
  );
}

export default function CaseArticle({
  item,
  screenshots,
  previous,
  next,
  techniques = [],
  related = [],
  detail,
  kindLabel,
  collection,
}: {
  item: CaseItem;
  screenshots: string[];
  previous: Sibling;
  next: Sibling;
  techniques?: readonly Technique[];
  related?: readonly Related[];
  detail?: CaseDetail;
  kindLabel?: string;
  collection?: Collection;
}) {
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const { state: copyState, copy } = useCopyLink();

  const copyLink = useCallback(() => {
    void copy(`${window.location.origin}${window.location.pathname}`);
  }, [copy]);

  const slides = useMemo(
    () =>
      screenshots.map((shot, i) => ({
        src: normalizePublicHref(shot),
        title: item.title,
        description: `Evidence ${i + 1} of ${screenshots.length}`,
      })),
    [screenshots, item.title],
  );

  return (
    <article id="case-body" className="relative px-6 md:px-20 pt-36 md:pt-44 pb-24 overflow-hidden">
      <ReadingProgress />
      <KanjiWatermark chars="報告書" side="right" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Breadcrumb */}
        <nav className="mb-10 flex flex-wrap items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.3em]" aria-label="Breadcrumb">
          <Link href="/blog#cases" className="group flex items-center gap-2 text-primary-ink hover:text-foreground transition-colors">
            <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-1" /> All cases
          </Link>
          <span className="text-foreground/20" aria-hidden="true">/</span>
          <span className="text-foreground/60">{item.category}</span>
          {collection && (
            <>
              <span className="text-foreground/20" aria-hidden="true">/</span>
              <Link href={collection.href} className="text-tertiary hover:text-foreground transition-colors">{collection.title}</Link>
            </>
          )}
        </nav>

        {/* Header */}
        <FadeIn as="header" x={-32} y={0} duration={0.7} className="mb-12">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
            <span className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">{item.type}</span>
            {kindLabel && (
              <span className="px-2 py-0.5 border border-foreground/15 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">{kindLabel}</span>
            )}
            <span className="jp-eyebrow text-[0.6875rem] text-foreground/30" lang="ja" aria-hidden="true" data-jp="事件" />
          </div>
          <ViewTransition name={`case-title-${item.id}`} share="morph" default="none">
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter [word-spacing:0.12em] uppercase leading-[0.95] text-foreground [text-wrap:balance]">
              {item.title}
            </h1>
          </ViewTransition>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.25em] text-tertiary">{item.platform}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-on-surface-variant">
            <span className="flex items-center gap-2 px-3 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-accent border border-accent/30 bg-accent/10">
              <AlertTriangle size={11} /> {item.difficulty}
            </span>
            <span className="flex items-center gap-2 font-mono text-xs">
              <Clock size={14} className="text-accent" /> {detail?.pages ? `${detail.pages}-page report · ~${item.readTime} min` : `${item.readTime} min read`}
            </span>
            <span className="flex items-center gap-2 font-mono text-xs">
              <Calendar size={14} className="text-on-surface-variant/60" /> {formatDate(item.date)}
            </span>
          </div>
        </FadeIn>

        <VerdictBar verdict={detail?.verdict} severity={detail?.severity} />

        {/* Summary panel — the experience "service record" */}
        {/* No tilt: on a panel this tall the 3D lean read as the page wobbling */}
        <div className="spotlight relative bg-surface/60 border border-foreground/5 backdrop-blur-sm hover:border-primary/20 transition-all duration-700 overflow-hidden mb-14">
          <div className="absolute top-0 left-0 w-[3px] h-full bg-primary" />
          <div className="absolute top-6 right-6 font-mono text-7xl md:text-8xl font-black text-foreground/[0.04] leading-none select-none" aria-hidden="true" data-deco={screenshots.length ? String(screenshots.length).padStart(2, "0") : "00"} />
          <div className="relative z-10 px-6 md:px-12 pt-6 md:pt-8 pb-4 border-b border-foreground/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent" />
              <h2 className="font-mono text-[0.5625rem] font-normal text-foreground/60 tracking-[0.3em] uppercase">Case summary</h2>
              <span className="hidden sm:inline font-mono text-[0.5625rem] text-foreground/65 tracking-wider">~/cases/{item.id}/brief.md</span>
            </div>
            <span className="font-mono text-[0.5625rem] text-foreground/60 tracking-wider uppercase">{item.category}</span>
          </div>
          <div className="relative z-10 px-6 md:px-12 py-7 md:py-10">
            <CaseSummary description={item.description} />
          </div>
          <div className="relative z-10 px-6 md:px-12 pt-6 pb-8 flex flex-wrap gap-4 border-t border-foreground/5">
            {item.href && (
              <>
                <a href={normalizePublicHref(item.href)} target="_blank" rel="noopener noreferrer" className={ctaPrimary}>
                  <ExternalLink size={16} /> View PDF
                </a>
                <a href={normalizePublicHref(item.href)} download className={ctaSecondary}>
                  <Download size={14} className="text-primary-ink" /> Download
                </a>
              </>
            )}
            {screenshots.length > 0 && (
              <button type="button" onClick={() => setGalleryIndex(0)} className={ctaSecondary}>
                <Images size={14} className="text-primary-ink" /> Evidence
                <span className="font-mono text-[0.625rem] text-foreground/60 tabular-nums">{screenshots.length}</span>
              </button>
            )}
            <button type="button" onClick={copyLink} className={`${ctaSecondary} min-w-[12rem] justify-center`}>
              {copyState === "done" ? <Check size={14} className="text-accent" /> : <Copy size={14} className="text-primary-ink" />}
              <span aria-live="polite">{copyState === "done" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy link"}</span>
            </button>
          </div>
        </div>

        {/* Details */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16" aria-label="Case details">
          <div>
            <BlockTitle japanese="道具">Tools</BlockTitle>
            <div className="flex flex-wrap gap-2">
              {item.tools.map((tool) => (
                <span key={tool} className={chipTertiary}>{tool}</span>
              ))}
            </div>
          </div>
          <div>
            <BlockTitle japanese="技能">Skills</BlockTitle>
            <div className="flex flex-wrap gap-2">
              {item.skillsGained.map((skill) => (
                <span key={skill} className={chipAccent}>{skill}</span>
              ))}
            </div>
          </div>
          <div>
            <BlockTitle japanese="標識">Tags</BlockTitle>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?q=${encodeURIComponent(tag)}#cases`}
                  className="px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-foreground/60 bg-foreground/[0.04] border border-foreground/10 hover:border-primary hover:text-primary-ink transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {detail && <CaseFile detail={detail} href={item.href} title={item.title} />}

        {screenshots.length > 0 && (
          <section className="mb-16" aria-labelledby="case-evidence-title">
            <BlockTitle id="case-evidence-title" japanese="証拠">Evidence — {screenshots.length} screenshot(s)</BlockTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {screenshots.map((shot, i) => (
                <Shot key={shot} shot={shot} index={i} total={screenshots.length} title={item.title} onOpen={setGalleryIndex} />
              ))}
            </div>
          </section>
        )}

        {techniques.length > 0 && (
          <section className="mb-16" aria-labelledby="case-attack-title">
            <BlockTitle id="case-attack-title" japanese="戦術">MITRE ATT&amp;CK — {techniques.length} technique(s)</BlockTitle>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {techniques.map((t) => (
                <li key={t.id}>
                  <a
                    href={`https://attack.mitre.org/techniques/${t.id.replace(".", "/")}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group spotlight relative flex h-full items-baseline gap-4 bg-surface/60 border border-foreground/5 px-5 py-4 hover:border-primary/40 transition-colors duration-500"
                  >
                    <span className="font-mono text-xs font-black text-accent tabular-nums shrink-0">{t.id}</span>
                    <span className="flex-1 text-sm text-foreground/80 group-hover:text-foreground transition-colors">{t.name}</span>
                    <span className="hidden sm:block font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-foreground/60 shrink-0">{t.tactic.replace(/-/g, " ")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mb-16" aria-labelledby="case-related-title">
            <BlockTitle id="case-related-title" japanese="関連">Related reports</BlockTitle>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/blog/${entry.id}`}
                    className="group spotlight spotlight-blue relative flex h-full flex-col bg-surface/60 border border-foreground/5 p-6 hover:border-tertiary/50 transition-colors duration-500"
                  >
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-tertiary/0 group-hover:bg-tertiary transition-colors duration-500" aria-hidden="true" />
                    <span className="font-display text-lg font-black uppercase tracking-tight text-foreground group-hover:text-tertiary transition-colors duration-300 mb-4">
                      {entry.title}
                    </span>
                    <span className="mt-auto font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-foreground/60">
                      {entry.category} • {entry.readTime} min
                      {entry.sharedTechniques > 0 && ` • ${entry.sharedTechniques} shared technique(s)`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Previous / next */}
        <nav className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-foreground/10" aria-label="Other cases">
          {previous ? (
            <Link href={`/blog/${previous.id}`} className="group spotlight relative flex flex-col gap-3 bg-surface/60 border border-foreground/5 p-6 hover:border-primary/40 transition-colors duration-500">
              <span className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-primary-ink">
                <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-1" /> Previous
              </span>
              <span className="font-display text-base font-black uppercase tracking-tight text-foreground/80 group-hover:text-foreground">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/blog/${next.id}`} className="group spotlight relative flex flex-col items-end gap-3 text-right bg-surface/60 border border-foreground/5 p-6 hover:border-primary/40 transition-colors duration-500">
              <span className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-primary-ink">
                Next <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="font-display text-base font-black uppercase tracking-tight text-foreground/80 group-hover:text-foreground">{next.title}</span>
            </Link>
          )}
        </nav>

        <div className="mt-10 flex justify-center">
          <Link href="/blog#cases" className={btnOutline}>
            <ArrowLeft size={13} /> Back to the library
          </Link>
        </div>
      </div>

      {galleryIndex !== null && (
        <GalleryLightbox open close={() => setGalleryIndex(null)} index={galleryIndex} slides={slides} />
      )}
    </article>
  );
}
