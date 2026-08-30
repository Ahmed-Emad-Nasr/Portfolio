# Architecture

A reference for how this site is built and why. Read this before changing
anything structural — most of the decisions below exist to solve a specific
problem, and several were mistakes that got fixed.

---

## 1. Stack and constraints

| | |
|---|---|
| Framework | Next.js, App Router |
| Language | TypeScript, React |
| Styling | CSS Modules + one global stylesheet |
| Animation | CSS transitions, one shared IntersectionObserver |
| Output | `output: "export"` — static HTML, no server |
| Hosting | GitHub Pages under `/Portfolio` |

**The static-export constraint drives most of the architecture.** There is no
server at runtime. Every decision below follows from that:

- No API routes, no server actions, no incremental regeneration
- `images.unoptimized` must be true, so `next/image` emits plain `<img>` tags
  with **no `srcset`** — the `sizes` prop is inert
- "Server Component" means "runs at build time." Its data never reaches the
  browser, which makes it a bundle-size tool, not just a rendering one
- Every path needs the `/Portfolio` base path (`normalizePublicHref` in
  `core/config/shared.ts` is the single place that handles this)

---

## 2. Directory layout

```
app/
├── layout.tsx            Root layout — fonts, metadata, JSON-LD, tier script
├── page.tsx              Home (Server Component) — renders server-only slots
├── page-client.tsx       Home shell (Client) — composes sections
├── error.tsx             Route error boundary
├── global-error.tsx      Layout error boundary (last resort)
├── not-found.tsx         404
├── globals.css           Tokens, reset, motion budget, card system
├── sitemap.ts            Generated at build
├── robots.ts             Generated at build
├── manifest.ts           Generated at build
├── feed.xml/             RSS route
│
├── components/           Page sections. One folder per section.
│   ├── header/           Site nav
│   ├── home/             Hero (contains the LCP image)
│   ├── experience/       Timeline
│   ├── projects/         Project cards
│   ├── art_gallery/      Certificate wall
│   ├── credentials/      Certs + skills + achievements (Server Component)
│   ├── attack/           MITRE ATT&CK matrix (Server Component)
│   ├── contact/          Formspree form
│   ├── loader/           Boot screen
│   ├── cursor-mount.tsx  Desktop-only custom cursor gate
│   ├── custom-cursor.tsx
│   └── smooth-scroll.tsx Lenis wrapper
│
├── core/                 Everything shared across sections
│   ├── components/       Reveal, SectionHeader, ScrollProgress, BackToTop,
│   │                     CommandPalette, Terminal, KanjiDivider, Spotlight
│   ├── config/           All content as typed data (see §4)
│   ├── hooks/            useDeviceTier
│   ├── icons/            Inline SVG path data + <Icon>
│   └── utils/            Formatting and shared helpers
│
├── blog/                 Case-report library
│   ├── page.tsx          Index (Server)
│   ├── page-client.tsx   Index shell (Client)
│   ├── [slug]/           Case detail — generateStaticParams
│   ├── blog_header/      Nav (imports the main header's CSS module)
│   ├── components/       Blog-only sections
│   └── BlogCard.tsx
│
└── cv/                   CV page

scripts/
├── css-audit.mjs           Dead classes, dead tokens, duplicate files,
│                           expensive properties. Zero dependencies.
└── generate-hero-sizes.mjs Responsive variants of the LCP image (see §8)
```

**Rule:** anything used by more than one section lives in `core/`. Anything
used by exactly one section lives in that section's folder. There is no
`utils/` grab-bag at the top level.

---

## 3. The Server / Client boundary

This is the single most consequential thing in the codebase, and it is easy
to get wrong in a way that costs kilobytes without any visible symptom.

### The rule

`"use client"` is contagious upward through imports. **If a Client Component
imports a module, that module's entire contents ship to the browser** — even
if the component only renders it to static HTML at build time.

### What that cost here

Two components were marked `"use client"` with zero hooks, zero event
handlers, and zero browser API use. They were pure static rendering. But
they each imported large data files:

| Component | Imported | Shipped to every visitor |
|---|---|---|
| `attack/attack-matrix.tsx` | `cases.ts` | 46 KB |
| `credentials/credentials.tsx` | `certifications` + `skills` + `achievements` | 12 KB |

58 KB of JSON-shaped data downloaded by every visitor so the browser could
re-derive HTML that already existed in the exported page.

There is a comment in `core/config/skills.ts` describing a workaround where
case titles were hand-copied to avoid pulling `cases.ts` into the client
bundle. That workaround exists because of this bug. The real fix was to
remove `"use client"`.

