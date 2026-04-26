"use client";

/*
 * File: sensei-header.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render sticky navigation header (Cybersecurity HUD Theme)
 */

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import styles from "./sensei-header.module.css";

const BLOG_PATH = "/blog";

const SenseiHeader = memo(function SenseiHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={isScrolled ? `${styles.header} ${styles.scrolled}` : styles.header}
      data-site-header="true"
    >
      <Link
        href={BLOG_PATH}
        className={styles.title}
        aria-label="Ahmed Emad Nasr Blog"
      >
        Ahmed Emad Nasr Blog
      </Link>
    </header>
  );
});

export default SenseiHeader;