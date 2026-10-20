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
 */

import type { Metadata } from "next";
import Link from "next/link";
import { knowledgeEducationItems } from "@/app/core/config/experience";
import { projectBullets, staticProjectFallback } from "@/app/core/config/projects";
import { certifications } from "@/app/core/config/certifications";
import { achievements } from "@/app/core/config/achievements";
import { skillGroups, languages } from "@/app/core/config/skills";
import { normalizePublicHref, formatDate } from "@/app/core/config/shared";
import {
  CV_CONTACT,
  CV_SUMMARY,
  CV_PDF_HREF,
  RELEVANT_COURSEWORK,
} from "@/app/core/config/cv";
import { SITE_BASE_URL } from "@/app/core/config/site";
import styles from "./cv.module.css";

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

/*
 * The block for a single CV item.
 *
 * It was duplicated verbatim in the Experience and Education sections, and adding a
 * Volunteer section would have made it three copies. Identical copies like these are exactly what
 * let the orphaned header file sit in the project for months without anyone noticing.
 *
 * linkOrg: the education section showed the organisation name as text without a link, unlike
 * experience. That difference was preserved rather than unified unilaterally.
 */
function Entry({ item, linkOrg = true }: { item: TimelineItem; linkOrg?: boolean }) {
  return (
    <div className={styles.entry}>
      <div className={styles.entryHead}>
        <h3 className={styles.role}>{item.tag}</h3>
        <span className={styles.dates}>
          {dateRange(item.startDate, "endDate" in item ? item.endDate : undefined)}
        </span>
      </div>
      <p className={styles.org} data-links="inline">
        {linkOrg ? (
          <OrgName name={item.subTag} href={item.subTagHyperlink} />
        ) : (
          item.subTag
        )}
      </p>
      <ul className={styles.bullets}>
        {toBullets(item.desc).map((line) => <li key={line}>{line}</li>)}
      </ul>
    </div>
  );
}

/** A complete section. Not rendered at all if there are no items — so no empty heading appears. */
function EntrySection({ title, items }: { title: string; items: readonly TimelineItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {items.map((item) => (
        <Entry key={`${item.tag}-${item.startDate}`} item={item} />
      ))}
    </section>
  );
}

export default function CvPage() {
  const work = knowledgeEducationItems.filter((item) => item.kind === "work");
  const volunteer = knowledgeEducationItems.filter((item) => item.kind === "volunteer");
  const education = knowledgeEducationItems.filter((item) => item.kind === "education");

  return (
    <main className={styles.page} id="main-content">
      <article className={styles.sheet}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className={styles.head}>
          <h1 className={styles.name}>{CV_CONTACT.name}</h1>
          <p className={styles.headline}>{CV_CONTACT.headline}</p>

          <ul className={styles.contact} data-links="inline">
            <li>{CV_CONTACT.location}</li>
            <li><a href={`mailto:${CV_CONTACT.email}`}>{CV_CONTACT.email}</a></li>
            <li><a href={`tel:${CV_CONTACT.phone.replace(/\s/g, "")}`}>{CV_CONTACT.phone}</a></li>
            <li><a href={CV_CONTACT.linkedin.href} target="_blank" rel="noopener noreferrer">{CV_CONTACT.linkedin.label}</a></li>
            <li><a href={CV_CONTACT.github.href} target="_blank" rel="noopener noreferrer">{CV_CONTACT.github.label}</a></li>
          </ul>

          {/* data-print="hide" hides it when printing — there's no point in a
              "Download" button on a printed page */}
          <div className={styles.actions} data-print="hide">
            <a data-fx="btn" data-btn="solid" href={normalizePublicHref(CV_PDF_HREF)} download>
              Download PDF
            </a>
            <Link data-fx="btn" data-btn="outline" href="/">
              Back to portfolio
            </Link>
          </div>
        </header>

        <p className={styles.summary}>{CV_SUMMARY}</p>

        {/* ── Experience ─────────────────────────────────────────── */}
        <EntrySection title="Experience" items={work} />

        {/* ── Volunteer ──────────────────────────────────────────── */}
        <EntrySection title="Volunteer Experience" items={volunteer} />

        {/* ── Education ──────────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Education &amp; Training</h2>
          {education.map((item) => (
            <Entry key={`${item.tag}-${item.startDate}`} item={item} linkOrg={false} />
          ))}
          <p className={styles.coursework}>
            <strong>Relevant coursework:</strong> {RELEVANT_COURSEWORK.join(" · ")}
          </p>
        </section>

        {/* ── Projects ───────────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Projects</h2>
          {staticProjectFallback.map((repo) => {
            const bullets = projectBullets[repo.name];
            if (!bullets) return null;
            return (
              <div key={repo.id} className={styles.entry}>
                <div className={styles.entryHead}>
                  <h3 className={styles.role}>{repo.name.replace(/-/g, " ")}</h3>
                  <a className={styles.dates} data-fx="linkline" href={repo.html_url} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </div>
                <p className={styles.org} data-links="inline">{repo.topics.slice(0, 6).join(" · ")}</p>
                <ul className={styles.bullets}>
                  {bullets.map((line) => <li key={line}>{line}</li>)}
                </ul>
              </div>
            );
          })}
        </section>

        {/* ── Certifications ─────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Certifications</h2>
          <ul className={styles.plainList}>
            {certifications.map((cert) => (
              <li key={cert.id}>
                <strong>{cert.name}</strong> — {cert.issuer} ({cert.year})
                {cert.verifyUrl && (
                  <>
                    {" "}
                    <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer">verify</a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Awards ─────────────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Awards &amp; Rankings</h2>
          <ul className={styles.plainList}>
            {achievements.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong> — {item.proofUrl ? (
                  <a href={item.proofUrl} target="_blank" rel="noopener noreferrer">{item.context}</a>
                ) : item.context}
                {item.year ? ` (${item.year})` : ""}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Skills ─────────────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <dl className={styles.skills}>
            {skillGroups.map((group) => (
              <div key={group.id} className={styles.skillRow}>
                <dt>{group.label}</dt>
                <dd>{group.items.join(", ")}</dd>
              </div>
            ))}
            <div className={styles.skillRow}>
              <dt>Languages</dt>
              <dd>{languages.map((l) => `${l.name} (${l.level})`).join(", ")}</dd>
            </div>
          </dl>
        </section>

        <footer className={styles.foot} data-print="hide">
          <p>
            This page is generated from the same data as the{" "}
            <Link href="/">portfolio</Link> and the{" "}
            <Link href="/blog">case library</Link>, so it can never fall out of
            sync with them. Print it (Ctrl/Cmd + P) for a clean PDF.
          </p>
        </footer>
      </article>
    </main>
  );
}
