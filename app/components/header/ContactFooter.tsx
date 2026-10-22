"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MessageCircle, ArrowUpRight, Mail, Copy, Check, ShieldCheck, KeyRound } from "lucide-react";
import { Github, Linkedin, Youtube, Instagram, XLogo } from "@/app/core/icons/BrandIcons";
import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";
import { normalizePublicHref } from "@/app/core/config/shared";
import { useCopyLink } from "@/app/components/cases/useCopyLink";
import { PGP, SECURITY_TXT_PATH, formattedFingerprint, hasPgpKey } from "@/app/core/config/security";

/* The last line of every page: the mark, the copyright, the legal pages and
   the design credit. On the home page it closes the contact section; the
   other pages render it on its own. */
export function FooterBar({ className = "" }: { className?: string }) {
  const currentYear = new Date().getFullYear();
  return (
    <div className={`pt-8 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-6 text-on-surface-variant font-mono text-[10px] tracking-[0.3em] uppercase ${className}`}>
      <div className="flex items-center gap-4">
        <span className="text-primary-ink font-black text-base tracking-normal font-display">
          AE.
        </span>
        <span>
          © {currentYear} {PORTFOLIO_DATA.profile.name}
        </span>
      </div>
      <nav aria-label="Site information" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link href="/cv" className="hover:text-primary-ink transition-colors">CV</Link>
        <span className="text-primary-ink" aria-hidden="true">•</span>
        <Link href="/privacy" className="hover:text-primary-ink transition-colors">Privacy</Link>
        <span className="text-primary-ink" aria-hidden="true">•</span>
        <Link href="/terms" className="hover:text-primary-ink transition-colors">Terms</Link>
        <span className="text-primary-ink" aria-hidden="true">•</span>
        <a href={normalizePublicHref("feed.xml")} className="hover:text-primary-ink transition-colors">RSS</a>
        <span className="text-primary-ink" aria-hidden="true">•</span>
        <a href={normalizePublicHref(SECURITY_TXT_PATH)} className="hover:text-primary-ink transition-colors normal-case tracking-[0.2em]">
          security.txt
        </a>
      </nav>
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span>
          Design{" "}
          <a
            href="https://github.com/MostafaSensei106/Sensei-Dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-ink transition-colors"
          >
            Sensei-Dev
          </a>
        </span>
        <span className="text-primary-ink">•</span>
        <span lang="ja" aria-hidden="true">次のレベル</span>
      </div>
    </div>
  );
}

type Draft = { subject: string; body: string };

const EMAIL = PORTFOLIO_DATA.profile.contact.email;

/* Gmail's web composer, prefilled — for visitors with no mail app set up,
   where a mailto: link silently does nothing. */
