"use client";

import { ExternalLink, Star } from "lucide-react";
import { Github } from "@/app/core/icons/BrandIcons";
import { Repo } from "@/app/core/api/github";
import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";
import { TiltCard } from "@/app/core/components/Motion";

interface ProjectCardProps {
  repo: Repo;
  index?: number;
}

const TYPE_JP: Record<string, string> = {
  "Detection Lab": "実験",
  Research: "研究",
  "GRC Platform": "基盤",
  "CLI Tool": "道具",
  Assessment: "評価",
};

export default function ProjectCard({ repo, index = 0 }: ProjectCardProps) {
  const highlight = PORTFOLIO_DATA.projects.highlights.find((h) =>
    repo.name.toLowerCase().includes(h.name.toLowerCase())
  );

  const displayIndex = String(index + 1).padStart(2, "0");
  const typeLabel = highlight?.type ?? "Library";
  const metrics = highlight?.metrics ?? [];

  return (
    <TiltCard className="spotlight group relative w-full min-h-[23.75rem] md:min-h-[21.25rem] flex flex-col bg-surface/60 border border-foreground/5 p-8 hover:border-primary/40 transition-colors duration-500">
      {/* Top katana line */}
      <div
        className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-primary/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500"
        aria-hidden="true"
      />
      {/* Corner brackets on hover */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/0 group-hover:border-primary/50 transition-colors duration-500 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/0 group-hover:border-primary/50 transition-colors duration-500 pointer-events-none" aria-hidden="true" />

      {/* Faded index */}
      <div
        className="absolute -bottom-3 right-2 font-display text-[7rem] font-black text-foreground/[0.04] leading-none select-none pointer-events-none group-hover:text-primary/[0.07] transition-colors duration-700"
        aria-hidden="true"
      >
        {displayIndex}
      </div>

      {/* Top HUD */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-foreground/5 border border-foreground/10">
            <Github className="text-tertiary" size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-tertiary">
              {typeLabel}
            </span>
            <span className="brush-jp text-sm text-foreground/30 leading-none" lang="ja" aria-hidden="true" data-jp={TYPE_JP[typeLabel] ?? "庫"} />
          </div>
        </div>
        {/* A "★ 0" badge advertises the absence of stars — show it only once
            there is something to show. */}
        {repo.stargazers_count > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/25">
            <span className="sr-only">{`${repo.stargazers_count} GitHub ${repo.stargazers_count === 1 ? "star" : "stars"}`}</span>
            <Star size={11} className="text-accent" aria-hidden="true" />
            <span className="font-mono text-[0.625rem] font-bold text-accent" aria-hidden="true">
              {repo.stargazers_count}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-lg xl:text-2xl font-black mb-3 tracking-tight uppercase leading-tight text-foreground group-hover:text-primary transition-colors duration-300">
        {highlight?.name || repo.name.replace(/-/g, " ")}
      </h3>

      {/* Description */}
      <p className="text-foreground/60 line-clamp-3 mb-5 text-sm font-light leading-relaxed">
        {highlight?.description || repo.description || "Open-source security project. Setup and results documented in the repo."}
      </p>

      {/* Language + metrics */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* GitHub reports no language for docs/config-only repos — the
            template showed "Native" there, which means nothing here */}
        {repo.language && (
          <span className="px-3 py-1 text-[0.5625rem] font-bold uppercase tracking-[0.15em] font-mono text-tertiary bg-tertiary/10 border border-tertiary/25">
            {repo.language}
          </span>
        )}
        {repo.license && repo.license.spdx_id !== "NOASSERTION" && (
          <span className="px-3 py-1 text-[0.5625rem] uppercase tracking-[0.15em] font-mono text-foreground/60 bg-foreground/[0.04] border border-foreground/10">
            {repo.license.spdx_id}
          </span>
        )}
      </div>
      {metrics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {metrics.map((m) => (
            <span
              key={m}
              className="px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-accent bg-accent/10 border border-accent/25"
            >
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-auto pt-5 border-t border-foreground/5">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-sheen flex-1 py-3 px-4 bg-primary text-white font-mono font-black text-[0.625rem] tracking-[0.2em] uppercase text-center flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-all duration-300"
        >
          <Github size={13} /> Source
        </a>
        {repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border border-foreground/10 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 text-foreground/60 flex items-center justify-center"
            aria-label={`Visit live demo for ${repo.name}`}
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    </TiltCard>
  );
}
