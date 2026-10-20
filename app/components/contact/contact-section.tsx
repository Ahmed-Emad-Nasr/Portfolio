"use client";

/*
 * contact-section.tsx
 * Author: Ahmed Emad Nasr
 *
 * The site had no contact form at all — only social icons and mailto:.
 * And mailto: fails silently on any device without a configured mail client, which is most
 * mobile visitors: they tap, nothing happens, they close the page.
 *
 * Oddly, half of the wiring was already done: the README had
 * NEXT_PUBLIC_FORMSPREE_ENDPOINT and NEXT_PUBLIC_TURNSTILE_SITE_KEY,
 * and layout.tsx loads the Turnstile script when the key is present. Only the form itself
 * was missing.
 *
 * Decisions:
 *  - Formspree directly via fetch: a static export has no server to receive a POST.
 *  - If the variable isn't set, the form isn't shown at all and the direct contact
 *    methods are shown in its place. The worst possible outcome is a form that swallows messages without
 *    anyone noticing.
 *  - A hidden honeypot field: the cheapest spam filter there is, zero friction for the user.
 *  - Every state is covered (idle / sending / ok / error) — no button that gets pressed
 *    with no response.
 */

import { useState, type FormEvent } from "react";
import SectionHeader from "@/app/core/components/SectionHeader";
import Icon from "@/app/core/icons/Icon";
import styles from "./contact-section.module.css";

const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

const EMAIL = "ahmed.em.nasr@gmail.com";
const WHATSAPP = "https://wa.me/201013972690";
const LINKEDIN = "https://www.linkedin.com/in/ahmed-emad-nasr/";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactSection() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!FORMSPREE_ENDPOINT) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: humans don't see this field, bots fill it in.
    if (data.get("company")) {
      setStatus("sent");
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error(`Request failed (${response.status})`);

      setStatus("sent");
      form.reset();
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    }
  };

  return (
    <section data-fx="section" data-section="auto" id="Contact" aria-label="Contact">
      {/* Same centred header structure as the other sections — it used to be left-aligned
          and looked like it came from another site. */}
      <div data-fx="section-head">
        <SectionHeader japaneseText="連絡" englishText="Contact" />
        <p className={styles.lede}>
          Open to SOC, incident response, and DFIR roles, and to security
          training work. Fastest reply is by email.
        </p>
      </div>

      <div className={styles.grid} data-fx="container" data-form={FORMSPREE_ENDPOINT ? "on" : "off"}>
        <div className={styles.intro}>
          <ul className={styles.direct}>
            <li>
              <a href={`mailto:${EMAIL}`}>
                <Icon name="faEnvelope" aria-hidden="true" />
                {EMAIL}
              </a>
            </li>
            <li>
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
                <Icon name="faLinkedin" aria-hidden="true" />
                LinkedIn
              </a>
            </li>
            <li>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                <Icon name="faWhatsapp" aria-hidden="true" />
                WhatsApp
              </a>
            </li>
          </ul>

          {!FORMSPREE_ENDPOINT && (
            /* A note for the developer, not the visitor. It used to be shown as a big dashed box in
               place of the form — the visitor read a technical error message that meant nothing
               to them, and the whole section looked broken: half content, half empty space. */
            <p className={styles.disabled} role="note">
              Contact form inactive — set <code>NEXT_PUBLIC_FORMSPREE_ENDPOINT</code> to enable it.
            </p>
          )}
        </div>

        {FORMSPREE_ENDPOINT && (
          <form className={styles.form} onSubmit={handleSubmit} noValidate={false}>
            <div className={styles.field}>
              <label htmlFor="contact-name">Name</label>
              <input id="contact-name" name="name" type="text" required autoComplete="name" />
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-email">Email</label>
              <input id="contact-email" name="email" type="email" required autoComplete="email" />
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-message">Message</label>
              <textarea id="contact-message" name="message" rows={5} required />
            </div>

            {/* honeypot — hidden from humans with CSS, and from screen readers
                with aria-hidden and tabIndex={-1} */}
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="contact-company">Company</label>
              <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <button type="submit" className={styles.submit} disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send message"}
              <Icon name="faPaperPlane" aria-hidden="true" />
            </button>

            {/* aria-live so screen-reader users hear the result —
                without it the form submits in complete silence for them. */}
            <p className={styles.status} role="status" aria-live="polite">
              {status === "sent" && (
                <span className={styles.ok}>
                  <Icon name="faCircleCheck" aria-hidden="true" /> Thanks — I&apos;ll get back to you.
                </span>
              )}
              {status === "error" && (
                <span className={styles.err}>
                  <Icon name="faTriangleExclamation" aria-hidden="true" /> Could not send ({error}). Email me directly instead.
                </span>
              )}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
