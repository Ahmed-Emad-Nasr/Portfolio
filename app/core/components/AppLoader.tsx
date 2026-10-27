"use client";

import { useEffect, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";

const BOOT_WORDS = ["起動中", "武士道", "鍛錬", "技術調整", "出陣"];
/* When each word takes over: the counter passes 20 / 40 / 60 / 80 % on the
   ease-out-cubic fill (t = 1 − ∛(1 − p)) of 1.9 s */
const WORD_AT = [0, 0.136, 0.299, 0.5, 0.788];

/**
 * Minimal boot screen: monogram, cycling kanji, hairline progress.
 * Click anywhere to skip. Respects reduced-motion (short + static).
 *
 * Sensei-Dev's timing: the bar fills in 1.9 s, holds 0.2 s, and the screen
 * slides up in 0.5 s. All of it — the fill, the 000 → 100 % counter, the
 * kanji and the slide — is CSS (globals.css), counted from the first paint,
 * so it plays the same on a slow phone as on a laptop instead of waiting
 * for the JavaScript. The script only remembers the visit, handles the
 * click-to-skip, and removes the screen once it has left.
 *
 * Plays once per tab: after the first run a sessionStorage flag is set, and
 * the inline script in layout.tsx marks <html class="booted"> before first
 * paint on the next page load, which hides the screen (globals.css) — so
 * opening a case page or the CV doesn't replay the intro.
 */
const BOOTED_KEY = "sensei-booted";
export default function AppLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (document.documentElement.classList.contains("booted")) {
      setLoading(false);
      return;
    }
    try {
      sessionStorage.setItem(BOOTED_KEY, "1");
    } catch {
      /* storage blocked: the intro simply plays every time */
    }
    /* Safety: never trap the user (the CSS slide normally ends at 2.6 s) */
    const fallback = setTimeout(() => setLoading(false), 3500);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          data-app-loader
          className="fixed inset-0 z-[9999] flex cursor-pointer flex-col items-center justify-center bg-background"
          onClick={() => setLoading(false)}
          onAnimationEnd={(e) => {
            if (e.animationName === "app-loader-out") setLoading(false);
          }}
          title="Skip intro"
          role="status"
          aria-label="Loading portfolio"
        >
          <span className="app-loader-words brush-jp text-5xl text-foreground/80" lang="ja" aria-hidden="true">
            {BOOT_WORDS.map((w, i) => (
              <span
                key={w}
                style={{
                  ["--in" as string]: `${WORD_AT[i]}s`,
                  ["--out" as string]: i < WORD_AT.length - 1 ? `${WORD_AT[i + 1]}s` : "99s",
                }}
              >
                {w}
              </span>
            ))}
          </span>

          {/* Not an <h1>: the loader is in the server HTML, so crawlers and
              screen readers met "Ahmed." as the page's first heading. */}
          <p className="mt-4 font-display text-xl font-black uppercase tracking-tighter text-foreground">
            Ahmed<span className="text-primary-ink">.</span>
          </p>
          <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.45em] text-foreground/60">
            Portfolio
          </p>

          <div className="mt-10 w-56 md:w-72">
            <div className="h-px w-full bg-foreground/10" aria-hidden="true">
              <div className="app-loader-fill h-px bg-primary" />
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[0.625rem] tracking-[0.3em] text-foreground/60">
              <span>LOADING</span>
              <span aria-hidden="true" className="app-loader-count tabular-nums" />
            </div>
          </div>

          <span className="absolute bottom-6 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-foreground/60">
            tap anywhere to skip
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
