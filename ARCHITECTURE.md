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
| Styling | Tailwind CSS v4 — Sensei-Dev design system (see "Design" below) |
| Animation | CSS transitions, one shared IntersectionObserver |
| Output | `output: "export"` — static HTML, no server |
| Hosting | GitHub Pages under `/Portfolio` |

### Design

The visual design, motion and component structure are the Neo-Samurai theme
from Mostafa Mahmoud's **Sensei-Dev** portfolio
(github.com/MostafaSensei106/Sensei-Dev, GPL-3.0 — same licence as this repo),
used unchanged; the content is this site's own.

- **Stack:** Tailwind CSS v4 (utility classes in the JSX, tokens in `@theme`
  in `app/globals.css`), framer-motion (lazy `m` components under
  `LazyMotion`, see `core/components/MotionProvider.tsx`), Lenis smooth
  scroll (its own rAF loop), calm staggered scroll entrances with framer-motion
  (`core/components/FadeIn.tsx`), next-themes (dark default + light "washi" theme with the water-drop
  transition), lucide-react, yet-another-react-lightbox. Fonts are
  Sensei-Dev's `app/fonts.css` (self-hosted woff2).
- **Home page:** `app/page.tsx` composes the sections in `app/components/`
  (home, services, experience, art-gallery, header). All their content comes
  from `app/core/config/portfolio-data.ts`, which reads the existing config
  files (experience, certifications, achievements, skills, projects, cases).
- **One page:** the case library and the YouTube hub are the last sections
  of the home page (`#cases`, `#videos`, `components/cases/`), computed at
  build time in `core/config/library-data.ts` and paged six cards at a time.
  `/blog` only forwards old links to `/#cases` (keeping `?q=` filters and
  `#case-…` anchors); every case still has its own page at `/blog/<id>`.
- **Other pages** (case pages, CV, privacy, terms, 404) use
  `app/components/shared/kit.tsx`: the same classes and building blocks,
  copied from the original components, plus `PageShell` (nav + footer bar).
- **Kept from this site:** the terminal (type `3omda`), the keyboard
  shortcuts (`?`, `/`, `g` + key), the case search inside the command palette.

**The static-export constraint drives most of the architecture.** There is no
server at runtime. Every decision below follows from that:

- No API routes, no server actions, no incremental regeneration
- `images.unoptimized` must be true, so `next/image` emits plain `<img>` tags
  with **no `srcset`** — the `sizes` prop is inert
- "Server Component" means "runs at build time." Its data never reaches the
  browser, which makes it a bundle-size tool, not just a rendering one
- Every path needs the `/Portfolio` base path. Two mechanisms, one value:
  Next's `basePath` (set in `next.config.mjs`) prefixes `_next/` chunks, CSS,
  fonts and `next/link`; `normalizePublicHref` in `core/config/shared.ts`
  prefixes plain `<a>`/`<img>` asset paths. Both read
  `NEXT_PUBLIC_BASE_PATH ?? (production ? "/Portfolio" : "")`, and
  `npm run check:links` fails on any root-relative URL without the prefix

---

## 2. Pages and directory layout

The site is three pages plus one page per post and per case
(`core/config/routes.ts` is the single map of which section lives where):

| Route | What | Notes |
|---|---|---|
| `/` | The pitch: hero, stats, services, roles, selected work, repos, experience, teaching, credentials, platforms, blog teaser, FAQ, contact | ~22,000 px on desktop (was ~44,000 px as one page) |
| `/blog` | Posts, Start here, the case library, videos, ATT&CK coverage, detection rules, triage challenge | old `/#cases`, `/?q=…#cases`, `/#case-…` links are forwarded here by the home page's `homeForwardScript` |
| `/blog/<slug>` | A written post (`content/posts/<slug>.mdx`) **or** a case (`core/config/cases.ts`) | one URL space; the build fails if a post slug reuses a case id |
| `/blog/tag/<tag>` | Posts with one tag | |
| `/about` | Toolbox, daily drivers, home lab, path, now, process, contributions | |
| `/gallery` | The proof gallery (certificates, events, moments) with its lightbox — 18 pictures first, 9 more per click | old `/#art` and `/about#art` links are forwarded here (`homeForwardScript`, `hashForwardScript`) |
| `/cv`, `/privacy`, `/terms`, `/collections/web-security-academy` | as before | |

