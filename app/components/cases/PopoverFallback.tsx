"use client";

/*
 * PopoverFallback — the ATT&CK evidence popovers use the native [popover]
 * attribute (no JavaScript of their own). Safari before 17 and Firefox before
 * 125 do not know it: the attribute is ignored, and every popover would be
 * on screen at once. There, globals.css keeps them hidden from the first
 * paint (@supports not selector(:popover-open)), and this script opens and
 * closes them: the trigger button, Esc, a click outside, focus moved in and
 * back. Browsers with popover support return immediately.
 */

import { useEffect } from "react";

export default function PopoverFallback() {
  useEffect(() => {
    if ("popover" in HTMLElement.prototype) return;
    let open: HTMLElement | null = null;
    let invoker: HTMLElement | null = null;

    const close = () => {
      if (!open) return;
      open.removeAttribute("data-open");
      open = null;
      invoker?.focus();
      invoker = null;
    };
    const show = (pop: HTMLElement, from: HTMLElement) => {
      close();
      pop.setAttribute("data-open", "");
      open = pop;
      invoker = from;
      pop.querySelector<HTMLElement>("a[href], button")?.focus();
    };
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[popovertarget]");
      if (btn) {
        const pop = document.getElementById(btn.getAttribute("popovertarget") || "");
        if (!pop) return;
        e.preventDefault();
        const action = btn.getAttribute("popovertargetaction") || "toggle";
        if (action === "hide" || (action === "toggle" && open === pop)) close();
        else show(pop, btn);
        return;
      }
      if (open && !open.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}
