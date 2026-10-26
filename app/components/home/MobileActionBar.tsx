"use client";

/*
 * MobileActionBar — on phones the page is long, and the CV and the contact
 * form sit at the two ends of it. Once the hero has scrolled away, a slim bar
 * slides up from the bottom with the three things a recruiter came for. It
 * slides away again over the contact section (where it would be redundant)
 * and never shows on wider screens, which have the top navigation.
 */

import { useEffect, useState } from "react";
import { Download, FolderSearch, Mail } from "lucide-react";
import { CV_PDF_HREF, normalizePublicHref } from "@/app/core/config/shared";

export default function MobileActionBar() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const contact = document.getElementById("contact");
      const nearContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.9 : false;
      setShown(window.scrollY > window.innerHeight * 0.9 && !nearContact);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const item = "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.2em] transition-colors";

  return (
    <nav
      aria-label="Quick actions"
      className={`md:hidden fixed inset-x-3 z-[80] flex border border-foreground/10 bg-background/85 backdrop-blur-xl shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.6)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-[150%] opacity-0 pointer-events-none"
      }`}
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <span className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" aria-hidden="true" />
      <a href={normalizePublicHref(CV_PDF_HREF)} target="_blank" rel="noopener noreferrer" className={`${item} bg-primary text-white`}>
        <Download size={15} aria-hidden="true" /> Resume
      </a>
      <a href="#cases" className={`${item} text-foreground/80 hover:text-primary-ink`}>
        <FolderSearch size={15} aria-hidden="true" /> Cases
      </a>
      <a href="#contact" className={`${item} text-foreground/80 hover:text-primary-ink`}>
        <Mail size={15} aria-hidden="true" /> Contact
      </a>
    </nav>
  );
}