Anything that links to a section — the nav, the command palette, the `g`
shortcuts, the stats bar, `CaseFilterLink` — asks `pageOfSection(id)` or
`sectionAnchor(id)` where it is. Move a section by
changing one line in `SECTION_PAGE`.

```
app/
├── layout.tsx            Root layout — fonts.css, metadata, JSON-LD, reveal script
├── fonts.css             The Sensei-Dev font set (unicode-range slices), unchanged
├── fonts-arabic.css      IBM Plex Sans Arabic, Arabic block only
├── fonts/<family>/       The woff2 slices both files point at
├── page.tsx              Home (Server Component)
├── about/page.tsx        About
├── blog/
│   ├── page.tsx          Blog index
│   ├── [slug]/           A post (PostArticle) or a case (CaseArticle)
│   └── tag/[tag]/        Tag pages
├── cv/, privacy/, terms/, collections/   Other pages
├── feed.xml/, sitemap.ts, robots.ts, manifest.ts, llms.txt/   Generated at build
│
├── components/           Sections, one folder per area
│   ├── home/             Hero (LCP image), stats, mascot, mobile action bar
│   ├── header/           SiteNav (desktop bar + mobile menu), ContactFooter
│   ├── services/         Services, roles, work, repos, stack, uses, lab, process, FAQ
│   ├── experience/       Timeline, teaching, credentials, platforms, milestones, now
│   ├── cases/            Case library, ATT&CK, detections, triage, blog teaser
│   ├── blog/             PostCard, PostArticle, PostToc, CodeBlock, MDX components
│   ├── art-gallery/      Proof gallery + lightbox
│   └── shared/kit.tsx    Shared classes and PageShell for non-home pages
│
└── core/
    ├── components/       Motion, reveal text, section header/divider, palette,
    │                     terminal, shortcuts, FadeIn, theme
    ├── config/           All content as typed data (see §4), routes.ts
    ├── content/          posts.ts (reads content/posts), render-mdx.tsx (MDX + Shiki)
    ├── api/              Build-time fetches (GitHub, TryHackMe) with fallbacks
    ├── icons/            Inline SVG path data
    └── utils/            scroll.ts (Lenis-aware scrolling, scroll lock), helpers

content/posts/            Blog posts as MDX — one file per post (see §13)

scripts/
├── *-audit.mjs, check-*.mjs   The checks `npm run verify` runs
├── og/                   Share-card generators and their small font files (og/fonts)
├── subset-fonts.py       Rebuilds the OG fonts after new Japanese text
└── generate-*.mjs        Thumbnails, hero sizes, icons
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
cases.ts           79 case reports (the largest file)
case-details.ts    Case files: verdict, chain, timeline, IOCs, response, detection
                   code, lessons — server-only, every value from the report PDF
attack.ts          ATT&CK v19 tactics/techniques, case → technique map; sub-techniques
                   resolve to parents; unknown ids throw at build time
detection-rules.ts The 52 Wazuh rules shown in the Detection Library
testimonials.ts    Recommendations (empty → the section renders nothing)
certifications.ts  Certs with issuer, year, verification URL
skills.ts          Skill groups, each linked to the cases that prove it
achievements.ts    Awards and recognition
experience.ts      Timeline entries
projects.ts        Project metadata and bullet points
youtube.ts         Video and playlist metadata
start-here.ts      Curated entry points for the blog
cv.ts              CV structure
portfolio-data.ts  Everything the home page renders (profile, services, process, stack)
live-copy.ts       Home-page copy that quotes case-library numbers (server-only)
site.ts            Absolute URLs, base path, trailing-slash policy
shared.ts          normalizePublicHref, date formatting, thumbnails, case kinds,
                   collections, defang()
```

