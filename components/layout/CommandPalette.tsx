"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m as motion } from "framer-motion";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Briefcase,
  Code2,
  Palette,
  Mail,
  Sun,
  Moon,
  Copy,
  Check,
  Download,
  MessageCircle,
  Gauge,
  ChevronRight,
  Search,
  FileText,
  FolderSearch,
  SquareTerminal,
  Keyboard,
  PlayCircle,
  Crosshair,
  GraduationCap,
  Trophy,
  Award,
} from "lucide-react";
import { Github, Linkedin } from "@/components/ui/BrandIcons";
import { PORTFOLIO_DATA } from "@/data/portfolio-data";
import { ALL_GALLERY_CERTIFICATES } from "@/data/certifications";
import { normalizePublicHref } from "@/lib/shared";
import { scrollToHash } from "@/lib/perf/jump";
import { pageOf } from "@/lib/routes";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useThemeFx } from "@/components/layout/ThemeFxProvider";
import { FX_DURATIONS, getFxDuration, setFxDuration } from "@/lib/fx";

interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  run: () => void | Promise<void>;
}

/* Cases to search, fetched from /palette-index.json when the palette first opens */
type CaseIndexEntry = { id: string; title: string; category: string };

/* Loaded on demand by PaletteMount, so it starts open */
export default function CommandPalette() {
  const [open, setOpen] = useState(true);
  const [cases, setCases] = useState<readonly CaseIndexEntry[]>([]);
  useEffect(() => {
    let alive = true;
    fetch(normalizePublicHref("/palette-index.json"))
      .then((r) => (r.ok ? r.json() : []))
      .then((list: CaseIndexEntry[]) => alive && setCases(list))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fxDuration, setFxDurationState] = useState(getFxDuration());
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap([dialogRef], open);
  const { resolvedTheme } = useTheme();
  const { transitionTo } = useThemeFx();
  const router = useRouter();
  const pathname = usePathname() || "/";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onExternal = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("sensei:palette", onExternal);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("sensei:palette", onExternal);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      setCopied(false);
      setFxDurationState(getFxDuration());
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onFx = (e: Event) =>
      setFxDurationState((e as CustomEvent<number>).detail);
    window.addEventListener("sensei-fx-duration", onFx);
    return () => window.removeEventListener("sensei-fx-duration", onFx);
  }, []);

  /* A section lives on the home page, blog, or gallery (lib/routes.ts):
     jump to it on this page, or open its page at the anchor. */
  const go = useCallback(
    (hash: string) => {
      setOpen(false);
      const page = pageOf(hash.slice(1));
      if (pathname !== page) {
        router.push(`${page}${hash}`);
        return;
      }
      requestAnimationFrame(() => {
        scrollToHash(hash);
      });
    },
    [pathname, router]
  );

  const visit = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  const commands: Command[] = useMemo(() => {
    const c = PORTFOLIO_DATA.profile.contact;
    const isDark = resolvedTheme === "dark";
    return [
      { id: "home", group: "Go to", label: "Home", icon: Home, run: () => go("#home") },
      { id: "roles", group: "Go to", label: "Services & roles I fit", icon: Briefcase, run: () => go("#roles") },
      { id: "work", group: "Go to", label: "Selected work", icon: Code2, run: () => go("#work") },
      { id: "lab", group: "Go to", label: "Home lab architecture", icon: Code2, run: () => go("#lab") },
      { id: "experience", group: "Go to", label: "Experience", icon: Briefcase, run: () => go("#experience") },
      { id: "teaching", group: "Go to", label: "Teaching", icon: GraduationCap, run: () => go("#teaching") },
      { id: "faq", group: "Go to", label: "FAQ", icon: MessageCircle, run: () => go("#faq") },
      { id: "platforms", group: "Go to", label: "Practice platforms (THM, HTB …)", icon: Trophy, run: () => go("#platforms") },
      { id: "gallery", group: "Pages", label: "Proof gallery", icon: Palette, run: () => visit("/gallery") },
      { id: "all-certs", group: "Go to", label: `All certificates (${ALL_GALLERY_CERTIFICATES.length})`, icon: Award, run: () => go("#all-certificates") },
      { id: "attack", group: "Go to", label: "MITRE ATT&CK coverage", icon: Crosshair, run: () => go("#attack") },
      { id: "detections", group: "Go to", label: "Detection library (Wazuh rules)", icon: Crosshair, run: () => go("#detections") },
      { id: "triage", group: "Go to", label: "Triage challenge", icon: Crosshair, run: () => go("#triage") },
      { id: "wsa", group: "Go to", label: "PortSwigger Web Security Academy labs (29)", icon: FolderSearch, run: () => visit("/blog?q=PortSwigger#cases") },
      { id: "contact", group: "Go to", label: "Contact", icon: Mail, run: () => go("#contact") },
      { id: "blog-page", group: "Pages", label: "Blog — cases, ATT&CK, videos", icon: FileText, run: () => visit("/blog") },
      { id: "about-area", group: "Go to", label: "About — toolbox, lab, process", icon: FileText, run: () => go("#about") },
      { id: "blog", group: "Go to", label: "Case library", icon: FolderSearch, run: () => go("#cases") },
      { id: "stack", group: "Go to", label: "Tools of the trade", icon: Code2, run: () => go("#stack") },
      { id: "process", group: "Go to", label: "How I work (process)", icon: Briefcase, run: () => go("#process") },
      { id: "videos", group: "Go to", label: "Videos", icon: PlayCircle, run: () => go("#videos") },
      { id: "cv-page", group: "Pages", label: "CV", icon: FileText, run: () => visit("/cv") },
      {
        id: "theme", group: "Appearance", label: isDark ? "Switch to light mode" : "Switch to dark mode",
        icon: isDark ? Sun : Moon,
        run: () => {
          setOpen(false);
          transitionTo(isDark ? "light" : "dark", {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          });
        },
      },
      ...FX_DURATIONS.map((ms) => ({
        id: `fx-${ms}`,
        group: "Appearance",
        label: `Transition speed ${ms}ms${fxDuration === ms ? " (current)" : ""}`,
        hint: `${ms}ms`,
        icon: Gauge,
        run: () => {
          setFxDuration(ms);
          setFxDurationState(ms);
        },
      })),
      {
        id: "copy-email", group: "Actions", label: copied ? "Email copied!" : "Copy email address",
        hint: c.email, icon: copied ? Check : Copy,
        run: async () => {
          try {
            await navigator.clipboard.writeText(c.email);
            setCopied(true);
          } catch {
            window.location.href = `mailto:${c.email}`;
            setOpen(false);
          }
        },
      },
      {
        id: "cv", group: "Actions", label: "Download CV (PDF)", icon: Download,
        run: () => {
          window.open(PORTFOLIO_DATA.profile.hero.cvUrl, "_blank");
          setOpen(false);
        },
      },
      { id: "gh", group: "Social", label: "Open GitHub", hint: c.github, icon: Github, run: () => { window.open(`https://github.com/${c.github}`, "_blank"); setOpen(false); } },
      { id: "li", group: "Social", label: "Open LinkedIn", icon: Linkedin, run: () => { window.open(c.linkedin, "_blank"); setOpen(false); } },
      { id: "wa", group: "Social", label: "Open WhatsApp", icon: MessageCircle, run: () => { window.open(`https://wa.me/${c.whatsapp}`, "_blank"); setOpen(false); } },
      {
        id: "terminal", group: "Extras", label: "Open the terminal", hint: "3omda", icon: SquareTerminal,
        run: () => { setOpen(false); window.dispatchEvent(new Event("sensei:open-terminal")); },
      },
      {
        id: "shortcuts", group: "Extras", label: "Keyboard shortcuts", hint: "?", icon: Keyboard,
        run: () => { setOpen(false); window.dispatchEvent(new Event("sensei:open-shortcuts")); },
      },
    ];
  }, [go, visit, resolvedTheme, transitionTo, copied, fxDuration]);

  /* Cases and certificates join the list once you type */
  const caseCommands: Command[] = useMemo(
    () =>
      cases.map((item) => ({
        id: `case-${item.id}`,
        group: "Cases",
        label: item.title,
        hint: item.category,
        icon: FolderSearch,
        run: () => visit(`/blog/${item.id}`),
      })),
    [visit, cases]
  );

  const certCommands: Command[] = useMemo(
    () =>
      ALL_GALLERY_CERTIFICATES.map((cert) => ({
        id: `cert-${cert.galleryIndex}`,
        group: "Certificates",
        label: cert.title,
        hint: `${cert.issuer} · ${cert.kind}`,
        icon: Award,
        run: () => visit(`/gallery?cert=${cert.galleryIndex}#all-certificates`),
      })),
    [visit]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return [...commands, ...caseCommands, ...certCommands].filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        (c.hint ?? "").toLowerCase().includes(q)
    );
  }, [commands, caseCommands, certCommands, query]);

  useEffect(() => setIndex(0), [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[index]?.run();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[300] flex items-start justify-center bg-background/70 px-4 pt-[14vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-xl overflow-hidden border border-foreground/10 bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-foreground/10 px-4">
              <Search size={16} className="shrink-0 text-foreground/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a command, case, or certificate…"
                className="w-full bg-transparent py-4 text-sm text-foreground outline-none placeholder:text-foreground/60"
                aria-label="Search commands"
              />
              <kbd className="shrink-0 border border-foreground/15 px-1.5 py-0.5 font-mono text-[0.625rem] text-foreground/60">
                ESC
              </kbd>
            </div>

            <div className="max-h-[46vh] overflow-y-auto p-2" role="listbox">
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center font-mono text-xs text-foreground/60">
                  No commands match “{query}”.
                </p>
              )}
              {filtered.map((cmd, i) => (
                <button
                  key={cmd.id}
                  role="option"
                  aria-selected={i === index}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => cmd.run()}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    i === index ? "bg-primary/10 text-foreground" : "text-foreground/70"
                  }`}
                >
                  <cmd.icon
                    size={15}
                    className={i === index ? "text-primary-ink" : "text-foreground/40"}
                  />
                  <span className="flex-1 text-sm">{cmd.label}</span>
                  <span className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-foreground/60">
                    {cmd.group}
                  </span>
                  {cmd.hint && (
                    <span className="max-w-[180px] truncate font-mono text-[0.625rem] text-foreground/60">
                      {cmd.hint}
                    </span>
                  )}
                  {i === index && (
                    <ChevronRight size={14} className="text-primary-ink" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-foreground/10 px-4 py-2.5 font-mono text-[0.625rem] text-foreground/60">
              <span className="flex items-center gap-1.5">
                <kbd className="border border-foreground/15 px-1">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="border border-foreground/15 px-1">↵</kbd> run
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <kbd className="border border-foreground/15 px-1">Ctrl K</kbd> toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}