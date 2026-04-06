"use client";

/*
 * File: sensei-contact.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render contact section and handle form submission state/feedback
 */

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faLocationDot, faPaperPlane, faSpinner, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faWhatsapp, faXTwitter, faInstagram, faTelegram } from "@fortawesome/free-brands-svg-icons";
import styles from "./sensei-contact.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import { toBulletItems } from "@/app/core/utils/bulletUtils";
import MotionInView from "@/app/core/components/MotionInView";
import { isActionAllowed, recordFunnelEvent, sendNotificationEmail } from "@/app/core/utils/engagement";
import { showToast } from "@/app/core/utils/toast";
import { contactBudgetOptions, contactProjectOptions, contactTimelineOptions, projectResponseSla } from "@/app/core/data";

const TurnstileWidget = dynamic(() => import("@/app/core/components/TurnstileWidget"), {
  ssr: false,
  loading: () => <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.95rem" }}>Loading security check...</div>,
});

const CONTACT_INFO_DESCRIPTION = "Whether you have a question about cybersecurity, a project proposal, or just want to say hi, my inbox is always open!";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "";
const CONTACT_DRAFT_KEY = "portfolio_contact_draft_v1";

const validateFieldValue = (field: string, value: string): string | null => {
  const trimmed = value.trim();

  if (field === "name") {
    if (trimmed.length === 0) return "Name is required";
    if (trimmed.length < 2) return "Name must be at least 2 characters";
    return null;
  }

  if (field === "email") {
    if (trimmed.length === 0) return "Email is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(trimmed) ? null : "Please enter a valid email address";
  }

  if (field === "subject") {
    if (trimmed.length === 0) return "Subject is required";
    if (trimmed.length < 4) return "Subject must be at least 4 characters";
    return null;
  }

  if (field === "project_scope") {
    if (trimmed.length === 0) return "Please select a project scope";
    return null;
  }

  if (field === "message") {
    if (trimmed.length === 0) return "Message is required";
    if (trimmed.length < 10) return "Message must be at least 10 characters";
    return null;
  }

  return null;
};