### The slot pattern

A Server Component cannot be imported by a Client Component. But it **can be
passed to one as a prop**. That is how both are wired:

```tsx
// page.tsx — Server Component
import AttackMatrix from "./components/attack/attack-matrix";
import Credentials from "./components/credentials/credentials";

export default function Main() {
  return (
    <MainClient
      coverage={<AttackMatrix />}
      credentials={<Credentials />}
    />
  );
}
```

```tsx
// page-client.tsx — Client Component
type MainClientProps = { coverage: ReactNode; credentials: ReactNode };

function MainClient({ coverage, credentials }: MainClientProps) {
  return (
    <main>
      <ArtGallerySection credentials={credentials} />
      {coverage}
    </main>
  );
}
```

The JSX is created on the server, rendered to HTML at build time, and passed
down as an opaque `ReactNode`. The client tree never sees the imports.

### Before you add `"use client"`

Ask: does this component use `useState`, `useEffect`, a ref, an event
handler, or a browser API? If the answer is no, it does not need the
directive — and adding it may ship data you did not intend to.

---

## 4. Content as data

Everything in `core/config/` is typed data, not JSX:

```
cases.ts           38 case reports (the largest file, 46 KB)
attack.ts          MITRE ATT&CK tactic/technique map
certifications.ts  Certs with issuer, year, verification URL
skills.ts          Skill groups, each linked to the cases that prove it
achievements.ts    Awards and recognition
experience.ts      Timeline entries
projects.ts        Project metadata and bullet points
youtube.ts         Video and playlist metadata
start-here.ts      Curated entry points for the blog
cv.ts              CV structure
portfolio.ts       Section-level copy
site.ts            Absolute URLs, base path, trailing-slash policy
shared.ts          normalizePublicHref, date formatting, thumbnails
```

**Why data and not JSX:** it can be cross-referenced. `skills.ts` links each
skill group to the case reports that demonstrate it, which turns a list of
claims into a graph of evidence. It also feeds `sitemap.ts`, `feed.xml`, and
the JSON-LD structured data from one source.

### `site.ts` and the trailing-slash trap

`TRAILING_SLASH` in `site.ts` **must match** `trailingSlash` in
`next.config`. If they disagree, `sitemap.ts`, `og:url`, the JSON-LD `@id`,
and RSS links all advertise one URL shape while the site's canonical tag and
internal links use another. Google then sees two URLs for every page and
splits their ranking between them.

This has already been wrong once. The comment in `site.ts` documents it.

---

## 5. The device tier system

A three-level classification (`low` / `mid` / `high`) that gates every
expensive visual effect.

### How it is set

An inline script in `<head>` — `DEVICE_TIER_SCRIPT`, exported from
`core/hooks/useDeviceTier.ts` — runs **before first paint** and writes
`data-tier` on `<html>`.

```
prefers-reduced-motion, Save-Data, or 2G   → low
touch device with viewport ≤ 900px         → low   (all phones)
≤ 4 cores or ≤ 2 GB RAM                    → low
≤ 8 cores or ≤ 4 GB RAM, or touch          → mid
otherwise                                  → high
```

**Why it must be inline and blocking.** This used to be set from a
`useEffect`, which does not run until the bundle has downloaded, parsed, and
hydrated. The CSS budget keyed on `html[data-tier="low"]` was written
correctly, but it only took effect *after* the expensive window had already
passed. Phones paid the full cost of twenty animated elements, backdrop
filters, and smooth scrolling during exactly the seconds that LCP and TBT are
measured — and then the site turned them off.

`detectTier()` and `DEVICE_TIER_SCRIPT` are two implementations of the same
logic and **must be kept in sync**. Both are in the same file for that reason.

### What each tier turns off

| | low | mid | high |
|---|---|---|---|
| `[data-decorative="true"]` | `display: none` | shown | shown |
| `--card-blur` / `--ui-blur` | `0px` | `2px` | `4px` |
| Reveal animation | opacity only, 280ms | full | full |
| Card sheen | off | on | on |
| Smooth scroll (Lenis) | off | on | on |
| Custom cursor | never loaded | never loaded | on |
| Spotlight | never loaded | never loaded | on |

### The decorative contract

Any purely ornamental element carries `data-decorative="true"` in the JSX.
The CSS then removes it in one rule. This puts the "is this expendable?"
decision in the component, where the author has context, and leaves the CSS
to execute.

`display: none` is used rather than `animation: none` because the former
removes both the paint and the compositor layer; the latter leaves the layer
alive.

---

## 6. The card system

