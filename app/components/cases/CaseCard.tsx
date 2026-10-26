"use client";

/*
 * CaseCard — one case in the library, in the card language of the
 * Sensei-Dev "Selected work" section (TiltCard + spotlight, katana line on
 * top, tertiary stack chips, accent metric chips, sheen primary action).
 */

import React, { useCallback, useState, ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Copy, ExternalLink, FileText, Download, Images, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import { TiltCard } from "@/app/core/components/Motion";
import { TRAILING_SLASH } from "@/app/core/config/site";
import { getThumbnail, normalizePublicHref } from "@/app/core/config/shared";
import type { PdfResource } from "@/app/core/config/shared";
import { useCopyLink } from "./useCopyLink";
import { btnOutline, btnPrimary, chipAccent, chipNeutral, chipTertiary } from "@/app/components/shared/kit";
import { rv } from "@/app/core/reveal";
import { caseCardBlurb } from "@/app/core/utils/case-summary";

type CaseCardProps = PdfResource & {
  index: number;
  /** First screenshot, shown as the card's cover */
  cover?: string;
  shotCount: number;
  onOpenGallery: (title: string, id: string, index?: number) => void;
};

function CaseCard({
  index,
  id,
  title,
  description,
  platform,
  type,
  category,
  difficulty,
  href,
  tools,
  skillsGained,
  readTime,
  date,
  detailHref,
  verdict,
  severity,
  cover,
  shotCount,
  onOpenGallery,
}: CaseCardProps) {
  const detailPath = detailHref ?? `/blog/${id}`;
  const [coverFailed, setCoverFailed] = useState(false);
  const { state: copyState, copy } = useCopyLink();

  const copyLink = useCallback(() => {
    /* Same base-path rule as every asset on the site: /Portfolio in production */
    const path = normalizePublicHref(detailPath);
    void copy(`${window.location.origin}${TRAILING_SLASH ? `${path}/` : path}`);
  }, [detailPath, copy]);

  const shownTools = (tools ?? []).slice(0, 4);
  const moreTools = Math.max(0, (tools ?? []).length - shownTools.length);

  return (
    <div
  id={`case-${id}`}
  className="scroll-mt-28"
  data-reveal={rv({ y: 32, duration: 0.7, delay: (index % 2) * 0.1 })}
>
      <TiltCard className="spotlight group relative bg-surface/60 border border-foreground/5 hover:border-primary/40 transition-colors duration-500 flex flex-col h-full overflow-hidden">
        <div className="absolute top-0 left-0 z-10 w-full h-[2px] bg-gradient-to-r from-primary via-primary/40 to-transparent opacity-70" aria-hidden="true" />

        {cover && (
          <button
            type="button"
            onClick={() => void onOpenGallery(title, id, 0)}
            className="relative block h-52 w-full overflow-hidden border-b border-foreground/5"
            aria-label={`Open ${shotCount} screenshot(s) of ${title}`}
          >
            <Image
              src={normalizePublicHref(coverFailed ? cover : getThumbnail(cover))}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              onError={() => setCoverFailed(true)}
              className="object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply group-hover:bg-transparent transition-all duration-700" />
            <span className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-background/80 backdrop-blur-md border border-foreground/15 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.2em] text-foreground">
              <Images size={11} className="text-accent" /> {shotCount}
            </span>
          </button>
        )}

        <div className="flex flex-col flex-1 p-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-foreground/5 border border-foreground/10 shrink-0">
                {href && !category ? (
                  <FileText size={18} className="text-tertiary" />
                ) : (
                  <ShieldAlert size={18} className="text-tertiary" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-tertiary truncate">
                  {type}
                  {category ? ` • ${category}` : ""}
                </div>
                <div className="font-mono text-[0.5625rem] text-foreground/60 tracking-widest mt-1 truncate">
                  {[date, readTime ? `${readTime} min` : null, platform].filter(Boolean).join(" • ")}
                </div>
              </div>
            </div>
            {severity ? (
              <span
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.2em] border ${
                  severity === "Critical"
                    ? "text-primary-ink border-primary/40 bg-primary/10"
                    : severity === "High"
                      ? "text-accent border-accent/30 bg-accent/10"
                      : "text-tertiary border-tertiary/30 bg-tertiary/10"
                }`}
                title="Alert severity"
              >
                <AlertTriangle size={11} /> {severity}
              </span>
            ) : difficulty ? (
              <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-accent border border-accent/30 bg-accent/10">
                <AlertTriangle size={11} /> {difficulty}
              </span>
            ) : null}
          </div>

          {/* Named like the case page's <h1>: opening the case morphs this
              title into the page headline (React <ViewTransition>) */}
          <ViewTransition name={`case-title-${id}`} share="morph" default="none">
            <h3 className="font-display text-xl md:text-lg lg:text-2xl font-black uppercase tracking-tight text-foreground mb-3 leading-tight">
              <Link href={detailPath} className="hover:text-primary-ink transition-colors duration-300">
                {title}
              </Link>
            </h3>
          </ViewTransition>
          {verdict && (
            <p className="mb-3 flex items-start gap-2 font-mono text-[0.625rem] uppercase tracking-[0.15em] text-primary-ink">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true" />
              <span>{verdict}</span>
            </p>
          )}
          {description && (
            <p className="text-sm text-foreground/60 font-light leading-relaxed mb-5 line-clamp-3">{caseCardBlurb(description)}</p>
          )}

          {shownTools.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {shownTools.map((t) => (
                <span key={t} className={chipTertiary}>{t}</span>
              ))}
              {moreTools > 0 && <span className={chipNeutral}>+{moreTools}</span>}
            </div>
          )}
          {skillsGained && skillsGained.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {skillsGained.slice(0, 3).map((s) => (
                <span key={s} className={chipAccent}>{s}</span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-auto pt-5 border-t border-foreground/5">
            <Link href={detailPath} className={btnPrimary}>
              {category ? "Open case" : "Open"} <ArrowRight size={13} />
            </Link>
            {href && (
              <>
                <a href={normalizePublicHref(href)} target="_blank" rel="noopener noreferrer" className={btnOutline}>
                  <ExternalLink size={13} /> PDF
                </a>
                <a href={normalizePublicHref(href)} download className={btnOutline} aria-label={`Download the PDF of ${title}`}>
                  <Download size={13} />
                </a>
              </>
            )}
            <button
              type="button"
              onClick={copyLink}
              className={`${btnOutline} min-w-[9.5rem] justify-center`}
              aria-label={`Copy link to ${title}`}
            >
              {copyState === "done" ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
              <span aria-live="polite">
                {copyState === "done" ? "Copied" : copyState === "error" ? "Failed" : "Copy link"}
              </span>
            </button>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}

export default React.memo(CaseCard);
