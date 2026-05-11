# Ahmed Emad Nasr Portfolio

Personal portfolio and cybersecurity blog built with Next.js.

![Next.js](https://img.shields.io/badge/Next.js-16-111827?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Motion-Framer-000000?style=flat-square)

## At a Glance

- A portfolio landing page with intro, experience, projects, and art gallery sections.
- A blog for security case studies, investigation writeups, screenshots, and PDF evidence.
- Responsive layouts with cinematic motion across the main portfolio and blog views.
- Static assets for reports, screenshots, CV, and artwork under [public/](public/).

## What Makes It Yours

- The content is centered around cybersecurity investigations, DFIR-style writeups, and learning material.
- Metadata and structured data are already configured for search and social previews.
- The app uses a clean Next.js App Router structure with typed content and reusable sections.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Framer Motion
- CSS Modules and global CSS

## Getting Started

Install dependencies, then start the dev server:

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run lint
npm run type-check
npm run build
npm run verify
```

## Project Map

- `app/page.tsx` and `app/page-client.tsx` render the main portfolio.
- `app/blog/page.tsx` and `app/blog/page-client.tsx` render the blog archive.
- `app/core/data.ts` holds the static content used across sections.
- `public/Assets/` contains the downloadable and embedded project materials.

## Notes

- The gifs stay untouched.
- The docs now match the actual portfolio/blog instead of the copied SOC project text.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
