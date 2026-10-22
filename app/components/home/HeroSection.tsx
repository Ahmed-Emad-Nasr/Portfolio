"use client";

import { preload } from "react-dom";
import { useRef } from "react";
import { m as motion, useScroll, useTransform } from "framer-motion";
import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";
import { normalizePublicHref } from "@/app/core/config/shared";
import { RevealText } from "@/app/core/components/RevealText";
import { HeroMascot } from "@/app/components/home/HeroMascot";
import { RoleTicker } from "@/app/components/home/RoleTicker";
import { MessageCircle, Download, ArrowDown } from "lucide-react";
import { Github, Linkedin, Youtube } from "@/app/core/icons/BrandIcons";


function FieldRow({ label, value, hot = false }: { label: string; value: string; hot?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-foreground/5 last:border-b-0">
      <dt className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-foreground/60 shrink-0">
        {label}
      </dt>
      <dd className={`font-mono text-xs text-right leading-relaxed ${hot ? "text-accent font-bold" : "text-foreground/80"}`}>
        {value}
      </dd>
    </div>
  );
}

/* The hero portrait at the widths the circle is drawn at (176 / 216 / 276
   CSS px, see .hero-image below) for 1x–3x screens. */
const HERO_PHOTO = {
  src: normalizePublicHref("Assets/art-gallery/Images/logo/3omda-560.webp"),
  srcSet: [320, 420, 560, 840]
    .map((w) => `${normalizePublicHref(`Assets/art-gallery/Images/logo/3omda-${w}.webp`)} ${w}w`)
    .join(", "),
  sizes: "(max-width: 639px) 176px, (max-width: 1023px) 216px, 276px",
};

