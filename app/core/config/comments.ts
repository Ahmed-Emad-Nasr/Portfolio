/*
 * core/config/comments.ts — comments on blog posts, through Giscus
 * (giscus.app): each post's thread is a GitHub Discussion in a repository
 * you choose, so there is no database to run and readers sign in with GitHub.
 *
 * Off until configured. To turn it on:
 *   1. Enable Discussions on a public repo (the Portfolio repo works) and
 *      install the giscus app on it: https://github.com/apps/giscus
 *   2. Open https://giscus.app, enter the repo, pick a category
 *      ("Announcements" is a good choice: only you can open threads), and
 *      copy the four values it shows into the build environment
 *      (.env.local, or `env:` in .github/workflows/nextjs.yml):
 *
 *        NEXT_PUBLIC_GISCUS_REPO=Ahmed-Emad-Nasr/Portfolio
 *        NEXT_PUBLIC_GISCUS_REPO_ID=R_…
 *        NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
 *        NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_…
 *
 * When it is on, the CSP allows giscus.app, the privacy page lists it, and
 * each post shows a "Load comments" button — nothing is fetched from
 * giscus.app or GitHub until a reader presses it.
 */

const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

export type GiscusConfig = { repo: string; repoId: string; category: string; categoryId: string };

export const GISCUS: GiscusConfig | null =
  repo && repoId && category && categoryId ? { repo, repoId, category, categoryId } : null;

export const GISCUS_ORIGIN = "https://giscus.app";