**All cards in the site are styled from one place:** section 14 of
`globals.css`. No CSS module contains card borders, backgrounds, radii,
padding, or hover behaviour.

### Usage

```tsx
<article data-fx="card">                      {/* default, 2.5rem padding */}
<article data-fx="card" data-card="compact">  {/* 1.8rem 2rem */}
<article data-fx="card" data-card="tight">    {/* 0.6rem — frames an image */}
```

The module file keeps only what is genuinely specific to that card's content:

```css
/* All appearance comes from html [data-fx="card"] in globals.css */
.single-project { display: flex; flex-direction: column; }
```

### What it looks like

Dark translucent surface, hairline border, rounded corners, and a red-to-gold
accent line across the top that draws in from the left on hover or keyboard
focus. On hover the card lifts 3px and the background darkens.

### Why it exists

There were five independent implementations, written at different times,
all trying to reach the same look with different values:

| | Border | Accent | Background | Padding |
|---|---|---|---|---|
| `.single-project` | `.05` | 2px **top**, transparent→red | `10,10,10,.6` | 2.5rem |
| `.content` | `.05` | 3px **left**, muted red | `10,10,10,.6` | 2.5rem |
| `.pdfCard` et al. | `.05` | 3px **left**, muted red | `10,10,10,.6` | 2.5rem |
| `.relatedCard`, `.card` | `.08` | 2px **left**, solid red | `255,255,255,.015` | 1.8rem |
| `.art_pic` | `.05` | none | `10,10,10,.6` | 0.6rem |

Adding a card meant copying whichever one you found first. Changing the look
meant finding all five.

### Two implementation details worth keeping

**The accent is a `::before` pseudo-element animated with `transform:
scaleX`, not `border-top-color`.** Transform is a compositor property and
costs nothing; changing a border colour triggers paint. It also lets the line
*draw in* rather than appear.

**The selector is `html [data-fx="card"]`, not `[data-fx="card"]`.** An
attribute selector alone has specificity `(0,1,0)` — identical to any class
in a CSS module. Which one wins would depend on stylesheet load order, which
Next does not guarantee. Prefixing `html` makes it `(0,1,1)` and it always
wins. The conflicting module declarations were removed as well; the
specificity bump is a safety net for cards added later.

### Adding a new card

Add `data-fx="card"` and a size variant. Do not write borders, backgrounds,
radii, padding, or hover rules. If you need a genuinely different surface,
add a variant to section 14 rather than a one-off rule in a module.

---

## 7. Animation

### `Reveal.tsx`

Elements fade and slide in as they enter the viewport. The API mirrors what
it replaced:

```tsx
<Reveal variant="up" delay={100}>…</Reveal>

<RevealGroup variant="scale" staggerMs={50}>
  {items.map(item => <Card key={item.id} {...item} />)}
</RevealGroup>
```

**How it works.** One IntersectionObserver, shared by the whole page, sets
`data-reveal="in"` on an element once. Everything else is a CSS transition.
JavaScript's total contribution is one attribute write per element.

The previous implementation used framer-motion's `whileInView`, which creates
an observer **per element** and subscribes each one to the animation engine.
The certificate gallery renders up to 50 items — 50 observers and 50 engine
subscriptions, all on the main thread during scroll. `RevealGroup` watches
only the container and staggers children through a `--i` custom property, so
that page now has one observer entry.

**Only `opacity` and `transform` are animated.** These are the only two
properties the browser can handle on the compositor without layout or paint.
This is why the animation is genuinely free on mobile — it is not an
aesthetic preference.

### The three-layer fallback

The initial `opacity: 0` is server-rendered. Without protection, a failed
bundle would leave the entire site invisible.

```css
/* 1. JavaScript fully disabled → html[data-tier] never appears,
      the hiding rule never matches, content renders normally */
html[data-tier] [data-reveal="pending"] { opacity: 0; }

/* 2. JavaScript on but the bundle failed → everything appears after 4s */
html[data-tier]:not([data-reveal-ready]) [data-reveal="pending"] {
  animation: revealSafety 1ms linear 4s forwards;
}
```

`Reveal` sets `data-reveal-ready` on `<html>` when it first mounts, which
makes rule 2 stop matching. In the normal case it never fires.

### Interaction effects

Cards, buttons (shine sweep), links (underline draw), tags, social icons, and
a press response on every interactive element. All `transform` and `opacity`.
Every hover effect has a `:focus-visible` or `:focus-within` equivalent —
without that the site is interactive for mouse users only.

The press response is the smallest piece and matters most on mobile, where
there is no hover at all:

```css
:where(a, button, [role="button"], summary):active:not(:disabled) {
  transform: scale(0.97);
}
```

