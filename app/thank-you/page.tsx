import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Thank You | Ahmed Emad Nasr",
  description: "Thanks for contacting Ahmed Emad Nasr. Your message has been received successfully.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Message Received | Ahmed Emad Nasr",
    description: "Thanks for contacting Ahmed Emad Nasr. I will get back to you soon.",
    type: "website",
    url: "https://ahmed-emad-nasr.github.io/Portfolio/thank-you",
    images: [
      {
        url: "/Assets/art-gallery/Images/logo/My_Logo.webp",
        width: 1200,
        height: 630,
        alt: "Thank You - Ahmed Emad Nasr",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Message Received | Ahmed Emad Nasr",
    description: "Thanks for contacting Ahmed Emad Nasr. I will get back to you soon.",
    images: ["/Assets/art-gallery/Images/logo/My_Logo.webp"],
  },
};

export default function ThankYouPage() {
  return (
    <main className={styles.wrap}>
      <section className={styles.card}>
        <div className={styles.badge}>
          <FontAwesomeIcon icon={faCheck} />
        </div>
        <h1 className={styles.title}>Message Received</h1>
        <p className={styles.text}>
          Thanks for reaching out. I got your message and will respond as soon as possible. You can return to the portfolio,
          or download my CV directly.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={`${styles.btn} ${styles.primary}`}>
            Back To Home
          </Link>
          <a
            href="../Assets/cv/AhmedEmad_SOCAnalyst_CV.pdf"
            className={`${styles.btn} ${styles.secondary}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download CV
          </a>
        </div>
      </section>
    </main>
  );
}
