"use client";

/*
 * CommandPaletteMount.tsx
 * Author: Ahmed Emad Nasr
 *
 * The single host for every layer that opens over the site: the command
 * palette, the shortcuts sheet, and the terminal.
 *
 * Why put them in one component? So there is one keyboard listener on the
 * window instead of three competing for the same keys. And every heavy part
 * is dynamic — the page ships zero bytes for them until the user actually
 * asks for one.
 *
 * Shortcuts:
 *   Ctrl/⌘ + K   the palette
 *   /            the palette (when not typing in a field)
 *   ?            the shortcuts sheet
 *   g then h/e/p/c/b/t   quick navigation
 *   type "3omda" anywhere → the terminal
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isTypingTarget, scrollToElement, scrollToTop } from "@/app/core/utils/scroll";
import styles from "./CommandPalette.module.css";

const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });
const ShortcutsHelp = dynamic(() => import("./ShortcutsHelp"), { ssr: false });
const Terminal = dynamic(() => import("./Terminal"), { ssr: false });

type Overlay = "palette" | "shortcuts" | "terminal" | null;

/** Ignore shortcuts while the user is typing in a field */
/* isTypingTarget اتنقل لـ core/utils/scroll — KeyboardScroll محتاجه
   بنفس الشروط بالظبط، ونسختين من "هل المستخدم بيكتب دلوقتي؟" هي
   بالظبط نوع التكرار اللي بيفضل يتباعد لحد ما يختلفوا. */
/** g + this letter → this section */
const GO_TO_SECTION: Record<string, string> = {
  h: "Home",
  e: "Experience",
  p: "Projects",
  c: "Certifications",
};

const SECRET = "3omda";

export default function CommandPaletteMount() {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const router = useRouter();
  const pathname = usePathname();

  // refs, not state: these change on every keypress and nobody needs a
// re-render because of them
  const pendingG = useRef(false);
  const gTimer = useRef<number | undefined>(undefined);
  const secretBuffer = useRef("");

  const close = useCallback(() => setOverlay(null), []);

  const goToSection = useCallback(
    (id: string) => {
      // These sections do not exist on the blog, so go to the home page first
      if (pathname !== "/") {
        router.push(`/#${id}`);
        return;
      }

      const target = document.getElementById(id);
      if (!target) return;

      scrollToElement(target);
    },
    [pathname, router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Ctrl+K works even while typing — that is the convention everywhere
      if ((e.ctrlKey || e.metaKey) && key === "k") {
        e.preventDefault();
        setOverlay((current) => (current === "palette" ? null : "palette"));
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      // ── The secret word ────────────────────────────────────────────────
      if (key.length === 1) {
        secretBuffer.current = (secretBuffer.current + key).slice(-SECRET.length);
        if (secretBuffer.current === SECRET) {
          secretBuffer.current = "";
          e.preventDefault();
          setOverlay("terminal");
          return;
        }
      }

      // ── g + letter sequence ────────────────────────────────────────────
      if (pendingG.current) {
        pendingG.current = false;
        window.clearTimeout(gTimer.current);

        if (key === "t") {
          e.preventDefault();
          scrollToTop();
          return;
        }
        if (key === "b") {
          e.preventDefault();
          router.push(pathname.startsWith("/blog") ? "/" : "/blog");
          return;
        }
        if (GO_TO_SECTION[key]) {
          e.preventDefault();
          goToSection(GO_TO_SECTION[key]);
          return;
        }
        // Any other key: let it through normally
      }

      if (key === "g") {
        pendingG.current = true;
        // One second is enough: after that the g is an old keypress, not the
// start of a sequence
        window.clearTimeout(gTimer.current);
        gTimer.current = window.setTimeout(() => {
          pendingG.current = false;
        }, 1000);
        return;
      }

      if (key === "/") {
        e.preventDefault();
        setOverlay("palette");
        return;
      }

      if (key === "?") {
        e.preventDefault();
        setOverlay((current) => (current === "shortcuts" ? null : "shortcuts"));
      }
    };

    // The palette opens the terminal or the shortcuts sheet through these
// events — cleaner than
    // passing callbacks into a lazy component
    const openTerminal = () => setOverlay("terminal");
    const openShortcuts = () => setOverlay("shortcuts");

    window.addEventListener("keydown", onKey);
    window.addEventListener("sensei:open-terminal", openTerminal);
    window.addEventListener("sensei:open-shortcuts", openShortcuts);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("sensei:open-terminal", openTerminal);
      window.removeEventListener("sensei:open-shortcuts", openShortcuts);
      window.clearTimeout(gTimer.current);
    };
  }, [goToSection, pathname, router]);

  return (
    <>
      {/* This button is the only way to open the palette on mobile, and on
          desktop it tells people the shortcut exists at all. */}
      {overlay === null && (
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setOverlay("palette")}
          aria-label="Open command palette"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <span className={styles.triggerHint} aria-hidden="true">
            CTRL K
          </span>
        </button>
      )}

      {overlay === "palette" && <CommandPalette onClose={close} />}
      {overlay === "shortcuts" && <ShortcutsHelp onClose={close} />}
      {overlay === "terminal" && <Terminal onClose={close} />}
    </>
  );
}
