"use client";

/*
 * ShareRow — copy the post's link, or share it on LinkedIn / X. Plain links:
 * nothing from those sites loads until the reader clicks.
 */

import { Check, Link2 } from "lucide-react";
import { Linkedin, XLogo } from "@/app/core/icons/BrandIcons";
import { useCopyLink } from "@/app/components/cases/useCopyLink";

export default function ShareRow({ url, title, lang }: { url: string; title: string; lang: "en" | "ar" }) {
  const { state, copy } = useCopyLink();
  const ar = lang === "ar";
  const btn =
    "inline-flex items-center gap-2 border border-foreground/15 px-3.5 py-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:border-primary hover:text-primary-ink";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="me-2 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-foreground/65">{ar ? "شارك" : "Share"}</span>
      <button type="button" className={btn} onClick={() => copy(url)}>
        {state === "done" ? <Check size={12} aria-hidden="true" /> : <Link2 size={12} aria-hidden="true" />}
        <span aria-live="polite">
          {state === "done" ? (ar ? "اتنسخ" : "Copied") : state === "error" ? (ar ? "انسخه يدوي" : "Copy failed") : ar ? "انسخ الرابط" : "Copy link"}
        </span>
      </button>
      <a className={btn} href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">
        <Linkedin size={12} aria-hidden="true" /> LinkedIn
      </a>
      <a className={btn} href={`https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&via=0x3omda`} target="_blank" rel="noopener noreferrer">
        <XLogo size={12} aria-hidden="true" /> X
      </a>
    </div>
  );
}
