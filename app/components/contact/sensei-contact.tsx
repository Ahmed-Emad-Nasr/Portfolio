"use client";

/*
 * File: sensei-contact.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render contact section and handle form submission state/feedback
 */

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faLocationDot, faPaperPlane, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faWhatsapp, faXTwitter, faInstagram, faTelegram } from "@fortawesome/free-brands-svg-icons";
import styles from "./sensei-contact.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";

const SenseiContact = memo(function SenseiContact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  
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

      if (!name || !email || !subject || !message) {
        setSubmitError(true);
        messageTimeoutRef.current = setTimeout(() => setSubmitError(false), 5000);
        setIsSubmitting(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(email))) {
        setSubmitError(true);
        messageTimeoutRef.current = setTimeout(() => setSubmitError(false), 5000);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("https://formspree.io/f/mlgpbpdr", {
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
        setIsSuccess(true);
        e.currentTarget.reset();
        messageTimeoutRef.current = setTimeout(() => setIsSuccess(false), 5000);
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
      setSubmitError(true);
      messageTimeoutRef.current = setTimeout(() => setSubmitError(false), 5000);
    } finally {
      clearTimeout(abortTimeoutId);
      setIsSubmitting(false);
    }
  }, []);

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
          <div className={styles["info-card"]}>
            <h3 className={styles["info-title"]}>Let's Connect</h3>
            <p className={styles["info-desc"]}>Whether you have a question about cybersecurity, a project proposal, or just want to say hi, my inbox is always open!</p>
            <div className={styles["info-item"]}><div className={styles["icon-box"]}><FontAwesomeIcon icon={faEnvelope} /></div><div className={styles["info-text"]}><h4>Email</h4><p>ahmed.em.nasr@gmail.com</p></div></div>
            <a className={styles["info-item"]} href="https://wa.me/201018166445" target="_blank" rel="noopener noreferrer" aria-label="Open WhatsApp chat"><div className={styles["icon-box"]}><FontAwesomeIcon icon={faPhone} /></div><div className={styles["info-text"]}><h4>Phone / WhatsApp</h4><p>+20 101 816 6445</p></div></a>
            <a className={styles["info-item"]} href="https://www.google.com/maps/search/?api=1&query=Banha%2C+Egypt" target="_blank" rel="noopener noreferrer" aria-label="Open location in Google Maps"><div className={styles["icon-box"]}><FontAwesomeIcon icon={faLocationDot} /></div><div className={styles["info-text"]}><h4>Location</h4><p>Banha, Egypt</p></div></a>
            <div className={styles["contact-socials"]}>
              <a href="https://wa.me/201018166445" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp profile"><FontAwesomeIcon icon={faWhatsapp} /></a>
              <a href="https://www.linkedin.com/in/ahmed-emad-nasr/" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn profile"><FontAwesomeIcon icon={faLinkedin} /></a>
              <a href="https://x.com/0x3omda" target="_blank" rel="noopener noreferrer" title="X (Twitter)" aria-label="X profile"><FontAwesomeIcon icon={faXTwitter} /></a>
              <a href="https://instagram.com/ahmed.em.nasr" target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram profile"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="https://t.me/ahmed_em_nasr" target="_blank" rel="noopener noreferrer" title="Telegram" aria-label="Telegram profile"><FontAwesomeIcon icon={faTelegram} /></a>
            </div>
          </div>

          <div className={styles["form-card"]}>
            <form onSubmit={handleSubmit}>
              <div className={styles["input-group"]}><input type="text" name="name" placeholder="Your Name" required className={styles["input-field"]} /></div>
              <div className={styles["input-group"]}><input type="email" name="email" placeholder="Your Email" required className={styles["input-field"]} /></div>
              <div className={styles["input-group"]}><input type="text" name="subject" placeholder="Subject" required className={styles["input-field"]} /></div>
              <div className={styles["input-group"]}><textarea name="message" placeholder="Your Message..." required className={styles["input-field"]}></textarea></div>
              <button type="submit" className={styles["submit-btn"]} disabled={isSubmitting}>
                {isSubmitting ? (<>Sending... <FontAwesomeIcon icon={faSpinner} spin /></>) : (<>Send Message <FontAwesomeIcon icon={faPaperPlane} /></>)}
              </button>
              {isSuccess && <p className={styles["success-msg"]}>Message sent successfully! I will get back to you soon.</p>}
              {submitError && <p className={styles["error-msg"]}>Failed to send message. Please try again.</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
});

export default SenseiContact;