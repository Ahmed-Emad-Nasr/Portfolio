"use client";

/*
 * PageEffects — mounted once on each long page (home, blog). Renders
 * nothing; it does two jobs:
 *
 *   1. Jumps. Takes over in-page #links, filtered-library links and
 *      arrivals with a hash, so every jump goes through lib/perf/jump.ts
 *      (lazy sections mounted, heights known, then an instant jump).
 *
 *   2. Pre-rendering. Sections below the fold carry content-visibility:
 *      auto (.cv-defer): the browser skips their style, layout and paint
 *      until they near the screen. The first time each one did, all that
 *      work landed in a frame while the reader was scrolling — and until
 *      then its height was a guess. So, in idle time and while nobody
 *      scrolls (lib/perf/schedule.ts), each deferred section renders once,
 *      off screen; the browser keeps its real height. Sections already
 *      above the screen are left alone, so nothing moves under the reader.
 */

import { useEffect } from "react";
import { LAZY_MOUNTED, measureDeferred, revealAll, whenIdle } from "@/lib/perf/schedule";
import { scrollToHash } from "@/lib/perf/jump";
import { LIBRARY_PARAMS } from "@/lib/routes";

const isLibraryParam = (k: string) => (LIBRARY_PARAMS as readonly string[]).includes(k);

/* ── 1. Jumps ── */
function useHashJumps() {
  useEffect(() => {
    /* Arriving with an anchor (/#about, /blog#case-…) or a filtered library
       link (/blog?q=wazuh#cases): mount everything, then go there. */
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

      /* A filtered library link (?kind=investigation#cases): no reload —
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
}

/* ── 2. Pre-rendering ── */
function usePrerender() {
  useEffect(() => {
    const queued = new WeakSet<Element>();
    const queueAll = () => {
      document.querySelectorAll(".cv-defer:not([data-cv-measured])").forEach((el) => {
        if (queued.has(el)) return;
        queued.add(el);
        whenIdle(() => {
          if (!el.isConnected) return;
          /* Never above the screen: a section the reader is past changing
             height would move the page under them (a jump measures those
             itself, before it moves) */
          if (el.getBoundingClientRect().bottom <= 0) {
            queued.delete(el);
            return;
          }
          return measureDeferred([el]);
        });
      });
    };
    queueAll();
    window.addEventListener(LAZY_MOUNTED, queueAll);
    return () => window.removeEventListener(LAZY_MOUNTED, queueAll);
  }, []);
}

export default function PageEffects() {
  useHashJumps();
  usePrerender();
  return null;
}
