/* Privacy policy. Its facts come from data/legal.ts — update that file when
   the site starts loading or storing something new. Not legal advice. */

import type { Metadata } from "next";
import Link from "next/link";
import { SITE_BASE_URL, OG_IMAGE } from "@/lib/site";
import { LEGAL_CONTACT, LEGAL_LAST_UPDATED, SITE_FACTS } from "@/data/legal";
import { PageShell, legalBackLink, legalPage, legalSection, legalSheet, legalSummary, legalTitle, legalUpdated } from "@/components/ui/kit";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What this site does and does not collect. No cookies, no tracking, and nothing submitted to a server.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — Ahmed Emad Nasr",
    description: "No cookies, no tracking.",
    url: `${SITE_BASE_URL}/privacy`,
    images: [OG_IMAGE],
  },
};

export default function PrivacyPage() {
  return (
    <PageShell>
    <article className={legalPage}>
      <div className={legalSheet}>
        <Link href="/" className={legalBackLink}>← Back to the site</Link>

        <h1 className={legalTitle}>Privacy Policy</h1>
        <p className={legalUpdated}>Last updated: {LEGAL_LAST_UPDATED}</p>

        <div className={legalSummary}>
          <p>
            <strong>The short version.</strong> This is a personal portfolio. It
            sets no cookies, runs no tracking, and nothing you type is sent to a
            server. Nothing you do here is recorded by me.
          </p>
          <p>
            The exceptions are ordinary server logs kept by the host, a public
            GitHub statistics service that draws the contribution graph, and
            YouTube — its preview images load with the video section, and the
            player itself only if you click a video.
          </p>
        </div>

        <section className={legalSection}>
          <h2>Who runs this site</h2>
          <p>
            This site is a personal portfolio operated by an individual,{" "}
            {LEGAL_CONTACT.name}, based in {LEGAL_CONTACT.country}. It is not a
            company and sells nothing. For any privacy question, email{" "}
            <a href={`mailto:${LEGAL_CONTACT.email}`}>{LEGAL_CONTACT.email}</a>.
          </p>
        </section>

        <section className={legalSection}>
          <h2>What is not collected</h2>
          <p>
            To be specific rather than vague, here is what this site does{" "}
            <strong>not</strong> do:
          </p>
          <ul>
            <li>No tracking scripts, no advertising pixels, no session recording.</li>
            <li>No cookies. The site sets none, first-party or third-party.</li>
            <li>No advertising, no advertising networks, no profiling.</li>
            <li>No newsletter, sign-up, or server-side form. The contact form on the home page does not submit anywhere — it only opens your own email app with the message filled in.</li>
            <li>No accounts, no logins, no user profiles.</li>
            <li>Your data is never sold or shared, because none is collected.</li>
          </ul>
        </section>

        <section className={legalSection}>
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

        <section className={legalSection}>
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
            The video player is <strong>not</strong> loaded until you click
            a preview. Before that, the only request to Google is for the
            preview images themselves (from <code>i.ytimg.com</code>) — no
            player, no script and no cookies. When you do click, the embed
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

        <section className={legalSection}>
          <h2>Cookies</h2>
          <p>
            This site sets no cookies. There is no cookie banner because there
            is nothing to consent to — showing a consent banner for storage that
            does not exist would be misleading rather than helpful.
          </p>
          <p>
            The local storage described above is limited to remembering
            interface preferences on your own device. Under the ePrivacy Directive
            and comparable rules, storage that is strictly necessary for a
            service the user has requested does not require consent. If tracking
            or non-essential cookies are ever added to this site, this section and
            the consent position will be revisited before they go live.
          </p>
        </section>

        <section className={legalSection}>
          <h2>Emailing me</h2>
          <p>
            The email link and the contact form on this site both open your own
            mail application. Nothing is sent through the site itself. If you choose to email me, I will
            have whatever you put in that email — your address and its contents —
            and I keep it only for as long as needed to reply and to keep a
            record of the conversation. I do not add anyone to a mailing list.
          </p>
        </section>

        <section className={legalSection}>
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

        <section className={legalSection}>
          <h2>Children</h2>
          <p>
            This site is a professional portfolio aimed at employers and
            colleagues. It is not directed at children and collects no data from
            anyone, including children.
          </p>
        </section>

        <section className={legalSection}>
          <h2>Changes</h2>
          <p>
            If the site changes in a way that affects this policy — for example
            if a server-side form is added — this page will be updated
            and the date at the top changed before that feature goes live.
          </p>
        </section>
      </div>
    </article>
    </PageShell>
  );
}
