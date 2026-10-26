"use client";

/*
 * PaletteHint — the command palette, the keyboard shortcuts and the terminal
 * are the site's best-kept secrets; nobody presses ⌘K on a portfolio unless
 * told. On a first visit with a keyboard, a small toast says so once, a few
 * seconds in, then never again (remembered per browser).
 */

import { useEffect, useState } from "react";
import { Command, X } from "lucide-react";

const KEY = "palette-hint-seen";

export default function PaletteHint() {
  const [open, setOpen] = useState(false);
  const [mac, setMac] = useState(false);

  useEffect(() => {
    /* Keyboard users only: on touch screens there is nothing to press */
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      return; // storage blocked: better to never show than to show every time
    }
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const t = window.setTimeout(() => setOpen(true), 7000);
    const close = () => setOpen(false);
    window.addEventListener("keydown", close, { once: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", close);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => setOpen(false), 9000);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <div
      role="status"
      className={`hidden md:flex fixed left-6 bottom-6 z-[85] max-w-sm items-start gap-4 border border-foreground/10 bg-surface/90 backdrop-blur-xl px-5 py-4 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
      }`}
    >
      <span className="absolute top-0 left-0 h-[2px] w-full origin-left bg-primary hint-timer" data-on={open} aria-hidden="true" />
      <Command size={16} className="mt-0.5 text-primary-ink shrink-0" aria-hidden="true" />
      <p className="text-sm text-foreground/80 leading-relaxed">
        Press{" "}
        <kbd className="px-1.5 py-0.5 border border-foreground/20 font-mono text-xs">{mac ? "⌘" : "Ctrl"} K</kbd> to search every case and
        section, <kbd className="px-1.5 py-0.5 border border-foreground/20 font-mono text-xs">?</kbd> for shortcuts — or just type{" "}
        <span className="font-mono text-primary-ink">3omda</span>.
      </p>
      <button type="button" onClick={() => setOpen(false)} className="text-foreground/40 hover:text-foreground" aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}
