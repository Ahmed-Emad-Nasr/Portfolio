/* The home page's door to /gallery: three fast-track tracks to start with and the full certificate count */

import PageLink from "@/components/ui/PageLink";
import { ArrowRight, Images } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { ALL_GALLERY_CERTIFICATES, GALLERY_IMAGE_COUNT } from "@/data/certifications";
import { Eyebrow, KanjiWatermark, ctaPrimary, ctaSecondary } from "@/components/ui/kit";
import FadeIn from "@/components/ui/FadeIn";

const FAST_TRACK = [
  {
    n: "01",
    meta: "01 • VALIDATED CERTIFICATE",
    title: "Information Security Officer",
    why: "Validated by top certifications including INE eJPT v2, Red Hat RH124, Cisco CCNA, CCEP, Huawei HCIA and security fundamentals.",
    href: "/gallery#all-certificates",
  },
  {
    n: "02",
    meta: "02 • HANDS-ON LABS",
    title: "Tactical Hands-On Training & Labs",
    why: "Over 79 documented cases, CTFs, TryHackMe SOC Level 1 & 2, DEPI Incident Response & Forensics tracks, and ITI Pentesting Bootcamp.",
    href: "/gallery#all-certificates",
  },
  {
    n: "03",
    meta: "03 • ENDORSEMENTS",
    title: "Community Events & Endorsements",
    why: "Photos from classrooms, 300+ students taught at AMIT & NTI, hackathons, cybersecurity events and peer endorsements.",
    href: "/gallery#visual-archive",
  },
] as const;

export default function GalleryTeaser() {
  return (
    <section id="gallery-preview" aria-label="Proof gallery" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <KanjiWatermark chars="収集" side="left" />
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="Gallery // Visual archive"
          japanese="収集"
          titleA="Proof"
          titleB="Gallery."
          description={`${GALLERY_IMAGE_COUNT} certificates, events, classroom moments and digital badges — the complete proof behind my cybersecurity journey.`}
        />

        <div className="relative mb-20">
          <Eyebrow japanese="入門">Fast Track // Quick Access</Eyebrow>
          <h3 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground mb-3">
            Start <span className="text-primary italic">Here.</span>
          </h3>
          <p className="mb-10 max-w-2xl text-foreground/60 font-light leading-relaxed">
            Want to check my top certificates? Three to start with — core certifications, hands-on labs and peer endorsements. All {ALL_GALLERY_CERTIFICATES.length} certificates are indexed in the gallery.
          </p>
          <ol className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {FAST_TRACK.map((item) => (
              <li key={item.n}>
                <PageLink
                  href={item.href}
                  className="relative spotlight block h-full bg-surface/60 border border-foreground/5 p-7 hover:border-primary/40 transition-colors duration-500 group"
                >
                  <div
                    className="font-mono text-5xl font-black text-foreground/[0.06] absolute top-4 right-5 select-none"
                    aria-hidden="true"
                    data-deco={item.n}
                  />
                  <div className="font-mono text-[0.625rem] text-primary-ink tracking-[0.3em] uppercase mb-3">
                    {item.meta}
                  </div>
                  <h4 className="font-display text-xl font-black uppercase text-foreground mb-3 group-hover:text-primary-ink transition-colors duration-300 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed">
                    {item.why}
                  </p>
                </PageLink>
              </li>
            ))}
          </ol>
        </div>

        <FadeIn y={20} duration={0.6} className="flex flex-wrap gap-4">
          <PageLink href="/gallery" className={ctaPrimary}>
            <Images size={16} aria-hidden="true" />
            Open Proof Gallery
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </PageLink>
          <PageLink href="/gallery#all-certificates" className={ctaSecondary}>
            All certificates <span className="font-mono text-accent tabular-nums">{ALL_GALLERY_CERTIFICATES.length}</span>
          </PageLink>
        </FadeIn>
      </div>
    </section>
  );
}
