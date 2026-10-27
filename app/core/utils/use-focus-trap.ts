"use client";

/*
 * useFocusTrap — keeps Tab / Shift+Tab inside an open dialog (the mobile
 * menu, the command palette, the terminal, the shortcuts sheet). They are
 * marked aria-modal, but Tab used to walk straight out of them into the page
 * underneath, which a keyboard user cannot see while the dialog covers it.
 *
 * `containers` may be several elements (the mobile menu is the nav bar's
 * close button plus the menu panel); focus cycles through all of them in
 * document order.
 */

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), summary';

export function useFocusTrap(containers: RefObject<HTMLElement | null>[], active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = containers
        .map((r) => r.current)
        .filter((c): c is HTMLElement => !!c)
        .flatMap((c) => [...c.querySelectorAll<HTMLElement>(FOCUSABLE)])
        .filter((el) => el.offsetParent !== null || el.getClientRects().length > 0)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      const current = document.activeElement as HTMLElement | null;
      const inside = current && els.includes(current);
      if (e.shiftKey && (current === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable
  }, [active]);
}