const gmailComposeUrl = ({ subject, body }: Draft) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export default function ContactFooter() {
  const { state: emailCopy, copy: copyEmail } = useCopyLink();
  const { state: draftCopy, copy: copyDraft } = useCopyLink();
  const { state: fpCopy, copy: copyFingerprint } = useCopyLink();
  /* The last message handed to the mail app — kept so the fallback panel
     can offer the same text another way. */
  const [draft, setDraft] = useState<Draft | null>(null);

  const socialLinks = [
    { name: "GitHub", icon: Github, href: `https://github.com/${PORTFOLIO_DATA.profile.contact.github}`, color: "text-primary-ink" },
    { name: "LinkedIn", icon: Linkedin, href: `${PORTFOLIO_DATA.profile.contact.linkedin}`, color: "text-[#0077b5]" },
    { name: "WhatsApp", icon: MessageCircle, href: `https://wa.me/${PORTFOLIO_DATA.profile.contact.whatsapp}`, color: "text-[#25d366]" },
    { name: "YouTube", icon: Youtube, href: PORTFOLIO_DATA.profile.contact.youtube, color: "text-[#ff0000]" },
    { name: "Instagram", icon: Instagram, href: PORTFOLIO_DATA.profile.contact.instagram, color: "text-[#e1306c]" },
    { name: "X", icon: XLogo, href: `${PORTFOLIO_DATA.profile.contact.x}`, color: "text-foreground" },
  ];

  return (
    <footer className="relative bg-background pt-24 md:pt-32 pb-12 px-6 md:px-20 overflow-hidden border-t border-foreground/5">
      {/* Background Torii Silhouette */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140vw] h-[70vh] opacity-[0.02] pointer-events-none select-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-foreground">
          <path d="M5,25 Q50,15 95,25 L95,32 Q50,22 5,32 Z M20,32 L20,100 M80,32 L80,100 M15,50 L85,50" />
        </svg>
      </div>

      {/* Background 終わり in massive faded text */}
      <div
        className="absolute right-0 bottom-10 vertical-text font-black text-[20vw] opacity-[0.03] pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        終わり
      </div>

      {/* Decorative speed lines */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[15%] left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
        <div className="absolute top-[30%] left-0 w-full h-px bg-gradient-to-r from-transparent via-foreground/3 to-transparent" />
        <div className="absolute top-[60%] left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
        <div className="absolute top-[85%] left-0 w-full h-px bg-gradient-to-r from-transparent via-foreground/3 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Brand Column */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[2px] bg-primary" />
                <span className="text-primary-ink font-mono text-[10px] tracking-[0.5em] uppercase font-bold">
                  The End of the Path
                </span>
              </div>

              {/* Sized to its column: the fixed text-9xl ran past the half-width
                  column into the form on every desktop width */}
              <h2 className="font-display text-[clamp(2rem,10.5vw,5rem)] lg:text-[clamp(3rem,4.8vw,8rem)] font-black uppercase leading-[0.8] mb-12 tracking-tighter">
                Forge <br /> <span className="text-primary italic">Together.</span>
              </h2>

              {/* Direct email: the one channel a recruiter usually wants,
                  readable and copyable without opening anything. */}
              <div className="mb-6 flex flex-wrap items-stretch gap-3">
                <a
                  href={`mailto:${EMAIL}`}
                  className="group flex min-w-0 items-center gap-3 px-5 py-3 border border-primary/30 bg-primary/[0.06] hover:border-primary transition-colors duration-300"
                >
                  <Mail size={18} className="shrink-0 text-primary-ink" aria-hidden="true" />
                  <span className="truncate font-mono text-sm text-foreground">{EMAIL}</span>
                </a>
                <button
                  type="button"
                  onClick={() => void copyEmail(EMAIL)}
                  className="flex items-center gap-2 px-4 py-3 border border-foreground/10 bg-foreground/5 hover:border-primary/40 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/80 transition-colors duration-300"
                  aria-label={emailCopy === "done" ? "Email address copied" : "Copy email address"}
                >
                  {emailCopy === "done" ? <Check size={14} className="text-tertiary" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                  {emailCopy === "done" ? "Copied" : emailCopy === "error" ? "Copy failed" : "Copy"}
                </button>
              </div>

              {/* Social Links  sharp-edged tags */}
              <div className="flex flex-wrap gap-3 mb-10">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-5 py-3 bg-foreground/5 border border-foreground/10 hover:border-primary/40 transition-all duration-300 text-foreground/80 hover:text-foreground"
                  >
                    {/* Brand colour on the icon only: LinkedIn blue or YouTube
                        red as 10px text fell below 4.5:1 on the dark theme. */}
                    <social.icon size={18} className={social.color} aria-hidden="true" />
                    <span className="font-mono font-bold uppercase tracking-[0.15em] text-[10px]">
                      {social.name}
                    </span>
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1 group-hover:translate-y-0"
                    />
                  </a>
                ))}
              </div>

              {/* Responsible disclosure: security.txt, and the PGP key once
                  one is set in core/config/security.ts */}
              <div className="relative mb-12 max-w-xl border border-foreground/10 border-l-2 border-l-primary bg-foreground/[0.02] px-5 py-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="shrink-0 text-primary-ink" aria-hidden="true" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-foreground">
                    Responsible disclosure
                  </span>
                  <span className="jp-eyebrow text-[9px] text-foreground/30" lang="ja" aria-hidden="true">
                    開示
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground/60 font-light leading-relaxed">
                  Found something on this site? Report it privately —{" "}
                  <a
                    href={normalizePublicHref(SECURITY_TXT_PATH)}
                    className="font-mono text-[13px] text-foreground/80 underline underline-offset-4 decoration-primary/50 hover:text-primary-ink"
                  >
                    security.txt
                  </a>{" "}
                  {hasPgpKey() ? "has the details, and the key below encrypts it." : "has the details."}
                </p>
                {hasPgpKey() && (
                  <div className="mt-4 pt-4 border-t border-foreground/10">
                    <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/60">PGP fingerprint</p>
                    <p className="mt-1.5 font-mono text-xs md:text-[13px] tracking-[0.08em] text-accent break-words">
                      {formattedFingerprint()}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={normalizePublicHref(PGP.keyFile)}
                        download
                        className="flex items-center gap-2 px-3.5 py-2 border border-foreground/15 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/80 hover:border-primary/40 transition-colors duration-300"
                      >
                        <KeyRound size={12} aria-hidden="true" /> Public key
                      </a>
                      <button
                        type="button"
                        onClick={() => void copyFingerprint(formattedFingerprint())}
                        className="flex items-center gap-2 px-3.5 py-2 border border-foreground/15 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/80 hover:border-primary/40 transition-colors duration-300"
                        aria-label={fpCopy === "done" ? "Fingerprint copied" : "Copy PGP fingerprint"}
                      >
                        {fpCopy === "done" ? <Check size={12} className="text-tertiary" aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                        {fpCopy === "done" ? "Copied" : "Copy fingerprint"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Languages  from portfolio data */}
              <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.25em] uppercase">
                {PORTFOLIO_DATA.languages.map((l, i) => (
                  <span key={l.code} className="flex items-center gap-3">
                    {i > 0 && (
                      <span className="text-primary-ink" aria-hidden="true">
                        •
                      </span>
                    )}
                    <span className="text-foreground/60">
                      {l.code}  {l.level}
                    </span>
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Form Column  Mission Briefing style */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative bg-surface/60 backdrop-blur-xl border border-foreground/5 p-8 md:p-12 group"
          >
            {/* Corner bracket accents */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary/40" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary/40" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary/40" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary/40" />

            {/* Background mail icon */}
            <div className="absolute top-4 right-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
              <Mail size={120} className="text-primary-ink" />
            </div>

            {/* Briefing header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-[2px] bg-primary" />
              <span className="font-mono text-[9px] text-primary-ink tracking-[0.4em] uppercase font-bold">
                Mission Briefing // 依頼
              </span>
            </div>
            <h3 className="font-display text-3xl font-black mb-3 uppercase tracking-tight text-foreground">
              Seal Intent
            </h3>
            <p className="font-mono text-[11px] text-foreground/60 tracking-wider mb-8">
              {PORTFOLIO_DATA.profile.availability}  training and collaborations welcome too.
            </p>

            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => {
                e.preventDefault();

                const form = e.currentTarget;
                const formData = new FormData(form);

                const name = formData.get("name")?.toString() || "";
                const email = formData.get("email")?.toString() || "";
                const type = formData.get("type")?.toString() || "project";
                const message = formData.get("message")?.toString() || "";

                const subject = encodeURIComponent(`[${type}] Inquiry from ${name}`);
                const fullBody = `Sender: ${name} (${email})\nType: ${type}\n\n${message}`;
                const body = encodeURIComponent(fullBody);

                const mailto = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

                setDraft({ subject: `[${type}] Inquiry from ${name}`, body: fullBody });
                window.location.assign(mailto);
              }}
            >
              <div className="relative">
                <label htmlFor="name" className="sr-only">
                  Name / Organization
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  className="w-full bg-transparent border-b border-foreground/10 py-4 focus:outline-none focus:border-primary transition-all duration-300 text-lg font-light placeholder:text-foreground/30 font-mono"
                  placeholder="Name / Organization"
                />
              </div>
              <div className="relative">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  className="w-full bg-transparent border-b border-foreground/10 py-4 focus:outline-none focus:border-primary transition-all duration-300 text-lg font-light placeholder:text-foreground/30 font-mono"
                  placeholder="Email"
                />
              </div>
              <div className="relative">
                <label htmlFor="type" className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                  Reason
                </label>
                <select
                  id="type"
                  name="type"
                  className="mt-2 w-full bg-transparent border-b border-foreground/10 py-4 focus:outline-none focus:border-primary transition-all duration-300 text-base font-mono text-foreground/80 [&>option]:bg-surface"
                  defaultValue="Job opportunity"
                >
                  <option>Job opportunity</option>
                  <option>Training / course</option>
                  <option>Collaboration</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="relative">
                <label htmlFor="message" className="sr-only">
                  Project details
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={3}
                  className="w-full bg-transparent border-b border-foreground/10 py-4 focus:outline-none focus:border-primary transition-all duration-300 text-lg font-light resize-none placeholder:text-foreground/30 font-mono"
                  placeholder="The role or the project: team, timeline, links"
                />
              </div>
              <button
                type="submit"
                className="btn-sheen mt-4 w-full py-5 bg-primary text-white font-mono font-black uppercase tracking-[0.3em] text-sm hover:bg-foreground hover:text-background active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-primary/20"
              >
                DISPATCH MESSAGE
              </button>

              {/* A static site has no server to send mail: the button opens
                  the visitor's mail app. When none is set up nothing visible
                  happens, so the same message is offered two other ways. */}
              <AnimatePresence>
                {draft && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="status"
                    className="border-l-2 border-primary bg-foreground/[0.03] px-5 py-4"
                  >
                    <p className="font-mono text-[11px] leading-relaxed text-foreground/70">
                      Your mail app should open with the message ready. Nothing opened?
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <a
                        href={gmailComposeUrl(draft)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-mono text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-foreground hover:text-background transition-colors duration-300"
                      >
                        Open in Gmail <ArrowUpRight size={12} aria-hidden="true" />
                      </a>
                      <button
                        type="button"
                        onClick={() => void copyDraft(`To: ${EMAIL}\nSubject: ${draft.subject}\n\n${draft.body}`)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-foreground/15 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/80 hover:border-primary/40 transition-colors duration-300"
                      >
                        {draftCopy === "done" ? <Check size={12} className="text-tertiary" aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                        {draftCopy === "done" ? "Copied" : "Copy message"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <FooterBar className="mt-32" />
      </div>
    </footer>
  );
}
