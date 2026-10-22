"use client";

import Image from "next/image";
import { m as motion } from "framer-motion";
import { EASE } from "@/app/core/motion";
import { useState } from "react";
import dynamic from "next/dynamic";
import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";
import { TiltCard } from "@/app/core/components/Motion";
import "yet-another-react-lightbox/styles.css";
import { Award, ExternalLink, Calendar, ShieldCheck } from "lucide-react";
import { rv } from "@/app/core/reveal";

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });

export default function CredentialsGallery() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  /* Only credentials with a scan open in the lightbox; the rest link out
     to their proof (when there is one) or stay as a card. */
  const withImage = PORTFOLIO_DATA.certificates.filter((c) => c.image);
  const slides = withImage.map((c) => ({
    src: c.image as string,
    title: c.title,
  }));

  const openCert = (cert: (typeof PORTFOLIO_DATA.certificates)[number]) => {
    if (cert.image) {
      setIndex(withImage.indexOf(cert));
      setOpen(true);
    } else if (cert.link) {
      window.open(cert.link, "_blank", "noopener");
    }
  };

  return (
    <section id="certificates" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      {/* Background Decorative Kanji */}
      <div
        className="absolute left-10 top-20 pointer-events-none select-none text-foreground/[0.03] text-[15vw] font-black z-0 vertical-text uppercase"
        aria-hidden="true"
        role="img"
      >
        <span>実</span>
        <span>績</span>
        <span>認</span>
        <span>定</span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div
  className="mb-16 md:mb-20 flex flex-col lg:flex-row justify-between lg:items-end gap-8"
  data-reveal={rv({ x: -40, y: 0, duration: 0.8 })}
>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-primary" />
              <span className="text-primary-ink text-xs font-black tracking-[0.4em] uppercase font-mono">
                Credentials
              </span>
            </div>
            <h2 className="font-display title-fit [--title-n:14] lg:[--title-n:18] font-black uppercase leading-[0.85] tracking-tighter">
              <span className="text-foreground">Certifications</span> <br />
              <span className="text-primary italic">&amp; Achievements.</span>
            </h2>
          </div>

          {/* Counter */}
          <div className="relative px-6 py-3 border border-foreground/10 bg-surface/60 backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent" />
            <div className="flex items-center gap-3">
              <span className="font-mono text-accent text-2xl font-black">
                {String(PORTFOLIO_DATA.certificates.length).padStart(2, "0")}
              </span>
              <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                Sealed
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {PORTFOLIO_DATA.certificates.map((cert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (idx % 2) * 0.15, duration: 0.8, ease: EASE }}
              onClick={() => openCert(cert)}
              /* The card was mouse-only: a clickable <div> with no role or
                 tab stop, so keyboard and screen-reader users could not open
                 a single certificate. */
              {...(cert.image || cert.link
                ? {
                    role: "button",
                    tabIndex: 0,
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openCert(cert);
                      }
                    },
                  }
                : {})}
              className={cert.image || cert.link ? "cursor-pointer focus-visible:outline-offset-4" : undefined}
            >
              <TiltCard className="spotlight relative group bg-surface/60 border border-foreground/5 overflow-hidden backdrop-blur-xl hover:border-accent/40 transition-all duration-700 h-full"
              >
                <div className="flex flex-col xl:flex-row h-full">
                  {/* Certificate Image  40% width on desktop */}
                  <div className="w-full xl:w-2/5 h-40 xl:h-auto xl:min-h-[13rem] relative overflow-hidden">
                    {cert.image ? (
                      <Image
                        src={cert.image}
                        alt={cert.title}
                        width={400}
                        height={300}
                        loading="lazy"
                        sizes="(max-width: 1024px) 100vw, 400px"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      /* No scan on file: the seal panel stands in for it */
                      <div className="halftone absolute inset-0 flex items-center justify-center bg-foreground/[0.03] transition-transform duration-1000 group-hover:scale-110">
                        <span className="px-4 text-center font-display text-2xl md:text-3xl font-black uppercase leading-tight tracking-tight [overflow-wrap:anywhere] text-foreground/80 group-hover:text-accent transition-colors duration-500">
                          {cert.mark}
                        </span>
                      </div>
                    )}

                    {/* Red seal overlay */}
                    <div className="absolute inset-0 bg-primary/10 mix-blend-multiply group-hover:bg-transparent transition-all duration-700" />

                    {/* Seal stamp effect */}
                    <div className="absolute top-4 right-4 w-14 h-14 rounded-full border-2 border-primary/40 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:border-primary transition-all duration-500">
                      <span className="text-primary-ink font-black text-[0.625rem] font-mono tracking-wider rotate-[-12deg]">
                        認定
                      </span>
                    </div>

                    {/* Expand icon overlay */}
                    {(cert.image || cert.link) && (
                      <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <div className="p-3 bg-foreground/10 backdrop-blur-xl border border-foreground/20">
                          <ExternalLink className="text-foreground" size={22} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="w-full xl:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-accent mb-5">
                      <ShieldCheck size={18} />
                      <span className="font-mono text-[0.625rem] tracking-[0.3em] font-bold uppercase">
                        {cert.kind === "award" ? "Achievement" : "Certification"}
                      </span>
                    </div>

                    <h3 className="font-display text-xl md:text-2xl xl:text-xl font-black mb-5 text-foreground group-hover:text-accent transition-colors duration-300 leading-tight uppercase tracking-tight [overflow-wrap:anywhere]">
                      {cert.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-on-surface-variant text-sm">
                      <div className="flex items-center gap-2">
                        <Award size={14} className="text-accent" />
                        <span className="font-mono text-xs">{cert.issuer}</span>
                      </div>
                      {cert.date && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-on-surface-variant/60" />
                          <span className="font-mono text-xs">{cert.date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Japanese Decorative 認定 Watermark  more visible on hover */}
                <div
                  className="absolute bottom-4 right-6 text-foreground/[0.04] font-black text-7xl select-none group-hover:text-accent/15 transition-colors duration-700 pointer-events-none"
                  aria-hidden="true"
                >
                  認定
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/0 group-hover:border-primary/40 transition-colors duration-500" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/0 group-hover:border-primary/40 transition-colors duration-500" />
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>

      {open && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={index}
          slides={slides}
          styles={{ container: { backgroundColor: "rgba(0, 0, 0, 0.98)" } }}
        />
      )}
    </section>
  );
}
