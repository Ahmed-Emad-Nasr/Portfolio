"use client";

/*
 * HashNav — mounted once on each long page (home, blog). Takes over
 * in-page #links and arrivals with a hash, so every jump goes through core/perf/jump.ts
 * (lazy sections mounted, heights known, then an instant jump).
 */

import { useEffect } from "react";
import { revealAll } from "./reveal";
import { scrollToHash } from "./jump";
import { LIBRARY_PARAMS } from "@/app/core/config/routes";

const isLibraryParam = (k: string) => (LIBRARY_PARAMS as readonly string[]).includes(k);

export default function HashNav() {
  useEffect(() => {
    /* Arriving with an anchor (/#cases, /#case-…) or a filtered library
       link (/?q=wazuh#cases): mount everything, then go there. */
    const params = new URLSearchParams(window.location.search);
    const filtered = LIBRARY_PARAMS.some((k) => params.has(k));
    if (window.location.hash.length > 1) {
      const hash = window.location.hash;
      revealAll().then(() => {
        /* The library scrolls itself to a filtered view or a #case-… card
           (it first has to open the page of cards the case is on) */
        if (!filtered && !hash.startsWith("#case-")) scrollToHash(hash);
      });
    } else if (filtered) {
      revealAll();
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;

      /* A filtered library link (/?kind=investigation#cases): no reload —
         put the filter in the URL and tell the library, as the back button does */
      if (url.search !== window.location.search) {
        if (![...url.searchParams.keys()].every(isLibraryParam)) return;
        e.preventDefault();
        history.pushState(null, "", `${url.search}${url.hash}`);
        revealAll().then(() => {
          window.dispatchEvent(new PopStateEvent("popstate"));
          scrollToHash(url.hash);
        });
        return;
      }

      const id = decodeURIComponent(url.hash.slice(1));
      if (!id) return;
      e.preventDefault();
      if (url.hash !== window.location.hash) history.pushState(null, "", url.hash);
      scrollToHash(url.hash).then(() => {
        /* Keyboard and screen-reader users continue from the target, as
           with a native anchor (the skip link relies on this) */
        const el = document.getElementById(id);
        if (!el) return;
        if (!el.matches("a[href], button, input, select, textarea, [tabindex]")) el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
      });
    };
    /* Bubble phase: links that handle their own click (CaseFilterLink,
       next/link) have called preventDefault by now and are left alone */
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
