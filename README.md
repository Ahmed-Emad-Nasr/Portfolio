# Ahmed Emad Nasr — Portfolio

SOC operations, incident response and DFIR portfolio with a case library of
investigation reports. Live at <https://ahmed-emad-nasr.github.io/Portfolio/>.

Design, motion and component structure: the Neo-Samurai theme from
[Sensei-Dev](https://github.com/MostafaSensei106/Sensei-Dev) by Mostafa Mahmoud
(GPL-3.0, the same licence as this repository). Content is my own.

## Stack

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS v4 ·
framer-motion (lazy `m` + `LazyMotion`) · Lenis · next-themes · lucide-react ·
yet-another-react-lightbox. Fonts are self-hosted with `next/font/local`.
Scroll entrances are one inline script (`app/core/reveal.ts`), the hero
entrance is CSS — no GSAP.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/
```

For the maintenance scripts (`npm run verify`) also install, once:

```bash
pip install -r requirements.txt     # pikepdf, pillow, fonttools, brotli
npx playwright install chromium     # the browser og:cases draws the share cards with
```

On Windows, install Python from python.org (tick "Add python.exe to PATH")
and use `py -m pip install -r requirements.txt`. The npm scripts find Python
through `scripts/run-python.mjs` (`py -3`, then `python3`, then `python`), so
the Microsoft Store "python3" shortcut never breaks the build; without Python
or Chromium the two optional steps print what to install and `verify` carries on.

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
| Case files — verdict, attack chain, timeline, IOCs, response, detection code, lessons (server-only, read at build time) | `case-details.ts` |
| Case kinds (investigation / project / lab / note), collections, `defang()` | `shared.ts` |
| ATT&CK mapping per case, sub-techniques resolved to parents (also feeds the coverage section on the home page) | `attack.ts` |
| The Wazuh rule pack shown in the Detection Library | `detection-rules.ts` |
| Testimonials (the section stays hidden while the list is empty) | `testimonials.ts` |
| "Start here" reading path | `start-here.ts` |
| YouTube videos and playlists | `youtube.ts` |
| CV page (summary, projects, skills) | `cv.ts` |
| Home page sections (services, process, FAQ, now, milestones …) | `portfolio-data.ts` |
| Privacy page facts | `legal.ts` |

Images, PDFs and screenshots go in `public/Assets/` at the paths the config
uses. `npm run check:assets` lists any that are missing.

## Pages

- `/` — the whole portfolio on one page. Sections added in this round:
  roles I fit (`#roles`), the home lab diagram (`#lab`), the detection library
  (`#detections`), the triage challenge (`#triage`) and testimonials (hidden
  until there are any). It ends with the ATT&CK coverage map (`#attack`,
  with a matrix view), the case library (`#cases`, with kind tabs, sort and
  a list view, all kept in the URL) and the videos (`#videos`).
- `/blog/<id>` — one page per case (shareable, indexed by search engines).
  Cases with an entry in `case-details.ts` get the full case file: verdict
  bar, facts, attack chain, timeline, defanged IOCs (copy as CSV), response,
  detection code, lessons and the report inline.
- `/collections/web-security-academy` — the PortSwigger labs grouped by
  vulnerability class.
- `/attack-navigator-layer.json` — the coverage as an ATT&CK Navigator layer
  (the coverage section links to it and to the Navigator).
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
- `NEXT_PUBLIC_WEB3FORMS_KEY` — sends the contact form through Web3Forms
  (free access key from web3forms.com). Without it the form opens the
  visitor's mail app, as before. The CSP and the privacy page already allow
  for it.

The service worker is registered only when `public/sw.js` exists at build
time, and the privacy page mentions it only then.

## Maintenance scripts

```bash
npm run verify          # everything below, in order — run it before every push
npm run prepare:assets  # just the clean-up / generate step
npm run check:links     # after a build: every internal link resolves to a file
```

`npm run verify` runs:

1. **`prepare:assets`** — the clean-up and generated files, each one only
   touching what changed, so a second run is quick and leaves git clean:
   - `pdf:clean` — sets the author metadata of new report PDFs to my name and
     recompresses their images where it clearly pays off (`-- --force` redoes
     all; skipped with a message if the Python packages from
     `requirements.txt` aren't installed)
   - `thumbs` — the `-thumb.webp` next to every new image
   - `hero:sizes` — the 320–840 px hero photo variants
   - `icons` — `app/core/icons/icon-data.ts`
   - `og:cases` — the share card of every new or changed case, and removes
     cards of deleted cases (`-- --force` redraws all)
2. lint, types, and the CSS / data / responsive / contrast / asset /
   dead-code checks
3. the build, then the link check

- **Per-case share cards** live in `public/og/cases/<id>.jpg` (1200×630);
  case pages use them automatically.
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

Third pass (October 2026, production audit). Same build measured before and
after on one machine (no `public/` images in the test, so compare the deltas,
not the absolute numbers with the tables above):

| | Before | After |
|---|---|---|
| JavaScript, every page except home (gzip) | 303 KB | 214 KB |
| JavaScript, home (gzip, modern browsers) | 344 KB | 260 KB |
| Main-thread blocking, home, 4× CPU (median) | 2.55 s | ~1.9 s |
| Lighthouse accessibility | 97 | 100 |
| Lighthouse desktop performance | 88 | 92 |
| axe-core violations (home, CV, case page, legal, 404 — both themes) | 6 rule types | 0 |

What changed:

- The case library (`cases.ts`, ~115 KB with every screenshot path) and the
  ATT&CK mapping no longer ship to the browser. `portfolio-data.ts` imported
  `case-stats.ts`, so all 18 client sections that read it pulled the whole
  library into every page's JS. The numbers now live in `live-copy.ts`
  (server-only) and reach the sections as props.
- GSAP and ScrollTrigger are gone. The hero entrance is CSS (it starts at
  the first paint instead of hiding the server-rendered hero at hydration
  and replaying it), the timeline uses the reveal script, and Lenis drives
  itself (`autoRaf`) instead of riding GSAP's ticker.
- ~40 framer-motion `whileInView` components became `data-reveal`
  attributes played by one IntersectionObserver (`core/reveal.ts`), and
  framer-motion loads its animation engine lazily (`MotionProvider`).
  Ten static sections became server components.
- The intro screen leaves on a CSS timer (~1.2 s) instead of waiting for
  hydration plus 1.9 s.
- Accessibility: decorative Japanese labels are painted from `data-jp`
  (generated content), the ATT&CK links are underlined, accessible names
  match visible text, the cursor overlay is hidden from assistive tech.
- Security: a Content-Security-Policy `<meta>` (production builds), an
  explicit referrer policy, `security.txt`.

What still limits mobile Lighthouse is the size of the one page: ~1 MB of
HTML (126 KB gzip) and ~5,300 elements — 76 cases, 98 gallery records, 28
ATT&CK techniques with their evidence, 26 videos — all hydrated at once.
Moving the case library and the videos to their own route would roughly
halve it.

## Licence

GPL-3.0 — see `LICENSE`. Fonts are under the SIL Open Font License
(`app/fonts/README.md`).
