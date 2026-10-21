"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle, ArrowUpRight, Mail } from "lucide-react";
import { Github, Linkedin, Youtube, Instagram, XLogo } from "@/app/core/icons/BrandIcons";
import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";
import { normalizePublicHref } from "@/app/core/config/shared";

/* The last line of every page: the mark, the copyright, the legal pages and
   the design credit. On the home page it closes the contact section; the
   other pages render it on its own. */
export function FooterBar({ className = "" }: { className?: string }) {
  const currentYear = new Date().getFullYear();
  return (
    <div className={`pt-8 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-6 text-on-surface-variant font-mono text-[10px] tracking-[0.3em] uppercase opacity-70 ${className}`}>
      <div className="flex items-center gap-4">
        <span className="text-primary font-black text-base tracking-normal font-display">
          AE.
        </span>
        <span>
          © {currentYear} {PORTFOLIO_DATA.profile.name}
        </span>
      </div>
      <nav aria-label="Site information" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link href="/cv" className="hover:text-primary transition-colors">CV</Link>
        <span className="text-primary" aria-hidden="true">•</span>
        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
        <span className="text-primary" aria-hidden="true">•</span>
        <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
        <span className="text-primary" aria-hidden="true">•</span>
        <a href={normalizePublicHref("feed.xml")} className="hover:text-primary transition-colors">RSS</a>
      </nav>
      <div className="flex items-center gap-2 text-on-surface-variant/50">
        <span>
          Design{" "}
          <a
            href="https://github.com/MostafaSensei106/Sensei-Dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Sensei-Dev
          </a>
        </span>
        <span className="text-primary">•</span>
        <span>次のレベル</span>
      </div>
    </div>
  );
}

export default function ContactFooter() {
  const socialLinks = [
    { name: "GitHub", icon: Github, href: `https://github.com/${PORTFOLIO_DATA.profile.contact.github}`, color: "text-primary" },
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
                <span className="text-primary font-mono text-[10px] tracking-[0.5em] uppercase font-bold">
                  The End of the Path
                </span>
              </div>

              {/* Sized to its column: the fixed text-9xl ran past the half-width
                  column into the form on every desktop width */}
              <h2 className="font-display text-[clamp(2.75rem,12vw,5rem)] lg:text-[clamp(3.5rem,5.6vw,8rem)] font-black uppercase leading-[0.8] mb-12 tracking-tighter">
                Forge <br /> <span className="text-primary italic">Together.</span>
              </h2>

              {/* Social Links  sharp-edged tags */}
              <div className="flex flex-wrap gap-3 mb-16">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-3 px-5 py-3 bg-foreground/5 border border-foreground/10 hover:border-primary/40 transition-all duration-300 ${social.color}`}
                    aria-label={social.name}
                  >
                    <social.icon size={18} />
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

              {/* Languages  from portfolio data */}
              <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.25em] uppercase">
                {PORTFOLIO_DATA.languages.map((l, i) => (
                  <span key={l.code} className="flex items-center gap-3">
                    {i > 0 && (
                      <span className="text-primary" aria-hidden="true">
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
              <Mail size={120} className="text-primary" />
            </div>

            {/* Briefing header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-[2px] bg-primary" />
              <span className="font-mono text-[9px] text-primary tracking-[0.4em] uppercase font-bold">
                Mission Briefing // 依頼
              </span>
            </div>
            <h3 className="font-display text-3xl font-black mb-3 uppercase tracking-tight text-foreground">
              Seal Intent
            </h3>
            <p className="font-mono text-[11px] text-foreground/45 tracking-wider mb-8">
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

                const mailto = `mailto:${PORTFOLIO_DATA.profile.contact.email}?subject=${subject}&body=${body}`;

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
                <label htmlFor="type" className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/40">
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
                aria-label="Dispatch Message"
                className="btn-sheen mt-4 w-full py-5 bg-primary text-white font-mono font-black uppercase tracking-[0.3em] text-sm hover:bg-foreground hover:text-background active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-primary/20"
              >
                DISPATCH MESSAGE
              </button>
            </form>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <FooterBar className="mt-32" />
      </div>
    </footer>
  );
}
