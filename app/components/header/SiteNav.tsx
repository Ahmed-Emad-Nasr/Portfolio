"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/app/core/components/ThemeToggle";
import {
  Menu,
  X,
  Home,
  Briefcase,
  Code2,
  Award,
  FolderSearch,
  MessageCircle,
  Mail,
  Command,
} from "lucide-react";

/* Every item is a section of the one-page portfolio. Off the home page
   (a case page, the CV) they become links back to it: /#work, /#cases … */
const navItems = [
  { name: "Home", href: "#home", icon: Home, katakana: "ホーム" },
  { name: "Services", href: "#services", icon: Briefcase, katakana: "役務" },
  { name: "Work", href: "#work", icon: Code2, katakana: "仕事" },
  { name: "Experience", href: "#experience", icon: Briefcase, katakana: "経験" },
  { name: "FAQ", href: "#faq", icon: MessageCircle, katakana: "質問" },
  { name: "Honors", href: "#certificates", icon: Award, katakana: "認定" },
  { name: "Cases", href: "#cases", icon: FolderSearch, katakana: "事件" },
  { name: "Contact", href: "#contact", icon: Mail, katakana: "連絡" },
];

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
  return (
    <Link href={href.startsWith("#") ? `/${href}` : href} className={className} {...rest}>
      {children}
    </Link>
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
      setActive(navItems.find((i) => i.href !== "/" && i.href.startsWith("/") && pathname.startsWith(i.href))?.href ?? "");
      return;
    }
    const ids = navItems.filter((i) => i.href.startsWith("#")).map((i) => i.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [mounted, onHome, pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navWidth = useTransform(scrollY, [0, 100], ["95%", "85%"]);

  return (
    <>
      {/* ─── Main Navigation Bar ─── */}
      <motion.nav
        className="fixed z-[100] left-1/2 -translate-x-1/2 backdrop-blur-xl bg-background/60 border border-foreground/10 px-4 md:px-8 py-2 md:py-3 flex items-center justify-between transition-all duration-500 ease-out"
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
          aria-label="Ahmed Emad Nasr — home"
        >
          <span className="text-foreground group-hover:text-primary transition-colors duration-300">
            AE
          </span>
          <span className="text-primary text-2xl leading-none">.</span>
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-5 lg:gap-7">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              href={item.href}
              onHome={onHome}
              aria-current={active === item.href ? "page" : undefined}
              className={`relative flex items-center gap-2 text-[9px] lg:text-[10px] font-mono font-bold uppercase tracking-[0.22em] transition-all duration-300 group ${
                active === item.href ? "text-foreground" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <item.icon
                size={12}
                strokeWidth={2.5}
                className={`transition-colors duration-300 ${active === item.href ? "text-primary" : "text-foreground/30 group-hover:text-primary"}`}
              />
              <span>{item.name}</span>
              {/* Red dot indicator */}
              <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-none transition-opacity duration-300 ${active === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
            </NavLink>
          ))}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 text-foreground/60 hover:text-primary transition-colors z-[110]"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Desktop theme toggle */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("sensei:palette"))}
            aria-label="Open command palette (Ctrl+K)"
            title="Commands (Ctrl+K)"
            className="flex items-center gap-1.5 border border-foreground/10 bg-foreground/[0.03] px-2.5 py-2.5 font-mono text-[10px] text-foreground/50 transition-colors duration-300 hover:border-primary hover:text-primary"
          >
            <Command size={14} />
            <kbd>K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </motion.nav>

      {/* ─── Mobile Full-Screen Overlay ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[95] md:hidden bg-background/95 backdrop-blur-2xl flex flex-col"
            onClick={() => setIsOpen(false)}
          >
            {/* Background Decorative Kanji */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
              aria-hidden="true"
            >
              <span className="text-foreground/[0.02] text-[40vw] font-black leading-none">
                武
              </span>
            </div>
            <div
              className="absolute top-20 right-8 pointer-events-none select-none vertical-text text-foreground/[0.04] text-4xl font-black"
              aria-hidden="true"
            >
              <span>侍</span>
              <span>道</span>
              <span>魂</span>
            </div>

            {/* Red accent lines */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary" />
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary/30" />
            <div className="absolute top-0 left-8 w-[2px] h-full bg-foreground/[0.03]" />

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 z-[110] w-12 h-12 flex items-center justify-center border border-primary/40 text-primary hover:bg-primary hover:text-foreground transition-all duration-300"
              aria-label="Close Menu"
            >
              <X size={20} strokeWidth={3} />
            </motion.button>

            {/* Navigation Items */}
            <div
              className="flex flex-col justify-center flex-1 px-10 gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.1 + idx * 0.07,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="border-b border-foreground/5 last:border-b-0"
                >
                <NavLink
                  href={item.href}
                  onHome={onHome}
                  onClick={() => setIsOpen(false)}
                  className="group relative flex items-center gap-6 py-4"
                >
                  {/* Index Number */}
                  <span className="font-mono text-[10px] text-foreground/20 w-6 tabular-nums">
                    0{idx + 1}
                  </span>

                  {/* Icon */}
                  <item.icon
                    size={24}
                    strokeWidth={1.5}
                    className="text-foreground/15 group-hover:text-primary transition-colors duration-300"
                  />

                  {/* Name - large katakana style */}
                  <div className="flex flex-col">
                    <span className="font-display text-3xl font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors duration-300">
                      {item.name}
                    </span>
                    <span className="font-mono text-[10px] text-foreground/25 tracking-[0.3em]">
                      {item.katakana}
                    </span>
                  </div>

                  {/* Red accent on hover */}
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-[2px] bg-primary group-hover:w-6 transition-all duration-300" />
                </NavLink>
                </motion.div>
              ))}

              {/* Bottom tagline */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 flex flex-col gap-3"
              >
                <div className="w-16 h-[2px] bg-primary" />
                <span className="text-[9px] font-mono text-foreground/30 tracking-[0.5em] uppercase">
                  3omda Portfolio
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
