"use client";
import { memo, useState, useCallback, useRef, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faLocationDot, faPaperPlane, faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "./sensei-contact.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";

const SLIDE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]; 

const CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: SLIDE_EASE } },
};

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: SLIDE_EASE } },
};

const HEADER_INITIAL = { opacity: 0, y: -30 } as const;
const HEADER_ANIMATE_IN = { opacity: 1, y: 0 } as const;
const HEADER_ANIMATE_OUT = {} as const;
const HEADER_TRANSITION = { duration: 0.8, ease: SLIDE_EASE } as const;

const SenseiContact = memo(function SenseiContact() {
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [containerRef, containerInView] = useInView({ triggerOnce: true, threshold: 0.1 });

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
        <motion.div ref={headerRef} className={styles["header-section"]} initial={HEADER_INITIAL} animate={headerInView ? HEADER_ANIMATE_IN : HEADER_ANIMATE_OUT} transition={HEADER_TRANSITION}>
          <SectionHeader japaneseText="連絡先" englishText="Contact Me" titleClassName={styles.title} />
        </motion.div>

        <motion.div ref={containerRef} className={styles["contact-wrapper"]} initial="hidden" animate={containerInView ? "visible" : "hidden"} variants={CONTAINER_VARIANTS}>
          <motion.div className={styles["info-card"]} variants={ITEM_VARIANTS}>
            <h3 className={styles["info-title"]}>Let's Connect</h3>
            <p className={styles["info-desc"]}>Whether you have a question about cybersecurity, a project proposal, or just want to say hi, my inbox is always open!</p>
            <div className={styles["info-item"]}><div className={styles["icon-box"]}><FontAwesomeIcon icon={faEnvelope} /></div><div className={styles["info-text"]}><h4>Email</h4><p>ahmed.em.nasr@gmail.com</p></div></div>
            <a className={styles["info-item"]} href="https://wa.me/201018166445" target="_blank" rel="noopener noreferrer"><div className={styles["icon-box"]}><FontAwesomeIcon icon={faPhone} /></div><div className={styles["info-text"]}><h4>Phone / WhatsApp</h4><p>+20 101 816 6445</p></div></a>
            <a className={styles["info-item"]} href="https://www.google.com/maps/search/?api=1&query=Banha%2C+Egypt" target="_blank" rel="noopener noreferrer"><div className={styles["icon-box"]}><FontAwesomeIcon icon={faLocationDot} /></div><div className={styles["info-text"]}><h4>Location</h4><p>Banha, Egypt</p></div></a>
            <div className={styles["contact-socials"]}>
            </div>
          </motion.div>

          <motion.div className={styles["form-card"]} variants={ITEM_VARIANTS}>
            <form onSubmit={handleSubmit}>
              <div className={styles["input-group"]}><input type="text" name="name" placeholder="Your Name" required className={styles["input-field"]} /></div>
              <div className={styles["input-group"]}><input type="email" name="email" placeholder="Your Email" required className={styles["input-field"]} /></div>
              <div className={styles["input-group"]}><input type="text" name="subject" placeholder="Subject" required className={styles["input-field"]} /></div>
              <div className={styles["input-group"]}><textarea name="message" placeholder="Your Message..." required className={styles["input-field"]}></textarea></div>
              <button type="submit" className={styles["submit-btn"]} disabled={isSubmitting}>
                {isSubmitting ? (<>Sending... <FontAwesomeIcon icon={faSpinner} spin /></>) : (<>Send Message <FontAwesomeIcon icon={faPaperPlane} /></>)}
              </button>
              {isSuccess && <motion.p className={styles["success-msg"]} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: SLIDE_EASE }}>Message sent successfully! I will get back to you soon.</motion.p>}
              {submitError && <motion.p className={styles["error-msg"]} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: SLIDE_EASE }}>Failed to send message. Please try again.</motion.p>}
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
});

export default SenseiContact;