"use client";

import { useEffect, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { prefersReducedMotion } from "@/app/core/theme/fx";

const BOOT_WORDS = ["起動中", "武士道", "鍛錬", "技術調整", "出陣"];

/**
 * Minimal boot screen: monogram, cycling kanji, hairline progress.
 * Click anywhere to skip. Respects reduced-motion (short + static).
 *
 * The screen leaves on its own: a CSS animation (globals.css) slides it out
 * at ~1.2 s whether or not the JavaScript has loaded. It used to wait for
 * hydration plus 1.9 s, so on a mid-range phone on 4G visitors stared at the
 * intro for 5–7 s before seeing anything. The script now only drives the
 * progress bar and the click-to-skip.
 *
 * Plays once per tab: after the first run a sessionStorage flag is set, and
 * the inline script in layout.tsx marks <html class="booted"> before first
 * paint on the next page load, which hides the screen (globals.css) — so
 * opening a case page or the CV doesn't replay the intro.
 */
const BOOTED_KEY = "sensei-booted";
export default function AppLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [reduced] = useState(
    () => typeof window !== "undefined" && prefersReducedMotion()
  );

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
    let raf = 0;
    let doneTimer: NodeJS.Timeout | undefined;
    const start = performance.now();
    const DURATION = reduced ? 300 : 1000;

    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / DURATION));
      setProgress(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        doneTimer = setTimeout(() => setLoading(false), 200);
      }
    };
    raf = requestAnimationFrame(tick);

    // Safety: never trap the user
    const fallback = setTimeout(() => setLoading(false), 2000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
      if (doneTimer) clearTimeout(doneTimer);
    };
  }, [reduced]);

  const word =
    BOOT_WORDS[
      Math.max(
        0,
        Math.min(BOOT_WORDS.length - 1, Math.floor((progress / 100) * BOOT_WORDS.length))
      )
    ] ?? "起動中";

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
          title="Skip intro"
          role="status"
          aria-label="Loading portfolio"
        >
          <motion.span
            key={word}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="brush-jp text-5xl text-foreground/80"
            lang="ja"
          >
            {word}
          </motion.span>

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
              <div
                className="h-px bg-primary transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[0.625rem] tracking-[0.3em] text-foreground/60">
              <span>LOADING</span>
              <span aria-hidden="true" className="tabular-nums">
                {String(progress).padStart(3, "0")}%
              </span>
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