**Case details stay on the server.** `case-details.ts` is imported only by
server components (`app/blog/[slug]/page.tsx`); the client `CaseFile`
component receives one case's detail as props, so the home-page bundle never
carries the IOCs, timelines or detection code of 79 cases.

**Case kinds.** `caseKindOf()` sorts every case into investigation, project,
lab or note from its `type`; the library's tabs, the "Recommended" sort and
the report counts all use it, so a new case is placed by setting `type`.

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
`globals.css`. No component sets card borders, backgrounds, radii,
padding, or hover behaviour in its own classes.

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
attribute selector alone has specificity `(0,1,0)` — identical to any single
class. When the site still used CSS Modules, which one won depended on
stylesheet load order, which Next does not guarantee. Prefixing `html` makes it `(0,1,1)` and it always
wins. The conflicting module declarations were removed as well; the
specificity bump is a safety net for cards added later.

### Adding a new card

Add `data-fx="card"` and a size variant. Do not write borders, backgrounds,
radii, padding, or hover rules. If you need a genuinely different surface,
add a variant to section 14 rather than a one-off rule in a module.

---

## 7. Animation

### Scroll entrances (`core/components/FadeIn.tsx`)

Elements fade and slide in as they enter the viewport (framer-motion; the
timing is under "Scroll feel" below):

```tsx
<FadeIn y={32} duration={0.7} delay={idx * 0.08}>…</FadeIn>
<FadeIn as="li" x={-24} y={0}>…</FadeIn>   {/* keeps the real tag */}
```

Once per element; only `opacity` and `transform` move.

framer-motion renders the starting state (`opacity: 0`) into the HTML. A
`<noscript>` style in `layout.tsx` and a print rule in `globals.css` show
those elements as they are, so the page is complete without JavaScript and
on paper.

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

Exactly the Sensei-Dev set, loaded the way that site loads it:
`app/fonts.css` (imported in `layout.tsx`) declares Dela Gothic One, Outfit,
JetBrains Mono, Noto Sans JP (400/700/900) and Yuji Syuku as `@font-face`
rules split by `unicode-range`, pointing at `app/fonts/<family>/N.woff2`. The
bundler fingerprints the files and adds the `/Portfolio` base path. A browser
downloads only the slices whose characters a page uses (about 30 small files
on the home page, mostly kanji slices of Yuji Syuku for the ornaments).

`app/fonts-arabic.css` adds IBM Plex Sans Arabic for Arabic text only (the
Sensei-Dev set has no Arabic glyphs); `:lang(ar)` in `globals.css` selects it.

`app/fonts-yuji-site.css` (generated by `scripts/subset-yuji-site.py`)
declares Yuji Syuku once more, cut to the ~330 characters the site writes
in it, after `fonts.css`. For overlapping unicode-ranges the last-declared
face wins, so the decorative kanji no longer pull 23 slices (~620 KB): the
home page loads 4 font files, ~300 KB in all, instead of 24 / ~650 KB. The
glyphs are the same font (compared outline for outline). A character added
later that is not in the subset still renders — from its original slice —
so re-running the script after new Japanese text is an optimisation, not a
requirement.

Trade-off vs. the previous `next/font` setup: no generated size-matched
fallback, so text can shift slightly when a face arrives on a cold first
visit. `font-display: swap` keeps text visible meanwhile.

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

### The LCP image

`images.unoptimized` means `next/image` never writes a `srcset`, so the hero
portrait is a plain `<img>` with `srcSet`/`sizes` over the variants from
`scripts/generate-hero-sizes.mjs` (320/420/560/840px, 4–28 KB instead of the
318 KB original), preloaded with `fetchPriority="high"` through React's
`preload()`. `sizes` matches the circle's real widths: 176 / 216 / 276 CSS px.

