# Ahmed Emad Nasr — Portfolio

SOC operations, incident response and DFIR portfolio with a case library of
investigation reports. Live at <https://ahmed-emad-nasr.github.io/Portfolio/>.

Design, motion and component structure: the Neo-Samurai theme from
[Sensei-Dev](https://github.com/MostafaSensei106/Sensei-Dev) by Mostafa Mahmoud
(GPL-3.0, the same licence as this repository). Content is my own.

## Stack

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS v4 ·
framer-motion · GSAP ScrollTrigger · Lenis · next-themes · lucide-react ·
yet-another-react-lightbox. Fonts are self-hosted with `next/font/local`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/
```

## Where the content lives

Everything is data in `app/core/config/` — the pages read it, nothing is
written twice.

| What | File |
|---|---|
| Experience, education | `experience.ts` |
| Certifications, gallery size | `certifications.ts` |
| Awards and rankings | `achievements.ts` |
| Skills, languages | `skills.ts` |
| Projects and their bullet points | `projects.ts` |
| Cases (the library) and their screenshots | `cases.ts` |
| ATT&CK mapping per case (also feeds the coverage section on the home page) | `attack.ts` |
| "Start here" reading path | `start-here.ts` |
| YouTube videos and playlists | `youtube.ts` |
| CV page (summary, projects, skills) | `cv.ts` |
| Home page sections (services, process, FAQ, now, milestones …) | `portfolio-data.ts` |
| Privacy page facts | `legal.ts` |

Images, PDFs and screenshots go in `public/Assets/` at the paths the config
uses. `npm run check:assets` lists any that are missing.

## Pages

- `/` — the whole portfolio on one page, ending with the ATT&CK coverage map
  (`#attack`), the case library (`#cases`) and the videos (`#videos`).
- `/blog/<id>` — one page per case (shareable, indexed by search engines).
- `/blog` — forwards old links to `/#cases`, keeping `?q=` filters and
  `#case-…` anchors.
- `/cv` — the CV as HTML (prints as a clean one-column PDF).
- `/case-screenshots.json` — every case's screenshot list, fetched by the
  library the first time a gallery is opened.
- `/privacy`, `/terms`, 404.

Hidden extras: `Ctrl/⌘ K` command palette (also searches cases), `?` keyboard
shortcuts, and type `3omda` anywhere for the terminal.

## Configuration (build time)

Copy `.env.example` to `.env.local`, or set the variables in the GitHub
Actions workflow:

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` **or** `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` —
  cookieless visit statistics (Plausible or Cloudflare Web Analytics). Off
  when neither is set; the privacy page updates itself either way.

The service worker is registered only when `public/sw.js` exists at build
time, and the privacy page mentions it only then.

## Maintenance scripts

```bash
npm run verify          # lint, types, CSS/data/responsive/asset checks, build, link check
npm run check:links     # after a build: every internal link resolves to a file
```

- **New Japanese text?** The display fonts are subset to the characters in
  use. Re-run `scripts/subset-fonts.py` (instructions at the top of the file).
- **Share image** (`public/og-image.png`, 1200×630): made from
  `scripts/og/og-image.html` — edit and re-screenshot it.
- **Icons** (`app/favicon.ico`, `public/icons/*.png`): the "AE." mark from
  `scripts/og/app-icon.html`, screenshotted at 512/192/180 px (and 512 with
  no top bar and a smaller mark for the maskable icon).
- **New hero photo?** Replace `public/Assets/art-gallery/Images/logo/3omda.webp`
  and run `node scripts/generate-hero-sizes.mjs` — the page serves the
  320–840px variants, not the original.

## Performance notes

Measured with Lighthouse on the production build (gzip, like GitHub Pages):

| | Before | After |
|---|---|---|
| Home, desktop | 58 | 97 |
| Home, mobile (simulated slow 4G + 4× CPU) | 29 | 45–52 |
| Page weight, home | 1.66 MB | 0.69–0.76 MB |
| First paint, mobile | 9.5 s | 2.0 s |
| Layout shift | 0.355 desktop | 0.011 desktop, 0 mobile |

For reference, the original Sensei-Dev site measures 39 mobile / 67 desktop
on the same setup. Accessibility 97, best practices 96, SEO 100.

What changed: the Japanese fonts are subset (they were five render-blocking
stylesheets and 30+ font files), fonts are preloaded with size-matched
fallbacks, the case data is passed to the browser as props instead of whole
config modules, the contribution graph only loads when scrolled near, the
case library pages its cards, and the sections below the experience timeline
skip rendering until they are near the viewport. The remaining mobile cost is
the design's own animation stack (framer-motion, GSAP, Lenis) and hydration.

Second pass (October 2026), median of 3 Lighthouse runs each, same build
setup (`basePath` on, gzip):

| | Before | After |
|---|---|---|
| Page weight, home | 999 KB | 705 KB |
| Hero portrait (the LCP image) | 311 KB | 4–28 KB by screen |
| LCP, mobile with real (devtools) throttling | 2.2 s | 1.7 s |
| Desktop performance | 98 | 98 |
| Best practices / SEO | 96 / 100 | 100 / 100 |

Mobile performance under simulated throttling stays in the high 60s either
way; it is bound by the same animation stack. The accessibility score is 97:
what Lighthouse still flags is the faded Japanese decoration (eyebrows,
dividers), which is hidden from screen readers and kept faint on purpose.

## Licence

GPL-3.0 — see `LICENSE`. Fonts are under the SIL Open Font License
(`app/fonts/README.md`).
