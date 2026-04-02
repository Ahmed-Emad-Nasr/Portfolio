"use client";

/*
 * File: sensei-contact.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render contact section and handle form submission state/feedback
 */

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faLocationDot, faPaperPlane, faSpinner, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faWhatsapp, faXTwitter, faInstagram, faTelegram } from "@fortawesome/free-brands-svg-icons";
import styles from "./sensei-contact.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import { toBulletItems } from "@/app/core/utils/bulletUtils";
import MotionInView from "@/app/core/components/MotionInView";
import TurnstileWidget from "@/app/core/components/TurnstileWidget";
import { trackEvent } from "@/app/core/utils/analytics";
import { isActionAllowed, recordFunnelEvent, sendNotificationEmail } from "@/app/core/utils/engagement";
import { showToast } from "@/app/core/utils/toast";

const CONTACT_INFO_DESCRIPTION = "Whether you have a question about cybersecurity, a project proposal, or just want to say hi, my inbox is always open!";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "https://formspree.io/f/mlgpbpdr";

const SenseiContact = memo(function SenseiContact() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const infoBullets = toBulletItems(CONTACT_INFO_DESCRIPTION);
  
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear any pending message timeout from previous submission
    if (messageTimeoutRef.current !== null) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
    
    setIsSubmitting(true);
    setIsSuccess(false);
    setSubmitError(false);

    // Use AbortController for cancellation support & rate limiting
    const controller = new AbortController();
    const abortTimeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const formData = new FormData(e.currentTarget);
      
      // Basic client-side validation
      const name = formData.get("name");
      const email = formData.get("email");
      const subject = formData.get("subject");
      const message = formData.get("message");
      const website = formData.get("website");

      // Honeypot: if this hidden field is filled, treat as bot and silently block.
      if (website && String(website).trim() !== "") {
        trackEvent("contact_submit_failed", { reason: "honeypot_triggered" });
        showToast({ type: "error", message: "Submission blocked due to spam check." });
        setIsSubmitting(false);
        return;
      }

      if (!isActionAllowed("contact_submit", 30_000)) {
        trackEvent("contact_submit_failed", { reason: "rate_limited" });
        showToast({ type: "error", message: "Please wait a bit before sending another message." });
        setSubmitError(true);
        messageTimeoutRef.current = setTimeout(() => setSubmitError(false), 5000);
        setIsSubmitting(false);
        return;
      }

      if (!name || !email || !subject || !message) {
        trackEvent("contact_submit_failed", { reason: "missing_fields" });
        showToast({ type: "error", message: "Please fill in all required fields." });
        setSubmitError(true);
        messageTimeoutRef.current = setTimeout(() => setSubmitError(false), 5000);
        setIsSubmitting(false);
        return;
      }

      if (TURNSTILE_SITE_KEY && !turnstileToken) {
        trackEvent("contact_submit_failed", { reason: "turnstile_missing" });
        showToast({ type: "error", message: "Please complete the security check first." });
        setSubmitError(true);
        messageTimeoutRef.current = setTimeout(() => setSubmitError(false), 5000);
        setIsSubmitting(false);
        return;
      }

      if (TURNSTILE_SITE_KEY) {
        formData.append("cf-turnstile-response", turnstileToken);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(email))) {
        trackEvent("contact_submit_failed", { reason: "invalid_email" });
        showToast({ type: "error", message: "Please enter a valid email address." });
        setSubmitError(true);
        messageTimeoutRef.current = setTimeout(() => setSubmitError(false), 5000);
        setIsSubmitting(false);
        return;
      }

      trackEvent("contact_submit_attempt", { source: "contact_form" });

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST", 
        body: formData, 
        headers: { 'Accept': 'application/json' },
        signal: controller.signal // Abort if timeout
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      if (result.ok) {
        trackEvent("contact_submit_success", { source: "contact_form" });
        recordFunnelEvent("contact_submit_success");
        void sendNotificationEmail({
          subject: "Portfolio alert: contact form success",
          cooldownKey: "contact_success_notify",
          cooldownMs: 8_000,
          lines: [
            `Name: ${String(name)}`,
            `Email: ${String(email)}`,
            `Subject: ${String(subject)}`,
            `Time (UTC): ${new Date().toISOString()}`,
            `Page: ${typeof window !== "undefined" ? window.location.href : "unknown"}`,
          ],
        });
        setIsSuccess(true);
        showToast({ type: "success", message: "Message sent successfully. Redirecting..." });
        setTurnstileToken("");
        e.currentTarget.reset();
        messageTimeoutRef.current = setTimeout(() => {
          setIsSuccess(false);
          router.push("/thank-you");
        }, 1100);
      } else {
        throw new Error("Server rejected submission");
      }
    } catch (error) {
      // Distinguish between different error types for better UX
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.error("Form submission timeout or cancelled");
        } else {
          console.error("Form submission error:", error.message);
        }
      }
      trackEvent("contact_submit_failed", {
        reason: error instanceof Error ? error.name : "unknown_error",
      });
      showToast({ type: "error", message: "Failed to send message. Please try again." });
      setSubmitError(true);
      messageTimeoutRef.current = setTimeout(() => setSubmitError(false), 5000);
    } finally {
      clearTimeout(abortTimeoutId);
      setIsSubmitting(false);
    }
  }, [router, turnstileToken]);

  // Clean up any pending timeout when component unmounts
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current !== null) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <section className={styles["contact-section"]} id="Contact">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="連絡先" englishText="Contact Me" titleClassName={styles.title} />
        </div>

        <div className={styles["contact-wrapper"]}>
          <MotionInView
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.14 }}
            threshold={0.12}
            triggerOnce
          >
          <div className={styles["info-card"]}>
            <h3 className={styles["info-title"]}>Let&apos;s Connect</h3>
            <ul className={styles["info-desc-list"]}>
              {infoBullets.map((item, index) => (
                <li key={`contact-info-${index}`}>{item}</li>
              ))}
            </ul>
            <div className={styles["info-item"]}><div className={styles["icon-box"]}><FontAwesomeIcon icon={faEnvelope} /></div><div className={styles["info-text"]}><h4>Email</h4><p>ahmed.em.nasr@gmail.com</p></div></div>
            <a className={styles["info-item"]} href="https://wa.me/201018166445" target="_blank" rel="noopener noreferrer" aria-label="Open WhatsApp chat"><div className={styles["icon-box"]}><FontAwesomeIcon icon={faPhone} /></div><div className={styles["info-text"]}><h4>Phone / WhatsApp</h4><p>+20 101 816 6445</p></div></a>
            <a className={styles["info-item"]} href="https://www.google.com/maps/search/?api=1&query=Cairo%2C+Egypt" target="_blank" rel="noopener noreferrer" aria-label="Open location in Google Maps"><div className={styles["icon-box"]}><FontAwesomeIcon icon={faLocationDot} /></div><div className={styles["info-text"]}><h4>Location</h4><p>Cairo, Egypt</p></div></a>
            <a
              className={styles["book-call-btn"]}
              href="https://wa.me/201018166445?text=Hi%20Ahmed%2C%20I%20want%20to%20book%20a%20quick%20security%20call."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Book a quick call on WhatsApp"
              onClick={() => trackEvent("cta_click", { source: "contact_section", action: "book_call", destination: "whatsapp" })}
            >
              Book a Call
            </a>
            <div className={styles["contact-socials"]}>
              <a href="https://wa.me/201018166445" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp profile"><FontAwesomeIcon icon={faWhatsapp} /></a>
              <a href="https://www.linkedin.com/in/ahmed-emad-nasr/" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn profile"><FontAwesomeIcon icon={faLinkedin} /></a>
              <a href="https://x.com/0x3omda" target="_blank" rel="noopener noreferrer" title="X (Twitter)" aria-label="X profile"><FontAwesomeIcon icon={faXTwitter} /></a>
              <a href="https://instagram.com/ahmed.em.nasr" target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram profile"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="https://t.me/ahmed_em_nasr" target="_blank" rel="noopener noreferrer" title="Telegram" aria-label="Telegram profile"><FontAwesomeIcon icon={faTelegram} /></a>
            </div>
          </div>
          </MotionInView>

          <MotionInView
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.14, delay: 0.035 }}
            threshold={0.12}
            triggerOnce
          >
          <div className={styles["form-card"]}>
            <form onSubmit={handleSubmit}>
              <div className={styles["honeypot-field"]} aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" type="text" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <div className={styles["input-group"]}><input type="text" name="name" placeholder="Your Name" required className={styles["input-field"]} /></div>
              <div className={styles["input-group"]}><input type="email" name="email" placeholder="Your Email" required className={styles["input-field"]} /></div>
              <div className={styles["input-group"]}><input type="text" name="subject" placeholder="Subject" required className={styles["input-field"]} /></div>
              <div className={styles["input-group"]}><textarea name="message" placeholder="Your Message..." required className={styles["input-field"]}></textarea></div>
              {TURNSTILE_SITE_KEY ? (
                <div className={styles["turnstile-wrap"]}>
                  <TurnstileWidget onTokenChange={setTurnstileToken} />
                </div>
              ) : null}
              <button type="submit" className={styles["submit-btn"]} disabled={isSubmitting}>
                {isSubmitting ? (<>Sending... <FontAwesomeIcon icon={faSpinner} spin /></>) : (<>Send Message <FontAwesomeIcon icon={faPaperPlane} /></>)}
              </button>
              {isSuccess && <p className={styles["success-msg"]}>Message sent successfully! I will get back to you soon.</p>}
              {submitError && <p className={styles["error-msg"]}>Failed to send message. Please try again.</p>}
            </form>
          </div>
          </MotionInView>
        </div>

        <a className={styles["mobile-call-cta"]} href="https://wa.me/201018166445?text=Hi%20Ahmed%2C%20I%20want%20to%20book%20a%20quick%20security%20call." target="_blank" rel="noopener noreferrer" aria-label="Book a call">
          Book a Call
        </a>
      </div>
    </section>
  );
});

export default SenseiContact;