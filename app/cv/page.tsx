/*
 * app/cv/page.tsx — the CV page in HTML
 *
 * Why a page at all when we already have a PDF?
 *
 *  1. **ATS systems read HTML far better than PDF.** Most applicant-tracking systems
 *     fail to extract text from a multi-column PDF or one with icons, and produce
 *     a scrambled mix. HTML is read as-is.
 *  2. **Google indexes it as a page.** A PDF gets indexed, but ranks lower and with a worse experience.
 *  3. **Mobile.** Someone opening a link from LinkedIn won't sit and zoom into a PDF.
 *  4. **It can never go stale.** The page is built from the same config as the site,
 *     so any number you change changes in both. The printed version of this page
 *     (Ctrl+P) gives you a PDF that automatically matches the site.
 *
 * Server Component: all the data is read at build time and the visitor gets HTML only.
 * The look is the Sensei-Dev design (experience "service record" panels);
 * print: variants turn it back into a plain one-column page on paper.
 */

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { knowledgeEducationItems } from "@/app/core/config/experience";
import { certifications } from "@/app/core/config/certifications";
import { achievements } from "@/app/core/config/achievements";
import { languages } from "@/app/core/config/skills";
import { normalizePublicHref, formatDate } from "@/app/core/config/shared";
import {
  CV_CONTACT,
  CV_SUMMARY,
  CV_PDF_HREF,
  CV_PROJECTS,
  CV_SKILLS,
  RELEVANT_COURSEWORK,
} from "@/app/core/config/cv";
import { SITE_BASE_URL, OG_IMAGE } from "@/app/core/config/site";
import { Download, ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { Github, Linkedin } from "@/app/core/icons/BrandIcons";
import { PageShell, KanjiWatermark, ctaPrimary, ctaSecondary } from "@/app/components/shared/kit";

/* ── classes ─────────────────────────────────────────────────────────── */
/* print: = the Ctrl/Cmd+P version — a compact, single-column CV on paper */
const sectionWrap = "mt-20 print:mt-[14pt]";
const panel =
  "spotlight relative bg-surface/60 border border-foreground/5 backdrop-blur-sm hover:border-primary/20 transition-all duration-700 overflow-hidden " +
  "print:bg-transparent print:border-0 print:backdrop-blur-none print:overflow-visible";
const entryWrap =
  "relative px-6 md:px-10 py-7 border-b border-foreground/5 last:border-b-0 break-inside-avoid print:px-0 print:py-[5pt] print:border-0";
const roleClass = "font-display text-xl md:text-2xl font-black uppercase tracking-tight text-foreground print:text-[11pt] print:font-bold print:normal-case print:tracking-normal";
const datesClass = "font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 whitespace-nowrap print:text-[8.5pt] print:tracking-normal";
const orgClass = "mt-2 font-mono text-xs font-black uppercase tracking-[0.2em] text-accent print:text-[9pt] print:tracking-normal print:text-black";
const bulletList = "mt-4 flex flex-col gap-2 print:mt-[3pt] print:gap-[1pt]";
const bulletItem =
  "relative pl-5 text-sm text-on-surface-variant font-light leading-relaxed before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:bg-primary/70 " +
  "print:text-[9pt] print:leading-[1.35] print:text-black print:before:bg-black";

function SectionTitle({ children, japanese }: { children: ReactNode; japanese: string }) {
  return (
    <div className="flex items-center gap-4 mb-6 print:mb-[4pt] print:border-b print:border-black print:pb-[2pt]">
      <div className="w-12 h-[2px] bg-primary print:hidden" aria-hidden="true" />
      <h2 className="text-primary text-[11px] font-mono font-bold tracking-[0.35em] uppercase print:text-black print:text-[9.5pt] print:tracking-[0.15em]">
        {children}
      </h2>
      <span className="jp-eyebrow text-[11px] text-foreground/30 print:hidden" lang="ja">{japanese}</span>
    </div>
  );
}

export const metadata: Metadata = {
  title: "CV — Ahmed Emad Nasr | SOC Analyst & Incident Responder",
  description:
    "Full CV for Ahmed Emad Nasr: SOC operations, incident response and DFIR experience, security certifications, projects, and published investigation reports.",
  alternates: { canonical: "/cv" },
  openGraph: {
    title: "CV — Ahmed Emad Nasr",
    description: "SOC Analyst, Incident Response and DFIR — full CV.",
    url: `${SITE_BASE_URL}/cv`,
    type: "profile",
    images: [OG_IMAGE],
  },
};

/** The desc in experience.ts is a single line separated by "•" — it's turned into bullets here */
const toBullets = (desc: string): string[] =>
  desc.split("•").map((part) => part.trim()).filter(Boolean);

const dateRange = (start: string, end?: string): string =>
  `${formatDate(start)} — ${end ? formatDate(end) : "Present"}`;

/*
 * Every item in knowledgeEducationItems now has a subTagHyperlink, so
 * TypeScript narrows the second branch of `item.subTagHyperlink ? … : …` to
 * never and rejects the project. This function separates the decision from the narrowing, and stays correct if
 * an item without a link is added later.
 */
function OrgName({ name, href }: { name?: string; href?: string }) {
  if (!name) return null;
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">{name}</a>
  ) : (
    <>{name}</>
  );
}

