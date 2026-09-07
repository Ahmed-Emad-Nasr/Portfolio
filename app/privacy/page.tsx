/*
 * app/privacy/page.tsx — سياسة الخصوصية
 *
 * Server Component. النص كله ثابت ومبني وقت الـ build.
 *
 * ⚠️ الصفحة دي بتوصف سلوك الموقع الفعلي. الحقائق جاية من
 * core/config/legal.ts عشان متتكتبش مرتين — لو غيّرت الكود (فعّلت
 * تحليلات، ضفت فورم، ضفت تضمين) غيّر هناك والصفحة بتتحدّث لوحدها.
 *
 * ⚠️ ودي **مش استشارة قانونية**. النص مكتوب على أساس الوضع الفعلي
 * للموقع، بس لو الموقع اتحوّل لنشاط تجاري أو بقى بيجمع بيانات، لازم
 * محامي يراجع.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { SITE_BASE_URL } from "@/app/core/config/site";
import { LEGAL_CONTACT, LEGAL_LAST_UPDATED, SITE_FACTS } from "@/app/core/config/legal";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Ahmed Emad Nasr",
  description:
    "What this site does and does not collect. No analytics, no cookies, no tracking, and no contact form.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — Ahmed Emad Nasr",
    description: "No analytics, no cookies, no tracking.",
    url: `${SITE_BASE_URL}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.sheet}>
        <Link href="/" className={styles.backLink}>← Back to the site</Link>

        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: {LEGAL_LAST_UPDATED}</p>

        <div className={styles.summary}>
          <p>
            <strong>The short version.</strong> This is a personal portfolio. It
            has no analytics, sets no cookies, runs no tracking, and has no
            contact form. Nothing you do here is recorded by me.
          </p>
          <p>
            The one exception is ordinary server logs kept by the host, and
            YouTube — which only loads if you click a video yourself.
          </p>
        </div>

        <section className={styles.section}>
          <h2>Who runs this site</h2>
          <p>
            This site is a personal portfolio operated by an individual,{" "}
            {LEGAL_CONTACT.name}, based in {LEGAL_CONTACT.country}. It is not a
            company and sells nothing. For any privacy question, email{" "}
            <a href={`mailto:${LEGAL_CONTACT.email}`}>{LEGAL_CONTACT.email}</a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>What is not collected</h2>
          <p>
            To be specific rather than vague, here is what this site does{" "}
            <strong>not</strong> do:
          </p>
          <ul>
            <li>No analytics of any kind. No Google Analytics, no Plausible, no pixels.</li>
            <li>No cookies. The site sets none, first-party or third-party.</li>
            <li>No advertising, no advertising networks, no profiling.</li>
            <li>No contact form, newsletter, or sign-up. There is nowhere to submit personal data.</li>
            <li>No accounts, no logins, no user profiles.</li>
            <li>Your data is never sold or shared, because none is collected.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>What is stored in your browser</h2>
          <p>
            The site stores a small amount of data locally on your own device so
            the interface behaves sensibly. This stays on your device and is
            never transmitted:
          </p>
          <ul>
            {SITE_FACTS.BROWSER_STORAGE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            A service worker also caches pages and images so the site loads
            faster on repeat visits and keeps working offline. That cache lives
            on your device. Clearing your browser data removes all of it.
          </p>
          <p>
            This is functional storage that the site needs to work as intended.
            It is not used to identify you, follow you, or build any profile.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Third parties</h2>
          <p>
            Very few requests leave your browser to anyone other than the host:
          </p>
          <ul>
            {SITE_FACTS.THIRD_PARTY.map((t) => (
              <li key={t.name}>
                <strong>{t.name}</strong> — {t.when}. {t.note}.
              </li>
            ))}
          </ul>
          <h3>YouTube videos</h3>
          <p>
            Videos in the blog are <strong>not</strong> loaded until you click
            the preview. Until then, nothing is requested from YouTube and
            YouTube does not know you are here. When you do click, the embed
            uses the <code>youtube-nocookie.com</code> domain, and from that
            point Google&apos;s own privacy policy applies to that player.
          </p>
          <h3>Hosting</h3>
          <p>
            The site is hosted on GitHub Pages. Like any web host, GitHub
            receives your IP address and browser user-agent in order to serve
            the page, and may keep those in server logs. I have no access to
            those logs and cannot read them. GitHub&apos;s handling of that data
            is governed by its own privacy statement.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Cookies</h2>
          <p>
            This site sets no cookies. There is no cookie banner because there
            is nothing to consent to — showing a consent banner for storage that
            does not exist would be misleading rather than helpful.
          </p>
          <p>
            The local storage described above is limited to remembering an
            interface preference on your own device. Under the ePrivacy Directive
            and comparable rules, storage that is strictly necessary for a
            service the user has requested does not require consent. If tracking
            or analytics are ever added to this site, this section and the
            consent position will be revisited before they go live.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Emailing me</h2>
          <p>
            The email link on this site opens your own mail application. Nothing
            is sent through the site itself. If you choose to email me, I will
            have whatever you put in that email — your address and its contents —
            and I keep it only for as long as needed to reply and to keep a
            record of the conversation. I do not add anyone to a mailing list.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Your rights</h2>
          <p>
            Because no personal data is collected through this site, there is
            generally nothing to access, correct, or delete. If you have emailed
            me and want that correspondence deleted, email me and I will remove
            it.
          </p>
          <p>
            Depending on where you live, you may have rights under laws such as
            Egypt&apos;s Personal Data Protection Law (Law No. 151 of 2020), the
            EU/UK GDPR, or similar. Those rights apply to any personal data I
            actually hold, which for this site means email correspondence and
            nothing else.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Children</h2>
          <p>
            This site is a professional portfolio aimed at employers and
            colleagues. It is not directed at children and collects no data from
            anyone, including children.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Changes</h2>
          <p>
            If the site changes in a way that affects this policy — for example
            if analytics or a contact form are added — this page will be updated
            and the date at the top changed before that feature goes live.
          </p>
        </section>
      </div>
    </main>
  );
}
