/*
 * app/cv/page.tsx — صفحة الـ CV بـ HTML
 *
 * ليه صفحة أصلاً وإحنا عندنا PDF؟
 *
 *  1. **أنظمة الـ ATS بتقرا HTML أحسن بكتير من PDF.** أغلب أنظمة التوظيف
 *     بتفشل في استخراج النص من PDF متعدد الأعمدة أو فيه أيقونات، وبتطلّع
 *     منه خليط مبعثر. الـ HTML بيتقرا كما هو.
 *  2. **جوجل بيفهرسها كصفحة.** الـ PDF بيتفهرس بس بترتيب أقل وبتجربة أسوأ.
 *  3. **الموبايل.** حد بيفتح لينك من لينكدإن مش هيقعد يزوّم في PDF.
 *  4. **مستحيل تبقى قديمة.** الصفحة بتتبني من نفس الـ config بتاع الموقع،
 *     فأي رقم بتغيّره بيتغيّر في الاتنين. النسخة المطبوعة من الصفحة دي
 *     (Ctrl+P) بتديك PDF متطابق مع الموقع تلقائياً.
 *
 * Server Component: كل الداتا بتتقري وقت الـ build والزائر بياخد HTML بس.
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

/** الـ desc في experience.ts سطر واحد مفصول بـ "•" — بيتحوّل لنقط هنا */
const toBullets = (desc: string): string[] =>
  desc.split("•").map((part) => part.trim()).filter(Boolean);

const dateRange = (start: string, end?: string): string =>
  `${formatDate(start)} — ${end ? formatDate(end) : "Present"}`;

/*
 * كل عنصر في knowledgeEducationItems عنده subTagHyperlink دلوقتي، فـ
 * TypeScript بيضيّق الفرع التاني بتاع `item.subTagHyperlink ? … : …` لـ
 * never ويرفض المشروع. الدالة دي بتفصل القرار عن التضييق، وبتفضل صح لو
 * ضفت بعدين عنصر من غير رابط.
 */
function OrgName({ name, href }: { name?: string; href?: string }) {
  if (!name) return null;
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">{name}</a>
  ) : (
    <>{name}</>
  );
}

export default function CvPage() {
  const work = knowledgeEducationItems.filter((item) => item.kind === "work");
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

          {/* data-print="hide" بيخفيها وقت الطباعة — مفيش معنى لزرار
              "Download" على ورقة مطبوعة */}
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
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          {work.map((item) => (
            <div key={`${item.tag}-${item.startDate}`} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3 className={styles.role}>{item.tag}</h3>
                <span className={styles.dates}>
                  {dateRange(item.startDate, "endDate" in item ? item.endDate : undefined)}
                </span>
              </div>
              <p className={styles.org} data-links="inline">
                <OrgName name={item.subTag} href={item.subTagHyperlink} />
              </p>
              <ul className={styles.bullets}>
                {toBullets(item.desc).map((line) => <li key={line}>{line}</li>)}
              </ul>
            </div>
          ))}
        </section>

        {/* ── Education ──────────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Education &amp; Training</h2>
          {education.map((item) => (
            <div key={`${item.tag}-${item.startDate}`} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3 className={styles.role}>{item.tag}</h3>
                <span className={styles.dates}>
                  {dateRange(item.startDate, "endDate" in item ? item.endDate : undefined)}
                </span>
              </div>
              <p className={styles.org} data-links="inline">{item.subTag}</p>
              <ul className={styles.bullets}>
                {toBullets(item.desc).map((line) => <li key={line}>{line}</li>)}
              </ul>
            </div>
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