### Payload kept out of the home page

- Case cards get `{ cover, count }` per case (`mediaById`); the full
  screenshot lists are a static `/case-screenshots.json` fetched on the first
  gallery open.
- `sortedCases` keeps only the fields a card and the search use.
- The ATT&CK coverage section is a Server Component built on `<details>`, so
  it ships no JavaScript of its own; its row styling lives in `globals.css`
  (`.attack-*`) rather than repeated utility lists.

### The audit script

```bash
node scripts/css-audit.mjs
```

Reports unused classes in `globals.css` (the named effects), unused custom properties, near-duplicate
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

---

## 13. The blog

Posts are MDX files in `content/posts/`; the file name is the URL
(`content/posts/x.mdx` → `/blog/x`). `content/posts/writing-a-post.mdx`
documents the front matter and every component, and is itself a draft.

- **Build-time only.** `core/content/posts.ts` reads the files with
  gray-matter; `core/content/render-mdx.tsx` compiles them with
  `@mdx-js/mdx` + remark-gfm + rehype-slug + Shiki (JavaScript regex engine,
  two themes as CSS variables, switched by the site theme). No MDX runtime
  ships to the browser; only `CodeBlock` (copy button), `PostToc`
  (scrollspy) and `ShareRow` are client components.
- **Drafts** (`draft: true`) render under `next dev` with a Draft badge and
  are left out of `next build` (unless `SHOW_DRAFTS=1`).
- **Arabic** (`lang: ar`) sets `lang`/`dir="rtl"` on the article; logical
  properties (`ps-`, `ms-`, `text-start`, `border-s`) flip the layout, code
  blocks stay LTR, headings switch from Dela Gothic (no Arabic glyphs) to
  IBM Plex Sans Arabic.
- **Everywhere else:** posts are in the RSS feed, the sitemap, `llms.txt`,
  the blog page's `Blog` JSON-LD, and each post page has `BlogPosting` +
  breadcrumb JSON-LD.
- **Motion:** the post card title morphs into the post headline (React
  `<ViewTransition name share="morph">`); case cards do the same into the
  case headline. The reading-progress bar is a CSS scroll timeline.

---

## 14. Loading and scroll smoothness

Measured with a scripted wheel scroll through the home page (Lenis on),
counting frames over 50 ms:

| | before | after |
|---|---|---|
| Desktop, normal CPU | 41 | 3 |
| Desktop, CPU ×2 | 73 | 12 |
| Desktop, CPU ×4 | 129 | 39 |
| Phone, CPU ×4 | 3 | 0 |

What changed, in order of effect:

1. **No full-screen fixed overlays.** The scanline and dot-grid layers
   (under 0.2% visible together) made every scrolling element an overlap
   test for the compositor each frame.
2. **No hover work during a smooth scroll.** `html.lenis-scrolling` turns
   off pointer events on the page content (mouse devices only) while Lenis
   moves it, so cards sliding under a resting cursor do not run spotlight /
   tilt / transitions every frame. Nav, menu and toasts stay live.
3. **No layout reads in scroll handlers.** PaletteHint and MobileActionBar
   use IntersectionObservers; the action bar does nothing on desktops.
4. **backdrop-filter only on fixed/absolute elements** (globals.css): in-flow
   cards over the flat page background looked the same without it.
5. **ScrambleText writes to the DOM directly** instead of re-rendering
   React every 28 ms.

Loaded on demand instead of with every page:

