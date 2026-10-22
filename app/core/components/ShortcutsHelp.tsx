"use client";

/*
 * ShortcutsHelp.tsx
 * Author: Ahmed Emad Nasr
 *
 * The shortcuts sheet that opens with "?" — the same idea GitHub and Gmail
 * use. Styled as a sibling of the command palette. Lazy, so it costs
 * nothing until someone asks for it.
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Keyboard } from "lucide-react";

const GROUPS: { title: string; items: { keys: string[]; label: string }[] }[] = [
  {
    title: "General",
    items: [
      { keys: ["Ctrl", "K"], label: "Command palette" },
      { keys: ["/"], label: "Command palette (quick)" },
      { keys: ["?"], label: "This help sheet" },
      { keys: ["Esc"], label: "Close any overlay" },
    ],
  },
  {
    title: "Go to",
    items: [
      { keys: ["g", "h"], label: "Home" },
      { keys: ["g", "w"], label: "Selected work" },
      { keys: ["g", "e"], label: "Experience" },
      { keys: ["g", "c"], label: "Certifications" },
      { keys: ["g", "a"], label: "ATT&CK coverage" },
      { keys: ["g", "b"], label: "Case library" },
      { keys: ["g", "t"], label: "Back to top" },
    ],
  },
  {
    title: "Hidden",
    items: [{ keys: ["type", "3omda"], label: "…try it" }],
  },
];

export default function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[300] flex items-start justify-center bg-background/70 px-4 pt-[14vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-xl max-h-[72vh] overflow-y-auto border border-foreground/10 bg-surface shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-foreground/10 px-4 py-4">
          <Keyboard size={16} className="shrink-0 text-primary-ink" />
          <h2 className="flex-1 font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-foreground">
            Keyboard shortcuts
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="shrink-0 border border-foreground/15 px-1.5 py-0.5 font-mono text-[10px] text-foreground/60 transition-colors hover:border-primary hover:text-primary-ink"
          >
            ESC
          </button>
        </div>

        <div className="grid gap-6 p-5">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h3 className="mb-3 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/60">
                {group.title}
              </h3>
              <ul className="grid gap-1">
                {group.items.map((item) => (
                  <li key={item.label} className="flex items-center gap-4 px-2 py-1.5">
                    <span className="flex min-w-[110px] shrink-0 gap-1.5">
                      {item.keys.map((key) => (
                        <kbd
                          key={key}
                          className="border border-foreground/15 bg-foreground/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-accent"
                        >
                          {key}
                        </kbd>
                      ))}
                    </span>
                    <span className="text-sm text-foreground/70">{item.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
