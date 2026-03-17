"use client";
import { memo, useState, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faLocationDot, faPaperPlane, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faWhatsapp, faXTwitter, faInstagram, faTelegram } from "@fortawesome/free-brands-svg-icons";
import styles from "./sensei-contact.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";

const SLIDE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]; 

const CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
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

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const response = await fetch("https://formspree.io/f/mlgpbpdr", {
        method: "POST", body: new FormData(e.currentTarget), headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setIsSuccess(true);
        (e.target as HTMLFormElement).reset(); 
        setTimeout(() => setIsSuccess(false), 5000); 
      } else {
        console.error("Failed to send message. Server responded with an error.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
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
            <div className={styles["info-item"]}><div className={styles["icon-box"]}><FontAwesomeIcon icon={faPhone} /></div><div className={styles["info-text"]}><h4>Phone / WhatsApp</h4><p>+20 101 816 6445</p></div></div>
            <div className={styles["info-item"]}><div className={styles["icon-box"]}><FontAwesomeIcon icon={faLocationDot} /></div><div className={styles["info-text"]}><h4>Location</h4><p>Banha, Egypt</p></div></div>
            <div className={styles["contact-socials"]}>
              <a href="https://wa.me/201018166445" target="_blank" rel="noopener noreferrer" title="WhatsApp"><FontAwesomeIcon icon={faWhatsapp} /></a>
              <a href="https://www.linkedin.com/in/ahmed-emad-nasr/" target="_blank" rel="noopener noreferrer" title="LinkedIn"><FontAwesomeIcon icon={faLinkedin} /></a>
              <a href="https://x.com/0x3omda" target="_blank" rel="noopener noreferrer" title="X (Twitter)"><FontAwesomeIcon icon={faXTwitter} /></a>
              <a href="https://instagram.com/ahmed.em.nasr" target="_blank" rel="noopener noreferrer" title="Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="https://t.me/ahmed_em_nasr" target="_blank" rel="noopener noreferrer" title="Telegram"><FontAwesomeIcon icon={faTelegram} /></a>
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
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
});

export default SenseiContact;