### `Spotlight.tsx` — the one thing that costs

A cursor-following radial gradient over a card grid. **Not mounted
anywhere**; the CSS is in place if you want it.

This repaints the hovered card on every mouse-move frame. It is written as
cheaply as possible — one delegated listener, rAF-throttled, writing two
custom properties, `passive: true` — and it returns early on any touch device
and any tier below `high`. The only machines that pay the cost are the ones
that will not notice it.

---

## 8. Performance

### The critical path

1. `<head>` inline script classifies the device (~460 bytes, blocking, before
   paint)
2. CSS applies the correct motion budget from the first frame
3. Above-the-fold sections (`header`, `home`) are statically imported
4. Below-the-fold sections use `dynamic()` **without** `ssr: false` — the
   markup is still generated at build time and included in the export; only
   the JS chunk is deferred

### Fonts

Overlock (400/700/900) and JetBrains Mono (400/700). `next/font` preloads
every weight by default, which is five high-priority requests competing with
the LCP image. JetBrains Mono is set to `preload: false` — it appears in HUD
labels and the terminal, never in above-the-fold text that gets measured.

### `content-visibility`

Applied to `section` to skip off-screen layout and paint, with the hero
explicitly excluded:

```css
section:where(#Home) {
  content-visibility: visible;
  contain-intrinsic-size: none;
  contain: none;
}
```

Chrome does not report LCP for content inside a skipped subtree. The hero
holds the LCP image, so the global rule was actively suppressing the metric
it was meant to help.

### Known gap: the LCP image

**Not yet fixed.** With `images.unoptimized`, `next/image` emits a plain
`<img>` with no `srcset`. A 360px phone downloads the same file as a 4K
display, and that file is the LCP element.

`scripts/generate-hero-sizes.mjs` produces 320/420/560/840px variants. Wiring
them up needs a custom `loader` on that one `<Image>`, which requires
confirming the `images` config in `next.config`.

### The audit script

```bash
node scripts/css-audit.mjs
```

Reports unused CSS module classes, unused custom properties, near-duplicate
stylesheets, and expensive properties on the critical path. Zero
dependencies. Run it before opening a PR.

It has already caught: 47 dead custom properties (42% of the token system),
11 unused global utility classes, two 98%-identical header stylesheets, and a
`transition` on a full-screen `backdrop-filter`.

---

## 9. Accessibility

- Every hover state has a keyboard equivalent (`:focus-visible` /
  `:focus-within`)
- `prefers-reduced-motion` removes animation entirely rather than shortening
  it — except the card accent line and link underline, which carry
  information ("you are on this element") rather than decoration
- `prefers-contrast: more` and `forced-colors: active` are both handled
- Japanese text carries `lang="ja"`, which drives both font selection and
  screen-reader pronunciation
- `<details>`/`<summary>` powers the ATT&CK matrix — keyboard and
  screen-reader support with no JavaScript
- `@media print` exists because portfolios do get printed

---

## 10. Error handling

| File | Catches |
|---|---|
| `error.tsx` | Anything thrown inside a page |
| `global-error.tsx` | Anything thrown in the root layout |
| `not-found.tsx` | 404 |

`global-error.tsx` renders its own `<html>` and `<body>` and uses inline
styles rather than `globals.css` — if the layout failed, the stylesheet chain
may be broken too.

Neither error boundary existed before. Any exception in any of the 28 Client
Components produced a blank white page with no message and no way back.

---

## 11. Known issues

Four classes are referenced in JSX but do not exist in their CSS module, so
they currently render as `class="undefined"`:

| File | Class |
|---|---|
| `app/not-found.tsx` | `.suggest` |
| `app/components/experience/experience-section.tsx` | `.desc` |
| `app/blog/[slug]/CaseArticle.tsx` | `.factBlock` |
| `app/core/components/ShortcutsHelp.tsx` | `.group` |

`css-audit.mjs` detects these. They are left as-is because the intended
appearance is unknown.

---

## 12. Conventions

**Comments explain *why*, not *what*.** `padding: 2.5rem` needs no comment.
"This must stay in sync with `trailingSlash` in next.config or Google will
split your ranking" does.

**Document reversed decisions.** Several comments in this codebase describe
something that was tried and removed. Keep them — they stop the next person
from re-introducing the problem.

**One source of truth per concept.** Cards live in section 14. Base paths
live in `normalizePublicHref`. Device classification lives in
`useDeviceTier`. When you find two implementations of one idea, that is the
bug.

**`transform` and `opacity` only, for anything that animates.** Everything
else forces layout or paint on every frame.