- the command palette (`PaletteMount` → `CommandPalette` on the first
  Ctrl/⌘K, `/` or Search) and its search index (`/palette-index.json`,
  cases + posts — it used to be serialised into every page's HTML);
- the custom cursor (`CursorMount`: precise pointers only, after idle);
- lightboxes, the terminal and the shortcuts sheet (already were);
- images and iframes below the fold (`loading="lazy"`), section rendering
  (`content-visibility: auto` below the experience timeline), Shiki/MDX
  (build time only).

### Scroll feel

Calm and one after another (`FadeIn`, framer-motion): an element starts
when it is ~15% inside the screen, plays over ~1–1.35 s with up to 56 px of
travel on a quart-out curve (0.8× on phones), and everything entering in the
same frame cascades 110 ms apart. Only `opacity` and the whole `transform`
are animated, which framer hands to the browser (off the main thread).
GSAP plays the hero entrance and is imported on demand. Lenis at lerp 0.1;
the intro screen on every page load.

`scrollbar-color` is set on the scrolling elements and reset on `<body>`: as
an inherited property it made every `transition-all` element run a
transition each time Lenis toggled its class on `<html>` (start and end of
every scroll).

---

## 15. Browser support and accessibility

### Support floor

Set by the stack, not by choice: Next 16 compiles its JavaScript for
**Chrome/Edge 111+, Firefox 111+, Safari 16.4+** (`modern-browserslist-
target`), and Tailwind 4 needs the same generation (cascade layers,
`@property`, `color-mix`) — with its own fallbacks for the last two. That
is every browser released since spring 2023: iOS 16.4+ (iPhone 8 and
later, updated), Android Chrome, Samsung Internet 22+, desktop browsers.
Older browsers (iOS ≤ 15, Chrome ≤ 98) get unstyled HTML, which is still
readable because everything is server-rendered.

Features newer than that floor, and what happens without them:

| Feature | Used for | Without it |
|---|---|---|
| `[popover]` (Safari 17, Firefox 125) | ATT&CK evidence | popovers stay hidden (`@supports not selector(:popover-open)`); tiles and counts still read |
| Scroll-driven animations | ATT&CK heat, reading bar | filled tiles, no bar |
| View Transitions | card → page title morph | normal navigation |
| `text-wrap: balance / pretty`, `word-break: auto-phrase` | headings, Japanese line breaks | ordinary wrapping |
| `requestIdleCallback` (not in Safari) | cursor load | `setTimeout` |
| `:has()` (Firefox 121) | task-list checkboxes | bullets |

### Accessibility checks

`npm run check:a11y` runs axe-core (WCAG 2.2 A/AA) on one page of each kind,
phone and desktop, dark and light — 0 violations is the bar.
`npm run check:layout` loads the same pages at 16 screen sizes (280px fold
to 5K, landscape phones) and again at 200% text, and fails on sideways
scroll, content past the screen edge or clipped text. Both run in
`npm run verify` after the build.

What they and the manual checks covered:

- **Contrast:** real text ≥ 4.5:1 in both themes (low-opacity labels went
  to 65% — 60% is the floor on the lightest dark surface). Ornament
  (giant kanji, 01/02 numerals) is drawn from `data-jp` / `data-deco` by
  CSS, so it is not text to a checker or a screen reader.
- **Keyboard:** every stop has a visible ring (fields get a 2px underline);
  nothing invisible is focusable (`inert` on the hidden toast); the mobile
  menu, palette, terminal and shortcuts sheet keep Tab inside
  (the focus-trap library, `core/utils/use-focus-trap.ts`) and Esc returns focus to the opener.
- **Touch targets** ≥ 24px; hover-only captions show on touch screens and
  on keyboard focus (`.hover-reveal`).
- **Reduced motion:** CSS loops and transitions stop; framer-motion
  (`MotionConfig reducedMotion="user"`) drops the movement and keeps a
  short fade; nothing stays hidden.
- **No JavaScript:** content is visible — the framer-motion entrances
  start at `opacity: 0` in the HTML, and a `<noscript>` style shows them.
- **Large text** (browser/OS default font raised): `html.large-text` lets
  rows wrap instead of overflow; checked at 150% and 200%.
- **Windows high contrast:** ornaments are dropped, the hero name gets line
  room, focus uses the system Highlight colour.
