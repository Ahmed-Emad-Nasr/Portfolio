"use client";

/*
 * LazySection — a section whose code AND data load only when the reader
 * gets near it.
 *
 * The heavy, interactive sections (case library, ATT&CK matrix, detection
 * rules, triage challenge, gallery, contributions) are not in the server
 * HTML at all. Until the reader is ~1.5 screens away, each one is an empty
 * placeholder that keeps the section's id (so #cases still has a target)
 * and roughly its height (so the scrollbar does not jump). Then its chunk is
 * fetched with a dynamic import() and the section renders.
 *
 * Jumps are the one catch: a link to #art from the top of the page would
 * land on a placeholder, and every placeholder above it would grow while
 * the page scrolls. So any in-page jump (nav, palette, g-shortcuts, a link
 * with #…, or arriving with a hash in the URL) first mounts every lazy
 * section, waits for them to render, and only then jumps — instantly, like
 * a plain anchor, with no smooth glide.
 */

import { Component, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { scrollTargetOf, scrollToElement } from "@/app/core/utils/scroll";

/* ── One switch for the whole page: "mount everything now" ── */
let revealed = false;
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
const getRevealed = () => revealed;
const getServerRevealed = () => false;

const PENDING = "[data-lazy-pending]";
const hasPending = () => typeof document !== "undefined" && !!document.querySelector(PENDING);

/** Mount every lazy section and resolve once none is still loading (max 4s). */
export function revealAll(): Promise<void> {
  if (!revealed) {
    revealed = true;
    listeners.forEach((l) => l());
  }
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = () => {
      if (!hasPending() || performance.now() - start > 4000) {
        /* one more frame: the sections have rendered, let layout settle */
        requestAnimationFrame(() => resolve());
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/*
 * Sections off screen use content-visibility: auto, and until one has been
 * rendered its height is a 1200px guess — so a jump far down the page aims
 * at a position worked out from guesses. Before the first jump, every
 * deferred section renders for one frame (html[data-cv-measure], see
 * globals.css) and the browser keeps their real heights from then on.
 */
let measured = false;
async function measureDeferred(): Promise<void> {
  if (measured) return;
  measured = true;
  const root = document.documentElement;
  root.setAttribute("data-cv-measure", "");
  await nextFrame();
  await nextFrame();
  root.removeAttribute("data-cv-measure");
}

/** Scroll to an in-page anchor, mounting the lazy sections first when needed. */
export async function scrollToHash(hash: string): Promise<void> {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return;
  /* Only placeholders ABOVE the target can move it: a jump to #services
     does not need to download the case library first */
  const before = document.getElementById(id);
  const pendingAbove =
    !before ||
    before.matches(PENDING) ||
    [...document.querySelectorAll(PENDING)].some((p) => p.compareDocumentPosition(before) & Node.DOCUMENT_POSITION_FOLLOWING);
  if (pendingAbove) await revealAll();
  await measureDeferred();
  const el = document.getElementById(id);
  if (!el) return;
  /* Straight to the section, no smooth glide (a section jump is navigation) */
  scrollToElement(el, { immediate: true });
  void settle(id);
}

/* Late images or fonts above the target can still move it a little right
   after the jump: put it back under the header — unless the reader took
   over the wheel, the keys or the screen meanwhile. A newer jump cancels
   the older one's check. */
let jumpSeq = 0;
async function settle(id: string): Promise<void> {
  const seq = ++jumpSeq;
  let touched = false;
  const take = () => {
    touched = true;
  };
  const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  events.forEach((t) => window.addEventListener(t, take, { passive: true, once: true }));
  const start = performance.now();
  let last = window.scrollY;
  let still = 0;
  let nudges = 0;
  /* Up to 6s and 3 nudges: images above the target that finish loading
     after the first stop can move it again */
  while (performance.now() - start < 6000 && nudges < 3) {
    await nextFrame();
    if (touched || seq !== jumpSeq) break;
    still = window.scrollY === last ? still + 1 : 0;
    last = window.scrollY;
    if (still < 12) continue;
    const now = document.getElementById(id);
    if (!now) break;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (Math.abs(window.scrollY - Math.min(scrollTargetOf(now), max)) > 6) {
      scrollToElement(now, { immediate: true });
      nudges++;
      still = 0;
    }
  }
  events.forEach((t) => window.removeEventListener(t, take));
}

/** Fired on window each time a placeholder gives way to its section */
export const LAZY_MOUNTED = "sensei:lazy-mounted";

/** The placeholder, also used as the dynamic() loading state. */
export function LazyPlaceholder({ id, minHeight = "100svh" }: { id?: string; minHeight?: string }) {
  /* Unmounting = the section (or its loading state) has replaced it */
  useEffect(() => () => void window.dispatchEvent(new Event(LAZY_MOUNTED)), []);
  return <div id={id} data-lazy-pending="" aria-hidden="true" style={{ minHeight }} className="bg-background" />;
}

/*
 * A chunk that fails to download (offline before the section was ever
 * opened, or a deploy removed the old file) must not take the whole page
 * down with it: without this boundary the error reaches app/error.tsx and
 * the reader loses every other section. Here it costs one section, with a
 * way to try again.
 */
class LazyBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[lazy] a section failed to load:", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="status" className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center bg-background">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground/60">This section could not load — check the connection.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="border border-foreground/15 px-4 py-3 font-mono text-[0.625rem] font-bold uppercase tracking-[0.25em] text-foreground/70 transition-colors hover:border-primary hover:text-primary-ink"
        >
          Try again
        </button>
      </div>
    );
  }
}

export default function LazySection({
  id,
  minHeight,
  children,
}: {
  /** The section's own id — kept on the placeholder so links to it work */
  id?: string;
  /** About how tall the section is, to keep the scrollbar steady */
  minHeight?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const all = useSyncExternalStore(subscribe, getRevealed, getServerRevealed);

  useEffect(() => {
    if (near || all) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "150% 0px 150% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, all]);

  if (near || all) return <LazyBoundary>{children}</LazyBoundary>;
  return (
    <div ref={ref}>
      <LazyPlaceholder id={id} minHeight={minHeight} />
    </div>
  );
}

/*
 * LazyHashNav — mounted once on the page. Takes over in-page #links and
 * arrivals with a hash, so every jump mounts the lazy sections first.
 */
const LIBRARY_PARAMS = ["q", "cat", "tools", "kind", "sort", "view"];

export function LazyHashNav() {
  useEffect(() => {
    /* Arriving with an anchor (/#cases, /#case-…) or a filtered library
       link (/?q=wazuh#cases): mount everything, then go there. */
    const params = new URLSearchParams(window.location.search);
    if (window.location.hash.length > 1) {
      const hash = window.location.hash;
      revealAll().then(() => {
        /* The library scrolls itself to a filtered view or a #case-… card
           (it first has to open the page of cards the case is on) */
        if (!LIBRARY_PARAMS.some((k) => params.has(k)) && !hash.startsWith("#case-")) scrollToHash(hash);
      });
    } else if (LIBRARY_PARAMS.some((k) => params.has(k))) {
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
        if (![...url.searchParams.keys()].every((k) => LIBRARY_PARAMS.includes(k))) return;
        e.preventDefault();
        history.pushState(null, "", `${url.search}${url.hash}`);
        revealAll().then(() => {
          window.dispatchEvent(new PopStateEvent("popstate"));
          scrollToHash(url.hash);
        });
        return;
      }

      /* Every in-page jump takes the same path: lazy sections mounted, heights
         measured, then an instant jump (the browser's own anchor jump would
         use the guessed heights and land in the wrong place) */
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
