"use client";

/*
 * useFocusTrap — keeps Tab / Shift+Tab inside an open dialog (the mobile
 * menu, the command palette, the terminal, the shortcuts sheet), using the
 * focus-trap library. `containers` may be several elements (the mobile menu
 * is the nav bar's close button plus the menu panel).
 *
 * The dialogs move focus in, close on Escape and hand focus back
 * themselves, so the trap only does the trapping.
 */

import { useEffect, type RefObject } from "react";
import { createFocusTrap } from "focus-trap";

export function useFocusTrap(containers: RefObject<HTMLElement | null>[], active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const els = containers.map((r) => r.current).filter((c): c is HTMLElement => !!c);
    if (!els.length) return;
    const trap = createFocusTrap(els, {
      initialFocus: false,
      fallbackFocus: els[0],
      escapeDeactivates: false,
      allowOutsideClick: true,
      returnFocusOnDeactivate: false,
      preventScroll: true,
    });
    try {
      trap.activate();
    } catch {
      /* nothing focusable yet: the dialog still works, just untrapped */
    }
    return () => {
      trap.deactivate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable
  }, [active]);
}
