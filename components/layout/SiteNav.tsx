"use client";

import { m as motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { lockScroll } from "@/lib/scroll";
import { useFocusTrap } from "@/lib/use-focus-trap";
import PageLink from "@/components/ui/PageLink";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LAZY_MOUNTED } from "@/lib/perf/schedule";
import {
  Menu,
  X,
  Home,
  Briefcase,
  Code2,
  BookOpen,
  Images,
  UserRound,
  Mail,
  Command,
} from "lucide-react";

/* The home page's sections (hash links — from another page they become
   /#work …) plus the blog, which is its own page. */
const navItems = [
  { name: "Home", href: "#home", icon: Home, katakana: "ホーム" },
  { name: "Services", href: "#services", icon: Briefcase, katakana: "役務" },
  { name: "Work", href: "#work", icon: Code2, katakana: "仕事" },
  { name: "Experience", href: "#experience", icon: Briefcase, katakana: "経験" },
  { name: "About", href: "#about", icon: UserRound, katakana: "人物" },
  { name: "Blog", href: "/blog", icon: BookOpen, katakana: "記録" },
  { name: "Gallery", href: "/gallery", icon: Images, katakana: "写真" },
  { name: "Contact", href: "#contact", icon: Mail, katakana: "連絡" },
];

/* Where each item's part of the home page ends: "About" stays lit through
   the toolbox, lab and path sections; the blog teaser lights "Blog" */
const AREA_OF: Record<string, string> = {
  roles: "#services",
  projects: "#work",
  teaching: "#experience",
  platforms: "#platforms",
  stack: "#about",
  uses: "#about",
  lab: "#about",
  path: "#about",
  now: "#about",
  process: "#about",
  contributions: "#about",
  blog: "/blog",
  faq: "#contact",
};

function NavLink({
  href,
  onHome,
  className,
  children,
  ...rest
}: {
  href: string;
  onHome: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  "aria-current"?: "page" | undefined;
}) {
  if (href.startsWith("#") && onHome) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }
  /* Another page (or the home page from the blog): fetched on intent —
     the nav is always on screen, so viewport prefetching would download
     the other page on every load */
  return (
    <PageLink href={href.startsWith("#") ? `/${href}` : href} className={className} {...rest}>
      {children}
    </PageLink>
  );
}

