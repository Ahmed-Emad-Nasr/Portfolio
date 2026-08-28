"use client";

/*
 * CommandPaletteMount.tsx
 * Author: Ahmed Emad Nasr
 *
 * المضيف الوحيد لكل الطبقات اللي بتفتح فوق الموقع: الـ command palette،
 * ورقة الاختصارات، والترمينال.
 *
 * ليه كلهم في مكوّن واحد؟ عشان يبقى فيه listener واحد للكيبورد على الـ window
 * بدل تلاتة يتزاحموا على نفس الأزرار. وكل الأجزاء التقيلة dynamic — يعني
 * الصفحة بتحمّل بيهم صفر بايت لحد ما المستخدم يطلب واحد فعلاً.
 *
 * الاختصارات:
 *   Ctrl/⌘ + K   الـ palette
 *   /            الـ palette (لو مش بتكتب في خانة)
 *   ?            ورقة الاختصارات
 *   g ثم h/e/p/c/b/t   تنقّل سريع
 *   تكتب "3omda" في أي حتة → الترمينال
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./CommandPalette.module.css";

const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });
const ShortcutsHelp = dynamic(() => import("./ShortcutsHelp"), { ssr: false });
const Terminal = dynamic(() => import("./Terminal"), { ssr: false });

type Overlay = "palette" | "shortcuts" | "terminal" | null;

/** بنتجاهل الاختصارات لو المستخدم بيكتب في خانة */
const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
};

/** g + الحرف ده → القسم ده */
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

  // refs مش state: دول بيتغيّروا مع كل ضغطة زرار ومحدش محتاج re-render بسببهم
  const pendingG = useRef(false);
  const gTimer = useRef<number | undefined>(undefined);
  const secretBuffer = useRef("");

  const close = useCallback(() => setOverlay(null), []);

  const goToSection = useCallback(
    (id: string) => {
      // على البلوج الأقسام دي مش موجودة، فبنروح للصفحة الرئيسية الأول
      if (pathname !== "/") {
        router.push(`/#${id}`);
        return;
      }

      const target = document.getElementById(id);
      if (!target) return;

      const header = document.querySelector<HTMLElement>("[data-site-header='true']");
      const offset = (header?.offsetHeight ?? 0) + 15;
      window.scrollTo({
        top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset),
        behavior: "smooth",
      });
    },
    [pathname, router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Ctrl+K شغال حتى وإنت بتكتب — ده المتعارف عليه في كل التطبيقات
      if ((e.ctrlKey || e.metaKey) && key === "k") {
        e.preventDefault();
        setOverlay((current) => (current === "palette" ? null : "palette"));
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      // ── الكلمة السرية ──────────────────────────────────────────────────
      if (key.length === 1) {
        secretBuffer.current = (secretBuffer.current + key).slice(-SECRET.length);
        if (secretBuffer.current === SECRET) {
          secretBuffer.current = "";
          e.preventDefault();
          setOverlay("terminal");
          return;
        }
      }

      // ── تسلسل g + حرف ──────────────────────────────────────────────────
      if (pendingG.current) {
        pendingG.current = false;
        window.clearTimeout(gTimer.current);

        if (key === "t") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
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
        // أي حرف تاني: نسيبه يعدّي عادي
      }

      if (key === "g") {
        pendingG.current = true;
        // ثانية واحدة كفاية: بعد كده الـ g بتبقى ضغطة قديمة مش بداية تسلسل
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

    // الـ palette بيفتح الترمينال أو الاختصارات عن طريق الأحداث دي — أنضف من
    // تمرير callbacks لجوّه مكوّن lazy
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
      {/* الزرار ده هو الطريقة الوحيدة لفتح الـ palette على الموبايل، وعلى
          الديسكتوب بيعرّف الناس إن الاختصار موجود أصلاً. */}
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
