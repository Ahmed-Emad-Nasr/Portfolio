"use client";

/*
 * KeyboardShortcuts.tsx
 * Author: Ahmed Emad Nasr
 *
 * The keyboard layer on top of the command palette (which owns Ctrl/⌘+K):
 *
 *   /        open the palette
 *   ?        the shortcuts sheet
 *   g + h/w/e/c/b/t   jump to a section, the case library, or the top
 *   3omda    the hidden terminal
 *
 * Both overlays are lazy — none of their code loads until first use.
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isTypingTarget, scrollToElement, scrollToTop } from "@/app/core/utils/scroll";

const ShortcutsHelp = dynamic(() => import("./ShortcutsHelp"), { ssr: false });
const Terminal = dynamic(() => import("./Terminal"), { ssr: false });

type Overlay = "shortcuts" | "terminal" | null;

const GO_TO_SECTION: Record<string, string> = {
  h: "home",
  w: "work",
  e: "experience",
  c: "certificates",
  a: "attack",
  l: "teaching",
  p: "platforms",
};

const SECRET = "3omda";

export default function KeyboardShortcuts() {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const router = useRouter();
  const pathname = usePathname() || "/";

  const pendingG = useRef(false);
  const gTimer = useRef<number | undefined>(undefined);
  const secretBuffer = useRef("");

  const close = useCallback(() => setOverlay(null), []);

  const goToSection = useCallback(
    (id: string) => {
      if (pathname !== "/") {
        router.push(`/#${id}`);
        return;
      }
      scrollToElement(document.getElementById(id));
    },
    [pathname, router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      const key = e.key.toLowerCase();

      if (key.length === 1) {
        secretBuffer.current = (secretBuffer.current + key).slice(-SECRET.length);
        if (secretBuffer.current === SECRET) {
          secretBuffer.current = "";
          e.preventDefault();
          setOverlay("terminal");
          return;
        }
      }

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
          goToSection("cases");
          return;
        }
        if (GO_TO_SECTION[key]) {
          e.preventDefault();
          goToSection(GO_TO_SECTION[key]);
          return;
        }
      }

      if (key === "g") {
        pendingG.current = true;
        window.clearTimeout(gTimer.current);
        gTimer.current = window.setTimeout(() => {
          pendingG.current = false;
        }, 1000);
        return;
      }

      if (key === "/") {
        e.preventDefault();
        window.dispatchEvent(new Event("sensei:palette"));
        return;
      }

      if (key === "?") {
        e.preventDefault();
        setOverlay((current) => (current === "shortcuts" ? null : "shortcuts"));
      }
    };

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
      {overlay === "shortcuts" && <ShortcutsHelp onClose={close} />}
      {overlay === "terminal" && <Terminal onClose={close} />}
    </>
  );
}