type TimelineItem = (typeof knowledgeEducationItems)[number];

/** Entries marked `cv: false` in the config are on the site but not in the CV PDF */
const onCv = (item: object) => !("cv" in item && (item as { cv?: boolean }).cv === false);
const newestFirst = (a: TimelineItem, b: TimelineItem) => b.startDate.localeCompare(a.startDate);

function Entry({ item, linkOrg = true }: { item: TimelineItem; linkOrg?: boolean }) {
  return (
    <div className={entryWrap}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className={roleClass}>{item.tag}</h3>
        <span className={datesClass}>
          {dateRange(item.startDate, "endDate" in item ? item.endDate : undefined)}
        </span>
      </div>
      <p className={orgClass}>
        {linkOrg ? <OrgName name={item.subTag} href={item.subTagHyperlink} /> : item.subTag}
      </p>
      <ul className={bulletList}>
        {toBullets(item.desc).map((line) => (
          <li key={line} className={bulletItem}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

/** A complete section. Not rendered at all if there are no items — so no empty heading appears. */
function EntrySection({ title, japanese, items }: { title: string; japanese: string; items: readonly TimelineItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className={sectionWrap}>
      <SectionTitle japanese={japanese}>{title}</SectionTitle>
      <div className={panel}>
        <div className="absolute top-0 left-0 w-[3px] h-full bg-primary print:hidden" aria-hidden="true" />
        {items.map((item) => (
          <Entry key={`${item.tag}-${item.startDate}`} item={item} />
        ))}
      </div>
    </section>
  );
}

export default function CvPage() {
  const cvItems = knowledgeEducationItems.filter(onCv);
  /* Newest start date first — the order the PDF uses */
  const work = cvItems.filter((item) => item.kind === "work").sort(newestFirst);
  const volunteer = cvItems.filter((item) => item.kind === "volunteer").sort(newestFirst);
  const education = cvItems.filter((item) => item.kind === "education");

  const contactLink = "flex items-center gap-2 hover:text-primary transition-colors print:text-black";

  return (
    <PageShell>
      <article className="relative px-6 md:px-20 pt-36 md:pt-44 pb-24 overflow-hidden print:p-0">
        <KanjiWatermark chars="履歴書" side="right" />
        <div className="max-w-5xl mx-auto relative z-10">
          {/* ── Header ─────────────────────────────────────────────── */}
          <header className="pb-10 border-b border-foreground/10 print:pb-[8pt] print:border-black">
            <div className="flex items-center gap-4 mb-5 print:hidden">
              <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
              <span className="text-primary text-[11px] font-mono font-bold tracking-[0.35em] uppercase">Curriculum Vitae</span>
              <span className="jp-eyebrow text-[11px] text-foreground/30" lang="ja">履歴書</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] print:text-[22pt] print:normal-case print:tracking-normal print:text-black">
              <span className="text-foreground print:text-black">{CV_CONTACT.name.split(" ")[0]}</span>{" "}
              <span className="text-primary italic print:text-black print:not-italic">{CV_CONTACT.name.split(" ").slice(1).join(" ")}</span>
            </h1>
            <p className="mt-4 font-mono text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-accent print:text-[9pt] print:tracking-normal print:text-black">
              {CV_CONTACT.headline}
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs text-on-surface-variant print:text-[8.5pt] print:gap-x-[12pt]">
              <li className="flex items-center gap-2"><MapPin size={13} className="text-primary print:hidden" /> {CV_CONTACT.location}</li>
              <li><a className={contactLink} href={`mailto:${CV_CONTACT.email}`}><Mail size={13} className="text-primary print:hidden" /> {CV_CONTACT.email}</a></li>
              <li><a className={contactLink} href={`tel:${CV_CONTACT.phone.replace(/\s/g, "")}`}><Phone size={13} className="text-primary print:hidden" /> {CV_CONTACT.phone}</a></li>
              <li><a className={contactLink} href={CV_CONTACT.linkedin.href} target="_blank" rel="noopener noreferrer"><Linkedin size={13} className="text-primary print:hidden" /> {CV_CONTACT.linkedin.label}</a></li>
              <li><a className={contactLink} href={CV_CONTACT.github.href} target="_blank" rel="noopener noreferrer"><Github size={13} className="text-primary print:hidden" /> {CV_CONTACT.github.label}</a></li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-4 print:hidden">
              <a className={ctaPrimary} href={normalizePublicHref(CV_PDF_HREF)} download style={{ clipPath: "polygon(0 0, 100% 0, 96% 100%, 4% 100%)" }}>
                <Download size={16} className="transition-transform duration-300 group-hover:translate-y-0.5" />
                RESUME.pdf
                <span className="brush-jp text-base normal-case tracking-normal opacity-70" lang="ja">履歴書</span>
              </a>
              <Link className={ctaSecondary} href="/">
                <ArrowLeft size={14} className="text-primary transition-transform duration-300 group-hover:-translate-x-0.5" />
                Portfolio
              </Link>
            </div>
          </header>

          <p className="mt-10 max-w-3xl text-base md:text-lg font-light text-foreground/80 leading-relaxed border-l-2 border-primary/60 pl-5 italic print:mt-[8pt] print:text-[9.5pt] print:not-italic print:border-0 print:pl-0 print:text-black">
            {CV_SUMMARY}
          </p>

          <EntrySection title="Experience" japanese="職歴" items={work} />
          <EntrySection title="Volunteer Experience" japanese="奉仕" items={volunteer} />

          {/* ── Education ──────────────────────────────────────────── */}
          <section className={sectionWrap}>
            <SectionTitle japanese="学歴">Education &amp; Training</SectionTitle>
            <div className={panel}>
              <div className="absolute top-0 left-0 w-[3px] h-full bg-primary print:hidden" aria-hidden="true" />
              {education.map((item) => (
                <Entry key={`${item.tag}-${item.startDate}`} item={item} linkOrg={false} />
              ))}
              <p className="px-6 md:px-10 pb-7 text-sm text-on-surface-variant font-light print:px-0 print:pb-0 print:text-[9pt] print:text-black">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 print:text-black">Relevant coursework  </span>
                {RELEVANT_COURSEWORK.join(" · ")}
              </p>
            </div>
          </section>

          {/* ── Projects ───────────────────────────────────────────── */}
          <section className={sectionWrap}>
            <SectionTitle japanese="仕事">Projects</SectionTitle>
            <div className={panel}>
              <div className="absolute top-0 left-0 w-[3px] h-full bg-primary print:hidden" aria-hidden="true" />
              {CV_PROJECTS.map((project) => (
                <div key={project.title} className={entryWrap}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <h3 className={roleClass}>{project.title}</h3>
                    <span className={`${datesClass} flex gap-3`}>
                      <a className="hover:text-primary transition-colors" href={project.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                      {project.demo && (
                        <>
                          <span className="text-primary" aria-hidden="true">•</span>
                          <a className="hover:text-primary transition-colors" href={project.demo} target="_blank" rel="noopener noreferrer">Demo</a>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 print:hidden">
                    {project.stack.map((t) => (
                      <span key={t} className="px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-tertiary bg-tertiary/10 border border-tertiary/25">{t}</span>
                    ))}
                  </div>
                  <p className="hidden print:block print:text-[8.5pt] print:text-black">{project.stack.join(", ")}</p>
                  <ul className={bulletList}>
                    {project.bullets.map((line) => (
                      <li key={line} className={bulletItem}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ── Certifications & awards ────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 print:grid-cols-1">
            <section className={sectionWrap}>
              <SectionTitle japanese="認定">Certifications</SectionTitle>
              <ul className="flex flex-col border-t border-foreground/10 print:border-0">
                {certifications.filter(onCv).map((cert) => (
                  <li key={cert.id} className="flex items-baseline justify-between gap-4 py-3 border-b border-foreground/10 print:py-[1pt] print:border-0">
                    <span className="text-sm text-foreground print:text-[9pt] print:text-black">
                      <span className="font-bold">{cert.name}</span>
                      <span className="text-on-surface-variant print:text-black"> — {cert.issuer}</span>
                      {cert.verifyUrl && (
                        <>
                          {" "}
                          <a className="text-primary underline underline-offset-4" href={cert.verifyUrl} target="_blank" rel="noopener noreferrer">verify</a>
                        </>
                      )}
                    </span>
                    <span className="font-mono text-xs font-black text-accent tabular-nums shrink-0 print:text-black print:text-[8.5pt]">{cert.year}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={sectionWrap}>
              <SectionTitle japanese="実績">Awards &amp; Rankings</SectionTitle>
              <ul className="flex flex-col border-t border-foreground/10 print:border-0">
                {achievements.filter(onCv).map((item) => (
                  <li key={item.id} className="flex items-baseline justify-between gap-4 py-3 border-b border-foreground/10 print:py-[1pt] print:border-0">
                    <span className="text-sm text-foreground print:text-[9pt] print:text-black">
                      <span className="font-bold">{item.title}</span>
                      <span className="text-on-surface-variant print:text-black">
                        {" — "}
                        {item.proofUrl ? (
                          <a className="text-primary underline underline-offset-4" href={item.proofUrl} target="_blank" rel="noopener noreferrer">{item.context}</a>
                        ) : (
                          item.context
                        )}
                      </span>
                    </span>
                    {item.year ? (
                      <span className="font-mono text-xs font-black text-accent tabular-nums shrink-0 print:text-black print:text-[8.5pt]">{item.year}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* ── Skills ─────────────────────────────────────────────── */}
          <section className={sectionWrap}>
            <SectionTitle japanese="技能">Skills</SectionTitle>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-[1pt]">
              {[...CV_SKILLS, { label: "Languages", items: languages.map((l) => `${l.name} (${l.level})`) }].map((group) => (
                <div
                  key={group.label}
                  className="spotlight spotlight-blue group relative bg-surface/60 border border-foreground/5 p-6 hover:border-tertiary/50 transition-colors duration-500 break-inside-avoid print:bg-transparent print:border-0 print:p-0 print:flex print:gap-[6pt]"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-tertiary/0 group-hover:bg-tertiary transition-colors duration-500 print:hidden" aria-hidden="true" />
                  <dt className="font-display text-base font-black uppercase tracking-tight text-foreground mb-3 print:mb-0 print:text-[9pt] print:font-bold print:normal-case print:tracking-normal print:text-black print:shrink-0">
                    {group.label}
                  </dt>
                  <dd className="flex flex-wrap gap-2 print:hidden">
                    {group.items.map((it) => (
                      <span key={it} className="px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-foreground bg-tertiary/10 border border-tertiary/40">{it}</span>
                    ))}
                  </dd>
                  <dd className="hidden print:block print:text-[9pt] print:text-black">{group.items.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </section>

          <p className="mt-16 pt-8 border-t border-foreground/5 font-mono text-[10px] uppercase tracking-[0.25em] leading-relaxed text-foreground/40 print:hidden">
            Generated from the same data as the{" "}
            <Link className="text-primary underline underline-offset-4" href="/">portfolio</Link> and the{" "}
            <Link className="text-primary underline underline-offset-4" href="/#cases">case library</Link>  print it (Ctrl/Cmd + P) for a clean PDF.
          </p>
        </div>
      </article>
    </PageShell>
  );
}
