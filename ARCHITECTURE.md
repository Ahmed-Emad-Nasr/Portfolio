# Architecture

A static Next.js 16 export (`output: "export"`) served by GitHub Pages under
`/Portfolio`. Three primary pages (`/`, `/blog` and `/gallery`) plus one
static page per case.
Everything is built at build time; there is no server.

## Folders

| Folder | Rule |
|---|---|
| `app/` | Routes only. Pages are Server Components that read `data/` and pass finished values down. |
| `components/layout/` | Mounted on every page (from `app/layout.tsx` or `PageShell`). |
| `components/ui/` | Small shared building blocks; `kit.tsx` holds the shared class strings. |
| `components/home/`, `components/blog/`, `components/gallery/` | One file per section. Home and blog have a `dynamic.tsx`; the gallery is a page-owned interactive surface. |
| `data/` | Content only. `cases.ts`, `case-details.ts` and `attack.ts` are large — keep them out of client components (see below). |
| `lib/` | Helpers with no UI: URLs (`site.ts`), JSON-LD (`seo.ts`), paths and case kinds (`shared.ts`), section → page routing (`routes.ts`), scrolling (`scroll.ts`). |
| `lib/perf/` | Everything that decides *when* work happens. |

## Server and client

Server Components ship no JavaScript, so pages and text sections stay on the
server. A client component pulls everything it imports into the browser, so:

- client components never import `data/cases.ts`, `data/case-details.ts` or
  `data/attack.ts` — the page computes what they need (`data/live-copy.ts`,
  `lib/library-data.ts`) and passes it as props, or the section's own chunk
  imports the precomputed result;
- `data/portfolio-data.ts` is read by client sections, so it must stay free
  of those imports too.

## How a page loads

1. **In the HTML:** the hero and every text section (search engines and
   no-JS readers see them).
2. **Split per section:** sections with client behavior, heavy visual
   dependencies, or below-the-fold content are `next/dynamic` imports in
   `components/home/dynamic.tsx` and `components/blog/dynamic.tsx`.
   The dynamic imports keep server-rendered HTML while separating the client
   code into route chunks.
   Global visual effects that are not needed for first paint are deferred by
   `components/layout/DeferredGlobalEffects.tsx` until the browser is idle.
   (`next/dynamic` only code-splits when called from a Client Component,
   which is why those files exist.)
3. **Lazy:** the contributions graph (home), ATT&CK coverage, detection library
   and triage quiz (blog) are mounted by `LazySection` when they approach the
   viewport. The gallery is isolated on `/gallery`, so its client chunk and
   image grid are not loaded by the home page at all.
4. **Deferred rendering:** sections below the fold carry `DEFER`
   (`content-visibility: auto`). `lib/perf/PageEffects.tsx` renders each one
   once in idle time so its real height is known before anyone scrolls there.
5. **Idle queue:** all background work goes through `whenIdle()` in
   `lib/perf/schedule.ts` — one task at a time, only after load, in idle time,
   and never while the reader is scrolling.
6. **Off-screen animations pause:** `lib/perf/OffscreenAnimations.tsx` tags
   infinite CSS loops when they start and pauses them (via `data-offscreen`)
   while their section is off screen; framer-motion loops are paused through
   the Animation API.

Links to other pages use `PageLink`, which prefetches on hover/focus/touch
instead of on sight.

## Jumps

Every in-page jump (nav, palette, `g` shortcuts, `#hash` arrivals, filtered
library links) goes through `scrollToHash()` in `lib/perf/jump.ts`: mount the
lazy sections above the target, measure deferred sections above it, then jump
**instantly** under the fixed header. For a few seconds after, it corrects
the position if late images move the target — unless the reader has
scrolled. `lib/routes.ts` knows which page each section id lives on.

## Motion

- Wheel scrolling: Lenis (`components/layout/SmoothScroll.tsx`); touch and
  reduced motion stay native.
- Entrances: `components/ui/FadeIn.tsx` (framer-motion, opacity + transform
  only, staggered top to bottom). framer-motion loads lazily
  (`LazyMotion` + `m`).
- Hero entrance: GSAP, imported on demand.
- Section dividers drift with a CSS scroll timeline (framer fallback).
- Reduced motion is respected everywhere (`MotionConfig reducedMotion="user"`
  and the CSS rules at the end of `globals.css`).

## Fonts

`app/fonts.ts` loads Dela Gothic One, Outfit, JetBrains Mono, Noto Sans JP and
Yuji Syuku through `next/font/google` (self-hosted at build time, with
size-matched fallbacks). `app/fonts-yuji-site.css` adds a tiny Yuji Syuku cut
of exactly the characters the site uses, placed first in the Japanese stacks
so the brush text costs one small file. Regenerate it with
`scripts/subset-yuji-site.py` when new Japanese text is added.

## Offline

`public/sw.js` caches what the visitor has already loaded: pages
network-first, hashed build files cache-first, images
stale-while-revalidate, all bounded. Registered after load, production only.

## Security

A Content-Security-Policy `<meta>` (`lib/security.ts`; GitHub Pages cannot
send headers), strict referrer policy, no third-party scripts, and YouTube embeds load only after a click.

## Measurements

Headless Chrome, production build, scrolling the whole page (worst frame /
long-animation-frame total / layout shift):

| | Desktop | Desktop, 4× CPU | Phone, 4× CPU |
|---|---|---|---|
| One-page site (before) | 145 ms / 428 ms / 1.093 | 759 ms worst | — |
| Home (now) | 66 ms / 131 ms / 0.001 | 252 ms worst | 54 ms worst |

Checks that pass on every change: `npm run lint`, `type-check`, `check:data`,
`check:links`, `check:a11y` (0 violations) and `check:layout` (0 findings).
