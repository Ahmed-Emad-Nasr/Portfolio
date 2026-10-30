"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { PORTFOLIO_DATA } from "@/data/portfolio-data";
import { ALL_GALLERY_CERTIFICATES, type GalleryCertGroup } from "@/data/certifications";
import { TiltCard } from "@/components/ui/Motion";
import { Eyebrow, filterTab } from "@/components/ui/kit";
import dynamic from "next/dynamic";
import { Sparkles, Maximize2, ChevronDown } from "lucide-react";
import ScrambleText from "@/components/ui/ScrambleText";
import FadeIn from "@/components/ui/FadeIn";

const Lightbox = dynamic(() => import("@/components/ui/Lightbox"), { ssr: false });

const FIRST = 12;
const PAGE = 12;

const START_HERE_CARDS = [
  {
    n: "01",
    meta: "01 • VALIDATED CERTIFICATE",
    title: "Information Security Officer",
    why: "Validated by top certifications including INE eJPT v2, Red Hat RH124, Cisco CCNA, CCEP, Huawei HCIA and security fundamentals.",
    action: "core" as const,
    targetId: "all-certificates",
  },
  {
    n: "02",
    meta: "02 • HANDS-ON LABS",
    title: "Tactical Hands-On Training & Labs",
    why: "Over 79 documented cases, CTFs, TryHackMe SOC Level 1 & 2, DEPI Incident Response & Forensics tracks, and ITI Pentesting Bootcamp.",
    action: "labs" as const,
    targetId: "all-certificates",
  },
  {
    n: "03",
    meta: "03 • ENDORSEMENTS",
    title: "Community Events & Endorsements",
    why: "Photos from classrooms, 300+ students taught at AMIT & NTI, hackathons, cybersecurity events and peer endorsements.",
    action: "photos" as const,
    targetId: "visual-archive",
  },
] as const;

const CERT_FILTERS: { id: GalleryCertGroup | "all"; label: string }[] = [
  { id: "all", label: "All Certificates" },
  { id: "core", label: "Core & Tracks" },
  { id: "labs", label: "Hands-On Labs & Prep" },
  { id: "exams", label: "Exam Scores" },
  { id: "badges", label: "Verified Badges" },
];

const CERT_INDICES = new Set(ALL_GALLERY_CERTIFICATES.map((c) => c.galleryIndex));

