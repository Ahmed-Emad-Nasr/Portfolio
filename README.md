# Ahmed Emad Nasr Portfolio

Personal portfolio and cybersecurity blog built with Next.js, focused on SOC work, incident response, DFIR writeups, training material, and project evidence.

![Next.js](https://img.shields.io/badge/Next.js-16-111827?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Motion-Framer-000000?style=flat-square)

## Overview

<table>
  <tr>
    <td>
      <ul>
        <li><b>Live portfolio:</b> <a href="https://ahmed-emad-nasr.github.io/Portfolio/">ahmed-emad-nasr.github.io/Portfolio</a></li>
        <li><b>LinkedIn:</b> <a href="https://www.linkedin.com/in/0x3omda/">linkedin.com/in/0x3omda</a></li>
        <li><b>YouTube:</b> <a href="https://www.youtube.com/@AhmedEmad-0x3omda">@AhmedEmad-0x3omda</a></li>
      </ul>
    </td>
    <td><img align="right" height="153" width="159" src="gif/anime-frieren.gif" /></td>
    <td><img align="right" height="153" width="159" src="gif/giphy.gif" /></td>
  </tr>
</table>

This repo contains two connected experiences:

- A portfolio homepage with intro, experience timeline, projects, and art gallery sections.
- A cybersecurity blog/archive with case studies, evidence libraries, screenshots, PDFs, and embedded YouTube content.

The app is structured as a static-export-friendly Next.js App Router project and is prepared for GitHub Pages deployment.

## What The Site Includes

- A polished landing page with animated sections and a fixed header.
- A blog archive with filtering, sorting, searchable content, and evidence-rich writeups.
- Downloadable and viewable assets for reports, screenshots, CVs, and gallery media.
- SEO metadata, Open Graph cards, Twitter cards, robots/sitemap support, and JSON-LD structured data.
- Responsive layouts that work on desktop and mobile.

## Main Routes

- `/` - portfolio homepage.
- `/blog` - cybersecurity blog and case library.
- `/thank-you` - post-submit thank-you page.
- Custom not-found experience for invalid routes.

## Content Areas

### Portfolio Home

- Hero/introduction section with personal summary.
- Experience and education timeline.
- Projects section for security-related work and highlights.
- Art gallery section for visual work.
- Fixed navigation with smooth motion and section-based interactions.

### Blog

- SOC incident reports and cybersecurity case studies.
- DFIR and malware-analysis writeups.
- Screenshot libraries for investigations and lab walkthroughs.
- PDF resources such as CVs and evidence packs.
- Embedded YouTube videos and playlists.

## Tech Stack

- Next.js 16 with App Router and static export.
- React 19.
- TypeScript 5.9.
- Framer Motion.
- CSS Modules plus global CSS.
- Font Awesome icons.
- Yet Another React Lightbox for media viewing.

## Project Structure

- `app/layout.tsx` sets the root metadata, fonts, viewport, and structured data.
- `app/page.tsx` and `app/page-client.tsx` render the main portfolio experience.
- `app/blog/page.tsx` and `app/blog/page-client.tsx` render the blog archive.
- `app/core/data.ts` stores the main static content for skills, timeline items, blog media, and playlists.
- `app/components/` contains the reusable sections for the homepage and blog.
- `public/Assets/` contains screenshots, PDFs, logos, case evidence, CV files, and other media.
- `gif/` holds the animated assets used in the README and site presentation.

## Local Development

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Then open the local address shown by Next.js, usually `http://localhost:3000`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run type-check
npm run format
npm run format:check
npm run clean
npm run audit
npm run verify
```

## Environment Notes

The app is mostly static, but some contact/deployment-related behavior depends on environment variables when enabled in the UI.

- `NEXT_PUBLIC_FORMSPREE_ENDPOINT` - contact form delivery.
- `NEXT_PUBLIC_TELEGRAM_WEBHOOK_URL` - optional notification relay.
- `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` and `NEXT_PUBLIC_TELEGRAM_CHAT_ID` - direct Telegram mode.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - optional anti-spam challenge.

## Deployment

The Next config is set up for static export, so the site can be deployed to GitHub Pages or any static host.

Before publishing, verify the following paths load correctly:

- `/`
- `/blog`
- `/robots.txt`
- `/sitemap.xml`

If you update the public content or case library, regenerate and redeploy the export so the assets and metadata stay in sync.

## Design Notes

- Motion is intentionally smooth and cinematic rather than abrupt.
- The portfolio uses reusable sections and typed content instead of hard-coded page fragments.
- Structured data is embedded for the homepage and blog to improve discoverability.
- The gifs are kept as part of the visual identity.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
