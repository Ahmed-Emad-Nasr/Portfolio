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

  /* Shown between the hero and the contact section, phones only. Two
     IntersectionObservers instead of a scroll handler that measured the
     contact section every frame — and that ran on desktops too, where the
     bar is never visible. */
  useEffect(() => {
    const phone = window.matchMedia("(max-width: 767px)");
    let io: IntersectionObserver | null = null;
    const start = () => {
      io?.disconnect();
      if (!phone.matches) {
        setShown(false);
        return;
      }
      const hero = document.getElementById("home");
      const contact = document.getElementById("contact");
      let pastHero = false;
      let nearContact = false;
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.target === hero) pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
            if (e.target === contact) nearContact = e.isIntersecting;
          }
          setShown(pastHero && !nearContact);
        },
        { rootMargin: "0px 0px -10% 0px" }
      );
      if (hero) io.observe(hero);
      if (contact) io.observe(contact);
    };
    start();
    phone.addEventListener("change", start);
    return () => {
      io?.disconnect();
      phone.removeEventListener("change", start);
    };
  }, []);

  const item = "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.2em] transition-colors";

  return (
    <nav
      aria-label="Quick actions"
      /* Hidden (slid off screen) = out of the tab order too */
      inert={!shown}
      className={`md:hidden fixed inset-x-3 z-[80] flex border border-foreground/10 bg-background/85 backdrop-blur-xl shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.6)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-[150%] opacity-0 pointer-events-none"
      }`}
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <span className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" aria-hidden="true" />
      <a href={normalizePublicHref(CV_PDF_HREF)} target="_blank" rel="noopener noreferrer" className={`${item} bg-primary text-white`}>
        <Download size={15} aria-hidden="true" /> Resume
      </a>
      <a href={normalizePublicHref("/blog")} className={`${item} text-foreground/80 hover:text-primary-ink`}>
        <FolderSearch size={15} aria-hidden="true" /> Blog
      </a>
      <a href="#contact" className={`${item} text-foreground/80 hover:text-primary-ink`}>
        <Mail size={15} aria-hidden="true" /> Contact
      </a>
    </nav>
  );
}
