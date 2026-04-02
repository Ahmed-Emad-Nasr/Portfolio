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
import { contactBudgetOptions, contactServiceOptions, contactTimelineOptions } from "@/app/core/data";

const CONTACT_INFO_DESCRIPTION = "Whether you have a question about cybersecurity, a project proposal, or just want to say hi, my inbox is always open!";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "https://formspree.io/f/mlgpbpdr";

const SenseiContact = memo(function SenseiContact() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [didTrackFormStart, setDidTrackFormStart] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string|null>>({});
  const infoBullets = toBulletItems(CONTACT_INFO_DESCRIPTION);
  
  const formRef = useRef<HTMLFormElement | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abandonmentTrackedRef = useRef(false);

  const focusFirstFieldError = useCallback((errors: Record<string, string>) => {
    window.requestAnimationFrame(() => {
      const firstField = Object.keys(errors)[0];
      const selectorMap: Record<string, string> = {
        name: '[name="name"]',
        email: '[name="email"]',
        subject: '[name="subject"]',
        requested_service: '[name="requested_service"]',
        message: '[name="message"]',
      };

      const target = firstField ? formRef.current?.querySelector<HTMLElement>(selectorMap[firstField] ?? "") : null;
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      errorSummaryRef.current?.focus();
    });
  }, []);

  const setValidationErrors = useCallback((errors: Record<string, string>) => {
    setFieldErrors(errors);
    setSubmitError(true);
    messageTimeoutRef.current = setTimeout(() => setSubmitError(false), 5000);
    focusFirstFieldError(errors);
  }, [focusFirstFieldError]);

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
      const requestedService = formData.get("requested_service");
      const budgetRange = formData.get("budget_range");
      const projectTimeline = formData.get("project_timeline");

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

      if (!name || !email || !subject || !message || !requestedService) {
        trackEvent("contact_submit_failed", { reason: "missing_fields" });
        const errors: Record<string, string> = {};
        if (!name) errors.name = "Name is required";
        if (!email) errors.email = "Email is required";
        if (!subject) errors.subject = "Subject is required";
        if (!requestedService) errors.requested_service = "Please select a service";
        if (!message) errors.message = "Message is required";
        showToast({ type: "error", message: "Please fill in all required fields." });
        setValidationErrors(errors);
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
        setValidationErrors({ email: "Please enter a valid email address" });
        setIsSubmitting(false);
        return;
      }

      recordFunnelEvent("contact_submit_attempt");
      trackEvent("contact_submit_attempt", {
        source: "contact_form",
        requested_service: String(requestedService),
        budget_range: budgetRange ? String(budgetRange) : "not_provided",
        project_timeline: projectTimeline ? String(projectTimeline) : "not_provided",
      });

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
            `Requested service: ${String(requestedService)}`,
            `Budget range: ${budgetRange ? String(budgetRange) : "Not provided"}`,
            `Timeline: ${projectTimeline ? String(projectTimeline) : "Not provided"}`,
            `Time (UTC): ${new Date().toISOString()}`,
            `Page: ${typeof window !== "undefined" ? window.location.href : "unknown"}`,
          ],
        });
        abandonmentTrackedRef.current = true;
        setIsFormDirty(false);
        setIsSuccess(true);
        setFieldErrors({});
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

  useEffect(() => {
    const handlePotentialAbandon = () => {
      if (!isFormDirty || abandonmentTrackedRef.current || isSuccess) return;
      abandonmentTrackedRef.current = true;
      recordFunnelEvent("contact_form_abandon");
      trackEvent("contact_form_abandon", {
        source: "contact_form",
        selected_service: selectedService || "not_selected",
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handlePotentialAbandon();
      }
    };

    window.addEventListener("beforeunload", handlePotentialAbandon);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handlePotentialAbandon);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isFormDirty, isSuccess, selectedService]);

  const quickQuoteMessage = `Hi Ahmed, I need a quick quote for ${selectedService || "a cybersecurity project"}.`;
  const quickQuoteHref = `https://wa.me/201018166445?text=${encodeURIComponent(quickQuoteMessage)}`;
  const activeFieldErrors = Object.entries(fieldErrors).filter(([, message]) => Boolean(message)) as Array<
    [string, string]
  >;

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
            <form ref={formRef} onSubmit={handleSubmit}>
              <p className={styles["quick-lead"]}>Need a faster start? Use quick contact and share details later.</p>
              <div className={styles["quick-actions"]}>
                <a
                  href={quickQuoteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("cta_click", { source: "contact_form", action: "quick_quote_whatsapp", destination: "whatsapp", selected_service: selectedService || "not_selected" })}
                >
                  Quick Quote on WhatsApp
                </a>
                <a
                  href="mailto:ahmed.em.nasr@gmail.com?subject=Security%20Project%20Inquiry"
                  onClick={() => trackEvent("cta_click", { source: "contact_form", action: "quick_email", destination: "mailto" })}
                >
                  Email Directly
                </a>
              </div>
              <p className={styles["trust-line"]}>Typical response window: within 24 hours. Simple scopes can start quickly.</p>
              {submitError && activeFieldErrors.length > 0 ? (
                <div
                  className={styles["error-summary"]}
                  ref={errorSummaryRef}
                  role="alert"
                  tabIndex={-1}
                >
                  <strong>Please fix the following:</strong>
                  <ul>
                    {activeFieldErrors.map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className={styles["honeypot-field"]} aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" type="text" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <div className={`${styles["input-group"]} ${fieldErrors.name ? styles["input-error"] : ""}`}><input type="text" name="name" placeholder="Your Name" required className={styles["input-field"]} onFocus={() => {
                if (!didTrackFormStart) {
                  trackEvent("contact_form_started", { source: "contact_form", first_field: "name" });
                  recordFunnelEvent("contact_form_started");
                  setDidTrackFormStart(true);
                }
              }} onChange={() => { setIsFormDirty(true); setFieldErrors((prev) => ({ ...prev, name: null })); }} autoComplete="name" minLength={2} aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? "name-error" : undefined} /></div>
              {fieldErrors.name ? <span id="name-error" className={styles["field-error"]}>{fieldErrors.name}</span> : null}
              <div className={`${styles["input-group"]} ${fieldErrors.email ? styles["input-error"] : ""}`}><input type="email" name="email" placeholder="Your Email" required className={styles["input-field"]} autoComplete="email" onChange={() => { setIsFormDirty(true); setFieldErrors((prev) => ({ ...prev, email: null })); }} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? "email-error" : undefined} /></div>
              {fieldErrors.email ? <span id="email-error" className={styles["field-error"]}>{fieldErrors.email}</span> : null}
              <div className={`${styles["input-group"]} ${fieldErrors.subject ? styles["input-error"] : ""}`}><input type="text" name="subject" placeholder="Project Subject" required className={styles["input-field"]} minLength={4} onChange={() => { setIsFormDirty(true); setFieldErrors((prev) => ({ ...prev, subject: null })); }} aria-invalid={!!fieldErrors.subject} aria-describedby={fieldErrors.subject ? "subject-error" : undefined} /></div>
              {fieldErrors.subject ? <span id="subject-error" className={styles["field-error"]}>{fieldErrors.subject}</span> : null}
              <div className={styles["input-group"]}>
                <select
                  name="requested_service"
                  required
                  className={styles["input-field"]}
                  defaultValue=""
                  onChange={(event) => {
                    setSelectedService(event.target.value);
                    setIsFormDirty(true);
                    setFieldErrors((prev) => ({ ...prev, requested_service: null }));
                    trackEvent("contact_field_selected", { field: "requested_service", value: event.target.value });
                  }}
                  aria-invalid={!!fieldErrors.requested_service}
                  aria-describedby={fieldErrors.requested_service ? "requested-service-error" : undefined}
                >
                  <option value="" disabled>Select service needed</option>
                  {contactServiceOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              {fieldErrors.requested_service ? <span id="requested-service-error" className={styles["field-error"]}>{fieldErrors.requested_service}</span> : null}
              <details className={styles["optional-fields"]}>
                <summary>Add optional project details</summary>
                <div className={styles["triple-grid"]}>
                  <div className={styles["input-group"]}>
                    <select
                      name="budget_range"
                      className={styles["input-field"]}
                      defaultValue=""
                      onChange={(event) => {
                        setIsFormDirty(true);
                        trackEvent("contact_field_selected", { field: "budget_range", value: event.target.value });
                      }}
                    >
                      <option value="">Budget range (optional)</option>
                      {contactBudgetOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles["input-group"]}>
                    <select
                      name="project_timeline"
                      className={styles["input-field"]}
                      defaultValue=""
                      onChange={(event) => {
                        setIsFormDirty(true);
                        trackEvent("contact_field_selected", { field: "project_timeline", value: event.target.value });
                      }}
                    >
                      <option value="">Timeline (optional)</option>
                      {contactTimelineOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </details>
              <div className={`${styles["input-group"]} ${fieldErrors.message ? styles["input-error"] : ""}`}><textarea name="message" placeholder="Tell me your main goal in 1-2 lines" required className={styles["input-field"]} minLength={10} onChange={() => { setIsFormDirty(true); setFieldErrors((prev) => ({ ...prev, message: null })); }} aria-invalid={!!fieldErrors.message} aria-describedby={fieldErrors.message ? "message-error" : undefined}></textarea></div>
              {fieldErrors.message ? <span id="message-error" className={styles["field-error"]}>{fieldErrors.message}</span> : null}
              {TURNSTILE_SITE_KEY ? (
                <div className={styles["turnstile-wrap"]}>
                  <TurnstileWidget onTokenChange={setTurnstileToken} />
                </div>
              ) : null}
              <p className={styles["response-time"]}>Typical response time: within 24 hours.</p>
              {isSuccess ? (
                <div className={styles["success-panel"]}>
                  <strong>Message sent successfully.</strong>
                  <p>I&apos;ll review your request and reply as soon as possible.</p>
                  <a href="#Home" className={styles["success-link"]}>Back to top</a>
                </div>
              ) : null}
              <button type="submit" className={styles["submit-btn"]} disabled={isSubmitting}>
                {isSubmitting ? (<>Sending... <FontAwesomeIcon icon={faSpinner} spin /></>) : (<>Send Message <FontAwesomeIcon icon={faPaperPlane} /></>)}
              </button>
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