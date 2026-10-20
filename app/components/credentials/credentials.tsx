/*
 * A Server Component on purpose — no "use client".
 *
 * This file has zero hooks, zero handlers and zero use of window/document.
 * Static HTML rendering only. Yet it had "use client", which meant it bundled
 * the data it imports into the home page bundle:
 *
 *     certifications.ts   5,191 bytes
 *     skills.ts           4,140 bytes
 *     achievements.ts     2,426 bytes
 *
 * ~11.7 KB downloaded by every visitor to render markup that was already generated at
 * build time. As a server component that number becomes zero.
 *
 * That's why page.tsx renders it and passes it down as a prop until it reaches sensei-art —
 * anything a client component imports automatically becomes client code.
 */

/*
 * credentials.tsx
 * Author: Ahmed Emad Nasr
 *
 * Three things that were in the CV and not on the site at all:
 *
 *  1. Certifications as data — they were 74 images with no names, issuers or years.
 *  2. Achievements — Top 1% on TryHackMe, first out of 250 trainees, 44/450 in
 *     a CTF. These are the strongest things in the whole CV because they're third-party assessments, not self-description,
 *     and they weren't on the site in any form.
 *  3. Skill categories — they were tags scattered inside every experience entry and every case, with no
 *     single place saying "this is what I work with".
 *
 * This component mounts inside the existing Certifications section, above the image wall —
 * so there's no new id and no change to the nav or the scrollspy.
 */

import { memo } from "react";
import Link from "next/link";
import { certifications } from "@/app/core/config/certifications";
import { achievements } from "@/app/core/config/achievements";
import { skillGroups, languages } from "@/app/core/config/skills";
import styles from "./credentials.module.css";

const Credentials = memo(function Credentials() {
  /*
   * These three headings used to be <h3> under the section's <h2> («認定資格 •
   * Certifications»). That big heading was removed because it repeated the word
   * "Certifications" twice in a row.
   *
   * So they became <h2>. Had they stayed <h3>, the section would have had an h3 with no h2 above it —
   * a skipped heading level, and screen readers read the heading tree to
   * navigate, so the jump makes them look for a section that doesn't exist.
   *
   * For the same reason, the skill-group headings below became <h3> instead of <h4>: once these
   * became h2, the h4 inside them skipped a whole level. Lighthouse caught it.
   */
  return (
    <div className={styles.wrap}>
      {/* ── Certifications ───────────────────────────────────────────── */}
      <section className={styles.block} aria-labelledby="credentials-certs">
        <h2 className={styles.blockTitle} id="credentials-certs">
          Certifications
        </h2>
        <ul className={styles.certList}>
          {certifications.map((cert) => (
            <li key={cert.id} className={styles.cert}>
              <div className={styles.certMain}>
                <span className={styles.certName}>{cert.shortName ?? cert.name}</span>
                {cert.shortName && <span className={styles.certFull}>{cert.name}</span>}
              </div>
              <span className={styles.certYear}>{cert.year}</span>
              <span className={styles.certIssuer}>{cert.issuer}</span>
              {cert.verifyUrl ? (
                <a
                  className={styles.verify}
                  href={cert.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Verify
                </a>
              ) : (
                /* No verification link = no claim that it's verified. Better than
                   a Verify button that goes to an image. */
                <span className={styles.verifyMissing} aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Achievements ─────────────────────────────────────────────── */}
      <section className={styles.block} aria-labelledby="credentials-awards">
        <h2 className={styles.blockTitle} id="credentials-awards">
          Awards &amp; Rankings
        </h2>
        <ul className={styles.awardList}>
          {achievements.map((item) => (
            <li key={item.id} className={styles.award} data-kind={item.kind}>
              <span className={styles.awardTitle}>{item.title}</span>
              <span className={styles.awardContext}>
                {item.proofUrl ? (
                  <a href={item.proofUrl} target="_blank" rel="noopener noreferrer">
                    {item.context}
                  </a>
                ) : (
                  item.context
                )}
                {item.year ? ` · ${item.year}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Skills, linked to the reports that prove them ─────────────── */}
      <section className={styles.block} aria-labelledby="credentials-skills">
        <h2 className={styles.blockTitle} id="credentials-skills">
          Skills
        </h2>
        <p className={styles.skillsNote}>
          Where a report demonstrates the skill, it is linked directly.
        </p>
        <div className={styles.skillGrid}>
          {skillGroups.map((group) => (
            <div key={group.id} className={styles.skillGroup}>
              <h3 className={styles.skillLabel}>{group.label}</h3>
              <ul className={styles.skillItems}>
                {group.items.map((item) => (
                  <li key={item} className={styles.skillItem}>{item}</li>
                ))}
              </ul>
              {group.evidence && group.evidence.length > 0 && (
                <ul className={styles.evidenceList} data-links="inline">
                  {group.evidence.map((item) => (
                    <li key={item.id}>
                      <Link href={`/blog/${item.id}`}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <dl className={styles.languages}>
          <dt>Languages</dt>
          <dd>
            {languages.map((lang) => `${lang.name} (${lang.level})`).join(" · ")}
          </dd>
        </dl>
      </section>
    </div>
  );
});

export default Credentials;