const SenseiContact = memo(function SenseiContact() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [didTrackFormStart, setDidTrackFormStart] = useState(false);
  const [selectedProjectScope, setSelectedProjectScope] = useState("");
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string|null>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const infoBullets = toBulletItems(CONTACT_INFO_DESCRIPTION);
  
  const formRef = useRef<HTMLFormElement | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abandonmentTrackedRef = useRef(false);
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncDraftFromForm = useCallback(() => {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const draft = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      project_scope: String(formData.get("project_scope") ?? ""),
      budget_range: String(formData.get("budget_range") ?? ""),
      project_timeline: String(formData.get("project_timeline") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      localStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Ignore storage errors (private mode / blocked storage).
    }
  }, []);

  const markTouchedAndValidate = useCallback((field: string, value: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    setFieldErrors((prev) => ({ ...prev, [field]: validateFieldValue(field, value) }));
  }, []);

  const handleFieldInput = useCallback((field: string, value: string) => {
    setIsFormDirty(true);

    if (touchedFields[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: validateFieldValue(field, value) }));
    }

    if (autosaveTimeoutRef.current !== null) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      syncDraftFromForm();
    }, 250);
  }, [syncDraftFromForm, touchedFields]);

  const focusFirstFieldError = useCallback((errors: Record<string, string>) => {
    window.requestAnimationFrame(() => {
      const firstField = Object.keys(errors)[0];
      const selectorMap: Record<string, string> = {
        name: '[name="name"]',
        email: '[name="email"]',
        subject: '[name="subject"]',
        project_scope: '[name="project_scope"]',
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
      const projectScope = formData.get("project_scope");
      const budgetRange = formData.get("budget_range");
      const projectTimeline = formData.get("project_timeline");

      // Honeypot: if this hidden field is filled, treat as bot and silently block.
      if (website && String(website).trim() !== "") {
        showToast({ type: "error", message: "Submission blocked due to spam check." });
        setIsSubmitting(false);
        return;
      }

      if (!isActionAllowed("contact_submit", 30_000)) {
        showToast({ type: "error", message: "You sent a message recently. Please wait 30 seconds and try again." });
        setSubmitError(true);
        messageTimeoutRef.current = setTimeout(() => setSubmitError(false), 5000);
        setIsSubmitting(false);
        return;
      }

      if (!name || !email || !subject || !message || !projectScope) {
        const errors: Record<string, string> = {};
        if (!name) errors.name = "Name is required";
        if (!email) errors.email = "Email is required";
        if (!subject) errors.subject = "Subject is required";
        if (!projectScope) errors.project_scope = "Please select a project scope";
        if (!message) errors.message = "Message is required";
        showToast({ type: "error", message: "Please fill in all required fields." });
        setValidationErrors(errors);
        setIsSubmitting(false);
        return;
      }

      if (TURNSTILE_SITE_KEY && !turnstileToken) {
        showToast({ type: "error", message: "Security check is required. Complete it, then submit again." });
        setSubmitError(true);
        messageTimeoutRef.current = setTimeout(() => setSubmitError(false), 5000);
        setIsSubmitting(false);
        return;
      }

      if (TURNSTILE_SITE_KEY) {
        formData.append("cf-turnstile-response", turnstileToken);
      }

      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(String(email))) {
        showToast({ type: "error", message: "Please enter a valid email address." });
        setValidationErrors({ email: "Please enter a valid email address" });
        setIsSubmitting(false);
        return;
      }

      recordFunnelEvent("contact_submit_attempt");

      if (!FORMSPREE_ENDPOINT) {
        throw new Error("Contact endpoint is not configured");
      }

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
        recordFunnelEvent("contact_submit_success");
        void sendNotificationEmail({
          subject: "Portfolio alert: contact form success",
          cooldownKey: "contact_success_notify",
          cooldownMs: 8_000,
          lines: [
            `Name: ${name}`,
            `Email: ${email}`,
            `Subject: ${subject}`,
            `Project scope: ${projectScope}`,
            `Budget range: ${budgetRange ? String(budgetRange) : "Not provided"}`,
            `Timeline: ${projectTimeline ? String(projectTimeline) : "Not provided"}`,
            `Time (UTC): ${new Date().toISOString()}`,
            `Page: ${typeof window !== "undefined" ? window.location.href : "unknown"}`,
          ],
        });
        abandonmentTrackedRef.current = true;
        setIsFormDirty(false);
        try {
          localStorage.removeItem(CONTACT_DRAFT_KEY);
        } catch {
          // Ignore storage errors.
        }
        setIsSuccess(true);
        setFieldErrors({});
        setTouchedFields({});
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
        if (error.message === "Contact endpoint is not configured") {
          console.error("Missing NEXT_PUBLIC_FORMSPREE_ENDPOINT env var");
          showToast({ type: "error", message: "Contact form is temporarily unavailable. Please use WhatsApp/Email quick contact." });
        } else
        if (error.name === "AbortError") {
          console.error("Form submission timeout or cancelled");
          showToast({ type: "error", message: "Request timed out. Please check your connection and retry." });
        } else {
          console.error("Form submission error:", error.message);
          showToast({ type: "error", message: "Network issue while sending. Please retry or use WhatsApp/Email quick contact." });
        }
      }
      setSubmitError(true);
      messageTimeoutRef.current = setTimeout(() => setSubmitError(false), 5000);
    } finally {
      clearTimeout(abortTimeoutId);
      setIsSubmitting(false);
    }
  }, [router, turnstileToken, setValidationErrors]);

  useEffect(() => {
    if (!formRef.current) return;

    try {
      const rawDraft = localStorage.getItem(CONTACT_DRAFT_KEY);
      if (!rawDraft) return;

      const parsed = JSON.parse(rawDraft) as Record<string, string>;
      const supportedFields = ["name", "email", "subject", "project_scope", "budget_range", "project_timeline", "message"];

      supportedFields.forEach((field) => {
        const value = parsed[field];
        if (typeof value !== "string") return;

        const element = formRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${field}"]`);
        if (!element) return;
        element.value = value;
      });

      if (typeof parsed.project_scope === "string") {
        setSelectedProjectScope(parsed.project_scope);
      }
    } catch {
      // Ignore malformed drafts.
    }
  }, []);

  useEffect(() => {
    const handlePotentialAbandon = () => {
      if (!isFormDirty || abandonmentTrackedRef.current || isSuccess) return;
      abandonmentTrackedRef.current = true;
      recordFunnelEvent("contact_form_abandon");
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
  }, [isFormDirty, isSuccess]);

  const quickQuoteMessage = `Hi Ahmed, I need a quick quote for ${selectedProjectScope || "a cybersecurity project"}.`;
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
      if (autosaveTimeoutRef.current !== null) {
        clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
    };
  }, []);

  const dynamicSla = selectedProjectScope && projectResponseSla[selectedProjectScope]
    ? projectResponseSla[selectedProjectScope]
    : "Typical response time: within 24 hours.";

  return (
    <section className={styles["contact-section"]} id="Contact">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="連絡先" englishText="Contact Me" titleClassName={styles.title} />
        </div>

        <div className={styles["contact-wrapper"]}>
          <MotionInView
            transition={{ duration: 0.14 }}
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
            transition={{ duration: 0.14, delay: 0.035 }}
          >
          <div className={styles["form-card"]}>
            <form ref={formRef} onSubmit={handleSubmit}>
              <p className={styles["quick-lead"]}>Need a faster start? Use quick contact and share details later.</p>
              <div className={styles["quick-actions"]}>
                <a
                  href={quickQuoteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Quick Quote on WhatsApp
                </a>
                <a
                  href="mailto:ahmed.em.nasr@gmail.com?subject=Security%20Project%20Inquiry"
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
                <input id="website" type="text" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <div className={`${styles["input-group"]} ${fieldErrors.name ? styles["input-error"] : ""}`}>
                <label htmlFor="contact-name" className={styles["sr-only"]}>Your name</label>
                <input id="contact-name" type="text" name="name" placeholder="Your Name" required className={styles["input-field"]} onFocus={() => {
                if (!didTrackFormStart) {
                  recordFunnelEvent("contact_form_started");
                  setDidTrackFormStart(true);
                }
              }} onBlur={(event) => markTouchedAndValidate("name", event.target.value)} onChange={(event) => handleFieldInput("name", event.target.value)} autoComplete="name" minLength={2} aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? "name-error" : undefined} />
              </div>
              {fieldErrors.name ? <span id="name-error" className={styles["field-error"]}>{fieldErrors.name}</span> : null}
              <div className={`${styles["input-group"]} ${fieldErrors.email ? styles["input-error"] : ""}`}>
                <label htmlFor="contact-email" className={styles["sr-only"]}>Your email</label>
                <input id="contact-email" type="email" name="email" placeholder="Your Email" required className={styles["input-field"]} autoComplete="email" onBlur={(event) => markTouchedAndValidate("email", event.target.value)} onChange={(event) => handleFieldInput("email", event.target.value)} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? "email-error" : undefined} />
              </div>
              {fieldErrors.email ? <span id="email-error" className={styles["field-error"]}>{fieldErrors.email}</span> : null}
              <div className={`${styles["input-group"]} ${fieldErrors.subject ? styles["input-error"] : ""}`}>
                <label htmlFor="contact-subject" className={styles["sr-only"]}>Project subject</label>
                <input id="contact-subject" type="text" name="subject" placeholder="Project Subject" required className={styles["input-field"]} minLength={4} onBlur={(event) => markTouchedAndValidate("subject", event.target.value)} onChange={(event) => handleFieldInput("subject", event.target.value)} aria-invalid={!!fieldErrors.subject} aria-describedby={fieldErrors.subject ? "subject-error" : undefined} />
              </div>
              {fieldErrors.subject ? <span id="subject-error" className={styles["field-error"]}>{fieldErrors.subject}</span> : null}
              <div className={styles["input-group"]}>
                <label htmlFor="project_scope" className={styles["sr-only"]}>Project scope</label>
                <select
                  id="project_scope"
                  name="project_scope"
                  required
                  className={styles["input-field"]}
                  defaultValue=""
                  onChange={(event) => {
                    setSelectedProjectScope(event.target.value);
                    handleFieldInput("project_scope", event.target.value);
                  }}
                  onBlur={(event) => markTouchedAndValidate("project_scope", event.target.value)}
                  aria-invalid={!!fieldErrors.project_scope}
                  aria-describedby={fieldErrors.project_scope ? "project-scope-error" : undefined}
                >
                  <option value="" disabled>Select project scope</option>
                  {contactProjectOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              {fieldErrors.project_scope ? <span id="project-scope-error" className={styles["field-error"]}>{fieldErrors.project_scope}</span> : null}
              <details className={styles["optional-fields"]} aria-label="Optional project details">
                <summary>Add optional project details</summary>
                <div className={styles["triple-grid"]}>
                  <div className={styles["input-group"]}>
                    <label htmlFor="budget_range" className={styles["sr-only"]}>Budget range</label>
                    <select
                      id="budget_range"
                      name="budget_range"
                      className={styles["input-field"]}
                      defaultValue=""
                      onChange={(event) => {
                        handleFieldInput("budget_range", event.target.value);
                      }}
                    >
                      <option value="">Budget range (optional)</option>
                      {contactBudgetOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles["input-group"]}>
                    <label htmlFor="project_timeline" className={styles["sr-only"]}>Project timeline</label>
                    <select
                      id="project_timeline"
                      name="project_timeline"
                      className={styles["input-field"]}
                      defaultValue=""
                      onChange={(event) => {
                        handleFieldInput("project_timeline", event.target.value);
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
              <div className={`${styles["input-group"]} ${fieldErrors.message ? styles["input-error"] : ""}`}>
                <label htmlFor="contact-message" className={styles["sr-only"]}>Your message</label>
                <textarea id="contact-message" name="message" placeholder="Tell me your main goal in 1-2 lines" required className={styles["input-field"]} minLength={10} onBlur={(event) => markTouchedAndValidate("message", event.target.value)} onChange={(event) => handleFieldInput("message", event.target.value)} aria-invalid={!!fieldErrors.message} aria-describedby={fieldErrors.message ? "message-error" : undefined}></textarea>
              </div>
              {fieldErrors.message ? <span id="message-error" className={styles["field-error"]}>{fieldErrors.message}</span> : null}
              {TURNSTILE_SITE_KEY ? (
                <div className={styles["turnstile-wrap"]}>
                  <TurnstileWidget onTokenChange={setTurnstileToken} />
                </div>
              ) : null}
              <p className={styles["response-time"]}>{dynamicSla}</p>
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