export default function ArtGallery() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [certFilter, setCertFilter] = useState<GalleryCertGroup | "all">("all");
  const [archiveFilter, setArchiveFilter] = useState<"all" | "certs" | "photos">("all");
  const [visible, setVisible] = useState(FIRST);

  const filteredCerts = useMemo(
    () =>
      certFilter === "all"
        ? ALL_GALLERY_CERTIFICATES
        : ALL_GALLERY_CERTIFICATES.filter((c) => c.group === certFilter),
    [certFilter],
  );

  const archiveItems = useMemo(() => {
    const all = PORTFOLIO_DATA.artGallery.map((img, i) => ({
      ...img,
      slideIndex: i,
      isCert: CERT_INDICES.has(i + 1),
    }));
    if (archiveFilter === "certs") return all.filter((x) => x.isCert);
    if (archiveFilter === "photos") return all.filter((x) => !x.isCert);
    return all;
  }, [archiveFilter]);

  const shownArchive = archiveItems.slice(0, visible);

  const lightboxSlides = useMemo(
    () =>
      PORTFOLIO_DATA.artGallery.map((img) => ({
        src: img.src,
        title: img.title,
        description: `${img.description} Topics: ${img.keywords.join(", ")}.`,
      })),
    [],
  );

  const openCertificateScan = (galleryIndex: number) => {
    setIndex(Math.max(0, galleryIndex - 1));
    setOpen(true);
  };

  const handleStartHereClick = (action: "core" | "labs" | "photos", targetId: string) => {
    if (action === "photos") {
      setArchiveFilter("photos");
      setVisible(FIRST);
    } else {
      setCertFilter(action);
    }
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="art" aria-labelledby="art-title" className="relative pt-36 md:pt-44 pb-24 md:pb-32 px-6 md:px-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* ─── 01 · Main Header ─── */}
        <div className="mb-16 md:mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
          <FadeIn x={-40} y={0} duration={0.8} className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-primary" />
              <span className="text-primary-ink text-xs font-black tracking-[0.4em] uppercase font-mono">
                <ScrambleText text="Gallery // Visual Archive" />
              </span>
              <span className="jp-eyebrow text-[0.6875rem] text-foreground/30 uppercase" lang="ja" aria-hidden="true" data-jp="証明" />
            </div>
            <h1 id="art-title" className="font-display title-fit [--title-n:9] font-black tracking-tighter uppercase leading-[0.85]">
              <span className="text-foreground">Proof</span> <br />
              <span className="text-primary italic">Gallery.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base md:text-lg font-light leading-relaxed text-foreground/65 [text-wrap:pretty]">
              {PORTFOLIO_DATA.artGallery.length} certificates, events, classroom moments and digital badges — the complete proof behind my cybersecurity journey.
            </p>
          </FadeIn>

          {/* Counter Badges */}
          <FadeIn y={20} duration={0.6} delay={0.3} className="flex flex-wrap gap-4">
            <div className="relative px-6 py-3 border border-accent/40 bg-surface/60 backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent" />
              <div className="flex items-center gap-3">
                <span className="font-mono text-accent text-2xl font-black tabular-nums">
                  {String(ALL_GALLERY_CERTIFICATES.length).padStart(2, "0")}
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                    Certificates
                  </span>
                  <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                    &amp; Badges
                  </span>
                </div>
              </div>
            </div>

            <div className="relative px-6 py-3 border border-foreground/10 bg-surface/60 backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary" />
              <div className="flex items-center gap-3">
                <span className="font-mono text-primary-ink text-2xl font-black tabular-nums">
                  {String(PORTFOLIO_DATA.artGallery.length).padStart(2, "0")}
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                    Total Items
                  </span>
                  <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                    Indexed
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ─── 02 · Start Here (Fast Track // Quick Access) ─── */}
        <section id="gallery-start-here" className="relative mb-24" aria-labelledby="gallery-start-here-title">
          <Eyebrow japanese="入門">Fast Track // Quick Access</Eyebrow>
          <h2 id="gallery-start-here-title" className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground mb-3">
            Start <span className="text-primary italic">Here.</span>
          </h2>
          <p className="mb-10 max-w-2xl text-foreground/60 font-light leading-relaxed">
            Want to check my top certificates? Three to start with — core certifications, hands-on labs and peer endorsements. The complete certificate directory and visual archive are below.
          </p>
          <ol className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {START_HERE_CARDS.map((card) => (
              <li key={card.n}>
                <button
                  type="button"
                  onClick={() => handleStartHereClick(card.action, card.targetId)}
                  className="relative spotlight block w-full h-full text-left bg-surface/60 border border-foreground/5 p-7 hover:border-primary/40 transition-colors duration-500 group cursor-pointer"
                >
                  <div
                    className="font-mono text-5xl font-black text-foreground/[0.06] absolute top-4 right-5 select-none"
                    aria-hidden="true"
                    data-deco={card.n}
                  />
                  <div className="font-mono text-[0.625rem] text-primary-ink tracking-[0.3em] uppercase mb-3">
                    {card.meta}
                  </div>
                  <h3 className="font-display text-xl font-black uppercase text-foreground mb-3 group-hover:text-primary-ink transition-colors duration-300 leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    {card.why}
                  </p>
                </button>
              </li>
            ))}
          </ol>
        </section>

        {/* ─── 03 · All Certificates Directory (Literally every certificate) ─── */}
        <section id="all-certificates" className="relative mb-28 scroll-mt-28" aria-labelledby="all-certificates-title">
          <Eyebrow japanese="認定">Complete Record // Every Certificate</Eyebrow>
          <h2 id="all-certificates-title" className="font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-3">
            All <span className="text-primary italic">Certificates.</span>
          </h2>
          <p className="mb-8 max-w-2xl text-foreground/60 font-light leading-relaxed">
            Every documented certificate, ministry scholarship track, bootcamp, exam score report and verified digital badge ({ALL_GALLERY_CERTIFICATES.length} total). Click any card to inspect the original certificate scan.
          </p>

          <div className="flex flex-wrap gap-2.5 mb-10" role="tablist" aria-label="Filter certificates by category">
            {CERT_FILTERS.map((f) => {
              const count =
                f.id === "all"
                  ? ALL_GALLERY_CERTIFICATES.length
                  : ALL_GALLERY_CERTIFICATES.filter((c) => c.group === f.id).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={certFilter === f.id}
                  onClick={() => setCertFilter(f.id)}
                  className={filterTab(certFilter === f.id)}
                >
                  {f.label}{" "}
                  <span className="ml-1.5 font-mono text-[0.625rem] opacity-75 tabular-nums">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCerts.map((cert, idx) => {
              const num = String(idx + 1).padStart(2, "0");
              return (
                <FadeIn as="li" y={20} duration={0.5} delay={(idx % 6) * 0.05} key={cert.galleryIndex}>
                  <button
                    type="button"
                    onClick={() => openCertificateScan(cert.galleryIndex)}
                    className="relative spotlight flex flex-col justify-between w-full h-full text-left bg-surface/60 border border-foreground/5 p-7 hover:border-primary/40 transition-colors duration-500 group cursor-pointer"
                  >
                    <div>
                      <div
                        className="font-mono text-5xl font-black text-foreground/[0.06] absolute top-4 right-5 select-none"
                        aria-hidden="true"
                        data-deco={num}
                      />
                      <div className="font-mono text-[0.625rem] text-primary-ink tracking-[0.25em] uppercase mb-3 pr-12">
                        {num} • {cert.issuer}
                      </div>
                      <h3 className="font-display text-lg md:text-xl font-black uppercase text-foreground mb-3 group-hover:text-primary-ink transition-colors duration-300 leading-tight">
                        {cert.title}
                      </h3>
                      <p className="text-sm text-foreground/60 font-light leading-relaxed">
                        {cert.summary}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-foreground/5 flex items-center justify-between gap-3 w-full">
                      <span className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-accent">
                        {cert.kind}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-foreground/60 group-hover:text-primary-ink transition-colors">
                        View scan <Maximize2 size={11} />
                      </span>
                    </div>
                  </button>
                </FadeIn>
              );
            })}
          </ol>
        </section>

        {/* ─── 04 · Visual Archive (Masonry Grid of Scans & Event Photos) ─── */}
        <section id="visual-archive" className="relative scroll-mt-28" aria-labelledby="visual-archive-title">
          <Eyebrow japanese="証拠">Proof in Frame // Visual Grid</Eyebrow>
          <h2 id="visual-archive-title" className="font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-3">
            Visual <span className="text-primary italic">Archive.</span>
          </h2>
          <p className="mb-8 max-w-2xl text-foreground/60 font-light leading-relaxed">
            Browse the original certificate scans alongside classroom sessions, competitions and community events.
          </p>

          <div className="flex flex-wrap gap-2.5 mb-10" role="tablist" aria-label="Filter visual archive">
            {[
              { id: "all" as const, label: "All Visuals", count: PORTFOLIO_DATA.artGallery.length },
              { id: "certs" as const, label: "Certificate Scans", count: ALL_GALLERY_CERTIFICATES.length },
              { id: "photos" as const, label: "Events & Classroom", count: PORTFOLIO_DATA.artGallery.length - ALL_GALLERY_CERTIFICATES.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={archiveFilter === tab.id}
                onClick={() => {
                  setArchiveFilter(tab.id);
                  setVisible(FIRST);
                }}
                className={filterTab(archiveFilter === tab.id)}
              >
                {tab.label}{" "}
                <span className="ml-1.5 font-mono text-[0.625rem] opacity-75 tabular-nums">
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {shownArchive.map((img, idx) => (
              <FadeIn
                y={0}
                scale={0.95}
                duration={0.8}
                delay={(idx % 6) * 0.08}
                key={img.slideIndex}
                className="break-inside-avoid"
              >
                <TiltCard
                  max={5}
                  className="spotlight relative group overflow-hidden bg-surface border border-foreground/5 transition-all duration-700 hover:border-primary/40"
                >
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-500 z-20 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-500 z-20 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-500 z-20 pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-500 z-20 pointer-events-none" />

                  <button
                    type="button"
                    onClick={() => {
                      setIndex(img.slideIndex);
                      setOpen(true);
                    }}
                    aria-label={`Open ${img.title} in lightbox`}
                    className="absolute inset-0 z-30 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-4px]"
                  />

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
                          Visual Entry {String(img.slideIndex + 1).padStart(2, "0")}
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

          {visible < archiveItems.length && (
            <div className="mt-14 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((n) => Math.min(archiveItems.length, n + PAGE))}
                className="group flex items-center gap-3 px-8 py-4 border border-foreground/15 border-l-2 border-l-primary bg-foreground/[0.02] backdrop-blur-md text-foreground font-mono font-bold uppercase tracking-widest text-sm transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:-translate-y-0.5 active:translate-y-0"
              >
                <ChevronDown size={14} className="text-primary-ink transition-transform duration-300 group-hover:translate-y-0.5" />
                Show more
                <span className="font-mono text-[0.625rem] text-foreground/60 tabular-nums">
                  {visible}/{archiveItems.length}
                </span>
              </button>
            </div>
          )}
        </section>
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
