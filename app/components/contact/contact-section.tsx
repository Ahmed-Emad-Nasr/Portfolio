"use client";

/*
 * contact-section.tsx
 * Author: Ahmed Emad Nasr
 *
 * الموقع كان مفيهوش فورم تواصل خالص — أيقونات سوشيال و mailto: بس.
 * والـ mailto: بتفشل صامتة على أي جهاز مفهوش mail client متظبط، وده أغلب
 * زوّار الموبايل: بيدوس، مفيش حاجة بتحصل، بيقفل الصفحة.
 *
 * الغريب إن نص التوصيلة كانت معمولة أصلاً: الـ README فيه
 * NEXT_PUBLIC_FORMSPREE_ENDPOINT و NEXT_PUBLIC_TURNSTILE_SITE_KEY،
 * و layout.tsx بيحمّل سكربت Turnstile لما المفتاح موجود. الفورم نفسه بس
 * هو اللي كان ناقص.
 *
 * القرارات:
 *  - Formspree مباشرة بـ fetch: static export مفيهوش سيرفر يستقبل POST.
 *  - لو المتغيّر مش موجود، الفورم مبيتعرضش أصلاً وبيتعرض مكانه طرق
 *    التواصل المباشرة. أسوأ حاجة ممكن تحصل هي فورم بيبتلع الرسايل من غير
 *    ما حد ياخد باله.
 *  - honeypot field مخفي: أرخص فلتر سبام موجود، صفر احتكاك على المستخدم.
 *  - الحالات كلها مغطّاة (idle / sending / ok / error) — مفيش زرار بيتضغط
 *    ومفيش رد فعل.
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

    // Honeypot: البشر مبيشوفوش الخانة دي، البوتات بتملاها.
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
    <section className={styles.section} id="Contact" aria-label="Contact">
      {/* نفس هيكل الهيدر المتوسّط بتاع باقي السكاشن — كان محاذي لليسار
          وشكله كإنه جاي من موقع تاني. */}
      <div className={styles["header-section"]}>
        <SectionHeader japaneseText="連絡" englishText="Contact" titleClassName={styles.title} />
        <p className={styles.lede}>
          Open to SOC, incident response, and DFIR roles, and to security
          training work. Fastest reply is by email.
        </p>
      </div>

      <div className={styles.container} data-form={FORMSPREE_ENDPOINT ? "on" : "off"}>
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
            /* ملاحظة للمطوّر، مش للزائر. كانت بتتعرض كصندوق متقطّع كبير في
               مكان الفورم — الزائر بيقرا رسالة خطأ تقنية مالهاش معنى
               بالنسباله، والقسم كله بيبان مكسور: نصه محتوى ونصه فراغ. */
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

            {/* honeypot — مخفي عن البشر بالـ CSS، وعن الـ screen readers
                بـ aria-hidden و tabIndex={-1} */}
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="contact-company">Company</label>
              <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <button type="submit" className={styles.submit} disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send message"}
              <Icon name="faPaperPlane" aria-hidden="true" />
            </button>

            {/* aria-live عشان اللي بيستخدم screen reader يسمع النتيجة —
                من غيرها الفورم بيتبعت في صمت تام بالنسباله. */}
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
