/*
 * Hybrid GitHub repository sync (build-time with offline fallback).
 *
 * 1. Keeps the curated projects in PORTFOLIO_DATA.work (with their custom
 *    Problem, Role, Metrics and Case Study links) and refreshes their live
 *    star counts and homepage links from the GitHub API.
 * 2. Automatically appends any new public repository pushed to GitHub that
 *    is not a fork, is not the profile/portfolio repo, and has a description.
 * 3. Falls back cleanly to staticProjectFallback when building offline or
 *    when the unauthenticated GitHub API rate limit is reached.
 */

import { GITHUB_USERNAME, projectBullets, staticProjectFallback } from "@/data/projects";
import { PORTFOLIO_DATA } from "@/data/portfolio-data";
import type { WorkItem, WorkType } from "@/data/types";

interface GithubRepoPayload {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  fork?: boolean;
  archived?: boolean;
  topics?: readonly string[];
  license?: { name: string } | null;
}

const repoSlugFromUrl = (url?: string): string => {
  if (!url) return "";
  const parts = url.replace(/\/+$/, "").split("/");
  return (parts[parts.length - 1] ?? "").toLowerCase();
};

const humanTitle = (repoName: string): string =>
  repoName
    .replace(/^3omda-/i, "3OMDA ")
    .replace(/[-_]+/g, " ")
    .trim();

const inferWorkType = (repo: GithubRepoPayload): WorkType => {
  const hay = `${repo.name} ${repo.description ?? ""} ${(repo.topics ?? []).join(" ")}`.toLowerCase();
  if (/\b(platform|grc|compliance|framework|dashboard|saas)\b/.test(hay)) return "platform";
  if (/\b(malware|research|forensic|dfir|analysis|ransomware|reverse)\b/.test(hay)) return "research";
  if (/\b(lab|soc|siem|environment|simulation|honeypot|deception|ctf)\b/.test(hay)) return "lab";
  return "tool";
};

async function fetchPublicRepos(): Promise<readonly GithubRepoPayload[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?per_page=100&sort=updated`,
      {
        headers: { Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`);
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error("Unexpected GitHub API payload");
    return data as GithubRepoPayload[];
  } catch {
    return staticProjectFallback;
  }
}

export async function getSyncedWorkItems(): Promise<WorkItem[]> {
  const repos = await fetchPublicRepos();

  const bySlug = new Map<string, GithubRepoPayload>();
  for (const r of repos) {
    bySlug.set(r.name.toLowerCase(), r);
    const urlSlug = repoSlugFromUrl(r.html_url);
    if (urlSlug) bySlug.set(urlSlug, r);
  }

  const matchedSlugs = new Set<string>();

  /* 1. Enrich the curated work items with live GitHub stars & demo/live links */
  const curated: WorkItem[] = PORTFOLIO_DATA.work.map((item) => {
    const slug = repoSlugFromUrl(item.links.github);
    const repo = slug ? bySlug.get(slug) : bySlug.get(item.id.toLowerCase());
    if (!repo) return item;

    matchedSlugs.add(repo.name.toLowerCase());
    const urlSlug = repoSlugFromUrl(repo.html_url);
    if (urlSlug) matchedSlugs.add(urlSlug);

    const stars = Number(repo.stargazers_count ?? 0);
    let metrics = [...item.metrics];
    if (stars > 0) {
      const starLabel = `${stars} GitHub star${stars === 1 ? "" : "s"}`;
      const existingIdx = metrics.findIndex((m) => /github star/i.test(m));
      if (existingIdx >= 0) metrics[existingIdx] = starLabel;
      else metrics = [...metrics, starLabel];
    }

    const homepage = (repo.homepage ?? "").trim();
    const links = { ...item.links };
    if (homepage && !links.demo && !links.live) {
      if (/youtu\.?be/i.test(homepage)) links.demo = homepage;
      else links.live = homepage;
    }

    return { ...item, metrics, links };
  });

  /* Also mark static fallback aliases as matched if their URL matches any curated item */
  for (const fb of staticProjectFallback) {
    const fbUrlSlug = repoSlugFromUrl(fb.html_url);
    if (matchedSlugs.has(fb.name.toLowerCase()) || (fbUrlSlug && matchedSlugs.has(fbUrlSlug))) {
      matchedSlugs.add(fb.name.toLowerCase());
      if (fbUrlSlug) matchedSlugs.add(fbUrlSlug);
    }
  }

  /* 2. Discover any new public repositories not yet in PORTFOLIO_DATA.work */
  const ignoredNames = new Set([
    GITHUB_USERNAME.toLowerCase(),
    "portfolio",
  ]);

  const discovered: WorkItem[] = [];
  for (const repo of repos) {
    const nameKey = repo.name.toLowerCase();
    const urlSlug = repoSlugFromUrl(repo.html_url);
    if (matchedSlugs.has(nameKey) || (urlSlug && matchedSlugs.has(urlSlug))) continue;
    if (ignoredNames.has(nameKey) || (urlSlug && ignoredNames.has(urlSlug))) continue;
    if (repo.fork || repo.archived) continue;

    const desc = (repo.description ?? "").trim();
    if (!desc) continue;

    const bullets = projectBullets[repo.name] ?? [];
    const type = inferWorkType(repo);
    const topics = (repo.topics ?? []).map((t) => t.replace(/-/g, " "));
    const stack = Array.from(
      new Set([
        ...(repo.language ? [repo.language] : []),
        ...topics.slice(0, 5),
      ]),
    );

    const metrics: string[] = [];
    if (repo.stargazers_count > 0) {
      metrics.push(`${repo.stargazers_count} GitHub star${repo.stargazers_count === 1 ? "" : "s"}`);
    }
    if (repo.forks_count > 0) {
      metrics.push(`${repo.forks_count} fork${repo.forks_count === 1 ? "" : "s"}`);
    }
    if (repo.license?.name) {
      metrics.push(repo.license.name);
    }
    if (metrics.length === 0) {
      metrics.push("Open-source repo");
    }

    const homepage = (repo.homepage ?? "").trim();
    const links: WorkItem["links"] = { github: repo.html_url };
    if (homepage) {
      if (/youtu\.?be/i.test(homepage)) links.demo = homepage;
      else links.live = homepage;
    }

    discovered.push({
      id: nameKey,
      title: humanTitle(repo.name),
      type,
      tagline: desc,
      problem:
        bullets[0] ??
        "Built to automate repetitive security checks and validate defensive or offensive workflows in practice.",
      role:
        bullets[1] ??
        `Engineered and open-sourced on GitHub${repo.language ? ` using ${repo.language}` : ""}, complete with source code and documentation.`,
      stack: stack.length > 0 ? stack : ["Open Source", "Cybersecurity"],
      platform: repo.language ? `${repo.language} · GitHub` : "GitHub",
      status: "open-source",
      year: (repo.created_at || repo.updated_at || "2026").slice(0, 4),
      links,
      metrics,
    });
  }

  return [...curated, ...discovered];
}