export default function HeroSection({
  projectCount,
  starCount,
  description,
}: {
  projectCount: number;
  starCount: number;
  /** The summary paragraph — quotes the case-library numbers (live-copy.ts) */
  description: string;
}) {
  /* The portrait is the LCP element: let the browser fetch it with the HTML
     instead of after the CSS. */
  preload(HERO_PHOTO.src, {
    as: "image",
    imageSrcSet: HERO_PHOTO.srcSet,
    imageSizes: HERO_PHOTO.sizes,
    fetchPriority: "high",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 140]);

  /* The entrance (content stack, portrait, sun, kanji, spec sheet, speed
     lines) is CSS — globals.css, "Hero entrance". It used to be GSAP, which
     ran only after hydration: on a phone the server-rendered hero was shown,
     then hidden and replayed seconds later, and GSAP's style reads forced a
     layout of the whole page during load. CSS starts with the first paint
     and needs no JavaScript at all. */

  const socials = [{
    name: "GitHub",
    icon: Github,
    href: `https://github.com/${PORTFOLIO_DATA.profile.contact.github}`,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: `${PORTFOLIO_DATA.profile.contact.linkedin}`,
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    href: `https://wa.me/${PORTFOLIO_DATA.profile.contact.whatsapp}`,
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: PORTFOLIO_DATA.profile.contact.youtube,
  },
  ];

  const focusServices = PORTFOLIO_DATA.services;
  const focusLabel =
    focusServices.length >= 2
      ? `${focusServices[0].title} + ${focusServices[1].title} +${Math.max(0, focusServices.length - 2)}`
      : focusServices.map((s) => s.title).join(" + ") || "Full-Stack";
  const shippedLabel = `${projectCount} repos · ${starCount} stars`;
  const tongueCodes = PORTFOLIO_DATA.languages.map((l) => l.code).join(" · ");

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center px-6 overflow-hidden pt-32 pb-24 bg-background"
    >
      {/* ─── Speed Lines Background ─── */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="speed-line absolute h-[1px] bg-gradient-to-r from-primary/20 via-primary/5 to-transparent"
            style={{
              top: `${15 + i * 10}%`,
              left: 0,
              width: `${40 + i * 8}%`,
              transform: `rotate(${-2 + i * 0.5}deg)`,
            }}
          />
        ))}
      </div>

      {/* ─── Floating Particles (CSS-only) ─── */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-primary/30 rounded-none"
            style={{
              left: `${10 + (i * 7) % 80}%`,
              top: `${5 + (i * 13) % 90}%`,
              animation: `float-particle ${3 + (i % 4)}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* ─── Background Japanese Watermark (parallax) ─── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="japanese-bg absolute right-10 top-1/2 -translate-y-1/2 flex gap-12 text-foreground/[0.03] font-black text-[10vw] select-none pointer-events-none z-0 leading-none"
          role="img"
        >
          <div className="vertical-text">
            <span>ア</span>
            <span>ナ</span>
            <span>リ</span>
            <span>ス</span>
            <span>ト</span>
          </div>
          <div className="vertical-text">
            <span>村</span>
            <span>長</span>
          </div>
        </div>
      </motion.div>

      {/* ─── Scanline Overlay ─── */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] opacity-[0.03]"
        aria-hidden="true" style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)", filter: "grayscale(100%)"
        }}
      />

      {/* ─── Flow ─── */}
      <div className="hero-content relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start">
        {/* Badge */}
        <div className="flex items-center gap-3 px-4 py-2 bg-foreground/[0.03] border border-foreground/10 mb-8 backdrop-blur-sm">
          <div className="w-2 h-2 bg-primary animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            {PORTFOLIO_DATA.profile.japaneseTitle}
          </span>
        </div>

        {/* ─── Masthead: name first, portrait second  one row ─── */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 w-full">
          {/* Name */}
          <div className="text-center md:text-left order-2 md:order-1">
            <p className="font-mono text-[0.6875rem] md:text-xs font-bold uppercase tracking-[0.4em] text-primary-ink mb-3">
              Portfolio  履歴書
            </p>
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.85] tracking-tighter uppercase">
              <RevealText text="Ahmed" delay={0.6} className="block text-foreground" />
              {/* One line per word, always: "Emad Nasr" wraps at every width
                  in the display font but fits on one line in the fallback, so
                  letting it wrap on its own made the whole hero jump (a layout
                  shift of up to 0.75 on phones) when the font arrived. */}
              <RevealText
                text="Emad"
                delay={0.72}
                className="block md:ml-10 text-transparent"
                style={{ WebkitTextStroke: "2px #BC002D" }}
              />
              <RevealText
                text="Nasr"
                delay={0.78}
                className="block md:ml-10 text-transparent"
                style={{ WebkitTextStroke: "2px #BC002D" }}
              />
            </h1>
            <p className="brush-jp text-xl md:text-2xl text-foreground/40 mt-4" lang="ja" aria-hidden="true" data-jp="アハメド・エマド・ナスル  セキュリティアナリスト" />
            {/* The jobs, typed one after another (from the old site's hero) */}
            <RoleTicker
              roles={PORTFOLIO_DATA.profile.roles}
              className="mt-5 text-sm sm:text-base md:text-lg"
            />
          </div>

          {/* Portrait */}
          <div className="hero-image relative w-[13.75rem] sm:w-[16.25rem] lg:w-[20rem] aspect-square shrink-0 order-1 md:order-2 md:ml-auto">
            {/* Hinomaru  Red Sun */}
            <div className="hinomaru-sun absolute inset-[-20%] flex items-center justify-center pointer-events-none">
              <div
                className="w-[80%] h-[80%] rounded-full opacity-[0.07]"
                style={{
                  background:
                    "radial-gradient(circle, #BC002D 0%, #BC002D 40%, transparent 70%)",
                }}
              />
            </div>

            {/* Orbit inscription  stack names circling the portrait */}
            <div
              className="absolute -inset-3 animate-[spin_36s_linear_infinite] pointer-events-none"
              aria-hidden="true"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  <path
                    id="hero-orbit"
                    d="M 100,100 m -86,0 a 86,86 0 1,1 172,0 a 86,86 0 1,1 -172,0"
                  />
                </defs>
                <text fontSize="8" letterSpacing="2.5" className="fill-foreground/30 font-mono uppercase">
                  <textPath href="#hero-orbit">
                    Wazuh • Splunk • YARA • Volatility • ATT&amp;CK • 侍 •
                  </textPath>
                </text>
              </svg>
            </div>

            {/* Camera Viewfinder Brackets */}
            <div className="absolute top-2 left-2 w-7 h-7 border-l-2 border-t-2 border-foreground/20 pointer-events-none" />
            <div className="absolute top-2 right-2 w-7 h-7 border-r-2 border-t-2 border-foreground/20 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-7 h-7 border-l-2 border-b-2 border-foreground/20 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-7 h-7 border-r-2 border-b-2 border-foreground/20 pointer-events-none" />

            {/* The Photo */}
            <a
              href={PORTFOLIO_DATA.profile.contact.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="group/photo block"
              aria-label="Watch the YouTube channel"
            >
              <div className="absolute inset-5 rounded-full overflow-hidden border-2 border-foreground/10 group-hover/photo:border-primary/40 transition-colors duration-700 shadow-2xl shadow-primary/10">
                {/* A plain <img> on purpose: with `images.unoptimized` (required
                    by the static export) next/image never writes a srcset, so
                    every phone downloaded the 2048px original (318 KB) for a
                    176px circle. The variants come from
                    scripts/generate-hero-sizes.mjs. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={HERO_PHOTO.src}
                  srcSet={HERO_PHOTO.srcSet}
                  sizes={HERO_PHOTO.sizes}
                  alt={PORTFOLIO_DATA.profile.name}
                  width={560}
                  height={560}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover object-top grayscale group-hover/photo:grayscale-0 group-hover/photo:scale-105 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent group-hover/photo:from-transparent transition-all duration-700" />
              </div>
            </a>

            {/* Hanko seal  the maker's stamp */}
            <div
              className="absolute bottom-5 right-5 z-20 w-12 h-12 lg:w-14 lg:h-14 bg-primary rotate-6 hover:rotate-0 transition-transform duration-500 shadow-[0_0_25px_rgba(188,0,45,0.5)] flex items-center justify-center"
              role="img"
              aria-label="Maker's seal"
            >
              <div className="absolute inset-1.5 border border-foreground/40 pointer-events-none" />
              <span className="brush-jp text-xl lg:text-2xl text-foreground leading-none" lang="ja" aria-hidden="true" data-jp="村長" />
            </div>

            {/* Outer decorative ring with dashes */}
            <div
              className="absolute inset-[-4px] rounded-full pointer-events-none"
              style={{
                border: "1px dashed rgba(255,255,255,0.06)",
              }}
            />

            {/* Mascot companion  random language mascot per visit */}
            <HeroMascot className="absolute -bottom-3 -left-4 z-20 lg:-left-8" />
          </div>

        </div>

        {/* ─── Content: proof + field record ─── */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1.35fr_.65fr] gap-10 items-start w-full">
          <div>
            {/* Tech Spec Sheet */}
            <div className="mb-8 w-full border border-foreground/5 bg-foreground/[0.02] backdrop-blur-sm">
              <div className="border-b border-foreground/5 px-4 py-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary" />
                <span className="font-mono text-[0.625rem] text-foreground/60 uppercase tracking-[0.3em]">
                  Technical Specifications
                </span>
              </div>
              <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="spec-item flex flex-col gap-1.5">
                  <span className="font-mono text-[0.625rem] font-bold text-accent tracking-[0.2em] uppercase">
                    Detect
                  </span>
                  <span className="font-mono text-sm text-foreground/85">
                    Wazuh, ELK, Splunk
                  </span>
                </div>
                <div className="spec-item flex flex-col gap-1.5">
                  <span className="font-mono text-[0.625rem] font-bold text-tertiary tracking-[0.2em] uppercase">
                    Respond
                  </span>
                  <span className="font-mono text-sm text-foreground/85">
                    NIST 800-61, ATT&amp;CK
                  </span>
                </div>
                <div className="spec-item flex flex-col gap-1.5">
                  <span className="font-mono text-[0.625rem] font-bold text-foreground/60 tracking-[0.2em] uppercase">
                    Investigate
                  </span>
                  <span className="font-mono text-sm text-foreground/85">
                    Volatility, YARA
                  </span>
                </div>
              </div>
            </div>

            {/* Tagline & Description */}
            <div className="mb-8">
              <p className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed mb-5">
                {PORTFOLIO_DATA.profile.hero.tagline}
              </p>
              <p className="text-lg text-on-surface-variant font-light leading-relaxed">
                {description}
              </p>
            </div>

            {/* CTA Buttons + Socials */}
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex flex-wrap gap-4">
                <a
                  href={PORTFOLIO_DATA.profile.hero.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="interactive btn-sheen group flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-primary text-white font-mono font-black uppercase tracking-widest text-sm transition-all duration-300 shadow-2xl shadow-primary/25 hover:bg-[#d60030] hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 96% 100%, 4% 100%)",
                  }}
                >
                  {/* The accessible name now starts with the visible text
                      (WCAG 2.5.3 — voice users say what they see). */}
                  <Download size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-y-0.5" />
                  RESUME.pdf
                  <span className="sr-only"> (download)</span>
                  <span className="brush-jp text-base normal-case tracking-normal opacity-70" lang="ja" aria-hidden="true" data-jp="履歴書" />
                </a>
                <a
                  href="#work"
                  className="interactive group flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 border border-foreground/15 border-l-2 border-l-primary bg-foreground/[0.02] backdrop-blur-md text-foreground font-mono font-bold uppercase tracking-widest text-sm transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <ArrowDown size={14} className="text-primary-ink transition-transform duration-300 group-hover:translate-y-0.5" />
                  View Work
                  <span className="brush-jp text-base normal-case tracking-normal text-foreground/50" lang="ja" aria-hidden="true" data-jp="仕事" />
                </a>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4 mt-4 lg:mt-0 lg:ml-4">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/social relative w-11 h-11 flex items-center justify-center border border-foreground/10 bg-foreground/[0.02] text-foreground/60 transition-all duration-300 hover:border-primary hover:text-primary-ink hover:-translate-y-1 hover:shadow-[0_0_18px_rgba(188,0,45,0.35)] active:translate-y-0"
                    aria-label={s.name}
                  >
                    <span
                      className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-primary/0 group-hover/social:border-primary transition-colors duration-300"
                      aria-hidden="true"
                    />
                    <s.icon size={18} strokeWidth={1.5} />
                    <span
                      className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 bg-background border border-primary/40 font-mono text-[0.5625rem] font-bold tracking-[0.25em] uppercase text-primary-ink opacity-0 group-hover/social:opacity-100 transition-opacity duration-300"
                      aria-hidden="true"
                    >
                      {s.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Field record  live portfolio data, zero hardcodes */}
          <aside
            className="relative border border-foreground/10 bg-foreground/[0.02] backdrop-blur-sm p-6 md:p-7"
            aria-label="Field record"
          >
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50 pointer-events-none" />
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[2px] bg-primary" />
              <span className="font-mono text-[0.625rem] font-bold tracking-[0.35em] uppercase text-primary-ink">
                Field Record
              </span>
              <span className="brush-jp text-base text-foreground/30" lang="ja" aria-hidden="true" data-jp="記録" />
            </div>
            <dl className="flex flex-col">
              <FieldRow label="Status" value={PORTFOLIO_DATA.profile.availability} hot />
              <FieldRow label="Role" value={PORTFOLIO_DATA.profile.title} />
              <FieldRow label="Base" value={PORTFOLIO_DATA.profile.contact.location} />
              <FieldRow label="Focus" value={focusLabel} />
              <FieldRow label="Shipped" value={shippedLabel} />
              <FieldRow label="Languages" value={tongueCodes} />
            </dl>
          </aside>
        </div>
      </div>

      {/* ─── Bottom Japanese Quote ─── */}
      <div
        className="absolute bottom-10 left-10 hidden md:flex items-center gap-4"
        aria-hidden="true"
        role="img"
      >
        <div className="w-8 h-[1px] bg-primary/40" />
        <p className="text-[0.625rem] text-foreground/15 font-mono font-bold uppercase tracking-[0.5em]">
          継続は力なり  PERSEVERANCE IS POWER
        </p>
      </div>
    </section>
  );
}
