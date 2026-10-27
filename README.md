# Ahmed Emad Nasr — Portfolio

Information security portfolio (GRC, SOC, IR/DFIR, malware analysis, IAM,
data security) with a library of case reports. Live at
<https://ahmed-emad-nasr.github.io/Portfolio/>.

Design, motion and component structure: the Neo-Samurai theme from
[Sensei-Dev](https://github.com/MostafaSensei106/Sensei-Dev) by Mostafa Mahmoud
(GPL-3.0, the same licence as this repository). Content is my own.

**Stack:** Next.js 16 (App Router, static export) · React 19 · TypeScript ·
Tailwind CSS v4 · framer-motion · GSAP (hero entrance) · Lenis · next-themes ·
lucide-react · yet-another-react-lightbox. Fonts via `next/font/google`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/ (needs network: fonts come from Google at build time)
```

Deploys to GitHub Pages from `master` (`.github/workflows/nextjs.yml`).

## Project layout

```
app/          routes only (pages, sitemap, feed, JSON routes), globals.css, fonts
components/
  layout/     on every page: nav, footer, theme, cursor, palette, terminal, shortcuts
  ui/         small shared pieces: FadeIn, SectionHeader, PageLink, Lightbox, kit.tsx
  home/       the home page's sections (+ dynamic.tsx: what is split / lazy)
  blog/       the blog page and case pages (+ dynamic.tsx)
data/         all the content, as TypeScript
lib/          helpers: URLs, SEO, scrolling, case parsing, build-time API calls
lib/perf/     when work happens: idle queue, lazy sections, jumps, pausing animations
scripts/      checks and asset generators (npm run …)
public/       images, PDFs, icons, sw.js
```

ARCHITECTURE.md explains how the pages load.

## Editing content

Everything the site shows is in `data/`; nothing is written twice.

| What | File |
|---|---|
| Home page sections (services, process, FAQ, now, milestones …) | `portfolio-data.ts` |
| Numbers quoted from the case library on the home page | `live-copy.ts` |
| Experience and education | `experience.ts` |
| Certifications | `certifications.ts` |
| Awards and rankings | `achievements.ts` |
| Skills and languages | `skills.ts` |
| Projects | `projects.ts` |
| Cases and their screenshots | `cases.ts` |
| Case files (verdict, chain, timeline, IOCs, response, detections) | `case-details.ts` |
| ATT&CK mapping per case | `attack.ts` |
| Wazuh rule pack (Detection Library) | `detection-rules.ts` |
| "Start here" reports | `start-here.ts` |
| YouTube videos and playlists | `youtube.ts` |
| Training platforms | `platforms.ts` |
| Teaching section | `teaching.ts` |
| CV page | `cv.ts` |
| Privacy / terms facts | `legal.ts` |

Images, PDFs and screenshots go in `public/Assets/` at the paths the data
uses (`npm run check:assets` lists anything missing).

**Adding a case:** add it to `cases.ts` (the `id` becomes `/blog/<id>`, so
lowercase letters, digits and hyphens), its screenshots to
`caseScreenshotsByEvidenceId` in the same file, optionally a case file in
`case-details.ts` and an ATT&CK mapping in `attack.ts`, then run
`npm run thumbs` and `npm run og:cases`.

## Pages

- `/` — the portfolio: hero, services, roles, work, repositories,
  experience, teaching, certifications, platforms, About (`#about`), a door
  to the blog, the proof gallery (`#art`), FAQ, contact.
- `/blog` — the case library (`#cases`, filters kept in the URL), videos,
  ATT&CK coverage (`#attack`), detection rules (`#detections`), triage
  challenge (`#triage`). Old `/#cases…` links are forwarded here.
- `/blog/<case-id>` — one page per case.
- `/collections/web-security-academy` — the PortSwigger labs as a track.
- `/cv` — the CV as HTML (prints as a one-column PDF).
- `/privacy`, `/terms`, 404; `/about` and `/gallery` hop to their section.
- Files: `/feed.xml`, `/sitemap.xml`, `/llms.txt`, `/.well-known/security.txt`,
  `/attack-navigator-layer.json`.

Hidden extras: `Ctrl/⌘ K` command palette, `?` keyboard shortcuts, and type
`3omda` anywhere for the terminal.

## Configuration (build time, optional)

Copy `.env.example` to `.env.local`, or set them in the workflow:

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` or `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` —
  cookieless analytics; the privacy page and the CSP follow automatically.
- `NEXT_PUBLIC_WEB3FORMS_KEY` — the contact form sends through Web3Forms;
  without it the form opens the visitor's mail app.

## Scripts

```bash
npm run verify          # lint, types, data, assets, build, links, a11y, layout
npm run prepare:assets  # pdf:clean, thumbs, hero:sizes, icons, og:cases
```

| Script | Does |
|---|---|
| `check:data` | every case id referenced in the data exists; ATT&CK and YouTube ids are valid |
| `check:assets` | every `Assets/` path in the data exists in `public/` (exact case) |
| `check:links` | after a build: every internal link in `out/` resolves |
| `check:a11y` | axe-core (WCAG 2.2 AA) on every kind of page, phone and desktop, both themes |
| `check:layout` | no overflow or clipped text from a 280px fold to 5K, and at 200% text |
| `thumbs` / `hero:sizes` | image variants (sharp) |
| `og:cases` | a 1200×630 share card per case (Playwright) |
| `pdf:clean` | report PDF metadata and image recompression (Python, `requirements.txt`) |
| `icons` | `components/ui/icon-data.ts` from FontAwesome |

New Japanese text renders straight away; to keep it light re-run
`scripts/subset-yuji-site.py` (and `scripts/subset-fonts.py` before
regenerating share cards). The app icons come from `scripts/og/app-icon.html`.

## Licence

GPL-3.0 — see `LICENSE`. Fonts are under the SIL Open Font License 1.1.
