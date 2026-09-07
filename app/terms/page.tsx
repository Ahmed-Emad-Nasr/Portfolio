/*
 * app/terms/page.tsx — شروط الاستخدام
 *
 * Server Component، نص ثابت.
 *
 * ⚠️ اسمها "Terms of Use" مش "Terms and Conditions" عن قصد.
 *
 * "Terms and Conditions" هو الاسم المتعارف عليه لعقد بيع/خدمة — بيتكلم
 * عن الطلبات والدفع والتسليم والاسترجاع. الموقع ده مبيبيعش حاجة، فوثيقة
 * بالاسم ده هتوعد بحاجات غير موجودة وتفتح باب لالتزامات مالهاش لازمة.
 *
 * "Terms of Use" هو الصح لموقع محتوى: قواعد استخدام الموقع، الملكية
 * الفكرية، حدود المسؤولية.
 *
 * ⚠️ مش استشارة قانونية.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { SITE_BASE_URL } from "@/app/core/config/site";
import { LEGAL_CONTACT, LEGAL_LAST_UPDATED } from "@/app/core/config/legal";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms of Use — Ahmed Emad Nasr",
  description:
    "Terms for using this portfolio site: content ownership, acceptable use, and disclaimers.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Use — Ahmed Emad Nasr",
    description: "Content ownership, acceptable use, and disclaimers.",
    url: `${SITE_BASE_URL}/terms`,
  },
};

export default function TermsPage() {
  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.sheet}>
        <Link href="/" className={styles.backLink}>← Back to the site</Link>

        <h1 className={styles.title}>Terms of Use</h1>
        <p className={styles.updated}>Last updated: {LEGAL_LAST_UPDATED}</p>

        <div className={styles.summary}>
          <p>
            <strong>The short version.</strong> This is a personal portfolio.
            Read it, learn from it, link to it. The security research here is
            published for education — do not use it against systems you are not
            authorised to test.
          </p>
          <p>
            Nothing is sold here, so there is nothing to pay for, cancel, or
            refund.
          </p>
        </div>

        <section className={styles.section}>
          <h2>What this site is</h2>
          <p>
            This site is the personal portfolio of {LEGAL_CONTACT.name}. It
            exists to show professional work: security research, investigation
            write-ups, projects, and a CV. It is informational only.
          </p>
          <p>
            <strong>Nothing is sold on this site.</strong> There are no products,
            no services for purchase, no subscriptions, no payments, and no
            accounts. There is therefore no order, cancellation, or refund
            process — and no refund policy, because there is no transaction that
            could be refunded. If that ever changes, appropriate terms will be
            published before anything is offered for sale.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Security content — use it responsibly</h2>
          <p>
            This site publishes security research: malware analysis, incident
            response write-ups, detection rules, and penetration-testing notes.
            All of it is published for education and to document professional
            work.
          </p>
          <p>
            You must not use anything here to access, test, disrupt, or attack
            any system you do not own or do not have explicit written permission
            to test. Doing so is a crime in most countries, including under
            Egypt&apos;s Anti-Cyber and Information Technology Crimes Law (Law
            No. 175 of 2018). You are solely responsible for what you do with
            this information.
          </p>
          <p>
            The techniques described are provided as-is for defensive and
            educational purposes. No warranty is given that any detection rule,
            configuration, or method is fit for any particular environment.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Ownership of the content</h2>
          <p>
            The written content, investigation reports, code, and site design are
            the work of {LEGAL_CONTACT.name} unless stated otherwise on the page
            itself, and remain his property.
          </p>
          <p>You are welcome to:</p>
          <ul>
            <li>Read, share, and link to any page here.</li>
            <li>Quote short passages with clear attribution and a link back.</li>
            <li>Use the techniques described in your own authorised work.</li>
          </ul>
          <p>Please do not:</p>
          <ul>
            <li>Republish whole articles or reports as your own.</li>
            <li>Present this work as your experience in an application or portfolio.</li>
            <li>Use the content to train commercial models without permission.</li>
          </ul>
          <p>
            Third-party names, logos, and trademarks that appear here — tools,
            vendors, certification bodies, employers — belong to their respective
            owners and are referenced descriptively. Their appearance does not
            imply any endorsement of this site by them.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Accuracy and no warranty</h2>
          <p>
            The content is provided as-is. Reasonable care is taken to keep it
            accurate, but no guarantee is given that it is complete, current, or
            error-free. Security tooling and threat behaviour change quickly, and
            an article correct on its publication date may not stay correct.
          </p>
          <p>
            Nothing here is professional advice for your specific situation. To
            the fullest extent permitted by law, no liability is accepted for any
            loss arising from acting on the content of this site.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Links to other sites</h2>
          <p>
            This site links to external sites including GitHub, LinkedIn, and
            YouTube. Those sites are not under my control and I am not
            responsible for their content or their privacy practices. Following
            an external link means the destination site&apos;s own terms apply.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Availability</h2>
          <p>
            The site is a personal project hosted on a free platform. No uptime
            is promised, and pages may change or be removed at any time without
            notice.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Governing law and contact</h2>
          <p>
            These terms are governed by the laws of the Arab Republic of Egypt.
            Questions about them go to{" "}
            <a href={`mailto:${LEGAL_CONTACT.email}`}>{LEGAL_CONTACT.email}</a>.
          </p>
          <p>
            See also the <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