export default function SiteNav() {
  const { scrollY } = useScroll();
  const pathname = usePathname() || "/";
  const onHome = pathname === "/";
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!onHome) {
      /* Blog and gallery pages each light their own top-level destination. */
      setActive(pathname.startsWith("/blog") ? "/blog" : pathname.startsWith("/gallery") ? "/gallery" : "");
      return;
    }
    const ids = [...navItems.filter((i) => i.href.startsWith("#")).map((i) => i.href.slice(1)), ...Object.keys(AREA_OF)];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(AREA_OF[e.target.id] ?? `#${e.target.id}`);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    /* Lazy sections replace their placeholder when they load, so the
       observed elements are looked up again whenever the page grows */
    const observed = new Set<Element>();
    const watch = () => {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el && !observed.has(el)) {
          observed.add(el);
          observer.observe(el);
        }
      });
    };
    watch();
    window.addEventListener(LAZY_MOUNTED, watch);
    return () => {
      observer.disconnect();
      window.removeEventListener(LAZY_MOUNTED, watch);
    };
  }, [mounted, onHome, pathname]);

  /* While the menu is open: freeze the page (Lenis included), close on
     Escape, and move focus into the menu; on close, focus returns to the
     button that opened it. */
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  /* Tab cycles through the bar's own buttons (close, theme) and the menu */
  useFocusTrap([navRef, menuRef], isOpen);
  useEffect(() => {
    if (!isOpen) return;
    lockScroll(true);
    const toggle = toggleRef.current;
    menuRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
      toggle?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  /* A rotated phone or a resized window can cross into the desktop bar
     with the menu still open — and the body still locked. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const close = () => mq.matches && setIsOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  const navWidth = useTransform(scrollY, [0, 100], ["95%", "85%"]);

  return (
    <>
      {/* ─── Main Navigation Bar ─── */}
      <motion.nav
        ref={navRef}
        data-site-header="true"
        className="fixed z-[100] left-1/2 -translate-x-1/2 backdrop-blur-xl bg-background/60 border border-foreground/10 px-4 md:px-8 py-2 md:py-3 flex items-center justify-between transition-[width,background-color,border-color] duration-500 ease-out"
        style={{
          width: navWidth,
          top: 20,
          borderTop: "2px solid #BC002D",
          clipPath: "polygon(0 0, 100% 0, 98% 100%, 2% 100%)",
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Logo */}
        <NavLink
          href="#home"
          onHome={onHome}
          className="font-display font-bold text-lg md:text-xl tracking-tighter cursor-pointer flex items-center group shrink-0"
          aria-label="AE. — Ahmed Emad Nasr, home"
        >
          <span className="text-foreground group-hover:text-primary-ink transition-colors duration-300">
            AE
          </span>
          <span className="text-primary text-2xl leading-none">.</span>
        </NavLink>

        {/* Desktop Menu — from lg: between md and lg the eight links plus the
            ⌘K/theme buttons were ~90px wider than the bar and ran under its
            clipped edge, so tablets get the full-screen menu instead. */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-7">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              href={item.href}
              onHome={onHome}
              aria-current={active === item.href ? "page" : undefined}
              className={`relative flex items-center gap-2 text-[0.625rem] font-mono font-bold uppercase tracking-[0.22em] transition-all duration-300 group ${
                active === item.href ? "text-foreground" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <item.icon
                size={12}
                strokeWidth={2.5}
                aria-hidden="true"
                className={`hidden xl:block transition-colors duration-300 ${active === item.href ? "text-primary-ink" : "text-foreground/30 group-hover:text-primary-ink"}`}
              />
              <span>{item.name}</span>
              {/* Red dot indicator */}
              <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-none transition-opacity duration-300 ${active === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
            </NavLink>
          ))}
        </div>

        {/* Mobile Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            ref={toggleRef}
            onClick={() => setIsOpen(!isOpen)}
            className="relative grid place-items-center w-11 h-11 text-foreground/60 hover:text-primary-ink transition-colors z-[110]"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Desktop theme toggle */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("sensei:palette"))}
            aria-label="Open command palette (Ctrl+K)"
            title="Commands (Ctrl+K)"
            className="flex items-center gap-1.5 border border-foreground/10 bg-foreground/[0.03] px-2.5 py-2.5 font-mono text-[0.625rem] text-foreground/60 transition-colors duration-300 hover:border-primary hover:text-primary-ink"
          >
            <Command size={14} />
            <kbd>K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </motion.nav>

      {/* ─── Mobile Full-Screen Overlay ───
          The bar above stays on top (z-100) and its button turns into the
          close button — one close control, not two stacked in a corner.
          The layer itself scrolls: eight items are taller than a short or
          landscape phone, and centring overflowing content with
          justify-center pushed the first item (Home) above the screen,
          out of reach. `safe center` centres only when everything fits. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[95] lg:hidden bg-background/95 backdrop-blur-2xl overflow-y-auto overscroll-contain"
            data-lenis-prevent=""
            onClick={() => setIsOpen(false)}
          >
            {/* Background Decorative Kanji */}
            <div
              className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
              aria-hidden="true"
            >
              <span className="text-foreground/[0.02] text-[40vw] font-black leading-none">
                武
              </span>
            </div>
            <div
              className="fixed top-28 right-6 pointer-events-none select-none vertical-text text-foreground/[0.04] text-4xl font-black max-sm:hidden"
              aria-hidden="true"
            >
              <span>侍</span>
              <span>道</span>
              <span>魂</span>
            </div>

            {/* Red accent lines */}
            <div className="fixed top-0 left-0 w-full h-[2px] bg-primary" aria-hidden="true" />
            <div className="fixed bottom-0 left-0 w-full h-[2px] bg-primary/30" aria-hidden="true" />
            <div className="fixed top-0 left-4 sm:left-8 w-[2px] h-full bg-foreground/[0.03]" aria-hidden="true" />

            {/* Navigation Items */}
            <div
              ref={menuRef}
              className="relative min-h-full flex flex-col [justify-content:safe_center] px-6 sm:px-10 pt-28 pb-[max(2.5rem,env(safe-area-inset-bottom))] max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <nav aria-label="Site">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.1 + idx * 0.06,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="border-b border-foreground/5 last:border-b-0"
                >
                <NavLink
                  href={item.href}
                  onHome={onHome}
                  onClick={() => setIsOpen(false)}
                  aria-current={active === item.href ? "page" : undefined}
                  className="group relative flex items-center gap-4 sm:gap-6 py-3 [@media(min-height:44rem)]:py-4"
                >
                  {/* Index Number */}
                  <span className="font-mono text-[0.625rem] text-foreground/60 w-6 shrink-0 tabular-nums">
                    0{idx + 1}
                  </span>

                  {/* Icon */}
                  <item.icon
                    size={24}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className={`shrink-0 transition-colors duration-300 ${active === item.href ? "text-primary-ink" : "text-foreground/15 group-hover:text-primary-ink"}`}
                  />

                  {/* Name — sized to the screen so "EXPERIENCE" fits a
                      320px phone (it overflowed and squeezed its icon) */}
                  <div className="flex flex-col min-w-0">
                    <span className={`font-display text-[clamp(1.375rem,7.2vw,1.875rem)] leading-tight font-black uppercase tracking-tight transition-colors duration-300 group-hover:text-primary ${active === item.href ? "text-primary-ink" : "text-foreground"}`}>
                      {item.name}
                    </span>
                    <span className="font-mono text-[0.625rem] text-foreground/60 tracking-[0.3em]" lang="ja">
                      {item.katakana}
                    </span>
                  </div>

                  {/* Red accent on hover */}
                  <span className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 w-0 h-[2px] bg-primary group-hover:w-3 sm:group-hover:w-4 transition-all duration-300" aria-hidden="true" />
                </NavLink>
                </motion.div>
              ))}
              </nav>

              {/* Bottom tagline + the palette, which has no shortcut on a phone */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-10 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-3">
                  <div className="w-16 h-[2px] bg-primary" aria-hidden="true" />
                  <span className="text-[0.625rem] font-mono text-foreground/60 tracking-[0.5em] uppercase">
                    3omda Portfolio
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    window.dispatchEvent(new Event("sensei:palette"));
                  }}
                  className="flex items-center gap-2 border border-foreground/15 px-4 py-3 font-mono text-[0.625rem] font-bold uppercase tracking-[0.25em] text-foreground/70 transition-colors hover:border-primary hover:text-primary-ink"
                >
                  <Command size={14} aria-hidden="true" />
                  Search
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
